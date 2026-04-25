import fs from 'node:fs';
import path from 'node:path';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { HandoffParseError } from './handoff.js';
import type { FlowRef, FlowRun, HandoffTarget, InteractiveSessionResult, OperatorRenderSink, TurnUsage } from './types.js';
import { emitUsage, runInteractiveSession } from './orient.js';
import { buildForwardNodeEntryMessage } from './session-entry.js';
import { ImprovementOrchestrator } from './improvement.js';
import { createDefaultRenderer } from './operator-renderer.js';
import { buildWorkflowRepairGuidance } from './framework-services/workflow-graph-validator.js';
import { buildRuntimeHealthRepairGuidance, runRuntimeHealthChecks } from './framework-services/runtime-health-checks.js';
import { TelemetryManager } from './observability.js';
import { toKebabCaseRoleId } from './role-id.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { canonicalWorkflowFilename, resolveFlowWorkflow } from './workflow-file.js';
import { syncRecordMetadataFromWorkflow } from './record-metadata.js';

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}

type AppliedHandoffDirection = 'forward' | 'backward' | 'terminal';

export class FlowOrchestrator {
  private renderer: OperatorRenderSink;
  private pendingRoleActiveEmitted = new Set<string>();
  private activeTurnControllers = new Map<string, { role: string; controller: AbortController }>();
  private flowRef: FlowRef | null = null;
  private workspaceRoot: string | null = null;

