import { spawn, execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { HostAgentError } from './types.js';

export const STDERR_TAIL_BYTES = 8 * 1024;
export const DEFAULT_KILL_GRACE_MS = 5_000;

export interface HostProcessOptions {
  executable: string;
  args: string[];
  stdin: string;
  cwd: string;
  signal: AbortSignal;
  /** Called once per complete stdout line, in order. */
  onLine: (line: string) => void;
  killGraceMs?: number;
}

export interface HostProcessResult {
  exitCode: number | null;
  exitSignal: NodeJS.Signals | null;
  stderrTail: string;
  aborted: boolean;
}

/**
 * Finds the executable to launch: the configured path when given, otherwise the
 * first match for `name` on PATH. Returns null when nothing executable is found.
 */
export function resolveExecutable(name: string, configuredPath: string | null): string | null {
  const candidates = configuredPath
    ? [configuredPath]
    : (process.env.PATH ?? '').split(path.delimiter).filter(Boolean).map((dir) => path.join(dir, name));
  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      if (fs.statSync(candidate).isFile()) return fs.realpathSync(candidate);
    } catch {
      // not executable here; try the next candidate
    }
  }
  return null;
}

function launchError(error: NodeJS.ErrnoException, executable: string): HostAgentError {
  if (error.code === 'ENOENT') {
    return new HostAgentError('NOT_INSTALLED', `Host agent executable not found: ${executable}`);
  }
  return new HostAgentError('SPAWN_FAILED', `Could not start host agent ${executable}: ${error.message}`);
}

function appendTail(tail: string, chunk: string): string {
  const next = tail + chunk;
  return next.length > STDERR_TAIL_BYTES ? next.slice(next.length - STDERR_TAIL_BYTES) : next;
}

/**
 * Runs one host turn process: no shell, prompt on stdin, stdout read as lines.
 * Abort sends SIGTERM to the whole process group, then SIGKILL after the grace period.
 * The environment is passed through unchanged; A-Society never touches host credentials.
 */
export function runHostProcess(options: HostProcessOptions): Promise<HostProcessResult> {
  const { executable, args, stdin, cwd, signal, onLine } = options;
  const killGraceMs = options.killGraceMs ?? DEFAULT_KILL_GRACE_MS;

  if (signal.aborted) {
    return Promise.resolve({ exitCode: null, exitSignal: null, stderrTail: '', aborted: true });
  }

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd,
      shell: false,
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdoutBuffer = '';
    let stderrTail = '';
    let aborted = false;
    let settled = false;
    let killTimer: NodeJS.Timeout | null = null;

    const signalGroup = (sig: NodeJS.Signals): void => {
      if (child.pid === undefined) return;
      try {
        process.kill(-child.pid, sig);
      } catch {
        // the group already exited
      }
    };

    const onAbort = (): void => {
      aborted = true;
      signalGroup('SIGTERM');
      killTimer = setTimeout(() => signalGroup('SIGKILL'), killGraceMs);
      killTimer.unref();
    };

    const cleanup = (): void => {
      signal.removeEventListener('abort', onAbort);
      if (killTimer) clearTimeout(killTimer);
    };

    signal.addEventListener('abort', onAbort, { once: true });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdoutBuffer += chunk;
      let newline = stdoutBuffer.indexOf('\n');
      while (newline !== -1) {
        const line = stdoutBuffer.slice(0, newline).trim();
        stdoutBuffer = stdoutBuffer.slice(newline + 1);
        if (line) onLine(line);
        newline = stdoutBuffer.indexOf('\n');
      }
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      stderrTail = appendTail(stderrTail, chunk);
    });

    // The host may exit before reading all of stdin (e.g. a startup error); that is not our failure.
    child.stdin.on('error', () => undefined);
    child.stdin.end(stdin);

    child.on('error', (error: NodeJS.ErrnoException) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(launchError(error, executable));
    });

    child.on('close', (exitCode, exitSignal) => {
      if (settled) return;
      settled = true;
      cleanup();
      const rest = stdoutBuffer.trim();
      if (rest) onLine(rest);
      resolve({ exitCode, exitSignal, stderrTail, aborted });
    });
  });
}

export interface HostCommandResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

/** Runs a short, non-interactive host command such as `--version`. Launch failures throw `HostAgentError`. */
export function runHostCommand(executable: string, args: string[], timeoutMs = 15_000): Promise<HostCommandResult> {
  return new Promise((resolve, reject) => {
    execFile(executable, args, { timeout: timeoutMs, shell: false, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      const errno = error as (NodeJS.ErrnoException & { code?: string | number }) | null;
      if (errno && typeof errno.code === 'string' && errno.code !== 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
        reject(launchError(errno, executable));
        return;
      }
      const exitCode = errno ? (typeof errno.code === 'number' ? errno.code : null) : 0;
      resolve({ exitCode, stdout: String(stdout), stderr: String(stderr) });
    });
  });
}
