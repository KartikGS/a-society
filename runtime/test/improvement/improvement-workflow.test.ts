import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { IMPROVEMENT_CHOICE_MODE } from '../../src/common/protocol-constants.js';
import type { BackwardPassPlan } from '../../src/framework-services/backward-pass-orderer.js';
import {
  buildImprovementWorkflowDocument,
  readImprovementWorkflow,
  writeImprovementWorkflow
} from '../../src/improvement/improvement-workflow.js';

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

console.log('\nimprovement-workflow');

const parallelPlan: BackwardPassPlan = {
  entries: [
    {
      role: 'curator',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: []
    },
    {
      role: 'owner',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: ['curator']
    },
    {
      role: 'a-society-feedback',
      stepType: 'feedback',
      sessionInstruction: 'new-session',
      findingsRolesToInject: []
    }
  ],
  edges: [
    { from: 'curator', to: 'owner' },
    { from: 'owner', to: 'a-society-feedback' }
  ]
};

const graphPlan: BackwardPassPlan = {
  entries: [
    {
      role: 'curator',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: []
    },
    {
      role: 'owner',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: ['curator']
    },
    {
      role: 'a-society-feedback',
      stepType: 'feedback',
      sessionInstruction: 'new-session',
      findingsRolesToInject: []
    }
  ],
  edges: [
    { from: 'curator', to: 'owner' },
    { from: 'owner', to: 'a-society-feedback' }
  ]
};

test('parallel improvement graph connects non-Owner roles to Owner before feedback', () => {
  const doc = buildImprovementWorkflowDocument(parallelPlan, IMPROVEMENT_CHOICE_MODE.PARALLEL);

  assert.strictEqual(doc.workflow.name, 'Parallel Improvement');
  assert.deepStrictEqual(doc.workflow.nodes.map(node => node.id), [
    'curator',
    'owner',
    'a-society-feedback'
  ]);
  assert.deepStrictEqual(doc.workflow.edges, [
    { from: 'curator', to: 'owner' },
    { from: 'owner', to: 'a-society-feedback' }
  ]);
});

test('graph-based improvement graph follows backward-pass execution steps', () => {
  const doc = buildImprovementWorkflowDocument(graphPlan, IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);

  assert.strictEqual(doc.workflow.name, 'Graph-Based Improvement');
  assert.deepStrictEqual(doc.workflow.edges, [
    { from: 'curator', to: 'owner' },
    { from: 'owner', to: 'a-society-feedback' }
  ]);
});

test('writeImprovementWorkflow persists improvement.yaml and readImprovementWorkflow reads it back', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-improvement-workflow-'));
  try {
    const filePath = writeImprovementWorkflow(tmpDir, parallelPlan, IMPROVEMENT_CHOICE_MODE.PARALLEL);
    assert.strictEqual(path.basename(filePath), 'improvement.yaml');
    assert.ok(fs.existsSync(filePath), 'expected improvement.yaml to exist');

    const workflow = readImprovementWorkflow(tmpDir);
    assert.ok(workflow, 'expected workflow to be readable');
    assert.strictEqual(workflow?.nodes[0].step_type, 'meta-analysis');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) process.exit(1);
