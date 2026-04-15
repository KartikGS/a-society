import path from 'node:path';
import fs from 'node:fs';
import type { ToolDefinition, ToolCall } from '../types.js';

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

export class FileToolExecutor {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = path.resolve(workspaceRoot);
  }

  async execute(call: ToolCall): Promise<{ content: string; isError: boolean }> {
    try {
      if (call.name === 'read_file') {
        const reqPath = call.input.path as string;
        return await this.readFile(this.sandboxPath(reqPath));
      } else if (call.name === 'read_file_lines') {
        const reqPath = call.input.path as string;
        const startLine = call.input.start_line as number;
        const endLine = call.input.end_line as number;
        return await this.readFileLines(this.sandboxPath(reqPath), startLine, endLine);
      } else if (call.name === 'edit_file') {
        const reqPath = call.input.path as string;
        const oldString = call.input.old_string as string;
        const newString = call.input.new_string as string;
        return await this.editFile(this.sandboxPath(reqPath), oldString, newString);
      } else if (call.name === 'write_file') {
        const reqPath = call.input.path as string;
        const content = call.input.content as string;
        return await this.writeFile(this.sandboxPath(reqPath), content);
      } else if (call.name === 'list_directory') {
        const reqPath = call.input.path as string;
        return await this.listDirectory(this.sandboxPath(reqPath));
      }
      return { content: `Error: unknown tool '${call.name}'`, isError: true };
    } catch (err: any) {
      if (err.name === 'SandboxViolationError') {
        return { content: `Error: path '${call.input.path}' is outside the workspace root and cannot be accessed.`, isError: true };
      }
      return { content: `Error: could not execute tool: ${err.message}`, isError: true };
    }
  }

  private sandboxPath(requestedPath: string): string {
    const resolved = path.resolve(this.workspaceRoot, requestedPath || '');
    if (resolved === this.workspaceRoot || resolved.startsWith(this.workspaceRoot + path.sep)) {
      return resolved;
    }
    const err = new Error('Sandbox violation');
    err.name = 'SandboxViolationError';
    throw err;
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
        return { content: `Error: old_string not found in file.`, isError: true };
      }
      const secondIdx = original.indexOf(oldString, firstIdx + 1);
      if (secondIdx !== -1) {
        return { content: `Error: old_string appears more than once in the file — provide more context to make it unique.`, isError: true };
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
