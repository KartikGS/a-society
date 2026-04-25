import fs from 'node:fs';
import path from 'node:path';
import type { FlowRef, FlowRun, FlowSummary, RoleSession } from './types.js';
import { repairMovedRecordFolder } from './draft-flow.js';
import { syncRecordMetadataFromWorkflow } from './record-metadata.js';

function getStateRoot(workspaceRoot = process.cwd()): string {
  if (process.env.A_SOCIETY_STATE_DIR) {
    return path.resolve(process.env.A_SOCIETY_STATE_DIR);
  }
  return path.join(path.resolve(workspaceRoot), '.a-society', 'state');
}

function assertSafeSegment(label: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..' || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error(`Invalid ${label} "${value}".`);
  }
  return trimmed;
}

function flowKey(ref: FlowRef): string {
  return `${ref.projectNamespace}/${ref.flowId}`;
}

function flowRefFromRun(flow: FlowRun): FlowRef {
  return {
    projectNamespace: flow.projectNamespace,
    flowId: flow.flowId,
  };
}

function getProjectStateDir(workspaceRoot: string, projectNamespace: string): string {
  const safeProject = assertSafeSegment('project namespace', projectNamespace);
  return path.join(getStateRoot(workspaceRoot), safeProject);
}

function getFlowDir(workspaceRoot: string, ref: FlowRef): string {
  const safeFlowId = assertSafeSegment('flow id', ref.flowId);
  return path.join(getProjectStateDir(workspaceRoot, ref.projectNamespace), safeFlowId);
}

function getFlowPath(workspaceRoot: string, ref: FlowRef): string {
  return path.join(getFlowDir(workspaceRoot, ref), 'flow.json');
}

function getSessionsDir(workspaceRoot: string, ref: FlowRef): string {
  return path.join(getFlowDir(workspaceRoot, ref), 'sessions');
}

function getLegacyFlowPath(workspaceRoot: string): string {
  return path.join(getStateRoot(workspaceRoot), 'flow.json');
}

function getLegacySessionsDir(workspaceRoot: string): string {
  return path.join(getStateRoot(workspaceRoot), 'sessions');
}

