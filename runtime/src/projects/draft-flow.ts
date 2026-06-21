import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { CURRENT_FLOW_STATE_VERSION, type FlowRun } from '../common/types.js';
import { getWorkspaceRoot } from '../common/workspace.js';
import { buildFlowId, syncRecordMetadataFromWorkflow } from './record-metadata.js';
import { getFlowRecordDir } from '../orchestration/state-paths.js';

export function resolveProjectRoot(projectNamespace: string): string {
  return path.join(getWorkspaceRoot(), projectNamespace);
}

export function buildDraftWorkflowDocument(roleName: string): string {
  return yaml.dump({
    workflow: {
      name: 'Draft Owner Intake',
      summary: 'Runtime-created draft flow for the first Owner conversation.',
      nodes: [
        {
          id: 'owner-intake',
          role: roleName,
          work: [
            'This draft flow exists so the initial Owner conversation is durable from the first turn.',
            'Use the already loaded startup authority to understand the current project state before routing work.',
            'Clarify what the human wants to achieve.',
            'Decide whether the work stays Owner-only or expands to additional workflow nodes.',
            'Edit workflow.yaml to reflect the real flow name, summary, and path before any downstream handoff.',
            'Create the appropriate artifact or artifacts in the record folder for the chosen path.',
            'If the work remains Owner-only or purely conversational, write a summary artifact in this record folder and close the forward pass from this node.',
            'The runtime already created this record folder and record.yaml so the initial conversation is not lost — do not edit record.yaml directly.'
          ]
        }
      ],
      edges: []
    }
  }, { noRefs: true, lineWidth: 120 });
}

export function initializeDraftFlow(
  projectNamespace: string,
  roleName: string
): FlowRun {
  const flowId = buildFlowId();
  const workspaceRoot = getWorkspaceRoot();
  const recordFolderPath = getFlowRecordDir({ projectNamespace, flowId });
  fs.mkdirSync(recordFolderPath, { recursive: true });

  fs.writeFileSync(
    path.join(recordFolderPath, 'workflow.yaml'),
    buildDraftWorkflowDocument(roleName),
    'utf8'
  );
  syncRecordMetadataFromWorkflow(recordFolderPath);

  return {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath,
    runningNodes: ['owner-intake'],
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
    feedbackContext: {
      kind: 'standard',
    }
  };
}
