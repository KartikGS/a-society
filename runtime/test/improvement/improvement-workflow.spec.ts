import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { IMPROVEMENT_CHOICE_MODE } from '../../shared/protocol-constants.js';
import type { BackwardPassPlan } from '../../src/framework-services/backward-pass-orderer.js';
import {
  buildImprovementWorkflowDocument,
  readImprovementWorkflow,
  writeImprovementWorkflow,
} from '../../src/improvement/improvement-workflow.js';

const tempDirs = new Set<string>();

function createTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-improvement-workflow-'));
  tempDirs.add(dir);
  return dir;
}

const parallelPlan: BackwardPassPlan = {
  entries: [
    {
      role: 'curator',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: [],
    },
    {
      role: 'owner',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: ['curator'],
    },
    {
      role: 'a-society-feedback',
      stepType: 'feedback',
      sessionInstruction: 'new-session',
      findingsRolesToInject: [],
    },
  ],
  edges: [
    { from: 'curator', to: 'owner' },
    { from: 'owner', to: 'a-society-feedback' },
  ],
};

const graphPlan: BackwardPassPlan = {
  entries: [
    {
      role: 'curator',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: [],
    },
    {
      role: 'owner',
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: ['curator'],
    },
    {
      role: 'a-society-feedback',
      stepType: 'feedback',
      sessionInstruction: 'new-session',
      findingsRolesToInject: [],
    },
  ],
  edges: [
    { from: 'curator', to: 'owner' },
    { from: 'owner', to: 'a-society-feedback' },
  ],
};

describe('improvement-workflow', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
  });

  it('connects non-Owner roles to Owner before feedback in parallel improvement graph', () => {
    const doc = buildImprovementWorkflowDocument(parallelPlan, IMPROVEMENT_CHOICE_MODE.PARALLEL);

    expect(doc.workflow.name).toBe('Parallel Improvement');
    expect(doc.workflow.nodes.map((node) => node.id)).toEqual([
      'curator',
      'owner',
      'a-society-feedback',
    ]);
    expect(doc.workflow.edges).toEqual([
      { from: 'curator', to: 'owner' },
      { from: 'owner', to: 'a-society-feedback' },
    ]);
  });

  it('follows backward-pass execution steps in graph-based improvement graph', () => {
    const doc = buildImprovementWorkflowDocument(graphPlan, IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);

    expect(doc.workflow.name).toBe('Graph-Based Improvement');
    expect(doc.workflow.edges).toEqual([
      { from: 'curator', to: 'owner' },
      { from: 'owner', to: 'a-society-feedback' },
    ]);
  });

  it('persists improvement.yaml and reads it back', () => {
    const tmpDir = createTempDir();

    const filePath = writeImprovementWorkflow(tmpDir, parallelPlan, IMPROVEMENT_CHOICE_MODE.PARALLEL);
    const workflow = readImprovementWorkflow(tmpDir);

    expect(path.basename(filePath)).toBe('improvement.yaml');
    expect(fs.existsSync(filePath)).toBe(true);
    expect(workflow?.nodes[0].step_type).toBe('meta-analysis');
  });
});
