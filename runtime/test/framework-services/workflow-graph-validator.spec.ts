import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import {
  validateWorkflowFile,
  validateGraph,
  buildWorkflowRepairGuidance,
  type WorkflowStateValidationInput,
} from '../../src/framework-services/workflow-graph-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOCIETY_ROOT = path.resolve(__dirname, '..', '..', '..');
const LIVE_WORKFLOWS = [
  path.join(SOCIETY_ROOT, 'a-docs', 'workflow', 'main.yaml'),
];
const FIXTURES = path.join(__dirname, 'fixtures');

function flowState(overrides: Partial<WorkflowStateValidationInput> = {}): WorkflowStateValidationInput {
  return {
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    visitedNodeIds: [],
    completedHandoffs: [],
    receivingHandoff: {},
    awaitingHandoff: [],
    ...overrides,
  };
}

it('valid graph passes validation', () => {
  const graph = {
    workflow: {
      name: 'Test',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'n2', role: 'curator' },
        { id: 'owner-close', role: 'owner' },
      ],
      edges: [
        { from: 'owner-intake', to: 'n2', artifact: 'handoff' },
        { from: 'n2', to: 'owner-close', artifact: 'completion' },
      ],
    },
  };
  const errors = validateGraph(graph);
  expect(errors).toEqual([]);
});

it('missing workflow key produces error', () => {
  const errors = validateGraph({ other: 'value' });
  expect(errors.some((e: string) => e.includes('workflow'))).toBeTruthy();
});

it('duplicate node id produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'n1', role: 'role-r' },
        { id: 'n1', role: 'role-s' },
      ],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('not unique') && e.includes('n1'))).toBeTruthy();
});

it('edge referencing non-existent node produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'role-r' }],
      edges: [{ from: 'n1', to: 'nonexistent' }],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('nonexistent') && e.includes('does not match any node id'))).toBeTruthy();
});

it('extra keys on node produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'role-r', invalid: 'key' }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('invalid keys: invalid'))).toBeTruthy();
});

it('extra keys on workflow produce error', () => {
  const graph = {
    workflow: {
      name: 'T',
      graph: 'single-instance',
      nodes: [{ id: 'n1', role: 'owner' }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('workflow contains invalid keys: graph'))).toBeTruthy();
});

it('runtime workflow contract omits unsupported legacy workflow keys', () => {
  const contract = fs.readFileSync(path.join(SOCIETY_ROOT, 'runtime', 'contracts', 'workflow.md'), 'utf8');
  for (const key of ['use_when', 'companion_docs', 'session_model', 'forward_pass_closure']) {
    expect(contract.includes(`${key}:`)).toBeFalsy();
  }
});

it('valid node with human-collaborative passes', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'owner-intake', role: 'owner', 'human-collaborative': 'direction' }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  expect(errors).toEqual([]);
});

it('role display names are rejected', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'Owner' }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('Invalid role id "Owner"'))).toBeTruthy();
});

it('role ids with leading or trailing whitespace are rejected', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: ' owner' },
        { id: 'owner-close', role: 'owner ' },
      ],
      edges: [{ from: 'owner-intake', to: 'owner-close' }],
    },
  };
  const errors = validateGraph(graph);
  expect(errors).toContain('workflow.nodes[0].role must not include leading or trailing whitespace');
  expect(errors).toContain('workflow.nodes[1].role must not include leading or trailing whitespace');
});

