import assert from 'node:assert';
import { PassThrough } from 'node:stream';
import { OperatorEventRenderer } from '../src/operator-renderer.js';

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

function makeRenderer(): { renderer: OperatorEventRenderer; output: () => string } {
  const stream = new PassThrough();
  const chunks: string[] = [];
  stream.on('data', (chunk: Buffer) => chunks.push(chunk.toString()));
  const renderer = new OperatorEventRenderer(stream as any);
  return { renderer, output: () => chunks.join('') };
}

console.log('\noperator-renderer');

test('flow.resumed renders correct line', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'flow.resumed', flowId: 'abc-123', activeNodeCount: 2 });
  assert.ok(output().includes('[runtime/flow] Resuming flow abc-123 with 2 active node(s)\n'));
});

test('role.active with single artifact renders basename', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'role.active', nodeId: 'n1', role: 'Owner', artifactCount: 1, artifactBasename: 'brief.md' });
  assert.ok(output().includes('[runtime/role] Active: n1 (Owner) - artifact: brief.md\n'));
});

test('role.active with multiple artifacts renders count', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'role.active', nodeId: 'n1', role: 'Curator', artifactCount: 3 });
  assert.ok(output().includes('[runtime/role] Active: n1 (Curator) - inputs: 3 artifacts\n'));
});

test('role.active with zero artifacts renders just node/role', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'role.active', nodeId: 'n1', role: 'Owner', artifactCount: 0 });
  const out = output();
  assert.ok(out.includes('[runtime/role] Active: n1 (Owner)\n'));
  assert.ok(!out.includes('artifact'));
});

test('activity.tool_call renders tool name', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'activity.tool_call', toolName: 'read_file' });
  assert.ok(output().includes('[runtime/tool] read_file\n'));
});

test('activity.tool_call renders path when present', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'activity.tool_call', toolName: 'read_file', path: 'some/file.md' });
  assert.ok(output().includes('[runtime/tool] read_file some/file.md\n'));
});

test('handoff.applied linear case renders arrow notation', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({
    kind: 'handoff.applied',
    fromNodeId: 'n1', fromRole: 'Owner',
    targets: [{ nodeId: 'n2', role: 'Curator', artifactBasename: 'brief.md' }]
  });
  assert.ok(output().includes('[runtime/handoff] n1 (Owner) -> n2 (Curator) - artifact: brief.md\n'));
});

test('handoff.applied fork case renders forked-to notation', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({
    kind: 'handoff.applied',
    fromNodeId: 'n1', fromRole: 'Owner',
    targets: [
      { nodeId: 'n2', role: 'FSD' },
      { nodeId: 'n3', role: 'OD' }
    ]
  });
  assert.ok(output().includes('[runtime/handoff] n1 (Owner) forked to n2 (FSD), n3 (OD)\n'));
});

test('repair.requested node scope ends with retrying current node', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'repair.requested', scope: 'node', code: 'yaml_parse', summary: 'Malformed handoff block' });
  assert.ok(output().includes('[runtime/repair] Malformed handoff block; retrying current node\n'));
});

test('repair.requested improvement scope ends with retrying backward pass step', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'repair.requested', scope: 'improvement', code: 'runtime_health', summary: 'A-docs runtime health checks failed' });
  assert.ok(output().includes('[runtime/repair] A-docs runtime health checks failed; retrying backward pass step\n'));
});

test('human.awaiting_input prompt-human renders waiting line', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'human.awaiting_input', reason: 'prompt-human' });
  assert.ok(output().includes('[runtime/human] Waiting for operator input\n'));
});

test('human.awaiting_input autonomous-abort renders suspended line', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'human.awaiting_input', reason: 'autonomous-abort' });
  assert.ok(output().includes('[runtime/human] Flow suspended; waiting for later operator input\n'));
});

test('human.resumed renders resume line', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'human.resumed', nodeId: 'n2', role: 'Curator' });
  assert.ok(output().includes('[runtime/human] Operator input received; resuming n2 (Curator)\n'));
});

