import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

import { TelemetryManager } from '../src/observability.js';
TelemetryManager.init();

import fs from 'node:fs';
import path from 'node:path';
import { select } from '@inquirer/prompts';
import { SessionStore } from '../src/store.js';
import { FlowOrchestrator, parseWorkflow } from '../src/orchestrator.js';
import { renderFlowStatus } from '../src/visualization.js';

function discoverProjects(workspaceRoot: string): Array<{ displayName: string; folderName: string }> {
  try {
    const entries = fs.readdirSync(workspaceRoot, { withFileTypes: true });
    const matches = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      // if (entry.name === 'a-society') continue;

      const agentsMdPath = path.join(workspaceRoot, entry.name, 'a-docs', 'agents.md');
      if (fs.existsSync(agentsMdPath)) {
        matches.push({ displayName: entry.name, folderName: entry.name });
      }
    }
    return matches;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'flow-status') {
    SessionStore.init();
    const flowRun = SessionStore.loadFlowRun();
    if (!flowRun) {
      console.log('No active flow state found in .state/flow.json');
      return;
    }
    try {
      const workflowPath = path.join(flowRun.recordFolderPath, 'workflow.md');
      const wf = parseWorkflow(workflowPath).workflow;
      console.log(renderFlowStatus(flowRun, wf));
    } catch (err: any) {
      console.log(`Status: ${flowRun.status}\n(Workflow graph unavailable: ${err.message})`);
    }
    return;
  }

  const workspaceRoot = process.cwd();
  const projects = discoverProjects(workspaceRoot);

  if (projects.length === 0) {
    console.log(`No initialized A-Society projects found in ${workspaceRoot}.`);
    console.log(`Run the A-Society Initializer to bootstrap a project.`);
    process.exit(0);
  }

  let selectedFolderName = '';

  selectedFolderName = await select({
    message: 'Select a project:',
    choices: projects.map(p => ({ name: p.displayName, value: p.folderName }))
  });

  try {
    const orchestrator = new FlowOrchestrator();
    await orchestrator.startUnifiedOrchestration(workspaceRoot, selectedFolderName, 'Owner');
  } catch (err: any) {
    console.error(`Orchestration stopped: ${err.message}`);
  }
}

try {
  await main();
} catch (err: any) {
  console.error(`Fatal error:`, err);
  process.exit(1);
} finally {
  await TelemetryManager.shutdown();
}
