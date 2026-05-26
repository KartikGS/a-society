import fs from 'node:fs';
import path from 'node:path';
import {
  type BackwardPassEntry,
  computeBackwardPassPlan,
  deterministicFindingsFilePath,
  locateFindingsFiles,
  locateAllFindingsFiles,
} from '../framework-services/backward-pass-orderer.js';
import { ContextInjectionService } from '../context/injection.js';
import { buildImprovementEntryMessage } from '../context/session-entry.js';
import { SessionStore } from '../orchestration/store.js';
import { runRoleTurn } from '../orchestration/orient.js';
import { CURRENT_FLOW_STATE_VERSION } from '../common/types.js';
import type { FlowRun, HandoffResult, ImprovementPhaseState, OperatorRenderSink, RoleSession, RuntimeMessageParam } from '../common/types.js';
import {
  FEEDBACK_CONSENT_STATUS,
  IMPROVEMENT_CHOICE_MODE,
  OWNER_BASE_ROLE_ID,
} from '../common/protocol-constants.js';
import { HandoffParseError } from '../orchestration/handoff.js';
import { TelemetryManager } from '../observability/observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { buildRuntimeHealthRepairGuidance, runRuntimeHealthChecks } from '../framework-services/runtime-health-checks.js';
import { parseRoleIdentity } from '../common/role-id.js';
import { improvementNodeId, writeImprovementWorkflow } from './improvement-workflow.js';
import { upsertAssistantDelta, removeAssistantDraftBeforeToolCalls, upsertCurrentNodeAssistantDelta, appendConversationMessagesToCurrentNode, INTERRUPTED_TURN_CONTINUATION_MESSAGE } from '../common/history.js';

const FEEDBACK_ROLE = 'A-Society Feedback';
const RUNTIME_FEEDBACK_SYSTEM_PROMPT = [
  'You are the A-Society runtime feedback phase.',
  'Follow the runtime feedback instructions supplied in the latest user message.',
  'Use the supplied findings as the primary source material and emit the required backward-pass-complete handoff block.'
].join('\n');

type ExpectedImprovementSignalKind = 'meta-analysis-complete' | 'backward-pass-complete';
export type ImprovementMode =
  | typeof IMPROVEMENT_CHOICE_MODE.GRAPH_BASED
  | typeof IMPROVEMENT_CHOICE_MODE.PARALLEL;

type ExpectedImprovementSignal<K extends ExpectedImprovementSignalKind> = Extract<HandoffResult, { kind: K }>;
type ExpectedSignalRepair = {
  code: string;
  operatorSummary: string;
  modelRepairMessage: string;
};
type ExpectedSignalValidator<K extends ExpectedImprovementSignalKind> =
  (result: ExpectedImprovementSignal<K>) => ExpectedSignalRepair | null;

async function saveImprovementPhase(
  flowRun: FlowRun,
  mutate: (phase: ImprovementPhaseState) => void,
): Promise<void> {
  if (!flowRun.workspaceRoot || !flowRun.projectNamespace || !flowRun.flowId) return;
  if (flowRun.improvementPhase) mutate(flowRun.improvementPhase);
  await SessionStore.updateFlowRun((latest) => {
    if (!latest.improvementPhase) return;
    mutate(latest.improvementPhase);
    latest.status = flowRun.status;
  }, SessionStore.flowRef(flowRun), flowRun.workspaceRoot);
}

function buildUnexpectedSignalRepairMessage(
  role: string,
  expectedKind: ExpectedImprovementSignalKind
): string {
  if (expectedKind === 'meta-analysis-complete') {
    return [
      `Error: This backward pass meta-analysis session for ${role} must end with a \`type: meta-analysis-complete\` handoff block.`,
      'Set `findings_path` to the repo-relative path of the findings artifact you produced in this session.',
      'Do not emit `prompt-human`, `forward-pass-closed`, `backward-pass-complete`, or a routing handoff for this step.'
    ].join(' ');
  }

  return [
    `Error: This backward pass feedback session for ${role} must end with a \`type: backward-pass-complete\` handoff block.`,
    'Set `artifact_path` to the repo-relative path of the feedback artifact you produced in this session.',
    'Do not emit `prompt-human`, `forward-pass-closed`, `meta-analysis-complete`, or a routing handoff for this step.'
  ].join(' ');
}

function describeUnexpectedSignal(result: HandoffResult): string {
  if (result.kind === 'targets') return 'routing handoff';
  if (result.kind === 'awaiting_human') return 'prompt-human';
  return result.kind;
}

function describeExpectedStep(expectedKind: ExpectedImprovementSignalKind): string {
  return expectedKind === 'meta-analysis-complete' ? 'meta-analysis' : 'feedback';
}


