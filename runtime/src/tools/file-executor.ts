import path from 'node:path';
import fs from 'node:fs';
import yaml from 'js-yaml';
import type { FlowRef, FlowRun, ToolDefinition, ToolCall } from '../common/types.js';
import { validateGraph } from '../framework-services/workflow-graph-validator.js';
import { SessionStore } from '../orchestration/store.js';
import { getFlowRecordDir } from '../orchestration/state-paths.js';
import { CANONICAL_WORKFLOW_FILENAME, canonicalWorkflowDefinitionPath } from '../context/workflow-file.js';

export const FILE_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'read_file',
    description: 'Read the contents of a file at the given path, relative to the workspace root. Returns the raw file content as a string.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file, relative to the workspace root. Must not traverse outside the workspace root.'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'read_file_lines',
    description: 'Read a specific range of lines from a file, relative to the workspace root. Returns the lines with 1-based line numbers prefixed (e.g. "42\\t<line content>"). Use this instead of read_file when you only need a section of a large file.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file, relative to the workspace root. Must not traverse outside the workspace root.'
        },
        start_line: {
          type: 'number',
          description: 'The 1-based line number to start reading from (inclusive).'
        },
        end_line: {
          type: 'number',
          description: 'The 1-based line number to stop reading at (inclusive).'
        }
      },
      required: ['path', 'start_line', 'end_line']
    }
  },
  {
    name: 'edit_file',
    description: 'Replace an exact string within a file. Reads the file, finds old_string, and replaces it with new_string. Fails if old_string is not found or appears more than once (to prevent ambiguous edits). Prefer this over write_file for targeted changes.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file, relative to the workspace root. Must not traverse outside the workspace root.'
        },
        old_string: {
          type: 'string',
          description: 'The exact string to find in the file. Must appear exactly once.'
        },
        new_string: {
          type: 'string',
          description: 'The string to replace old_string with.'
        }
      },
      required: ['path', 'old_string', 'new_string']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file at the given path, relative to the workspace root. Creates the file and any intermediate directories if they do not exist. Overwrites the file if it already exists.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file, relative to the workspace root. Must not traverse outside the workspace root.'
        },
        content: {
          type: 'string',
          description: 'The content to write to the file.'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'list_directory',
    description: 'List the contents of a directory at the given path, relative to the workspace root. Returns a JSON array of entry names. Directory names are suffixed with "/". Entries are sorted lexicographically.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the directory, relative to the workspace root. Must not traverse outside the workspace root.'
        }
      },
      required: ['path']
    }
  }
];

const WRITE_TOOLS = new Set(['edit_file', 'write_file']);
const FILE_TOOL_NAMES = new Set(FILE_TOOL_DEFINITIONS.map((definition) => definition.name));

export class FileToolExecutor {
  private readonly workspaceRoot: string;
  private readonly flowRef: FlowRef;
  private readonly writeRoots: string[];
  private readonly workflowFilePaths: Set<string>;
  private readonly recordWorkflowPath: string;

  constructor(workspaceRoot: string, flowRef: FlowRef) {
    this.workspaceRoot = path.resolve(workspaceRoot);
    this.flowRef = flowRef;
    const recordFolderPath = getFlowRecordDir(this.workspaceRoot, flowRef);
    this.recordWorkflowPath = path.resolve(recordFolderPath, CANONICAL_WORKFLOW_FILENAME);
    this.writeRoots = [
      path.join(this.workspaceRoot, flowRef.projectNamespace),
      path.join(this.workspaceRoot, 'a-society', 'feedback'),
      recordFolderPath,
    ].map(r => path.resolve(r));
    this.workflowFilePaths = new Set([
      this.recordWorkflowPath,
      canonicalWorkflowDefinitionPath(this.workspaceRoot, flowRef.projectNamespace),
    ].map(p => path.resolve(p)));
  }

  canHandle(name: string): boolean {
    return FILE_TOOL_NAMES.has(name);
  }