test('parallel.active_set renders all active nodes', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'parallel.active_set', activeNodes: [{ nodeId: 'n2', role: 'FSD' }, { nodeId: 'n3', role: 'OD' }] });
  assert.ok(output().includes('[runtime/parallel] Active nodes: n2 (FSD), n3 (OD)\n'));
});

test('parallel.join_waiting renders join pending line', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'parallel.join_waiting', nodeId: 'n4', role: 'Curator', waitingFor: ['n2', 'n3'] });
  assert.ok(output().includes('[runtime/parallel] Join pending: n4 (Curator) waiting for n2, n3\n'));
});

test('usage.turn_summary full renders both counts', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'usage.turn_summary', availability: 'full', inputTokens: 100, outputTokens: 200 });
  assert.ok(output().includes('Tokens: 100 in, 200 out\n'));
});

test('usage.turn_summary input-unavailable renders correct string', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'usage.turn_summary', availability: 'input-unavailable', outputTokens: 200 });
  assert.ok(output().includes('Tokens: input unavailable, 200 out\n'));
});

test('usage.turn_summary output-unavailable renders correct string', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'usage.turn_summary', availability: 'output-unavailable', inputTokens: 100 });
  assert.ok(output().includes('Tokens: 100 in, output unavailable\n'));
});

test('usage.turn_summary both-unavailable renders provider notice', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'usage.turn_summary', availability: 'both-unavailable' });
  assert.ok(output().includes('Tokens unavailable (provider did not report usage)\n'));
});

test('flow.forward_pass_closed renders artifact basename', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'flow.forward_pass_closed', recordFolderPath: 'some/folder', artifactBasename: '08-owner-closure.md' });
  assert.ok(output().includes('[runtime/flow] Forward pass closed via 08-owner-closure.md; starting improvement phase\n'));
});

test('flow.completed renders orchestration complete', () => {
  const { renderer, output } = makeRenderer();
  renderer.emit({ kind: 'flow.completed' });
  assert.ok(output().includes('[runtime/flow] Orchestration complete\n'));
});

test('emit clears wait before rendering notice (non-TTY: no spinner, emits notice after wait line)', () => {
  // Non-TTY stream: startWait writes one line, then emit stops and writes notice
  const stream = new PassThrough();
  const chunks: string[] = [];
  stream.on('data', (chunk: Buffer) => chunks.push(chunk.toString()));
  // non-TTY: isTTY is undefined/false
  const renderer = new OperatorEventRenderer(stream as any);

  renderer.startWait('anthropic', 'claude-3');
  renderer.emit({ kind: 'flow.completed' });

  const out = chunks.join('');
  // The wait line should appear, then the completed line
  assert.ok(out.includes('[runtime/wait] Waiting for claude-3 response'));
  assert.ok(out.includes('[runtime/flow] Orchestration complete'));
  // Completed line must come after wait line
  assert.ok(out.indexOf('[runtime/flow]') > out.indexOf('[runtime/wait]'));
});

test('assistant text does not appear in renderer output', () => {
  // The renderer stream must not contain assistant output (stdout is separate)
  const rendererStream = new PassThrough();
  const rendererChunks: string[] = [];
  rendererStream.on('data', (chunk: Buffer) => rendererChunks.push(chunk.toString()));

  const assistantStream = new PassThrough();
  const assistantChunks: string[] = [];
  assistantStream.on('data', (chunk: Buffer) => assistantChunks.push(chunk.toString()));

  const renderer = new OperatorEventRenderer(rendererStream as any);
  renderer.emit({ kind: 'role.active', nodeId: 'n1', role: 'Owner', artifactCount: 0 });

  // Simulate assistant text written to separate stream
  assistantStream.write('This is assistant text.');

  const rendererOut = rendererChunks.join('');
  const assistantOut = assistantChunks.join('');

  assert.ok(rendererOut.includes('[runtime/role]'));
  assert.ok(!rendererOut.includes('This is assistant text.'));
  assert.ok(assistantOut.includes('This is assistant text.'));
  assert.ok(!assistantOut.includes('[runtime/role]'));
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