function normalizeRepoRelativePath(filePath: string, workspaceRoot: string): string {
  const nativePath = filePath.replace(/\\/g, path.sep);
  const relativePath = path.isAbsolute(nativePath)
    ? path.relative(workspaceRoot, nativePath)
    : nativePath;
  return path.normalize(relativePath).replace(/^\.\//, '').split(path.sep).join('/');
}

function runtimeFeedbackInstructionPath(flowRun: FlowRun): string {
  return path.join(flowRun.workspaceRoot, 'a-society', 'runtime', 'contracts', 'feedback.md');
}

function sanitizeFeedbackFileSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';
}

function feedbackKindFileSegment(flowRun: FlowRun): string {
  const feedbackContext = flowRun.feedbackContext ?? { kind: 'standard' as const };
  if (feedbackContext.kind === 'initialization') {
    return feedbackContext.initializationMode === 'greenfield'
      ? 'initialization-greenfield'
      : 'initialization-takeover';
  }
  if (feedbackContext.kind === 'update-application') {
    return 'update-application';
  }
  return 'flow';
}

function assignedFeedbackArtifactRelativePath(flowRun: FlowRun): string {
  const existing = flowRun.improvementPhase?.feedbackArtifactPath;
  if (existing) return existing;

  return path.posix.join(
    'a-society',
    'feedback',
    `${sanitizeFeedbackFileSegment(flowRun.projectNamespace)}-${feedbackKindFileSegment(flowRun)}-${flowRun.flowId}.md`
  );
}

function feedbackContextLines(flowRun: FlowRun): string[] {
  const feedbackContext = flowRun.feedbackContext ?? { kind: 'standard' as const };
  const lines = [`Source flow ID: ${flowRun.flowId}`];

  if (feedbackContext.kind === 'initialization') {
    lines.push(
      `Flow kind: initialization (${feedbackContext.initializationMode === 'greenfield' ? 'greenfield' : 'takeover'})`
    );
    lines.push('Focus on what the runtime could infer, what required human input, and where initialization guidance caused friction.');
    return lines;
  }

  if (feedbackContext.kind === 'update-application') {
    lines.push('Flow kind: update application');
    lines.push('Focus on which update guidance applied, where migration guidance was unclear, and what the runtime or framework should improve for future update flows.');
    for (const reportPath of feedbackContext.updateReportPaths ?? []) {
      lines.push(`Referenced update report: ${reportPath}`);
    }
    return lines;
  }

  lines.push('Flow kind: standard');
  lines.push('Focus on reusable framework gaps, workflow friction, runtime issues, and cross-project patterns surfaced by this flow.');
  return lines;
}

async function runBackwardPassSessionUntilExpectedSignal<K extends ExpectedImprovementSignalKind>(
  flowRun: FlowRun,
  roleName: string,
  bundleContent: string,
  session: RoleSession,
  expectedKind: K,
  role: string,
  outputStream: NodeJS.WritableStream,
  renderer: OperatorRenderSink,
  validateExpectedSignal?: ExpectedSignalValidator<K>,
): Promise<ExpectedImprovementSignal<K>> {
  const history = session.transcriptHistory as RuntimeMessageParam[];
  const stepLabel = describeExpectedStep(expectedKind);
  const nodeId = `${parseRoleIdentity(roleName).instanceRoleId}-${stepLabel}`;
  const flowRef = SessionStore.flowRef(flowRun);
  const saveSession = () => SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);

  while (true) {
    try {
      const sessionResult = await runRoleTurn(
        flowRun.workspaceRoot,
        flowRun.projectNamespace,
        roleName,
        bundleContent,
        history,
        outputStream,
        undefined,
        renderer,
        undefined,
        async (messages) => {
          removeAssistantDraftBeforeToolCalls(history, messages);
          appendConversationMessagesToCurrentNode(session, nodeId, messages);
          saveSession();
        },
        (text) => {
          upsertAssistantDelta(history, text);
          upsertCurrentNodeAssistantDelta(session, nodeId, text);
          saveSession();
        },
      );

      if (sessionResult === null) {
        throw new Error(`[improvement] ${expectedKind} session for ${role} ended unexpectedly without a handoff result.`);
      }
      const result = sessionResult.handoff;

      if (result.kind === expectedKind) {
        if (expectedKind === 'meta-analysis-complete' && parseRoleIdentity(roleName).instanceRoleId === OWNER_BASE_ROLE_ID) {
          const healthCheck = runRuntimeHealthChecks(flowRun.workspaceRoot, flowRun.projectNamespace);
          if (!healthCheck.ok) {
            const guidance = buildRuntimeHealthRepairGuidance(
              healthCheck.errors,
              'meta-analysis-complete'
            );
            outputStream.write(
              `[improvement] ${role} completed meta-analysis but runtime health checks failed. Requesting repair.\n`
            );
            renderer.emit({
              kind: 'repair.requested',
              scope: 'improvement',
              code: 'runtime_health',
              summary: guidance.operatorSummary,
              role
            });
            history.push({ role: 'user', content: guidance.modelRepairMessage });
            continue;
          }
        }

        const repair = validateExpectedSignal?.(result as ExpectedImprovementSignal<K>);
        if (repair) {
          outputStream.write(`[improvement] ${repair.operatorSummary}. Requesting repair.\n`);
          renderer.emit({
            kind: 'repair.requested',
            scope: 'improvement',
            code: repair.code,
            summary: repair.operatorSummary,
            role
          });
          history.push({ role: 'user', content: repair.modelRepairMessage });
          continue;
        }

        session.isActive = false;
        saveSession();
        return result as ExpectedImprovementSignal<K>;
      }

      outputStream.write(
        `[improvement] ${role} emitted ${describeUnexpectedSignal(result)} during backward pass ${stepLabel}. Requesting repair.\n`
      );
      renderer.emit({
        kind: 'repair.requested',
        scope: 'improvement',
        code: 'unexpected_signal',
        summary: `${role} emitted ${describeUnexpectedSignal(result)} during backward pass ${stepLabel}`,
        role
      });
      history.push({
        role: 'user',
        content: buildUnexpectedSignalRepairMessage(role, expectedKind)
      });
    } catch (error: any) {
      if (error instanceof HandoffParseError) {
        outputStream.write(
          `[improvement] ${role} emitted an invalid handoff block during backward pass ${stepLabel}. Requesting repair.\n`
        );
        renderer.emit({
          kind: 'repair.requested',
          scope: 'improvement',
          code: error.details.code,
          summary: error.details.operatorSummary,
          role
        });
        history.push({ role: 'user', content: error.details.modelRepairMessage });
        continue;
      }
      throw error;
    }
  }
}

