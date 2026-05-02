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
const INVOCATION_PATH = path.resolve(__dirname, '../../INVOCATION.md');

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

test('INVOCATION.md: documents later same-role-instance return with role-instance-scoped session reuse', () => {
  assert.ok(
    doc.includes('role-instance session') || doc.includes('role-instance-scoped session'),
    'Expected INVOCATION.md to describe reused role-instance continuity for later same-role-instance nodes'
  );
});

test('INVOCATION.md: documents role instance parallel behavior', () => {
  assert.ok(
    doc.includes('Owner_1') && doc.includes('Owner_2'),
    'Expected INVOCATION.md to document numbered role instances'
  );
  assert.ok(
    doc.includes('Concurrent activation of the same role instance is unsupported'),
    'Expected INVOCATION.md to describe same-role-instance rejection'
  );
  assert.ok(
    doc.includes('Distinct role instances may run in parallel'),
    'Expected INVOCATION.md to describe parallel role instances'
  );
});

test('INVOCATION.md: documents explicit scheduler fields and distinct-role parallelism', () => {
  assert.ok(doc.includes('readyNodes'), 'Expected INVOCATION.md to document readyNodes');
  assert.ok(doc.includes('runningNodes'), 'Expected INVOCATION.md to document runningNodes');
  assert.ok(doc.includes('awaitingHumanNodes'), 'Expected INVOCATION.md to document awaitingHumanNodes');
  assert.ok(
    doc.includes('Distinct role instances may run in parallel') || doc.includes('distinct-role nodes concurrently'),
    'Expected INVOCATION.md to describe role-instance parallel execution'
  );
});

test('INVOCATION.md: documents durable operator feed replay', () => {
  assert.ok(doc.includes('operator-feed.json'), 'Expected INVOCATION.md to document operator-feed.json');
  assert.ok(
    doc.includes('browser feed') && doc.includes('replayed'),
    'Expected INVOCATION.md to describe browser feed replay'
  );
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) process.exit(1);