  private validateWorkflowContent(content: string, resolvedPath: string): string[] {
    let doc: unknown;
    try {
      doc = yaml.load(content);
    } catch (err) {
      return [`YAML parse error: ${(err as Error).message}`];
    }
    let flowState: FlowRun | null = null;
    if (this.recordWorkflowPath === resolvedPath) {
      try {
        flowState = SessionStore.loadFlowRun(this.flowRef, this.workspaceRoot);
      } catch (err) {
        return [`Cannot load latest flow state for workflow validation: ${(err as Error).message}`];
      }
      if (!flowState) {
        return ['Cannot load latest flow state for workflow validation: flow state was not found'];
      }
    }
    return validateGraph(doc, undefined, flowState);
  }

  validate(call: ToolCall): { content: string; isError: boolean } | null {
    if (!this.canHandle(call.name)) return null;

    const reqPath = call.input?.path as string | undefined;
    if (!reqPath || typeof reqPath !== 'string') return null;

    const resolved = path.resolve(this.workspaceRoot, reqPath);
    const inWorkspace = resolved === this.workspaceRoot || resolved.startsWith(this.workspaceRoot + path.sep);
    if (!inWorkspace) {
      return { content: `Error: path '${reqPath}' is outside the workspace root and cannot be accessed.`, isError: true };
    }

    if (WRITE_TOOLS.has(call.name)) {
      const allowed = this.writeRoots.some(root => resolved === root || resolved.startsWith(root + path.sep));
      if (!allowed) {
        return { content: `Error: path '${reqPath}' is outside the permitted write area — writes are restricted to the project directory, the active record folder, and A-Society feedback.`, isError: true };
      }

      // Pre-compute the resulting file content before consent is requested so that
      // doomed writes are rejected immediately rather than after operator approval.
      // edit_file old_string errors are also checked here and in execute() as a
      // TOCTOU safety net — another agent may modify the file between validate and execute.
      let newContent: string | null = null;
      if (call.name === 'write_file') {
        newContent = call.input?.content as string ?? null;
      } else if (call.name === 'edit_file') {
        const oldString = call.input?.old_string as string | undefined;
        const newString = call.input?.new_string as string | undefined;
        if (oldString !== undefined && newString !== undefined) {
          try {
            const original = fs.readFileSync(resolved, 'utf8');
            const firstIdx = original.indexOf(oldString);
            if (firstIdx === -1) {
              return { content: `Error: old_string not found in file. Read the relevant section again to get the current content before retrying.`, isError: true };
            }
            const secondIdx = original.indexOf(oldString, firstIdx + 1);
            if (secondIdx !== -1) {
              return { content: `Error: old_string appears more than once in the file — read the relevant section again and include more surrounding context to make it unique.`, isError: true };
            }
            newContent = original.slice(0, firstIdx) + newString + original.slice(firstIdx + oldString.length);
          } catch (err: any) {
            if (err.code === 'ENOENT') {
              return { content: `Error: no such file: ${resolved}`, isError: true };
            }
            throw err;
          }
        }
      }
      // Workflow graph validation only applies to the workflow file. It is not
      // repeated in execute() because it checks content correctness, not staleness.
      if (newContent !== null && this.workflowFilePaths.has(resolved)) {
        const errors = this.validateWorkflowContent(newContent, resolved);
        if (errors.length > 0) {
          return { content: `Error: workflow validation failed — this write would produce an invalid workflow.yaml:\n${errors.join('\n')}\nFix the errors before retrying.`, isError: true };
        }
      }
    }

    return null;
  }

  async execute(call: ToolCall, _signal?: AbortSignal): Promise<{ content: string; isError: boolean }> {
    const pathError = this.validate(call);
    if (pathError) return pathError;

    const reqPath = call.input?.path as string | undefined;
    const resolved = reqPath ? path.resolve(this.workspaceRoot, reqPath) : undefined;

    try {
      if (call.name === 'read_file') {
        return await this.readFile(resolved!);
      } else if (call.name === 'read_file_lines') {
        return await this.readFileLines(resolved!, call.input.start_line as number, call.input.end_line as number);
      } else if (call.name === 'edit_file') {
        return await this.editFile(resolved!, call.input.old_string as string, call.input.new_string as string);
      } else if (call.name === 'write_file') {
        return await this.writeFile(resolved!, call.input.content as string);
      } else if (call.name === 'list_directory') {
        return await this.listDirectory(resolved!);
      }
      return { content: `Error: unknown tool '${call.name}'`, isError: true };
    } catch (err: any) {
      return { content: `Error: could not execute tool: ${err.message}`, isError: true };
    }
  }