async function runMetaAnalysisEntry(
  flowRun: FlowRun,
  entry: BackwardPassEntry,
  outputStream: NodeJS.WritableStream,
  roleOutputStream: NodeJS.WritableStream,
  renderer: OperatorRenderSink,
): Promise<void> {
  const roleName = entry.role;
  const improvementGraphNodeId = improvementNodeId(entry);
  const recordFolderPath = flowRun.recordFolderPath;

  renderer.emit({ kind: 'role.active', nodeId: improvementGraphNodeId, role: roleName });

  const findingsRoles = entry.findingsRolesToInject;
  const assignedFindingsFilePath = deterministicFindingsFilePath(recordFolderPath, roleName);
  fs.mkdirSync(path.dirname(assignedFindingsFilePath), { recursive: true });
  const assignedFindingsRepoPath = normalizeRepoRelativePath(assignedFindingsFilePath, flowRun.workspaceRoot);

  for (const expectedRole of findingsRoles) {
    if (locateFindingsFiles(recordFolderPath, [expectedRole]).length === 0) {
      outputStream.write(`[improvement] Role ${entry.role}: expected findings from ${expectedRole} but no matching file found in ${recordFolderPath}. Proceeding without findings for this role.\n`);
    }
  }

  const roleKey = parseRoleIdentity(roleName).instanceRoleId;
  const nodeId = `${roleKey}-meta-analysis`;
  const flowRef = SessionStore.flowRef(flowRun);
  const startedRoles = flowRun.improvementPhase!.startedRoles ?? [];
  const isStarted = startedRoles.includes(roleName);

  let session: RoleSession;

  if (isStarted) {
    const loaded = SessionStore.loadRoleSession(roleKey, flowRef, flowRun.workspaceRoot);
    if (!loaded) throw new Error(`[improvement] ${roleName} is in startedRoles but no session found on disk.`);
    session = loaded;
    session.isActive = true;
    const lastMsg = (session.transcriptHistory as RuntimeMessageParam[]).at(-1);
    if (lastMsg?.role === 'assistant') {
      (session.transcriptHistory as RuntimeMessageParam[]).push({ role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE });
      appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE }]);
    }
    SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);
  } else {
    // Defense: session may already exist with context injected if we crashed between inject and startedRoles save
    const existing = SessionStore.loadRoleSession(roleKey, flowRef, flowRun.workspaceRoot);
    const lastMsg = existing ? (existing.transcriptHistory as RuntimeMessageParam[]).at(-1) : null;

    if (existing && lastMsg?.role === 'user') {
      session = existing;
      session.isActive = true;
      appendConversationMessagesToCurrentNode(session, nodeId, [lastMsg]);
    } else {
      const findingsFilePaths = locateFindingsFiles(recordFolderPath, findingsRoles);
      const metaAnalysisInstructionPath = path.join(
        flowRun.workspaceRoot, flowRun.projectNamespace, 'a-docs', 'improvement', 'meta-analysis.md'
      );
      const userMessage = buildImprovementEntryMessage({
        stepLabel: 'meta-analysis',
        recordFolderPath,
        workspaceRoot: flowRun.workspaceRoot,
        instructionFilePath: metaAnalysisInstructionPath,
        findingsFilePaths,
        completionSignal: [
          `Produce your findings artifact at exactly this runtime-assigned path: ${assignedFindingsRepoPath}.`,
          'Do not choose a sequence number or alternate filename.',
          `When your findings artifact is saved, emit a meta-analysis-complete handoff block with findings_path set exactly to ${assignedFindingsRepoPath}.`
        ].join(' ')
      });
      // Continue from the forward-pass session so the role can reflect on what it actually did.
      // A fresh session would leave the role with no record of its own decisions, tool calls,
      // or errors — making findings superficial. The meta-analysis message is appended on top.
      if (existing) {
        session = existing;
        session.isActive = true;
      } else {
        session = {
          roleName,
          logicalSessionId: `${flowRun.flowId}__${roleKey}`,
          transcriptHistory: [],
          isActive: true,
        };
      }
      (session.transcriptHistory as RuntimeMessageParam[]).push({ role: 'user', content: userMessage });
      appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: userMessage }]);
    }

    SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);
    await saveImprovementPhase(flowRun, (phase) => {
      if (!(phase.startedRoles ?? []).includes(roleName)) {
        phase.startedRoles = [...(phase.startedRoles ?? []), roleName];
      }
    });
  }

  if (!session.systemPrompt) {
    session.systemPrompt = ContextInjectionService.buildContextBundle(
      flowRun.projectNamespace, roleName, flowRun.workspaceRoot
    ).bundleContent;
  }

  await runBackwardPassSessionUntilExpectedSignal(
    flowRun, roleName, session.systemPrompt, session, 'meta-analysis-complete', entry.role,
    roleOutputStream, renderer,
    (result) => {
      const actualFindingsPath = normalizeRepoRelativePath(result.findingsPath, flowRun.workspaceRoot);
      if (actualFindingsPath !== assignedFindingsRepoPath) {
        return {
          code: 'assigned_findings_path',
          operatorSummary: `${entry.role} used findings_path ${actualFindingsPath}; expected ${assignedFindingsRepoPath}`,
          modelRepairMessage: [
            'Error: This backward pass meta-analysis step has a runtime-assigned findings path.',
            `Write or move your findings artifact to ${assignedFindingsRepoPath}.`,
            `Then emit a meta-analysis-complete handoff block with findings_path set exactly to ${assignedFindingsRepoPath}.`
          ].join(' ')
        };
      }
      if (!fs.existsSync(assignedFindingsFilePath)) {
        return {
          code: 'missing_findings_artifact',
          operatorSummary: `${entry.role} emitted meta-analysis-complete before creating ${assignedFindingsRepoPath}`,
          modelRepairMessage: [
            'Error: The runtime-assigned findings artifact does not exist yet.',
            `Create ${assignedFindingsRepoPath}.`,
            `Then emit a meta-analysis-complete handoff block with findings_path set exactly to ${assignedFindingsRepoPath}.`
          ].join(' ')
        };
      }
      return null;
    }
  );

  await saveImprovementPhase(flowRun, (phase) => {
    phase.findingsProduced = { ...phase.findingsProduced, [roleName]: assignedFindingsRepoPath };
  });
}

