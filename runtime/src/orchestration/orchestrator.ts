import fs from 'node:fs';
import path from 'node:path';
import { ContextInjectionService } from '../context/injection.js';
import { SessionStore } from './store.js';
import { HandoffParseError } from './handoff.js';
import type { AwaitingHumanReason, FlowRef, FlowRun, HandoffTarget, RoleTurnResult, OperatorRenderSink, ConsentGate, RoleSession, RuntimeMessageParam } from '../common/types.js';
import { emitUsage, runRoleTurn } from './orient.js';
import { compactRoleSession, shouldAutoCompact } from './compaction.js';
import { buildForwardNodeEntryMessage } from '../context/session-entry.js';
import { ImprovementOrchestrator } from '../improvement/improvement.js';
import { buildWorkflowRepairGuidance, validateWorkflowFile } from '../framework-services/workflow-graph-validator.js';
import { buildRuntimeHealthRepairGuidance, runRuntimeHealthChecks } from '../framework-services/runtime-health-checks.js';
import { TelemetryManager } from '../observability/observability.js';
import { parseRoleIdentity } from '../common/role-id.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { canonicalWorkflowFilename, findWorkflowFilePath, resolveFlowWorkflow } from '../context/workflow-file.js';
import { WorkflowGraph } from './workflow-graph.js';
import { syncRecordMetadataFromWorkflow } from '../projects/record-metadata.js';
import { getActiveModelWithKey } from '../settings/settings-store.js';

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}

type AppliedHandoffDirection = 'forward' | 'backward' | 'terminal';
type ClaimedRunnableWork = { nodeId: string; humanInput?: string };

const INTERRUPTED_TURN_CONTINUATION_MESSAGE =
  'The previous assistant response was interrupted during streaming. Continue from where you left off. Do not repeat completed content unless needed for coherence.';

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

function upsertAssistantDelta(history: RuntimeMessageParam[], text: string): void {
  if (!text) return;
  const previous = history[history.length - 1];
  if (previous?.role === 'assistant') {
    previous.content += text;
    return;
  }
  history.push({ role: 'assistant', content: text });
}

