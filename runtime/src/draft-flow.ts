import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { FlowRun } from './types.js';
import { buildRecordId, readRecordMetadata, syncRecordMetadataFromWorkflow } from './record-metadata.js';

const LEGACY_FLOW_MARKER_FILENAME = '.a-society-flow.json';

export function resolveProjectRoot(workspaceRoot: string, projectNamespace: string): string {
  return path.join(workspaceRoot, projectNamespace);
}

export function resolveProjectRecordsRoot(workspaceRoot: string, projectNamespace: string): string {
  const projectRoot = resolveProjectRoot(workspaceRoot, projectNamespace);
  const preferred = path.join(projectRoot, 'a-docs', 'records');
  if (fs.existsSync(preferred)) {
    return preferred;
  }

  const legacy = path.join(projectRoot, 'records');
  if (fs.existsSync(legacy)) {
    return legacy;
  }

  return preferred;
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
          'human-collaborative': 'direction',
          guidance: [
            'This draft flow exists so the initial Owner conversation is durable from the first turn.',
            'Use the already loaded startup authority to understand the current project state before routing work.',
            'The runtime assigned this flow a stable record ID and maintains record.yaml for this folder.',
            'Once the human intent is clear, replace the runtime draft workflow name and summary with flow-specific values.',
            'If the real path needs additional nodes, update workflow.yaml before emitting any downstream handoff.',
            'If the work remains Owner-only or purely conversational, write a summary artifact in this record folder and close the forward pass from this node.'
          ],
          inputs: [
            'Human direction from the active conversation',
            'Startup authority already loaded by the runtime',
            'The active record folder and workflow.yaml created for this flow'
          ],
          work: [
            'Clarify what the human wants to achieve.',
            'Decide whether the work stays Owner-only or expands to additional workflow nodes.',
            'Edit workflow.yaml to reflect the real flow name, summary, and path before any downstream handoff.',
            'Create the appropriate artifact or artifacts in the record folder for the chosen path.'
          ],
          outputs: [
            'Updated workflow.yaml when the path changes',
            'Owner summary or decision artifact for Owner-only closure, or handoff artifact(s) for downstream roles'
          ],
          notes: [
            'The runtime already created this record folder so the initial conversation is not lost.',
            'Do not edit record.yaml directly unless the runtime or a standing instruction explicitly requires it.'
          ]
        }
      ],
      edges: []
    }
  }, { noRefs: true, lineWidth: 120 });
}

export function initializeDraftFlow(
  workspaceRoot: string,
  projectNamespace: string,
  roleName: string
): FlowRun {
  const flowId = buildRecordId();
  const recordsRoot = resolveProjectRecordsRoot(workspaceRoot, projectNamespace);
  fs.mkdirSync(recordsRoot, { recursive: true });

  const recordFolderPath = path.join(recordsRoot, flowId);
  fs.mkdirSync(recordFolderPath, { recursive: true });

  fs.writeFileSync(
    path.join(recordFolderPath, 'workflow.yaml'),
    buildDraftWorkflowDocument(roleName),
    'utf8'
  );
  syncRecordMetadataFromWorkflow(recordFolderPath, flowId);

  return {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath,
    readyNodes: ['owner-intake'],
    runningNodes: [],
    awaitingHumanNodes: {},
    completedNodes: [],
    visitedNodeIds: [],
    completedEdgeArtifacts: {},
    pendingNodeArtifacts: {},
    status: 'running',
    stateVersion: '7'
  };
}

export function repairMovedRecordFolder(flow: FlowRun): string | null {
  if (fs.existsSync(flow.recordFolderPath)) {
    return flow.recordFolderPath;
  }

  const recordsRoot = resolveProjectRecordsRoot(flow.workspaceRoot, flow.projectNamespace);
  if (!fs.existsSync(recordsRoot)) {
    return null;
  }

  const candidates = fs.readdirSync(recordsRoot, { withFileTypes: true });
  for (const entry of candidates) {
    if (!entry.isDirectory()) continue;
    const candidatePath = path.join(recordsRoot, entry.name);
    if (entry.name === flow.flowId) {
      return candidatePath;
    }

    const metadata = readRecordMetadata(candidatePath);
    if (metadata?.id === flow.flowId) {
      return candidatePath;
    }

    const markerPath = path.join(candidatePath, LEGACY_FLOW_MARKER_FILENAME);
    if (!fs.existsSync(markerPath)) continue;

    try {
      const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8')) as { flowId?: string };
      if (marker.flowId === flow.flowId) {
        return candidatePath;
      }
    } catch {
      continue;
    }
  }

  return null;
}