async function runFeedbackEntry(
  flowRun: FlowRun,
  entry: BackwardPassEntry,
  assignedFeedbackRepoPath: string,
  assignedFeedbackFilePath: string,
  roleOutputStream: NodeJS.WritableStream,
  renderer: OperatorRenderSink,
): Promise<void> {
  const roleName = entry.role;
  const improvementGraphNodeId = improvementNodeId(entry);
  const recordFolderPath = flowRun.recordFolderPath;

  renderer.emit({ kind: 'role.active', nodeId: improvementGraphNodeId, role: roleName });

  const roleKey = parseRoleIdentity(roleName).instanceRoleId;
  const nodeId = `${roleKey}-feedback`;
  const flowRef = SessionStore.flowRef(flowRun);
  const startedRoles = flowRun.improvementPhase!.startedRoles ?? [];
  const isStarted = startedRoles.includes(roleName);

  let session: RoleSession;

  if (isStarted) {
    const loaded = SessionStore.loadRoleSession(roleKey, flowRef, flowRun.workspaceRoot);
    if (!loaded) throw new Error(`[improvement] ${roleName} is in startedRoles but no session found on disk.`);
    session = loaded;
    session.isActive = true;
    const lastMsg = (session.transcriptHistory as RuntimeMessageParam[]).at(-1);
    if (lastMsg?.role === 'assistant') {
      (session.transcriptHistory as RuntimeMessageParam[]).push({ role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE });
      appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE }]);
    }
    SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);
  } else {
    // Defense: session may already exist with context injected if we crashed between inject and startedRoles save
    const existing = SessionStore.loadRoleSession(roleKey, flowRef, flowRun.workspaceRoot);
    const lastMsg = existing ? (existing.transcriptHistory as RuntimeMessageParam[]).at(-1) : null;

    if (existing && lastMsg?.role === 'user') {
      session = existing;
      session.isActive = true;
      appendConversationMessagesToCurrentNode(session, nodeId, [lastMsg]);
    } else {
      const allFindingsFiles = locateAllFindingsFiles(recordFolderPath);
      const feedbackInstructionPath = runtimeFeedbackInstructionPath(flowRun);
      const userMessage = buildImprovementEntryMessage({
        stepLabel: 'feedback',
        recordFolderPath,
        workspaceRoot: flowRun.workspaceRoot,
        instructionFilePath: feedbackInstructionPath,
        findingsFilePaths: allFindingsFiles,
        contextLines: feedbackContextLines(flowRun),
        completionSignal: [
          'Findings from all roles in this flow are in your context.',
          `Produce the upstream feedback artifact at exactly this runtime-assigned path: ${assignedFeedbackRepoPath}.`,
          'Do not choose an alternate filename or location.',
          `When the feedback artifact is saved, emit a backward-pass-complete handoff block with artifact_path set exactly to ${assignedFeedbackRepoPath}.`
        ].join(' ')
      });
      session = {
        roleName,
        logicalSessionId: `${flowRun.flowId}__${roleKey}`,
        transcriptHistory: [{ role: 'user', content: userMessage }],
        isActive: true,
      };
      appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: userMessage }]);
    }

    SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);
    await saveImprovementPhase(flowRun, (phase) => {
      if (!(phase.startedRoles ?? []).includes(roleName)) {
        phase.startedRoles = [...(phase.startedRoles ?? []), roleName];
      }
    });
  }

  await runBackwardPassSessionUntilExpectedSignal(
    flowRun, roleName, RUNTIME_FEEDBACK_SYSTEM_PROMPT, session, 'backward-pass-complete', entry.role,
    roleOutputStream, renderer,
    (result) => {
      const actualArtifactPath = normalizeRepoRelativePath(result.artifactPath, flowRun.workspaceRoot);
      if (actualArtifactPath !== assignedFeedbackRepoPath) {
        return {
          code: 'assigned_feedback_path',
          operatorSummary: `${entry.role} used artifact_path ${actualArtifactPath}; expected ${assignedFeedbackRepoPath}`,
          modelRepairMessage: [
            'Error: This backward pass feedback step has a runtime-assigned artifact path.',
            `Write or move the feedback artifact to ${assignedFeedbackRepoPath}.`,
            `Then emit a backward-pass-complete handoff block with artifact_path set exactly to ${assignedFeedbackRepoPath}.`
          ].join(' ')
        };
      }
      if (!fs.existsSync(assignedFeedbackFilePath)) {
        return {
          code: 'missing_feedback_artifact',
          operatorSummary: `${entry.role} emitted backward-pass-complete before creating ${assignedFeedbackRepoPath}`,
          modelRepairMessage: [
            'Error: The runtime-assigned feedback artifact does not exist yet.',
            `Create ${assignedFeedbackRepoPath}.`,
            `Then emit a backward-pass-complete handoff block with artifact_path set exactly to ${assignedFeedbackRepoPath}.`
          ].join(' ')
        };
      }
      return null;
    }
  );
}

