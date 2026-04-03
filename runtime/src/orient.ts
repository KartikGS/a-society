import readline from 'node:readline';
import crypto from 'node:crypto';
import type { OrientSession, FlowRun } from './types.js';
import { ContextInjectionService } from './injection.js';
import { LLMGateway, type RuntimeMessageParam } from './llm.js';
import { buildRoleContext } from './registry.js';
import { HandoffInterpreter, HandoffParseError, HandoffTarget } from './handoff.js';

export async function runInteractiveSession(
  workspaceRoot: string,
  roleKey: string,
  providedSystemPrompt?: string,
  providedHistory?: RuntimeMessageParam[],
  inputStream: NodeJS.ReadableStream = process.stdin,
  outputStream: NodeJS.WritableStream = process.stdout
): Promise<HandoffTarget[] | null> {
  const orientRoleEntry = buildRoleContext(roleKey, workspaceRoot);
  if (!orientRoleEntry) {
    if (outputStream === process.stdout) {
      console.error(`Could not load role context for '${roleKey}'. Check that the role file exists and contains valid frontmatter.`);
    }
    return null;
  }

  const session: OrientSession = {
    sessionId: crypto.randomUUID(),
    workspaceRoot,
    roleKey,
    startedAt: new Date().toISOString()
  };

  let systemPrompt = providedSystemPrompt;
  if (!systemPrompt) {
    const { bundleContent } = ContextInjectionService.buildContextBundle(
      roleKey,
      workspaceRoot,
      '',
      null,
      'orient'
    );
    systemPrompt = bundleContent;
  }

  const llm = new LLMGateway(workspaceRoot);
  const history: RuntimeMessageParam[] = providedHistory ? [...providedHistory] : [];

  if (history.length === 0) {
    const initialUserMsg: RuntimeMessageParam = { 
      role: 'user', 
      content: "A new session has started. Read the project log in your context and give a brief status of where the project is at, then ask what the user wants to work on." 
    };

    let response = '';
    try {
      response = await llm.executeTurn(systemPrompt, [initialUserMsg]);
    } catch (error: any) {
      if (error.name === 'LLMGatewayError' && error.type === 'AUTH_ERROR') {
        if (outputStream === process.stdout) console.error(error.message);
      } else {
        if (outputStream === process.stdout) console.error(`Error during initial turn: ${error.message}`);
      }
      return null;
    }
    
    history.push(initialUserMsg);
    history.push({ role: 'assistant', content: response });

    try {
      const handoffs = HandoffInterpreter.parse(response);
      if (outputStream === process.stdout) console.log("Handoff detected. Transitioning node...");
      return handoffs;
    } catch (e: any) {
      if (!(e instanceof HandoffParseError)) throw e;
    }
  } else {
    if (history[history.length - 1].role === 'user') {
      let streamResponse = '';
      try {
        streamResponse = await llm.executeTurn(systemPrompt, history);
        history.push({ role: 'assistant', content: streamResponse });
      } catch (error: any) {
        if (outputStream === process.stdout) console.error(`\nError during turn: ${error.message}`);
      }
      
      try {
        const handoffs = HandoffInterpreter.parse(streamResponse);
        if (outputStream === process.stdout) console.log("Handoff detected. Transitioning node...");
        return handoffs;
      } catch (e: any) {
        if (!(e instanceof HandoffParseError)) throw e;
      }
    }
  }

  return new Promise<HandoffTarget[] | null>((resolve) => {
    const rl = readline.createInterface({
      input: inputStream,
      output: outputStream,
      terminal: true
    });

    const promptUser = () => {
      rl.question('\n> ', async (input) => {
        const line = input.trim();
        if (line === 'exit' || line === 'quit') {
          finish(null);
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
          streamResponse = await llm.executeTurn(systemPrompt as string, history);
        } catch (error: any) {
          if (outputStream === process.stdout) console.error(`\nError during turn: ${error.message}`);
        }

        history.push({ role: 'assistant', content: streamResponse });

        try {
          const handoffs = HandoffInterpreter.parse(streamResponse);
          if (outputStream === process.stdout) console.log("Handoff detected. Transitioning node...");
          finish(handoffs);
          rl.close();
          return;
        } catch (e: any) {
          if (!(e instanceof HandoffParseError)) {
             if (outputStream === process.stdout) console.error(`Unexpected error: ${e.message}`);
          }
        }

        promptUser();
      });
    };

    let resolved = false;

    rl.on('close', () => {
      if (inputStream === process.stdin && outputStream === process.stdout) {
        console.log('\nSession closed.');
      }
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    });

    const finish = (result: HandoffTarget[] | null) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    promptUser();
  });
}
