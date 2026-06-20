import { SessionStore } from '../../src/orchestration/store.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';
import type { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';

async function waitUntil(predicate: () => boolean, timeoutMs = 2_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error('Timed out waiting for scheduler state.');
    await new Promise<void>(resolve => setTimeout(resolve, 1));
  }
}

export async function runStoredFlowUntil(
  orchestrator: FlowOrchestrator,
  workspaceRoot: string,
  projectNamespace: string,
  flowId: string,
  predicate: () => boolean
): Promise<void> {
  setWorkspaceRoot(workspaceRoot);
  const runPromise = orchestrator.runStoredFlow(workspaceRoot, projectNamespace, flowId);
  try {
    await waitUntil(predicate);
  } finally {
    await SessionStore.updateFlowRun((flow) => {
      flow.status = 'completed';
    }, { projectNamespace, flowId }, workspaceRoot);
    orchestrator.wake();
    await runPromise;
  }
}