export class ImprovementOrchestrator {
  static markAwaitingChoice(
    flowRun: FlowRun,
    singleRole?: boolean,
  ): void {
    flowRun.status = 'awaiting_improvement_choice';
    flowRun.improvementPhase = {
      status: 'awaiting_choice',
      currentStep: 0,
      completedRoles: [],
      startedRoles: [],
      findingsProduced: {},
      activeNodeIds: [],
      completedNodeIds: [],
      feedbackArtifactPath: assignedFeedbackArtifactRelativePath(flowRun),
      feedbackConsent: FEEDBACK_CONSENT_STATUS.PENDING,
      singleRole: singleRole ?? false,
    };
    flowRun.stateVersion = CURRENT_FLOW_STATE_VERSION;
  }

  static async skipImprovement(flowRun: FlowRun, outputStream?: NodeJS.WritableStream): Promise<void> {
    if (!flowRun.improvementPhase) {
      throw new Error('[improvement] Cannot skip improvement: improvement phase state is missing.');
    }

    flowRun.status = 'completed';
    await saveImprovementPhase(flowRun, (phase) => {
      phase.status = 'skipped';
      phase.mode = IMPROVEMENT_CHOICE_MODE.NONE;
      phase.activeNodeIds = [];
      phase.feedbackArtifactPath = phase.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
    });
    outputStream?.write(`[improvement] No improvement selected. Record closed.\n`);
  }

  static async skipFeedback(flowRun: FlowRun, outputStream?: NodeJS.WritableStream): Promise<void> {
    const improvementPhase = flowRun.improvementPhase;
    if (!improvementPhase) {
      throw new Error('[improvement] Cannot skip feedback: improvement phase state is missing.');
    }

    flowRun.status = 'completed';
    await saveImprovementPhase(flowRun, (phase) => {
      phase.status = 'completed';
      phase.activeNodeIds = [];
      phase.feedbackArtifactPath = phase.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
      phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.DENIED;
    });
    outputStream?.write('[improvement] Upstream feedback skipped. Flow closed.\n');
  }

