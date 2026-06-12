import fs from 'node:fs';
import path from 'node:path';
import { ContextInjectionService } from '../context/injection.js';
import { SessionStore } from './store.js';
import { HandoffParseError } from './handoff.js';
import { resolveRoleModelGate } from './role-model.js';
import type { AwaitingHumanReason, FlowRef, FlowRun, HandoffTarget, RoleTurnResult, OperatorRenderSink, ConsentGate, RoleSession, RuntimeMessageParam, OperatorEvent } from '../common/types.js';
import { recordRoleTurnUsage, runRoleTurn } from '../common/role-turn.js';
import { buildForwardNodeEntryMessage } from '../context/session-entry.js';
import { ImprovementOrchestrator } from '../improvement/improvement.js';
import { buildWorkflowRepairGuidance } from '../framework-services/workflow-graph-validator.js';
import { buildRuntimeHealthRepairGuidance, runRuntimeHealthChecks } from '../framework-services/runtime-health-checks.js';
import { TelemetryManager } from '../observability/observability.js';
import { parseRoleIdentity } from '../common/role-id.js';
import { WakeController } from '../common/wake-controller.js';
import { AWAITING_HUMAN_REASON, OWNER_BASE_ROLE_ID } from '../common/protocol-constants.js';
import { getActiveNodeIds } from '../common/flow-state.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { CANONICAL_WORKFLOW_FILENAME, findWorkflowFilePath, resolveFlowWorkflow } from '../context/workflow-file.js';
import { WorkflowGraph, allEdgesCovered, getCompletedInboundSources, getOutstandingInboundSources, hasPendingOutgoing, parseHandoffKey, type HandoffKeyParts } from './workflow-graph.js';
import { upsertAssistantDelta, removeAssistantDraftBeforeToolCalls, upsertCurrentNodeAssistantDelta, appendConversationMessagesToCurrentNode, INTERRUPTED_TURN_CONTINUATION_MESSAGE } from '../common/history.js';
import { syncRecordMetadataFromWorkflow } from '../projects/record-metadata.js';

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}

type ClaimedRunnableWork = {
  nodeId: string;
  roleInstanceId: string;
};


function nodeContractMentionsWorkflowAuthority(nodeDef: any): boolean {
  const fields = [
    nodeDef?.guidance,
    nodeDef?.inputs,
    nodeDef?.work,
    nodeDef?.outputs,
    nodeDef?.transitions,
    nodeDef?.notes
  ];

  return fields.some((value) =>
    Array.isArray(value) &&
    value.some((item) =>
      typeof item === 'string' &&
      /workflow\.yaml|workflow-authority|workflow snapshot|active path/i.test(item)
    )
  );
}


function appendCurrentNodeExchange(session: RoleSession, nodeId: string, message: RuntimeMessageParam): void {
  if (!session.currentNodeContext || session.currentNodeContext.nodeId !== nodeId) {
    session.currentNodeContext = { nodeId, exchanges: [] };
  }
  const exchanges = session.currentNodeContext.exchanges;
  const last = exchanges[exchanges.length - 1];
  if (message.role === 'user' && typeof message.content === 'string' &&
      last?.role === 'user' && typeof last.content === 'string') {
    last.content += '\n\n' + message.content;
  } else {
    exchanges.push(message);
  }
}

function appendRuntimeMessage(
  history: RuntimeMessageParam[],
  session: RoleSession,
  nodeId: string,
  message: RuntimeMessageParam
): void {
  const last = history[history.length - 1];
  if (message.role === 'user' && typeof message.content === 'string' &&
      last?.role === 'user' && typeof last.content === 'string') {
    last.content += '\n\n' + message.content;
    appendCurrentNodeExchange(session, nodeId, message);
  } else {
    history.push(message);
    appendCurrentNodeExchange(session, nodeId, message);
  }
}


export class FlowOrchestrator {
  private renderer: OperatorRenderSink;
  private activeTurnControllers = new Map<string, { role: string; controller: AbortController }>();
  private flowRef: FlowRef | null = null;
  private workspaceRoot: string | null = null;
  private boundSigintHandler: (() => void) | null = null;
  private wakeController = new WakeController();

  constructor(renderer: OperatorRenderSink) {
    this.renderer = renderer;
  }

  private waitForWakeAfter(observed: number) {
    return this.wakeController.waitForWakeAfter(observed);
  }

  public abortActiveTurn(target?: { nodeId?: string; role?: string }): boolean {
    let stopped = false;
    for (const [nodeId, entry] of this.activeTurnControllers.entries()) {
      if (target?.nodeId && target.nodeId !== nodeId) continue;
      if (target?.role && this.roleKey(target.role) !== this.roleKey(entry.role)) continue;
      if (entry.controller.signal.aborted) continue;
      entry.controller.abort();
      stopped = true;
    }
    return stopped;
  }

  public hasActiveTurn(target?: { nodeId?: string; roleInstanceId?: string }): boolean {
    for (const [nodeId, entry] of this.activeTurnControllers.entries()) {
      if (target?.nodeId && target.nodeId !== nodeId) continue;
      if (target?.roleInstanceId && target.roleInstanceId !== this.roleKey(entry.role)) continue;
      if (!entry.controller.signal.aborted) return true;
    }
    return false;
  }

  public wake(): void {
    this.wakeController.wake();
  }