function validateAndHydrateFlow(flow: FlowRun, workspaceRoot: string, ref?: FlowRef): FlowRun {
  if (flow.stateVersion !== '7') {
    throw new Error(
      `Unsupported persisted flow state version "${String((flow as any).stateVersion ?? 'missing')}". ` +
      'This runtime only supports flow state version "7".'
    );
  }

  if (!flow.workspaceRoot || !flow.recordFolderPath) {
    throw new Error('Persisted flow state is missing required workspaceRoot or recordFolderPath fields.');
  }

  if (ref && (flow.projectNamespace !== ref.projectNamespace || flow.flowId !== ref.flowId)) {
    throw new Error(
      `Persisted flow identity mismatch: loaded "${flow.projectNamespace}/${flow.flowId}" ` +
      `but expected "${ref.projectNamespace}/${ref.flowId}".`
    );
  }

  const repairedRecordFolderPath = repairMovedRecordFolder(flow);
  if (repairedRecordFolderPath && repairedRecordFolderPath !== flow.recordFolderPath) {
    flow.recordFolderPath = repairedRecordFolderPath;
    SessionStore.saveFlowRun(flow, ref ?? flowRefFromRun(flow), workspaceRoot);
  }

  if (fs.existsSync(flow.recordFolderPath)) {
    const metadata = syncRecordMetadataFromWorkflow(flow.recordFolderPath, flow.flowId);
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

  if (!Array.isArray(flow.readyNodes)) {
    throw new Error('Persisted flow state is missing readyNodes.');
  }
  if (!Array.isArray(flow.runningNodes)) {
    throw new Error('Persisted flow state is missing runningNodes.');
  }
  if (!flow.awaitingHumanNodes || typeof flow.awaitingHumanNodes !== 'object') {
    throw new Error('Persisted flow state is missing awaitingHumanNodes.');
  }
  if (!flow.completedEdgeArtifacts || typeof flow.completedEdgeArtifacts !== 'object') {
    throw new Error('Persisted flow state is missing completedEdgeArtifacts.');
  }
  if (!flow.pendingNodeArtifacts || typeof flow.pendingNodeArtifacts !== 'object') {
    throw new Error('Persisted flow state is missing pendingNodeArtifacts.');
  }
  if (!Array.isArray(flow.visitedNodeIds)) {
    flow.visitedNodeIds = [];
  }

  return flow;
}

export class SessionStore {
  private static defaultWorkspaceRoot = process.cwd();
  private static currentFlowRef: FlowRef | null = null;
  private static flowUpdateLocks = new Map<string, Promise<void>>();

  static configure(workspaceRoot: string): void {
    SessionStore.defaultWorkspaceRoot = path.resolve(workspaceRoot);
  }

  static init(workspaceRoot = SessionStore.defaultWorkspaceRoot, ref?: FlowRef): void {
    SessionStore.configure(workspaceRoot);
    fs.mkdirSync(getStateRoot(workspaceRoot), { recursive: true });
    if (ref) {
      fs.mkdirSync(getSessionsDir(workspaceRoot, ref), { recursive: true });
      SessionStore.currentFlowRef = ref;
    } else if (SessionStore.currentFlowRef && !fs.existsSync(getFlowPath(workspaceRoot, SessionStore.currentFlowRef))) {
      SessionStore.currentFlowRef = null;
    }
  }

  static flowRef(flow: FlowRun): FlowRef {
    return flowRefFromRun(flow);
  }

  static saveFlowRun(flow: FlowRun, ref: FlowRef = flowRefFromRun(flow), workspaceRoot = flow.workspaceRoot): void {
    SessionStore.init(workspaceRoot);
    const flowDir = getFlowDir(workspaceRoot, ref);
    fs.mkdirSync(path.join(flowDir, 'sessions'), { recursive: true });
    const { recordName: _recordName, recordSummary: _recordSummary, ...persisted } = flow;
    fs.writeFileSync(path.join(flowDir, 'flow.json'), JSON.stringify(persisted, null, 2));
    SessionStore.currentFlowRef = ref;
  }

  static async updateFlowRun(
    mutator: (flow: FlowRun) => FlowRun | void | Promise<FlowRun | void>,
    ref: FlowRef | null = SessionStore.currentFlowRef,
    workspaceRoot = SessionStore.defaultWorkspaceRoot,
  ): Promise<FlowRun> {
    const resolvedRef = ref ?? SessionStore.currentFlowRef;
    if (!resolvedRef) {
      throw new Error('No active flow reference found.');
    }

    const key = `${path.resolve(workspaceRoot)}::${flowKey(resolvedRef)}`;
    const previous = SessionStore.flowUpdateLocks.get(key) ?? Promise.resolve();
    let release!: () => void;
    SessionStore.flowUpdateLocks.set(key, new Promise<void>((resolve) => {
      release = resolve;
    }));

    await previous;
    try {
      const flow = SessionStore.loadFlowRun(resolvedRef, workspaceRoot);
      if (!flow) {
        throw new Error('No active flow state found.');
      }

      const mutated = await mutator(flow);
      const nextFlow = mutated ?? flow;
      SessionStore.saveFlowRun(nextFlow, resolvedRef, workspaceRoot);
      return nextFlow;
    } finally {
      release();
    }
  }

  static loadFlowRun(ref?: FlowRef | null, workspaceRoot = SessionStore.defaultWorkspaceRoot): FlowRun | null {
    SessionStore.init(workspaceRoot);

    if (ref) {
      const flowPath = getFlowPath(workspaceRoot, ref);
      if (!fs.existsSync(flowPath)) return null;
      const flow = JSON.parse(fs.readFileSync(flowPath, 'utf8')) as FlowRun;
      SessionStore.currentFlowRef = ref;
      return validateAndHydrateFlow(flow, workspaceRoot, ref);
    }

    if (SessionStore.currentFlowRef) {
      const flowPath = getFlowPath(workspaceRoot, SessionStore.currentFlowRef);
      if (fs.existsSync(flowPath)) {
        return SessionStore.loadFlowRun(SessionStore.currentFlowRef, workspaceRoot);
      }
    }

    const legacyPath = getLegacyFlowPath(workspaceRoot);
    if (fs.existsSync(legacyPath)) {
      const flow = JSON.parse(fs.readFileSync(legacyPath, 'utf8')) as FlowRun;
      SessionStore.currentFlowRef = flowRefFromRun(flow);
      return validateAndHydrateFlow(flow, workspaceRoot);
    }

    const single = SessionStore.findSingleFlowRef(workspaceRoot);
    return single ? SessionStore.loadFlowRun(single, workspaceRoot) : null;
  }

  static saveRoleSession(
    session: RoleSession,
    ref: FlowRef | null = SessionStore.currentFlowRef,
    workspaceRoot = SessionStore.defaultWorkspaceRoot,
  ): void {
    SessionStore.init(workspaceRoot);
    if (ref && !fs.existsSync(getFlowPath(workspaceRoot, ref))) {
      ref = null;
    }
    const sessionsDir = ref ? getSessionsDir(workspaceRoot, ref) : getLegacySessionsDir(workspaceRoot);
    fs.mkdirSync(sessionsDir, { recursive: true });
    fs.writeFileSync(path.join(sessionsDir, `${session.logicalSessionId}.json`), JSON.stringify(session, null, 2));
  }

  static loadRoleSession(
    logicalSessionId: string,
    ref: FlowRef | null = SessionStore.currentFlowRef,
    workspaceRoot = SessionStore.defaultWorkspaceRoot,
  ): RoleSession | null {
    SessionStore.init(workspaceRoot);
    if (ref && !fs.existsSync(getFlowPath(workspaceRoot, ref))) {
      ref = null;
    }
    const candidateDirs = [
      ref ? getSessionsDir(workspaceRoot, ref) : null,
      getLegacySessionsDir(workspaceRoot),
    ].filter((candidate): candidate is string => candidate !== null);

    for (const sessionsDir of candidateDirs) {
      const p = path.join(sessionsDir, `${logicalSessionId}.json`);
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8')) as RoleSession;
      }
    }

    return null;
  }

  static deleteRoleSession(
    logicalSessionId: string,
    ref: FlowRef | null = SessionStore.currentFlowRef,
    workspaceRoot = SessionStore.defaultWorkspaceRoot,
  ): void {
    SessionStore.init(workspaceRoot);
    if (ref && !fs.existsSync(getFlowPath(workspaceRoot, ref))) {
      ref = null;
    }
    const candidateDirs = [
      ref ? getSessionsDir(workspaceRoot, ref) : null,
      getLegacySessionsDir(workspaceRoot),
    ].filter((candidate): candidate is string => candidate !== null);

    for (const sessionsDir of candidateDirs) {
      const p = path.join(sessionsDir, `${logicalSessionId}.json`);
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    }
  }

  static listFlowSummaries(workspaceRoot: string, projectNamespace: string): FlowSummary[] {
    SessionStore.init(workspaceRoot);
    const projectDir = getProjectStateDir(workspaceRoot, projectNamespace);
    if (!fs.existsSync(projectDir)) return [];

    const summaries: FlowSummary[] = [];
    for (const entry of fs.readdirSync(projectDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const ref = { projectNamespace, flowId: entry.name };
      const flowPath = getFlowPath(workspaceRoot, ref);
      if (!fs.existsSync(flowPath)) continue;

      try {
        const flow = SessionStore.loadFlowRun(ref, workspaceRoot);
        if (!flow) continue;
        summaries.push({
          projectNamespace,
          flowId: flow.flowId,
          status: flow.status,
          recordFolderPath: flow.recordFolderPath,
          recordName: flow.recordName,
          recordSummary: flow.recordSummary,
          updatedAt: fs.statSync(flowPath).mtime.toISOString(),
        });
      } catch {
        continue;
      }
    }

    summaries.sort((left, right) => (right.updatedAt ?? '').localeCompare(left.updatedAt ?? ''));
    return summaries;
  }

  private static findSingleFlowRef(workspaceRoot: string): FlowRef | null {
    const stateRoot = getStateRoot(workspaceRoot);
    if (!fs.existsSync(stateRoot)) return null;

    const refs: FlowRef[] = [];
    for (const projectEntry of fs.readdirSync(stateRoot, { withFileTypes: true })) {
      if (!projectEntry.isDirectory()) continue;
      const projectNamespace = projectEntry.name;
      const projectDir = path.join(stateRoot, projectNamespace);
      for (const flowEntry of fs.readdirSync(projectDir, { withFileTypes: true })) {
        if (!flowEntry.isDirectory()) continue;
        const ref = { projectNamespace, flowId: flowEntry.name };
        if (fs.existsSync(getFlowPath(workspaceRoot, ref))) {
          refs.push(ref);
        }
      }
    }

    return refs.length === 1 ? refs[0] : null;
  }
}
