import fs from 'node:fs';
import path from 'node:path';
import { flowKey, flowRefFromRun } from '../../shared/flow-ref.js';
import { CURRENT_FLOW_STATE_VERSION, normalizeConsentState } from '../common/types.js';
import type { FeedItem, FlowRef, FlowRun, FlowSummary, RoleSession } from '../common/types.js';
import { parseRoleIdentity } from '../../shared/role-id.js';
import { syncRecordMetadataFromWorkflow } from '../projects/record-metadata.js';
import { getWorkspaceRoot } from '../common/workspace.js';
import { getFlowDir, getProjectStateDir, getStateRoot } from './state-paths.js';

function getFlowPath(ref: FlowRef): string {
  return path.join(getFlowDir(getWorkspaceRoot(), ref), 'flow.json');
}

function getRoleDir(ref: FlowRef, roleKey: string): string {
  return path.join(getFlowDir(getWorkspaceRoot(), ref), 'roles', roleKey);
}

function getRoleTranscriptPath(ref: FlowRef, roleKey: string): string {
  return path.join(getRoleDir(ref, roleKey), 'transcript.json');
}

function getRoleFeedPath(ref: FlowRef, roleKey: string): string {
  return path.join(getRoleDir(ref, roleKey), 'feed.json');
}

function validateAndHydrateFlow(flow: FlowRun, ref?: FlowRef): FlowRun {
  if (flow.stateVersion !== CURRENT_FLOW_STATE_VERSION) {
    throw new Error(
      `Unsupported persisted flow state version "${String((flow as any).stateVersion ?? 'missing')}". ` +
      `This runtime only supports flow state version "${CURRENT_FLOW_STATE_VERSION}".`
    );
  }

  if (!flow.receivingHandoff) flow.receivingHandoff = {};
  if (!flow.historyHandoff) flow.historyHandoff = {};
  if (!flow.awaitingHandoff) flow.awaitingHandoff = [];

  if (!flow.workspaceRoot || !flow.recordFolderPath) {
    throw new Error('Persisted flow state is missing required workspaceRoot or recordFolderPath fields.');
  }

  if (ref && (flow.projectNamespace !== ref.projectNamespace || flow.flowId !== ref.flowId)) {
    throw new Error(
      `Persisted flow identity mismatch: loaded "${flow.projectNamespace}/${flow.flowId}" ` +
      `but expected "${ref.projectNamespace}/${ref.flowId}".`
    );
  }

  if (fs.existsSync(flow.recordFolderPath)) {
    const metadata = syncRecordMetadataFromWorkflow(flow.recordFolderPath);
    if (metadata.name) {
      flow.recordName = metadata.name;
    } else {
      delete flow.recordName;
    }
    if (metadata.summary) {
      flow.recordSummary = metadata.summary;
    } else {
      delete flow.recordSummary;
    }
  }

  if (!Array.isArray(flow.runningNodes)) {
    throw new Error('Persisted flow state is missing runningNodes.');
  }
  if (!flow.awaitingHumanNodes || typeof flow.awaitingHumanNodes !== 'object') {
    throw new Error('Persisted flow state is missing awaitingHumanNodes.');
  }
  if (!flow.pendingHumanInputs || typeof flow.pendingHumanInputs !== 'object') {
    throw new Error('Persisted flow state is missing pendingHumanInputs.');
  }
  if (!Array.isArray(flow.completedHandoffs)) {
    flow.completedHandoffs = [];
  }
  if (!Array.isArray(flow.visitedNodeIds)) {
    flow.visitedNodeIds = [];
  }
  if (!flow.feedbackContext) {
    flow.feedbackContext = { kind: 'standard' };
  }
  flow.consentState = normalizeConsentState(flow.consentState);

  return flow;
}

const flowUpdateLocks = new Map<string, Promise<void>>();

export function init(): void {
  fs.mkdirSync(getStateRoot(getWorkspaceRoot()), { recursive: true });
}

export function flowRef(flow: FlowRun): FlowRef {
  return flowRefFromRun(flow);
}

export function saveFlowRun(flow: FlowRun, ref: FlowRef = flowRefFromRun(flow)): void {
  init();
  const flowDir = getFlowDir(getWorkspaceRoot(), ref);
  fs.mkdirSync(flowDir, { recursive: true });
  const { recordName: _recordName, recordSummary: _recordSummary, ...persisted } = flow;
  fs.writeFileSync(path.join(flowDir, 'flow.json'), JSON.stringify(persisted, null, 2));
}

export async function updateFlowRun(
  mutator: (flow: FlowRun) => FlowRun | void | Promise<FlowRun | void>,
  ref: FlowRef,
): Promise<FlowRun> {
  const key = `${getWorkspaceRoot()}::${flowKey(ref)}`;
  const previous = flowUpdateLocks.get(key) ?? Promise.resolve();
  let release!: () => void;
  flowUpdateLocks.set(key, new Promise<void>((resolve) => {
    release = resolve;
  }));

  await previous;
  try {
    const flow = loadFlowRun(ref);
    if (!flow) {
      throw new Error('No active flow state found.');
    }

    const mutated = await mutator(flow);
    const nextFlow = mutated ?? flow;
    saveFlowRun(nextFlow, ref);
    return nextFlow;
  } finally {
    release();
  }
}

