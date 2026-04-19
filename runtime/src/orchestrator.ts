import fs from 'node:fs';
import path from 'node:path';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { HandoffParseError } from './handoff.js';
import type { FlowRun, HandoffResult, HandoffTarget, InteractiveSessionResult, OperatorRenderSink, RuntimeMessageParam, TurnUsage } from './types.js';
import { emitUsage, runInteractiveSession } from './orient.js';
import { buildOwnerBootstrapMessage, buildForwardNodeEntryMessage } from './session-entry.js';
import { ImprovementOrchestrator } from './improvement.js';
import { OperatorEventRenderer, createDefaultRenderer } from './operator-renderer.js';
import { buildWorkflowRepairGuidance, validateWorkflowFile } from './framework-services/workflow-graph-validator.js';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { TelemetryManager } from './observability.js';
import { toKebabCaseRoleId } from './role-id.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { canonicalWorkflowFilename, findWorkflowFilePath, parseWorkflowFile, resolveFlowWorkflow } from './workflow-file.js';

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}

type AppliedHandoffDirection = 'forward' | 'backward' | 'terminal';


export function parseWorkflow(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    const folder = path.dirname(filePath);
    throw new WorkflowError(
      `Error: ${canonicalWorkflowFilename()} not found in ${folder}. ` +
      `This file is required before a handoff can be routed. ` +
      `Please create ${canonicalWorkflowFilename()} in the record folder and restate your handoff.`
    );
  }
  try {
    return parseWorkflowFile(filePath);
  } catch (err) {
    throw new WorkflowError((err as Error).message);
  }
}

function requireWorkflowPath(recordFolderPath: string): string {
  const workflowPath = findWorkflowFilePath(recordFolderPath);
  if (!workflowPath) {
    throw new WorkflowError(
      `Error: ${canonicalWorkflowFilename()} not found in ${recordFolderPath}. ` +
      `This file is required before a handoff can be routed. ` +
      `Please create ${canonicalWorkflowFilename()} in the record folder and restate your handoff.`
    );
  }
  return workflowPath;
}


export class FlowOrchestrator {
  private renderer: OperatorRenderSink;
  private pendingRoleActiveEmitted = new Set<string>();

  constructor(renderer?: OperatorRenderSink) {
    this.renderer = renderer ?? createDefaultRenderer();
  }