function removeAssistantDraftBeforeToolCalls(
  history: RuntimeMessageParam[],
  newMessages: RuntimeMessageParam[]
): void {
  if (newMessages[0]?.role !== 'assistant_tool_calls') return;
  const firstNewMessageIndex = history.length - newMessages.length;
  const previousIndex = firstNewMessageIndex - 1;
  if (previousIndex < 0) return;
  if (history[previousIndex]?.role === 'assistant') {
    history.splice(previousIndex, 1);
  }
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

function upsertCurrentNodeAssistantDelta(session: RoleSession, nodeId: string, text: string): void {
  if (!text) return;
  if (!session.currentNodeContext || session.currentNodeContext.nodeId !== nodeId) {
    session.currentNodeContext = { nodeId, exchanges: [] };
  }
  const previous = session.currentNodeContext.exchanges[session.currentNodeContext.exchanges.length - 1];
  if (previous?.role === 'assistant') {
    previous.content += text;
    return;
  }
  session.currentNodeContext.exchanges.push({ role: 'assistant', content: text });
}

function appendConversationMessagesToCurrentNode(
  session: RoleSession,
  nodeId: string,
  messages: RuntimeMessageParam[]
): void {
  if (!session.currentNodeContext || session.currentNodeContext.nodeId !== nodeId) {
    session.currentNodeContext = { nodeId, exchanges: [] };
  }
  if (messages[0]?.role === 'assistant_tool_calls') {
    const exchanges = session.currentNodeContext.exchanges;
    if (exchanges[exchanges.length - 1]?.role === 'assistant') {
      exchanges.splice(exchanges.length - 1, 1);
    }
  }
  session.currentNodeContext.exchanges.push(...messages);
}

export class FlowOrchestrator {
  private renderer: OperatorRenderSink;
  private activeTurnControllers = new Map<string, { role: string; controller: AbortController }>();
  private flowRef: FlowRef | null = null;
  private workspaceRoot: string | null = null;
  private boundSigintHandler: (() => void) | null = null;
  private wakeGeneration = 0;
  private wakeWaiters = new Set<() => void>();

  constructor(renderer: OperatorRenderSink) {
    this.renderer = renderer;
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

  public hasActiveTurn(target?: { nodeId?: string; role?: string }): boolean {
    for (const [nodeId, entry] of this.activeTurnControllers.entries()) {
      if (target?.nodeId && target.nodeId !== nodeId) continue;
      if (target?.role && this.roleKey(target.role) !== this.roleKey(entry.role)) continue;
      if (!entry.controller.signal.aborted) return true;
    }
    return false;
  }

  public wake(): void {
    this.wakeGeneration += 1;
    for (const wakeWaiter of this.wakeWaiters) {
      wakeWaiter();
    }
    this.wakeWaiters.clear();
  }

  public async compactRoleContext(
    flowRun: FlowRun,
    roleName: string,
    trigger: 'manual' | 'auto' = 'manual'
  ): Promise<{ compacted: boolean; archiveId?: string; reason?: string }> {
    this.setFlowContext(flowRun);
    const session = SessionStore.loadRoleSession(
      this.roleKey(roleName),
      this.requireFlowRef(),
      this.requireWorkspaceRoot()
    );
    if (!session) {
      const reason = `No persisted session found for role "${roleName}".`;
      this.renderer.emit({ kind: 'session.compaction_failed', role: roleName, trigger, reason });
      return { compacted: false, reason };
    }

    this.renderer.emit({ kind: 'session.compaction_started', role: roleName, trigger });

    let result: { compacted: boolean; archiveId?: string; reason?: string };
    try {
      result = await compactRoleSession({
        session,
        flowRun,
        roleName,
        trigger
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.renderer.emit({ kind: 'session.compaction_failed', role: roleName, trigger, reason });
      throw error;
    }

    if (!result.compacted) {
      this.renderer.emit({
        kind: 'session.compaction_failed',
        role: roleName,
        trigger,
        reason: result.reason ?? 'No context was available to compact.'
      });
    }

    if (result.compacted) {
      SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
      this.renderer.emit({
        kind: 'session.compacted',
        role: roleName,
        nodeId: session.currentNodeContext?.nodeId ?? session.currentNodeId ?? '(unknown)',
        trigger,
        archiveId: result.archiveId!
      });
    }

    return result;
  }

  public async runStoredFlow(
    workspaceRoot: string,
    projectNamespace: string,
    outputStream: NodeJS.WritableStream = process.stdout,
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

        flowRun = await this.releaseStaleRunningNodes();
        const resumedOpenNodes = this.getOpenNodeIds(flowRun);
        this.renderer.emit({ kind: 'flow.resumed', flowId: flowRun.flowId, activeNodeCount: resumedOpenNodes.length });

        rootSpan.setAttribute('flow.id', flowRun.flowId);
        rootSpan.setAttribute('flow.project_namespace', flowRun.projectNamespace);
        rootSpan.addEvent('flow.established', { 'flow.id': flowRun.flowId, 'record_folder_path': path.relative(workspaceRoot, flowRun.recordFolderPath) });
        meter.createCounter('a_society.flow.started').add(1, { project_namespace: flowRun.projectNamespace });

        while (true) {
          const observedWakeGeneration = this.wakeGeneration;
          await this.runReadyNodesUntilBlocked(outputStream, outputStreamFactory, consentGate);
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

  public async advanceFlow(
    flowRun: FlowRun,
    nodeId: string,
    humanInput?: string,
    outputStream: NodeJS.WritableStream = process.stdout,
    consentGate?: ConsentGate,
    outputStreamFactory?: (role: string) => NodeJS.WritableStream
  ): Promise<void> {
    this.setFlowContext(flowRun);
    const claim = await this.claimNodeForAdvance(nodeId, humanInput !== undefined);
    flowRun = claim.flowRun;
    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('flow.node.advance', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'node.id': nodeId
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
          const metadata = syncRecordMetadataFromWorkflow(flowRun.recordFolderPath, flowRun.flowId);
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

        const wf = this.loadWorkflowDocument(flowRun);
        const currentNodeDef = wf.findNodeById(nodeId);

        const roleName = currentNodeDef.role;
        span.setAttribute('role', roleName);
        span.setAttribute('role_name', roleName);
        span.setAttribute('session.id', this.roleSessionId(flowRun, roleName));
        if (claim.resumedFromHuman) {
          span.addEvent('human_input.received');
          this.renderer.emit({ kind: 'human.resumed', nodeId, role: currentNodeDef.role });
        }

        const sessionId = this.roleSessionId(flowRun, roleName);
        const visitedNodeIds = flowRun.visitedNodeIds ?? (flowRun.visitedNodeIds = []);
        const firstNodeVisit = !visitedNodeIds.includes(nodeId);

        const inboundHandoffSnapshot = Object.entries(flowRun.receivingHandoff)
          .filter(([key]) => key.split('=>')[1] === nodeId)
          .map(([key, artifacts]) => ({ key, artifacts: [...artifacts] }));
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

        const nodeOutputStream = outputStreamFactory ? outputStreamFactory(roleName) : outputStream;

        let session = SessionStore.loadRoleSession(this.roleKey(roleName), this.requireFlowRef(), this.requireWorkspaceRoot());
        span.setAttribute('node.session_resumed', session !== null);
        if (!session) {
          session = {
            roleName,
            logicalSessionId: sessionId,
            transcriptHistory: [],
            isActive: true,
            currentNodeId: nodeId
          };
        } else {
          span.addEvent('store.session_loaded', { 'session.id': sessionId, 'session.resumed': true });
          session.currentNodeId = session.currentNodeId ?? nodeId;
        }

        if (!session.systemPrompt) {
          session.systemPrompt = ContextInjectionService.buildContextBundle(
            flowRun.projectNamespace, roleName, flowRun.workspaceRoot
          ).bundleContent;
        }
        const bundleContent = session.systemPrompt;

        const injectedHistory = [...session.transcriptHistory] as RuntimeMessageParam[];
        const saveRoleSession = (): void => {
          session.transcriptHistory = injectedHistory;
          SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
        };
        const isVisitedNode = !firstNodeVisit;
        const isSameNode = session.currentNodeId === nodeId;
        const sameNodeResume = session.isActive && isSameNode && injectedHistory.length > 0;
        if (!isVisitedNode || !sameNodeResume) {
          this.renderer.emit({
            kind: 'role.active',
            nodeId,
            role: currentNodeDef.role,
          });
        }
        if (sameNodeResume) {
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

        const forwardHandoffTargets = firstNodeVisit
          ? wf.getOutgoingEdges(nodeId)
              .map((edge: any) => {
                const node = wf.findNodeByIdOrNull(edge.to);
                return node ? { nodeId: node.id as string, role: node.role as string } : null;
              })
              .filter((t): t is { nodeId: string; role: string } => t !== null)
          : undefined;
        const backwardHandoffTargets = firstNodeVisit
          ? wf.getIncomingEdges(nodeId)
              .map((edge: any) => {
                const node = wf.findNodeByIdOrNull(edge.from);
                return node ? { nodeId: node.id as string, role: node.role as string } : null;
              })
              .filter((t): t is { nodeId: string; role: string } => t !== null)
          : undefined;

        const staleForwardArtifacts = staleForwardSnapshot.map(({ toNodeId, artifacts }) => ({ toNodeId, artifacts }));

        if (injectedHistory.length === 0) {
          const nodeEntryMessage = buildForwardNodeEntryMessage({
            nodeId,
            role: roleName,
            workspaceRoot: flowRun.workspaceRoot,
            projectNamespace: flowRun.projectNamespace,
            recordFolderPath: flowRun.recordFolderPath,
            wf,
            completedHandoffs: flowRun.completedHandoffs,
            receivingHandoffSnapshot,
            staleForwardArtifacts,
            humanInput,
            includeWorkflowContract,
            nodeContext,
            forwardHandoffTargets,
            backwardHandoffTargets
          });
          appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: nodeEntryMessage });
        } else if (!sameNodeResume) {
          const nodeEntryMessage = buildForwardNodeEntryMessage({
            nodeId,
            role: roleName,
            workspaceRoot: flowRun.workspaceRoot,
            projectNamespace: flowRun.projectNamespace,
            recordFolderPath: flowRun.recordFolderPath,
            wf,
            completedHandoffs: flowRun.completedHandoffs,
            receivingHandoffSnapshot,
            staleForwardArtifacts,
            entryMode: firstNodeVisit ? 'role-transition' : 'reopened-node',
            previousNodeId: session.currentNodeId,
            humanInput,
            includeWorkflowContract,
            nodeContext,
            forwardHandoffTargets,
            backwardHandoffTargets
          });
          appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: nodeEntryMessage });
        } else if (humanInput) {
          appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: humanInput });
        }

        if (sameNodeResume && injectedHistory[injectedHistory.length - 1]?.role === 'assistant') {
          appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: INTERRUPTED_TURN_CONTINUATION_MESSAGE });
          span.addEvent('session.interrupted_turn_continuation');
        }

        if (firstNodeVisit && (injectedHistory.length > 0)) {
          flowRun = await SessionStore.updateFlowRun((latest) => {
            const latestVisitedNodeIds = latest.visitedNodeIds ?? [];
            if (!latestVisitedNodeIds.includes(nodeId)) {
              latestVisitedNodeIds.push(nodeId);
            }
            latest.visitedNodeIds = latestVisitedNodeIds;
          }, this.requireFlowRef(), this.requireWorkspaceRoot());
        }

        session.currentNodeId = nodeId;
        session.isActive = true;
        saveRoleSession();

        if (humanInput !== undefined) {
          await SessionStore.updateFlowRun((latest) => {
            const pending = latest.pendingHumanInputs[nodeId];
            if (pending?.text === humanInput) {
              delete latest.pendingHumanInputs[nodeId];
            }
          }, this.requireFlowRef(), this.requireWorkspaceRoot());
        }

        if (!sameNodeResume && (inboundHandoffSnapshot.length > 0 || staleForwardSnapshot.length > 0)) {
          flowRun = await SessionStore.updateFlowRun((latest) => {
            for (const { key, artifacts } of inboundHandoffSnapshot) {
              if (!(key in latest.receivingHandoff)) continue;
              latest.receivingHandoff[key] = latest.receivingHandoff[key].filter(a => !artifacts.includes(a));
              if (latest.receivingHandoff[key].length === 0) {
                delete latest.receivingHandoff[key];
              }
            }
            for (const { key } of staleForwardSnapshot) {
              delete latest.receivingHandoff[key];
              latest.completedHandoffs = latest.completedHandoffs.filter(k => k !== key);
            }
          }, this.requireFlowRef(), this.requireWorkspaceRoot());
        }

        span.addEvent('store.flow_saved', { 'flow.status': flowRun.status });

        while (true) {
          try {
            const controller = new AbortController();
            this.activeTurnControllers.set(nodeId, { role: roleName, controller });
            this.ensureSigintHandler();

            let sessionResult: RoleTurnResult | null = null;
            try {
              sessionResult = await runRoleTurn(
                flowRun.workspaceRoot, flowRun.projectNamespace, roleName, bundleContent,
                injectedHistory,
                nodeOutputStream,
                controller.signal,
                this.renderer,
                consentGate,
                async (messages) => {
                  removeAssistantDraftBeforeToolCalls(injectedHistory, messages);
                  appendConversationMessagesToCurrentNode(session, nodeId, messages);
                  saveRoleSession();
                },
                (text) => {
                  upsertAssistantDelta(injectedHistory, text);
                  upsertCurrentNodeAssistantDelta(session, nodeId, text);
                  saveRoleSession();
                },
                nodeId
              );
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
              this.applyLatestTurnUsage(session, turnUsage);
              emitUsage(this.renderer, turnUsage, roleName);
              if (handoffResult.kind === 'awaiting_human') {
                const awaitingReason = sessionResult.awaitingHumanReason ?? 'prompt-human';
                span.setAttribute('node.outcome', 'awaiting_human');
                span.addEvent('node.awaiting_human_suspended', { suspension_reason: awaitingReason });
                session.transcriptHistory = injectedHistory;
                SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                flowRun = await this.markNodeAwaitingHuman(nodeId, currentNodeDef.role, awaitingReason);
                await this.autoCompactSessionIfNeeded(session, flowRun, nodeId, currentNodeDef.role, injectedHistory, turnUsage);
                this.renderer.emit({ kind: 'human.awaiting_input', nodeId, role: currentNodeDef.role, reason: awaitingReason });
                break;
              }

              if (handoffResult.kind === 'forward-pass-closed') {
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
                    role: currentNodeDef.role,
                    nodeId
                  });
                  appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: guidance.modelRepairMessage });
                  session.transcriptHistory = injectedHistory;
                  SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                  await this.autoCompactSessionIfNeeded(session, flowRun, nodeId, currentNodeDef.role, injectedHistory, turnUsage);
                  continue;
                }

                span.setAttribute('node.outcome', 'forward_pass_closed');
                const uniqueBaseRoles = new Set(
                  (wf.nodes as any[]).map((n) => parseRoleIdentity(n.role).baseRoleId)
                );
                const singleRole = uniqueBaseRoles.size <= 1;
                flowRun = await SessionStore.updateFlowRun((latest) => {
                  this.removeOpenNode(latest, nodeId);
                  this.addCompletedNode(latest, nodeId);
                  ImprovementOrchestrator.markAwaitingChoice(latest, {
                    recordFolderPath: handoffResult.recordFolderPath,
                    artifactPath: handoffResult.artifactPath
                  }, singleRole);
                }, this.requireFlowRef(), this.requireWorkspaceRoot());
                session.transcriptHistory = injectedHistory;
                session.isActive = false;
                SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                this.renderer.emit({
                  kind: 'flow.forward_pass_closed',
                  recordFolderPath: handoffResult.recordFolderPath,
                  artifactBasename: path.basename(handoffResult.artifactPath)
                });
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
                const isPendingTarget = wf.getIncomingEdges(nodeId).some((e: any) => !latestForCheck.completedHandoffs.includes(wf.edgeKey(e.from, nodeId)));
                const isReceivingTarget = Object.keys(latestForCheck.receivingHandoff).some(k => k.split('=>')[1] === nodeId);

                if (!isPendingTarget && !isReceivingTarget) {
                  this.renderer.emit({
                    kind: 'repair.requested',
                    scope: 'node',
                    code: 'invalid_transition',
                    summary: 'await-handoff invalid: no inbound handoff established',
                    role: currentNodeDef.role,
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
              this.validateTargetArtifactsExist(flowRun.workspaceRoot, handoffs);

              await this.applyHandoffAndAdvance(flowRun, nodeId, currentNodeDef.role, handoffs);
              const latestFlowRun = SessionStore.loadFlowRun(this.requireFlowRef(), this.requireWorkspaceRoot()) ?? flowRun;

              session.transcriptHistory = injectedHistory;
              session.isActive = false;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
              if (this.roleHasFutureNode(wf, latestFlowRun, nodeId, currentNodeDef.role)) {
                await this.autoCompactSessionIfNeeded(session, latestFlowRun, nodeId, currentNodeDef.role, injectedHistory, turnUsage);
              }
              span.addEvent('store.session_saved', { 'session.id': sessionId, 'session.active': false });
              break;
            } else {
              span.setAttribute('node.outcome', 'null_return');
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
              flowRun = await this.markNodeAwaitingHuman(nodeId, currentNodeDef.role, 'autonomous-abort');
              this.renderer.emit({ kind: 'human.awaiting_input', nodeId, role: currentNodeDef.role, reason: 'autonomous-abort' });
              span.addEvent('node.awaiting_human_suspended', { suspension_reason: 'null_session_return' });
              break;
            }
          } catch (e: any) {
            if (e instanceof HandoffParseError) {
              this.applyLatestTurnUsage(session, e.contextUsage);
              emitUsage(this.renderer, e.contextUsage, roleName);
              span.addEvent('handoff.parse_error_injected', {
                error_type: e.name,
                error_message: e.message.slice(0, 500)
              });
              this.renderer.emit({
                kind: 'repair.requested',
                scope: 'node',
                code: e.details.code,
                summary: e.details.operatorSummary,
                role: currentNodeDef.role,
                nodeId
              });
              appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: e.details.modelRepairMessage });
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
              await this.autoCompactSessionIfNeeded(session, flowRun, nodeId, currentNodeDef.role, injectedHistory, e.contextUsage);
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
                role: currentNodeDef.role,
                nodeId
              });
              appendRuntimeMessage(injectedHistory, session, nodeId, { role: 'user', content: guidance.modelRepairMessage });
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
              await this.autoCompactSessionIfNeeded(session, flowRun, nodeId, currentNodeDef.role, injectedHistory);
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
  ): Promise<AppliedHandoffDirection> {
    this.setFlowContext(flowRun);
    if (!fs.existsSync(flowRun.recordFolderPath)) {
      throw new WorkflowError(
        `Error: No record folder found at ${flowRun.recordFolderPath}. ` +
        `A record folder must be created before emitting a handoff. ` +
        `Please create the record folder, create ${canonicalWorkflowFilename()} inside it, and restate your handoff.`
      );
    }
    this.validateTargetArtifactsExist(flowRun.workspaceRoot, handoffs);

    let direction: AppliedHandoffDirection | null = null;
    let eventTargets: Array<{ nodeId: string; role: string; artifactBasename?: string }> = [];

    await SessionStore.updateFlowRun((latest) => {
      const wf = this.resolveActiveWorkflow(latest);

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
            `Target node '${targetNodeId}' is both an unresolved successor and a predecessor of '${nodeId}', which is unsupported.`
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
        this.throwHandoffTransitionRepair(
          `Unauthorized transition: node '${nodeId}' may hand forward only to unresolved successors or backward only to direct predecessors, but proposed '${targetNodeId}'.`
        );
      }

      if (forwardTargets.length > 0 && backwardTargets.length > 0) {
        this.throwHandoffTransitionRepair(
          `Node '${nodeId}' emitted a mixed forward/backward handoff. Emit either successor targets or predecessor targets, not both.`
        );
      }

      if (handoffs.length === 0) {
        if (outgoingEdges.length > 0) {
          this.throwHandoffTransitionRepair(`Node '${nodeId}' emitted no valid handoff targets.`);
        }
        this.removeOpenNode(latest, nodeId);
        this.addCompletedNode(latest, nodeId);
        direction = 'terminal';
        eventTargets = [];
        if (this.getOpenNodeIds(latest).length === 0) {
          latest.status = 'completed';
        } else {
          latest.status = 'running';
        }
        return;
      }

      if (forwardTargets.length > 0) {
        const activationPairs: Array<{ targetId: string; artifact: string; role: string }> = [];
        const claimedTargets = new Set<string>();

        for (const handoff of forwardTargets) {
          if (claimedTargets.has(handoff.target_node_id)) {
            this.throwHandoffTransitionRepair(`Node '${nodeId}' emitted duplicate forward handoffs for target '${handoff.target_node_id}'.`);
          }
          claimedTargets.add(handoff.target_node_id);
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

        this.markNodeCompletedIfSettled(latest, wf, nodeId);
        latest.status = 'running';
        direction = 'forward';
        eventTargets = activationPairs.map(p => ({
          nodeId: p.targetId,
          role: p.role,
          artifactBasename: p.artifact ? path.basename(p.artifact) : undefined
        }));
        return;
      }

      if (backwardTargets.length > 0) {
        const reactivationPlans: Array<{
          targetId: string;
          role: string;
          rejectedEdgeKey: string;
        }> = [];
        const claimedTargets = new Set<string>();

        const backwardHistoryArtifacts = new Set(Object.values(latest.historyHandoff).flat());

        for (const handoff of backwardTargets) {
          if (claimedTargets.has(handoff.target_node_id)) {
            this.throwHandoffTransitionRepair(`Node '${nodeId}' emitted duplicate backward handoffs for target '${handoff.target_node_id}'.`);
          }
          claimedTargets.add(handoff.target_node_id);

          if (handoff.artifact_path && backwardHistoryArtifacts.has(handoff.artifact_path)) {
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

          const backwardHandoffKey = wf.edgeKey(nodeId, targetNode.id);
          if (!latest.receivingHandoff[backwardHandoffKey]) latest.receivingHandoff[backwardHandoffKey] = [];
          if (handoff.artifact_path && !latest.receivingHandoff[backwardHandoffKey].includes(handoff.artifact_path)) {
            latest.receivingHandoff[backwardHandoffKey].push(handoff.artifact_path);
          }
          if (!latest.historyHandoff[backwardHandoffKey]) latest.historyHandoff[backwardHandoffKey] = [];
          if (handoff.artifact_path && !latest.historyHandoff[backwardHandoffKey].includes(handoff.artifact_path)) {
            latest.historyHandoff[backwardHandoffKey].push(handoff.artifact_path);
          }

          reactivationPlans.push({
            targetId: targetNode.id,
            role: targetNode.role,
            rejectedEdgeKey,
          });
        }

        this.removeOpenNode(latest, nodeId);
        this.removeCompletedNode(latest, nodeId);
        if (!latest.awaitingHandoff.includes(nodeId)) latest.awaitingHandoff.push(nodeId);

        const reactivatedTargets: Array<{ targetId: string; role: string }> = [];

        for (const plan of reactivationPlans) {
          latest.completedHandoffs = latest.completedHandoffs.filter(k => k !== plan.rejectedEdgeKey);
          this.removeCompletedNode(latest, plan.targetId);
          reactivatedTargets.push({ targetId: plan.targetId, role: plan.role });
        }

        latest.status = 'running';
        direction = 'backward';
        eventTargets = reactivatedTargets.map(target => ({
          nodeId: target.targetId,
          role: target.role,
          artifactBasename: undefined
        }));
        return;
      }

      this.throwHandoffTransitionRepair(`Node '${nodeId}' emitted no valid handoff targets.`);
    }, this.requireFlowRef(), this.requireWorkspaceRoot());

    if (!direction) {
      throw new Error(`Node '${nodeId}' emitted no valid handoff targets.`);
    }

    this.renderer.emit({
      kind: 'handoff.applied',
      fromNodeId: nodeId,
      fromRole,
      targets: eventTargets
    });

    return direction;
  }

  private async runReadyNodesUntilBlocked(
    outputStream: NodeJS.WritableStream,
    outputStreamFactory?: (role: string) => NodeJS.WritableStream,
    consentGate?: ConsentGate
  ): Promise<void> {
    const runningTasks = new Map<string, Promise<void>>();
    let firstError: unknown = null;

    while (true) {
      const observedWakeGeneration = this.wakeGeneration;
      const claimedWorkItems = await this.claimRunnableWorkForParallelRun();
      for (const claimedWork of claimedWorkItems) {
        if (runningTasks.has(claimedWork.nodeId)) continue;
        const task = this.advanceFlow(
          SessionStore.loadFlowRun(this.requireFlowRef(), this.requireWorkspaceRoot())!,
          claimedWork.nodeId,
          claimedWork.humanInput,
          outputStream,
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

  private async releaseStaleRunningNodes(): Promise<FlowRun> {
    return SessionStore.updateFlowRun((flowRun) => {
      if (flowRun.runningNodes.length > 0) {
        flowRun.readyNodes = this.mergeNodeIds(flowRun.readyNodes, flowRun.runningNodes);
        flowRun.runningNodes = [];
      }
    }, this.requireFlowRef(), this.requireWorkspaceRoot());
  }

  private loadWorkflowDocument(flowRun: FlowRun): WorkflowGraph {
    const workflowFilePath = findWorkflowFilePath(flowRun.recordFolderPath);
    if (!workflowFilePath) {
      throw new Error('No workflow found in this record. Please start a new flow.');
    }
    return new WorkflowGraph(resolveFlowWorkflow(flowRun.recordFolderPath, flowRun.workspaceRoot, flowRun.projectNamespace));
  }

  private deriveHandoffReadyNodes(flowRun: FlowRun, wf: WorkflowGraph): string[] {
    const receivingHandoffKeys = Object.keys(flowRun.receivingHandoff);
    flowRun.awaitingHandoff = flowRun.awaitingHandoff.filter(nodeId => {
      const predecessorIds = new Set(wf.getIncomingEdges(nodeId).map(e => e.from));
      // Keep waiting if node still has an outstanding backward handoff to a predecessor.
      if (receivingHandoffKeys.some(key => {
        const [from, to] = key.split('=>');
        return from === nodeId && predecessorIds.has(to);
      })) return true;
      // Release once a predecessor has sent a new handoff.
      return !receivingHandoffKeys.some(key => {
        const [from, to] = key.split('=>');
        return to === nodeId && predecessorIds.has(from);
      });
    });

    const visitedSet = new Set(flowRun.visitedNodeIds ?? []);
    const awaitingHandoffSet = new Set(flowRun.awaitingHandoff);
    const openNodes = new Set(this.getOpenNodeIds(flowRun));
    const completedNodes = new Set(flowRun.completedNodes);

    const result: string[] = [];
    const seen = new Set<string>();

    // Condition 1: visited + has a pending outgoing handoff (not yet in completedHandoffs) + not awaiting a handoff
    for (const node of wf.nodes) {
      const nodeId = node.id;
      if (seen.has(nodeId) || !visitedSet.has(nodeId) || awaitingHandoffSet.has(nodeId) || openNodes.has(nodeId) || completedNodes.has(nodeId)) continue;
      const hasPendingOutgoing = wf.getOutgoingEdges(nodeId).some((e: any) => !flowRun.completedHandoffs.includes(wf.edgeKey(nodeId, e.to)));
      if (hasPendingOutgoing) {
        result.push(nodeId);
        seen.add(nodeId);
      }
    }

    // Condition 2: has received a handoff (appears as "to" in receivingHandoff)
    for (const key of Object.keys(flowRun.receivingHandoff)) {
      const nodeId = key.split('=>')[1];
      if (
        !seen.has(nodeId) &&
        !openNodes.has(nodeId) &&
        !awaitingHandoffSet.has(nodeId)
      ) {
        result.push(nodeId);
        seen.add(nodeId);
      }
    }

    return result;
  }

  private async claimRunnableWorkForParallelRun(): Promise<ClaimedRunnableWork[]> {
    let claimedWork: ClaimedRunnableWork[] = [];
    await SessionStore.updateFlowRun((flowRun) => {
      if (flowRun.status !== 'running') {
        claimedWork = [];
        return;
      }

      const wf = this.loadWorkflowDocument(flowRun);
      const readyNodes2 = this.deriveHandoffReadyNodes(flowRun, wf);
      const resumableHumanNodeIds = Object.keys(flowRun.pendingHumanInputs)
        .filter((nodeId) => nodeId in flowRun.awaitingHumanNodes);
      const allRunnableNodeIds = this.mergeNodeIds(resumableHumanNodeIds, flowRun.readyNodes, readyNodes2);

      if (allRunnableNodeIds.length === 0) {
        claimedWork = [];
        return;
      }
      const occupiedRoles = new Map<string, string>();
      for (const nodeId of [...flowRun.runningNodes, ...Object.keys(flowRun.awaitingHumanNodes)]) {
        const node = wf.findNodeById(nodeId);
        occupiedRoles.set(this.roleKey(node.role), nodeId);
      }

      const selected: ClaimedRunnableWork[] = [];
      for (const nodeId of allRunnableNodeIds) {
        const node = wf.findNodeById(nodeId);
        const nodeRoleKey = this.roleKey(node.role);
        const conflictingNodeId = occupiedRoles.get(nodeRoleKey);
        if (conflictingNodeId && conflictingNodeId !== nodeId) {
          continue;
        }
        occupiedRoles.set(nodeRoleKey, nodeId);
        selected.push({
          nodeId,
          humanInput: flowRun.pendingHumanInputs[nodeId]?.text,
        });
      }

      // Only filter readyNodes — readyNodes2 nodes aren't stored there
      const selectedNodeIds = selected.map((item) => item.nodeId);
      flowRun.readyNodes = flowRun.readyNodes.filter(id => !selectedNodeIds.includes(id));
      for (const item of selected) {
        if (item.humanInput !== undefined) {
          delete flowRun.awaitingHumanNodes[item.nodeId];
        }
      }
      flowRun.runningNodes = this.mergeNodeIds(flowRun.runningNodes, selectedNodeIds);
      flowRun.status = 'running';
      claimedWork = selected;
    }, this.requireFlowRef(), this.requireWorkspaceRoot());
    return claimedWork;
  }

  private async claimNodeForAdvance(nodeId: string, hasHumanInput: boolean): Promise<{ flowRun: FlowRun; resumedFromHuman: boolean }> {
    let resumedFromHuman = false;
    const flowRun = await SessionStore.updateFlowRun((latest) => {
      if (latest.status === 'completed') {
        throw new Error(`Cannot advance flow in state: ${latest.status}`);
      }

      if (latest.runningNodes.includes(nodeId)) {
        latest.status = 'running';
        resumedFromHuman = hasHumanInput && Boolean(latest.pendingHumanInputs[nodeId]);
        return;
      }

      if (hasHumanInput && latest.awaitingHumanNodes[nodeId]) {
        delete latest.awaitingHumanNodes[nodeId];
        latest.runningNodes = this.mergeNodeIds(latest.runningNodes, [nodeId]);
        latest.status = 'running';
        resumedFromHuman = true;
        return;
      }

      if (latest.awaitingHumanNodes[nodeId]) {
        throw new Error(`Node '${nodeId}' is awaiting targeted human input and cannot advance without a reply.`);
      }

      if (!latest.readyNodes.includes(nodeId)) {
        throw new Error(`Node '${nodeId}' is not ready, running, or awaiting human input.`);
      }

      latest.readyNodes = latest.readyNodes.filter(id => id !== nodeId);
      latest.runningNodes = this.mergeNodeIds(latest.runningNodes, [nodeId]);
      latest.status = 'running';
    }, this.requireFlowRef(), this.requireWorkspaceRoot());

    return { flowRun, resumedFromHuman };
  }

  private async markNodeAwaitingHuman(
    nodeId: string,
    role: string,
    reason: AwaitingHumanReason
  ): Promise<FlowRun> {
    return SessionStore.updateFlowRun((flowRun) => {
      flowRun.readyNodes = flowRun.readyNodes.filter(id => id !== nodeId);
      flowRun.runningNodes = flowRun.runningNodes.filter(id => id !== nodeId);
      flowRun.awaitingHumanNodes[nodeId] = { role, reason };
      flowRun.status = 'running';
    }, this.requireFlowRef(), this.requireWorkspaceRoot());
  }

  private removeOpenNode(flowRun: FlowRun, nodeId: string) {
    flowRun.readyNodes = flowRun.readyNodes.filter(id => id !== nodeId);
    flowRun.runningNodes = flowRun.runningNodes.filter(id => id !== nodeId);
    flowRun.awaitingHandoff = flowRun.awaitingHandoff.filter(id => id !== nodeId);
    delete flowRun.awaitingHumanNodes[nodeId];
    delete flowRun.pendingNodeArtifacts[nodeId];
  }

  private addCompletedNode(flowRun: FlowRun, nodeId: string) {
    if (!flowRun.completedNodes.includes(nodeId)) {
      flowRun.completedNodes.push(nodeId);
    }
  }

  private removeCompletedNode(flowRun: FlowRun, nodeId: string) {
    flowRun.completedNodes = flowRun.completedNodes.filter(id => id !== nodeId);
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

  private roleKey(roleName: string): string {
    return parseRoleIdentity(roleName).instanceRoleId;
  }

  private applyLatestTurnUsage(session: RoleSession, contextUsage: number | undefined): void {
    if (contextUsage !== undefined) {
      session.latestContextUsage = contextUsage;
    }
  }

  private roleHasFutureNode(wf: WorkflowGraph, flowRun: FlowRun, currentNodeId: string, roleName: string): boolean {
    const roleKey = this.roleKey(roleName);
    return wf.nodes.some((node) =>
      node?.id !== currentNodeId &&
      typeof node?.role === 'string' &&
      this.roleKey(node.role) === roleKey &&
      !flowRun.completedNodes.includes(node.id)
    );
  }

  private async autoCompactSessionIfNeeded(
    session: RoleSession,
    flowRun: FlowRun,
    nodeId: string,
    roleName: string,
    activeHistory: RuntimeMessageParam[],
    contextUsage: number | undefined = session.latestContextUsage
  ): Promise<void> {
    const contextWindow = getActiveModelWithKey()?.contextWindow ?? null;
    if (!shouldAutoCompact(contextUsage, contextWindow)) return;

    this.renderer.emit({ kind: 'session.compaction_started', role: roleName, trigger: 'auto' });

    try {
      const result = await compactRoleSession({
        session,
        flowRun,
        roleName,
        trigger: 'auto'
      });

      if (!result.compacted) {
        this.renderer.emit({
          kind: 'session.compaction_failed',
          role: roleName,
          trigger: 'auto',
          reason: result.reason ?? 'No context was available to compact.'
        });
        return;
      }

      activeHistory.splice(
        0,
        activeHistory.length,
        ...(session.transcriptHistory as RuntimeMessageParam[])
      );
      SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
      this.renderer.emit({
        kind: 'session.compacted',
        role: roleName,
        nodeId,
        trigger: 'auto',
        archiveId: result.archiveId!
      });
    } catch (error) {
      this.renderer.emit({
        kind: 'session.compaction_failed',
        role: roleName,
        trigger: 'auto',
        reason: error instanceof Error ? error.message : String(error)
      });
      // Auto compaction is opportunistic. A failed compaction must not invalidate
      // the role turn that just completed successfully.
    }
  }

  private resolveActiveWorkflow(flowRun: FlowRun): WorkflowGraph {
    const rolesDir = path.join(flowRun.workspaceRoot, flowRun.projectNamespace, 'a-docs', 'roles');
    const workflowFilePath = findWorkflowFilePath(flowRun.recordFolderPath);
    if (workflowFilePath) {
      const validation = validateWorkflowFile(workflowFilePath, undefined, rolesDir);
      if (!validation.valid) {
        throw new WorkflowError(validation.errors.join('; '));
      }
    }
    try {
      return new WorkflowGraph(resolveFlowWorkflow(
        flowRun.recordFolderPath,
        flowRun.workspaceRoot,
        flowRun.projectNamespace
      ));
    } catch (error) {
      throw new WorkflowError((error as Error).message);
    }
  }

  private roleSessionId(flowRun: FlowRun, roleName: string): string {
    return `${flowRun.flowId}__${this.roleKey(roleName)}`;
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

  private getOpenNodeIds(flowRun: FlowRun): string[] {
    return this.mergeNodeIds(
      flowRun.readyNodes,
      flowRun.runningNodes,
      Object.keys(flowRun.awaitingHumanNodes)
    );
  }

  private waitForWakeAfter(observedWakeGeneration: number): { promise: Promise<void>; cancel: () => void } {
    if (this.wakeGeneration !== observedWakeGeneration) {
      return {
        promise: Promise.resolve(),
        cancel: () => {},
      };
    }

    let resolver: (() => void) | null = null;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
      this.wakeWaiters.add(resolve);
    });

    return {
      promise,
      cancel: () => {
        if (resolver) {
          this.wakeWaiters.delete(resolver);
        }
      },
    };
  }

  private markNodeCompletedIfSettled(flowRun: FlowRun, wf: WorkflowGraph, nodeId: string): void {
    const outgoingEdges = wf.getOutgoingEdges(nodeId);
    if (outgoingEdges.length === 0) return;

    const allSettled = outgoingEdges.every((edge: any) =>
      flowRun.completedHandoffs.includes(wf.edgeKey(edge.from, edge.to))
    );

    if (allSettled) {
      this.addCompletedNode(flowRun, nodeId);
    } else {
      this.removeCompletedNode(flowRun, nodeId);
    }
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
