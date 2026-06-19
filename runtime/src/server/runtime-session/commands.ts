import { flowKey } from '../../../shared/flow-ref.js';
import {
  AWAITING_HUMAN_REASON,
  CONSENT_MODE,
  CONSENT_RESPONSE_DECISION,
  FEEDBACK_CONSENT_DECISION,
  IMPROVEMENT_CHOICE_MODE,
} from '../../../shared/protocol-constants.js';
import type {
  ProtocolFeedbackConsentDecision,
  ProtocolImprovementChoiceMode,
} from '../../../shared/protocol-constants.js';
import { parseRoleIdentity } from '../../../shared/role-id.js';
import type {
  ConsentMode,
  ConsentResponseDecision,
  FlowRef,
  FlowRun,
} from '../../common/types.js';
import { ImprovementOrchestrator } from '../../improvement/improvement.js';
import { listSkills } from '../../framework-services/skills.js';
import { listMcpServers, resolveCapabilityGate, saveCapabilityDimension } from '../../orchestration/capability-selection.js';
import { resolveRoleModelGate, saveRoleModelSelection } from '../../orchestration/role-model.js';
import { buildRoleConfigurationSummary } from '../../orchestration/role-configuration-summary.js';
import { SessionStore } from '../../orchestration/store.js';
import * as SettingsStore from '../../settings/settings-store.js';
import type { FlowReadModel } from '../flow-read-model.js';
import type { HistoricalMessage, ServerMessage } from '../protocol.js';
import type { RuntimeSessionConsent } from './consent.js';
import { createRoleOutputStream } from './feed.js';
import {
  hasHumanInputTargets,
  isAwaitingHumanReply,
  resolveHumanInputTarget,
} from './human-input.js';
import { compactPersistedRoleContext } from './manual-compaction.js';
import type { ActiveSession } from './types.js';

type RuntimeSessionCommandsDeps = {
  workspaceRoot: string;
  activeSessions: Map<string, ActiveSession>;
  readFlowRun: (ref: FlowRef) => FlowRun | null;
  resolveWorkflow: FlowReadModel['resolveWorkflow'];
  createSession: (ref: FlowRef) => ActiveSession;
  startFlowRunner: (session: ActiveSession, projectNamespace: string) => void;
  attachSessionTask: (session: ActiveSession, taskFactory: () => Promise<void>) => Promise<void>;
  emitHistoricalMessage: (session: ActiveSession, message: HistoricalMessage) => void;
  emitFlowState: (session: ActiveSession) => void;
  broadcastToFlow: (ref: FlowRef, message: ServerMessage) => void;
  missingModelError: (ref: FlowRef) => ServerMessage;
  consent: RuntimeSessionConsent;
};

export interface RoleConfigurationPayload {
  modelConfigId?: string;
  skills: string[];
  mcpServers: string[];
}

