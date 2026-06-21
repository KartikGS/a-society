import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { BashToolExecutor } from '../../src/tools/bash-executor.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';

const tempDirs = new Set<string>();

function makeTempWorkspace(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bash-executor-test-'));
  tempDirs.add(dir);
  setWorkspaceRoot(dir);
  return dir;
}

function makeExecutor(): { workspaceRoot: string; executor: BashToolExecutor } {
  const workspaceRoot = makeTempWorkspace();
  return { workspaceRoot, executor: new BashToolExecutor() };
}

describe('bash-executor', () => {
  afterEach(() => {
    delete process.env.TEST_FAKE_API_KEY;
    delete process.env.TEST_HARMLESS_VAR;
    delete process.env.TEST_FAKE_KEY;
    delete process.env.TEST_FAKE_SECRET;
    delete process.env.TEST_FAKE_TOKEN;
    delete process.env.TEST_FAKE_PASSWORD;
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  describe('run_command', () => {
    it('captures stdout from a successful command', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '1', name: 'run_command', input: { command: 'echo hello' } });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('hello');
    });

    it('captures stderr', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '2', name: 'run_command', input: { command: 'echo err >&2' } });

      expect(result.content).toContain('err');
    });

    it('sets isError true and includes exit code for non-zero exit', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '3', name: 'run_command', input: { command: 'exit 1' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('exit code 1');
    });

    it('sets isError true for command not found', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '4', name: 'run_command', input: { command: 'this_command_does_not_exist_xyz' } });

      expect(result.isError).toBe(true);
    });

    it('runs with cwd set to workspace root', async () => {
      const { workspaceRoot, executor } = makeExecutor();

      const result = await executor.execute({ id: '5', name: 'run_command', input: { command: 'pwd' } });

      expect(result.isError).toBe(false);
      expect(result.content).toContain(workspaceRoot);
    });

    it('can create files in the workspace', async () => {
      const { workspaceRoot, executor } = makeExecutor();

      await executor.execute({ id: '6', name: 'run_command', input: { command: 'echo content > created.txt' } });

      expect(fs.existsSync(path.join(workspaceRoot, 'created.txt'))).toBe(true);
    });

    it('captures both stdout and stderr in one result', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '7', name: 'run_command', input: { command: 'echo out; echo err >&2' } });

      expect(result.content).toContain('out');
      expect(result.content).toContain('err');
    });

    it('returns no-output marker when command produces nothing', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '8', name: 'run_command', input: { command: 'true' } });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('no output');
    });

    it('preserves multi-line output', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '9', name: 'run_command', input: { command: 'printf "line1\\nline2\\nline3\\n"' } });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('line1');
      expect(result.content).toContain('line2');
      expect(result.content).toContain('line3');
    });
  });

  describe('canHandle', () => {
    it('returns true for run_command', () => {
      const { executor } = makeExecutor();

      expect(executor.canHandle('run_command')).toBe(true);
    });

    it('returns false for unknown tool names', () => {
      const { executor } = makeExecutor();

      expect(executor.canHandle('read_file')).toBe(false);
      expect(executor.canHandle('')).toBe(false);
      expect(executor.canHandle('bash')).toBe(false);
    });
  });

  describe('input validation', () => {
    it('returns error for unknown tool name', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '1', name: 'unknown_tool', input: { command: 'echo hi' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('unknown tool');
    });

    it('returns error when command is missing', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '2', name: 'run_command', input: {} });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('command');
    });
  });

  describe('denylist', () => {
    const deniedCases: Array<[string, string]> = [
      [':(){ :|:& };:', 'fork bomb'],
      ['mkfs.ext4 /dev/sda1', 'mkfs'],
      ['dd if=/dev/zero of=/dev/sda', 'dd to block device'],
      ['rm -rf /', 'rm -rf /'],
      ['rm -r /', 'rm -r /'],
      ['rm -fr /', 'rm -fr /'],
      ['rm --recursive /', 'rm --recursive /'],
    ];

    for (const [command, label] of deniedCases) {
      it(`blocks ${label}`, async () => {
        const { executor } = makeExecutor();

        const result = await executor.execute({ id: '1', name: 'run_command', input: { command } });

        expect(result.isError).toBe(true);
        expect(result.content).toContain('blocked');
      });
    }

    const allowedCases: Array<[string, string]> = [
      ['rm -rf /tmp/my-project', 'rm -rf of non-root path'],
      ['echo hello', 'echo'],
      ['ls /', 'ls /'],
    ];

    for (const [command, label] of allowedCases) {
      it(`does not block ${label}`, () => {
        const { executor } = makeExecutor();

        const result = executor.validate({ id: '1', name: 'run_command', input: { command } });

        expect(result).toBeNull();
      });
    }
  });

  describe('env sanitization', () => {
    it('does not pass credential env vars to child process', async () => {
      const { executor } = makeExecutor();
      process.env.TEST_FAKE_API_KEY = 'super-secret-value-aabbcc';

      const result = await executor.execute({ id: '1', name: 'run_command', input: { command: 'echo $TEST_FAKE_API_KEY' } });

      expect(result.isError).toBe(false);
      expect(result.content).not.toContain('super-secret-value-aabbcc');
    });

    it('keeps non-credential env vars accessible to child process', async () => {
      const { executor } = makeExecutor();
      process.env.TEST_HARMLESS_VAR = 'harmless-value';

      const result = await executor.execute({ id: '2', name: 'run_command', input: { command: 'echo $TEST_HARMLESS_VAR' } });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('harmless-value');
    });

    for (const suffix of ['_KEY', '_SECRET', '_TOKEN', '_PASSWORD', '_API_KEY']) {
      it(`strips var with suffix ${suffix}`, async () => {
        const { executor } = makeExecutor();
        const varName = `TEST_FAKE${suffix}`;
        process.env[varName] = `credential-value-${suffix}-xyz123456`;

        const result = await executor.execute({ id: '1', name: 'run_command', input: { command: `echo $${varName}` } });

        expect(result.content).not.toContain(`credential-value-${suffix}-xyz123456`);
      });
    }
  });

  describe('output redaction', () => {
    it('redacts stripped credential value that appears in command output', async () => {
      const { workspaceRoot, executor } = makeExecutor();
      process.env.TEST_FAKE_SECRET = 'my-very-secret-token-redact-me-now';
      fs.writeFileSync(path.join(workspaceRoot, 'cred.txt'), 'my-very-secret-token-redact-me-now');

      const result = await executor.execute({ id: '1', name: 'run_command', input: { command: 'cat cred.txt' } });

      expect(result.content).not.toContain('my-very-secret-token-redact-me-now');
      expect(result.content).toContain('[REDACTED]');
    });

    it('redacts Anthropic key format from output', async () => {
      const { workspaceRoot, executor } = makeExecutor();
      const fakeKey = 'sk-ant-api03-AAAABBBBCCCCDDDDEEEEFFFFGGGG1234567890abcdef';
      fs.writeFileSync(path.join(workspaceRoot, 'key.txt'), fakeKey);

      const result = await executor.execute({ id: '2', name: 'run_command', input: { command: 'cat key.txt' } });

      expect(result.content).not.toContain(fakeKey);
      expect(result.content).toContain('[REDACTED]');
    });

    it('does not redact normal output', async () => {
      const { executor } = makeExecutor();

      const result = await executor.execute({ id: '3', name: 'run_command', input: { command: 'echo "hello world"' } });

      expect(result.content).toContain('hello world');
      expect(result.content).not.toContain('[REDACTED]');
    });
  });
});
