import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

import fs from 'node:fs';
import path from 'node:path';
import { select } from '@inquirer/prompts';
import { FlowOrchestrator } from '../src/orchestrator.js';

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

  const roleKey = `${selectedFolderName}__Owner`;
  try {
    const orchestrator = new FlowOrchestrator();
    const projectRoot = path.join(workspaceRoot, selectedFolderName);
    await orchestrator.startUnifiedOrchestration(projectRoot, roleKey);
  } catch (err: any) {
    console.error(`Orchestration stopped: ${err.message}`);
  }
}

main().catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
