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
import { renderFlowStatus } from './visualization.js';

const orchestrator = new FlowOrchestrator();

async function startFlow(projectRoot: string, recordFolderPath: string, startingRole: string, startingArtifact: string) {
  SessionStore.init();
  const workflowDocumentPath = path.join(recordFolderPath, 'workflow.md');

  let startNodeId = 'start';
  try {
    const doc = parseWorkflow(workflowDocumentPath);
    if (doc.workflow && doc.workflow.nodes) {
      const node = doc.workflow.nodes.find((n: any) => n.role === startingRole);
      if (node) {
        startNodeId = node.id;
      }
    }
  } catch(e) { 
    console.error(`Workflow parsing failed: ${e.message}`);
    process.exit(1);
  }

  const flowRun: FlowRun = {
    flowId: crypto.randomUUID(),
    projectRoot,
    recordFolderPath,
    activeNodes: [startNodeId],
    completedNodes: [],
    completedNodeArtifacts: {},
    pendingNodeArtifacts: { [startNodeId]: [startingArtifact] },
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
    await orchestrator.advanceFlow(flowRun, startNodeId, startingArtifact);
    console.log(`Flow paused or completed. Current status: ${SessionStore.loadFlowRun()?.status}`);
  } catch (err: any) {
    console.error(`Flow execution stopped: ${err.message}`);
  }
}

async function resumeFlow(nodeId: string, activeArtifactPath?: string, humanInput?: string) {
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
    await orchestrator.advanceFlow(flowRun, nodeId, activeArtifactPath, humanInput);
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

  try {
    const workflowPath = path.join(flowRun.recordFolderPath, 'workflow.md');
    const wf = parseWorkflow(workflowPath).workflow;
    console.log(renderFlowStatus(flowRun, wf));
  } catch (err: any) {
    // Fall back to minimal output if workflow.md is unreadable
    console.log(`=== RUNTIME FLOW STATUS ===\nRecord Folder: ${flowRun.recordFolderPath}\nStatus: ${flowRun.status}\n(Workflow graph unavailable for visualization: ${err.message})`);
  }
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
  const [nodeId, artifact, ...rest] = args.slice(1);
  if (!nodeId) {
    console.error('Usage: resume-flow <nodeId> [activeArtifactPath] [humanInput]');
    process.exit(1);
  }
  
  // If artifact looks like human input (no dot and multiple words or just different from standard path), 
  // it might be tricky. But the convention is nodeId artifact humanInput.
  // We'll follow the positional rule.
  
  const humanInput = rest.length > 0 ? rest.join(' ') : undefined;
  resumeFlow(nodeId, artifact, humanInput);
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
