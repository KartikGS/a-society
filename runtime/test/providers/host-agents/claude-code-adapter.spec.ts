import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LLMGatewayError } from '../../../src/common/types.js';
import { ClaudeCodeAdapter } from '../../../src/providers/host-agents/claude-code/adapter.js';
import { runHostProcess } from '../../../src/providers/host-agents/process-runner.js';
import { assertHostReady, getHostAgent } from '../../../src/providers/host-agents/registry.js';
import { HostAgentError } from '../../../src/providers/host-agents/types.js';
import type { HostLiveEvent, HostTurnRequest } from '../../../src/providers/host-agents/types.js';
import { clearProbeCache, getCachedProbe } from '../../../src/providers/host-agents/version.js';

const FAKE_CLAUDE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fake-claude.mjs');
const CONVERSATION_ID = '22222222-2222-4222-8222-222222222222';

let tmp: string;
let stateDir: string;
const savedEnv = { ...process.env };

function writeScript(turns: unknown[]): void {
  const file = path.join(tmp, 'script.json');
  fs.writeFileSync(file, JSON.stringify({ turns }));
  process.env.FAKE_CLAUDE_SCRIPT = file;
}

function invocations(): Array<{ args: string[]; stdin: string; cwd: string }> {
  return fs.readFileSync(path.join(stateDir, 'invocations.jsonl'), 'utf8')
    .split('\n').filter(Boolean).map((line) => JSON.parse(line));
}

function request(overrides: Partial<HostTurnRequest> = {}): HostTurnRequest {
  return {
    conversationId: CONVERSATION_ID,
    resume: false,
    systemPromptFile: null,
    message: 'Begin.',
    cwd: tmp,
    extraWritableDirs: [],
    permissions: { mode: 'read-only', allowedWritePaths: [], allowedCommands: [], allowedMcpTools: [], readOnlyRoots: [] },
    model: null,
    ...overrides,
  };
}

async function captureError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('expected a rejection');
}

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'host-agent-'));
  stateDir = path.join(tmp, 'state');
  process.env.FAKE_CLAUDE_STATE = stateDir;
  delete process.env.FAKE_CLAUDE_SCRIPT;
  delete process.env.FAKE_CLAUDE_VERSION;
  delete process.env.FAKE_CLAUDE_LOGGED_IN;
  clearProbeCache();
});