it('node-level workflow guidance fields pass when well-formed', () => {
  const graph = {
    workflow: {
      name: 'T',
      summary: 'Test workflow',
      nodes: [{
        id: 'owner-intake',
        role: 'owner',
        required_readings: ['$DOC_A'],
        guidance: ['Use the snapshot.'],
        inputs: ['Prior artifact'],
        work: ['Perform the review'],
        outputs: ['Decision artifact'],
        transitions: ['Approved -> next-node'],
        notes: ['First-entry only']
      }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  expect(errors).toEqual([]);
});

it('non-string human-collaborative value is rejected', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'role-r', 'human-collaborative': 42 }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  expect(
    errors.some((e: string) =>
      e.includes('workflow.nodes[0].human-collaborative must be a non-empty string if present')
    )
  ).toBeTruthy();
});

it('empty or whitespace human-collaborative value is rejected', () => {
  const emptyValueGraph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'role-r', 'human-collaborative': '' }],
      edges: [],
    },
  };
  const whitespaceValueGraph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'n1', role: 'role-r', 'human-collaborative': '   ' }],
      edges: [],
    },
  };

  const emptyErrors = validateGraph(emptyValueGraph);
  const whitespaceErrors = validateGraph(whitespaceValueGraph);

  expect(
    emptyErrors.some((e: string) =>
      e.includes('workflow.nodes[0].human-collaborative must be a non-empty string if present')
    )
  ).toBeTruthy();
  expect(
    whitespaceErrors.some((e: string) =>
      e.includes('workflow.nodes[0].human-collaborative must be a non-empty string if present')
    )
  ).toBeTruthy();
});

it('unknown node keys still fail after allowing human-collaborative', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        {
          id: 'n1',
          role: 'role-r',
          'human-collaborative': 'decision',
          invalid: 'key',
        },
      ],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('invalid keys: invalid'))).toBeTruthy();
});

it('existing workflow document without human-collaborative remains valid', () => {
  const result = validateWorkflowFile(path.join(FIXTURES, 'workflow-valid.yaml'));
  expect(result.valid).toBe(true);
});

it('valid fixture file passes', () => {
  const result = validateWorkflowFile(path.join(FIXTURES, 'workflow-valid.yaml'));
  expect(result.valid).toBe(true);
});

it('file without frontmatter fails', () => {
  const result = validateWorkflowFile(path.join(FIXTURES, 'workflow-no-frontmatter.yaml'));
  expect(result.valid).toBe(false);
});

it('neighboring same-role-instance nodes pass', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'n2', role: 'owner' },
      ],
      edges: [{ from: 'owner-intake', to: 'n2' }],
    },
  };
  const errors = validateGraph(graph);
  expect(errors).toEqual([]);
});

it('neighboring numbered role instances with the same base role pass', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'n2', role: 'owner_2' },
        { id: 'owner-close', role: 'owner' },
      ],
      edges: [
        { from: 'owner-intake', to: 'n2' },
        { from: 'n2', to: 'owner-close' },
      ],
    },
  };
  const errors = validateGraph(graph);
  expect(errors).toEqual([]);
});

it('non-Owner start node produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'curator' },
        { id: 'n2', role: 'owner' },
      ],
      edges: [{ from: 'owner-intake', to: 'n2' }],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('Start node "owner-intake" must have role "owner"'))).toBeTruthy();
});

it('first node must be owner-intake', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-start', role: 'owner' },
        { id: 'owner-close', role: 'owner' },
      ],
      edges: [{ from: 'owner-start', to: 'owner-close' }],
    },
  };
  const errors = validateGraph(graph);
  expect(
    errors.some((e: string) =>
      e.includes('workflow.nodes[0].id must be exactly "owner-intake"')
    )
  ).toBeTruthy();
});

it('multiple start nodes produce error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'n2', role: 'owner' },
        { id: 'n3', role: 'curator' },
      ],
      edges: [{ from: 'owner-intake', to: 'n3' }],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('Workflow must have exactly one start node (found 2)'))).toBeTruthy();
});

it('non-Owner end node produces error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'n2', role: 'curator' },
      ],
      edges: [{ from: 'owner-intake', to: 'n2' }],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('End node "n2" must have role "owner"'))).toBeTruthy();
});

it('sole node must be owner', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'owner-intake', role: 'curator' }],
      edges: [],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('Sole node role must be exactly "owner"'))).toBeTruthy();
});

it('valid owner-bounded graph passes', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'n2', role: 'curator' },
        { id: 'n3', role: 'owner' },
      ],
      edges: [
        { from: 'owner-intake', to: 'n2' },
        { from: 'n2', to: 'n3' },
      ],
    },
  };
  const errors = validateGraph(graph);
  expect(errors).toEqual([]);
});

