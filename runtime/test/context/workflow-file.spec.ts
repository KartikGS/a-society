import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveFlowWorkflow } from '../../src/context/workflow-file.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';

const tempDirs = new Set<string>();
const projectNamespace = 'test-project';

function createFixture() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-workflow-file-'));
  tempDirs.add(tmpDir);
  setWorkspaceRoot(tmpDir);
  const projectDir = path.join(tmpDir, projectNamespace);
  const recordDir = getFlowRecordDir({ projectNamespace, flowId: 'test-flow' });
  const workflowDir = path.join(projectDir, 'a-docs', 'workflow');
  fs.mkdirSync(recordDir, { recursive: true });
  fs.mkdirSync(workflowDir, { recursive: true });
  return { tmpDir, recordDir, workflowDir };
}

describe('workflow-file', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  it('merges canonical node contracts into a minimal record snapshot', () => {
    const { tmpDir, recordDir, workflowDir } = createFixture();
    fs.writeFileSync(path.join(workflowDir, 'main.yaml'), `workflow:
  name: canonical-flow
  nodes:
    - id: owner-intake
      role: owner
      work:
        - Use the canonical guidance.
    - id: owner-closure
      role: owner
  edges:
    - from: owner-intake
      to: owner-closure
`);

    fs.writeFileSync(path.join(recordDir, 'workflow.yaml'), `workflow:
  name: record-flow
  nodes:
    - id: owner-intake
      role: owner
    - id: owner-closure
      role: owner
  edges:
    - from: owner-intake
      to: owner-closure
`);

    const workflow = resolveFlowWorkflow(recordDir, tmpDir, projectNamespace);
    const ownerIntake = workflow.nodes.find((node) => node.id === 'owner-intake');

    expect(ownerIntake?.work).toEqual(['Use the canonical guidance.']);
    expect(workflow.name).toBe('record-flow');
    expect(workflow.edges).toEqual([{ from: 'owner-intake', to: 'owner-closure' }]);
  });

  it('falls back to the record snapshot when no canonical workflow exists', () => {
    const { tmpDir, recordDir } = createFixture();
    fs.writeFileSync(path.join(recordDir, 'workflow.yaml'), `workflow:
  name: record-only-flow
  nodes:
    - id: owner-intake
      role: owner
      work:
        - Use the record guidance.
  edges: []
`);

    const workflow = resolveFlowWorkflow(recordDir, tmpDir, projectNamespace);
    const ownerIntake = workflow.nodes.find((node) => node.id === 'owner-intake');

    expect(ownerIntake?.work).toEqual(['Use the record guidance.']);
    expect(workflow.name).toBe('record-only-flow');
  });
});
