import path from 'node:path';
import { spawn } from 'node:child_process';
import { LLMGatewayError } from '../common/types.js';
import type { ToolDefinition, ToolCall } from '../common/types.js';

const TIMEOUT_MS = 60_000;
const MAX_OUTPUT_BYTES = 100_000;

// --- Environment sanitization ---

const CREDENTIAL_NAME_PATTERN = /_(?:API_)?(?:KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIALS?)$/i;
const MIN_REDACT_LENGTH = 8;

const KNOWN_KEY_PATTERNS: RegExp[] = [
  /sk-ant-api\d+-[A-Za-z0-9_-]{20,}/g,
  /sk-[A-Za-z0-9]{40,}/g,
  /tvly-[A-Za-z0-9]{20,}/g,
];

function sanitizeEnv(env: NodeJS.ProcessEnv): { cleanEnv: NodeJS.ProcessEnv; strippedValues: Set<string> } {
  const cleanEnv: NodeJS.ProcessEnv = {};
  const strippedValues = new Set<string>();
  for (const [key, value] of Object.entries(env)) {
    if (CREDENTIAL_NAME_PATTERN.test(key)) {
      if (value && value.length >= MIN_REDACT_LENGTH) strippedValues.add(value);
    } else {
      cleanEnv[key] = value;
    }
  }
  return { cleanEnv, strippedValues };
}

function redactCredentials(output: string, strippedValues: Set<string>): string {
  let result = output;
  for (const value of strippedValues) {
    result = result.replaceAll(value, '[REDACTED]');
  }
  for (const pattern of KNOWN_KEY_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

// --- Denylist ---

const DENYLIST: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /:\(\)\s*\{\s*:\s*\|/, label: 'fork bomb pattern' },
  { pattern: /\bmkfs\b/, label: 'filesystem formatting' },
  { pattern: /\bdd\b[^|;&\n]*\bof=\/dev\//, label: 'writing directly to a block device' },
  { pattern: /\brm\s+[^;|&\n]*-[a-zA-Z]*[rR][a-zA-Z]*[^;|&\n]*\s\/(?:\s|$)/, label: 'recursive deletion of filesystem root' },
  { pattern: /\brm\s+[^;|&\n]*--recursive[^;|&\n]*\s\/(?:\s|$)/, label: 'recursive deletion of filesystem root' },
];

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

  validate(call: ToolCall): { content: string; isError: boolean } | null {
    if (call.name !== 'run_command') return null;
    const command = call.input.command as string;
    if (!command || typeof command !== 'string') return null;
    for (const { pattern, label } of DENYLIST) {
      if (pattern.test(command)) {
        return { content: `Error: command blocked — matches safety rule: ${label}.`, isError: true };
      }
    }
    return null;
  }

  async execute(call: ToolCall, signal?: AbortSignal): Promise<{ content: string; isError: boolean }> {
    if (call.name !== 'run_command') {
      return { content: `Error: unknown tool '${call.name}'`, isError: true };
    }
    const command = call.input.command as string;
    if (!command || typeof command !== 'string') {
      return { content: `Error: 'command' is required and must be a string.`, isError: true };
    }
    const denyResult = this.validate(call);
    if (denyResult) return denyResult;
    return this.runCommand(command, signal);
  }

  private runCommand(command: string, signal?: AbortSignal): Promise<{ content: string; isError: boolean }> {
    const { cleanEnv, strippedValues } = sanitizeEnv(process.env);
    return new Promise((resolve, reject) => {
      const child = spawn('bash', ['-c', command], {
        cwd: this.workspaceRoot,
        env: cleanEnv,
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

      let settled = false;

      const finalizeResolve = (value: { content: string; isError: boolean }) => {
        if (settled) return;
        settled = true;
        signal?.removeEventListener('abort', abortHandler);
        resolve(value);
      };

      const finalizeReject = (error: Error) => {
        if (settled) return;
        settled = true;
        signal?.removeEventListener('abort', abortHandler);
        reject(error);
      };

      const abortHandler = () => {
        child.kill('SIGTERM');
        finalizeReject(new LLMGatewayError('ABORTED', 'Tool execution aborted by operator'));
      };

      if (signal?.aborted) {
        abortHandler();
        return;
      }

      signal?.addEventListener('abort', abortHandler, { once: true });

      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        finalizeResolve({ content: `Error: command timed out after ${TIMEOUT_MS / 1000}s.`, isError: true });
      }, TIMEOUT_MS);

      child.on('close', (code) => {
        clearTimeout(timer);
        if (settled) return;
        const stdout = redactCredentials(Buffer.concat(stdoutChunks).toString('utf8'), strippedValues);
        const stderr = redactCredentials(Buffer.concat(stderrChunks).toString('utf8'), strippedValues);

        const parts: string[] = [];
        if (stdout) parts.push(`stdout:\n${stdout}`);
        if (stderr) parts.push(`stderr:\n${stderr}`);
        if (truncated) parts.push(`[output truncated at ${MAX_OUTPUT_BYTES} bytes]`);
        if (!stdout && !stderr) parts.push('(no output)');

        const output = parts.join('\n');
        const isError = code !== 0;
        const header = isError ? `exit code ${code}\n` : '';
        finalizeResolve({ content: header + output, isError });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        finalizeResolve({ content: `Error: failed to spawn command: ${err.message}`, isError: true });
      });
    });
  }
}