  public async runStoredFlow(
    workspaceRoot: string,
    projectNamespace: string,
    flowId?: string,
    outputStreamFactory?: (role: string) => NodeJS.WritableStream,
    consentGate?: ConsentGate
  ): Promise<void> {
    const tracer = TelemetryManager.getTracer();
    const meter = TelemetryManager.getMeter();

    return tracer.startActiveSpan('flow.run', { kind: SpanKind.INTERNAL }, async (rootSpan) => {
      try {
        SessionStore.init(workspaceRoot);
        const requestedRef = flowId ? { projectNamespace, flowId } : undefined;
        let flowRun = SessionStore.loadFlowRun(requestedRef, workspaceRoot);

        rootSpan.addEvent('flow.started', { 'flow.resumed': flowRun !== null });
        rootSpan.setAttribute('flow.id', 'pending');
        rootSpan.setAttribute('flow.resumed', flowRun !== null);

        if (!flowRun) {
          throw new Error(
            'No active flow state found. Create and persist a draft flow before starting orchestration.'
          );
        }

        if (flowRun.workspaceRoot !== workspaceRoot) {
          throw new Error(
            `Persisted flow workspace root mismatch: loaded "${flowRun.workspaceRoot}" but expected "${workspaceRoot}". ` +
            'Clear runtime state or create a fresh draft flow for this workspace before starting orchestration.'
          );
        }

        if (flowRun.projectNamespace !== projectNamespace) {
          throw new Error(
            `Persisted flow project mismatch: loaded "${flowRun.projectNamespace}" but expected "${projectNamespace}". ` +
            'Clear runtime state or create a fresh draft flow for this project before starting orchestration.'
          );
        }

        this.setFlowContext(flowRun);

        const initialNodeIds = await this.takeInitialRunningNodes();
        flowRun = SessionStore.loadFlowRun(this.requireFlowRef(), this.requireWorkspaceRoot())!;

        rootSpan.setAttribute('flow.id', flowRun.flowId);
        rootSpan.setAttribute('flow.project_namespace', flowRun.projectNamespace);
        rootSpan.addEvent('flow.established', { 'flow.id': flowRun.flowId, 'record_folder_path': path.relative(workspaceRoot, flowRun.recordFolderPath) });
        meter.createCounter('a_society.flow.started').add(1, { project_namespace: flowRun.projectNamespace });

        while (true) {
          const observedWakeGeneration = this.wakeController.observe();
          await this.runReadyNodesUntilBlocked(
            outputStreamFactory,
            consentGate,
            initialNodeIds
          );
          initialNodeIds.length = 0;
          flowRun = SessionStore.loadFlowRun(this.requireFlowRef(), this.requireWorkspaceRoot())!;
          if (flowRun.status !== 'running') {
            break;
          }
          await this.waitForWakeAfter(observedWakeGeneration).promise;
        }

        rootSpan.setAttribute('flow.status', flowRun.status);
        meter.createCounter('a_society.flow.completed').add(1, { project_namespace: flowRun.projectNamespace, status: flowRun.status });

        if (flowRun?.status === 'completed') {
          this.renderer.emit({ kind: 'flow.completed' });
        }
      } catch (e: any) {
        rootSpan.recordException(e);
        rootSpan.setStatus({ code: SpanStatusCode.ERROR });
        throw e;
      } finally {
        rootSpan.end();
      }
    });
  }