  static async runImprovement(
    flowRun: FlowRun,
    mode: ImprovementMode,
    outputStream: NodeJS.WritableStream,
    renderer: OperatorRenderSink,
    roleOutputStreamFactory?: (roleName: string) => NodeJS.WritableStream,
  ): Promise<void> {
    if (!flowRun.improvementPhase) {
      throw new Error('[improvement] Cannot start improvement: improvement phase state is missing.');
    }
    const recordFolderPath = flowRun.recordFolderPath;

    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('improvement.orchestrate', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'improvement.record_folder': recordFolderPath,
      }
    }, async (span) => {
      try {
        span.setAttribute('improvement.mode', mode);
        span.addEvent('improvement.mode_selected', { mode });
        const plan = computeBackwardPassPlan(recordFolderPath, FEEDBACK_ROLE, mode);
        const improvementWorkflowFilePath = writeImprovementWorkflow(recordFolderPath, plan, mode);

        const workflowRelPath = path.relative(flowRun.workspaceRoot, improvementWorkflowFilePath);
        flowRun.status = 'running';
        flowRun.stateVersion = CURRENT_FLOW_STATE_VERSION;
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'running';
          phase.mode = mode;
          phase.currentStep = 0;
          phase.completedRoles = [];
          phase.startedRoles = [];
          phase.findingsProduced = {};
          phase.improvementWorkflowPath = workflowRelPath;
          phase.activeNodeIds = [];
          phase.completedNodeIds = [];
          phase.feedbackArtifactPath = assignedFeedbackArtifactRelativePath(flowRun);
          phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.PENDING;
        });
        span.addEvent('store.flow_saved', { stage: 'improvement_initialized' });

        span.setAttribute('improvement.plan_step_count', plan.length);

        // Sequential steps
        for (let i = 0; i < plan.length; i++) {
          const group = plan[i];
          const isFeedback = group.some(e => e.stepType === 'feedback');
          if (isFeedback) {
            flowRun.status = 'awaiting_feedback_consent';
            await saveImprovementPhase(flowRun, (phase) => {
              phase.currentStep = i;
              phase.status = 'awaiting_feedback_consent';
              phase.activeNodeIds = [];
              phase.feedbackArtifactPath = phase.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
              phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.PENDING;
            });
            span.addEvent('store.flow_saved', { stage: 'awaiting_feedback_consent', step_index: i });
            outputStream.write(
              `[improvement] Meta-analysis complete. Awaiting feedback consent before writing ${flowRun.improvementPhase!.feedbackArtifactPath}.\n`
            );
            return;
          }

          const stepNodeIds = group.map(improvementNodeId);
          await saveImprovementPhase(flowRun, (phase) => {
            phase.currentStep = i;
            phase.activeNodeIds = stepNodeIds;
          });
          const spanName = 'improvement.meta_analysis.step';
          span.addEvent('improvement.step_started', {
            step_index: i,
            step_kind: isFeedback ? 'feedback' : 'meta-analysis',
            role_count: group.length,
            roles: group.map(entry => entry.role).join(','),
          });

          await tracer.startActiveSpan(spanName, {
            kind: SpanKind.INTERNAL,
            attributes: {
              'improvement.step_index': i,
              'improvement.step_kind': isFeedback ? 'feedback' : 'meta-analysis',
            }
          }, async (stepSpan) => {
            try {
              if (isFeedback) stepSpan.addEvent('improvement.feedback_started');
              // Concurrent roles within step
              await Promise.all(group.map(async (entry) => {
                const graphNodeId = improvementNodeId(entry);
                const roleOutputStream = roleOutputStreamFactory?.(entry.role) ?? outputStream;
                if (entry.stepType === 'meta-analysis') {
                  await runMetaAnalysisEntry(flowRun, entry, outputStream, roleOutputStream, renderer);
                }
                await saveImprovementPhase(flowRun, (phase) => {
                  if (!phase.completedRoles.includes(entry.role)) {
                    phase.completedRoles = [...phase.completedRoles, entry.role];
                  }
                  phase.activeNodeIds = (phase.activeNodeIds ?? []).filter(id => id !== graphNodeId);
                  if (!(phase.completedNodeIds ?? []).includes(graphNodeId)) {
                    phase.completedNodeIds = [...(phase.completedNodeIds ?? []), graphNodeId];
                  }
                });
              }));
              span.addEvent('store.flow_saved', { stage: 'step_completed', step_index: i });
              span.addEvent('improvement.step_completed', {
                step_index: i,
                step_kind: isFeedback ? 'feedback' : 'meta-analysis',
                completed_roles: group.map(entry => entry.role).join(','),
              });
            } finally {
              stepSpan.end();
            }
          });
        }

