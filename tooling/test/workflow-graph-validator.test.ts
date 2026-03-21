import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateWorkflowFile, validateGraph } from '../src/workflow-graph-validator.js';
import { extractFrontmatter } from '../src/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const LIVE_WORKFLOW = path.join(REPO_ROOT, 'a-society', 'a-docs', 'workflow', 'framework-development.md');
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

test('extracts frontmatter from valid file', () => {
  const content = '---\nkey: value\n---\n# Title\n';
  const result = extractFrontmatter(content);
  assert.strictEqual(result, 'key: value');
});

test('returns null when no frontmatter present', () => {
  const result = extractFrontmatter('# No frontmatter here\n');
  assert.strictEqual(result, null);
});

test('valid graph passes validation', () => {
  const graph = {
    workflow: {
      name: 'Test',
      nodes: [
        { id: 'n1', role: 'Owner' },
        { id: 'n2', role: 'Curator' },
      ],
      edges: [{ from: 'n1', to: 'n2', artifact: 'handoff' }],
    },
  };
  const errors = validateGraph(graph);
  assert.deepStrictEqual(errors, []);
});

test('missing workflow key produces error', () => {
  const errors = validateGraph({ other: 'value' });
  assert.ok(errors.some((e: string) => e.includes('workflow')));
});

test('duplicate node id produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'n1', role: 'R' },
        { id: 'n1', role: 'S' },
      ],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some((e: string) => e.includes('not unique') && e.includes('n1')));
});

test('edge referencing non-existent node produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'R' }],
      edges: [{ from: 'n1', to: 'nonexistent' }],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some((e: string) => e.includes('nonexistent') && e.includes('does not match any node id')));
});

test('extra keys on node produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'R', invalid: 'key' }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some((e: string) => e.includes('invalid keys: invalid')));
});

test('valid node with human-collaborative passes', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'R', 'human-collaborative': 'direction' }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.deepStrictEqual(errors, []);
});

test('non-string human-collaborative value is rejected', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'R', 'human-collaborative': 42 }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(
    errors.some((e: string) =>
      e.includes('workflow.nodes[0].human-collaborative must be a non-empty string if present')
    )
  );
});

test('empty or whitespace human-collaborative value is rejected', () => {
  const emptyValueGraph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'R', 'human-collaborative': '' }],
      edges: [],
    },
  };
  const whitespaceValueGraph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'R', 'human-collaborative': '   ' }],
      edges: [],
    },
  };

  const emptyErrors = validateGraph(emptyValueGraph);
  const whitespaceErrors = validateGraph(whitespaceValueGraph);

  assert.ok(
    emptyErrors.some((e: string) =>
      e.includes('workflow.nodes[0].human-collaborative must be a non-empty string if present')
    )
  );
  assert.ok(
    whitespaceErrors.some((e: string) =>
      e.includes('workflow.nodes[0].human-collaborative must be a non-empty string if present')
    )
  );
});

test('unknown node keys still fail after allowing human-collaborative', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        {
          id: 'n1',
          role: 'R',
          'human-collaborative': 'decision',
          invalid: 'key',
        },
      ],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  assert.ok(errors.some((e: string) => e.includes('invalid keys: invalid')));
});

test('existing workflow document without human-collaborative remains valid', () => {
  const result = validateWorkflowFile(path.join(FIXTURES, 'workflow-valid.md'));
  assert.strictEqual(result.valid, true, `Expected backward compatibility, got errors: ${result.errors.join('; ')}`);
});

test('valid fixture file passes', () => {
  const result = validateWorkflowFile(path.join(FIXTURES, 'workflow-valid.md'));
  assert.strictEqual(result.valid, true, `Expected valid, got errors: ${result.errors.join('; ')}`);
});

test('file without frontmatter fails', () => {
  const result = validateWorkflowFile(path.join(FIXTURES, 'workflow-no-frontmatter.md'));
  assert.strictEqual(result.valid, false);
});

test('live A-Society workflow passes validation', () => {
  const result = validateWorkflowFile(LIVE_WORKFLOW);
  assert.strictEqual(result.valid, true, `Live workflow invalid:\n${result.errors.map(e => '  ' + e).join('\n')}`);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
