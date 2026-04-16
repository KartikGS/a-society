import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FileToolExecutor } from '../../src/tools/file-executor.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve(fn()).then(
    () => { console.log(`  ✓ ${name}`); passed++; },
    (err) => { console.error(`  ✗ ${name}`); console.error(`    ${(err as Error).message}`); failed++; }
  );
}

// Set up a temp workspace for each group of tests
function makeTempWorkspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'file-executor-test-'));
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// read_file
// ---------------------------------------------------------------------------
console.log('\nfile-executor › read_file');
{
  const ws = makeTempWorkspace();
  const ex = new FileToolExecutor(ws);

  await test('reads an existing file', async () => {
    fs.writeFileSync(path.join(ws, 'hello.txt'), 'hello world');
    const r = await ex.execute({ id: '1', name: 'read_file', input: { path: 'hello.txt' } });
    assert.strictEqual(r.isError, false);
    assert.strictEqual(r.content, 'hello world');
  });

  await test('returns error for missing file', async () => {
    const r = await ex.execute({ id: '2', name: 'read_file', input: { path: 'nope.txt' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('no such file'));
  });

  await test('returns error when path is a directory', async () => {
    fs.mkdirSync(path.join(ws, 'adir'));
    const r = await ex.execute({ id: '3', name: 'read_file', input: { path: 'adir' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('directory'));
  });

  await test('returns error for path outside workspace', async () => {
    const r = await ex.execute({ id: '4', name: 'read_file', input: { path: '../outside.txt' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('outside the workspace root'));
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// read_file_lines
// ---------------------------------------------------------------------------
console.log('\nfile-executor › read_file_lines');
{
  const ws = makeTempWorkspace();
  const ex = new FileToolExecutor(ws);
  const lines = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
  fs.writeFileSync(path.join(ws, 'lines.txt'), lines.join('\n'));

  await test('returns requested line range with 1-based numbers', async () => {
    const r = await ex.execute({ id: '1', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 2, end_line: 4 } });
    assert.strictEqual(r.isError, false);
    assert.strictEqual(r.content, '2\tbeta\n3\tgamma\n4\tdelta');
  });

  await test('clamps end_line to file length', async () => {
    const r = await ex.execute({ id: '2', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 4, end_line: 999 } });
    assert.strictEqual(r.isError, false);
    assert.strictEqual(r.content, '4\tdelta\n5\tepsilon');
  });

  await test('reads a single line', async () => {
    const r = await ex.execute({ id: '3', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 1, end_line: 1 } });
    assert.strictEqual(r.isError, false);
    assert.strictEqual(r.content, '1\talpha');
  });

  await test('returns error when start_line < 1', async () => {
    const r = await ex.execute({ id: '4', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 0, end_line: 3 } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('start_line'));
  });

  await test('returns error when end_line < start_line', async () => {
    const r = await ex.execute({ id: '5', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 4, end_line: 2 } });
    assert.strictEqual(r.isError, true);
  });

  await test('returns error for missing file', async () => {
    const r = await ex.execute({ id: '6', name: 'read_file_lines', input: { path: 'nope.txt', start_line: 1, end_line: 3 } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('no such file'));
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// edit_file
// ---------------------------------------------------------------------------
console.log('\nfile-executor › edit_file');
{
  const ws = makeTempWorkspace();
  const ex = new FileToolExecutor(ws);

  await test('replaces a unique string in the file', async () => {
    fs.writeFileSync(path.join(ws, 'edit.txt'), 'foo bar baz');
    const r = await ex.execute({ id: '1', name: 'edit_file', input: { path: 'edit.txt', old_string: 'bar', new_string: 'QUX' } });
    assert.strictEqual(r.isError, false);
    assert.strictEqual(fs.readFileSync(path.join(ws, 'edit.txt'), 'utf8'), 'foo QUX baz');
  });

  await test('preserves content outside the replaced region', async () => {
    fs.writeFileSync(path.join(ws, 'preserve.txt'), 'line1\nline2\nline3\n');
    await ex.execute({ id: '2', name: 'edit_file', input: { path: 'preserve.txt', old_string: 'line2', new_string: 'LINE_TWO' } });
    assert.strictEqual(fs.readFileSync(path.join(ws, 'preserve.txt'), 'utf8'), 'line1\nLINE_TWO\nline3\n');
  });

  await test('returns error when old_string is not found', async () => {
    fs.writeFileSync(path.join(ws, 'notfound.txt'), 'hello world');
    const r = await ex.execute({ id: '3', name: 'edit_file', input: { path: 'notfound.txt', old_string: 'zzz', new_string: 'aaa' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('not found'));
  });

  await test('returns error when old_string appears more than once', async () => {
    fs.writeFileSync(path.join(ws, 'ambiguous.txt'), 'foo foo foo');
    const r = await ex.execute({ id: '4', name: 'edit_file', input: { path: 'ambiguous.txt', old_string: 'foo', new_string: 'bar' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('more than once'));
  });

  await test('returns error for missing file', async () => {
    const r = await ex.execute({ id: '5', name: 'edit_file', input: { path: 'ghost.txt', old_string: 'x', new_string: 'y' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('no such file'));
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// write_file
// ---------------------------------------------------------------------------
console.log('\nfile-executor › write_file');
{
  const ws = makeTempWorkspace();
  const ex = new FileToolExecutor(ws);

  await test('creates a new file with content', async () => {
    const r = await ex.execute({ id: '1', name: 'write_file', input: { path: 'new.txt', content: 'created' } });
    assert.strictEqual(r.isError, false);
    assert.strictEqual(fs.readFileSync(path.join(ws, 'new.txt'), 'utf8'), 'created');
  });

  await test('overwrites an existing file', async () => {
    fs.writeFileSync(path.join(ws, 'overwrite.txt'), 'old content');
    await ex.execute({ id: '2', name: 'write_file', input: { path: 'overwrite.txt', content: 'new content' } });
    assert.strictEqual(fs.readFileSync(path.join(ws, 'overwrite.txt'), 'utf8'), 'new content');
  });

  await test('creates intermediate directories', async () => {
    const r = await ex.execute({ id: '3', name: 'write_file', input: { path: 'deep/nested/dir/file.txt', content: 'deep' } });
    assert.strictEqual(r.isError, false);
    assert.strictEqual(fs.readFileSync(path.join(ws, 'deep/nested/dir/file.txt'), 'utf8'), 'deep');
  });

  await test('reports byte count on success', async () => {
    const r = await ex.execute({ id: '4', name: 'write_file', input: { path: 'bytes.txt', content: 'abcde' } });
    assert.strictEqual(r.isError, false);
    assert.ok(r.content.includes('5 bytes'));
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// list_directory
// ---------------------------------------------------------------------------
console.log('\nfile-executor › list_directory');
{
  const ws = makeTempWorkspace();
  const ex = new FileToolExecutor(ws);
  fs.writeFileSync(path.join(ws, 'b.txt'), '');
  fs.writeFileSync(path.join(ws, 'a.txt'), '');
  fs.mkdirSync(path.join(ws, 'subdir'));

  await test('returns sorted JSON array of entries', async () => {
    const r = await ex.execute({ id: '1', name: 'list_directory', input: { path: '.' } });
    assert.strictEqual(r.isError, false);
    const entries = JSON.parse(r.content);
    assert.deepStrictEqual(entries, ['a.txt', 'b.txt', 'subdir/']);
  });

  await test('appends "/" to directory entries', async () => {
    const r = await ex.execute({ id: '2', name: 'list_directory', input: { path: '.' } });
    const entries: string[] = JSON.parse(r.content);
    assert.ok(entries.includes('subdir/'));
  });

  await test('returns error for missing directory', async () => {
    const r = await ex.execute({ id: '3', name: 'list_directory', input: { path: 'ghost' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('no such directory'));
  });

  await test('returns error when path is a file', async () => {
    const r = await ex.execute({ id: '4', name: 'list_directory', input: { path: 'a.txt' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('not a directory'));
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// sandbox enforcement (shared across all tools)
// ---------------------------------------------------------------------------
console.log('\nfile-executor › sandbox');
{
  const ws = makeTempWorkspace();
  const ex = new FileToolExecutor(ws);

  for (const [toolName, input] of [
    ['read_file', { path: '../../etc/passwd' }],
    ['read_file_lines', { path: '../../etc/passwd', start_line: 1, end_line: 1 }],
    ['edit_file', { path: '../../etc/passwd', old_string: 'x', new_string: 'y' }],
    ['write_file', { path: '../../evil.txt', content: 'bad' }],
    ['list_directory', { path: '../../' }],
  ] as const) {
    await test(`${toolName} rejects path outside workspace`, async () => {
      const r = await ex.execute({ id: '1', name: toolName, input });
      assert.strictEqual(r.isError, true);
      assert.ok(r.content.includes('outside the workspace root'));
    });
  }

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// unknown tool
// ---------------------------------------------------------------------------
console.log('\nfile-executor › unknown tool');
{
  const ws = makeTempWorkspace();
  const ex = new FileToolExecutor(ws);

  await test('returns error for unknown tool name', async () => {
    const r = await ex.execute({ id: '1', name: 'nonexistent_tool', input: {} });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('unknown tool'));
  });

  cleanup(ws);
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