  public async startUnifiedOrchestration(
    workspaceRoot: string,
    projectNamespace: string,
    roleName: string,
    inputStream: NodeJS.ReadableStream = process.stdin,
    outputStream: NodeJS.WritableStream = process.stdout
  ): Promise<void> {
    const tracer = TelemetryManager.getTracer();
    const meter = TelemetryManager.getMeter();

    return tracer.startActiveSpan('flow.run', { kind: SpanKind.INTERNAL }, async (rootSpan) => {
      try {
        SessionStore.init();
        let flowRun = SessionStore.loadFlowRun();

        rootSpan.addEvent('flow.started', { 'flow.resumed': flowRun !== null });
        rootSpan.setAttribute('flow.id', 'pending');
        rootSpan.setAttribute('flow.resumed', flowRun !== null);

        if (flowRun && flowRun.workspaceRoot !== workspaceRoot) {
          console.warn(`\n[Warning] Resuming flow from a different workspace root:`);
          console.warn(`  Loaded: ${flowRun.workspaceRoot}`);
          console.warn(`  Expected: ${workspaceRoot}`);
          console.warn(`Starting a fresh session instead.\n`);
          flowRun = null;
        }

        if (!flowRun) {
          await tracer.startActiveSpan('bootstrap.session', {
            kind: SpanKind.INTERNAL,
            attributes: { project_namespace: projectNamespace, role_name: roleName }
          }, async (bootstrapSpan) => {
            this.renderer.emit({ kind: 'flow.bootstrap_started', role: roleName });
            const bootstrapHistory: RuntimeMessageParam[] = [];

            const { bundleContent: bootstrapBundle } = ContextInjectionService.buildContextBundle(
              projectNamespace, roleName, workspaceRoot
            );

            // Caller-owned Owner bootstrap message — pushed once before the first session turn.
            bootstrapHistory.push({ role: 'user', content: buildOwnerBootstrapMessage() });

            let retryCount = 0;
            while (true) {
              retryCount++;
              try {
                const controller = new AbortController();
                const sigintHandler = () => controller.abort();
                process.once('SIGINT', sigintHandler);

                let sessionResult: InteractiveSessionResult | null = null;
                try {
                  sessionResult = await runInteractiveSession(
                    workspaceRoot, projectNamespace, roleName, bootstrapBundle,
                    bootstrapHistory,
                    inputStream, outputStream,
                    controller.signal,
                    this.renderer
                  );
                } finally {
                  process.removeListener('SIGINT', sigintHandler);
                }

                if (!sessionResult) {
                  flowRun = null;
                  return;
                }
                const handoffResult = sessionResult.handoff;
                const turnUsage = sessionResult.usage;

                if (handoffResult.kind === 'awaiting_human') {
                  emitUsage(this.renderer, turnUsage);
                  this.renderer.emit({ kind: 'human.awaiting_input', reason: 'prompt-human', mode: 'interactive' });
                  const humanReply = await this.readHumanInput(inputStream, outputStream);
                  if (humanReply === null) {
                    flowRun = null;
                    return;
                  }
                  bootstrapHistory.push({ role: 'user', content: humanReply });
                  continue;
                }

                if (handoffResult.kind !== 'targets') {
                  throw new Error(`Initial interactive session must return a 'targets' handoff, but got '${handoffResult.kind}'.`);
                }
                const handoffs = handoffResult.targets;
                if (handoffs.length === 0) {
                  bootstrapHistory.push({ role: 'user', content: 'Bootstrap produced no handoff targets. Re-emit a handoff with artifact_path pointing to your output artifact.' });
                  continue;
                }
                this.validateTargetArtifactsExist(workspaceRoot, handoffs);
                const firstArtifactPath = handoffs[0].artifact_path;
                if (!firstArtifactPath) throw new Error(`Initial interactive session did not supply an artifact_path to locate ${canonicalWorkflowFilename()}.`);

                const recordFolderPath = path.dirname(path.resolve(workspaceRoot, firstArtifactPath));
                const workflowDocumentPath = findWorkflowFilePath(recordFolderPath) ?? path.join(recordFolderPath, canonicalWorkflowFilename());

                if (!fs.existsSync(workflowDocumentPath)) {
                  bootstrapSpan.addEvent('bootstrap.workflow_not_found', { record_folder_path: recordFolderPath });
                  const guidance = buildWorkflowRepairGuidance([`${canonicalWorkflowFilename()} not found in ${recordFolderPath}`]);
                  this.renderer.emit({ kind: 'repair.requested', scope: 'bootstrap', code: 'missing_workflow', summary: guidance.operatorSummary });
                  bootstrapHistory.push({ role: 'user', content: guidance.modelRepairMessage });
                  continue;
                }

                const validationRes = validateWorkflowFile(workflowDocumentPath, true);
                if (!validationRes.valid) {
                  bootstrapSpan.addEvent('bootstrap.tool_trigger_failed', { error_message: validationRes.errors.join('; ') });
                  const guidance = buildWorkflowRepairGuidance(validationRes.errors);
                  this.renderer.emit({ kind: 'repair.requested', scope: 'bootstrap', code: 'workflow_schema', summary: guidance.operatorSummary });
                  bootstrapHistory.push({ role: 'user', content: guidance.modelRepairMessage });
                  continue;
                }

                const doc = parseWorkflow(workflowDocumentPath);
                const wf = doc.workflow;
                const startNode = this.findStrictWorkflowStartNode(wf);
                bootstrapSpan.setAttribute('bootstrap.workflow_path', path.relative(workspaceRoot, workflowDocumentPath));

                flowRun = {
                  flowId: crypto.randomUUID(),
                  workspaceRoot,
                  projectNamespace,
                  recordFolderPath,
                  activeNodes: [startNode.id],
                  completedNodes: [],
                  visitedNodeIds: [],
                  completedEdgeArtifacts: {},
                  pendingNodeArtifacts: {},
                  status: 'running',
                  stateVersion: '6'
                };
                await this.applyHandoffAndAdvance(flowRun, startNode.id, roleName, handoffs, turnUsage);
                SessionStore.saveRoleSession({
                  roleName,
                  logicalSessionId: this.roleSessionId(flowRun, roleName),
                  transcriptHistory: bootstrapHistory,
                  isActive: false,
                  currentNodeId: startNode.id
                });
                bootstrapSpan.setAttribute('bootstrap.retry_count', retryCount);
                break;
              } catch (e: any) {
                if (e instanceof HandoffParseError) {
                  bootstrapSpan.addEvent('bootstrap.handoff_parse_failed', {
                    error_type: e.name,
                    error_message: e.message.slice(0, 500)
                  });
                  this.renderer.emit({ kind: 'repair.requested', scope: 'bootstrap', code: e.details.code, summary: e.details.operatorSummary });
                  bootstrapHistory.push({ role: 'user', content: e.details.modelRepairMessage });
                  continue;
                }
                bootstrapHistory.push({ role: 'user', content: `Unexpected error: ${e.message}` });
                continue;
              }
            }
          });
        } else {
          const resumeWf = this.resolveActiveWorkflow(flowRun);
          this.ensureNoRoleScopedParallelConflictInActiveSet(flowRun, resumeWf);
          this.renderer.emit({ kind: 'flow.resumed', flowId: flowRun.flowId, activeNodeCount: flowRun.activeNodes.length });
          if (flowRun.activeNodes.length > 1) {
            try {
              const activeNodes = flowRun.activeNodes.map(id => {
                const node = resumeWf.nodes.find((n: any) => n.id === id);
                return { nodeId: id, role: node?.role ?? '' };
              });
              this.renderer.emit({ kind: 'parallel.active_set', activeNodes });
            } catch (_) {
              // workflow unreadable on resume — skip parallel notice
            }
          }
        }

        if (!flowRun) return;

        rootSpan.setAttribute('flow.id', flowRun.flowId);
        rootSpan.setAttribute('flow.project_namespace', flowRun.projectNamespace);
        rootSpan.addEvent('flow.established', { 'flow.id': flowRun.flowId, 'record_folder_path': path.relative(workspaceRoot, flowRun.recordFolderPath) });
        meter.createCounter('a_society.flow.started').add(1, { project_namespace: flowRun.projectNamespace });

        while (flowRun.status === 'running' && flowRun.activeNodes.length > 0) {
          const nodeId = flowRun.activeNodes[0];
          await this.advanceFlow(flowRun, nodeId, undefined, undefined, inputStream, outputStream);
          flowRun = SessionStore.loadFlowRun()!;
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
    activeArtifactPath?: string | string[],
    humanInput?: string,
    inputStream: NodeJS.ReadableStream = process.stdin,
    outputStream: NodeJS.WritableStream = process.stdout
  ): Promise<void> {
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

        if (!flowRun.activeNodes.includes(nodeId)) {
          throw new Error(`Node '${nodeId}' is not in activeNodes: [${flowRun.activeNodes.join(', ')}]. Only active nodes can be advanced.`);
        }

        const wf = this.resolveActiveWorkflow(flowRun);
        const currentNodeDef = wf.nodes.find((n: any) => n.id === nodeId);
        if (!currentNodeDef) throw new Error(`Node '${nodeId}' not found in workflow.`);

        const roleName = currentNodeDef.role;
        span.setAttribute('role', roleName);
        span.setAttribute('role_name', roleName);
        span.setAttribute('session.id', this.roleSessionId(flowRun, roleName));

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

        let session = SessionStore.loadRoleSession(sessionId);
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

        if (firstNodeVisit && (injectedHistory.length > 0) && !visitedNodeIds.includes(nodeId)) {
          visitedNodeIds.push(nodeId);
        }

        session.currentNodeId = nodeId;
        session.isActive = true;

        flowRun.status = 'running';
        SessionStore.saveFlowRun(flowRun);
        span.addEvent('store.flow_saved', { 'flow.status': flowRun.status });

        while (true) {
          try {
            const controller = new AbortController();
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
            }

            if (sessionResult) {
              const handoffResult = sessionResult.handoff;
              const turnUsage = sessionResult.usage;
              if (handoffResult.kind === 'awaiting_human') {
                span.setAttribute('node.outcome', 'awaiting_human');
                span.addEvent('node.awaiting_human_suspended', { suspension_reason: 'prompt_human_signal' });
                emitUsage(this.renderer, turnUsage);
                this.renderer.emit({ kind: 'human.awaiting_input', reason: 'prompt-human', mode: 'autonomous' });
                const humanReply = await this.readHumanInput(inputStream, outputStream);
                if (humanReply === null) {
                  flowRun.status = 'awaiting_human';
                  session.transcriptHistory = injectedHistory;
                  SessionStore.saveRoleSession(session);
                  SessionStore.saveFlowRun(flowRun);
                  span.addEvent('human_input.exit');
                  break;
                }
                span.addEvent('human_input.received');
                this.renderer.emit({ kind: 'human.resumed', nodeId, role: currentNodeDef.role });
                injectedHistory.push({ role: 'user', content: humanReply });
                session.transcriptHistory = injectedHistory;
                SessionStore.saveRoleSession(session);
                continue;
              }

              if (handoffResult.kind === 'forward-pass-closed') {
                span.setAttribute('node.outcome', 'forward_pass_closed');
                emitUsage(this.renderer, turnUsage);
                this.removeActiveNode(flowRun, nodeId);
                this.addCompletedNode(flowRun, nodeId);
                session.transcriptHistory = injectedHistory;
                session.isActive = false;
                SessionStore.saveRoleSession(session);
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
              SessionStore.saveRoleSession(session);
              span.addEvent('store.session_saved', { 'session.id': sessionId, 'session.active': false });
              break;
            } else {
              span.setAttribute('node.outcome', 'null_return');
              this.renderer.emit({ kind: 'human.awaiting_input', reason: 'autonomous-abort', mode: 'autonomous' });
              flowRun.status = 'awaiting_human';
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session);
              SessionStore.saveFlowRun(flowRun);
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
              SessionStore.saveRoleSession(session);
              continue;
            }
            if (e instanceof WorkflowError) {
              span.addEvent('workflow.error_injected', { error_message: e.message.slice(0, 500) });
              const guidance = buildWorkflowRepairGuidance([e.message]);
              this.renderer.emit({ kind: 'repair.requested', scope: 'node', code: 'workflow_parse', summary: guidance.operatorSummary });
              injectedHistory.push({ role: 'user', content: guidance.modelRepairMessage });
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session);
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
    if (!fs.existsSync(flowRun.recordFolderPath)) {
      throw new WorkflowError(
        `Error: No record folder found at ${flowRun.recordFolderPath}. ` +
        `A record folder must be created before emitting a handoff. ` +
        `Please create the record folder, create ${canonicalWorkflowFilename()} inside it, and restate your handoff.`
      );
    }
    this.validateTargetArtifactsExist(flowRun.workspaceRoot, handoffs);
    const wf = this.resolveActiveWorkflow(flowRun);

    const currentNode = this.findNodeById(wf, nodeId);
    const outgoingEdges = this.getOutgoingEdges(wf, nodeId);
    const incomingEdges = this.getIncomingEdges(wf, nodeId);
    const outstandingOutgoingEdges = this.getOutstandingOutgoingEdges(flowRun, wf, nodeId);

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
      emitUsage(this.renderer, turnUsage);
      this.removeActiveNode(flowRun, nodeId);
      this.addCompletedNode(flowRun, nodeId);

      // Emit handoff.applied for terminal node (no successors)
      this.renderer.emit({
        kind: 'handoff.applied',
        fromNodeId: nodeId,
        fromRole,
        targets: []
      });

      if (flowRun.activeNodes.length === 0) {
        flowRun.status = 'completed';
      }
      SessionStore.saveFlowRun(flowRun);
      return 'terminal';
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

      this.ensureRoleScopedActivationSetIsSupported(flowRun, wf, nodeId, activationPairs.map(pair => ({
        nodeId: pair.targetId,
        role: pair.role
      })));

      emitUsage(this.renderer, turnUsage);
      this.removeActiveNode(flowRun, nodeId);

      for (const pair of activationPairs) {
        flowRun.completedEdgeArtifacts[this.edgeKey(nodeId, pair.targetId)] = pair.artifact;
        this.activateOrDefer(flowRun, wf, pair.targetId);
      }

      this.markNodeCompletedIfSettled(flowRun, wf, nodeId);

      this.renderer.emit({
        kind: 'handoff.applied',
        fromNodeId: nodeId,
        fromRole,
        targets: activationPairs.map(p => ({
          nodeId: p.targetId,
          role: p.role,
          artifactBasename: p.artifact ? path.basename(p.artifact) : undefined
        }))
      });

      if (activationPairs.length === 1) {
        this.emitRoleActiveIfActivated(flowRun, wf, activationPairs[0].targetId);
      } else {
        this.emitParallelActiveSet(flowRun, wf);
      }

      SessionStore.saveFlowRun(flowRun);
      return 'forward';
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
        const rejectedArtifactPath = flowRun.completedEdgeArtifacts[rejectedEdgeKey];

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

      this.ensureRoleScopedActivationSetIsSupported(flowRun, wf, nodeId, reactivationPlans.map(plan => ({
        nodeId: plan.targetId,
        role: plan.role
      })));

      emitUsage(this.renderer, turnUsage);
      this.removeActiveNode(flowRun, nodeId);
      this.removeCompletedNode(flowRun, nodeId);

      const reactivatedTargets: Array<{ targetId: string; role: string }> = [];

      for (const plan of reactivationPlans) {
        delete flowRun.completedEdgeArtifacts[plan.rejectedEdgeKey];
        this.removeCompletedNode(flowRun, plan.targetId);
        this.activateOrDefer(flowRun, wf, plan.targetId, plan.activationArtifacts);
        reactivatedTargets.push({ targetId: plan.targetId, role: plan.role });
      }

      this.renderer.emit({
        kind: 'handoff.applied',
        fromNodeId: nodeId,
        fromRole,
        targets: reactivatedTargets.map(target => ({
          nodeId: target.targetId,
          role: target.role,
          artifactBasename: undefined
        }))
      });

      if (reactivatedTargets.length === 1) {
        this.emitRoleActiveIfActivated(flowRun, wf, reactivatedTargets[0].targetId);
      } else {
        this.emitParallelActiveSet(flowRun, wf);
      }

      SessionStore.saveFlowRun(flowRun);
      return 'backward';
    }

    throw new Error(`Node '${nodeId}' emitted no valid handoff targets.`);
  }


  private readHumanInput(
    inputStream: NodeJS.ReadableStream,
    outputStream: NodeJS.WritableStream
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({ input: inputStream, output: outputStream, terminal: false });
      const onClose = () => resolve(null);
      rl.once('close', onClose);
      rl.question('\n> ', (answer) => {
        rl.removeListener('close', onClose);
        rl.close();
        const line = answer.trim();
        if (line === 'exit' || line === 'quit') {
          resolve(null);
        } else if (line === '') {
          this.readHumanInput(inputStream, outputStream).then(resolve);
        } else {
          resolve(line);
        }
      });
    });
  }

  private removeActiveNode(flowRun: FlowRun, nodeId: string) {
    flowRun.activeNodes = flowRun.activeNodes.filter(id => id !== nodeId);
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

  private findStrictWorkflowStartNode(wf: any): any {
    const toIds = new Set((wf.edges || []).map((edge: any) => edge.to));
    const startNodes = (wf.nodes || []).filter((node: any) => !toIds.has(node.id));
    const startNode = startNodes[0];
    if (!startNode) {
      throw new WorkflowError('Validated workflow has no start node.');
    }
    return startNode;
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

  private findConflictingActiveSameRoleNode(flowRun: FlowRun, wf: any, nodeId: string, roleName: string): string | null {
    const candidateRoleKey = this.roleKey(roleName);
    for (const activeNodeId of flowRun.activeNodes) {
      if (activeNodeId === nodeId) continue;
      const activeNode = this.findNodeById(wf, activeNodeId);
      if (this.roleKey(activeNode.role) === candidateRoleKey) {
        return activeNodeId;
      }
    }
    return null;
  }

  private ensureNoRoleScopedParallelConflict(flowRun: FlowRun, wf: any, nodeId: string, roleName: string): void {
    const conflictingNodeId = this.findConflictingActiveSameRoleNode(flowRun, wf, nodeId, roleName);
    if (!conflictingNodeId) return;

    throw new WorkflowError(
      `Unsupported same-role parallel activation: node '${nodeId}' and node '${conflictingNodeId}' both require role '${roleName}'. ` +
      'The runtime now uses one flow-scoped session per role, so concurrent same-role nodes must be avoided until an explicit parallel design is implemented.'
    );
  }

  private ensureNoRoleScopedParallelConflictInActiveSet(flowRun: FlowRun, wf: any): void {
    for (const nodeId of flowRun.activeNodes) {
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

    for (const activeNodeId of flowRun.activeNodes) {
      if (activeNodeId === currentNodeId) continue;
      const activeNode = this.findNodeById(wf, activeNodeId);
      occupiedRoles.set(this.roleKey(activeNode.role), activeNodeId);
    }

    for (const target of activationTargets) {
      const targetRoleKey = this.roleKey(target.role);
      const conflictingNodeId = occupiedRoles.get(targetRoleKey);
      if (conflictingNodeId && conflictingNodeId !== target.nodeId) {
        throw new WorkflowError(
          `Unsupported same-role parallel activation: node '${target.nodeId}' and node '${conflictingNodeId}' both require role '${target.role}'. ` +
          'The runtime now uses one flow-scoped session per role, so concurrent same-role nodes must be avoided until an explicit parallel design is implemented.'
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
      if (!flowRun.activeNodes.includes(candidateNodeId)) {
        flowRun.activeNodes.push(candidateNodeId);
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
    if (!flowRun.activeNodes.includes(nodeId)) return;
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
    const activeNodes = flowRun.activeNodes.map(id => {
      const node = wf.nodes.find((n: any) => n.id === id);
      return { nodeId: id, role: node?.role ?? '' };
    });
    this.renderer.emit({ kind: 'parallel.active_set', activeNodes });
  }
}
