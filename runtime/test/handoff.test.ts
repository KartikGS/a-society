import assert from 'node:assert';
import { HandoffInterpreter, HandoffParseError } from '../src/handoff.js';

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
  const text = "Some text before.\n```handoff\ntarget_node_id: owner-review\nartifact_path: path/to/file.md\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'targets');
  const targets = (result as any).targets;
  assert.strictEqual(targets.length, 1);
  assert.strictEqual(targets[0].target_node_id, 'owner-review');
  assert.strictEqual(targets[0].artifact_path, 'path/to/file.md');
});

test('parse (Array): returns multiple targets', () => {
  const text = "Fork point reached.\n```handoff\n- target_node_id: framework-services-implementation\n  artifact_path: path/a.md\n- target_node_id: orchestration-implementation\n  artifact_path: path/b.md\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'targets');
  const targets = (result as any).targets;
  assert.strictEqual(targets.length, 2);
  assert.strictEqual(targets[0].target_node_id, 'framework-services-implementation');
  assert.strictEqual(targets[1].target_node_id, 'orchestration-implementation');
  assert.strictEqual(targets[0].artifact_path, 'path/a.md');
  assert.strictEqual(targets[1].artifact_path, 'path/b.md');
});

test('parse (Null artifact): handles null artifact_path', () => {
  const text = "```handoff\ntarget_node_id: curator-proposal\nartifact_path: null\n```";
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
  const text = "```handoff\ntype: meta-analysis-complete\nfindings_path: a-society/a-docs/records/example-flow/findings/owner-findings.md\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'meta-analysis-complete');
  assert.strictEqual((result as any).findingsPath, 'a-society/a-docs/records/example-flow/findings/owner-findings.md');
});

test('parse (backward-pass-complete): returns backward pass closure signal', () => {
  const text = "```handoff\ntype: backward-pass-complete\nartifact_path: a-society/a-docs/records/example-flow/12-owner-feedback.md\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'backward-pass-complete');
  assert.strictEqual((result as any).artifactPath, 'a-society/a-docs/records/example-flow/12-owner-feedback.md');
});

test('parse (prompt-human): returns awaiting_human signal', () => {
  const text = "```handoff\ntype: prompt-human\n```";
  const result = HandoffInterpreter.parse(text);
  assert.strictEqual(result.kind, 'awaiting_human');
});

test('parse (Empty array): throws HandoffParseError with invalid_target_shape code', () => {
  const text = "```handoff\n[]\n```";
  let err: any;
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, (e: any) => { err = e; return e instanceof HandoffParseError; });
  assert.strictEqual(err.details.code, 'invalid_target_shape');
  assert.ok(err.details.modelRepairMessage.includes('at least one target'));
});

test('parse (Invalid target_node_id): throws missing_required_field for missing or empty target_node_id', () => {
  const text = "```handoff\nartifact_path: some/path.md\n```";
  let err: any;
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, (e: any) => { err = e; return e instanceof HandoffParseError; });
  assert.strictEqual(err.details.code, 'missing_required_field');
  assert.strictEqual(err.details.operatorSummary, 'Handoff block missing required field');

  const text2 = "```handoff\n- target_node_id: ' '\n  artifact_path: p.md\n```";
  assert.throws(() => {
    HandoffInterpreter.parse(text2);
  }, (e: any) => e instanceof HandoffParseError && e.details.code === 'missing_required_field');
});

test('parse (Malformed YAML): throws HandoffParseError with yaml_parse code', () => {
  const text = "```handoff\n - target_node_id: owner-review\n  - artifact_path: p.md\n```";
  let err: any;
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, (e: any) => { err = e; return e instanceof HandoffParseError; });
  assert.strictEqual(err.details.code, 'yaml_parse');
  assert.strictEqual(err.details.operatorSummary, 'Malformed handoff block');
  assert.ok(err.details.modelRepairMessage.includes('could not be parsed as YAML'));
});

test('parse (Invalid typed signal): throws unknown_signal_type code with operator summary naming the type', () => {
  const text = "```handoff\ntype: unknown-signal\n```";
  let err: any;
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, (e: any) => { err = e; return e instanceof HandoffParseError; });
  assert.strictEqual(err.details.code, 'unknown_signal_type');
  assert.ok(err.details.operatorSummary.includes('unknown-signal'));
  assert.ok(err.details.modelRepairMessage.includes('forward-pass-closed'));
});

test('parse (Typed signal missing required fields): throws missing_required_field code', () => {
  const forwardPassText = "```handoff\ntype: forward-pass-closed\nartifact_path: a-society/a-docs/records/example-flow/08-owner-closure.md\n```";
  let fwdErr: any;
  assert.throws(() => {
    HandoffInterpreter.parse(forwardPassText);
  }, (e: any) => { fwdErr = e; return e instanceof HandoffParseError; });
  assert.strictEqual(fwdErr.details.code, 'missing_required_field');
  assert.ok(fwdErr.details.modelRepairMessage.includes('missing record_folder_path'));

  const findingsText = "```handoff\ntype: meta-analysis-complete\n```";
  let findErr: any;
  assert.throws(() => {
    HandoffInterpreter.parse(findingsText);
  }, (e: any) => { findErr = e; return e instanceof HandoffParseError; });
  assert.strictEqual(findErr.details.code, 'missing_required_field');
  assert.ok(findErr.details.modelRepairMessage.includes('missing findings_path'));

  const backwardPassText = "```handoff\ntype: backward-pass-complete\n```";
  let backwardErr: any;
  assert.throws(() => {
    HandoffInterpreter.parse(backwardPassText);
  }, (e: any) => { backwardErr = e; return e instanceof HandoffParseError; });
  assert.strictEqual(backwardErr.details.code, 'missing_required_field');
  assert.ok(backwardErr.details.modelRepairMessage.includes('missing artifact_path'));
});

test('parse (Missing handoff block): throws missing_block code', () => {
  const text = "```yaml\ntarget_node_id: owner-review\n```";
  let err: any;
  assert.throws(() => {
    HandoffInterpreter.parse(text);
  }, (e: any) => { err = e; return e instanceof HandoffParseError; });
  assert.strictEqual(err.details.code, 'missing_block');
  assert.strictEqual(err.details.operatorSummary, 'Malformed handoff block');
});

test('malformed handoff and unsupported signal produce distinct codes and operator summaries', () => {
  const malformedText = "```handoff\n - target_node_id: owner-review\n  - bad: yaml\n```";
  let malformedErr: any;
  try { HandoffInterpreter.parse(malformedText); } catch (e) { malformedErr = e; }

  const unknownSignalText = "```handoff\ntype: some-future-type\n```";
  let unknownErr: any;
  try { HandoffInterpreter.parse(unknownSignalText); } catch (e) { unknownErr = e; }

  assert.ok(malformedErr instanceof HandoffParseError);
  assert.ok(unknownErr instanceof HandoffParseError);
  assert.notStrictEqual(malformedErr.details.code, unknownErr.details.code);
  assert.notStrictEqual(malformedErr.details.operatorSummary, unknownErr.details.operatorSummary);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
