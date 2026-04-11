/**
 * Doc-contract test for a-society/runtime/INVOCATION.md.
 *
 * Checks that the operator-facing reference documents the startup and resume
 * semantics introduced by the startup-context-and-role-continuity flow.
 * Does not test runtime behavior directly — that is covered by other integration tests.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INVOCATION_PATH = path.resolve(__dirname, '../INVOCATION.md');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\ninvocation-doc');

const doc = fs.readFileSync(INVOCATION_PATH, 'utf8');

test('INVOCATION.md: documents that required reading is already loaded at session start', () => {
  assert.ok(
    doc.includes('already loaded') || doc.includes('already present') || doc.includes('loaded once'),
    'Expected INVOCATION.md to state that required-reading files are already loaded at session start'
  );
});

test('INVOCATION.md: documents prompt-human resume behavior (same node session reused)', () => {
  assert.ok(
    doc.includes('prompt-human'),
    'Expected INVOCATION.md to mention prompt-human resume behavior'
  );
  assert.ok(
    doc.includes('resume') || doc.includes('reuse') || doc.includes('same node'),
    'Expected INVOCATION.md to describe same-node session reuse on prompt-human resume'
  );
});

test('INVOCATION.md: documents later same-role return with continuity summary', () => {
  assert.ok(
    doc.includes('continuity') || doc.includes('continuity summary'),
    'Expected INVOCATION.md to describe carried-forward continuity for later same-role nodes'
  );
});

test('INVOCATION.md: documents same-role parallel isolation behavior', () => {
  assert.ok(
    doc.includes('parallel') || doc.includes('isolation'),
    'Expected INVOCATION.md to describe parallel same-role isolation'
  );
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) process.exit(1);