it('cyclic graph produces acyclic validation error', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'curator-a', role: 'curator' },
        { id: 'curator-b', role: 'curator_2' },
        { id: 'owner-close', role: 'owner' },
      ],
      edges: [
        { from: 'owner-intake', to: 'curator-a' },
        { from: 'curator-a', to: 'curator-b' },
        { from: 'curator-b', to: 'curator-a' },
        { from: 'curator-b', to: 'owner-close' },
      ],
    },
  };
  const errors = validateGraph(graph);
  expect(
    errors.some((e: string) =>
      e.includes('Workflow graph must be acyclic') &&
      e.includes('curator-a -> curator-b -> curator-a')
    )
  ).toBeTruthy();
});

it('numbered Owner instances at start/end produce errors', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner_1' },
        { id: 'n2', role: 'curator' },
        { id: 'n3', role: 'owner_2' },
      ],
      edges: [
        { from: 'owner-intake', to: 'n2' },
        { from: 'n2', to: 'n3' },
      ],
    },
  };
  const errors = validateGraph(graph);
  expect(errors.some((e: string) => e.includes('Start node "owner-intake" must have role "owner"'))).toBeTruthy();
  expect(errors.some((e: string) => e.includes('End node "n3" must have role "owner"'))).toBeTruthy();
});

it('state-aware validation accepts preserved active flow state', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'curator-work', role: 'curator' },
        { id: 'owner-close', role: 'owner' },
      ],
      edges: [
        { from: 'owner-intake', to: 'curator-work' },
        { from: 'curator-work', to: 'owner-close' },
      ],
    },
  };
  const errors = validateGraph(graph, undefined, flowState({
    visitedNodeIds: ['owner-intake'],
    completedHandoffs: ['owner-intake=>curator-work'],
    receivingHandoff: {
      'owner-intake=>curator-work': ['record/brief.md'],
    },
  }));
  expect(errors).toEqual([]);
});

it('state-aware validation rejects nodes removed from active flow state', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'owner-intake', role: 'owner' }],
      edges: [],
    },
  };
  const errors = validateGraph(graph, undefined, flowState({
    runningNodes: ['missing-running'],
    awaitingHumanNodes: {
      'missing-awaiting': { role: 'owner', reason: 'prompt-human' },
    },
    pendingHumanInputs: {
      'missing-pending': { text: 'reply', receivedAt: '2026-05-31T00:00:00.000Z' },
    },
    visitedNodeIds: ['missing-visited'],
    awaitingHandoff: ['missing-awaiting-handoff'],
  }));

  expect(errors.some((e: string) => e.includes('"missing-running"') && e.includes('runningNodes'))).toBeTruthy();
  expect(errors.some((e: string) => e.includes('"missing-awaiting"') && e.includes('awaitingHumanNodes'))).toBeTruthy();
  expect(errors.some((e: string) => e.includes('"missing-pending"') && e.includes('pendingHumanInputs'))).toBeTruthy();
  expect(errors.some((e: string) => e.includes('"missing-visited"') && e.includes('visitedNodeIds'))).toBeTruthy();
  expect(errors.some((e: string) => e.includes('"missing-awaiting-handoff"') && e.includes('awaitingHandoff'))).toBeTruthy();
});

it('state-aware validation rejects orphaned handoff edge state', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'curator-work', role: 'curator' },
        { id: 'owner-close', role: 'owner' },
      ],
      edges: [
        { from: 'owner-intake', to: 'curator-work' },
        { from: 'curator-work', to: 'owner-close' },
      ],
    },
  };
  const errors = validateGraph(graph, undefined, flowState({
    completedHandoffs: ['owner-intake=>owner-close'],
    receivingHandoff: {
      'owner-close=>owner-intake': ['record/backward.md'],
    },
  }));

  expect(
    errors.some((e: string) =>
      e.includes('completedHandoffs contains "owner-intake=>owner-close"')
    )
  ).toBeTruthy();
  expect(
    errors.some((e: string) =>
      e.includes('receivingHandoff contains "owner-close=>owner-intake"')
    )
  ).toBeTruthy();
});

