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

test('parse (forward-pass-closed): returns closure signal', () => {
  const text = "```handoff\ntype: forward-pass-closed\nrecord_folder_path: a-society/a-docs/records/example-flow\nartifact_path: a-society/a-docs/records/example-flow/08-owner-closure.md\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'forward-pass-closed');
  assert.strictEqual((result as any).recordFolderPath, 'a-society/a-docs/records/example-flow');
  assert.strictEqual((result as any).artifactPath, 'a-society/a-docs/records/example-flow/08-owner-closure.md');
});

test('parse (meta-analysis-complete): returns findings signal', () => {
  const text = "```handoff\ntype: meta-analysis-complete\nfindings_path: a-society/a-docs/records/example-flow/11-owner-findings.md\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'meta-analysis-complete');
  assert.strictEqual((result as any).findingsPath, 'a-society/a-docs/records/example-flow/11-owner-findings.md');
});

test('parse (prompt-human): returns awaiting_human signal', () => {
  const text = "```handoff\ntype: prompt-human\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'awaiting_human');
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

test('parse (Invalid typed signal): throws on unknown type', () => {
  const text = "```handoff\ntype: unknown-signal\n```";
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, /Unknown handoff signal type/);
});

test('parse (Typed signal missing required fields): throws field-specific errors', () => {
  const forwardPassText = "```handoff\ntype: forward-pass-closed\nartifact_path: a-society/a-docs/records/example-flow/08-owner-closure.md\n```";
  assert.throws(() => {
    HandoffInterpreter.parse(forwardPassText);
  }, /missing record_folder_path/);

  const findingsText = "```handoff\ntype: meta-analysis-complete\n```";
  assert.throws(() => {
    HandoffInterpreter.parse(findingsText);
  }, /missing findings_path/);
});

test('parse (Missing handoff key): throws error', () => {
  const text = "```yaml\nrole: Owner\n```"; // Missing 'handoff:' key
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, /Handoff block could not be parsed/);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
