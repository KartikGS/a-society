import readline from 'node:readline';
import crypto from 'node:crypto';
import type { OrientSession } from './types.js';
import { ContextInjectionService } from './injection.js';
import { LLMGateway, type RuntimeMessageParam } from './llm.js';
import { buildRoleContext } from './registry.js';

export async function runOrientSession(workspaceRoot: string, roleKey: string) {
  const orientRoleEntry = buildRoleContext(roleKey, workspaceRoot);
  if (!orientRoleEntry) {
    console.error(`Could not load role context for '${roleKey}'. Check that the role file exists and contains valid frontmatter.`);
    process.exit(1);
  }

  const session: OrientSession = {
    sessionId: crypto.randomUUID(),
    workspaceRoot,
    roleKey,
    startedAt: new Date().toISOString()
  };

  const { bundleContent } = ContextInjectionService.buildContextBundle(
    roleKey,
    workspaceRoot,
    '',
    null,
    'orient'
  );

  const llm = new LLMGateway(workspaceRoot);
  const systemPrompt = bundleContent;

  const history: RuntimeMessageParam[] = [];
  const initialUserMsg: RuntimeMessageParam = { 
    role: 'user', 
    content: "A new session has started. Read the project log in your context and give a brief status of where the project is at, then ask what the user wants to work on." 
  };

  console.log('\n');
  let response = '';
  try {
    response = await llm.executeTurn(systemPrompt, [initialUserMsg]);
  } catch (error: any) {
    if (error.name === 'LLMGatewayError' && error.type === 'AUTH_ERROR') {
      console.error(error.message);
    } else {
      console.error(`Error during initial turn: ${error.message}`);
    }
    process.exit(1);
  }
  
  history.push(initialUserMsg);
  history.push({ role: 'assistant', content: response });

  console.log('\n'); // newline after initial response

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  const promptUser = () => {
    rl.question('\n> ', async (input) => {
      const line = input.trim();
      if (line === 'exit' || line === 'quit') {
        rl.close();
        return;
      }
      if (!line) {
        promptUser();
        return;
      }

      history.push({ role: 'user', content: line });

      let streamResponse = '';
      try {
        streamResponse = await llm.executeTurn(systemPrompt, history);
      } catch (error: any) {
        console.error(`\nError during turn: ${error.message}`);
      }

      history.push({ role: 'assistant', content: streamResponse });
      console.log('\n'); // newline after response

      promptUser();
    });
  };

  rl.on('close', () => {
    console.log('\nSession closed.');
    process.exit(0);
  });

  promptUser();
}
