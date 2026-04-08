import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { HandoffParseError } from './handoff.js';
import { ToolTriggerEngine } from './triggers.js';
import type { FlowRun, TurnRecord, HandoffResult, HandoffTarget, RuntimeMessageParam } from './types.js';
import { runInteractiveSession } from './orient.js';
import { ImprovementOrchestrator } from './improvement.js';
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
  if (!match) throw new Error('No valid frontmatter found in workflow');
  return yaml.load(match[1]);
}


export class FlowOrchestrator {

  public async startUnifiedOrchestration(
    workspaceRoot: string, 
    roleKey: string,
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

        if (flowRun && flowRun.projectRoot !== workspaceRoot) {
          console.warn(`\n[Warning] Resuming flow from a different project root:`);
          console.warn(`  Loaded: ${flowRun.projectRoot}`);
          console.warn(`  Expected: ${workspaceRoot}`);
          console.warn(`Starting a fresh session instead.\n`);
          flowRun = null;
        }

        if (!flowRun) {
          await tracer.startActiveSpan('bootstrap.session', { kind: SpanKind.INTERNAL, attributes: { role_key: roleKey } }, async (bootstrapSpan) => {
            console.log(`Bootstrapping flow from interactive session...`);
            const bootstrapHistory: RuntimeMessageParam[] = [];

            const { bundleContent: bootstrapBundle } = ContextInjectionService.buildContextBundle(
              roleKey, workspaceRoot, [], null, 'bootstrap'
            );

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
                    workspaceRoot, roleKey, bootstrapBundle,
                    bootstrapHistory,
                    inputStream, outputStream,
                    false,              // interactive — Owner must converse before emitting handoff
                    controller.signal   // ← externalSignal
                  );
                } finally {
                  process.removeListener('SIGINT', sigintHandler);
                }

                if (!handoffResult) {
                  flowRun = null;
                  return;
                }

                if (handoffResult.kind !== 'targets') {
                  throw new Error(`Initial interactive session must return a 'targets' handoff, but got '${handoffResult.kind}'.`);
                }
                const handoffs = handoffResult.targets;
                const artifactPath = handoffs[0].artifact_path;
                if (!artifactPath) throw new Error("Initial interactive session did not supply an artifact_path to locate workflow.md.");

                const recordFolderPath = path.dirname(path.resolve(workspaceRoot, artifactPath));
                const workflowDocumentPath = path.join(recordFolderPath, 'workflow.md');

                if (!fs.existsSync(workflowDocumentPath)) {
                  bootstrapSpan.addEvent('bootstrap.workflow_not_found', { record_folder_path: recordFolderPath });
                  bootstrapHistory.push({
                    role: 'user',
                    content: `Error: workflow.md not found in ${recordFolderPath}. This file is required before a handoff can be routed. Please create the record folder, create workflow.md inside it with a valid YAML frontmatter workflow graph, and restate your handoff.`
                  });
                  continue;
                }

                let startNodeId = 'start';
                try {
                  const doc = parseWorkflow(workflowDocumentPath);
                  if (doc.workflow && doc.workflow.nodes) {
                    const startingRoleName = handoffs[0].role;
                    const node = doc.workflow.nodes.find((n: any) => n.role === startingRoleName);
                    if (node) {
                      startNodeId = node.id;
                    } else {
                      startNodeId = doc.workflow.nodes[0].id;
                    }
                  }
                  bootstrapSpan.setAttribute('bootstrap.workflow_path', path.relative(workspaceRoot, workflowDocumentPath));
                } catch(e: any) {
                  bootstrapSpan.addEvent('bootstrap.workflow_parse_failed', { error_message: e.message });
                  bootstrapHistory.push({ role: 'user', content: `Workflow parsing failed: ${e.message}. Please fix workflow.md so it has valid YAML frontmatter (delimited by ---) with a top-level 'workflow:' key containing 'nodes' and 'edges', then restate your handoff.` });
                  continue;
                }

                const bootstrapNamespace = roleKey.split('__')[0];
                flowRun = {
                  flowId: crypto.randomUUID(),
                  projectRoot: workspaceRoot,
                  projectNamespace: bootstrapNamespace,
                  recordFolderPath,
                  activeNodes: [startNodeId],
                  completedNodes: [],
                  completedNodeArtifacts: {},
                  pendingNodeArtifacts: { [startNodeId]: [artifactPath] },
                  status: 'running',
                  stateVersion: '2'
                };

                try {
                  await ToolTriggerEngine.evaluateAndTrigger(flowRun, 'START', { workflowDocumentPath });
                } catch (e: any) {
                  bootstrapSpan.addEvent('bootstrap.tool_trigger_failed', { error_message: e.message });
                  bootstrapHistory.push({
                    role: 'user',
                    content: `workflow.md was found at ${workflowDocumentPath} but failed schema validation. Error: ${e.message}\n\nDo not recreate the file — update it. The workflow.md must contain YAML frontmatter (between --- delimiters) with a top-level 'workflow:' key. Required structure:\n---\nworkflow:\n  nodes:\n    - id: <string>\n      role: <string>\n      description: <string>\n  edges:\n    - from: <node-id>\n      to: <node-id>\n---\nPlease fix workflow.md with this schema and restate your handoff.`
                  });
                  continue;
                }
                SessionStore.saveFlowRun(flowRun);
                bootstrapSpan.setAttribute('bootstrap.retry_count', retryCount);
                break;
              } catch (e: any) {
                bootstrapHistory.push({ role: 'user', content: `Unexpected error: ${e.message}` });
                continue;
              }
            }
          });
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
          console.log("\nOrchestration complete.");
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

        const roleKey = `${flowRun.projectNamespace}__${currentNodeDef.role}`;
        span.setAttribute('role', currentNodeDef.role);
        span.setAttribute('role_key', roleKey);
        
        const sessionId = `${flowRun.flowId}__${nodeId}`;
        
        const resolvedArtifacts: string[] =
          activeArtifactPath !== undefined
            ? (Array.isArray(activeArtifactPath) ? activeArtifactPath : [activeArtifactPath])
            : (flowRun.pendingNodeArtifacts[nodeId] ?? []);

        span.setAttribute('node.artifact_count', resolvedArtifacts.length);

        let session = SessionStore.loadRoleSession(sessionId);
        span.setAttribute('node.session_resumed', session !== null);
        if (!session) {
          session = { roleName: roleKey, logicalSessionId: sessionId, transcriptHistory: [], isActive: true };
        } else {
          span.addEvent('store.session_loaded', { 'session.id': sessionId, 'session.resumed': true });
        }

        const { bundleContent, contextHash } = ContextInjectionService.buildContextBundle(
          roleKey, flowRun.projectRoot, resolvedArtifacts, null
        );
        
        const injectedHistory = [...session.transcriptHistory];
        
        if (injectedHistory.length === 0) {
          let userMessageContent = "";
          if (humanInput) {
            userMessageContent += `Human Input:\n${humanInput}\n\n`;
          }
          if (resolvedArtifacts.length === 1) {
            userMessageContent += `Active artifact: ${resolvedArtifacts[0]}\nPlease proceed.`;
          } else if (resolvedArtifacts.length > 1) {
            userMessageContent += `Active artifacts (parallel track inputs):\n${resolvedArtifacts.map(a => `- ${a}`).join('\n')}\nPlease proceed.`;
          } else {
            userMessageContent += `Please proceed.`;
          }
          injectedHistory.push({ role: 'user', content: userMessageContent });
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
                flowRun.projectRoot, roleKey, bundleContent,
                injectedHistory as any,
                inputStream, outputStream,
                true,               // autonomous
                controller.signal   // ← externalSignal
              );
            } finally {
              process.removeListener('SIGINT', sigintHandler);
            }
              
            if (handoffResult) {
              if (handoffResult.kind === 'awaiting_human') {
                span.setAttribute('node.outcome', 'awaiting_human');
                span.addEvent('node.awaiting_human_suspended', { suspension_reason: 'prompt_human_signal' });
                const humanReply = await this.readHumanInput(inputStream, outputStream);
                if (humanReply === null) {
                  // Human exited — suspend flow
                  flowRun.status = 'awaiting_human';
                  session.transcriptHistory = injectedHistory;
                  SessionStore.saveRoleSession(session);
                  SessionStore.saveFlowRun(flowRun);
                  span.addEvent('human_input.exit');
                  break;
                }
                span.addEvent('human_input.received');
                injectedHistory.push({ role: 'user', content: humanReply });
                session.transcriptHistory = injectedHistory;
                SessionStore.saveRoleSession(session);
                // Do not save flowRun here — status remains 'running'
                continue;
              }

              if (handoffResult.kind === 'forward-pass-closed') {
                span.setAttribute('node.outcome', 'forward_pass_closed');
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

              // kind === 'targets'
              span.setAttribute('node.outcome', 'handoff');
              span.setAttribute('handoff.kind', handoffResult.kind);

              const handoffs = handoffResult.targets;
              await this.applyHandoffAndAdvance(flowRun, nodeId, handoffs);
              
              const currentTurnNumber = Math.max(1, Math.floor(injectedHistory.length / 2));
              const turnRecord: TurnRecord = {
                turnNumber: currentTurnNumber,
                inputArtifactPath: (Array.isArray(resolvedArtifacts) ? resolvedArtifacts.join(', ') : (resolvedArtifacts || '')),
                injectedContextHash: contextHash,
                assistantOutput: (injectedHistory[injectedHistory.length - 1] as any)?.content || "Handoff generated.",
                parsedHandoffResult: handoffs
              };

              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session);
              SessionStore.saveTurnRecord(session.logicalSessionId, turnRecord);
              span.addEvent('store.session_saved', { 'session.id': sessionId });
              span.addEvent('store.turn_saved', { 'session.id': sessionId, 'turn_number': currentTurnNumber });
              break;
            } else {
              span.setAttribute('node.outcome', 'null_return');
              flowRun.status = 'awaiting_human';
              session.transcriptHistory = injectedHistory;
              SessionStore.saveRoleSession(session);
              SessionStore.saveFlowRun(flowRun);
              span.addEvent('node.awaiting_human_suspended', { suspension_reason: 'null_session_return' });
              break;
            }
          } catch (e: any) {
            if (e instanceof HandoffParseError || e instanceof WorkflowError) {
              span.addEvent('handoff.parse_error_injected', { 
                error_type: e.name, 
                error_message: e.message.slice(0, 500) 
              });
              injectedHistory.push({ role: 'user', content: e.message });
              // Save session so history is preserved
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


  public async applyHandoffAndAdvance(flowRun: FlowRun, nodeId: string, handoffs: HandoffTarget[]): Promise<void> {
    if (!fs.existsSync(flowRun.recordFolderPath)) {
      throw new WorkflowError(`Error: No record folder found at ${flowRun.recordFolderPath}. A record folder must be created before emitting a handoff. Please create the record folder, create workflow.md inside it, and restate your handoff.`);
    }
    const wf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;

    const outgoingEdges = (wf.edges || []).filter((e: any) => e.from === nodeId);

    if (outgoingEdges.length === 0) {
      this.removeActiveNode(flowRun, nodeId);
      flowRun.completedNodes.push(nodeId);
      flowRun.completedNodeArtifacts[nodeId] = handoffs[0]?.artifact_path ?? '';
      
      if (flowRun.activeNodes.length === 0) {
        await ToolTriggerEngine.evaluateAndTrigger(flowRun, 'TERMINAL_FORWARD_PASS', {});
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
      flowRun.completedNodeArtifacts[nodeId] = handoffs[0].artifact_path ?? '';

      this.activateOrDefer(flowRun, wf, successorNode.id, [handoffs[0].artifact_path ?? '']);
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

      const activationPairs: Array<{ targetId: string; artifact: string }> = [];
      const claimedHandoffs = new Set<number>();

      for (const edge of outgoingEdges) {
        const targetNode = wf.nodes.find((n: any) => n.id === edge.to);
        const handoffIdx = handoffs.findIndex((h, idx) => h.role === targetNode.role && !claimedHandoffs.has(idx));
        
        if (handoffIdx === -1) {
          throw new Error(`Fork node '${nodeId}' has no handoff target with role '${targetNode.role}'.`);
        }
        
        claimedHandoffs.add(handoffIdx);
        activationPairs.push({ targetId: targetNode.id, artifact: handoffs[handoffIdx].artifact_path ?? '' });
      }

      this.removeActiveNode(flowRun, nodeId);
      flowRun.completedNodes.push(nodeId);
      flowRun.completedNodeArtifacts[nodeId] = ''; 

      for (const pair of activationPairs) {
        this.activateOrDefer(flowRun, wf, pair.targetId, [pair.artifact]);
      }
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
      rl.question('\n> ', (answer) => {
        rl.close();
        const line = answer.trim();
        if (line === 'exit' || line === 'quit') {
          resolve(null);
        } else if (line === '') {
          // Re-prompt on empty (per Owner correction in Phase 0 gate)
          this.readHumanInput(inputStream, outputStream).then(resolve);
        } else {
          resolve(line);
        }
      });
      rl.on('close', () => resolve(null));
    });
  }

  private removeActiveNode(flowRun: FlowRun, nodeId: string) {
    flowRun.activeNodes = flowRun.activeNodes.filter(id => id !== nodeId);
    delete flowRun.pendingNodeArtifacts[nodeId];
  }

  private activateOrDefer(flowRun: FlowRun, wf: any, candidateNodeId: string, incomingArtifacts: string[]) {
    const incomingEdges = (wf.edges || []).filter((e: any) => e.to === candidateNodeId);
    
    if (incomingEdges.length <= 1) {
      flowRun.pendingNodeArtifacts[candidateNodeId] = incomingArtifacts;
      if (!flowRun.activeNodes.includes(candidateNodeId)) {
        flowRun.activeNodes.push(candidateNodeId);
      }
      return;
    }

    const allComplete = incomingEdges.every((e: any) => flowRun.completedNodes.includes(e.from));

    if (allComplete) {
      const joinArtifacts = incomingEdges
        .map((e: any) => flowRun.completedNodeArtifacts[e.from])
        .filter((a: string) => a !== '');
      
      flowRun.pendingNodeArtifacts[candidateNodeId] = joinArtifacts;
      if (!flowRun.activeNodes.includes(candidateNodeId)) {
        flowRun.activeNodes.push(candidateNodeId);
      }
    }
  }
}