export function loadFlowRun(ref: FlowRef): FlowRun | null {
  init();

  const flowPath = getFlowPath(ref);
  if (!fs.existsSync(flowPath)) return null;
  const flow = JSON.parse(fs.readFileSync(flowPath, 'utf8')) as FlowRun;
  return validateAndHydrateFlow(flow, ref);
}

export function saveRoleSession(session: RoleSession, ref: FlowRef): void {
  const roleKey = parseRoleIdentity(session.roleName).instanceRoleId;
  const dir = getRoleDir(ref, roleKey);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getRoleTranscriptPath(ref, roleKey), JSON.stringify(session, null, 2));
}

export function loadRoleSession(roleKey: string, ref: FlowRef): RoleSession | null {
  const transcriptPath = getRoleTranscriptPath(ref, roleKey);
  if (!fs.existsSync(transcriptPath)) return null;
  return JSON.parse(fs.readFileSync(transcriptPath, 'utf8')) as RoleSession;
}

export function deleteRoleSession(roleKey: string, ref: FlowRef): void {
  const transcriptPath = getRoleTranscriptPath(ref, roleKey);
  if (fs.existsSync(transcriptPath)) {
    fs.unlinkSync(transcriptPath);
  }
}

export function loadRoleFeed(ref: FlowRef, roleKey: string): FeedItem[] {
  const feedPath = getRoleFeedPath(ref, roleKey);
  if (!fs.existsSync(feedPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(feedPath, 'utf8')) as unknown;
    return Array.isArray(parsed) ? parsed as FeedItem[] : [];
  } catch {
    return [];
  }
}

export function saveRoleFeed(items: FeedItem[], ref: FlowRef, roleKey: string): void {
  const dir = getRoleDir(ref, roleKey);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getRoleFeedPath(ref, roleKey), JSON.stringify(items, null, 2));
}

export function listRoleKeys(ref: FlowRef): string[] {
  const rolesDir = path.join(getFlowDir(getWorkspaceRoot(), ref), 'roles');
  if (!fs.existsSync(rolesDir)) return [];
  return fs.readdirSync(rolesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

export function loadAllRoleFeeds(ref: FlowRef): Map<string, FeedItem[]> {
  const result = new Map<string, FeedItem[]>();
  const rolesDir = path.join(getFlowDir(getWorkspaceRoot(), ref), 'roles');
  if (!fs.existsSync(rolesDir)) return result;
  for (const entry of fs.readdirSync(rolesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const roleKey = entry.name;
    const feedPath = getRoleFeedPath(ref, roleKey);
    if (!fs.existsSync(feedPath)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(feedPath, 'utf8')) as unknown;
      if (Array.isArray(parsed)) {
        result.set(roleKey, parsed as FeedItem[]);
      }
    } catch {
      // skip malformed feed
    }
  }
  return result;
}

export function deleteFlow(ref: FlowRef): void {
  init();

  const flowDir = getFlowDir(getWorkspaceRoot(), ref);
  if (fs.existsSync(flowDir)) {
    fs.rmSync(flowDir, { recursive: true, force: true });
  }
}

export function listFlowSummaries(projectNamespace: string): FlowSummary[] {
  init();
  const projectDir = getProjectStateDir(getWorkspaceRoot(), projectNamespace);
  if (!fs.existsSync(projectDir)) return [];

  const summaries: FlowSummary[] = [];
  for (const entry of fs.readdirSync(projectDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const ref = { projectNamespace, flowId: entry.name };
    const flowPath = getFlowPath(ref);
    if (!fs.existsSync(flowPath)) continue;

    try {
      const raw = JSON.parse(fs.readFileSync(flowPath, 'utf8')) as FlowRun;
      const updatedAt = fs.statSync(flowPath).mtime.toISOString();

      if (raw.stateVersion !== CURRENT_FLOW_STATE_VERSION) {
        if (
          typeof raw.recordFolderPath !== 'string' ||
          typeof raw.status !== 'string'
        ) {
          continue;
        }

        summaries.push({
          projectNamespace,
          flowId: ref.flowId,
          status: raw.status,
          recordFolderPath: raw.recordFolderPath,
          openable: false,
          stateVersion: String(raw.stateVersion ?? 'missing'),
          recordName: raw.recordName,
          recordSummary: raw.recordSummary,
          updatedAt,
        });
        continue;
      }

      const flow = validateAndHydrateFlow(raw, ref);
      summaries.push({
        projectNamespace,
        flowId: flow.flowId,
        status: flow.status,
        recordFolderPath: flow.recordFolderPath,
        openable: true,
        stateVersion: flow.stateVersion,
        recordName: flow.recordName,
        recordSummary: flow.recordSummary,
        updatedAt,
      });
    } catch {
      continue;
    }
  }

  summaries.sort((left, right) => (right.updatedAt ?? '').localeCompare(left.updatedAt ?? ''));
  return summaries;
}
