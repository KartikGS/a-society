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
// Summary
// ---------------------------------------------------------------------------
console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
