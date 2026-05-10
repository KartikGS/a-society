import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BashToolExecutor } from '../../src/tools/bash-executor.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve(fn()).then(
    () => { console.log(`  ✓ ${name}`); passed++; },
    (err) => { console.error(`  ✗ ${name}`); console.error(`    ${(err as Error).message}`); failed++; }
  );
}

function makeTempWorkspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bash-executor-test-'));
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// run_command › stdout / stderr / exit code
// ---------------------------------------------------------------------------
console.log('\nbash-executor › run_command');
{
  const ws = makeTempWorkspace();
  const ex = new BashToolExecutor(ws);

  await test('captures stdout from a successful command', async () => {
    const r = await ex.execute({ id: '1', name: 'run_command', input: { command: 'echo hello' } });
    assert.strictEqual(r.isError, false);
    assert.ok(r.content.includes('hello'));
  });

  await test('captures stderr', async () => {
    const r = await ex.execute({ id: '2', name: 'run_command', input: { command: 'echo err >&2' } });
    assert.ok(r.content.includes('err'));
  });

  await test('sets isError true and includes exit code for non-zero exit', async () => {
    const r = await ex.execute({ id: '3', name: 'run_command', input: { command: 'exit 1' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('exit code 1'));
  });

  await test('sets isError true for command not found', async () => {
    const r = await ex.execute({ id: '4', name: 'run_command', input: { command: 'this_command_does_not_exist_xyz' } });
    assert.strictEqual(r.isError, true);
  });

  await test('runs with cwd set to workspace root', async () => {
    const r = await ex.execute({ id: '5', name: 'run_command', input: { command: 'pwd' } });
    assert.strictEqual(r.isError, false);
    assert.ok(r.content.includes(ws));
  });

  await test('can create files in the workspace', async () => {
    await ex.execute({ id: '6', name: 'run_command', input: { command: 'echo content > created.txt' } });
    assert.ok(fs.existsSync(path.join(ws, 'created.txt')));
  });

  await test('captures both stdout and stderr in one result', async () => {
    const r = await ex.execute({ id: '7', name: 'run_command', input: { command: 'echo out; echo err >&2' } });
    assert.ok(r.content.includes('out'));
    assert.ok(r.content.includes('err'));
  });

  await test('returns (no output) when command produces nothing', async () => {
    const r = await ex.execute({ id: '8', name: 'run_command', input: { command: 'true' } });
    assert.strictEqual(r.isError, false);
    assert.ok(r.content.includes('no output'));
  });

  await test('multi-line output is preserved', async () => {
    const r = await ex.execute({ id: '9', name: 'run_command', input: { command: 'printf "line1\\nline2\\nline3\\n"' } });
    assert.strictEqual(r.isError, false);
    assert.ok(r.content.includes('line1'));
    assert.ok(r.content.includes('line2'));
    assert.ok(r.content.includes('line3'));
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// run_command › canHandle
// ---------------------------------------------------------------------------
console.log('\nbash-executor › canHandle');
{
  const ws = makeTempWorkspace();
  const ex = new BashToolExecutor(ws);

  await test('returns true for run_command', async () => {
    assert.strictEqual(ex.canHandle('run_command'), true);
  });

  await test('returns false for unknown tool names', async () => {
    assert.strictEqual(ex.canHandle('read_file'), false);
    assert.strictEqual(ex.canHandle(''), false);
    assert.strictEqual(ex.canHandle('bash'), false);
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// run_command › input validation
// ---------------------------------------------------------------------------
console.log('\nbash-executor › input validation');
{
  const ws = makeTempWorkspace();
  const ex = new BashToolExecutor(ws);

  await test('returns error for unknown tool name', async () => {
    const r = await ex.execute({ id: '1', name: 'unknown_tool', input: { command: 'echo hi' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('unknown tool'));
  });

  await test('returns error when command is missing', async () => {
    const r = await ex.execute({ id: '2', name: 'run_command', input: {} });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('command'));
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// denylist
// ---------------------------------------------------------------------------
console.log('\nbash-executor › denylist');
{
  const ws = makeTempWorkspace();
  const ex = new BashToolExecutor(ws);

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
    await test(`blocks: ${label}`, async () => {
      const r = await ex.execute({ id: '1', name: 'run_command', input: { command } });
      assert.strictEqual(r.isError, true);
      assert.ok(r.content.includes('blocked'), `expected 'blocked' in: ${r.content}`);
    });
  }

  const allowedCases: Array<[string, string]> = [
    ['rm -rf /tmp/my-project', 'rm -rf of non-root path'],
    ['echo hello', 'echo'],
    ['ls /', 'ls /'],
  ];

  for (const [command, label] of allowedCases) {
    await test(`does not block: ${label}`, async () => {
      const r = await ex.validate({ id: '1', name: 'run_command', input: { command } });
      assert.strictEqual(r, null);
    });
  }

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// environment sanitization
// ---------------------------------------------------------------------------
console.log('\nbash-executor › env sanitization');
{
  const ws = makeTempWorkspace();
  const ex = new BashToolExecutor(ws);

  await test('credential env vars are not passed to child process', async () => {
    process.env.TEST_FAKE_API_KEY = 'super-secret-value-aabbcc';
    try {
      const r = await ex.execute({ id: '1', name: 'run_command', input: { command: 'echo $TEST_FAKE_API_KEY' } });
      assert.strictEqual(r.isError, false);
      assert.ok(!r.content.includes('super-secret-value-aabbcc'), 'credential value leaked into output');
    } finally {
      delete process.env.TEST_FAKE_API_KEY;
    }
  });

  await test('non-credential env vars are still accessible to child', async () => {
    process.env.TEST_HARMLESS_VAR = 'harmless-value';
    try {
      const r = await ex.execute({ id: '2', name: 'run_command', input: { command: 'echo $TEST_HARMLESS_VAR' } });
      assert.strictEqual(r.isError, false);
      assert.ok(r.content.includes('harmless-value'));
    } finally {
      delete process.env.TEST_HARMLESS_VAR;
    }
  });

  for (const suffix of ['_KEY', '_SECRET', '_TOKEN', '_PASSWORD', '_API_KEY']) {
    await test(`strips var with suffix ${suffix}`, async () => {
      const varName = `TEST_FAKE${suffix}`;
      process.env[varName] = `credential-value-${suffix}-xyz123456`;
      try {
        const r = await ex.execute({ id: '1', name: 'run_command', input: { command: `echo $${varName}` } });
        assert.ok(!r.content.includes(`credential-value-${suffix}-xyz123456`), `${suffix} value leaked`);
      } finally {
        delete process.env[varName];
      }
    });
  }

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// output redaction
// ---------------------------------------------------------------------------
console.log('\nbash-executor › output redaction');
{
  const ws = makeTempWorkspace();
  const ex = new BashToolExecutor(ws);

  await test('redacts stripped credential value that appears in command output', async () => {
    process.env.TEST_FAKE_SECRET = 'my-very-secret-token-redact-me-now';
    try {
      fs.writeFileSync(path.join(ws, 'cred.txt'), 'my-very-secret-token-redact-me-now');
      const r = await ex.execute({ id: '1', name: 'run_command', input: { command: 'cat cred.txt' } });
      assert.ok(!r.content.includes('my-very-secret-token-redact-me-now'), 'credential not redacted from output');
      assert.ok(r.content.includes('[REDACTED]'));
    } finally {
      delete process.env.TEST_FAKE_SECRET;
    }
  });

  await test('redacts Anthropic key format from output', async () => {
    const fakeKey = 'sk-ant-api03-AAAABBBBCCCCDDDDEEEEFFFFGGGG1234567890abcdef';
    fs.writeFileSync(path.join(ws, 'key.txt'), fakeKey);
    const r = await ex.execute({ id: '2', name: 'run_command', input: { command: 'cat key.txt' } });
    assert.ok(!r.content.includes(fakeKey), 'Anthropic key not redacted');
    assert.ok(r.content.includes('[REDACTED]'));
  });

  await test('does not redact normal output', async () => {
    const r = await ex.execute({ id: '3', name: 'run_command', input: { command: 'echo "hello world"' } });
    assert.ok(r.content.includes('hello world'));
    assert.ok(!r.content.includes('[REDACTED]'));
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
