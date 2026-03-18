import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { orderFromGraph, orderFromFile, generateTriggerPrompts, orderWithPromptsFromFile } from '../src/backward-pass-orderer.js';
import type { WorkflowDocument } from '../src/workflow-graph-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const LIVE_WORKFLOW = path.join(REPO_ROOT, 'a-society', 'a-docs', 'workflow', 'main.md');
const FIXTURES = path.join(__dirname, 'fixtures');

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

// Minimal two-role graph (mirrors A-Society's standard workflow structure)
const TWO_ROLE_GRAPH: WorkflowDocument = {
  workflow: {
    name: 'Two Role',
    phases: [
      { id: 'phase-1', name: 'Proposal' },
      { id: 'phase-2', name: 'Backward Pass' },
    ],
    nodes: [
      { id: 'owner-phase-1', role: 'Owner', phase: 'phase-1', first_occurrence_position: 1, is_synthesis_role: false },
      { id: 'curator-phase-1', role: 'Curator', phase: 'phase-1', first_occurrence_position: 2, is_synthesis_role: false },
      { id: 'curator-phase-2-findings', role: 'Curator', phase: 'phase-2', first_occurrence_position: 2, is_synthesis_role: false },
      { id: 'owner-phase-2-findings', role: 'Owner', phase: 'phase-2', first_occurrence_position: 1, is_synthesis_role: false },
      { id: 'curator-phase-2-synthesis', role: 'Curator', phase: 'phase-2', first_occurrence_position: 2, is_synthesis_role: true },
    ],
    edges: [],
  },
};

// Four-role graph (mirrors the tooling flow from the addendum)
// Curator participates only as the synthesis role — no separate non-synthesis Curator node.
// This matches the addendum's expected order: TA, Developer, Owner, Curator(synthesis).
const FOUR_ROLE_GRAPH: WorkflowDocument = {
  workflow: {
    name: 'Four Role',
    phases: [{ id: 'p1', name: 'Phase 1' }],
    nodes: [
      { id: 'owner-1', role: 'Owner', phase: 'p1', first_occurrence_position: 1, is_synthesis_role: false },
      { id: 'developer-1', role: 'Tooling Developer', phase: 'p1', first_occurrence_position: 3, is_synthesis_role: false },
      { id: 'ta-1', role: 'Technical Architect', phase: 'p1', first_occurrence_position: 4, is_synthesis_role: false },
      { id: 'curator-synthesis', role: 'Curator', phase: 'p1', first_occurrence_position: 2, is_synthesis_role: true },
    ],
    edges: [],
  },
};

console.log('\nbackward-pass-orderer');

// --- Output shape ---

test('returns an array', () => {
  const result = orderFromGraph(TWO_ROLE_GRAPH);
  assert.ok(Array.isArray(result));
});

test('each entry has backward_pass_position, role, node_ids, is_synthesis', () => {
  const result = orderFromGraph(TWO_ROLE_GRAPH);
  for (const entry of result) {
    assert.ok(typeof entry.backward_pass_position === 'number');
    assert.ok(typeof entry.role === 'string');
    assert.ok(Array.isArray(entry.node_ids));
    assert.ok(typeof entry.is_synthesis === 'boolean');
  }
});

test('backward_pass_position values are sequential from 1', () => {
  const result = orderFromGraph(TWO_ROLE_GRAPH);
  result.forEach((entry, i) => {
    assert.strictEqual(entry.backward_pass_position, i + 1);
  });
});

// --- Two-role workflow ordering ---

test('two-role: last entry is synthesis role', () => {
  const result = orderFromGraph(TWO_ROLE_GRAPH);
  const last = result[result.length - 1];
  assert.strictEqual(last.is_synthesis, true);
  assert.strictEqual(last.role, 'Curator');
});

test('two-role: Owner findings before Curator synthesis', () => {
  const result = orderFromGraph(TWO_ROLE_GRAPH);
  // Expected: [Curator(findings), Owner(findings), Curator(synthesis)]
  // Reversed first occurrences: Curator(2→first), Owner(1→second); synthesis last
  const roles = result.map(e => `${e.role}${e.is_synthesis ? '(synthesis)' : ''}`);
  assert.deepStrictEqual(roles, ['Curator', 'Owner', 'Curator(synthesis)']);
});

test('two-role: synthesis node id is curator-phase-2-synthesis', () => {
  const result = orderFromGraph(TWO_ROLE_GRAPH);
  const synthesis = result.find(e => e.is_synthesis);
  assert.deepStrictEqual(synthesis!.node_ids, ['curator-phase-2-synthesis']);
});

// --- Four-role workflow ordering (matches addendum: TA, Developer, Owner, Curator-synthesis) ---