        const finalNodeIds = plan.flatMap(g => g.map(improvementNodeId));
        flowRun.status = 'completed';
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'completed';
          phase.activeNodeIds = [];
          phase.completedNodeIds = finalNodeIds;
        });
        span.addEvent('store.flow_saved', { stage: 'improvement_completed' });
        outputStream.write(`[improvement] Improvement phase complete. Flow closed.\n`);
      } catch (e: any) {
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw e;
      } finally {
        span.end();
      }
    });
  }

  static async runFeedback(
    flowRun: FlowRun,
    outputStream: NodeJS.WritableStream,
    renderer: OperatorRenderSink,
    roleOutputStreamFactory?: (roleName: string) => NodeJS.WritableStream,
  ): Promise<void> {
    if (!flowRun.improvementPhase) {
      throw new Error('[improvement] Cannot run feedback: improvement phase state is missing.');
    }
    const recordFolderPath = flowRun.recordFolderPath;

    const currentStep = flowRun.improvementPhase?.currentStep;
    if (currentStep === undefined) {
      throw new Error('[improvement] Cannot run feedback: improvement step index is missing.');
    }

    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('improvement.feedback', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'improvement.record_folder': recordFolderPath,
      }
    }, async (span) => {
      try {
        const mode = flowRun.improvementPhase?.mode;
        if (!mode || mode === IMPROVEMENT_CHOICE_MODE.NONE) {
          throw new Error('[improvement] Cannot run feedback: improvement mode is missing.');
        }

        const plan = computeBackwardPassPlan(recordFolderPath, FEEDBACK_ROLE, mode);
        const group = plan[currentStep];
        if (!group || !group.some(entry => entry.stepType === 'feedback')) {
          throw new Error('[improvement] Cannot run feedback: the current improvement step is not a feedback step.');
        }

        const assignedFeedbackRepoPath = flowRun.improvementPhase?.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
        const assignedFeedbackFilePath = path.resolve(flowRun.workspaceRoot, assignedFeedbackRepoPath);
        fs.mkdirSync(path.dirname(assignedFeedbackFilePath), { recursive: true });

        const existingPhase = flowRun.improvementPhase;
        if (!existingPhase) {
          throw new Error('[improvement] Cannot run feedback: improvement phase state is incomplete.');
        }

        const feedbackStepNodeIds = group.map(improvementNodeId);
        flowRun.status = 'running';
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'running';
          phase.activeNodeIds = feedbackStepNodeIds;
          phase.feedbackArtifactPath = assignedFeedbackRepoPath;
          phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.GRANTED;
        });
        span.addEvent('store.flow_saved', { stage: 'feedback_started', step_index: currentStep });

        const feedbackEntry = group[0];
        const feedbackGraphNodeId = improvementNodeId(feedbackEntry);
        const feedbackRoleOutputStream = roleOutputStreamFactory?.(feedbackEntry.role) ?? outputStream;
        await runFeedbackEntry(flowRun, feedbackEntry, assignedFeedbackRepoPath, assignedFeedbackFilePath, feedbackRoleOutputStream, renderer);
        await saveImprovementPhase(flowRun, (phase) => {
          if (!phase.completedRoles.includes(feedbackEntry.role)) {
            phase.completedRoles = [...phase.completedRoles, feedbackEntry.role];
          }
          phase.activeNodeIds = [];
          if (!(phase.completedNodeIds ?? []).includes(feedbackGraphNodeId)) {
            phase.completedNodeIds = [...(phase.completedNodeIds ?? []), feedbackGraphNodeId];
          }
        });

        const feedbackFinalNodeIds = plan.flatMap(g => g.map(improvementNodeId));
        flowRun.status = 'completed';
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'completed';
          phase.activeNodeIds = [];
          phase.completedNodeIds = feedbackFinalNodeIds;
          phase.feedbackArtifactPath = assignedFeedbackRepoPath;
          phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.GRANTED;
        });
        span.addEvent('store.flow_saved', { stage: 'feedback_completed' });
        outputStream.write('[improvement] Improvement phase complete. Flow closed.\n');
      } catch (e: any) {
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw e;
      } finally {
        span.end();
      }
    });
  }

  static async resumeImprovement(
    flowRun: FlowRun,
    outputStream: NodeJS.WritableStream,
    renderer: OperatorRenderSink,
    roleOutputStreamFactory?: (roleName: string) => NodeJS.WritableStream,
  ): Promise<void> {
    const improvementPhase = flowRun.improvementPhase;
    if (!improvementPhase) {
      throw new Error('[improvement] Cannot resume improvement: improvement phase state is missing.');
    }
    const mode = improvementPhase.mode;
    if (!mode || mode === IMPROVEMENT_CHOICE_MODE.NONE) {
      throw new Error('[improvement] Cannot resume improvement: improvement mode is missing.');
    }

    const recordFolderPath = flowRun.recordFolderPath;
    const startStep = improvementPhase.currentStep ?? 0;

    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('improvement.resume', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'improvement.record_folder': recordFolderPath,
        'improvement.start_step': startStep,
      }
    }, async (span) => {
      try {
        const plan = computeBackwardPassPlan(recordFolderPath, FEEDBACK_ROLE, mode);
        span.setAttribute('improvement.plan_step_count', plan.length);

        for (let i = startStep; i < plan.length; i++) {
          flowRun.improvementPhase!.currentStep = i;
          const group = plan[i];
          const isFeedback = group.some(e => e.stepType === 'feedback');

          if (isFeedback) {
            const feedbackEntry = group[0];
            if (!(flowRun.improvementPhase!.startedRoles ?? []).includes(feedbackEntry.role)) {
              flowRun.status = 'awaiting_feedback_consent';
              await saveImprovementPhase(flowRun, (phase) => {
                phase.currentStep = i;
                phase.status = 'awaiting_feedback_consent';
                phase.activeNodeIds = [];
                phase.feedbackArtifactPath = phase.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
                phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.PENDING;
              });
              outputStream.write(
                `[improvement] Meta-analysis complete. Awaiting feedback consent before writing ${flowRun.improvementPhase!.feedbackArtifactPath}.\n`
              );
              return;
            }
          }

          const resumeStepNodeIds = group.map(improvementNodeId);
          await saveImprovementPhase(flowRun, (phase) => {
            phase.currentStep = i;
            phase.activeNodeIds = resumeStepNodeIds;
          });

          const spanName = isFeedback ? 'improvement.feedback' : 'improvement.meta_analysis.step';
          span.addEvent('improvement.step_started', {
            step_index: i,
            step_kind: isFeedback ? 'feedback' : 'meta-analysis',
            role_count: group.length,
            roles: group.map(entry => entry.role).join(','),
          });

          await tracer.startActiveSpan(spanName, {
            kind: SpanKind.INTERNAL,
            attributes: {
              'improvement.step_index': i,
              'improvement.step_kind': isFeedback ? 'feedback' : 'meta-analysis',
            }
          }, async (stepSpan) => {
            try {
              if (isFeedback) {
                const assignedFeedbackRepoPath = flowRun.improvementPhase!.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
                const assignedFeedbackFilePath = path.resolve(flowRun.workspaceRoot, assignedFeedbackRepoPath);
                fs.mkdirSync(path.dirname(assignedFeedbackFilePath), { recursive: true });

                const feedbackEntry = group[0];
                if (!flowRun.improvementPhase!.completedRoles.includes(feedbackEntry.role)) {
                  const feedbackGraphNodeId = improvementNodeId(feedbackEntry);
                  const feedbackRoleOutputStream = roleOutputStreamFactory?.(feedbackEntry.role) ?? outputStream;
                  await runFeedbackEntry(flowRun, feedbackEntry, assignedFeedbackRepoPath, assignedFeedbackFilePath, feedbackRoleOutputStream, renderer);
                  await saveImprovementPhase(flowRun, (phase) => {
                    if (!phase.completedRoles.includes(feedbackEntry.role)) {
                      phase.completedRoles = [...phase.completedRoles, feedbackEntry.role];
                    }
                    phase.activeNodeIds = [];
                    if (!(phase.completedNodeIds ?? []).includes(feedbackGraphNodeId)) {
                      phase.completedNodeIds = [...(phase.completedNodeIds ?? []), feedbackGraphNodeId];
                    }
                  });
                }
              } else {
                await Promise.all(group.map(async (entry) => {
                  if (flowRun.improvementPhase!.completedRoles.includes(entry.role)) return;
                  const roleOutputStream = roleOutputStreamFactory?.(entry.role) ?? outputStream;
                  await runMetaAnalysisEntry(flowRun, entry, outputStream, roleOutputStream, renderer);
                  const graphNodeId = improvementNodeId(entry);
                  await saveImprovementPhase(flowRun, (phase) => {
                    if (!phase.completedRoles.includes(entry.role)) {
                      phase.completedRoles = [...phase.completedRoles, entry.role];
                    }
                    phase.activeNodeIds = (phase.activeNodeIds ?? []).filter(id => id !== graphNodeId);
                    if (!(phase.completedNodeIds ?? []).includes(graphNodeId)) {
                      phase.completedNodeIds = [...(phase.completedNodeIds ?? []), graphNodeId];
                    }
                  });
                }));
              }
              span.addEvent('store.flow_saved', { stage: 'step_completed', step_index: i });
              span.addEvent('improvement.step_completed', {
                step_index: i,
                step_kind: isFeedback ? 'feedback' : 'meta-analysis',
                completed_roles: group.map(entry => entry.role).join(','),
              });
            } finally {
              stepSpan.end();
            }
          });
        }

        const resumeFinalNodeIds = plan.flatMap(g => g.map(improvementNodeId));
        flowRun.status = 'completed';
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'completed';
          phase.activeNodeIds = [];
          phase.completedNodeIds = resumeFinalNodeIds;
        });
        span.addEvent('store.flow_saved', { stage: 'improvement_completed' });
        outputStream.write('[improvement] Improvement phase complete. Flow closed.\n');
      } catch (e: any) {
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw e;
      } finally {
        span.end();
      }
    });
  }
}
