import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CURRENT_FLOW_STATE_VERSION, type FlowRun } from '../../src/common/types.js';
import { HandoffParseError } from '../../src/orchestration/handoff.js';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';

const tempDirs = new Set<string>();

function createWorkspace(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.add(dir);
  setWorkspaceRoot(dir);
  return dir;
}

function scaffoldRole(workspaceRoot: string, projectNamespace: string, roleId: string): void {
  const roleDir = path.join(workspaceRoot, projectNamespace, 'a-docs', 'roles', roleId);
  fs.mkdirSync(roleDir, { recursive: true });
  fs.writeFileSync(path.join(roleDir, 'main.md'), `${roleId} role`);
  fs.writeFileSync(path.join(roleDir, 'ownership.yaml'), `role: ${roleId}\nsurfaces: []\n`);
  fs.writeFileSync(path.join(roleDir, 'required-readings.yaml'), `role: ${roleId}\nrequired_readings: []\n`);
}

function createFlowRun(
  workspaceRoot: string,
  projectNamespace: string,
  flowId: string,
  overrides: Partial<FlowRun> = {}
): FlowRun {
  const recordFolderPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });
  fs.mkdirSync(recordFolderPath, { recursive: true });
  return {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    visitedNodeIds: [],
    completedHandoffs: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    ...overrides,
  };
}

function setupProject(prefix: string) {
  const workspaceRoot = createWorkspace(prefix);
  const projectNamespace = 'test-project';
  const flowId = 'test-flow';
  const recordFolderPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });
  fs.mkdirSync(recordFolderPath, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');
  return { workspaceRoot, projectNamespace, flowId, recordFolderPath, ref: { projectNamespace, flowId } };
}

describe('handoff-transition-repair', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
  });

  it('accepts partial forward handoff and leaves remaining successors unresolved', async () => {
    const { workspaceRoot, projectNamespace, flowId, recordFolderPath, ref } = setupProject('a-society-handoff-transition-');
    const artifactPath = path.join(recordFolderPath, '01-owner.md');
    fs.writeFileSync(artifactPath, 'owner artifact');
    fs.writeFileSync(path.join(recordFolderPath, 'workflow.yaml'), `workflow:
  name: test-flow
  nodes:
    - id: owner-intake
      role: owner
    - id: branch-a
      role: curator_1
    - id: branch-b
      role: curator_2
  edges:
    - from: owner-intake
      to: branch-a
    - from: owner-intake
      to: branch-b
`);

    const flowRun = createFlowRun(workspaceRoot, projectNamespace, flowId, {
      runningNodes: ['owner-intake'],
      visitedNodeIds: ['owner-intake'],
    });
    SessionStore.saveFlowRun(flowRun, ref);

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    await orchestrator.applyHandoffAndAdvance(flowRun, 'owner-intake', 'owner', [
      {
        target_node_id: 'branch-a',
        artifact_path: path.relative(workspaceRoot, artifactPath),
      },
    ]);

    const updated = SessionStore.loadFlowRun(ref);
    expect(updated?.receivingHandoff['owner-intake=>branch-a']).toEqual([path.relative(workspaceRoot, artifactPath)]);
    expect(updated?.completedHandoffs).toContain('owner-intake=>branch-a');
    expect(updated?.completedHandoffs).not.toContain('owner-intake=>branch-b');
  });

  it('reports invalid target before missing artifact', async () => {
    const { workspaceRoot, projectNamespace, flowId, recordFolderPath, ref } = setupProject('a-society-handoff-target-precedence-');
    fs.writeFileSync(path.join(recordFolderPath, 'workflow.yaml'), `workflow:
  name: test-flow
  nodes:
    - id: owner-intake
      role: owner
    - id: branch-a
      role: curator_1
  edges:
    - from: owner-intake
      to: branch-a
`);

    const flowRun = createFlowRun(workspaceRoot, projectNamespace, flowId, {
      runningNodes: ['owner-intake'],
      visitedNodeIds: ['owner-intake'],
    });
    SessionStore.saveFlowRun(flowRun, ref);
    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());

    let error: unknown;
    try {
      await orchestrator.applyHandoffAndAdvance(flowRun, 'owner-intake', 'owner', [
        {
          target_node_id: 'missing-target',
          artifact_path: 'missing-artifact.md',
        },
      ]);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(HandoffParseError);
    expect(error).toMatchObject({
      details: {
        code: 'invalid_transition',
        modelRepairMessage: expect.stringContaining("Target node 'missing-target' not found"),
      },
    });
    expect((error as HandoffParseError).details.modelRepairMessage).not.toContain('missing-artifact.md');
  });

  it('applies mixed forward and backward handoffs edge-by-edge', async () => {
    const { workspaceRoot, projectNamespace, flowId, recordFolderPath, ref } = setupProject('a-society-mixed-handoff-');
    fs.writeFileSync(path.join(recordFolderPath, 'workflow.yaml'), `workflow:
  name: test-flow
  nodes:
    - id: source-a
      role: owner_1
    - id: source-b
      role: owner_2
    - id: current
      role: curator
    - id: sink
      role: owner_3
  edges:
    - from: source-a
      to: current
    - from: source-b
      to: current
    - from: current
      to: sink
`);

    const forwardArtifact = path.join(recordFolderPath, 'current-to-sink.md');
    const backwardArtifact = path.join(recordFolderPath, 'current-to-source-b.md');
    fs.writeFileSync(forwardArtifact, 'forward-ready output');
    fs.writeFileSync(backwardArtifact, 'source-b needs correction');

    const flowRun = createFlowRun(workspaceRoot, projectNamespace, flowId, {
      runningNodes: ['current'],
      visitedNodeIds: ['source-a', 'source-b', 'current'],
      completedHandoffs: ['source-a=>current', 'source-b=>current'],
      historyHandoff: {
        'source-a=>current': ['source-a.md'],
        'source-b=>current': ['source-b.md'],
      },
    });
    SessionStore.saveFlowRun(flowRun, ref);

    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    await orchestrator.applyHandoffAndAdvance(flowRun, 'current', 'curator', [
      {
        target_node_id: 'sink',
        artifact_path: path.relative(workspaceRoot, forwardArtifact),
      },
      {
        target_node_id: 'source-b',
        artifact_path: path.relative(workspaceRoot, backwardArtifact),
      },
    ]);

    const updated = SessionStore.loadFlowRun(ref);
    expect(updated?.receivingHandoff['current=>sink']).toEqual([path.relative(workspaceRoot, forwardArtifact)]);
    expect(updated?.receivingHandoff['current=>source-b']).toEqual([path.relative(workspaceRoot, backwardArtifact)]);
    expect(updated?.completedHandoffs).toContain('current=>sink');
    expect(updated?.completedHandoffs).toContain('source-a=>current');
    expect(updated?.completedHandoffs).not.toContain('source-b=>current');
    expect(updated?.awaitingHandoff).toContain('current');
    expect(sink.events).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'handoff.applied',
        targets: expect.arrayContaining([
          expect.objectContaining({ nodeId: 'sink' }),
          expect.objectContaining({ nodeId: 'source-b' }),
        ]),
      }),
    ]));
  });
});
