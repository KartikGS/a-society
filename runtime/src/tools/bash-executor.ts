import path from 'node:path';
import { spawn } from 'node:child_process';
import type { ToolDefinition, ToolCall } from '../types.js';

const TIMEOUT_MS = 60_000;
const MAX_OUTPUT_BYTES = 100_000;

export const BASH_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'run_command',
    description: 'Run a shell command in the workspace root directory. Captures stdout and stderr. Times out after 60 seconds. Use for commands like npm install, npm run build, git status, node scripts, etc. The working directory is always the workspace root — relative paths in commands resolve from there.',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to execute.'
        }
      },
      required: ['command']
    }
  }
];

export class BashToolExecutor {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = path.resolve(workspaceRoot);
  }

  canHandle(name: string): boolean {
    return name === 'run_command';
  }

  async execute(call: ToolCall): Promise<{ content: string; isError: boolean }> {
    if (call.name !== 'run_command') {
      return { content: `Error: unknown tool '${call.name}'`, isError: true };
    }
    const command = call.input.command as string;
    if (!command || typeof command !== 'string') {
      return { content: `Error: 'command' is required and must be a string.`, isError: true };
    }
    return this.runCommand(command);
  }

  private runCommand(command: string): Promise<{ content: string; isError: boolean }> {
    return new Promise((resolve) => {
      const child = spawn('bash', ['-c', command], {
        cwd: this.workspaceRoot,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];
      let totalBytes = 0;
      let truncated = false;

      const collect = (chunks: Buffer[]) => (chunk: Buffer) => {
        if (truncated) return;
        const remaining = MAX_OUTPUT_BYTES - totalBytes;
        if (chunk.length >= remaining) {
          chunks.push(chunk.subarray(0, remaining));
          totalBytes += remaining;
          truncated = true;
        } else {
          chunks.push(chunk);
          totalBytes += chunk.length;
        }
      };

      child.stdout.on('data', collect(stdoutChunks));
      child.stderr.on('data', collect(stderrChunks));

      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({ content: `Error: command timed out after ${TIMEOUT_MS / 1000}s.`, isError: true });
      }, TIMEOUT_MS);

      child.on('close', (code) => {
        clearTimeout(timer);
        const stdout = Buffer.concat(stdoutChunks).toString('utf8');
        const stderr = Buffer.concat(stderrChunks).toString('utf8');

        const parts: string[] = [];
        if (stdout) parts.push(`stdout:\n${stdout}`);
        if (stderr) parts.push(`stderr:\n${stderr}`);
        if (truncated) parts.push(`[output truncated at ${MAX_OUTPUT_BYTES} bytes]`);
        if (!stdout && !stderr) parts.push('(no output)');

        const output = parts.join('\n');
        const isError = code !== 0;
        const header = isError ? `exit code ${code}\n` : '';
        resolve({ content: header + output, isError });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({ content: `Error: failed to spawn command: ${err.message}`, isError: true });
      });
    });
  }
}