  private async readFile(resolvedPath: string): Promise<{ content: string; isError: boolean }> {
    try {
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        return { content: `Error: '${resolvedPath}' is a directory, not a file. Use list_directory to inspect directories.`, isError: true };
      }
      const content = fs.readFileSync(resolvedPath, 'utf8');
      return { content, isError: false };
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return { content: `Error: no such file: ${resolvedPath}`, isError: true };
      }
      return { content: `Error: could not read file: ${err.message}`, isError: true };
    }
  }

  private async readFileLines(resolvedPath: string, startLine: number, endLine: number): Promise<{ content: string; isError: boolean }> {
    if (!Number.isInteger(startLine) || !Number.isInteger(endLine) || startLine < 1 || endLine < startLine) {
      return { content: `Error: start_line must be >= 1 and end_line must be >= start_line.`, isError: true };
    }
    try {
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        return { content: `Error: '${resolvedPath}' is a directory, not a file.`, isError: true };
      }
      const raw = fs.readFileSync(resolvedPath, 'utf8');
      const lines = raw.split('\n');
      const clampedEnd = Math.min(endLine, lines.length);
      const slice = lines.slice(startLine - 1, clampedEnd);
      const numbered = slice.map((line: string, i: number) => `${startLine + i}\t${line}`).join('\n');
      return { content: numbered, isError: false };
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return { content: `Error: no such file: ${resolvedPath}`, isError: true };
      }
      return { content: `Error: could not read file: ${err.message}`, isError: true };
    }
  }

  private async editFile(resolvedPath: string, oldString: string, newString: string): Promise<{ content: string; isError: boolean }> {
    try {
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        return { content: `Error: '${resolvedPath}' is a directory, not a file.`, isError: true };
      }
      const original = fs.readFileSync(resolvedPath, 'utf8');
      const firstIdx = original.indexOf(oldString);
      if (firstIdx === -1) {
        return { content: `Error: old_string not found in file. Read the relevant section again to get the current content before retrying.`, isError: true };
      }
      const secondIdx = original.indexOf(oldString, firstIdx + 1);
      if (secondIdx !== -1) {
        return { content: `Error: old_string appears more than once in the file — read the relevant section again and include more surrounding context to make it unique.`, isError: true };
      }
      const updated = original.slice(0, firstIdx) + newString + original.slice(firstIdx + oldString.length);
      fs.writeFileSync(resolvedPath, updated, 'utf8');
      return { content: `OK: edit applied to ${resolvedPath}`, isError: false };
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return { content: `Error: no such file: ${resolvedPath}`, isError: true };
      }
      return { content: `Error: could not edit file: ${err.message}`, isError: true };
    }
  }

  private async writeFile(resolvedPath: string, content: string): Promise<{ content: string; isError: boolean }> {
    try {
      fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
      fs.writeFileSync(resolvedPath, content, 'utf8');
      const byteCount = Buffer.byteLength(content, 'utf8');
      return { content: `OK: wrote ${byteCount} bytes to ${resolvedPath}`, isError: false };
    } catch (err: any) {
      return { content: `Error: could not write file: ${err.message}`, isError: true };
    }
  }

  private async listDirectory(resolvedPath: string): Promise<{ content: string; isError: boolean }> {
    try {
      const stat = fs.statSync(resolvedPath);
      if (!stat.isDirectory()) {
        return { content: `Error: '${resolvedPath}' is not a directory.`, isError: true };
      }
      const dirEntries = fs.readdirSync(resolvedPath, { withFileTypes: true });
      const entries = dirEntries.map(e => e.isDirectory() ? `${e.name}/` : e.name).sort();
      return { content: JSON.stringify(entries), isError: false };
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return { content: `Error: no such directory: ${resolvedPath}`, isError: true };
      }
      return { content: `Error: could not list directory: ${err.message}`, isError: true };
    }
  }
}
