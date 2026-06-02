import fs from 'node:fs';
import path from 'node:path';
import {
  type BackwardPassEntry,
  type BackwardPassPlan,
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
import type { ConsentGate, FlowRun, HandoffResult, ImprovementPhaseState, OperatorRenderSink, RoleSession, RuntimeMessageParam } from '../common/types.js';
import {
  FEEDBACK_CONSENT_STATUS,
  IMPROVEMENT_CHOICE_MODE,
  OWNER_BASE_ROLE_ID,
} from '../common/protocol-constants.js';
import { HandoffParseError } from '../orchestration/handoff.js';
import { TelemetryManager } from '../observability/observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { buildRuntimeHealthRepairGuidance, runRuntimeHealthChecks } from '../framework-services/runtime-health-checks.js';
import { writeImprovementWorkflow } from './improvement-workflow.js';
import { WakeController } from '../common/wake-controller.js';
import { upsertAssistantDelta, removeAssistantDraftBeforeToolCalls, upsertCurrentNodeAssistantDelta, appendConversationMessagesToCurrentNode, INTERRUPTED_TURN_CONTINUATION_MESSAGE } from '../common/history.js';

const FEEDBACK_ROLE = 'a-society-feedback';
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

/**
 * Per-role abort and wake-sleep mechanism passed from the server session into the
 * improvement orchestrator. Each role registers its own abort controller so the
 * stop button can target individual roles while others keep running concurrently.
 */
export interface ImprovementScheduler {
  registerRoleTurn(roleInstanceId: string): AbortSignal;
  unregisterRoleTurn(roleInstanceId: string): void;
  observeWakeGeneration(): number;
  waitForWakeAfter(generation: number): { promise: Promise<void>; cancel: () => void };
}

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
  roleInstanceId: string,
  expectedKind: ExpectedImprovementSignalKind
): string {
  if (expectedKind === 'meta-analysis-complete') {
    return [
      `Error: This backward pass meta-analysis session for ${roleInstanceId} must end with a \`type: meta-analysis-complete\` handoff block.`,
      'Set `findings_path` to the repo-relative path of the findings artifact you produced in this session.',
      'Do not emit `prompt-human`, `forward-pass-closed`, `backward-pass-complete`, or a routing handoff for this step.'
    ].join(' ');
  }

  return [
    `Error: This backward pass feedback session for ${roleInstanceId} must end with a \`type: backward-pass-complete\` handoff block.`,
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

  lines.push('Flow kind: standard');
  lines.push('Focus on reusable framework gaps, workflow friction, runtime issues, and cross-project patterns surfaced by this flow.');
  return lines;
}

async function runBackwardPassSessionUntilExpectedSignal<K extends ExpectedImprovementSignalKind>(
  flowRun: FlowRun,
  roleInstanceId: string,
  bundleContent: string,
  session: RoleSession,
  expectedKind: K,
  roleOutputStream: NodeJS.WritableStream | undefined,
  renderer: OperatorRenderSink,
  signal: AbortSignal,
  consentGate?: ConsentGate,
  validateExpectedSignal?: ExpectedSignalValidator<K>,
): Promise<ExpectedImprovementSignal<K> | null> {
  const history = session.transcriptHistory as RuntimeMessageParam[];
  const stepLabel = describeExpectedStep(expectedKind);
  const nodeId = `${roleInstanceId}-${stepLabel}`;
  const flowRef = SessionStore.flowRef(flowRun);
  const saveSession = () => SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);

  while (true) {
    try {
      const sessionResult = await runRoleTurn({
        workspaceRoot: flowRun.workspaceRoot,
        roleInstanceId,
        providedSystemPrompt: bundleContent,
        flowRef,
        providedHistory: history,
        roleOutputStream,
        externalSignal: signal,
        operatorRenderer: renderer,
        consentGate,
        onConversationMessages: async (messages) => {
          removeAssistantDraftBeforeToolCalls(history, messages);
          appendConversationMessagesToCurrentNode(session, nodeId, messages);
          saveSession();
        },
        onAssistantTextDelta: (text) => {
          upsertAssistantDelta(history, text);
          upsertCurrentNodeAssistantDelta(session, nodeId, text);
          saveSession();
        },
        nodeId,
      });

      if (sessionResult === null) {
        if (signal?.aborted) {
          session.isActive = false;
          saveSession();
          await saveImprovementPhase(flowRun, (p) => {
            if (!p.awaitingHumanRoles) p.awaitingHumanRoles = {};
            p.awaitingHumanRoles[roleInstanceId] = { reason: 'autonomous-abort' };
          });
          return null;
        }
        throw new Error(`[improvement] ${expectedKind} session for ${roleInstanceId} ended unexpectedly without a handoff result.`);
      }
      const result = sessionResult.handoff;

      if (result.kind === 'awaiting_human') {
        session.isActive = false;
        saveSession();
        await saveImprovementPhase(flowRun, (p) => {
          if (!p.awaitingHumanRoles) p.awaitingHumanRoles = {};
          p.awaitingHumanRoles[roleInstanceId] = { reason: sessionResult.awaitingHumanReason ?? 'prompt-human' };
        });
        return null;
      }

      if (result.kind === expectedKind) {
        if (expectedKind === 'meta-analysis-complete' && roleInstanceId === OWNER_BASE_ROLE_ID) {
          const healthCheck = runRuntimeHealthChecks(flowRun.workspaceRoot, flowRun.projectNamespace);
          if (!healthCheck.ok) {
            const guidance = buildRuntimeHealthRepairGuidance(
              healthCheck.errors,
              'meta-analysis-complete'
            );
            renderer.emit({
              kind: 'repair.requested',
              scope: 'improvement',
              code: 'runtime_health',
              summary: guidance.operatorSummary,
              role: roleInstanceId
            });
            history.push({ role: 'user', content: guidance.modelRepairMessage });
            continue;
          }
        }

        const repair = validateExpectedSignal?.(result as ExpectedImprovementSignal<K>);
        if (repair) {
          renderer.emit({
            kind: 'repair.requested',
            scope: 'improvement',
            code: repair.code,
            summary: repair.operatorSummary,
            role: roleInstanceId
          });
          history.push({ role: 'user', content: repair.modelRepairMessage });
          continue;
        }

        session.isActive = false;
        saveSession();
        return result as ExpectedImprovementSignal<K>;
      }

      renderer.emit({
        kind: 'repair.requested',
        scope: 'improvement',
        code: 'unexpected_signal',
        summary: `${roleInstanceId} emitted ${describeUnexpectedSignal(result)} during backward pass ${stepLabel}`,
        role: roleInstanceId
      });
      history.push({
        role: 'user',
        content: buildUnexpectedSignalRepairMessage(roleInstanceId, expectedKind)
      });
    } catch (error: any) {
      if (error instanceof HandoffParseError) {
        renderer.emit({
          kind: 'repair.requested',
          scope: 'improvement',
          code: error.details.code,
          summary: error.details.operatorSummary,
          role: roleInstanceId
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
  roleOutputStream: NodeJS.WritableStream | undefined,
  renderer: OperatorRenderSink,
  scheduler: ImprovementScheduler,
  consentGate?: ConsentGate,
): Promise<void> {
  const roleInstanceId = entry.role;
  const recordFolderPath = flowRun.recordFolderPath;

  const findingsRoles = entry.findingsRolesToInject;
  const assignedFindingsFilePath = deterministicFindingsFilePath(recordFolderPath, roleInstanceId);
  fs.mkdirSync(path.dirname(assignedFindingsFilePath), { recursive: true });
  const assignedFindingsRepoPath = normalizeRepoRelativePath(assignedFindingsFilePath, flowRun.workspaceRoot);

  const nodeId = `${roleInstanceId}-meta-analysis`;
  const flowRef = SessionStore.flowRef(flowRun);
  const phase = flowRun.improvementPhase!;
  const isRunning = phase.runningRoles.includes(roleInstanceId);

  const hasPendingInput = !!phase.pendingHumanInputs?.[roleInstanceId];
  const isAwaitingHuman = !!phase.awaitingHumanRoles?.[roleInstanceId];

  if (!isRunning) {
    renderer.emit({ kind: 'role.active', nodeId: roleInstanceId, role: roleInstanceId });
  } else if (!hasPendingInput) {
    renderer.emit({ kind: 'role.resumed', nodeId: roleInstanceId, role: roleInstanceId, reason: 'interrupted-turn' });
  }

  let session: RoleSession;

  if (isRunning) {
    const loaded = SessionStore.loadRoleSession(roleInstanceId, flowRef, flowRun.workspaceRoot);
    if (!loaded) throw new Error(`[improvement] ${roleInstanceId} is in runningRoles but no session found on disk.`);
    session = loaded;
    session.isActive = true;

    if (hasPendingInput && isAwaitingHuman) {
      const inputText = phase.pendingHumanInputs![roleInstanceId].text;
      const lastMsg = (session.transcriptHistory as RuntimeMessageParam[]).at(-1);
      if (lastMsg?.role === 'user') {
        lastMsg.content += '\n\n' + inputText;
        appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: inputText }]);
      } else {
        (session.transcriptHistory as RuntimeMessageParam[]).push({ role: 'user', content: inputText });
        appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: inputText }]);
      }
      await saveImprovementPhase(flowRun, (p) => {
        delete p.pendingHumanInputs?.[roleInstanceId];
        delete p.awaitingHumanRoles?.[roleInstanceId];
      });
    } else {
      // Crash resume: if turn was interrupted mid-stream, append continuation prompt
      const lastMsg = (session.transcriptHistory as RuntimeMessageParam[]).at(-1);
      if (lastMsg?.role === 'assistant') {
        (session.transcriptHistory as RuntimeMessageParam[]).push({ role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE });
        appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE }]);
      }
    }
    SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);
  } else {
    // Defense: session may already exist with context injected if we crashed between inject and runningRoles save
    const existing = SessionStore.loadRoleSession(roleInstanceId, flowRef, flowRun.workspaceRoot);
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
          roleName: roleInstanceId,
          logicalSessionId: `${flowRun.flowId}__${roleInstanceId}`,
          transcriptHistory: [],
          isActive: true,
        };
      }
      (session.transcriptHistory as RuntimeMessageParam[]).push({ role: 'user', content: userMessage });
      appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: userMessage }]);
    }

    SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);
    await saveImprovementPhase(flowRun, (p) => {
      if (!p.runningRoles.includes(roleInstanceId)) {
        p.runningRoles = [...p.runningRoles, roleInstanceId];
      }
    });
  }

  if (!session.systemPrompt) {
    session.systemPrompt = ContextInjectionService.buildContextBundle(
      flowRun.projectNamespace, roleInstanceId, flowRun.workspaceRoot, flowRun.recordFolderPath
    ).bundleContent;
  }

  const signal = scheduler.registerRoleTurn(roleInstanceId);
  try {
    const completed = await runBackwardPassSessionUntilExpectedSignal(
      flowRun, roleInstanceId, session.systemPrompt, session, 'meta-analysis-complete',
      roleOutputStream, renderer,
      signal, consentGate,
      (r) => {
        const actualFindingsPath = normalizeRepoRelativePath(r.findingsPath, flowRun.workspaceRoot);
        if (actualFindingsPath !== assignedFindingsRepoPath) {
          return {
            code: 'assigned_findings_path',
            operatorSummary: `${roleInstanceId} used findings_path ${actualFindingsPath}; expected ${assignedFindingsRepoPath}`,
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
            operatorSummary: `${roleInstanceId} emitted meta-analysis-complete before creating ${assignedFindingsRepoPath}`,
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

    if (!completed) return; // role is now awaiting human input; awaitingHumanRoles already saved

    await saveImprovementPhase(flowRun, (p) => {
      p.findingsProduced = { ...p.findingsProduced, [roleInstanceId]: assignedFindingsRepoPath };
      if (!p.completedRoles.includes(roleInstanceId)) {
        p.completedRoles = [...p.completedRoles, roleInstanceId];
      }
      p.runningRoles = p.runningRoles.filter(r => r !== roleInstanceId);
    });
  } finally {
    scheduler.unregisterRoleTurn(roleInstanceId);
  }
}

async function runFeedbackEntry(
  flowRun: FlowRun,
  entry: BackwardPassEntry,
  assignedFeedbackRepoPath: string,
  assignedFeedbackFilePath: string,
  roleOutputStream: NodeJS.WritableStream | undefined,
  renderer: OperatorRenderSink,
  scheduler: ImprovementScheduler,
  consentGate?: ConsentGate,
): Promise<void> {
  const roleInstanceId = entry.role;
  const recordFolderPath = flowRun.recordFolderPath;

  const nodeId = `${roleInstanceId}-feedback`;
  const flowRef = SessionStore.flowRef(flowRun);
  const phase = flowRun.improvementPhase!;
  const isRunning = phase.runningRoles.includes(roleInstanceId);

  const hasPendingInput = !!phase.pendingHumanInputs?.[roleInstanceId];
  const isAwaitingHuman = !!phase.awaitingHumanRoles?.[roleInstanceId];

  if (!isRunning) {
    renderer.emit({ kind: 'role.active', nodeId: roleInstanceId, role: roleInstanceId });
  } else if (!hasPendingInput) {
    renderer.emit({ kind: 'role.resumed', nodeId: roleInstanceId, role: roleInstanceId, reason: 'interrupted-turn' });
  }

  let session: RoleSession;

  if (isRunning) {
    const loaded = SessionStore.loadRoleSession(roleInstanceId, flowRef, flowRun.workspaceRoot);
    if (!loaded) throw new Error(`[improvement] ${roleInstanceId} is in runningRoles but no session found on disk.`);
    session = loaded;
    session.isActive = true;

    if (hasPendingInput && isAwaitingHuman) {
      const inputText = phase.pendingHumanInputs![roleInstanceId].text;
      const lastMsg = (session.transcriptHistory as RuntimeMessageParam[]).at(-1);
      if (lastMsg?.role === 'user') {
        lastMsg.content += '\n\n' + inputText;
        appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: inputText }]);
      } else {
        (session.transcriptHistory as RuntimeMessageParam[]).push({ role: 'user', content: inputText });
        appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: inputText }]);
      }
      await saveImprovementPhase(flowRun, (p) => {
        delete p.pendingHumanInputs?.[roleInstanceId];
        delete p.awaitingHumanRoles?.[roleInstanceId];
      });
    } else {
      const lastMsg = (session.transcriptHistory as RuntimeMessageParam[]).at(-1);
      if (lastMsg?.role === 'assistant') {
        (session.transcriptHistory as RuntimeMessageParam[]).push({ role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE });
        appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE }]);
      }
    }
    SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);
  } else {
    // Defense: session may already exist with context injected if we crashed between inject and runningRoles save
    const existing = SessionStore.loadRoleSession(roleInstanceId, flowRef, flowRun.workspaceRoot);
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
        roleName: roleInstanceId,
        logicalSessionId: `${flowRun.flowId}__${roleInstanceId}`,
        transcriptHistory: [{ role: 'user', content: userMessage }],
        isActive: true,
      };
      appendConversationMessagesToCurrentNode(session, nodeId, [{ role: 'user', content: userMessage }]);
    }

    SessionStore.saveRoleSession(session, flowRef, flowRun.workspaceRoot);
    await saveImprovementPhase(flowRun, (p) => {
      if (!p.runningRoles.includes(roleInstanceId)) {
        p.runningRoles = [...p.runningRoles, roleInstanceId];
      }
    });
  }

  const signal = scheduler.registerRoleTurn(roleInstanceId);
  try {
    const completed = await runBackwardPassSessionUntilExpectedSignal(
      flowRun, roleInstanceId, RUNTIME_FEEDBACK_SYSTEM_PROMPT, session, 'backward-pass-complete',
      roleOutputStream, renderer,
      signal, consentGate,
      (r) => {
        const actualArtifactPath = normalizeRepoRelativePath(r.artifactPath, flowRun.workspaceRoot);
        if (actualArtifactPath !== assignedFeedbackRepoPath) {
          return {
            code: 'assigned_feedback_path',
            operatorSummary: `${roleInstanceId} used artifact_path ${actualArtifactPath}; expected ${assignedFeedbackRepoPath}`,
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
            operatorSummary: `${roleInstanceId} emitted backward-pass-complete before creating ${assignedFeedbackRepoPath}`,
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

    if (!completed) return; // role is now awaiting human input; awaitingHumanRoles already saved

    await saveImprovementPhase(flowRun, (p) => {
      if (!p.completedRoles.includes(roleInstanceId)) {
        p.completedRoles = [...p.completedRoles, roleInstanceId];
      }
      p.runningRoles = p.runningRoles.filter(r => r !== roleInstanceId);
    });
  } finally {
    scheduler.unregisterRoleTurn(roleInstanceId);
  }
}

function metaEntries(plan: BackwardPassPlan): BackwardPassEntry[] {
  return plan.entries.filter(entry => entry.stepType === 'meta-analysis');
}

function feedbackEntry(plan: BackwardPassPlan): BackwardPassEntry {
  const entry = plan.entries.find(candidate => candidate.stepType === 'feedback');
  if (!entry) {
    throw new Error('[improvement] Cannot run improvement: feedback entry is missing.');
  }
  return entry;
}

function incomingImprovementEdges(plan: BackwardPassPlan): Map<string, string[]> {
  const incoming = new Map(plan.entries.map(entry => [entry.role, [] as string[]]));
  for (const edge of plan.edges) {
    const targets = incoming.get(edge.to);
    if (targets) targets.push(edge.from);
  }
  return incoming;
}

function runnableMetaEntries(plan: BackwardPassPlan, phase: ImprovementPhaseState): BackwardPassEntry[] {
  const completedRoles = new Set(phase.completedRoles);
  const incoming = incomingImprovementEdges(plan);

  return metaEntries(plan).filter(entry => {
    if (completedRoles.has(entry.role)) return false;
    const dependencies = incoming.get(entry.role) ?? [];
    if (!dependencies.every(role => completedRoles.has(role))) return false;

    const isAwaiting = !!phase.awaitingHumanRoles?.[entry.role];
    const hasPendingInput = !!phase.pendingHumanInputs?.[entry.role];
    return !isAwaiting || hasPendingInput;
  });
}

function allMetaEntriesComplete(plan: BackwardPassPlan, phase: ImprovementPhaseState): boolean {
  const completedRoles = new Set(phase.completedRoles);
  return metaEntries(plan).every(entry => completedRoles.has(entry.role));
}

/**
 * Runs the meta-analysis DAG until every meta node is complete, then pauses at
 * the feedback-consent gate. Returns false because feedback requires consent.
 */
async function runMetaAnalysisGraph(
  flowRun: FlowRun,
  plan: BackwardPassPlan,
  renderer: OperatorRenderSink,
  roleOutputStreamFactory: ((roleInstanceId: string) => NodeJS.WritableStream) | undefined,
  scheduler: ImprovementScheduler,
  consentGate?: ConsentGate,
): Promise<boolean> {
  const flowRef = SessionStore.flowRef(flowRun);

  while (true) {
    const freshFlow = SessionStore.loadFlowRun(flowRef, flowRun.workspaceRoot)!;
    const phase = freshFlow.improvementPhase!;

    if (allMetaEntriesComplete(plan, phase)) {
      flowRun.status = 'awaiting_feedback_consent';
      await saveImprovementPhase(flowRun, (phase) => {
        phase.status = 'awaiting_feedback_consent';
        phase.feedbackArtifactPath = phase.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
        phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.PENDING;
      });
      return false;
    }

    const runnable = runnableMetaEntries(plan, phase);

    if (runnable.length === 0) {
      const gen = scheduler.observeWakeGeneration();
      await scheduler.waitForWakeAfter(gen).promise;
      continue;
    }

    await Promise.all(runnable.map(async (entry) => {
      const roleOutputStream = roleOutputStreamFactory?.(entry.role);
      await runMetaAnalysisEntry(freshFlow, entry, roleOutputStream, renderer, scheduler, consentGate);
    }));
  }
}

export class ImprovementOrchestrator {
  private turnControllers = new Map<string, AbortController>();
  private wakeController = new WakeController();

  public wake(): void {
    this.wakeController.wake();
  }

  public abortActiveTurn(roleInstanceId?: string): boolean {
    let stopped = false;
    for (const [activeRoleInstanceId, controller] of this.turnControllers) {
      if (roleInstanceId && roleInstanceId !== activeRoleInstanceId) continue;
      if (controller.signal.aborted) continue;
      controller.abort();
      stopped = true;
    }
    return stopped;
  }

  public hasActiveTurn(roleInstanceId?: string): boolean {
    for (const [activeRoleInstanceId, controller] of this.turnControllers) {
      if (roleInstanceId && roleInstanceId !== activeRoleInstanceId) continue;
      if (!controller.signal.aborted) return true;
    }
    return false;
  }

  public readonly improvementScheduler: ImprovementScheduler = {
    registerRoleTurn: (roleInstanceId: string): AbortSignal => {
      const controller = new AbortController();
      this.turnControllers.set(roleInstanceId, controller);
      return controller.signal;
    },
    unregisterRoleTurn: (roleInstanceId: string): void => {
      this.turnControllers.delete(roleInstanceId);
    },
    observeWakeGeneration: () => this.wakeController.observe(),
    waitForWakeAfter: (observed: number) => this.wakeController.waitForWakeAfter(observed),
  };

  static markAwaitingChoice(
    flowRun: FlowRun,
    singleRole?: boolean,
  ): void {
    flowRun.status = 'awaiting_improvement_choice';
    flowRun.improvementPhase = {
      status: 'awaiting_choice',
      completedRoles: [],
      runningRoles: [],
      findingsProduced: {},
      feedbackArtifactPath: assignedFeedbackArtifactRelativePath(flowRun),
      feedbackConsent: FEEDBACK_CONSENT_STATUS.PENDING,
      singleRole: singleRole ?? false,
    };
    flowRun.stateVersion = CURRENT_FLOW_STATE_VERSION;
  }

  static async skipImprovement(flowRun: FlowRun): Promise<void> {
    if (!flowRun.improvementPhase) {
      throw new Error('[improvement] Cannot skip improvement: improvement phase state is missing.');
    }

    flowRun.status = 'completed';
    await saveImprovementPhase(flowRun, (phase) => {
      phase.status = 'skipped';
      phase.mode = IMPROVEMENT_CHOICE_MODE.NONE;
      phase.feedbackArtifactPath = phase.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
    });
  }

  static async skipFeedback(flowRun: FlowRun): Promise<void> {
    const improvementPhase = flowRun.improvementPhase;
    if (!improvementPhase) {
      throw new Error('[improvement] Cannot skip feedback: improvement phase state is missing.');
    }

    flowRun.status = 'completed';
    await saveImprovementPhase(flowRun, (phase) => {
      phase.status = 'completed';
      phase.feedbackArtifactPath = phase.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
      phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.DENIED;
    });
  }

  async runImprovement(
    flowRun: FlowRun,
    mode: ImprovementMode,
    renderer: OperatorRenderSink,
    roleOutputStreamFactory?: (roleInstanceId: string) => NodeJS.WritableStream,
    consentGate?: ConsentGate,
  ): Promise<void> {
    const scheduler = this.improvementScheduler;
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
          phase.completedRoles = [];
          phase.runningRoles = [];
          phase.awaitingHumanRoles = {};
          phase.pendingHumanInputs = {};
          phase.findingsProduced = {};
          phase.improvementWorkflowPath = workflowRelPath;
          phase.feedbackArtifactPath = assignedFeedbackArtifactRelativePath(flowRun);
          phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.PENDING;
        });
        span.addEvent('store.flow_saved', { stage: 'improvement_initialized' });
        span.setAttribute('improvement.plan_node_count', plan.entries.length);

        const allDone = await runMetaAnalysisGraph(
          flowRun, plan, renderer, roleOutputStreamFactory, scheduler, consentGate
        );

        if (!allDone) return; // paused for feedback consent

        flowRun.status = 'completed';
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'completed';
        });
        span.addEvent('store.flow_saved', { stage: 'improvement_completed' });
      } catch (e: any) {
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw e;
      } finally {
        span.end();
      }
    });
  }

  async runFeedback(
    flowRun: FlowRun,
    renderer: OperatorRenderSink,
    roleOutputStreamFactory?: (roleInstanceId: string) => NodeJS.WritableStream,
    consentGate?: ConsentGate,
  ): Promise<void> {
    const scheduler = this.improvementScheduler;
    if (!flowRun.improvementPhase) {
      throw new Error('[improvement] Cannot run feedback: improvement phase state is missing.');
    }
    const recordFolderPath = flowRun.recordFolderPath;

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
        const improvementWorkflowFilePath = writeImprovementWorkflow(recordFolderPath, plan, mode);
        const workflowRelPath = path.relative(flowRun.workspaceRoot, improvementWorkflowFilePath);
        const entry = feedbackEntry(plan);

        const assignedFeedbackRepoPath = flowRun.improvementPhase?.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
        const assignedFeedbackFilePath = path.resolve(flowRun.workspaceRoot, assignedFeedbackRepoPath);
        fs.mkdirSync(path.dirname(assignedFeedbackFilePath), { recursive: true });

        flowRun.status = 'running';
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'running';
          phase.improvementWorkflowPath = workflowRelPath;
          phase.feedbackArtifactPath = assignedFeedbackRepoPath;
          phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.GRANTED;
        });
        span.addEvent('store.flow_saved', { stage: 'feedback_started' });

        // Feedback is a single terminal node after all meta-analysis findings are complete.
        const flowRef = SessionStore.flowRef(flowRun);
        while (true) {
          const freshFlow = SessionStore.loadFlowRun(flowRef, flowRun.workspaceRoot)!;
          const phase = freshFlow.improvementPhase!;

          if (phase.completedRoles.includes(entry.role)) break;

          const isAwaiting = !!phase.awaitingHumanRoles?.[entry.role];
          const hasPendingInput = !!phase.pendingHumanInputs?.[entry.role];
          if (isAwaiting && !hasPendingInput) {
            const gen = scheduler.observeWakeGeneration();
            await scheduler.waitForWakeAfter(gen).promise;
            continue;
          }

          const feedbackRoleOutputStream = roleOutputStreamFactory?.(entry.role);
          await runFeedbackEntry(freshFlow, entry, assignedFeedbackRepoPath, assignedFeedbackFilePath, feedbackRoleOutputStream, renderer, scheduler, consentGate);
        }

        flowRun.status = 'completed';
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'completed';
          phase.feedbackArtifactPath = assignedFeedbackRepoPath;
          phase.feedbackConsent = FEEDBACK_CONSENT_STATUS.GRANTED;
        });
        span.addEvent('store.flow_saved', { stage: 'feedback_completed' });
      } catch (e: any) {
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw e;
      } finally {
        span.end();
      }
    });
  }

  async resumeImprovement(
    flowRun: FlowRun,
    renderer: OperatorRenderSink,
    roleOutputStreamFactory?: (roleInstanceId: string) => NodeJS.WritableStream,
    consentGate?: ConsentGate,
  ): Promise<void> {
    const scheduler = this.improvementScheduler;
    const improvementPhase = flowRun.improvementPhase;
    if (!improvementPhase) {
      throw new Error('[improvement] Cannot resume improvement: improvement phase state is missing.');
    }
    const mode = improvementPhase.mode;
    if (!mode || mode === IMPROVEMENT_CHOICE_MODE.NONE) {
      throw new Error('[improvement] Cannot resume improvement: improvement mode is missing.');
    }

    const recordFolderPath = flowRun.recordFolderPath;
    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('improvement.resume', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'improvement.record_folder': recordFolderPath,
      }
    }, async (span) => {
      try {
        const plan = computeBackwardPassPlan(recordFolderPath, FEEDBACK_ROLE, mode);
        const improvementWorkflowFilePath = writeImprovementWorkflow(recordFolderPath, plan, mode);
        const workflowRelPath = path.relative(flowRun.workspaceRoot, improvementWorkflowFilePath);
        span.setAttribute('improvement.plan_node_count', plan.entries.length);

        const feedback = feedbackEntry(plan);
        if (
          improvementPhase.feedbackConsent === FEEDBACK_CONSENT_STATUS.GRANTED &&
          !improvementPhase.completedRoles.includes(feedback.role)
        ) {
          await this.runFeedback(
            flowRun, renderer, roleOutputStreamFactory, consentGate
          );
          span.addEvent('store.flow_saved', { stage: 'improvement_completed_via_feedback_resume' });
          return;
        }

        flowRun.status = 'running';
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'running';
          phase.improvementWorkflowPath = workflowRelPath;
        });

        const allDone = await runMetaAnalysisGraph(
          flowRun, plan, renderer, roleOutputStreamFactory, scheduler, consentGate
        );

        if (!allDone) return; // paused for feedback consent

        flowRun.status = 'completed';
        await saveImprovementPhase(flowRun, (phase) => {
          phase.status = 'completed';
        });
        span.addEvent('store.flow_saved', { stage: 'improvement_completed' });
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
