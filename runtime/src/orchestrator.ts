import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { LLMGateway } from './llm.js';
import { HandoffInterpreter, HandoffTarget } from './handoff.js';
import { ToolTriggerEngine } from './triggers.js';
import type { FlowRun, TurnRecord } from './types.js';

export function parseWorkflow(filePath: string): any {
  if (!fs.existsSync(filePath)) throw new Error(`Workflow file not found: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error('No valid frontmatter found in workflow');
  return yaml.load(match[1]);
}

export class FlowOrchestrator {

  async advanceFlow(
    flowRun: FlowRun,
    nodeId: string,
    activeArtifactPath?: string | string[],
    humanInput?: string
  ): Promise<void> {
    if (flowRun.status === 'completed' || flowRun.status === 'failed') {
      throw new Error(`Cannot advance flow in state: ${flowRun.status}`);
    }

    // Node ID guard
    if (!flowRun.activeNodes.includes(nodeId)) {
      throw new Error(`Node '${nodeId}' is not in activeNodes: [${flowRun.activeNodes.join(', ')}]. Only active nodes can be advanced.`);
    }

    const wf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;
    const currentNodeDef = wf.nodes.find((n: any) => n.id === nodeId);
    if (!currentNodeDef) throw new Error(`Node '${nodeId}' not found in workflow.`);

    // Evaluate human-collaborative pause
    const isHumanColl = currentNodeDef['human-collaborative'];
    if (isHumanColl && typeof isHumanColl === 'string' && isHumanColl.trim() !== '') {
      if (!humanInput) {
        flowRun.status = 'awaiting_human';
        SessionStore.saveFlowRun(flowRun);
        console.log(`Flow paused at node '${nodeId}'. Awaiting human input via resume-flow.`);
        return;
      }
    }

    // Role and Session derivation
    const roleKey = currentNodeDef.role;
    const sessionId = `${flowRun.flowId}__${nodeId}`;
    
    // Resolve artifacts
    const resolvedArtifacts: string[] =
      activeArtifactPath !== undefined
        ? (Array.isArray(activeArtifactPath) ? activeArtifactPath : [activeArtifactPath])
        : (flowRun.pendingNodeArtifacts[nodeId] ?? []);

    let session = SessionStore.loadRoleSession(sessionId);
    if (!session) {
      session = { roleName: roleKey, logicalSessionId: sessionId, transcriptHistory: [], isActive: true };
    }

    // 1. Context Assembly
    const { bundleContent, contextHash } = ContextInjectionService.buildContextBundle(
      roleKey, flowRun.projectRoot, resolvedArtifacts, null
    );

    // Build user message
    let userMessageContent = "";
    if (humanInput) {
      userMessageContent += `Human Input:\n${humanInput}\n\n`;
    }
    if (resolvedArtifacts.length === 1) {
      userMessageContent += `Active artifact: ${resolvedArtifacts[0]}`;
    } else if (resolvedArtifacts.length > 1) {
      userMessageContent += `Active artifacts (parallel track inputs):\n`;
      userMessageContent += resolvedArtifacts.map(a => `- ${a}`).join('\n');
    } else {
      userMessageContent += `Please proceed.`;
    }
    
    const userMsg = { role: 'user', content: userMessageContent };
    const historyForTurn = [...session.transcriptHistory, userMsg];

    // 2. Execute Provider Turn
    const llm = new LLMGateway(flowRun.projectRoot);
    let assistantOutput: string;
    try {
      flowRun.status = 'running';
      assistantOutput = await llm.executeTurn(bundleContent, historyForTurn as any);
    } catch (err: any) {
      flowRun.status = err.type === 'RATE_LIMIT' ? 'awaiting_retry' : 'failed';
      SessionStore.saveFlowRun(flowRun);
      throw err;
    }

    // 3. Extract and Parse Handoff
    let handoffs: HandoffTarget[];
    try {
      handoffs = HandoffInterpreter.parse(assistantOutput);
    } catch (err: any) {
      flowRun.status = 'failed';
      SessionStore.saveFlowRun(flowRun);
      throw new Error(`Orchestration stopped due to contract violation: ${err.message}`);
    }

    // 4. Update History
    const currentTurnNumber = (session.transcriptHistory.length / 2) + 1;
    const turnRecord: TurnRecord = {
      turnNumber: currentTurnNumber,
      inputArtifactPath: resolvedArtifacts.join(', '),
      injectedContextHash: contextHash,
      assistantOutput,
      parsedHandoffResult: handoffs
    };

    session.transcriptHistory.push(userMsg);
    session.transcriptHistory.push({ role: 'assistant', content: assistantOutput });
    
    SessionStore.saveRoleSession(session);
    SessionStore.saveTurnRecord(session.logicalSessionId, turnRecord);

    // 5. Fork/Join Detection and Activation
    const outgoingEdges = (wf.edges || []).filter((e: any) => e.from === nodeId);

    // Terminal Case
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

    // Linear Case
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

    // Fork Case
    if (outgoingEdges.length > 1) {
      if (handoffs.length !== outgoingEdges.length) {
        throw new Error(`Fork node '${nodeId}' has ${outgoingEdges.length} outgoing edges but agent emitted ${handoffs.length} handoff targets. An array handoff with one entry per fork target is required.`);
      }

      // Validate distinct roles in outgoing edges
      const roles = outgoingEdges.map((e: any) => wf.nodes.find((n: any) => n.id === e.to)?.role);
      const uniqueRoles = new Set(roles);
      if (uniqueRoles.size !== roles.length) {
        // Find the duplicate role
        const duplicateRole = roles.find((r, i) => roles.indexOf(r) !== i);
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
      flowRun.completedNodeArtifacts[nodeId] = ''; // Fork nodes have no single output

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
      // Not a join - activate immediately
      flowRun.pendingNodeArtifacts[candidateNodeId] = incomingArtifacts;
      if (!flowRun.activeNodes.includes(candidateNodeId)) {
        flowRun.activeNodes.push(candidateNodeId);
      }
      return;
    }

    // Join node: check if all predecessors are complete
    const allComplete = incomingEdges.every((e: any) => flowRun.completedNodes.includes(e.from));

    if (allComplete) {
      // Gather all predecessor artifacts in edge order
      const joinArtifacts = incomingEdges
        .map((e: any) => flowRun.completedNodeArtifacts[e.from])
        .filter((a: string) => a !== '');
      
      flowRun.pendingNodeArtifacts[candidateNodeId] = joinArtifacts;
      if (!flowRun.activeNodes.includes(candidateNodeId)) {
        flowRun.activeNodes.push(candidateNodeId);
      }
    }
    // Else: waiting for other predecessors
  }
}
