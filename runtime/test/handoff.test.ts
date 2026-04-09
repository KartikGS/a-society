import assert from 'node:assert';
import { HandoffInterpreter } from '../src/handoff.js';

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

console.log('\nhandoff-interpreter');

test('parse (Single-object): returns array with one target', () => {
  const text = "Some text before.\n```handoff\nrole: Owner\nartifact_path: path/to/file.md\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'targets');
  const targets = (result as any).targets;
  assert.strictEqual(targets.length, 1);
  assert.strictEqual(targets[0].role, 'Owner');
  assert.strictEqual(targets[0].artifact_path, 'path/to/file.md');
});

test('parse (Array): returns multiple targets', () => {
  const text = "Fork point reached.\n```handoff\n- role: Framework Services Developer\n  artifact_path: path/a.md\n- role: Orchestration Developer\n  artifact_path: path/b.md\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'targets');
  const targets = (result as any).targets;
  assert.strictEqual(targets.length, 2);
  assert.strictEqual(targets[0].role, 'Framework Services Developer');
  assert.strictEqual(targets[1].role, 'Orchestration Developer');
  assert.strictEqual(targets[0].artifact_path, 'path/a.md');
  assert.strictEqual(targets[1].artifact_path, 'path/b.md');
});

test('parse (Null artifact): handles null artifact_path', () => {
  const text = "```handoff\nrole: Curator\nartifact_path: null\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual((result as any).targets[0].artifact_path, null);
});

test('parse (Empty array): throws HandoffParseError', () => {
  const text = "```handoff\n[]\n```";
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, /Handoff block must contain at least one target/);
});

test('parse (Invalid role): throws error for missing or empty role', () => {
  const text = "```handoff\nartifact_path: some/path.md\n```";
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, /"role" field is required/);
  
  const text2 = "```handoff\n- role: ' '\n  artifact_path: p.md\n```";
  assert.throws(() => {
      HandoffInterpreter.parse(text2);
  }, /"role" field is required/);
});

test('parse (Malformed YAML): throws HandoffParseError', () => {
  const text = "```handoff\n - role: Owner\n  - artifact_path: p.md\n```"; // Invalid YAML indent
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, /Handoff block could not be parsed/);
});

test('parse (Missing handoff key): throws error', () => {
  const text = "```yaml\nrole: Owner\n```"; // Missing 'handoff:' key
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, /Handoff block could not be parsed/);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
