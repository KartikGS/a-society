import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { HandoffParseError } from './handoff.js';
import type { FlowRun, HandoffResult, HandoffTarget, RuntimeMessageParam } from './types.js';
import { runInteractiveSession } from './orient.js';
import { buildOwnerBootstrapMessage, buildForwardNodeEntryMessage } from './session-entry.js';
import { ImprovementOrchestrator } from './improvement.js';
import { OperatorEventRenderer, createDefaultRenderer } from './operator-renderer.js';
import { buildWorkflowRepairGuidance, validateWorkflowFile } from './framework-services/workflow-graph-validator.js';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { TelemetryManager } from './observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowError';
  }
}


export function parseWorkflow(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    const folder = path.dirname(filePath);
    throw new WorkflowError(`Error: workflow.md not found in ${folder}. This file is required before a handoff can be routed. Please create workflow.md in the record folder and restate your handoff.`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new WorkflowError('No valid frontmatter found in workflow');
  return yaml.load(match[1]);
}


export class FlowOrchestrator {
  private renderer: OperatorEventRenderer;
  private pendingRoleActiveEmitted = new Set<string>();

  constructor(renderer?: OperatorEventRenderer) {
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

                let handoffResult: HandoffResult | null = null;
                try {
                  handoffResult = await runInteractiveSession(
                    workspaceRoot, projectNamespace, roleName, bootstrapBundle,
                    bootstrapHistory,
                    inputStream, outputStream,
                    controller.signal,
                    this.renderer
                  );
                } finally {
                  process.removeListener('SIGINT', sigintHandler);
                }

                if (!handoffResult) {
                  flowRun = null;
                  return;
                }

                if (handoffResult.kind === 'awaiting_human') {
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
                if (!firstArtifactPath) throw new Error("Initial interactive session did not supply an artifact_path to locate workflow.md.");

                const recordFolderPath = path.dirname(path.resolve(workspaceRoot, firstArtifactPath));
                const workflowDocumentPath = path.join(recordFolderPath, 'workflow.md');

                if (!fs.existsSync(workflowDocumentPath)) {
                  bootstrapSpan.addEvent('bootstrap.workflow_not_found', { record_folder_path: recordFolderPath });
                  const guidance = buildWorkflowRepairGuidance([`workflow.md not found in ${recordFolderPath}`]);
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
                  completedEdgeArtifacts: {},
                  pendingNodeArtifacts: {},
                  status: 'running',
                  stateVersion: '5',
                  roleContinuity: {}
                };
                this.recordRoleContinuityCompletion(flowRun, roleName, startNode.id, handoffs);
                await this.applyHandoffAndAdvance(flowRun, startNode.id, roleName, handoffs);
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
          this.renderer.emit({ kind: 'flow.resumed', flowId: flowRun.flowId, activeNodeCount: flowRun.activeNodes.length });
          if (flowRun.activeNodes.length > 1) {
            try {
              const resumeWf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;
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
        'node.id': nodeId,
        'session.id': `${flowRun.flowId}__${nodeId}`
      }
    }, async (span) => {
      try {
        if (flowRun.status === 'completed' || flowRun.status === 'failed') {
          throw new Error(`Cannot advance flow in state: ${flowRun.status}`);
        }

        if (!flowRun.activeNodes.includes(nodeId)) {
          throw new Error(`Node '${nodeId}' is not in activeNodes: [${flowRun.activeNodes.join(', ')}]. Only active nodes can be advanced.`);
        }

        const wf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;
        const currentNodeDef = wf.nodes.find((n: any) => n.id === nodeId);
        if (!currentNodeDef) throw new Error(`Node '${nodeId}' not found in workflow.`);

        const roleName = currentNodeDef.role;
        span.setAttribute('role', roleName);
        span.setAttribute('role_name', roleName);

        const sessionId = `${flowRun.flowId}__${nodeId}`;

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
          session = { roleName, logicalSessionId: sessionId, transcriptHistory: [], isActive: true };
        } else {
          span.addEvent('store.session_loaded', { 'session.id': sessionId, 'session.resumed': true });
        }

        const { bundleContent } = ContextInjectionService.buildContextBundle(
          flowRun.projectNamespace, roleName, flowRun.workspaceRoot
        );

        const injectedHistory = [...session.transcriptHistory];

        if (injectedHistory.length === 0) {
          // Determine whether another active node shares this role (parallel isolation).
          const otherActiveNodeHasSameRole = flowRun.activeNodes
            .filter(id => id !== nodeId)
            .some(id => {
              const nodeDef = wf.nodes.find((n: any) => n.id === id);
              return nodeDef?.role === roleName;
            });

          // Inject continuity summary only when safe (no parallel same-role active node).
          let continuityEntries: Array<{ nodeId: string; outputArtifactPath: string | null }> | undefined;
          if (!otherActiveNodeHasSameRole) {
            const continuityState = flowRun.roleContinuity?.[roleName];
            if (continuityState && continuityState.completedNodes.length > 0) {
              continuityEntries = continuityState.completedNodes.map(e => ({
                nodeId: e.nodeId,
                outputArtifactPath: e.outputArtifactPath
              }));
            }
          }

          const nodeEntryMessage = buildForwardNodeEntryMessage({
            nodeId,
            role: roleName,
            workspaceRoot: flowRun.workspaceRoot,
            activeArtifacts: resolvedArtifacts,
            continuityEntries,
            humanInput
          });
          injectedHistory.push({ role: 'user', content: nodeEntryMessage });
        } else if (humanInput) {
          injectedHistory.push({ role: 'user', content: humanInput });
        }

        flowRun.status = 'running';
        SessionStore.saveFlowRun(flowRun);
        span.addEvent('store.flow_saved', { 'flow.status': flowRun.status });

        while (true) {
          try {
            const controller = new AbortController();
            const sigintHandler = () => controller.abort();
            process.once('SIGINT', sigintHandler);

            let handoffResult: HandoffResult | null = null;
            try {
              handoffResult = await runInteractiveSession(
                flowRun.workspaceRoot, flowRun.projectNamespace, roleName, bundleContent,
                injectedHistory as any,
                inputStream, outputStream,
                controller.signal,
                this.renderer
              );
            } finally {
              process.removeListener('SIGINT', sigintHandler);
            }

            if (handoffResult) {
              if (handoffResult.kind === 'awaiting_human') {
                span.setAttribute('node.outcome', 'awaiting_human');
                span.addEvent('node.awaiting_human_suspended', { suspension_reason: 'prompt_human_signal' });
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

              // Update role-continuity ledger before advancing so the save inside
              // applyHandoffAndAdvance persists it in the same write.
              this.recordRoleContinuityCompletion(flowRun, roleName, nodeId, handoffs);

              await this.applyHandoffAndAdvance(flowRun, nodeId, currentNodeDef.role, handoffs);

              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session);
              span.addEvent('store.session_saved', { 'session.id': sessionId });
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


  public async applyHandoffAndAdvance(flowRun: FlowRun, nodeId: string, fromRole: string, handoffs: HandoffTarget[]): Promise<void> {
    if (!fs.existsSync(flowRun.recordFolderPath)) {
      throw new WorkflowError(`Error: No record folder found at ${flowRun.recordFolderPath}. A record folder must be created before emitting a handoff. Please create the record folder, create workflow.md inside it, and restate your handoff.`);
    }
    this.validateTargetArtifactsExist(flowRun.workspaceRoot, handoffs);
    const wf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;

    const outgoingEdges = (wf.edges || []).filter((e: any) => e.from === nodeId);

    if (outgoingEdges.length === 0) {
      this.removeActiveNode(flowRun, nodeId);
      flowRun.completedNodes.push(nodeId);

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
      return;
    }

    if (outgoingEdges.length === 1) {
      if (handoffs.length !== 1) {
        throw new Error(`Non-fork node '${nodeId}' has 1 outgoing edge but agent emitted ${handoffs.length} handoff targets. Use single-target handoff form for non-fork nodes.`);
      }
      const edge = outgoingEdges[0];
      const successorNode = wf.nodes.find((n: any) => n.id === edge.to);
      if (!successorNode) throw new Error(`Successor node '${edge.to}' not found.`);

      if (successorNode.role !== handoffs[0].role) {
        throw new Error(`Unauthorized transition: node '${nodeId}' must hand to '${successorNode.role}' but proposed '${handoffs[0].role}'.`);
      }

      this.removeActiveNode(flowRun, nodeId);
      flowRun.completedNodes.push(nodeId);
      flowRun.completedEdgeArtifacts[this.edgeKey(nodeId, successorNode.id)] = handoffs[0].artifact_path ?? '';

      this.activateOrDefer(flowRun, wf, successorNode.id);

      // Emit handoff.applied for linear transition
      const artifactBasename = handoffs[0].artifact_path ? path.basename(handoffs[0].artifact_path) : undefined;
      this.renderer.emit({
        kind: 'handoff.applied',
        fromNodeId: nodeId,
        fromRole,
        targets: [{ nodeId: successorNode.id, role: successorNode.role, artifactBasename }]
      });
      // Emit role.active for the successor at the handoff boundary (if it activated, not deferred).
      // Track it so advanceFlow suppresses the duplicate when it enters this node.
      if (flowRun.activeNodes.includes(successorNode.id)) {
        const activatedArtifacts = flowRun.pendingNodeArtifacts[successorNode.id] ?? [];
        const activatedArtifactBasename = activatedArtifacts.length === 1 && activatedArtifacts[0]
          ? path.basename(activatedArtifacts[0])
          : undefined;
        this.renderer.emit({
          kind: 'role.active',
          nodeId: successorNode.id,
          role: successorNode.role,
          artifactCount: activatedArtifacts.length,
          artifactBasename: activatedArtifactBasename
        });
        this.pendingRoleActiveEmitted.add(successorNode.id);
      }

      SessionStore.saveFlowRun(flowRun);
      return;
    }

    if (outgoingEdges.length > 1) {
      if (handoffs.length !== outgoingEdges.length) {
        throw new Error(`Fork node '${nodeId}' has ${outgoingEdges.length} outgoing edges but agent emitted ${handoffs.length} handoff targets. An array handoff with one entry per fork target is required.`);
      }

      const roles = outgoingEdges.map((e: any) => wf.nodes.find((n: any) => n.id === e.to)?.role);
      const uniqueRoles = new Set(roles);
      if (uniqueRoles.size !== roles.length) {
        const duplicateRole = roles.find((r: any, i: number) => roles.indexOf(r) !== i);
        throw new Error(`Fork node '${nodeId}' has multiple outgoing edges with role '${duplicateRole}'. Non-unique fork-target roles are not supported in this version. Each fork target must have a distinct role.`);
      }

      const activationPairs: Array<{ targetId: string; artifact: string; role: string }> = [];
      const claimedHandoffs = new Set<number>();

      for (const edge of outgoingEdges) {
        const targetNode = wf.nodes.find((n: any) => n.id === edge.to);
        const handoffIdx = handoffs.findIndex((h, idx) => h.role === targetNode.role && !claimedHandoffs.has(idx));

        if (handoffIdx === -1) {
          throw new Error(`Fork node '${nodeId}' has no handoff target with role '${targetNode.role}'.`);
        }

        claimedHandoffs.add(handoffIdx);
        activationPairs.push({ targetId: targetNode.id, artifact: handoffs[handoffIdx].artifact_path ?? '', role: targetNode.role });
      }

      this.removeActiveNode(flowRun, nodeId);
      flowRun.completedNodes.push(nodeId);

      for (const pair of activationPairs) {
        flowRun.completedEdgeArtifacts[this.edgeKey(nodeId, pair.targetId)] = pair.artifact;
        this.activateOrDefer(flowRun, wf, pair.targetId);
      }

      // Emit fork handoff.applied
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

      // Emit parallel.active_set for the newly active fork targets
      const activeNodes = flowRun.activeNodes.map(id => {
        const node = wf.nodes.find((n: any) => n.id === id);
        return { nodeId: id, role: node?.role ?? '' };
      });
      this.renderer.emit({ kind: 'parallel.active_set', activeNodes });

      SessionStore.saveFlowRun(flowRun);
      return;
    }
  }


  private readHumanInput(
    inputStream: NodeJS.ReadableStream,
    outputStream: NodeJS.WritableStream
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({ input: inputStream, output: outputStream, terminal: true });
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

  private findStrictWorkflowStartNode(wf: any): any {
    const toIds = new Set((wf.edges || []).map((edge: any) => edge.to));
    const startNodes = (wf.nodes || []).filter((node: any) => !toIds.has(node.id));
    const startNode = startNodes[0];
    if (!startNode) {
      throw new WorkflowError('Validated workflow has no start node.');
    }
    return startNode;
  }

  private recordRoleContinuityCompletion(
    flowRun: FlowRun,
    roleName: string,
    nodeId: string,
    handoffs: HandoffTarget[]
  ): void {
    if (!flowRun.roleContinuity) flowRun.roleContinuity = {};
    if (!flowRun.roleContinuity[roleName]) {
      flowRun.roleContinuity[roleName] = { roleName, completedNodes: [] };
    }
    flowRun.roleContinuity[roleName].completedNodes.push({
      nodeId,
      outputArtifactPath: handoffs[0]?.artifact_path ?? null,
      completedAt: new Date().toISOString()
    });
  }

  private edgeKey(fromNodeId: string, toNodeId: string): string {
    return `${fromNodeId}=>${toNodeId}`;
  }

  private collectIncomingArtifacts(flowRun: FlowRun, incomingEdges: any[]): string[] {
    return incomingEdges
      .map((edge: any) => flowRun.completedEdgeArtifacts[this.edgeKey(edge.from, edge.to)] ?? '')
      .filter((artifact: string) => artifact !== '');
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

  private activateOrDefer(flowRun: FlowRun, wf: any, candidateNodeId: string) {
    const incomingEdges = (wf.edges || []).filter((e: any) => e.to === candidateNodeId);
    const allComplete = incomingEdges.every((e: any) => flowRun.completedNodes.includes(e.from));

    if (allComplete) {
      flowRun.pendingNodeArtifacts[candidateNodeId] = this.collectIncomingArtifacts(flowRun, incomingEdges);
      if (!flowRun.activeNodes.includes(candidateNodeId)) {
        flowRun.activeNodes.push(candidateNodeId);
      }
    } else if (incomingEdges.length > 1) {
      // Join-blocked: emit parallel.join_waiting
      const candidateNode = wf.nodes.find((n: any) => n.id === candidateNodeId);
      const waitingFor = incomingEdges
        .filter((e: any) => !flowRun.completedNodes.includes(e.from))
        .map((e: any) => e.from);
      this.renderer.emit({
        kind: 'parallel.join_waiting',
        nodeId: candidateNodeId,
        role: candidateNode?.role ?? '',
        waitingFor
      });
    }
  }
}
