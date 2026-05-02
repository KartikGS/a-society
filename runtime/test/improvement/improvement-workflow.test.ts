import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { BackwardPassPlan } from '../../src/framework-services/backward-pass-orderer.js';
import {
  buildImprovementWorkflowDocument,
  improvementNodeId,
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

const parallelPlan: BackwardPassPlan = [
  [
    {
      role: 'Owner',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: []
    },
    {
      role: 'Curator',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: []
    }
  ],
  [
    {
      role: 'A-Society Feedback',
      stepType: 'feedback',
      sessionInstruction: 'new-session',
      findingsRolesToInject: []
    }
  ]
];

const graphPlan: BackwardPassPlan = [
  [
    {
      role: 'Curator',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: []
    }
  ],
  [
    {
      role: 'Owner',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: ['Curator']
    }
  ],
  [
    {
      role: 'A-Society Feedback',
      stepType: 'feedback',
      sessionInstruction: 'new-session',
      findingsRolesToInject: []
    }
  ]
];

test('improvementNodeId uses role slug plus step type', () => {
  assert.strictEqual(improvementNodeId(parallelPlan[1][0]), 'a-society-feedback-feedback');
});

test('parallel improvement graph connects every role to feedback', () => {
  const doc = buildImprovementWorkflowDocument(parallelPlan, 'parallel');

  assert.strictEqual(doc.workflow.name, 'Parallel Improvement');
  assert.deepStrictEqual(doc.workflow.nodes.map(node => node.id), [
    'owner-meta-analysis',
    'curator-meta-analysis',
    'a-society-feedback-feedback'
  ]);
  assert.deepStrictEqual(doc.workflow.edges, [
    { from: 'owner-meta-analysis', to: 'a-society-feedback-feedback' },
    { from: 'curator-meta-analysis', to: 'a-society-feedback-feedback' }
  ]);
});

test('graph-based improvement graph follows backward-pass execution steps', () => {
  const doc = buildImprovementWorkflowDocument(graphPlan, 'graph-based');

  assert.strictEqual(doc.workflow.name, 'Graph-Based Improvement');
  assert.deepStrictEqual(doc.workflow.edges, [
    { from: 'curator-meta-analysis', to: 'owner-meta-analysis' },
    { from: 'owner-meta-analysis', to: 'a-society-feedback-feedback' }
  ]);
});

test('writeImprovementWorkflow persists improvement.yaml and readImprovementWorkflow reads it back', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-improvement-workflow-'));
  try {
    const filePath = writeImprovementWorkflow(tmpDir, parallelPlan, 'parallel');
    assert.strictEqual(path.basename(filePath), 'improvement.yaml');
    assert.ok(fs.existsSync(filePath), 'expected improvement.yaml to exist');

    const workflow = readImprovementWorkflow(tmpDir);
    assert.ok(workflow, 'expected workflow to be readable');
    assert.strictEqual(workflow?.nodes[0].step_index, 0);
    assert.strictEqual(workflow?.nodes[0].step_type, 'meta-analysis');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) process.exit(1);
