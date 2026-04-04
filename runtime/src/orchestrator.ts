import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { HandoffInterpreter, HandoffParseError } from './handoff.js';
import { ToolTriggerEngine } from './triggers.js';
import type { FlowRun, TurnRecord, HandoffResult, HandoffTarget } from './types.js';
import { runInteractiveSession } from './orient.js';
import { ImprovementOrchestrator } from './improvement.js';
import crypto from 'node:crypto';

export function parseWorkflow(filePath: string): any {
  if (!fs.existsSync(filePath)) throw new Error(`Workflow file not found: ${filePath}`);
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
    SessionStore.init();
    let flowRun = SessionStore.loadFlowRun();

    if (!flowRun) {
      console.log(`Bootstrapping flow from interactive session...`);
      const handoffResult = await runInteractiveSession(workspaceRoot, roleKey, undefined, undefined, inputStream, outputStream);
      if (!handoffResult) return; // interactive session exited without handoff

      if (handoffResult.kind !== 'targets') {
        throw new Error(`Initial interactive session must return a 'targets' handoff, but got '${handoffResult.kind}'.`);
      }
      const handoffs = handoffResult.targets;
      const artifactPath = handoffs[0].artifact_path;
      if (!artifactPath) throw new Error("Initial interactive session did not supply an artifact_path to locate workflow.md.");

      const recordFolderPath = path.dirname(path.resolve(workspaceRoot, artifactPath));
      const workflowDocumentPath = path.join(recordFolderPath, 'workflow.md');

      if (!fs.existsSync(workflowDocumentPath)) {
        throw new Error(`workflow.md not found in ${recordFolderPath}`);
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
      } catch(e: any) { 
        throw new Error(`Workflow parsing failed: ${e.message}`);
      }

      flowRun = {
        flowId: crypto.randomUUID(),
        projectRoot: workspaceRoot,
        recordFolderPath,
        activeNodes: [startNodeId],
        completedNodes: [],
        completedNodeArtifacts: {},
        pendingNodeArtifacts: { [startNodeId]: [artifactPath] },
        status: 'running',
        stateVersion: '2'
      };

      await ToolTriggerEngine.evaluateAndTrigger(flowRun, 'START', { workflowDocumentPath });
      SessionStore.saveFlowRun(flowRun);
    }

    while (flowRun.status === 'running' && flowRun.activeNodes.length > 0) {
      const nodeId = flowRun.activeNodes[0];
      await this.advanceFlow(flowRun, nodeId, undefined, undefined, inputStream, outputStream);
      flowRun = SessionStore.loadFlowRun()!;
    }
    
    if (flowRun?.status === 'completed') {
      console.log("\nOrchestration complete.");
    }
  }

  public async advanceFlow(
    flowRun: FlowRun,
    nodeId: string,
    activeArtifactPath?: string | string[],
    humanInput?: string,
    inputStream: NodeJS.ReadableStream = process.stdin,
    outputStream: NodeJS.WritableStream = process.stdout
  ): Promise<void> {
    if (flowRun.status === 'completed' || flowRun.status === 'failed') {
      throw new Error(`Cannot advance flow in state: ${flowRun.status}`);
    }

    if (!flowRun.activeNodes.includes(nodeId)) {
      throw new Error(`Node '${nodeId}' is not in activeNodes: [${flowRun.activeNodes.join(', ')}]. Only active nodes can be advanced.`);
    }

    const wf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;
    const currentNodeDef = wf.nodes.find((n: any) => n.id === nodeId);
    if (!currentNodeDef) throw new Error(`Node '${nodeId}' not found in workflow.`);

    const namespace = path.basename(flowRun.projectRoot);
    const roleKey = `${namespace}__${currentNodeDef.role}`;
    
    const sessionId = `${flowRun.flowId}__${nodeId}`;
    
    const resolvedArtifacts: string[] =
      activeArtifactPath !== undefined
        ? (Array.isArray(activeArtifactPath) ? activeArtifactPath : [activeArtifactPath])
        : (flowRun.pendingNodeArtifacts[nodeId] ?? []);

    let session = SessionStore.loadRoleSession(sessionId);
    if (!session) {
      session = { roleName: roleKey, logicalSessionId: sessionId, transcriptHistory: [], isActive: true };
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

    const handoffResult = await runInteractiveSession(flowRun.projectRoot, roleKey, bundleContent, injectedHistory as any, inputStream, outputStream);
    
    if (handoffResult) {
      if (handoffResult.kind === 'forward-pass-closed') {
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
      const handoffs = handoffResult.targets;
      const currentTurnNumber = Math.max(1, Math.floor(injectedHistory.length / 2));
      const turnRecord: TurnRecord = {
        turnNumber: currentTurnNumber,
        inputArtifactPath: resolvedArtifacts.join(', '),
        injectedContextHash: contextHash,
        assistantOutput: (injectedHistory[injectedHistory.length - 1] as any)?.content || "Handoff generated.",
        parsedHandoffResult: handoffs
      };

      session.transcriptHistory = injectedHistory;
      SessionStore.saveRoleSession(session);
      SessionStore.saveTurnRecord(session.logicalSessionId, turnRecord);

      await this.applyHandoffAndAdvance(flowRun, nodeId, handoffs);
    } else {
      flowRun.status = 'awaiting_human';
      session.transcriptHistory = injectedHistory;
      SessionStore.saveRoleSession(session);
      SessionStore.saveFlowRun(flowRun);
    }
  }

  public async applyHandoffAndAdvance(flowRun: FlowRun, nodeId: string, handoffs: HandoffTarget[]): Promise<void> {
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