it('state-aware validation allows backward receiving handoff along an existing forward edge', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'curator-work', role: 'curator' },
        { id: 'owner-close', role: 'owner' },
      ],
      edges: [
        { from: 'owner-intake', to: 'curator-work' },
        { from: 'curator-work', to: 'owner-close' },
      ],
    },
  };
  const errors = validateGraph(graph, undefined, flowState({
    receivingHandoff: {
      'curator-work=>owner-intake': ['record/backward.md'],
    },
  }));
  expect(errors).toEqual([]);
});

it('state-aware validation rejects awaiting-human role changes', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [{ id: 'owner-intake', role: 'owner' }],
      edges: [],
    },
  };
  const errors = validateGraph(graph, undefined, flowState({
    awaitingHumanNodes: {
      'owner-intake': { role: 'curator', reason: 'prompt-human' },
    },
  }));
  expect(
    errors.some((e: string) =>
      e.includes('awaitingHumanNodes references node "owner-intake" with role "curator"')
    )
  ).toBeTruthy();
});

it('state-aware validation rejects impossible awaiting-handoff waits', () => {
  const graph = {
    workflow: {
      name: 'T',
      nodes: [
        { id: 'owner-intake', role: 'owner' },
        { id: 'owner-close', role: 'owner' },
      ],
      edges: [{ from: 'owner-intake', to: 'owner-close' }],
    },
  };
  const errors = validateGraph(graph, undefined, flowState({
    awaitingHandoff: ['owner-intake'],
  }));
  expect(
    errors.some((e: string) =>
      e.includes('awaitingHandoff contains "owner-intake"') &&
      e.includes('has no inbound edge')
    )
  ).toBeTruthy();
});

it('live A-Society workflows pass validation', () => {
  for (const workflowPath of LIVE_WORKFLOWS) {
    const result = validateWorkflowFile(workflowPath);
    expect(result.valid, `Live workflow ${path.basename(workflowPath)} invalid:\n${result.errors.map(e => '  ' + e).join('\n')}`).toBe(true);
  }
});

it('buildWorkflowRepairGuidance: schema errors produce Workflow schema invalid summary', () => {
  const errors = ['workflow.nodes[0].id must be a non-empty string', 'workflow.name must be a non-empty string'];
  const guidance = buildWorkflowRepairGuidance(errors);
  expect(guidance.operatorSummary).toBe('Workflow schema invalid');
  expect(guidance.modelRepairMessage.includes('workflow.nodes[0].id')).toBeTruthy();
});

it('buildWorkflowRepairGuidance: YAML parse errors produce Workflow parse failure summary', () => {
  const errors = ['YAML parse error: unexpected token'];
  const guidance = buildWorkflowRepairGuidance(errors);
  expect(guidance.operatorSummary).toBe('Workflow parse failure');
  expect(guidance.modelRepairMessage.includes('YAML parse error')).toBeTruthy();
});

it('buildWorkflowRepairGuidance: model repair message does not contain description field', () => {
  const errors = ['workflow.nodes[0].id must be a non-empty string'];
  const guidance = buildWorkflowRepairGuidance(errors);
  expect(guidance.modelRepairMessage.includes('description'),
    'model repair message must not mention "description" field — this is the anti-drift test').toBeFalsy();
});

it('buildWorkflowRepairGuidance: model repair message mentions all live schema node keys', () => {
  const errors = ['workflow.name must be a non-empty string'];
  const guidance = buildWorkflowRepairGuidance(errors);
  expect(guidance.modelRepairMessage.includes('id:')).toBeTruthy();
  expect(guidance.modelRepairMessage.includes('role:')).toBeTruthy();
  expect(guidance.modelRepairMessage.includes('human-collaborative:')).toBeTruthy();
});

it('buildWorkflowRepairGuidance: model repair message mentions live schema edge keys', () => {
  const errors = ['workflow.edges[0].from must be a non-empty string'];
  const guidance = buildWorkflowRepairGuidance(errors);
  expect(guidance.modelRepairMessage.includes('from:')).toBeTruthy();
  expect(guidance.modelRepairMessage.includes('to:')).toBeTruthy();
  expect(guidance.modelRepairMessage.includes('artifact:')).toBeTruthy();
});
