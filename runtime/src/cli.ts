import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
import { SessionStore } from './store.js';
import { FlowOrchestrator, parseWorkflow } from './orchestrator.js';
import { ToolTriggerEngine } from './triggers.js';
import crypto from 'node:crypto';
import type { FlowRun } from './types.js';
import { runOrientSession } from './orient.js';
import path from 'node:path';

const orchestrator = new FlowOrchestrator();

async function startFlow(projectRoot: string, recordFolderPath: string, startingRole: string, startingArtifact: string) {
  SessionStore.init();
  const workflowDocumentPath = path.join(recordFolderPath, 'workflow.md');

  let startNode = 'start';
  try {
    const doc = parseWorkflow(workflowDocumentPath);
    if (doc.workflow && doc.workflow.nodes) {
      const node = doc.workflow.nodes.find((n: any) => n.role === startingRole);
      if (node) {
        startNode = node.id;
      }
    }
  } catch(e) { /* ignore parse errors until trigger */ }

  const flowRun: FlowRun = {
    flowId: crypto.randomUUID(),
    projectRoot,
    recordFolderPath,
    currentNode: startNode,
    status: 'initialized'
  };

  try {
    await ToolTriggerEngine.evaluateAndTrigger(flowRun, 'START', { workflowDocumentPath });
  } catch (err: any) {
    console.error(`Pre-flight validation failed: ${err.message}`);
    process.exit(1);
  }

  flowRun.status = 'running';
  SessionStore.saveFlowRun(flowRun);

  console.log(`Starting flow at ${recordFolderPath}...`);
  try {
    await orchestrator.advanceFlow(flowRun, startingRole, startingArtifact);
    console.log(`Flow paused or completed. Current status: ${SessionStore.loadFlowRun()?.status}`);
  } catch (err: any) {
    console.error(`Flow execution stopped: ${err.message}`);
  }
}

async function resumeFlow(roleKey: string, activeArtifactPath: string, humanInput?: string) {
  SessionStore.init();
  const flowRun = SessionStore.loadFlowRun();
  if (!flowRun) {
    console.error('No active flow run found in .state/flow.json');
    return;
  }

  if (flowRun.status === 'completed' || flowRun.status === 'failed') {
    console.error(`Cannot resume a flow in ${flowRun.status} state.`);
    return;
  }

  flowRun.status = 'running';
  SessionStore.saveFlowRun(flowRun);

  console.log(`Resuming flow at ${flowRun.recordFolderPath}...`);
  try {
    await orchestrator.advanceFlow(flowRun, roleKey, activeArtifactPath, humanInput);
    console.log(`Flow paused or completed. Current status: ${SessionStore.loadFlowRun()?.status}`);
  } catch (err: any) {
    console.error(`Flow execution stopped: ${err.message}`);
  }
}

function flowStatus() {
  SessionStore.init();
  const flowRun = SessionStore.loadFlowRun();
  if (!flowRun) {
    console.log('Status: No active flow.');
    return;
  }

  console.log(`=== RUNTIME FLOW STATUS ===`);
  console.log(`Record Folder: ${flowRun.recordFolderPath}`);
  console.log(`Workflow: ${path.join(flowRun.recordFolderPath, 'workflow.md')}`);
  console.log(`Node: ${flowRun.currentNode}`);
  console.log(`Status: ${flowRun.status}`);
}

const args = process.argv.slice(2);
const command = args[0];

if (command === 'start-flow') {
  const [root, recPath, role, artifact] = args.slice(1);
  if (!root || !recPath || !role || !artifact) {
    console.error('Usage: start-flow <projectRoot> <recordFolderPath> <startingRole> <startingArtifact>');
    process.exit(1);
  }
  startFlow(root, recPath, role, artifact);
} else if (command === 'resume-flow') {
  const [role, artifact, ...rest] = args.slice(1);
  if (!role || !artifact) {
    console.error('Usage: resume-flow <roleKey> <activeArtifactPath> [humanInput]');
    process.exit(1);
  }
  const humanInput = rest.length > 0 ? rest.join(' ') : undefined;
  resumeFlow(role, artifact, humanInput);
} else if (command === 'flow-status') {
  flowStatus();
} else if (command === 'orient') {
  const [workspaceRoot, roleKey] = args.slice(1);
  if (!workspaceRoot || !roleKey) {
    console.error('Usage: orient <workspaceRoot> <roleKey>');
    process.exit(1);
  }
  runOrientSession(path.resolve(workspaceRoot), roleKey);
} else {
  console.log('Available CLI commands: start-flow, resume-flow, flow-status, orient');
}
