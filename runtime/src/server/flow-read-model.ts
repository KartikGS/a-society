import { flowRefFromRun } from '../common/flow-ref.js';
import { IMPROVEMENT_CHOICE_MODE } from '../common/protocol-constants.js';
import { parseRoleIdentity } from '../common/role-id.js';
import type { FlowRef, FlowRun } from '../common/types.js';
import { findWorkflowFilePath, resolveFlowWorkflow } from '../context/workflow-file.js';
import { readImprovementWorkflow } from '../improvement/improvement-workflow.js';
import { SessionStore } from '../orchestration/store.js';

export type TranscriptPayload = {
  nodeId: string;
  role: string;
  transcript: unknown[];
};

export function createFlowReadModel(workspaceRoot: string) {
  function readFlowRun(ref: FlowRef): FlowRun | null {
    return SessionStore.loadFlowRun(ref, workspaceRoot);
  }

  function resolveWorkflow(flowRun: FlowRun | null): any | null {
    if (!flowRun) return null;
    const workflowPath = findWorkflowFilePath(flowRun.recordFolderPath);
    if (!workflowPath) return null;
    try {
      return resolveFlowWorkflow(flowRun.recordFolderPath, flowRun.workspaceRoot, flowRun.projectNamespace);
    } catch {
      return null;
    }
  }

  function resolveImprovementWorkflow(flowRun: FlowRun | null): any | null {
    if (
      !flowRun ||
      flowRun.improvementPhase?.mode === undefined ||
      flowRun.improvementPhase.mode === IMPROVEMENT_CHOICE_MODE.NONE
    ) {
      return null;
    }

    return readImprovementWorkflow(flowRun.recordFolderPath);
  }

  function buildTranscriptPayload(flowRun: FlowRun, nodeId: string) {
    const workflow = resolveWorkflow(flowRun);
    const node = workflow?.nodes?.find((candidate: any) => candidate.id === nodeId);
    if (!node) {
      return null;
    }

    const flowRef = flowRefFromRun(flowRun);
    const roleKey = parseRoleIdentity(node.role).instanceRoleId;
    const session = SessionStore.loadRoleSession(roleKey, flowRef, workspaceRoot);
    if (!session) {
      return null;
    }

    return {
      nodeId,
      role: node.role,
      transcript: session.transcriptHistory
    };
  }

  return {
    readFlowRun,
    resolveWorkflow,
    resolveImprovementWorkflow,
    buildTranscriptPayload,
  };
}

export type FlowReadModel = ReturnType<typeof createFlowReadModel>;
