import { IMPROVEMENT_CHOICE_MODE } from '../common/protocol-constants.js';
import type { FlowRef, FlowRun } from '../common/types.js';
import { findWorkflowFilePath, resolveFlowWorkflow } from '../context/workflow-file.js';
import { readImprovementWorkflow } from '../improvement/improvement-workflow.js';
import { SessionStore } from '../orchestration/store.js';

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

  return {
    readFlowRun,
    resolveWorkflow,
    resolveImprovementWorkflow,
  };
}

export type FlowReadModel = ReturnType<typeof createFlowReadModel>;