afterEach(() => {
  process.env = { ...savedEnv };
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('ClaudeCodeAdapter against the fake CLI', () => {
  const adapter = new ClaudeCodeAdapter();

  it('is registered under its id', () => {
    expect(getHostAgent('claude-code').id).toBe('claude-code');
    expect(() => getHostAgent('codex')).toThrow(HostAgentError);
  });

  it('runs a turn with the message on stdin and streams live events', async () => {
    writeScript([{ reply: 'first reply', toolUses: [{ name: 'Write', input: { file_path: '/p/a.md' } }] }]);
    const events: HostLiveEvent[] = [];
    const result = await adapter.runTurn(request({ message: 'hello host' }), (e) => events.push(e), new AbortController().signal, FAKE_CLAUDE);

    expect(result).toMatchObject({ kind: 'completed', text: 'first reply', conversationId: CONVERSATION_ID, contextUsage: 1012 });
    expect(events).toEqual([
      { kind: 'tool_call', toolName: 'Write', path: '/p/a.md' },
      { kind: 'tool_result', toolName: 'Write', isError: false },
      { kind: 'text', text: 'first reply' },
      { kind: 'rate_limit', fiveHour: 0.1, sevenDay: 0.05 },
    ]);
    const [call] = invocations();
    expect(call.stdin).toBe('hello host');
    expect(call.args).not.toContain('hello host');
    expect(fs.realpathSync(call.cwd)).toBe(fs.realpathSync(tmp));
  });

  it('resumes the same conversation by id', async () => {
    writeScript([{ reply: 'one' }, { reply: 'two' }]);
    const signal = new AbortController().signal;
    await adapter.runTurn(request(), () => undefined, signal, FAKE_CLAUDE);
    const second = await adapter.runTurn(request({ resume: true, message: 'next' }), () => undefined, signal, FAKE_CLAUDE);

    expect(second).toMatchObject({ kind: 'completed', text: 'two', conversationId: CONVERSATION_ID });
    const history = JSON.parse(fs.readFileSync(path.join(stateDir, `${CONVERSATION_ID}.json`), 'utf8'));
    expect(history.map((m: { content: string }) => m.content)).toEqual(['Begin.', 'one', 'next', 'two']);
    expect(invocations()[1].args).toContain('--resume');
  });

  it('returns conversation-missing for an unknown resume id', async () => {
    const result = await adapter.runTurn(request({ resume: true }), () => undefined, new AbortController().signal, FAKE_CLAUDE);
    expect(result).toEqual({ kind: 'conversation-missing' });
  });

  it('returns permission denials from a completed turn', async () => {
    writeScript([{ reply: 'blocked', denials: [{ tool_name: 'Bash', tool_input: { command: 'npm test' } }] }]);
    const result = await adapter.runTurn(request(), () => undefined, new AbortController().signal, FAKE_CLAUDE);
    expect(result).toMatchObject({ kind: 'completed', permissionDenials: [{ toolName: 'Bash', input: { command: 'npm test' } }] });
  });

  it('throws AUTH_ERROR when the host is logged out', async () => {
    process.env.FAKE_CLAUDE_LOGGED_IN = '0';
    const error = await captureError(adapter.runTurn(request(), () => undefined, new AbortController().signal, FAKE_CLAUDE));
    expect(error).toBeInstanceOf(LLMGatewayError);
    expect((error as LLMGatewayError).type).toBe('AUTH_ERROR');
  });

  it('throws RATE_LIMIT with the reset time', async () => {
    writeScript([{ rateLimited: true }]);
    const error = await captureError(adapter.runTurn(request(), () => undefined, new AbortController().signal, FAKE_CLAUDE));
    expect((error as LLMGatewayError).type).toBe('RATE_LIMIT');
    expect((error as LLMGatewayError).message).toContain('2027-01-15T08:00:00.000Z');
  });

  it('throws NOT_INSTALLED for a missing executable', async () => {
    const error = await captureError(adapter.runTurn(request(), () => undefined, new AbortController().signal, path.join(tmp, 'nope')));
    expect((error as HostAgentError).type).toBe('NOT_INSTALLED');
  });

  it('stops a running turn on abort and throws ABORTED', async () => {
    writeScript([{ hang: true }]);
    const controller = new AbortController();
    const started = Date.now();
    setTimeout(() => controller.abort(), 300);
    const error = await captureError(adapter.runTurn(request(), () => undefined, controller.signal, FAKE_CLAUDE));
    expect((error as LLMGatewayError).type).toBe('ABORTED');
    expect(Date.now() - started).toBeLessThan(4_000);
  });
});

describe('host readiness probe', () => {
  const adapter = new ClaudeCodeAdapter();

  it('reports version, support and only the allowed auth fields', async () => {
    const probe = await adapter.probe(FAKE_CLAUDE);
    expect(probe).toEqual({
      installed: true,
      executablePath: fs.realpathSync(FAKE_CLAUDE),
      version: '2.1.309',
      versionSupported: true,
      loggedIn: true,
      authMethod: 'claude.ai',
      subscriptionType: 'pro',
    });
    expect(JSON.stringify(probe)).not.toContain('example.com');
  });

  it('reports a missing executable without throwing', async () => {
    const probe = await adapter.probe(path.join(tmp, 'missing-claude'));
    expect(probe).toMatchObject({ installed: false, versionSupported: false });
  });

  it('refuses an out-of-range version before any turn', async () => {
    process.env.FAKE_CLAUDE_VERSION = '2.2.0';
    const error = await captureError(assertHostReady(adapter, FAKE_CLAUDE));
    expect((error as HostAgentError).type).toBe('UNSUPPORTED_VERSION');
  });

  it('caches by binary and re-probes when the binary changes', async () => {
    const copy = path.join(tmp, 'claude');
    fs.copyFileSync(FAKE_CLAUDE, copy);
    fs.chmodSync(copy, 0o755);

    expect((await getCachedProbe(adapter, copy)).version).toBe('2.1.309');
    process.env.FAKE_CLAUDE_VERSION = '2.1.400';
    expect((await getCachedProbe(adapter, copy)).version).toBe('2.1.309');

    const later = new Date(Date.now() + 60_000);
    fs.utimesSync(copy, later, later);
    expect((await getCachedProbe(adapter, copy)).version).toBe('2.1.400');
  });

  it('does not cache a logged-out result', async () => {
    process.env.FAKE_CLAUDE_LOGGED_IN = '0';
    expect((await getCachedProbe(adapter, FAKE_CLAUDE)).loggedIn).toBe(false);
    delete process.env.FAKE_CLAUDE_LOGGED_IN;
    expect((await getCachedProbe(adapter, FAKE_CLAUDE)).loggedIn).toBe(true);
  });
});

describe('runHostProcess', () => {
  it('delivers split and unterminated stdout lines in order', async () => {
    const lines: string[] = [];
    const result = await runHostProcess({
      executable: process.execPath,
      args: ['-e', 'process.stdout.write("a\\nb"); setTimeout(() => process.stdout.write("c\\nd"), 20)'],
      stdin: '',
      cwd: os.tmpdir(),
      signal: new AbortController().signal,
      onLine: (line) => lines.push(line),
    });
    expect(lines).toEqual(['a', 'bc', 'd']);
    expect(result).toMatchObject({ exitCode: 0, aborted: false });
  });

  it('keeps only the stderr tail', async () => {
    const result = await runHostProcess({
      executable: process.execPath,
      args: ['-e', 'process.stderr.write("x".repeat(20000) + "END")'],
      stdin: '',
      cwd: os.tmpdir(),
      signal: new AbortController().signal,
      onLine: () => undefined,
    });
    expect(result.stderrTail.length).toBe(8 * 1024);
    expect(result.stderrTail.endsWith('END')).toBe(true);
  });

  it('kills the whole process group, escalating to SIGKILL when SIGTERM is ignored', async () => {
    const controller = new AbortController();
    const pidFile = path.join(os.tmpdir(), `host-agent-child-${process.pid}-${Date.now()}`);
    // The parent ignores SIGTERM and starts a grandchild; both must be gone after abort.
    const script = `
      process.on('SIGTERM', () => {});
      const child = require('node:child_process').spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
      require('node:fs').writeFileSync(${JSON.stringify(pidFile)}, String(child.pid));
      setInterval(() => {}, 1000);
    `;
    setTimeout(() => controller.abort(), 300);
    const result = await runHostProcess({
      executable: process.execPath,
      args: ['-e', script],
      stdin: '',
      cwd: os.tmpdir(),
      signal: controller.signal,
      onLine: () => undefined,
      killGraceMs: 200,
    });
    expect(result).toMatchObject({ aborted: true, exitSignal: 'SIGKILL' });

    const grandchild = Number(fs.readFileSync(pidFile, 'utf8'));
    fs.rmSync(pidFile, { force: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(() => process.kill(grandchild, 0)).toThrow();
  });

  it('does not spawn when already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const lines: string[] = [];
    const result = await runHostProcess({
      executable: process.execPath,
      args: ['-e', 'console.log("ran")'],
      stdin: '',
      cwd: os.tmpdir(),
      signal: controller.signal,
      onLine: (line) => lines.push(line),
    });
    expect(result.aborted).toBe(true);
    expect(lines).toEqual([]);
  });
});