test('four-role: order matches addendum specification', () => {
  const result = orderFromGraph(FOUR_ROLE_GRAPH);
  // First occurrences: Owner(1), Curator(2), Developer(3), TA(4)
  // Reversed: [TA(4), Developer(3), Curator(2), Owner(1)]
  // Synthesis (Curator) removed from reversed list; appended last
  // → TA, Developer, Owner, Curator(synthesis)
  const roles = result.map(e => e.role);
  assert.deepStrictEqual(roles, ['Technical Architect', 'Tooling Developer', 'Owner', 'Curator']);
  assert.strictEqual(result[result.length - 1].is_synthesis, true);
});

// --- Fired node filtering ---

test('filtering: excludes roles with no fired nodes', () => {
  // Fire only Owner nodes — Curator should not appear in findings
  const firedIds = ['owner-phase-1'];
  const result = orderFromGraph(TWO_ROLE_GRAPH, firedIds);
  const nonSynthesisRoles = result.filter(e => !e.is_synthesis).map(e => e.role);
  assert.ok(!nonSynthesisRoles.includes('Curator'), 'Curator should not appear in findings');
  assert.ok(nonSynthesisRoles.includes('Owner'));
});

test('filtering: synthesis node excluded if not in fired list', () => {
  const firedIds = ['owner-phase-1', 'curator-phase-1'];
  const result = orderFromGraph(TWO_ROLE_GRAPH, firedIds);
  const hasSynthesis = result.some(e => e.is_synthesis);
  assert.strictEqual(hasSynthesis, false);
});

test('filtering: synthesis node included when in fired list', () => {
  const firedIds = ['owner-phase-1', 'curator-phase-2-synthesis'];
  const result = orderFromGraph(TWO_ROLE_GRAPH, firedIds);
  const hasSynthesis = result.some(e => e.is_synthesis);
  assert.strictEqual(hasSynthesis, true);
});

test('filtering: node_ids contains only fired nodes for that role', () => {
  // Curator fires in both phase-1 and phase-2-findings; fire only phase-1
  const firedIds = ['owner-phase-1', 'curator-phase-1', 'curator-phase-2-synthesis'];
  const result = orderFromGraph(TWO_ROLE_GRAPH, firedIds);
  const curatorFindings = result.find(e => e.role === 'Curator' && !e.is_synthesis);
  assert.ok(curatorFindings, 'Curator findings entry should exist');
  assert.deepStrictEqual(curatorFindings!.node_ids, ['curator-phase-1']);
});

// --- orderFromFile ---

test('orderFromFile: valid fixture returns ordered result', () => {
  const result = orderFromFile(path.join(FIXTURES, 'workflow-valid.md'));
  assert.ok(Array.isArray(result));
  assert.ok(result.length > 0);
  assert.strictEqual(result[result.length - 1].is_synthesis, true);
});

test('orderFromFile: throws on invalid workflow file', () => {
  assert.throws(
    () => orderFromFile(path.join(FIXTURES, 'workflow-invalid.md')),
    /validation failed/,
  );
});

test('orderFromFile: throws on file without frontmatter', () => {
  assert.throws(
    () => orderFromFile(path.join(FIXTURES, 'workflow-no-frontmatter.md')),
    /validation failed/,
  );
});

// --- Live workflow: verified against $A_SOCIETY_IMPROVEMENT ---
// Expected order per improvement/main.md:
//   1. Curator findings  2. Owner findings  3. Curator synthesis
// This matches: reversed first occurrences [Curator(2), Owner(1)]; synthesis (Curator) last.

test('live workflow: backward pass order matches improvement doc', () => {
  const result = orderFromFile(LIVE_WORKFLOW);
  const roles = result.map(e => `${e.role}${e.is_synthesis ? '(synthesis)' : ''}`);
  // Per improvement/main.md "Backward Pass Traversal":
  // 1. Curator produces findings first
  // 2. Owner produces findings second
  // 3. Curator synthesizes last
  assert.deepStrictEqual(roles, ['Curator', 'Owner', 'Curator(synthesis)'],
    `Expected [Curator, Owner, Curator(synthesis)], got ${JSON.stringify(roles)}`,
  );
});

test('live workflow: synthesis entry is Curator', () => {
  const result = orderFromFile(LIVE_WORKFLOW);
  const synthesis = result.find(e => e.is_synthesis);
  assert.ok(synthesis, 'synthesis entry not found');
  assert.strictEqual(synthesis!.role, 'Curator');
});

// --- generateTriggerPrompts ---

test('generateTriggerPrompts: returns array with trigger_prompt on each entry', () => {
  const order = orderFromGraph(TWO_ROLE_GRAPH);
  const result = generateTriggerPrompts(order);
  assert.ok(Array.isArray(result));
  assert.strictEqual(result.length, order.length);
  for (const entry of result) {
    assert.ok(typeof entry.trigger_prompt === 'string');
    assert.ok(entry.trigger_prompt.length > 0);
  }
});

test('generateTriggerPrompts: non-synthesis prompt uses "the" not "a"', () => {
  const order = orderFromGraph(TWO_ROLE_GRAPH);
  const result = generateTriggerPrompts(order);
  const nonSynthesis = result.find(e => !e.is_synthesis)!;
  assert.ok(nonSynthesis.trigger_prompt.startsWith('You are the '));
  assert.ok(!nonSynthesis.trigger_prompt.includes('You are a '));
});

