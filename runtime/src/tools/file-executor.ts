import path from 'node:path';
import fs from 'node:fs';
import type { FlowRef, ToolDefinition, ToolCall } from '../common/types.js';
import { getFlowRecordDir } from '../orchestration/state-paths.js';
import { getWorkspaceRoot } from '../common/workspace.js';
import { validateWorkflowFileContent, workflowFilePaths } from './workflow-write-validation.js';
import { readFileBase, type FileChange } from './file-change.js';

export type FileCallPreparation =
  | { kind: 'rejected'; content: string }
  | { kind: 'ready'; change: FileChange | null };

export function staleWriteMessage(reqPath: string): string {
  return `Error: ${reqPath} changed after this write was prepared for approval, so the write was not applied. Read the file again and retry the change.`;
}

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

export interface FileToolExecutorOptions {
  /** Additional write roots (absolute). Granted only to the feedback session. */
  extraWriteRoots?: string[];
}

export class FileToolExecutor {
  private readonly workspaceRoot: string;
  private readonly flowRef: FlowRef;
  private readonly writeRoots: string[];
  private readonly extraWriteRoots: string[];
  private readonly workflowFilePaths: Set<string>;

  constructor(flowRef: FlowRef, options: FileToolExecutorOptions = {}) {
    this.workspaceRoot = path.resolve(getWorkspaceRoot());
    this.flowRef = flowRef;
    const recordFolderPath = getFlowRecordDir(flowRef);
    this.extraWriteRoots = (options.extraWriteRoots ?? []).map(r => path.resolve(r));
    this.writeRoots = [
      path.join(this.workspaceRoot, flowRef.projectNamespace),
      recordFolderPath,
      ...this.extraWriteRoots,
    ].map(r => path.resolve(r));
    const workflowPaths = workflowFilePaths(flowRef);
    this.workflowFilePaths = new Set([workflowPaths.recordWorkflowPath, workflowPaths.canonicalWorkflowPath]);
  }

  private writeAreaRejection(reqPath: string): string {
    if (this.extraWriteRoots.length === 0) {
      return `Error: path '${reqPath}' is outside the permitted write area — writes are restricted to the project directory and the active record folder.`;
    }
    const list = this.extraWriteRoots
      .map(root => path.relative(this.workspaceRoot, root).split(path.sep).join('/'))
      .join(', ');
    return `Error: path '${reqPath}' is outside the permitted write area — writes are restricted to the project directory, the active record folder, and ${list}.`;
  }

  canHandle(name: string): boolean {
    return FILE_TOOL_NAMES.has(name);
  }

  /**
   * Runs the pre-consent checks and computes the change a write would make, reading the
   * file once. Null where the executor does not check the call (unknown tool, no path).
   */
  prepare(call: ToolCall): FileCallPreparation | null {
    if (!this.canHandle(call.name)) return null;

    const reqPath = call.input?.path as string | undefined;
    if (!reqPath || typeof reqPath !== 'string') return null;

    const resolved = path.resolve(this.workspaceRoot, reqPath);
    const inWorkspace = resolved === this.workspaceRoot || resolved.startsWith(this.workspaceRoot + path.sep);
    if (!inWorkspace) {
      return { kind: 'rejected', content: `Error: path '${reqPath}' is outside the workspace root and cannot be accessed.` };
    }

    if (!WRITE_TOOLS.has(call.name)) return { kind: 'ready', change: null };

    const allowed = this.writeRoots.some(root => resolved === root || resolved.startsWith(root + path.sep));
    if (!allowed) {
      return { kind: 'rejected', content: this.writeAreaRejection(reqPath) };
    }

    // Pre-compute the resulting file content before consent is requested so that
    // doomed writes are rejected immediately rather than after operator approval.
    // execute() binds the write to the base read here, so the operator gets exactly
    // the change prepared for approval.
    let change: FileChange | null = null;
    if (call.name === 'write_file') {
      const content = call.input?.content;
      if (typeof content !== 'string') return { kind: 'ready', change: null };
      const base = readFileBase(resolved);
      if (base.kind === 'unreadable') {
        // No preview and no binding; execute() reports its own write error as before.
        return this.workflowRejection(resolved, content) ?? { kind: 'ready', change: null };
      }
      change = {
        path: reqPath,
        absolutePath: resolved,
        baseBytes: base.kind === 'present' ? base.bytes : null,
        baseHash: base.kind === 'present' ? base.hash : null,
        after: content,
      };
    } else {
      const oldString = call.input?.old_string;
      const newString = call.input?.new_string;
      if (typeof oldString !== 'string' || typeof newString !== 'string') return { kind: 'ready', change: null };
      const base = readFileBase(resolved);
      if (base.kind === 'absent') return { kind: 'rejected', content: `Error: no such file: ${resolved}` };
      if (base.kind === 'unreadable') throw base.error;
      const original = base.bytes.toString('utf8');
      const firstIdx = original.indexOf(oldString);
      if (firstIdx === -1) {
        return { kind: 'rejected', content: `Error: old_string not found in file. Read the relevant section again to get the current content before retrying.` };
      }
      const secondIdx = original.indexOf(oldString, firstIdx + 1);
      if (secondIdx !== -1) {
        return { kind: 'rejected', content: `Error: old_string appears more than once in the file — read the relevant section again and include more surrounding context to make it unique.` };
      }
      change = {
        path: reqPath,
        absolutePath: resolved,
        baseBytes: base.bytes,
        baseHash: base.hash,
        after: original.slice(0, firstIdx) + newString + original.slice(firstIdx + oldString.length),
      };
    }

    // Workflow graph validation only applies to the workflow file. It is not
    // repeated in execute() because it checks content correctness, not staleness.
    return this.workflowRejection(resolved, change.after) ?? { kind: 'ready', change };
  }

  private workflowRejection(resolved: string, newContent: string): FileCallPreparation | null {
    if (!this.workflowFilePaths.has(resolved)) return null;
    const errors = validateWorkflowFileContent(newContent, resolved, this.flowRef);
    if (errors.length === 0) return null;
    return { kind: 'rejected', content: `Error: workflow validation failed — this write would produce an invalid workflow.yaml:\n${errors.join('\n')}\nFix the errors before retrying.` };
  }

  validate(call: ToolCall): { content: string; isError: boolean } | null {
    const preparation = this.prepare(call);
    return preparation?.kind === 'rejected' ? { content: preparation.content, isError: true } : null;
  }

  /**
   * With a binding, a write applies only while the file still has the base hash it was
   * prepared against (null: still absent); otherwise it returns staleWriteMessage unapplied.
   */
  async execute(
    call: ToolCall,
    _signal?: AbortSignal,
    binding?: { expectedBaseHash: string | null }
  ): Promise<{ content: string; isError: boolean }> {
    const pathError = this.validate(call);
    if (pathError) return pathError;

    const reqPath = call.input?.path as string | undefined;
    const resolved = reqPath ? path.resolve(this.workspaceRoot, reqPath) : undefined;

    if (binding && resolved && WRITE_TOOLS.has(call.name)) {
      const base = readFileBase(resolved);
      const current = base.kind === 'present' ? base.hash : base.kind === 'absent' ? null : undefined;
      if (current !== binding.expectedBaseHash) {
        return { content: staleWriteMessage(reqPath!), isError: true };
      }
      // No await may separate this check from the synchronous write in editFile/writeFile.
    }

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