  private async advanceFlow(
    nodeId: string,
    roleInstanceId: string,
    consentGate?: ConsentGate,
    outputStreamFactory?: (role: string) => NodeJS.WritableStream
  ): Promise<void> {
    let flowRun = SessionStore.loadFlowRun(this.requireFlowRef(), this.requireWorkspaceRoot())!;
    const session = SessionStore.loadRoleSession(roleInstanceId, this.requireFlowRef(), this.requireWorkspaceRoot())!;
    const injectedHistory = session.transcriptHistory as RuntimeMessageParam[];

    this.setFlowContext(flowRun);
    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('flow.node.advance', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'node.id': nodeId,
      }
    }, async (span) => {
      try {
        if (flowRun.status === 'completed') {
          throw new Error(`Cannot advance flow in state: ${flowRun.status}`);
        }

        if (!flowRun.runningNodes.includes(nodeId)) {
          throw new Error(`Node '${nodeId}' is not in runningNodes: [${flowRun.runningNodes.join(', ')}]. Only running nodes can be advanced.`);
        }

        if (fs.existsSync(flowRun.recordFolderPath)) {
          const metadata = syncRecordMetadataFromWorkflow(flowRun.recordFolderPath);
          if (metadata.name) {
            flowRun.recordName = metadata.name;
          } else {
            delete flowRun.recordName;
          }
          if (metadata.summary) {
            flowRun.recordSummary = metadata.summary;
          } else {
            delete flowRun.recordSummary;
          }
        }

        span.setAttribute('role', roleInstanceId);
        span.setAttribute('role_name', roleInstanceId);
        span.setAttribute('session.id', this.roleSessionId(flowRun, roleInstanceId));
        const nodeOutputStream = outputStreamFactory?.(roleInstanceId);
        const bundleContent = session.systemPrompt!;

        const saveRoleSession = (): void => {
          SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
        };

        const modelGate = resolveRoleModelGate(flowRun.workspaceRoot, this.requireFlowRef(), roleInstanceId);
        if (modelGate.kind === 'selection-required') {
          span.setAttribute('node.outcome', 'awaiting_human');
          span.addEvent('node.awaiting_human_suspended', { suspension_reason: AWAITING_HUMAN_REASON.MODEL_SELECTION });
          flowRun = await this.markNodeAwaitingHuman(nodeId, roleInstanceId, AWAITING_HUMAN_REASON.MODEL_SELECTION);
          this.renderer.emit({ kind: 'human.awaiting_input', nodeId, role: roleInstanceId, reason: AWAITING_HUMAN_REASON.MODEL_SELECTION });
          return;
        }
        const roleModel = modelGate.model;

        while (true) {
          try {
            const controller = new AbortController();
            this.activeTurnControllers.set(nodeId, { role: roleInstanceId, controller });
            this.ensureSigintHandler();

            let sessionResult: RoleTurnResult | null = null;
            try {
              sessionResult = await runRoleTurn({
                workspaceRoot: flowRun.workspaceRoot,
                roleInstanceId: roleInstanceId,
                providedSystemPrompt: bundleContent,
                flowRef: this.requireFlowRef(),
                providedHistory: injectedHistory,
                roleOutputStream: nodeOutputStream,
                externalSignal: controller.signal,
                operatorRenderer: this.renderer,
                consentGate,
                model: roleModel,
                onConversationMessages: async (messages) => {
                  removeAssistantDraftBeforeToolCalls(injectedHistory, messages);
                  appendConversationMessagesToCurrentNode(session, nodeId, messages);
                  saveRoleSession();
                },
                onAssistantTextDelta: (text) => {
                  upsertAssistantDelta(injectedHistory, text);
                  upsertCurrentNodeAssistantDelta(session, nodeId, text);
                  saveRoleSession();
                },
                nodeId,
                compaction: {
                  session,
                  flowRun,
                  saveSession: saveRoleSession,
                  nodeId,
                },
              });
            } finally {
              const activeController = this.activeTurnControllers.get(nodeId);
              if (activeController?.controller === controller) {
                this.activeTurnControllers.delete(nodeId);
              }
              this.releaseSigintHandlerIfIdle();
            }

            if (sessionResult) {
              const handoffResult = sessionResult.handoff;
              const turnUsage = sessionResult.contextUsage;
              recordRoleTurnUsage(session, this.renderer, roleInstanceId, turnUsage);
              if (handoffResult.kind === 'awaiting_human') {
                const awaitingReason = sessionResult.awaitingHumanReason ?? AWAITING_HUMAN_REASON.PROMPT_HUMAN;
                span.setAttribute('node.outcome', 'awaiting_human');
                span.addEvent('node.awaiting_human_suspended', { suspension_reason: awaitingReason });
                session.transcriptHistory = injectedHistory;
                SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                flowRun = await this.markNodeAwaitingHuman(nodeId, roleInstanceId, awaitingReason);
                this.renderer.emit({ kind: 'human.awaiting_input', nodeId, role: roleInstanceId, reason: awaitingReason });
                break;
              }

              if (handoffResult.kind === 'forward-pass-closed') {
                const emitterInstanceRole = parseRoleIdentity(roleInstanceId).instanceRoleId;
                const latestForFpc = SessionStore.loadFlowRun(this.requireFlowRef(), this.requireWorkspaceRoot())!;
                const fpcWf = this.loadWorkflowDocument(latestForFpc);
                const fpcOutgoing = fpcWf.getOutgoingEdges(nodeId);
                const outstandingInbound = getOutstandingInboundSources(fpcWf, latestForFpc.completedHandoffs, nodeId);
                const completedInbound = getCompletedInboundSources(fpcWf, latestForFpc.completedHandoffs, nodeId);
                const isLastOwner = emitterInstanceRole === OWNER_BASE_ROLE_ID && fpcOutgoing.length === 0;
                const hasBlockers =
                  latestForFpc.runningNodes.some(id => id !== nodeId) ||
                  Object.keys(latestForFpc.awaitingHumanNodes).length > 0 ||
                  Object.keys(latestForFpc.pendingHumanInputs).length > 0 ||
                  !allEdgesCovered(fpcWf, latestForFpc.completedHandoffs) ||
                  Object.keys(latestForFpc.receivingHandoff).length > 0 ||
                  latestForFpc.awaitingHandoff.length > 0;

                if (!isLastOwner || hasBlockers) {
                  const lines: string[] = ['Only the last owner node may emit forward-pass-closed.'];
                  if (outstandingInbound.length > 0) {
                    lines.push(`You are yet to receive a handoff from: ${outstandingInbound.join(', ')}. You can emit await-handoff to suspend and wait.`);
                  }
                  if (fpcOutgoing.length > 0) {
                    lines.push(`You can forward handoff to: ${fpcOutgoing.map(e => e.to).join(', ')}.`);
                  }
                  if (completedInbound.length > 0) {
                    lines.push(`In case of doubts, you can backward handoff to: ${completedInbound.join(', ')}.`);
                  }
                  lines.push('If you need human guidance, emit prompt-human.');
                  throw new HandoffParseError({
                    code: 'invalid_transition',
                    operatorSummary: 'Invalid forward-pass-closed signal',
                    modelRepairMessage: lines.join(' '),
                  });
                }

                const healthCheck = runRuntimeHealthChecks(flowRun.workspaceRoot, flowRun.projectNamespace);
                if (!healthCheck.ok) {
                  span.addEvent('runtime.health_check_failed', {
                    signal: 'forward-pass-closed',
                    error_count: healthCheck.errors.length,
                    errors: healthCheck.errors.join('; ').slice(0, 2000)
                  });
                  const guidance = buildRuntimeHealthRepairGuidance(
                    healthCheck.errors,
                    'forward-pass-closed'
                  );
                  this.renderer.emit({
                    kind: 'repair.requested',
                    scope: 'node',
                    code: 'runtime_health',
                    summary: guidance.operatorSummary,
                    role: roleInstanceId,
                    nodeId
                  });
                  appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: guidance.modelRepairMessage });
                  session.transcriptHistory = injectedHistory;
                  SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                  continue;
                }

                span.setAttribute('node.outcome', 'forward_pass_closed');
                const uniqueBaseRoles = new Set(
                  (fpcWf.nodes as any[]).map((n) => parseRoleIdentity(n.role).baseRoleId)
                );
                const singleRole = uniqueBaseRoles.size <= 1;
                flowRun = await SessionStore.updateFlowRun((latest) => {
                  this.removeOpenNode(latest, nodeId);
                  ImprovementOrchestrator.markAwaitingChoice(latest, singleRole);
                }, this.requireFlowRef(), this.requireWorkspaceRoot());
                session.transcriptHistory = injectedHistory;
                session.isActive = false;
                SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                this.renderer.emit({ kind: 'flow.forward_pass_closed' });
                return;
              }

              if (handoffResult.kind === 'meta-analysis-complete') {
                throw new Error(`Unexpected meta-analysis-complete signal during forward pass at node '${nodeId}'.`);
              }

              if (handoffResult.kind === 'backward-pass-complete') {
                throw new Error(`Unexpected backward-pass-complete signal during forward pass at node '${nodeId}'.`);
              }

              if (handoffResult.kind === 'await-handoff') {
                const latestForCheck = SessionStore.loadFlowRun(this.requireFlowRef(), this.requireWorkspaceRoot())!;
                const awaitHandoffWf = this.loadWorkflowDocument(latestForCheck);
                const isPendingTarget = getOutstandingInboundSources(awaitHandoffWf, latestForCheck.completedHandoffs, nodeId).length > 0;
                const isReceivingTarget = Object.keys(latestForCheck.receivingHandoff).some(k => k.split('=>')[1] === nodeId);

                if (!isPendingTarget && !isReceivingTarget) {
                  this.renderer.emit({
                    kind: 'repair.requested',
                    scope: 'node',
                    code: 'invalid_transition',
                    summary: 'await-handoff invalid: no inbound handoff established',
                    role: roleInstanceId,
                    nodeId
                  });
                  appendRuntimeMessage(injectedHistory, session, nodeId, {
                    role: 'user',
                    content:
                      `Error: await-handoff is only valid when another node has a pending or received handoff directed at node '${nodeId}'. ` +
                      `No such handoff exists. To await a correction, first emit a handoff to the node you expect to receive work from, ` +
                      `so that a pending or received handoff targeting '${nodeId}' is established before signaling await-handoff.`
                  });
                  session.transcriptHistory = injectedHistory;
                  SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                  continue;
                }

                span.setAttribute('node.outcome', 'await_handoff');
                session.transcriptHistory = injectedHistory;
                session.isActive = false;
                SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                flowRun = await SessionStore.updateFlowRun((latest) => {
                  latest.runningNodes = latest.runningNodes.filter(id => id !== nodeId);
                  if (!latest.awaitingHandoff.includes(nodeId)) latest.awaitingHandoff.push(nodeId);
                }, this.requireFlowRef(), this.requireWorkspaceRoot());
                break;
              }

              // kind === 'targets'
              span.setAttribute('node.outcome', 'handoff');
              span.setAttribute('handoff.kind', handoffResult.kind);

              const handoffs = handoffResult.targets;
              await this.applyHandoffAndAdvance(flowRun, nodeId, roleInstanceId, handoffs);

              session.transcriptHistory = injectedHistory;
              session.isActive = false;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
              span.addEvent('store.session_saved', { 'session.id': this.roleSessionId(flowRun, roleInstanceId), 'session.active': false });
              break;
            } else {
              span.setAttribute('node.outcome', 'null_return');
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
              flowRun = await this.markNodeAwaitingHuman(nodeId, roleInstanceId, AWAITING_HUMAN_REASON.AUTONOMOUS_ABORT);
              this.renderer.emit({ kind: 'human.awaiting_input', nodeId, role: roleInstanceId, reason: AWAITING_HUMAN_REASON.AUTONOMOUS_ABORT });
              span.addEvent('node.awaiting_human_suspended', { suspension_reason: 'null_session_return' });
              break;
            }
          } catch (e: any) {
            if (e instanceof HandoffParseError) {
              recordRoleTurnUsage(session, this.renderer, roleInstanceId, e.contextUsage);
              span.addEvent('handoff.parse_error_injected', {
                error_type: e.name,
                error_message: e.message.slice(0, 500)
              });
              this.renderer.emit({
                kind: 'repair.requested',
                scope: 'node',
                code: e.details.code,
                summary: e.details.operatorSummary,
                role: roleInstanceId,
                nodeId
              });
              appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: e.details.modelRepairMessage });
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
              continue;
            }
            if (e instanceof WorkflowError) {
              span.addEvent('workflow.error_injected', { error_message: e.message.slice(0, 500) });
              const guidance = buildWorkflowRepairGuidance([e.message]);
              this.renderer.emit({
                kind: 'repair.requested',
                scope: 'node',
                code: 'workflow_parse',
                summary: guidance.operatorSummary,
                role: roleInstanceId,
                nodeId
              });
              appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: guidance.modelRepairMessage });
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
              continue;
            }
            span.recordException(e);
            span.setStatus({ code: SpanStatusCode.ERROR });
            throw e;
          }
        }
      } finally {
        span.end();
      }
    });
  }


  public async applyHandoffAndAdvance(
    flowRun: FlowRun,
    nodeId: string,
    fromRole: string,
    handoffs: HandoffTarget[]
  ): Promise<void> {
    this.setFlowContext(flowRun);
    if (!fs.existsSync(flowRun.recordFolderPath)) {
      throw new WorkflowError(
        `Error: No record folder found at ${flowRun.recordFolderPath}. ` +
        `A record folder must be created before emitting a handoff. ` +
        `Please create the record folder, create ${CANONICAL_WORKFLOW_FILENAME} inside it, and restate your handoff.`
      );
    }
    let eventTargets: Array<{ nodeId: string; role: string }> = [];

    await SessionStore.updateFlowRun((latest) => {
      const wf = this.loadWorkflowDocument(latest);

      wf.findNodeById(nodeId);
      const outgoingEdges = wf.getOutgoingEdges(nodeId);
      const incomingEdges = wf.getIncomingEdges(nodeId);

      const forwardTargets: HandoffTarget[] = [];
      const backwardTargets: HandoffTarget[] = [];

      for (const handoff of handoffs) {
        const targetNodeId = handoff.target_node_id;
        const isForward = outgoingEdges.some((edge: any) => edge.to === targetNodeId);
        const isBackward = incomingEdges.some((edge: any) => edge.from === targetNodeId);

        if (isForward && isBackward) {
          this.throwHandoffTransitionRepair(
            `Target node '${targetNodeId}' is both a successor and a predecessor of '${nodeId}', which is unsupported.`
          );
        }
        if (isForward) {
          forwardTargets.push(handoff);
          continue;
        }
        if (isBackward) {
          backwardTargets.push(handoff);
          continue;
        }

        const targetExists = wf.findNodeByIdOrNull(targetNodeId);
        if (!targetExists) {
          this.throwHandoffTransitionRepair(`Target node '${targetNodeId}' not found in workflow.`);
        }
        const neighborLines: string[] = [
          `Node '${nodeId}' attempted to handoff to '${targetNodeId}', which is not a direct neighbor. Nodes may only handoff to neighboring nodes. To reach a non-adjacent node, chain handoffs through each intermediate node in sequence.`
        ];
        if (outgoingEdges.length > 0) {
          neighborLines.push(`You can forward handoff to: ${outgoingEdges.map(e => e.to).join(', ')}.`);
        }
        const validBackward = getCompletedInboundSources(wf, latest.completedHandoffs, nodeId);
        if (validBackward.length > 0) {
          neighborLines.push(`In case of doubts, you can backward handoff to: ${validBackward.join(', ')}.`);
        }
        neighborLines.push('If you need human guidance, emit prompt-human.');
        throw new HandoffParseError({
          code: 'invalid_transition',
          operatorSummary: 'Handoff target mismatch',
          modelRepairMessage: neighborLines.join(' '),
        });
      }

      this.validateTargetArtifactsExist(flowRun.workspaceRoot, handoffs);

      if (handoffs.length === 0) {
        if (outgoingEdges.length > 0) {
          this.throwHandoffTransitionRepair(`Node '${nodeId}' emitted no valid handoff targets.`);
        }
        this.removeOpenNode(latest, nodeId);
        eventTargets = [];
        if (!this.hasUnsettledOrRunnableWork(latest, wf)) {
          latest.status = 'completed';
        } else {
          latest.status = 'running';
        }
        return;
      }

      const activationPairs: Array<{ targetId: string; artifact: string; role: string }> = [];
      const claimedForwardTargets = new Set<string>();

      for (const handoff of forwardTargets) {
        if (claimedForwardTargets.has(handoff.target_node_id)) {
          this.throwHandoffTransitionRepair(`Node '${nodeId}' emitted duplicate forward handoffs for target '${handoff.target_node_id}'.`);
        }
        claimedForwardTargets.add(handoff.target_node_id);
        const targetNode = wf.findNodeById(handoff.target_node_id);
        activationPairs.push({
          targetId: targetNode.id,
          artifact: handoff.artifact_path ?? '',
          role: targetNode.role
        });
      }

      const allHistoryArtifacts = new Set(Object.values(latest.historyHandoff).flat());
      for (const pair of activationPairs) {
        if (pair.artifact && allHistoryArtifacts.has(pair.artifact)) {
          this.throwHandoffTransitionRepair(
            `Artifact '${pair.artifact}' was already used in a previous handoff. Create a new artifact for this handoff.`
          );
        }
      }

      const reactivationPlans: Array<{
        targetId: string;
        role: string;
        rejectedEdgeKey: string;
        backwardHandoffKey: string;
        artifact: string;
      }> = [];
      const claimedBackwardTargets = new Set<string>();

      for (const handoff of backwardTargets) {
        if (claimedBackwardTargets.has(handoff.target_node_id)) {
          this.throwHandoffTransitionRepair(`Node '${nodeId}' emitted duplicate backward handoffs for target '${handoff.target_node_id}'.`);
        }
        claimedBackwardTargets.add(handoff.target_node_id);

        if (handoff.artifact_path && allHistoryArtifacts.has(handoff.artifact_path)) {
          this.throwHandoffTransitionRepair(
            `Artifact '${handoff.artifact_path}' was already used in a previous handoff. Create a new artifact for this handoff.`
          );
        }

        const targetNode = wf.findNodeById(handoff.target_node_id);
        const rejectedEdgeKey = wf.edgeKey(targetNode.id, nodeId);

        if (!latest.completedHandoffs.includes(rejectedEdgeKey)) {
          this.throwHandoffTransitionRepair(
            `Node '${nodeId}' attempted to send work back to predecessor '${targetNode.id}', but edge '${rejectedEdgeKey}' is not currently realized.`
          );
        }

        reactivationPlans.push({
          targetId: targetNode.id,
          role: targetNode.role,
          rejectedEdgeKey,
          backwardHandoffKey: wf.edgeKey(nodeId, targetNode.id),
          artifact: handoff.artifact_path ?? '',
        });
      }

      this.removeOpenNode(latest, nodeId);

      for (const pair of activationPairs) {
        const forwardKey = wf.edgeKey(nodeId, pair.targetId);
        if (!latest.completedHandoffs.includes(forwardKey)) latest.completedHandoffs.push(forwardKey);
        if (!latest.receivingHandoff[forwardKey]) latest.receivingHandoff[forwardKey] = [];
        if (pair.artifact && !latest.receivingHandoff[forwardKey].includes(pair.artifact)) {
          latest.receivingHandoff[forwardKey].push(pair.artifact);
        }
        if (!latest.historyHandoff[forwardKey]) latest.historyHandoff[forwardKey] = [];
        if (pair.artifact && !latest.historyHandoff[forwardKey].includes(pair.artifact)) {
          latest.historyHandoff[forwardKey].push(pair.artifact);
        }
      }

      if (reactivationPlans.length > 0) {
        if (!latest.awaitingHandoff.includes(nodeId)) latest.awaitingHandoff.push(nodeId);
      }

      const reactivatedTargets: Array<{ targetId: string; role: string }> = [];
      for (const plan of reactivationPlans) {
        if (!latest.receivingHandoff[plan.backwardHandoffKey]) latest.receivingHandoff[plan.backwardHandoffKey] = [];
        if (plan.artifact && !latest.receivingHandoff[plan.backwardHandoffKey].includes(plan.artifact)) {
          latest.receivingHandoff[plan.backwardHandoffKey].push(plan.artifact);
        }
        if (!latest.historyHandoff[plan.backwardHandoffKey]) latest.historyHandoff[plan.backwardHandoffKey] = [];
        if (plan.artifact && !latest.historyHandoff[plan.backwardHandoffKey].includes(plan.artifact)) {
          latest.historyHandoff[plan.backwardHandoffKey].push(plan.artifact);
        }
        latest.completedHandoffs = latest.completedHandoffs.filter(k => k !== plan.rejectedEdgeKey);
        reactivatedTargets.push({ targetId: plan.targetId, role: plan.role });
      }

      latest.status = 'running';
      eventTargets = [
        ...activationPairs.map(p => ({
          nodeId: p.targetId,
          role: p.role,
        })),
        ...reactivatedTargets.map(target => ({
          nodeId: target.targetId,
          role: target.role,
        }))
      ];
      return;
    }, this.requireFlowRef(), this.requireWorkspaceRoot());

    this.renderer.emit({
      kind: 'handoff.applied',
      fromNodeId: nodeId,
      fromRole,
      targets: eventTargets
    });
  }

  private async runReadyNodesUntilBlocked(
    outputStreamFactory?: (role: string) => NodeJS.WritableStream,
    consentGate?: ConsentGate,
    initialNodeIds: string[] = []
  ): Promise<void> {
    const runningTasks = new Map<string, Promise<void>>();
    let firstError: unknown = null;
    let pendingInitialNodeIds = this.mergeNodeIds(initialNodeIds);

    while (true) {
      const observedWakeGeneration = this.wakeController.observe();
      const claimedWorkItems = await this.claimRunnableWorkForParallelRun(pendingInitialNodeIds);
      const claimedNodeIds = claimedWorkItems.map((item) => item.nodeId);
      pendingInitialNodeIds = pendingInitialNodeIds.filter((nodeId) => !claimedNodeIds.includes(nodeId));
      for (const claimedWork of claimedWorkItems) {
        if (runningTasks.has(claimedWork.nodeId)) continue;
        const task = this.advanceFlow(
          claimedWork.nodeId,
          claimedWork.roleInstanceId,
          consentGate,
          outputStreamFactory
        ).catch((error) => {
          if (!firstError) firstError = error;
        }).finally(() => {
          runningTasks.delete(claimedWork.nodeId);
        });
        runningTasks.set(claimedWork.nodeId, task);
      }

      if (firstError) {
        await Promise.allSettled(runningTasks.values());
        throw firstError;
      }

      if (runningTasks.size === 0) {
        return;
      }

      const wakeWait = this.waitForWakeAfter(observedWakeGeneration);
      await Promise.race([...runningTasks.values(), wakeWait.promise]);
      wakeWait.cancel();
    }
  }

  private async takeInitialRunningNodes(): Promise<string[]> {
    let initialNodeIds: string[] = [];
    await SessionStore.updateFlowRun((flowRun) => {
      if (flowRun.runningNodes.length > 0) {
        initialNodeIds = [...flowRun.runningNodes];
        flowRun.runningNodes = [];
      }
    }, this.requireFlowRef(), this.requireWorkspaceRoot());
    return initialNodeIds;
  }

  private loadWorkflowDocument(flowRun: FlowRun): WorkflowGraph {
    const workflowFilePath = findWorkflowFilePath(flowRun.recordFolderPath);
    if (!workflowFilePath) {
      throw new Error('No workflow found in this record. Please start a new flow.');
    }
    return new WorkflowGraph(resolveFlowWorkflow(flowRun.recordFolderPath, flowRun.workspaceRoot, flowRun.projectNamespace));
  }

  private deriveRunnableNodeIds(flowRun: FlowRun, wf: WorkflowGraph): string[] {
    const receivingHandoffs = Object.keys(flowRun.receivingHandoff)
      .map((key) => parseHandoffKey(key))
      .filter((handoff): handoff is HandoffKeyParts => handoff !== null);
    const hasWakeableInboundHandoff = (nodeId: string): boolean =>
      receivingHandoffs.some(({ fromNodeId, targetId }) =>
        targetId === nodeId && this.isDeliverableInboundHandoff(flowRun, wf, nodeId, fromNodeId)
      );

    flowRun.awaitingHandoff = flowRun.awaitingHandoff.filter(nodeId => {
      return !hasWakeableInboundHandoff(nodeId);
    });

    const visitedSet = new Set(flowRun.visitedNodeIds ?? []);
    const awaitingHandoffSet = new Set(flowRun.awaitingHandoff);
    const runningNodeSet = new Set(flowRun.runningNodes);
    const activeNodes = new Set(getActiveNodeIds(flowRun));

    const result: string[] = [];
    const seen = new Set<string>();

    // Visited nodes that still owe an outgoing handoff are runnable again without a
    // persisted ready queue. This covers partial fan-out and reopened backward-pass sources.
    for (const node of wf.nodes) {
      const nodeId = node.id;
      if (seen.has(nodeId) || !visitedSet.has(nodeId) || awaitingHandoffSet.has(nodeId) || activeNodes.has(nodeId)) continue;
      if (hasPendingOutgoing(wf, flowRun.completedHandoffs, nodeId)) {
        result.push(nodeId);
        seen.add(nodeId);
      }
    }

    // Condition 2: has received a handoff. Iterate workflow nodes so that
    // simultaneous same-role handoffs are claimed in graph order, not object
    // insertion order from receivingHandoff.
    for (const node of wf.nodes) {
      const nodeId = node.id;
      if (!hasWakeableInboundHandoff(nodeId)) continue;
      const awaitingHumanState = flowRun.awaitingHumanNodes[nodeId];
      const awaitingHumanReplyWithoutQueuedInput =
        awaitingHumanState &&
        awaitingHumanState.reason === AWAITING_HUMAN_REASON.PROMPT_HUMAN &&
        !Object.prototype.hasOwnProperty.call(flowRun.pendingHumanInputs, nodeId);
      // A received handoff may intentionally reopen a completed node, especially
      // during backward-pass correction. Iterating wf.nodes is the structural
      // guard that the target node still exists in the active workflow.
      if (
        !seen.has(nodeId) &&
        !runningNodeSet.has(nodeId) &&
        (!awaitingHumanState || awaitingHumanReplyWithoutQueuedInput) &&
        !awaitingHandoffSet.has(nodeId)
      ) {
        result.push(nodeId);
        seen.add(nodeId);
      }
    }

    return result;
  }

  private pruneInitialNodeIds(flowRun: FlowRun, wf: WorkflowGraph, initialNodeIds: string[]): string[] {
    return this.mergeNodeIds(initialNodeIds).filter((nodeId) => {
      if (!wf.findNodeByIdOrNull(nodeId)) return false;
      if (flowRun.runningNodes.includes(nodeId)) return false;
      if (flowRun.awaitingHandoff.includes(nodeId)) return false;
      if (flowRun.awaitingHumanNodes[nodeId]) return false;
      return true;
    });
  }

  private hasUnsettledOrRunnableWork(flowRun: FlowRun, wf: WorkflowGraph): boolean {
    if (getActiveNodeIds(flowRun).length > 0) return true;
    if (flowRun.awaitingHandoff.length > 0) return true;
    if (this.deriveRunnableNodeIds(flowRun, wf).length > 0) return true;
    return false;
  }

  private async claimRunnableWorkForParallelRun(initialNodeIds: string[] = []): Promise<ClaimedRunnableWork[]> {
    const claimed: ClaimedRunnableWork[] = [];
    const pendingEmits: OperatorEvent[] = [];

    await SessionStore.updateFlowRun((flowRun) => {
      if (flowRun.status !== 'running') return;

      const wf = this.loadWorkflowDocument(flowRun);
      const resumableHumanNodeIds = Object.keys(flowRun.pendingHumanInputs)
        .filter((nodeId) => nodeId in flowRun.awaitingHumanNodes || flowRun.awaitingHandoff.includes(nodeId));
      // Nodes suspended for model selection become claimable again once their
      // role's model gate clears (selection persisted, or configured models
      // reduced to one).
      const resumableModelSelectionNodeIds = Object.entries(flowRun.awaitingHumanNodes)
        .filter(([, state]) =>
          state.reason === AWAITING_HUMAN_REASON.MODEL_SELECTION &&
          resolveRoleModelGate(flowRun.workspaceRoot, this.requireFlowRef(), state.role).kind === 'ready'
        )
        .map(([nodeId]) => nodeId);
      const runnableNodeIds = this.deriveRunnableNodeIds(flowRun, wf);
      const pendingInitialNodeIds = this.pruneInitialNodeIds(flowRun, wf, initialNodeIds);
      const allRunnableNodeIds = pendingInitialNodeIds.length > 0
        ? this.mergeNodeIds(resumableHumanNodeIds, resumableModelSelectionNodeIds, pendingInitialNodeIds) //adding resumable human nodes to both as a crash may happen before human input is cleared
        : this.mergeNodeIds(resumableHumanNodeIds, resumableModelSelectionNodeIds, runnableNodeIds);

      if (allRunnableNodeIds.length === 0) return;

      const occupiedRoles = new Map<string, string>();
      for (const nodeId of [...flowRun.runningNodes, ...Object.keys(flowRun.awaitingHumanNodes)]) {
        const node = wf.findNodeByIdOrNull(nodeId);
        if (!node) continue;
        occupiedRoles.set(this.roleKey(node.role), nodeId);
      }

      const selectedNodeIds: string[] = [];

      for (const nodeId of allRunnableNodeIds) {
        const node = wf.findNodeByIdOrNull(nodeId);
        if (!node) continue;
        const nodeRoleKey = this.roleKey(node.role);
        const conflictingNodeId = occupiedRoles.get(nodeRoleKey);
        if (conflictingNodeId && conflictingNodeId !== nodeId) continue;
        occupiedRoles.set(nodeRoleKey, nodeId);

        const humanInput = flowRun.pendingHumanInputs[nodeId]?.text;
        const work = this.buildNodeWork(nodeId, humanInput, flowRun, wf, pendingEmits);
        selectedNodeIds.push(nodeId);
        claimed.push(work);
      }

      if (selectedNodeIds.length === 0) return;
      flowRun.runningNodes = this.mergeNodeIds(flowRun.runningNodes, selectedNodeIds);
      flowRun.status = 'running';
    }, this.requireFlowRef(), this.requireWorkspaceRoot());

    for (const event of pendingEmits) this.renderer.emit(event);

    return claimed;
  }

  private buildNodeWork(nodeId: string, humanInput: string | undefined, flowRun: FlowRun, wf: WorkflowGraph, pendingEmits: OperatorEvent[]): ClaimedRunnableWork {
    const currentNodeDef = wf.findNodeById(nodeId);
    const roleInstanceId = currentNodeDef.role;

    const firstNodeVisit = !(flowRun.visitedNodeIds ?? []).includes(nodeId);
    const isVisitedNode = !firstNodeVisit;

    const inboundHandoffSnapshot = Object.entries(flowRun.receivingHandoff)
      .map(([key, artifacts]) => {
        const handoff = parseHandoffKey(key);
        return handoff ? { ...handoff, key, artifacts: [...artifacts] } : null;
      })
      .filter((handoff): handoff is HandoffKeyParts & { key: string; artifacts: string[] } =>
        handoff !== null &&
        handoff.targetId === nodeId &&
        this.isDeliverableInboundHandoff(flowRun, wf, nodeId, handoff.fromNodeId)
      )
      .map(({ key, artifacts }) => ({ key, artifacts }));

    const receivingHandoffSnapshot = inboundHandoffSnapshot.map(({ key, artifacts }) => ({
      fromNodeId: key.split('=>')[0],
      artifacts,
    }));

    // Stale forward handoffs: nodeId sent to a successor, but that successor sent a backward handoff back.
    // These are superseded and should not be delivered to the successor — collect them for context and cleanup.
    const backwardSenderIds = new Set(
      inboundHandoffSnapshot
        .map(({ key }) => key.split('=>')[0])
        .filter(from => wf.getIncomingEdges(nodeId).every(e => e.from !== from))
    );
    const staleForwardSnapshot = Object.entries(flowRun.receivingHandoff)
      .filter(([key]) => {
        const [from, to] = key.split('=>');
        return from === nodeId && backwardSenderIds.has(to);
      })
      .map(([key, artifacts]) => ({ key, toNodeId: key.split('=>')[1], artifacts: [...artifacts] }));

    const staleForwardArtifacts = staleForwardSnapshot.map(({ toNodeId, artifacts }) => ({ toNodeId, artifacts }));
    const hasHandoffContext = inboundHandoffSnapshot.length > 0 || staleForwardSnapshot.length > 0;

    let session = SessionStore.loadRoleSession(this.roleKey(roleInstanceId), this.requireFlowRef(), this.requireWorkspaceRoot());
    if (!session) {
      session = {
        roleName: roleInstanceId,
        logicalSessionId: this.roleSessionId(flowRun, roleInstanceId),
        transcriptHistory: [],
        isActive: true,
        currentNodeId: nodeId,
      };
    } else {
      session.currentNodeId = session.currentNodeId ?? nodeId;
    }

    if (!session.systemPrompt) {
      session.systemPrompt = ContextInjectionService.buildContextBundle(
        flowRun.projectNamespace, roleInstanceId, flowRun.workspaceRoot, flowRun.recordFolderPath
      ).bundleContent;
    }

    const injectedHistory = [...session.transcriptHistory] as RuntimeMessageParam[];
    const isSameNode = session.currentNodeId === nodeId;
    const resumedFromHuman = humanInput !== undefined && Boolean(flowRun.pendingHumanInputs[nodeId]);
    const resumedFromHandoff = !resumedFromHuman && hasHandoffContext;
    const sameNodeResume = session.isActive && isSameNode && injectedHistory.length > 0;
    const sameNodeHumanResume = resumedFromHuman && isSameNode && injectedHistory.length > 0;

    if (sameNodeResume || sameNodeHumanResume) {
      if (!session.currentNodeContext || session.currentNodeContext.nodeId !== nodeId) {
        session.currentNodeContext = { nodeId, exchanges: [...injectedHistory] };
      }
    } else {
      session.currentNodeContext = { nodeId, exchanges: [] };
    }

    const rawNodeContext = firstNodeVisit ? {
      required_readings: Array.isArray(currentNodeDef.required_readings) ? currentNodeDef.required_readings : undefined,
      guidance: Array.isArray(currentNodeDef.guidance) ? currentNodeDef.guidance : undefined,
      inputs: Array.isArray(currentNodeDef.inputs) ? currentNodeDef.inputs : undefined,
      work: Array.isArray(currentNodeDef.work) ? currentNodeDef.work : undefined,
      outputs: Array.isArray(currentNodeDef.outputs) ? currentNodeDef.outputs : undefined,
      transitions: Array.isArray(currentNodeDef.transitions) ? currentNodeDef.transitions : undefined,
      notes: Array.isArray(currentNodeDef.notes) ? currentNodeDef.notes : undefined,
    } : undefined;
    const nodeContext = rawNodeContext && Object.values(rawNodeContext).some(value =>
      Array.isArray(value) ? value.length > 0 : false
    ) ? rawNodeContext : undefined;
    const includeWorkflowContract = firstNodeVisit && nodeContractMentionsWorkflowAuthority(currentNodeDef);

    if (resumedFromHuman) {
      appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: humanInput });
    } else if (!sameNodeResume || resumedFromHandoff) {
      const nodeEntryMessage = buildForwardNodeEntryMessage({
        nodeId,
        workspaceRoot: flowRun.workspaceRoot,
        projectNamespace: flowRun.projectNamespace,
        isResume: !firstNodeVisit,
        handoffContext: { wf, completedHandoffs: flowRun.completedHandoffs, receivingHandoffSnapshot, staleForwardArtifacts },
        includeWorkflowContract,
        nodeContext,
      });
      appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: nodeEntryMessage });
    }

    if (resumedFromHuman) {
      pendingEmits.push({ kind: 'human.resumed', nodeId, role: roleInstanceId });
    }

    if (!isVisitedNode || !sameNodeResume || resumedFromHandoff) {
      pendingEmits.push({ kind: 'role.active', nodeId, role: roleInstanceId });
    }

    if (sameNodeResume && !resumedFromHandoff && injectedHistory[injectedHistory.length - 1]?.role === 'assistant') {
      pendingEmits.push({ kind: 'role.resumed', nodeId, role: roleInstanceId, reason: 'interrupted-turn' });
      appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE });
    }

    if (firstNodeVisit) {
      if (!flowRun.visitedNodeIds.includes(nodeId)) flowRun.visitedNodeIds.push(nodeId);
    }
    if (humanInput !== undefined) {
      delete flowRun.pendingHumanInputs[nodeId];
      delete flowRun.awaitingHumanNodes[nodeId];
      flowRun.awaitingHandoff = flowRun.awaitingHandoff.filter(id => id !== nodeId);
    } else if (resumedFromHandoff && flowRun.awaitingHumanNodes[nodeId]?.reason === AWAITING_HUMAN_REASON.PROMPT_HUMAN) {
      delete flowRun.awaitingHumanNodes[nodeId];
    }
    //this node will only be picked up if selection is resolved, so we can clear it
    if (flowRun.awaitingHumanNodes[nodeId]?.reason === AWAITING_HUMAN_REASON.MODEL_SELECTION) {
      delete flowRun.awaitingHumanNodes[nodeId];
    }
    if (!resumedFromHuman && (!sameNodeResume || resumedFromHandoff) && (inboundHandoffSnapshot.length > 0 || staleForwardSnapshot.length > 0)) {
      for (const { key, artifacts } of inboundHandoffSnapshot) {
        if (!(key in flowRun.receivingHandoff)) continue;
        flowRun.receivingHandoff[key] = flowRun.receivingHandoff[key].filter(a => !artifacts.includes(a));
        if (flowRun.receivingHandoff[key].length === 0) delete flowRun.receivingHandoff[key];
      }
      for (const { key } of staleForwardSnapshot) {
        delete flowRun.receivingHandoff[key];
        flowRun.completedHandoffs = flowRun.completedHandoffs.filter(k => k !== key);
      }
    }

    session.currentNodeId = nodeId;
    session.isActive = true;
    session.transcriptHistory = injectedHistory;
    SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());

    return { nodeId, roleInstanceId };
  }

  private async markNodeAwaitingHuman(
    nodeId: string,
    role: string,
    reason: AwaitingHumanReason
  ): Promise<FlowRun> {
    return SessionStore.updateFlowRun((flowRun) => {
      flowRun.runningNodes = flowRun.runningNodes.filter(id => id !== nodeId);
      flowRun.awaitingHumanNodes[nodeId] = { role, reason };
      flowRun.status = 'running';
    }, this.requireFlowRef(), this.requireWorkspaceRoot());
  }

  private removeOpenNode(flowRun: FlowRun, nodeId: string) {
    flowRun.runningNodes = flowRun.runningNodes.filter(id => id !== nodeId);
    flowRun.awaitingHandoff = flowRun.awaitingHandoff.filter(id => id !== nodeId);
    delete flowRun.awaitingHumanNodes[nodeId];
  }

  private setFlowContext(flowRun: FlowRun): void {
    this.flowRef = {
      projectNamespace: flowRun.projectNamespace,
      flowId: flowRun.flowId,
    };
    this.workspaceRoot = flowRun.workspaceRoot;
  }

  private requireFlowRef(): FlowRef {
    if (!this.flowRef) {
      throw new Error('No active flow reference is bound to this orchestrator.');
    }
    return this.flowRef;
  }

  private requireWorkspaceRoot(): string {
    if (!this.workspaceRoot) {
      throw new Error('No workspace root is bound to this orchestrator.');
    }
    return this.workspaceRoot;
  }

  private roleKey(roleInstanceId: string): string {
    return parseRoleIdentity(roleInstanceId).instanceRoleId;
  }

  private isPredecessor(wf: WorkflowGraph, nodeId: string, possiblePredecessorId: string): boolean {
    return wf.getIncomingEdges(nodeId).some((edge: any) => edge.from === possiblePredecessorId);
  }

  private isSuccessor(wf: WorkflowGraph, nodeId: string, possibleSuccessorId: string): boolean {
    return wf.getOutgoingEdges(nodeId).some((edge: any) => edge.to === possibleSuccessorId);
  }

  private hasActiveBackwardHandoffToPredecessor(
    flowRun: FlowRun,
    wf: WorkflowGraph,
    nodeId: string,
    predecessorId: string
  ): boolean {
    return (
      this.isPredecessor(wf, nodeId, predecessorId) &&
      Object.prototype.hasOwnProperty.call(flowRun.receivingHandoff, wf.edgeKey(nodeId, predecessorId))
    );
  }

  private isDeliverableInboundHandoff(
    flowRun: FlowRun,
    wf: WorkflowGraph,
    nodeId: string,
    fromNodeId: string
  ): boolean {
    if (this.isSuccessor(wf, nodeId, fromNodeId)) {
      return true;
    }

    if (!this.isPredecessor(wf, nodeId, fromNodeId)) {
      return false;
    }

    // A forward handoff from a predecessor is stale while the target still has
    // an active backward correction request addressed to that same predecessor.
    return !this.hasActiveBackwardHandoffToPredecessor(flowRun, wf, nodeId, fromNodeId);
  }

  private roleSessionId(flowRun: FlowRun, roleInstanceId: string): string {
    return `${flowRun.flowId}__${this.roleKey(roleInstanceId)}`;
  }

  private throwHandoffTransitionRepair(detail: string): never {
    throw new HandoffParseError({
      code: 'invalid_transition',
      operatorSummary: 'Handoff target mismatch',
      modelRepairMessage: `Error: ${detail} Correct the final \`handoff\` block and restate it.`
    });
  }

  private mergeNodeIds(...nodeGroups: string[][]): string[] {
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const group of nodeGroups) {
      for (const nodeId of group) {
        if (!nodeId || seen.has(nodeId)) continue;
        seen.add(nodeId);
        merged.push(nodeId);
      }
    }
    return merged;
  }

  private validateTargetArtifactsExist(workspaceRoot: string, handoffs: HandoffTarget[]): void {
    handoffs.forEach((handoff, index) => {
      const label = handoffs.length === 1
        ? 'handoff target'
        : `handoff target [${index}]`;
      this.validateArtifactPathExists(workspaceRoot, handoff.artifact_path, label);
    });
  }

  private validateArtifactPathExists(
    workspaceRoot: string,
    artifactPath: string | null,
    label: string
  ): void {
    if (typeof artifactPath !== 'string' || artifactPath.trim() === '') {
      throw new HandoffParseError({
        code: 'missing_required_field',
        operatorSummary: 'Handoff block missing required field',
        modelRepairMessage: `Error: ${label} is missing artifact_path. Save the artifact file first, then restate the handoff.`
      });
    }

    const resolvedPath = path.isAbsolute(artifactPath)
      ? artifactPath
      : path.resolve(workspaceRoot, artifactPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new HandoffParseError({
        code: 'artifact_unavailable',
        operatorSummary: 'Referenced artifact unavailable',
        modelRepairMessage: `Error: The handoff referenced artifact_path "${artifactPath}", but no file exists at that path. Write the artifact to disk first, then restate the same handoff.`
      });
    }

    if (!fs.statSync(resolvedPath).isFile()) {
      throw new HandoffParseError({
        code: 'artifact_unavailable',
        operatorSummary: 'Referenced artifact unavailable',
        modelRepairMessage: `Error: The handoff referenced artifact_path "${artifactPath}", but that path is not a file. Write the artifact file first, then restate the same handoff.`
      });
    }
  }

  private ensureSigintHandler(): void {
    if (this.boundSigintHandler) return;
    this.boundSigintHandler = () => {
      for (const { controller } of this.activeTurnControllers.values()) {
        if (!controller.signal.aborted) controller.abort();
      }
    };
    process.on('SIGINT', this.boundSigintHandler);
  }

  private releaseSigintHandlerIfIdle(): void {
    if (this.activeTurnControllers.size === 0 && this.boundSigintHandler) {
      process.removeListener('SIGINT', this.boundSigintHandler);
      this.boundSigintHandler = null;
    }
  }

}