test('generateTriggerPrompts: synthesis prompt uses "the" not "a"', () => {
  const order = orderFromGraph(TWO_ROLE_GRAPH);
  const result = generateTriggerPrompts(order);
  const synthesis = result.find(e => e.is_synthesis)!;
  assert.ok(synthesis.trigger_prompt.startsWith('You are the '));
  assert.ok(!synthesis.trigger_prompt.includes('You are a '));
});

test('generateTriggerPrompts: path has no leading slash', () => {
  const order = orderFromGraph(TWO_ROLE_GRAPH);
  const result = generateTriggerPrompts(order);
  for (const entry of result) {
    assert.ok(entry.trigger_prompt.includes('a-society/a-docs/agents.md'));
    assert.ok(!entry.trigger_prompt.includes('/a-society/a-docs/agents.md'));
  }
});

test('generateTriggerPrompts: non-synthesis with options includes flow and record folder', () => {
  const order = orderFromGraph(TWO_ROLE_GRAPH);
  const result = generateTriggerPrompts(order, { flowName: 'Test Flow', recordFolderPath: 'records/test' });
  const nonSynthesis = result.find(e => !e.is_synthesis)!;
  assert.ok(nonSynthesis.trigger_prompt.includes('Flow: Test Flow'));
  assert.ok(nonSynthesis.trigger_prompt.includes('Record folder: records/test'));
});

test('generateTriggerPrompts: synthesis with options includes flow and record folder', () => {
  const order = orderFromGraph(TWO_ROLE_GRAPH);
  const result = generateTriggerPrompts(order, { flowName: 'Test Flow', recordFolderPath: 'records/test' });
  const synthesis = result.find(e => e.is_synthesis)!;
  assert.ok(synthesis.trigger_prompt.includes('Flow: Test Flow'));
  assert.ok(synthesis.trigger_prompt.includes('Record folder: records/test'));
});

test('generateTriggerPrompts: options omission — no consecutive empty lines', () => {
  const order = orderFromGraph(TWO_ROLE_GRAPH);
  const result = generateTriggerPrompts(order);
  for (const entry of result) {
    assert.ok(!entry.trigger_prompt.includes('\n\n\n'),
      `Prompt for ${entry.role} contains consecutive empty lines`);
  }
});

test('generateTriggerPrompts: non-synthesis handoff names the next role', () => {
  const order = orderFromGraph(FOUR_ROLE_GRAPH);
  // Expected order: [TA, Developer, Owner, Curator(synthesis)]
  const result = generateTriggerPrompts(order);
  assert.ok(result[0].trigger_prompt.includes('hand off to Tooling Developer'));
  assert.ok(result[1].trigger_prompt.includes('hand off to Owner'));
  assert.ok(result[2].trigger_prompt.includes('hand off to Curator (synthesis)'));
});

test('generateTriggerPrompts: synthesis prompt contains synthesis-specific text', () => {
  const order = orderFromGraph(TWO_ROLE_GRAPH);
  const result = generateTriggerPrompts(order);
  const synthesis = result.find(e => e.is_synthesis)!;
  assert.ok(synthesis.trigger_prompt.includes('backward pass synthesis'));
  assert.ok(synthesis.trigger_prompt.includes('final step'));
});

test('generateTriggerPrompts: preserves all BackwardPassEntry fields', () => {
  const order = orderFromGraph(TWO_ROLE_GRAPH);
  const result = generateTriggerPrompts(order);
  for (let i = 0; i < order.length; i++) {
    assert.strictEqual(result[i].backward_pass_position, order[i].backward_pass_position);
    assert.strictEqual(result[i].role, order[i].role);
    assert.deepStrictEqual(result[i].node_ids, order[i].node_ids);
    assert.strictEqual(result[i].is_synthesis, order[i].is_synthesis);
  }
});

// --- orderWithPromptsFromFile ---

test('orderWithPromptsFromFile: returns trigger entries from valid file', () => {
  const result = orderWithPromptsFromFile(path.join(FIXTURES, 'workflow-valid.md'));
  assert.ok(Array.isArray(result));
  assert.ok(result.length > 0);
  for (const entry of result) {
    assert.ok(typeof entry.trigger_prompt === 'string');
    assert.ok(entry.trigger_prompt.length > 0);
  }
  assert.strictEqual(result[result.length - 1].is_synthesis, true);
});

test('orderWithPromptsFromFile: with options passes through to prompts', () => {
  const result = orderWithPromptsFromFile(
    path.join(FIXTURES, 'workflow-valid.md'),
    undefined,
    { flowName: 'My Flow' },
  );
  for (const entry of result) {
    assert.ok(entry.trigger_prompt.includes('My Flow'));
  }
});

// --- Summary ---

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