export function createRuntimeSessionCommands(deps: RuntimeSessionCommandsDeps) {
  const {
    workspaceRoot,
    activeSessions,
    readFlowRun,
    resolveWorkflow,
    createSession,
    startFlowRunner,
    attachSessionTask,
    emitHistoricalMessage,
    emitFlowState,
    broadcastToFlow,
    missingModelError,
    consent,
  } = deps;

  async function handleHumanInput(ref: FlowRef, text: string, target?: { nodeId?: string; role?: string }): Promise<void> {
    const flowRun = readFlowRun(ref);
    if (!flowRun || !hasHumanInputTargets(flowRun)) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'The runtime is not currently accepting human input.' });
      return;
    }

    if (!SettingsStore.hasUsableConfiguredModel()) {
      broadcastToFlow(ref, missingModelError(ref));
      return;
    }

    let targetNodeId: string | null = null;
    let targetRole: string | undefined;
    try {
      await SessionStore.updateFlowRun((latest) => {
        const resolvedTarget = resolveHumanInputTarget(latest, resolveWorkflow(latest), target);
        targetNodeId = resolvedTarget.nodeId;
        const awaitingState = latest.awaitingHumanNodes[targetNodeId];
        const awaitingHandoff = latest.awaitingHandoff.includes(targetNodeId);
        if ((!awaitingState || !isAwaitingHumanReply(awaitingState.reason)) && !awaitingHandoff) {
          throw new Error(`Node '${targetNodeId}' is no longer accepting human input.`);
        }
        if (latest.pendingHumanInputs[targetNodeId]) {
          throw new Error(`Node '${targetNodeId}' already has queued human input.`);
        }
        targetRole = resolvedTarget.role;
        latest.pendingHumanInputs[targetNodeId] = {
          text,
          receivedAt: new Date().toISOString(),
        };
      }, ref, workspaceRoot);
    } catch (error: any) {
      broadcastToFlow(ref, {
        type: 'error',
        flowRef: ref,
        message: error instanceof Error ? error.message : String(error)
      });
      return;
    }
    if (!targetNodeId) return;

    let session = activeSessions.get(flowKey(ref));
    if (!session || session.finished) {
      session = createSession(ref);
      startFlowRunner(session, flowRun.projectNamespace);
    }

    emitHistoricalMessage(session, {
      type: 'input_text',
      role: targetRole,
      text,
    });
    session.orchestrator.wake();
    emitFlowState(session);
  }

  function uniqueStrings(values: string[]): string[] {
    return values
      .filter((value) => typeof value === 'string' && value.trim() !== '')
      .map((value) => value.trim())
      .filter((value, index, entries) => entries.indexOf(value) === index)
      .sort((a, b) => a.localeCompare(b));
  }

  function handleRoleConfiguration(ref: FlowRef, nodeId: string, payload: RoleConfigurationPayload): void {
    const flowRun = readFlowRun(ref);
    if (!flowRun) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: `Flow "${flowKey(ref)}" was not found.` });
      return;
    }

    const awaitingState = flowRun.awaitingHumanNodes[nodeId];
    if (!awaitingState || awaitingState.reason !== AWAITING_HUMAN_REASON.ROLE_CONFIGURATION) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: `Node '${nodeId}' is not awaiting role configuration.` });
      return;
    }

    const modelGate = resolveRoleModelGate(workspaceRoot, ref, awaitingState.role);
    let modelSelection: {
      modelConfigId: string;
      displayName: string;
      modelId: string;
      selectedAt: string;
    } | null = null;
    if (modelGate.kind === 'selection-required') {
      if (!payload.modelConfigId) {
        broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'Select a model before submitting role configuration.' });
        return;
      }
      const model = SettingsStore.getModelWithKey(payload.modelConfigId);
      if (!SettingsStore.isUsableModelConfig(model)) {
        broadcastToFlow(ref, {
          type: 'error',
          flowRef: ref,
          message: 'The selected model is not usable. Complete its configuration in Settings and select it again.'
        });
        return;
      }

      modelSelection = {
        modelConfigId: model.id,
        displayName: model.displayName,
        modelId: model.modelId,
        selectedAt: new Date().toISOString(),
      };
    }

    // Only persist dimensions the gate still has pending; auto-resolved dimensions
    // are already decided and must not be clobbered by a partial manual submit.
    const capabilityGate = resolveCapabilityGate(workspaceRoot, ref, awaitingState.role);
    const pendingSkills = capabilityGate.kind === 'selection-required' && capabilityGate.pendingSkills;
    const pendingMcp = capabilityGate.kind === 'selection-required' && capabilityGate.pendingMcp;

    const validSkillNames = new Set(listSkills(workspaceRoot).map((skill) => skill.name));
    const validMcpServerIds = new Set(listMcpServers().map((server) => server.id));
    const selectedSkills = pendingSkills ? uniqueStrings(payload.skills) : [];
    const selectedMcpServers = pendingMcp ? uniqueStrings(payload.mcpServers) : [];
    const unknownSkill = selectedSkills.find((name) => !validSkillNames.has(name));
    const unknownServer = selectedMcpServers.find((id) => !validMcpServerIds.has(id));
    if (unknownSkill) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: `Unknown skill "${unknownSkill}". Refresh Settings and try again.` });
      return;
    }
    if (unknownServer) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: `Unknown MCP server "${unknownServer}". Refresh Settings and try again.` });
      return;
    }

    if (modelSelection) {
      saveRoleModelSelection(workspaceRoot, ref, awaitingState.role, modelSelection);
    }

    const capabilitySelectedAt = new Date().toISOString();
    if (pendingSkills) {
      saveCapabilityDimension(workspaceRoot, ref, awaitingState.role, 'skills', selectedSkills, capabilitySelectedAt);
    }
    if (pendingMcp) {
      saveCapabilityDimension(workspaceRoot, ref, awaitingState.role, 'mcpServers', selectedMcpServers, capabilitySelectedAt);
    }

    if (selectedSkills.length > 0) {
      const roleKey = parseRoleIdentity(awaitingState.role).instanceRoleId;
      const roleSession = SessionStore.loadRoleSession(roleKey, ref, workspaceRoot);
      if (roleSession) {
        delete roleSession.systemPrompt;
        SessionStore.saveRoleSession(roleSession, ref, workspaceRoot);
      }
    }

    let session = activeSessions.get(flowKey(ref));
    if (!session || session.finished) {
      session = createSession(ref);
      startFlowRunner(session, flowRun.projectNamespace);
    }

    // The result bubble shows the role's complete effective configuration — both the
    // dimensions just selected manually and any decided automatically beforehand.
    emitHistoricalMessage(session, {
      type: 'operator_event',
      event: {
        kind: 'role.configured',
        nodeId,
        role: awaitingState.role,
        ...buildRoleConfigurationSummary(workspaceRoot, ref, awaitingState.role),
      },
    });
    session.orchestrator.wake();
    emitFlowState(session);
  }

  function getOrCreateChoiceSession(ref: FlowRef): ActiveSession {
    const existing = activeSessions.get(flowKey(ref));
    if (existing && !existing.finished) {
      return existing;
    }
    return createSession(ref);
  }

  function hasActiveManualCompaction(session: ActiveSession, role?: string): boolean {
    if (session.manualCompactionControllers.size === 0) return false;
    const targetRole = role ? parseRoleIdentity(role).instanceRoleId : null;
    for (const [roleInstanceId, controller] of session.manualCompactionControllers.entries()) {
      if (targetRole && targetRole !== roleInstanceId) continue;
      if (!controller.signal.aborted) return true;
    }
    return false;
  }

  function abortManualCompaction(session: ActiveSession, role?: string): boolean {
    if (session.manualCompactionControllers.size === 0) return false;
    const targetRole = role ? parseRoleIdentity(role).instanceRoleId : null;
    let stopped = false;
    for (const [roleInstanceId, controller] of session.manualCompactionControllers.entries()) {
      if (targetRole && targetRole !== roleInstanceId) continue;
      if (controller.signal.aborted) continue;
      controller.abort();
      stopped = true;
    }
    return stopped;
  }

  function ensureManualCompactionSigintHandler(session: ActiveSession): void {
    if (session.manualCompactionSigintHandler) return;
    session.manualCompactionSigintHandler = () => {
      for (const controller of session.manualCompactionControllers.values()) {
        if (!controller.signal.aborted) controller.abort();
      }
    };
    process.on('SIGINT', session.manualCompactionSigintHandler);
  }

  function releaseManualCompactionSigintHandlerIfIdle(session: ActiveSession): void {
    if (session.manualCompactionControllers.size > 0 || !session.manualCompactionSigintHandler) return;
    process.removeListener('SIGINT', session.manualCompactionSigintHandler);
    session.manualCompactionSigintHandler = null;
  }

  async function handleImprovementChoice(ref: FlowRef, mode: ProtocolImprovementChoiceMode): Promise<void> {
    const flowRun = readFlowRun(ref);
    if (!flowRun || flowRun.status !== 'awaiting_improvement_choice') {
      broadcastToFlow(ref, {
        type: 'error',
        flowRef: ref,
        message: 'The runtime is not currently waiting for an improvement mode selection.'
      });
      return;
    }

    const session = getOrCreateChoiceSession(ref);
    const label = mode === IMPROVEMENT_CHOICE_MODE.NONE
      ? 'No improvement'
      : mode === IMPROVEMENT_CHOICE_MODE.GRAPH_BASED
        ? 'Graph-based improvement'
        : 'Parallel improvement';
    emitHistoricalMessage(session, {
      type: 'input_text',
      text: label,
    });

    if (mode === IMPROVEMENT_CHOICE_MODE.NONE) {
      try {
        await ImprovementOrchestrator.skipImprovement(flowRun);
        session.sink.emit({ kind: 'flow.completed' });
      } catch (error: any) {
        emitHistoricalMessage(session, {
          type: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      }
      return;
    }

    if (!SettingsStore.hasUsableConfiguredModel()) {
      broadcastToFlow(ref, missingModelError(ref));
      return;
    }

    void attachSessionTask(session, async () => {
      const currentFlow = readFlowRun(ref);
      if (!currentFlow) {
        throw new Error('Flow state disappeared before the improvement phase began.');
      }

      await session.improvementOrchestrator.runImprovement(
        currentFlow,
        mode,
        session.sink,
        (roleName) => createRoleOutputStream(session, roleName, emitHistoricalMessage),
        session.consentGate,
        session.mcpManagers,
      );

      const latestFlow = readFlowRun(ref);
      if (latestFlow?.status === 'completed') {
        session.sink.emit({ kind: 'flow.completed' });
      }
    }).catch(() => {});

    setImmediate(() => emitFlowState(session));
  }

  async function handleFeedbackConsentChoice(ref: FlowRef, decision: ProtocolFeedbackConsentDecision): Promise<void> {
    const flowRun = readFlowRun(ref);
    if (!flowRun || flowRun.status !== 'awaiting_feedback_consent') {
      broadcastToFlow(ref, {
        type: 'error',
        flowRef: ref,
        message: 'The runtime is not currently waiting for a feedback consent decision.'
      });
      return;
    }

    const session = getOrCreateChoiceSession(ref);
    const label = decision === FEEDBACK_CONSENT_DECISION.GRANTED ? 'Generate upstream feedback' : 'Skip upstream feedback';
    emitHistoricalMessage(session, {
      type: 'input_text',
      text: label,
    });

    if (decision === FEEDBACK_CONSENT_DECISION.DENIED) {
      try {
        await ImprovementOrchestrator.skipFeedback(flowRun);
        session.sink.emit({ kind: 'flow.completed' });
      } catch (error: any) {
        emitHistoricalMessage(session, {
          type: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      }
      return;
    }

    if (!SettingsStore.hasUsableConfiguredModel()) {
      broadcastToFlow(ref, missingModelError(ref));
      return;
    }

    void attachSessionTask(session, async () => {
      const currentFlow = readFlowRun(ref);
      if (!currentFlow) {
        throw new Error('Flow state disappeared before the feedback step began.');
      }

      await session.improvementOrchestrator.runFeedback(
        currentFlow,
        session.sink,
        (roleName) => createRoleOutputStream(session, roleName, emitHistoricalMessage),
        session.consentGate,
        session.mcpManagers,
      );

      const latestFlow = readFlowRun(ref);
      if (latestFlow?.status === 'completed') {
        session.sink.emit({ kind: 'flow.completed' });
      }
    }).catch(() => {});

    setImmediate(() => emitFlowState(session));
  }

  function handleConsentResponse(ref: FlowRef, decision: ConsentResponseDecision, role: string): void {
    const session = activeSessions.get(flowKey(ref));
    if (!session || session.finished) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active session for consent response.' });
      return;
    }
    session.consentGate.respond(decision, role);
  }

  function handleConsentMode(ref: FlowRef, mode: ConsentMode): void {
    const session = activeSessions.get(flowKey(ref));
    if (session && !session.finished) {
      const inFlightRequests = session.consentGate.getInFlightRequests();
      session.consentGate.setMode(mode);
      if (mode === CONSENT_MODE.FULL_ACCESS) {
        for (const inFlight of inFlightRequests) {
          void consent.clearNodeAwaitingConsent(session, inFlight, CONSENT_RESPONSE_DECISION.ALLOW_FLOW);
        }
      }
      return;
    }
    consent.persistInactiveConsentMode(ref, mode);
  }

  function handleStopActiveTurn(ref: FlowRef, target?: { nodeId?: string; role?: string }): void {
    const activeSession = activeSessions.get(flowKey(ref));
    if (!activeSession || activeSession.finished) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active runtime session is currently running.' });
      return;
    }

    const stopped = activeSession.orchestrator.abortActiveTurn(target)
      || (!target?.nodeId && activeSession.improvementOrchestrator.abortActiveTurn(target?.role))
      || (!target?.nodeId && abortManualCompaction(activeSession, target?.role));
    if (!stopped) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active turn is currently stoppable.' });
    }
  }

  function resolveWorkflowRoleName(flowRun: FlowRun, role: string): string {
    const roleInstanceId = role.trim();
    const workflow = resolveWorkflow(flowRun);
    const match = workflow?.nodes?.find((node: any) =>
      typeof node.role === 'string' &&
      parseRoleIdentity(node.role).instanceRoleId === roleInstanceId
    );
    return typeof match?.role === 'string' ? match.role : role;
  }

  async function handleImprovementHumanInput(ref: FlowRef, role: string, text: string): Promise<void> {
    const flowRun = readFlowRun(ref);
    if (!flowRun?.improvementPhase) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active improvement phase for this flow.' });
      return;
    }

    let roleInstanceId: string;
    try {
      roleInstanceId = parseRoleIdentity(role).instanceRoleId;
    } catch (error: any) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: error instanceof Error ? error.message : String(error) });
      return;
    }

    const awaitingRoles = flowRun.improvementPhase.awaitingHumanRoles ?? {};
    if (!awaitingRoles[roleInstanceId]) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: `Role "${roleInstanceId}" is not currently awaiting human input in the improvement phase.` });
      return;
    }

    try {
      await SessionStore.updateFlowRun((latest) => {
        if (!latest.improvementPhase) {
          throw new Error('No active improvement phase for this flow.');
        }
        const awaitingState = latest.improvementPhase.awaitingHumanRoles?.[roleInstanceId];
        if (!awaitingState || !isAwaitingHumanReply(awaitingState.reason)) {
          throw new Error(`Role "${roleInstanceId}" is no longer awaiting human input in the improvement phase.`);
        }
        if (latest.improvementPhase.pendingHumanInputs?.[roleInstanceId]) {
          throw new Error(`Role "${roleInstanceId}" already has queued human input.`);
        }
        if (!latest.improvementPhase.pendingHumanInputs) latest.improvementPhase.pendingHumanInputs = {};
        latest.improvementPhase.pendingHumanInputs[roleInstanceId] = { text, receivedAt: new Date().toISOString() };
      }, ref, workspaceRoot);
    } catch (error: any) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: error instanceof Error ? error.message : String(error) });
      return;
    }

    const session = activeSessions.get(flowKey(ref));
    if (session && !session.finished) {
      emitHistoricalMessage(session, { type: 'input_text', role: roleInstanceId, text });
      session.improvementOrchestrator.wake();
      emitFlowState(session);
    }
  }

  function handleCompactContext(ref: FlowRef, role: string): void {
    const flowRun = readFlowRun(ref);
    if (!flowRun) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: `Flow "${flowKey(ref)}" was not found.` });
      return;
    }

    const roleName = resolveWorkflowRoleName(flowRun, role);
    const roleInstanceId = parseRoleIdentity(roleName).instanceRoleId;
    if (!SettingsStore.hasUsableConfiguredModel()) {
      broadcastToFlow(ref, {
        type: 'operator_event',
        flowRef: ref,
        event: {
          kind: 'session.compaction_failed',
          role: roleName,
          trigger: 'manual',
          reason: SettingsStore.MODEL_CONFIGURATION_REQUIRED_MESSAGE
        }
      });
      broadcastToFlow(ref, missingModelError(ref));
      return;
    }

    const activeSession = activeSessions.get(flowKey(ref));
    if (
      activeSession?.orchestrator.hasActiveTurn({ roleInstanceId }) ||
      activeSession?.improvementOrchestrator.hasActiveTurn(roleInstanceId) ||
      (activeSession ? hasActiveManualCompaction(activeSession, roleInstanceId) : false)
    ) {
      broadcastToFlow(ref, {
        type: 'operator_event',
        flowRef: ref,
        event: {
          kind: 'session.compaction_failed',
          role: roleName,
          trigger: 'manual',
          reason: 'Context cannot be compacted while that role is actively receiving a model response.'
        }
      });
      broadcastToFlow(ref, {
        type: 'error',
        flowRef: ref,
        message: 'Context cannot be compacted while that role is actively receiving a model response.'
      });
      return;
    }

    const createdForCompaction = !activeSession || activeSession.finished;
    const session = getOrCreateChoiceSession(ref);
    const controller = new AbortController();
    session.manualCompactionControllers.set(roleInstanceId, controller);
    ensureManualCompactionSigintHandler(session);

    void compactPersistedRoleContext({
      flowRun,
      flowRef: ref,
      workspaceRoot,
      roleName,
      roleInstanceId,
      trigger: 'manual',
      signal: controller.signal,
      operatorRenderer: session.sink,
    })
      .then((result) => {
        if (!result.compacted) {
          if (createdForCompaction) {
            session.finished = true;
          }
          if (result.aborted) {
            emitFlowState(session);
            return;
          }
          broadcastToFlow(ref, {
            type: 'error',
            flowRef: ref,
            message: result.reason ?? 'No context was available to compact.'
          });
          return;
        }
        session.latestContextUsageByRole[roleInstanceId] = 0;
        if (createdForCompaction) {
          session.finished = true;
        }
        emitFlowState(session);
      })
      .catch((error: any) => {
        if (createdForCompaction) {
          session.finished = true;
        }
        broadcastToFlow(ref, {
          type: 'error',
          flowRef: ref,
          message: error instanceof Error ? error.message : String(error)
        });
      })
      .finally(() => {
        const activeController = session.manualCompactionControllers.get(roleInstanceId);
        if (activeController === controller) {
          session.manualCompactionControllers.delete(roleInstanceId);
        }
        releaseManualCompactionSigintHandlerIfIdle(session);
      });
  }

  return {
    handleHumanInput,
    handleRoleConfiguration,
    handleImprovementChoice,
    handleFeedbackConsentChoice,
    handleImprovementHumanInput,
    handleConsentResponse,
    handleConsentMode,
    handleStopActiveTurn,
    handleCompactContext,
  };
}

export type RuntimeSessionCommands = ReturnType<typeof createRuntimeSessionCommands>;
