import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { parseWorkflowFile } from '../../src/context/workflow-file.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';
import { initializeDraftFlow } from '../../src/projects/draft-flow.js';
import { readRecordMetadata, syncRecordMetadataFromWorkflow } from '../../src/projects/record-metadata.js';

const tempDirs = new Set<string>();
const projectNamespace = 'test-project';

function createWorkspace(): string {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-draft-flow-'));
  tempDirs.add(workspaceRoot);
  const projectRoot = path.join(workspaceRoot, projectNamespace);
  fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles', 'owner'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'a-docs', 'indexes'), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, 'a-docs', 'roles', 'owner', 'required-readings.yaml'), 'role: owner\nrequired_readings: []\n');
  fs.writeFileSync(path.join(projectRoot, 'a-docs', 'indexes', 'main.md'), '');
  setWorkspaceRoot(workspaceRoot);
  SessionStore.init();
  return workspaceRoot;
}

describe('draft-flow', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
  });

  it('creates an opaque-id record folder, record metadata, and single Owner node workflow', () => {
    const workspaceRoot = createWorkspace();

    const flow = initializeDraftFlow(workspaceRoot, projectNamespace, 'owner');

    expect(flow.recordFolderPath).toBe(getFlowRecordDir(workspaceRoot, { projectNamespace, flowId: flow.flowId }));
    expect(path.basename(flow.recordFolderPath)).toBe('record');
    expect(path.basename(path.dirname(flow.recordFolderPath))).toBe(flow.flowId);
    expect(flow.runningNodes).toEqual(['owner-intake']);
    expect(flow.status).toBe('running');

    const metadata = readRecordMetadata(flow.recordFolderPath);
    expect(metadata).toBeTruthy();
    expect(metadata?.name).toBeUndefined();
    expect(metadata?.summary).toBeUndefined();
    expect(fs.readFileSync(path.join(flow.recordFolderPath, 'record.yaml'), 'utf8')).not.toContain('id:');

    const workflowPath = path.join(flow.recordFolderPath, 'workflow.yaml');
    expect(fs.existsSync(workflowPath)).toBe(true);
    expect(parseWorkflowFile(workflowPath)).toMatchObject({
      workflow: {
        nodes: [
          { id: 'owner-intake', role: 'owner' },
        ],
      },
    });
  });

  it('seeds name and summary once from workflow.yaml', () => {
    const workspaceRoot = createWorkspace();
    const flow = initializeDraftFlow(workspaceRoot, projectNamespace, 'owner');
    const workflowPath = path.join(flow.recordFolderPath, 'workflow.yaml');

    fs.writeFileSync(workflowPath, `workflow:
  name: Record Metadata Sync
  summary: Capture a durable title and summary from workflow.yaml.
  nodes:
    - id: owner-intake
      role: owner
  edges: []
`, 'utf8');

    const firstSync = syncRecordMetadataFromWorkflow(flow.recordFolderPath);
    expect(firstSync.name).toBe('Record Metadata Sync');
    expect(firstSync.summary).toBe('Capture a durable title and summary from workflow.yaml.');

    fs.writeFileSync(workflowPath, `workflow:
  name: Different Name
  summary: Different summary.
  nodes:
    - id: owner-intake
      role: owner
  edges: []
`, 'utf8');

    const secondSync = syncRecordMetadataFromWorkflow(flow.recordFolderPath);
    expect(secondSync.name).toBe('Record Metadata Sync');
    expect(secondSync.summary).toBe('Capture a durable title and summary from workflow.yaml.');
  });

  it('keeps the canonical state record folder when loading through SessionStore', () => {
    const workspaceRoot = createWorkspace();
    const flow = initializeDraftFlow(workspaceRoot, projectNamespace, 'owner');
    SessionStore.saveFlowRun(flow);

    const loaded = SessionStore.loadFlowRun(SessionStore.flowRef(flow));

    expect(loaded?.recordFolderPath).toBe(flow.recordFolderPath);
  });
});
