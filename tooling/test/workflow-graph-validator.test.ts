import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateWorkflowFile, validateGraph, extractFrontmatter } from '../src/workflow-graph-validator.js';

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

console.log('\nworkflow-graph-validator');

// --- extractFrontmatter ---

test('extracts frontmatter from valid file', () => {
  const content = '---\nkey: value\n---\n# Title\n';
  const result = extractFrontmatter(content);
  assert.strictEqual(result, 'key: value');
});

test('returns null when no frontmatter present', () => {
  const result = extractFrontmatter('# No frontmatter here\n');
  assert.strictEqual(result, null);
});

test('handles CRLF line endings in frontmatter', () => {
  const content = '---\r\nkey: value\r\n---\r\n# Title\r\n';
  const result = extractFrontmatter(content);
  assert.ok(result !== null);
});

// --- validateGraph (unit tests with synthetic graphs) ---

test('valid graph passes validation', () => {
  const graph = {
    workflow: {
      name: 'Test',
      phases: [{ id: 'p1', name: 'Phase 1' }],
      nodes: [
        { id: 'n1', role: 'Owner', phase: 'p1', first_occurrence_position: 1, is_synthesis_role: false },
        { id: 'n2', role: 'Curator', phase: 'p1', first_occurrence_position: 2, is_synthesis_role: true },
      ],
      edges: [{ from: 'n1', to: 'n2', artifact: 'handoff' }],
    },
  };
  const errors = validateGraph(graph);
  assert.deepStrictEqual(errors, []);
});

test('missing workflow key produces error', () => {
  const errors = validateGraph({ other: 'value' });
  assert.ok(errors.some(e => e.includes('workflow')));
});

test('empty phases array produces error', () => {
  const graph = { workflow: { name: 'T', phases: [], nodes: [], edges: [] } };
  const errors = validateGraph(graph);
  assert.ok(errors.some(e => e.includes('phases')));
});

test('duplicate phase id produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      phases: [{ id: 'p1', name: 'A' }, { id: 'p1', name: 'B' }],
      nodes: [{ id: 'n1', role: 'R', phase: 'p1', first_occurrence_position: 1, is_synthesis_role: true }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some(e => e.includes('not unique') && e.includes('p1')));
});

test('duplicate node id produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      phases: [{ id: 'p1', name: 'A' }],
      nodes: [
        { id: 'n1', role: 'R', phase: 'p1', first_occurrence_position: 1, is_synthesis_role: false },
        { id: 'n1', role: 'S', phase: 'p1', first_occurrence_position: 2, is_synthesis_role: true },
      ],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some(e => e.includes('not unique') && e.includes('n1')));
});

test('node phase referencing non-existent phase id produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      phases: [{ id: 'p1', name: 'A' }],
      nodes: [
        { id: 'n1', role: 'R', phase: 'p1', first_occurrence_position: 1, is_synthesis_role: false },
        { id: 'n2', role: 'S', phase: 'bad-phase', first_occurrence_position: 2, is_synthesis_role: true },
      ],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some(e => e.includes('bad-phase') && e.includes('does not match any phase id')));
});

test('non-positive first_occurrence_position produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      phases: [{ id: 'p1', name: 'A' }],
      nodes: [
        { id: 'n1', role: 'R', phase: 'p1', first_occurrence_position: 0, is_synthesis_role: false },
        { id: 'n2', role: 'S', phase: 'p1', first_occurrence_position: 1, is_synthesis_role: true },
      ],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some(e => e.includes('first_occurrence_position')));
});

test('zero synthesis nodes produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      phases: [{ id: 'p1', name: 'A' }],
      nodes: [{ id: 'n1', role: 'R', phase: 'p1', first_occurrence_position: 1, is_synthesis_role: false }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some(e => e.includes('synthesis') && e.includes('0')));
});

test('multiple synthesis nodes produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      phases: [{ id: 'p1', name: 'A' }],
      nodes: [
        { id: 'n1', role: 'R', phase: 'p1', first_occurrence_position: 1, is_synthesis_role: true },
        { id: 'n2', role: 'S', phase: 'p1', first_occurrence_position: 2, is_synthesis_role: true },
      ],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some(e => e.includes('synthesis') && e.includes('2')));
});

test('edge referencing non-existent node produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      phases: [{ id: 'p1', name: 'A' }],
      nodes: [{ id: 'n1', role: 'R', phase: 'p1', first_occurrence_position: 1, is_synthesis_role: true }],
      edges: [{ from: 'n1', to: 'nonexistent' }],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some(e => e.includes('nonexistent') && e.includes('does not match any node id')));
});

// --- validateWorkflowFile ---

test('valid fixture file passes', () => {
  const result = validateWorkflowFile(path.join(FIXTURES, 'workflow-valid.md'));
  assert.strictEqual(result.valid, true, `Expected valid, got errors: ${result.errors.join('; ')}`);
  assert.deepStrictEqual(result.errors, []);
});

test('file without frontmatter fails', () => {
  const result = validateWorkflowFile(path.join(FIXTURES, 'workflow-no-frontmatter.md'));
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('frontmatter')));
});

test('invalid fixture file fails with multiple errors', () => {
  const result = validateWorkflowFile(path.join(FIXTURES, 'workflow-invalid.md'));
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.length > 1, `Expected multiple errors, got: ${result.errors.join('; ')}`);
});

test('unreadable file returns error', () => {
  const result = validateWorkflowFile('/nonexistent/workflow.md');
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors[0].includes('Cannot read file'));
});

// --- Live workflow validation ---

test('live A-Society workflow passes validation', () => {
  const result = validateWorkflowFile(LIVE_WORKFLOW);
  assert.strictEqual(result.valid, true, `Live workflow invalid:\n${result.errors.map(e => '  ' + e).join('\n')}`);
});

// --- Summary ---

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
