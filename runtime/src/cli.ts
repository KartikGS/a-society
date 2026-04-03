import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
import { SessionStore } from './store.js';
import { FlowOrchestrator, parseWorkflow } from './orchestrator.js';
import path from 'node:path';
import { renderFlowStatus } from './visualization.js';

const orchestrator = new FlowOrchestrator();

function flowStatus() {
  SessionStore.init();
  const flowRun = SessionStore.loadFlowRun();
  if (!flowRun) {
    console.log('Status: No active flow.');
    return;
  }

  try {
    const workflowPath = path.join(flowRun.recordFolderPath, 'workflow.md');
    const wf = parseWorkflow(workflowPath).workflow;
    console.log(renderFlowStatus(flowRun, wf));
  } catch (err: any) {
    console.log(`=== RUNTIME FLOW STATUS ===\nRecord Folder: ${flowRun.recordFolderPath}\nStatus: ${flowRun.status}\n(Workflow graph unavailable for visualization: ${err.message})`);
  }
}

const args = process.argv.slice(2);
const command = args[0];

if (command === 'run') {
  const [workspaceRoot, roleKey] = args.slice(1);
  if (!workspaceRoot || !roleKey) {
    console.error('Usage: run <workspaceRoot> <roleKey>');
    process.exit(1);
  }
  orchestrator.startUnifiedOrchestration(path.resolve(workspaceRoot), roleKey).catch(err => {
    console.error(`Orchestration stopped: ${err.message}`);
    process.exit(1);
  });
} else if (command === 'flow-status') {
  flowStatus();
} else {
  console.log('Available CLI commands: run, flow-status');
}
