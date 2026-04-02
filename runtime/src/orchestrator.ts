import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { LLMGateway } from './llm.js';
import { HandoffInterpreter, HandoffBlock } from './handoff.js';
import { ToolTriggerEngine } from './triggers.js';
import type { FlowRun, RoleSession, TurnRecord } from './types.js';

export function parseWorkflow(filePath: string): any {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error('No valid frontmatter found in workflow');
  return yaml.load(match[1]);
}

export class FlowOrchestrator {

  async advanceFlow(flowRun: FlowRun, roleKey: string, activeArtifactPath: string, humanInput?: string): Promise<void> {
    if (flowRun.status !== 'running') {
      throw new Error(`Cannot advance flow in state: ${flowRun.status}`);
    }

    const wf = parseWorkflow(path.join(flowRun.recordFolderPath, 'workflow.md')).workflow;
    const currentNodeHeader = wf.nodes.find((n: any) => n.id === flowRun.currentNode);
    if (!currentNodeHeader) throw new Error('Current node not found in workflow');

    // C-3: Evaluate human-collaborative pause
    const isHumanColl = currentNodeHeader['human-collaborative'];
    if (isHumanColl && typeof isHumanColl === 'string' && isHumanColl.trim() !== '') {
      if (!humanInput) {
        flowRun.status = 'awaiting_human';
        SessionStore.saveFlowRun(flowRun);
        console.log(`Flow paused at ${flowRun.currentNode}. Awaiting human input via resume-flow.`);
        return;
      }
    }

    const sessionId = `${flowRun.flowId}__${roleKey}`;
    let session = SessionStore.loadRoleSession(sessionId);
    if (!session) {
      session = { roleName: roleKey, logicalSessionId: sessionId, transcriptHistory: [], isActive: true };
    }

    // 1. Context Assembly
    const { bundleContent, contextHash } = ContextInjectionService.buildContextBundle(
      roleKey, flowRun.projectRoot, activeArtifactPath, null
    );

    // C-4: Separate system directive from user message
    let userMessageContent = "";
    if (humanInput) {
      userMessageContent += `Human Input:\n${humanInput}\n\n`;
    }
    if (activeArtifactPath) {
      userMessageContent += `Active artifact: ${activeArtifactPath}`;
    } else {
      userMessageContent += `Please proceed.`;
    }
    
    const userMsg = { role: 'user', content: userMessageContent };
    const historyForTurn = [...session.transcriptHistory, userMsg];

    // 2. Execute Provider Turn
    const llm = new LLMGateway(flowRun.projectRoot);
    let assistantOutput: string;
    try {
      assistantOutput = await llm.executeTurn(bundleContent, historyForTurn as any);
    } catch (err: any) {
      flowRun.status = err.type === 'RATE_LIMIT' ? 'awaiting_retry' : 'failed';
      SessionStore.saveFlowRun(flowRun);
      throw err;
    }

    // 3. Extract and Parse Handoff
    let handoff: HandoffBlock;
    try {
      handoff = HandoffInterpreter.parse(assistantOutput);
    } catch (err: any) {
      flowRun.status = 'failed';
      SessionStore.saveFlowRun(flowRun);
      throw new Error(`Orchestration stopped due to contract violation: ${err.message}`);
    }

    // 4. Update History
    const currentTurnNumber = (session.transcriptHistory.length / 2) + 1;
    const turnRecord: TurnRecord = {
      turnNumber: currentTurnNumber,
      inputArtifactPath: activeArtifactPath,
      injectedContextHash: contextHash,
      assistantOutput,
      parsedHandoffResult: handoff
    };

    session.transcriptHistory.push(userMsg);
    session.transcriptHistory.push({ role: 'assistant', content: assistantOutput });
    
    SessionStore.saveRoleSession(session);
    SessionStore.saveTurnRecord(session.logicalSessionId, turnRecord);


    // C-2: Workflow Edge Routing Rule Check
    const proposedRole = handoff.role;
    const outgoingEdges = (wf.edges || []).filter((e: any) => e.from === flowRun.currentNode);
    
    if (outgoingEdges.length === 0) {
      // Terminal node hit
      await ToolTriggerEngine.evaluateAndTrigger(flowRun, 'TERMINAL_FORWARD_PASS', {});
      flowRun.status = 'completed';
      SessionStore.saveFlowRun(flowRun);
      return;
    }

    let nextNode = null;
    let allowedRoles = [];
    for (const edge of outgoingEdges) {
      const targetNode = wf.nodes.find((n: any) => n.id === edge.to);
      if (targetNode) {
        allowedRoles.push(targetNode.role);
        if (targetNode.role === proposedRole) {
          nextNode = targetNode;
          break;
        }
      }
    }

    if (!nextNode) {
      flowRun.status = 'failed';
      SessionStore.saveFlowRun(flowRun);
      throw new Error(`Unauthorized transition: workflow limits successors to [${allowedRoles.join(', ')}], but proposed role was '${proposedRole}'.`);
    }

    // Advance topological state
    flowRun.currentNode = nextNode.id;
    SessionStore.saveFlowRun(flowRun);
  }
}