  constructor(renderer?: OperatorRenderSink) {
    this.renderer = renderer ?? createDefaultRenderer();
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

  public async runStoredFlow(
    workspaceRoot: string,
    projectNamespace: string,
    _roleName: string,
    inputStream: NodeJS.ReadableStream = process.stdin,
    outputStream: NodeJS.WritableStream = process.stdout,
    flowId?: string
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
        const resumeWf = this.resolveActiveWorkflow(flowRun);
        this.ensureNoRoleScopedParallelConflictInOpenSet(flowRun, resumeWf);
        const resumedOpenNodes = this.getOpenNodeIds(flowRun);
        this.renderer.emit({ kind: 'flow.resumed', flowId: flowRun.flowId, activeNodeCount: resumedOpenNodes.length });
        if (resumedOpenNodes.length > 1) {
          try {
            const activeNodes = resumedOpenNodes.map(id => {
              const node = resumeWf.nodes.find((n: any) => n.id === id);
              return { nodeId: id, role: node?.role ?? '' };
            });
            this.renderer.emit({ kind: 'parallel.active_set', activeNodes });
          } catch (_) {
            // workflow unreadable on resume — skip parallel notice
          }
        }

        rootSpan.setAttribute('flow.id', flowRun.flowId);
        rootSpan.setAttribute('flow.project_namespace', flowRun.projectNamespace);
        rootSpan.addEvent('flow.established', { 'flow.id': flowRun.flowId, 'record_folder_path': path.relative(workspaceRoot, flowRun.recordFolderPath) });
        meter.createCounter('a_society.flow.started').add(1, { project_namespace: flowRun.projectNamespace });

        await this.runReadyNodesUntilBlocked(inputStream, outputStream);
        flowRun = SessionStore.loadFlowRun(this.requireFlowRef(), this.requireWorkspaceRoot())!;

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
    activeArtifactPath?: string | string[],
    humanInput?: string,
    inputStream: NodeJS.ReadableStream = process.stdin,
    outputStream: NodeJS.WritableStream = process.stdout
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
        if (flowRun.status === 'completed' || flowRun.status === 'failed') {
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

        const wf = this.resolveActiveWorkflow(flowRun);
        const currentNodeDef = wf.nodes.find((n: any) => n.id === nodeId);
        if (!currentNodeDef) throw new Error(`Node '${nodeId}' not found in workflow.`);

        const roleName = currentNodeDef.role;
        span.setAttribute('role', roleName);
        span.setAttribute('role_name', roleName);
        span.setAttribute('session.id', this.roleSessionId(flowRun, roleName));
        if (claim.resumedFromHuman) {
          span.addEvent('human_input.received');
          this.renderer.emit({ kind: 'human.resumed', nodeId, role: currentNodeDef.role });
        }

        this.ensureNoRoleScopedParallelConflict(flowRun, wf, nodeId, roleName);

        const sessionId = this.roleSessionId(flowRun, roleName);

        const resolvedArtifacts: string[] =
          activeArtifactPath !== undefined
            ? (Array.isArray(activeArtifactPath) ? activeArtifactPath : [activeArtifactPath])
            : (flowRun.pendingNodeArtifacts[nodeId] ?? []);

        span.setAttribute('node.artifact_count', resolvedArtifacts.length);

        // Emit role.active before executing the node.
        // Suppressed when applyHandoffAndAdvance already emitted it at the handoff boundary.
        const artifactBasename = resolvedArtifacts.length === 1
          ? path.basename(resolvedArtifacts[0])
          : undefined;
        if (!this.pendingRoleActiveEmitted.has(nodeId)) {
          this.renderer.emit({
            kind: 'role.active',
            nodeId,
            role: currentNodeDef.role,
            artifactCount: resolvedArtifacts.length,
            artifactBasename
          });
        }
        this.pendingRoleActiveEmitted.delete(nodeId);

        let session = SessionStore.loadRoleSession(sessionId, this.requireFlowRef(), this.requireWorkspaceRoot());
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

        const { bundleContent } = ContextInjectionService.buildContextBundle(
          flowRun.projectNamespace, roleName, flowRun.workspaceRoot
        );

        const injectedHistory = [...session.transcriptHistory];
        const sameNodeResume = session.isActive && session.currentNodeId === nodeId && injectedHistory.length > 0;
        const visitedNodeIds = flowRun.visitedNodeIds ?? (flowRun.visitedNodeIds = []);
        const firstNodeVisit = !visitedNodeIds.includes(nodeId);
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

        if (injectedHistory.length === 0) {
          const nodeEntryMessage = buildForwardNodeEntryMessage({
            nodeId,
            role: roleName,
            workspaceRoot: flowRun.workspaceRoot,
            projectNamespace: flowRun.projectNamespace,
            recordFolderPath: flowRun.recordFolderPath,
            activeArtifacts: resolvedArtifacts,
            humanInput,
            nodeContext
          });
          injectedHistory.push({ role: 'user', content: nodeEntryMessage });
        } else if (!sameNodeResume) {
          const nodeEntryMessage = buildForwardNodeEntryMessage({
            nodeId,
            role: roleName,
            workspaceRoot: flowRun.workspaceRoot,
            projectNamespace: flowRun.projectNamespace,
            recordFolderPath: flowRun.recordFolderPath,
            activeArtifacts: resolvedArtifacts,
            entryMode: session.currentNodeId === nodeId ? 'reopened-node' : 'role-transition',
            previousNodeId: session.currentNodeId,
            humanInput,
            nodeContext
          });
          injectedHistory.push({ role: 'user', content: nodeEntryMessage });
        } else if (humanInput) {
          injectedHistory.push({ role: 'user', content: humanInput });
        }

        if (firstNodeVisit && (injectedHistory.length > 0)) {
          flowRun = await SessionStore.updateFlowRun((latest) => {
            const latestVisitedNodeIds = latest.visitedNodeIds ?? [];
            if (!latestVisitedNodeIds.includes(nodeId)) {
              latestVisitedNodeIds.push(nodeId);
            }
            latest.visitedNodeIds = latestVisitedNodeIds;
            this.reconcileFlowStatus(latest);
          }, this.requireFlowRef(), this.requireWorkspaceRoot());
        }

        session.currentNodeId = nodeId;
        session.isActive = true;
        span.addEvent('store.flow_saved', { 'flow.status': flowRun.status });

        while (true) {
          try {
            const controller = new AbortController();
            this.activeTurnControllers.set(nodeId, { role: roleName, controller });
            const sigintHandler = () => controller.abort();
            process.once('SIGINT', sigintHandler);

            let sessionResult: InteractiveSessionResult | null = null;
            try {
              sessionResult = await runInteractiveSession(
                flowRun.workspaceRoot, flowRun.projectNamespace, roleName, bundleContent,
                injectedHistory as any,
                inputStream, outputStream,
                controller.signal,
                this.renderer
              );
            } finally {
              process.removeListener('SIGINT', sigintHandler);
              const activeController = this.activeTurnControllers.get(nodeId);
              if (activeController?.controller === controller) {
                this.activeTurnControllers.delete(nodeId);
              }
            }

            if (sessionResult) {
              const handoffResult = sessionResult.handoff;
              const turnUsage = sessionResult.usage;
              if (handoffResult.kind === 'awaiting_human') {
                span.setAttribute('node.outcome', 'awaiting_human');
                span.addEvent('node.awaiting_human_suspended', { suspension_reason: 'prompt_human_signal' });
                emitUsage(this.renderer, turnUsage);
                session.transcriptHistory = injectedHistory;
                SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                flowRun = await this.markNodeAwaitingHuman(nodeId, currentNodeDef.role, 'prompt-human');
                this.renderer.emit({ kind: 'human.awaiting_input', nodeId, role: currentNodeDef.role, reason: 'prompt-human' });
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
                  emitUsage(this.renderer, turnUsage);
                  const guidance = buildRuntimeHealthRepairGuidance(
                    healthCheck.errors,
                    'forward-pass-closed'
                  );
                  this.renderer.emit({
                    kind: 'repair.requested',
                    scope: 'node',
                    code: 'runtime_health',
                    summary: guidance.operatorSummary
                  });
                  injectedHistory.push({ role: 'user', content: guidance.modelRepairMessage });
                  session.transcriptHistory = injectedHistory;
                  SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                  continue;
                }

                span.setAttribute('node.outcome', 'forward_pass_closed');
                emitUsage(this.renderer, turnUsage);
                flowRun = await SessionStore.updateFlowRun((latest) => {
                  this.removeOpenNode(latest, nodeId);
                  this.addCompletedNode(latest, nodeId);
                  this.reconcileFlowStatus(latest);
                }, this.requireFlowRef(), this.requireWorkspaceRoot());
                session.transcriptHistory = injectedHistory;
                session.isActive = false;
                SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
                this.renderer.emit({
                  kind: 'flow.forward_pass_closed',
                  recordFolderPath: handoffResult.recordFolderPath,
                  artifactBasename: path.basename(handoffResult.artifactPath)
                });
                await ImprovementOrchestrator.handleForwardPassClosure(
                  flowRun,
                  { recordFolderPath: handoffResult.recordFolderPath, artifactPath: handoffResult.artifactPath },
                  inputStream,
                  outputStream,
                  this.renderer,
                );
                return;
              }

              if (handoffResult.kind === 'meta-analysis-complete') {
                throw new Error(`Unexpected meta-analysis-complete signal during forward pass at node '${nodeId}'.`);
              }

              if (handoffResult.kind === 'backward-pass-complete') {
                throw new Error(`Unexpected backward-pass-complete signal during forward pass at node '${nodeId}'.`);
              }

              // kind === 'targets'
              span.setAttribute('node.outcome', 'handoff');
              span.setAttribute('handoff.kind', handoffResult.kind);

              const handoffs = handoffResult.targets;
              this.validateTargetArtifactsExist(flowRun.workspaceRoot, handoffs);

              await this.applyHandoffAndAdvance(flowRun, nodeId, currentNodeDef.role, handoffs, turnUsage);

              session.transcriptHistory = injectedHistory;
              session.isActive = false;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
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
              span.addEvent('handoff.parse_error_injected', {
                error_type: e.name,
                error_message: e.message.slice(0, 500)
              });
              this.renderer.emit({ kind: 'repair.requested', scope: 'node', code: e.details.code, summary: e.details.operatorSummary });
              injectedHistory.push({ role: 'user', content: e.details.modelRepairMessage });
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session, this.requireFlowRef(), this.requireWorkspaceRoot());
              continue;
            }
            if (e instanceof WorkflowError) {
              span.addEvent('workflow.error_injected', { error_message: e.message.slice(0, 500) });
              const guidance = buildWorkflowRepairGuidance([e.message]);
              this.renderer.emit({ kind: 'repair.requested', scope: 'node', code: 'workflow_parse', summary: guidance.operatorSummary });
              injectedHistory.push({ role: 'user', content: guidance.modelRepairMessage });
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
    handoffs: HandoffTarget[],
    turnUsage?: TurnUsage
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
    let activationNotice: { kind: 'role'; nodeId: string } | { kind: 'parallel' } | null = null;

    const updatedFlow = await SessionStore.updateFlowRun((latest) => {
      const wf = this.resolveActiveWorkflow(latest);

      this.findNodeById(wf, nodeId);
      const outgoingEdges = this.getOutgoingEdges(wf, nodeId);
      const incomingEdges = this.getIncomingEdges(wf, nodeId);
      const outstandingOutgoingEdges = this.getOutstandingOutgoingEdges(latest, wf, nodeId);

      const forwardTargets: HandoffTarget[] = [];
      const backwardTargets: HandoffTarget[] = [];

      for (const handoff of handoffs) {
        const targetNodeId = handoff.target_node_id;
        const isForward = outstandingOutgoingEdges.some((edge: any) => edge.to === targetNodeId);
        const isBackward = incomingEdges.some((edge: any) => edge.from === targetNodeId);

        if (isForward && isBackward) {
          throw new Error(`Target node '${targetNodeId}' is both an unresolved successor and a predecessor of '${nodeId}', which is unsupported.`);
        }
        if (isForward) {
          forwardTargets.push(handoff);
          continue;
        }
        if (isBackward) {
          backwardTargets.push(handoff);
          continue;
        }

        const targetExists = this.findNodeById(wf, targetNodeId);
        if (!targetExists) {
          throw new Error(`Target node '${targetNodeId}' not found in workflow.`);
        }
        throw new Error(
          `Unauthorized transition: node '${nodeId}' may hand forward only to unresolved successors or backward only to direct predecessors, but proposed '${targetNodeId}'.`
        );
      }

      if (forwardTargets.length > 0 && backwardTargets.length > 0) {
        throw new Error(`Node '${nodeId}' emitted a mixed forward/backward handoff. Emit either successor targets or predecessor targets, not both.`);
      }

      if (handoffs.length === 0) {
        if (outgoingEdges.length > 0) {
          throw new Error(`Node '${nodeId}' emitted no valid handoff targets.`);
        }
        this.removeOpenNode(latest, nodeId);
        this.addCompletedNode(latest, nodeId);
        direction = 'terminal';
        eventTargets = [];
        if (this.getOpenNodeIds(latest).length === 0) {
          latest.status = 'completed';
        } else {
          this.reconcileFlowStatus(latest);
        }
        return;
      }

      if (forwardTargets.length > 0) {
        if (forwardTargets.length !== outstandingOutgoingEdges.length) {
          throw new Error(
            `Node '${nodeId}' has ${outstandingOutgoingEdges.length} outstanding outgoing edge(s) but emitted ${forwardTargets.length} forward handoff target(s).`
          );
        }

        const activationPairs: Array<{ targetId: string; artifact: string; role: string }> = [];
        const claimedTargets = new Set<string>();

        for (const edge of outstandingOutgoingEdges) {
          const targetNode = this.findNodeById(wf, edge.to);
          const handoff = forwardTargets.find(h => h.target_node_id === targetNode.id);
          if (!handoff) {
            throw new Error(`Node '${nodeId}' did not emit a forward handoff for required target '${targetNode.id}'.`);
          }
          if (claimedTargets.has(handoff.target_node_id)) {
            throw new Error(`Node '${nodeId}' emitted duplicate forward handoffs for target '${handoff.target_node_id}'.`);
          }
          claimedTargets.add(handoff.target_node_id);
          activationPairs.push({
            targetId: targetNode.id,
            artifact: handoff.artifact_path ?? '',
            role: targetNode.role
          });
        }

        this.ensureRoleScopedActivationSetIsSupported(latest, wf, nodeId, activationPairs.map(pair => ({
          nodeId: pair.targetId,
          role: pair.role
        })));

        this.removeOpenNode(latest, nodeId);

        for (const pair of activationPairs) {
          latest.completedEdgeArtifacts[this.edgeKey(nodeId, pair.targetId)] = pair.artifact;
          this.activateOrDefer(latest, wf, pair.targetId);
        }

        this.markNodeCompletedIfSettled(latest, wf, nodeId);
        this.reconcileFlowStatus(latest);
        direction = 'forward';
        eventTargets = activationPairs.map(p => ({
          nodeId: p.targetId,
          role: p.role,
          artifactBasename: p.artifact ? path.basename(p.artifact) : undefined
        }));
        activationNotice = activationPairs.length === 1
          ? { kind: 'role', nodeId: activationPairs[0].targetId }
          : { kind: 'parallel' };
        return;
      }

      if (backwardTargets.length > 0) {
        const reactivationPlans: Array<{
          targetId: string;
          role: string;
          rejectedEdgeKey: string;
          activationArtifacts: string[];
        }> = [];
        const claimedTargets = new Set<string>();

        for (const handoff of backwardTargets) {
          if (claimedTargets.has(handoff.target_node_id)) {
            throw new Error(`Node '${nodeId}' emitted duplicate backward handoffs for target '${handoff.target_node_id}'.`);
          }
          claimedTargets.add(handoff.target_node_id);

          const targetNode = this.findNodeById(wf, handoff.target_node_id);
          const rejectedEdgeKey = this.edgeKey(targetNode.id, nodeId);
          const rejectedArtifactPath = latest.completedEdgeArtifacts[rejectedEdgeKey];

          if (!rejectedArtifactPath) {
            throw new Error(
              `Node '${nodeId}' attempted to send work back to predecessor '${targetNode.id}', but edge '${rejectedEdgeKey}' is not currently realized.`
            );
          }

          reactivationPlans.push({
            targetId: targetNode.id,
            role: targetNode.role,
            rejectedEdgeKey,
            activationArtifacts: [
              rejectedArtifactPath,
              handoff.artifact_path ?? '',
            ].filter((artifact): artifact is string => artifact.trim() !== '')
          });
        }

        this.ensureRoleScopedActivationSetIsSupported(latest, wf, nodeId, reactivationPlans.map(plan => ({
          nodeId: plan.targetId,
          role: plan.role
        })));

        this.removeOpenNode(latest, nodeId);
        this.removeCompletedNode(latest, nodeId);

        const reactivatedTargets: Array<{ targetId: string; role: string }> = [];

        for (const plan of reactivationPlans) {
          delete latest.completedEdgeArtifacts[plan.rejectedEdgeKey];
          this.removeCompletedNode(latest, plan.targetId);
          this.activateOrDefer(latest, wf, plan.targetId, plan.activationArtifacts);
          reactivatedTargets.push({ targetId: plan.targetId, role: plan.role });
        }

        this.reconcileFlowStatus(latest);
        direction = 'backward';
        eventTargets = reactivatedTargets.map(target => ({
          nodeId: target.targetId,
          role: target.role,
          artifactBasename: undefined
        }));
        activationNotice = reactivatedTargets.length === 1
          ? { kind: 'role', nodeId: reactivatedTargets[0].targetId }
          : { kind: 'parallel' };
        return;
      }

      throw new Error(`Node '${nodeId}' emitted no valid handoff targets.`);
    }, this.requireFlowRef(), this.requireWorkspaceRoot());

    if (!direction) {
      throw new Error(`Node '${nodeId}' emitted no valid handoff targets.`);
    }

    emitUsage(this.renderer, turnUsage);
    this.renderer.emit({
      kind: 'handoff.applied',
      fromNodeId: nodeId,
      fromRole,
      targets: eventTargets
    });

    const wf = this.resolveActiveWorkflow(updatedFlow);
    const notice = activationNotice as { kind: 'role'; nodeId: string } | { kind: 'parallel' } | null;
    if (notice?.kind === 'role') {
      this.emitRoleActiveIfActivated(updatedFlow, wf, notice.nodeId);
    } else if (notice?.kind === 'parallel') {
      this.emitParallelActiveSet(updatedFlow, wf);
    }

    return direction;
  }

  private async runReadyNodesUntilBlocked(
    inputStream: NodeJS.ReadableStream,
    outputStream: NodeJS.WritableStream
  ): Promise<void> {
    const runningTasks = new Map<string, Promise<void>>();
    let firstError: unknown = null;

    while (true) {
      const claimedNodeIds = await this.claimReadyNodesForParallelRun();
      for (const claimedNodeId of claimedNodeIds) {
        if (runningTasks.has(claimedNodeId)) continue;
        const task = this.advanceFlow(
          SessionStore.loadFlowRun(this.requireFlowRef(), this.requireWorkspaceRoot())!,
          claimedNodeId,
          undefined,
          undefined,
          inputStream,
          outputStream
        ).catch((error) => {
          if (!firstError) firstError = error;
        }).finally(() => {
          runningTasks.delete(claimedNodeId);
        });
        runningTasks.set(claimedNodeId, task);
      }

      if (firstError) {
        await Promise.allSettled(runningTasks.values());
        throw firstError;
      }

      if (runningTasks.size === 0) {
        return;
      }

      await Promise.race(runningTasks.values());
    }
  }

  private async releaseStaleRunningNodes(): Promise<FlowRun> {
    return SessionStore.updateFlowRun((flowRun) => {
      if (flowRun.runningNodes.length > 0) {
        flowRun.readyNodes = this.mergeNodeIds(flowRun.readyNodes, flowRun.runningNodes);
        flowRun.runningNodes = [];
      }
      this.reconcileFlowStatus(flowRun);
    }, this.requireFlowRef(), this.requireWorkspaceRoot());
  }

  private async claimReadyNodesForParallelRun(): Promise<string[]> {
    let claimedNodeIds: string[] = [];
    await SessionStore.updateFlowRun((flowRun) => {
      if (flowRun.status !== 'running' || flowRun.readyNodes.length === 0) {
        claimedNodeIds = [];
        this.reconcileFlowStatus(flowRun);
        return;
      }

      const wf = this.resolveActiveWorkflow(flowRun);
      const occupiedRoles = new Map<string, string>();
      for (const nodeId of [...flowRun.runningNodes, ...Object.keys(flowRun.awaitingHumanNodes)]) {
        const node = this.findNodeById(wf, nodeId);
        occupiedRoles.set(this.roleKey(node.role), nodeId);
      }

      const selected: string[] = [];
      for (const nodeId of flowRun.readyNodes) {
        const node = this.findNodeById(wf, nodeId);
        const nodeRoleKey = this.roleKey(node.role);
        const conflictingNodeId = occupiedRoles.get(nodeRoleKey);
        if (conflictingNodeId && conflictingNodeId !== nodeId) {
          throw new WorkflowError(
            `Unsupported same-role parallel activation: node '${nodeId}' and node '${conflictingNodeId}' both require role '${node.role}'. ` +
            'The runtime uses one flow-scoped session per role, so concurrent same-role nodes are not supported.'
          );
        }
        occupiedRoles.set(nodeRoleKey, nodeId);
        selected.push(nodeId);
      }

      flowRun.readyNodes = flowRun.readyNodes.filter(id => !selected.includes(id));
      flowRun.runningNodes = this.mergeNodeIds(flowRun.runningNodes, selected);
      flowRun.status = 'running';
      claimedNodeIds = selected;
    }, this.requireFlowRef(), this.requireWorkspaceRoot());
    return claimedNodeIds;
  }

  private async claimNodeForAdvance(nodeId: string, hasHumanInput: boolean): Promise<{ flowRun: FlowRun; resumedFromHuman: boolean }> {
    let resumedFromHuman = false;
    const flowRun = await SessionStore.updateFlowRun((latest) => {
      if (latest.status === 'completed' || latest.status === 'failed') {
        throw new Error(`Cannot advance flow in state: ${latest.status}`);
      }

      if (latest.runningNodes.includes(nodeId)) {
        latest.status = 'running';
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
    reason: 'prompt-human' | 'autonomous-abort'
  ): Promise<FlowRun> {
    return SessionStore.updateFlowRun((flowRun) => {
      flowRun.readyNodes = flowRun.readyNodes.filter(id => id !== nodeId);
      flowRun.runningNodes = flowRun.runningNodes.filter(id => id !== nodeId);
      flowRun.awaitingHumanNodes[nodeId] = { role, reason };
      this.reconcileFlowStatus(flowRun);
    }, this.requireFlowRef(), this.requireWorkspaceRoot());
  }

  private removeOpenNode(flowRun: FlowRun, nodeId: string) {
    flowRun.readyNodes = flowRun.readyNodes.filter(id => id !== nodeId);
    flowRun.runningNodes = flowRun.runningNodes.filter(id => id !== nodeId);
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
    return toKebabCaseRoleId(roleName);
  }

  private resolveActiveWorkflow(flowRun: FlowRun): any {
    try {
      return resolveFlowWorkflow(
        flowRun.recordFolderPath,
        flowRun.workspaceRoot,
        flowRun.projectNamespace
      );
    } catch (error) {
      throw new WorkflowError((error as Error).message);
    }
  }

  private roleSessionId(flowRun: FlowRun, roleName: string): string {
    return `${flowRun.flowId}__${this.roleKey(roleName)}`;
  }

  private findConflictingOpenSameRoleNode(flowRun: FlowRun, wf: any, nodeId: string, roleName: string): string | null {
    const candidateRoleKey = this.roleKey(roleName);
    for (const openNodeId of this.getOpenNodeIds(flowRun)) {
      if (openNodeId === nodeId) continue;
      const openNode = this.findNodeById(wf, openNodeId);
      if (this.roleKey(openNode.role) === candidateRoleKey) {
        return openNodeId;
      }
    }
    return null;
  }

  private ensureNoRoleScopedParallelConflict(flowRun: FlowRun, wf: any, nodeId: string, roleName: string): void {
    const conflictingNodeId = this.findConflictingOpenSameRoleNode(flowRun, wf, nodeId, roleName);
    if (!conflictingNodeId) return;

    throw new WorkflowError(
      `Unsupported same-role parallel activation: node '${nodeId}' and node '${conflictingNodeId}' both require role '${roleName}'. ` +
      'The runtime uses one flow-scoped session per role, so concurrent same-role nodes are not supported.'
    );
  }

  private ensureNoRoleScopedParallelConflictInOpenSet(flowRun: FlowRun, wf: any): void {
    for (const nodeId of this.getOpenNodeIds(flowRun)) {
      const node = this.findNodeById(wf, nodeId);
      this.ensureNoRoleScopedParallelConflict(flowRun, wf, nodeId, node.role);
    }
  }

  private ensureRoleScopedActivationSetIsSupported(
    flowRun: FlowRun,
    wf: any,
    currentNodeId: string,
    activationTargets: Array<{ nodeId: string; role: string }>
  ): void {
    const occupiedRoles = new Map<string, string>();

    for (const openNodeId of this.getOpenNodeIds(flowRun)) {
      if (openNodeId === currentNodeId) continue;
      const openNode = this.findNodeById(wf, openNodeId);
      occupiedRoles.set(this.roleKey(openNode.role), openNodeId);
    }

    for (const target of activationTargets) {
      const targetRoleKey = this.roleKey(target.role);
      const conflictingNodeId = occupiedRoles.get(targetRoleKey);
      if (conflictingNodeId && conflictingNodeId !== target.nodeId) {
        throw new WorkflowError(
          `Unsupported same-role parallel activation: node '${target.nodeId}' and node '${conflictingNodeId}' both require role '${target.role}'. ` +
          'The runtime uses one flow-scoped session per role, so concurrent same-role nodes are not supported.'
        );
      }
      occupiedRoles.set(targetRoleKey, target.nodeId);
    }
  }

  private findNodeById(wf: any, nodeId: string): any {
    const node = wf.nodes.find((n: any) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node '${nodeId}' not found in workflow.`);
    }
    return node;
  }

  private getOutgoingEdges(wf: any, nodeId: string): any[] {
    return (wf.edges || []).filter((edge: any) => edge.from === nodeId);
  }

  private getIncomingEdges(wf: any, nodeId: string): any[] {
    return (wf.edges || []).filter((edge: any) => edge.to === nodeId);
  }

  private getOutstandingOutgoingEdges(flowRun: FlowRun, wf: any, nodeId: string): any[] {
    return this.getOutgoingEdges(wf, nodeId).filter(
      (edge: any) => !(this.edgeKey(edge.from, edge.to) in flowRun.completedEdgeArtifacts)
    );
  }

  private edgeKey(fromNodeId: string, toNodeId: string): string {
    return `${fromNodeId}=>${toNodeId}`;
  }

  private collectIncomingArtifacts(flowRun: FlowRun, incomingEdges: any[]): string[] {
    return incomingEdges
      .map((edge: any) => flowRun.completedEdgeArtifacts[this.edgeKey(edge.from, edge.to)] ?? '')
      .filter((artifact: string) => artifact !== '');
  }

  private mergeArtifacts(...artifactGroups: string[][]): string[] {
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const group of artifactGroups) {
      for (const artifact of group) {
        if (!artifact || seen.has(artifact)) continue;
        seen.add(artifact);
        merged.push(artifact);
      }
    }
    return merged;
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

  private reconcileFlowStatus(flowRun: FlowRun): void {
    if (flowRun.status === 'completed' || flowRun.status === 'failed') return;
    if (flowRun.readyNodes.length > 0 || flowRun.runningNodes.length > 0) {
      flowRun.status = 'running';
      return;
    }
    if (Object.keys(flowRun.awaitingHumanNodes).length > 0) {
      flowRun.status = 'awaiting_human';
      return;
    }
    flowRun.status = 'running';
  }

  private markNodeCompletedIfSettled(flowRun: FlowRun, wf: any, nodeId: string): void {
    const outgoingEdges = this.getOutgoingEdges(wf, nodeId);
    if (outgoingEdges.length === 0) return;

    const allSettled = outgoingEdges.every((edge: any) =>
      this.edgeKey(edge.from, edge.to) in flowRun.completedEdgeArtifacts
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

  private activateOrDefer(flowRun: FlowRun, wf: any, candidateNodeId: string, extraArtifacts: string[] = []) {
    const incomingEdges = this.getIncomingEdges(wf, candidateNodeId);
    const allComplete = incomingEdges.every((edge: any) =>
      this.edgeKey(edge.from, edge.to) in flowRun.completedEdgeArtifacts
    );

    if (allComplete) {
      const candidateNode = this.findNodeById(wf, candidateNodeId);
      this.ensureNoRoleScopedParallelConflict(flowRun, wf, candidateNodeId, candidateNode.role);
      const baseArtifacts = this.collectIncomingArtifacts(flowRun, incomingEdges);
      const priorArtifacts = flowRun.pendingNodeArtifacts[candidateNodeId] ?? [];
      flowRun.pendingNodeArtifacts[candidateNodeId] = this.mergeArtifacts(baseArtifacts, priorArtifacts, extraArtifacts);
      if (!this.getOpenNodeIds(flowRun).includes(candidateNodeId)) {
        flowRun.readyNodes.push(candidateNodeId);
      }
    } else if (incomingEdges.length > 1) {
      // Join-blocked: emit parallel.join_waiting
      const candidateNode = this.findNodeById(wf, candidateNodeId);
      const waitingFor = incomingEdges
        .filter((edge: any) => !(this.edgeKey(edge.from, edge.to) in flowRun.completedEdgeArtifacts))
        .map((e: any) => e.from);
      this.renderer.emit({
        kind: 'parallel.join_waiting',
        nodeId: candidateNodeId,
        role: candidateNode?.role ?? '',
        waitingFor
      });
    }
  }

  private emitRoleActiveIfActivated(flowRun: FlowRun, wf: any, nodeId: string) {
    if (!flowRun.readyNodes.includes(nodeId)) return;
    const node = this.findNodeById(wf, nodeId);
    const activatedArtifacts = flowRun.pendingNodeArtifacts[nodeId] ?? [];
    const artifactBasename = activatedArtifacts.length === 1 && activatedArtifacts[0]
      ? path.basename(activatedArtifacts[0])
      : undefined;
    this.renderer.emit({
      kind: 'role.active',
      nodeId,
      role: node.role,
      artifactCount: activatedArtifacts.length,
      artifactBasename
    });
    this.pendingRoleActiveEmitted.add(nodeId);
  }

  private emitParallelActiveSet(flowRun: FlowRun, wf: any) {
    const activeNodes = this.getOpenNodeIds(flowRun).map(id => {
      const node = wf.nodes.find((n: any) => n.id === id);
      return { nodeId: id, role: node?.role ?? '' };
    });
    this.renderer.emit({ kind: 'parallel.active_set', activeNodes });
  }
}
