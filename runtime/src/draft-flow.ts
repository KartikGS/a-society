import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import yaml from 'js-yaml';
import type { FlowRun } from './types.js';

const FLOW_MARKER_FILENAME = '.a-society-flow.json';

function formatDateStamp(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function shortFlowId(flowId: string): string {
  return flowId.replace(/-/g, '').slice(0, 8);
}

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

export function flowMarkerFilename(): string {
  return FLOW_MARKER_FILENAME;
}

export function buildDraftRecordFolderName(flowId: string, now = new Date()): string {
  return `draft-${formatDateStamp(now)}-${shortFlowId(flowId)}`;
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
            'Once the human intent is clear, rename the active record folder to a meaningful human-readable name.',
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
            'Rename the record folder once the scope is clear.',
            'Edit workflow.yaml to reflect the real path before any downstream handoff.',
            'Create the appropriate artifact or artifacts in the record folder for the chosen path.'
          ],
          outputs: [
            'Updated workflow.yaml when the path changes',
            'Owner summary or decision artifact for Owner-only closure, or handoff artifact(s) for downstream roles'
          ],
          notes: [
            'The runtime already created this record folder so the initial conversation is not lost.',
            'Do not delete or rewrite hidden runtime marker files inside the record folder.'
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
  const flowId = crypto.randomUUID();
  const recordsRoot = resolveProjectRecordsRoot(workspaceRoot, projectNamespace);
  fs.mkdirSync(recordsRoot, { recursive: true });

  const recordFolderPath = path.join(recordsRoot, buildDraftRecordFolderName(flowId));
  fs.mkdirSync(recordFolderPath, { recursive: true });

  fs.writeFileSync(
    path.join(recordFolderPath, FLOW_MARKER_FILENAME),
    JSON.stringify(
      {
        flowId,
        projectNamespace
      },
      null,
      2
    )
  );
  fs.writeFileSync(
    path.join(recordFolderPath, 'workflow.yaml'),
    buildDraftWorkflowDocument(roleName),
    'utf8'
  );

  return {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath,
    activeNodes: ['owner-intake'],
    completedNodes: [],
    visitedNodeIds: [],
    completedEdgeArtifacts: {},
    pendingNodeArtifacts: {},
    status: 'running',
    stateVersion: '6'
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
    const markerPath = path.join(candidatePath, FLOW_MARKER_FILENAME);
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
