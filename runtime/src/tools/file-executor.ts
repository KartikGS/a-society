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
