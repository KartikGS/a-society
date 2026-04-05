import readline from 'node:readline';
import crypto from 'node:crypto';
import type { OrientSession, FlowRun, HandoffResult } from './types.js';
import { ContextInjectionService } from './injection.js';
import { LLMGateway, type RuntimeMessageParam, LLMGatewayError } from './llm.js';
import { buildRoleContext } from './registry.js';
import { HandoffInterpreter, HandoffParseError } from './handoff.js';

export async function runInteractiveSession(
  workspaceRoot: string,
  roleKey: string,
  providedSystemPrompt?: string,
  providedHistory?: RuntimeMessageParam[],
  inputStream: NodeJS.ReadableStream = process.stdin,
  outputStream: NodeJS.WritableStream = process.stdout,
  autonomous: boolean = false,
  externalSignal?: AbortSignal
): Promise<HandoffResult | null> {

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

  const systemPrompt = providedSystemPrompt ?? '';

  const llm = new LLMGateway(workspaceRoot);
  const history: RuntimeMessageParam[] = providedHistory ? [...providedHistory] : [];

  if (history.length === 0) {
    const initialUserMsg: RuntimeMessageParam = { 
      role: 'user', 
      content: "A new session has started. Read the project log in your context and give a brief status of where the project is at, then ask what the user wants to work on." 
    };

    let response = '';
    let usage: any;
    try {
      const result = await llm.executeTurn(systemPrompt, [initialUserMsg], { signal: externalSignal });
      response = result.text;
      usage = result.usage;
    } catch (error: any) {
      if (error instanceof LLMGatewayError && error.type === 'ABORTED') {
        if (error.partialText && providedHistory) {
          providedHistory.push({ role: 'assistant', content: error.partialText });
        }
        process.stderr.write('\n[Aborted]\n');
        return null;
      }
      if (error.name === 'LLMGatewayError' && error.type === 'AUTH_ERROR') {
        if (outputStream === process.stdout) console.error(error.message);
      } else {
        if (outputStream === process.stdout) console.error(`Error during initial turn: ${error.message}`);
      }
      return null;
    }
    
    history.push(initialUserMsg);
    history.push({ role: 'assistant', content: response });

    if (usage && process.stderr.isTTY) {
      const inStr = usage.inputTokens !== undefined ? String(usage.inputTokens) : '?';
      const outStr = usage.outputTokens !== undefined ? String(usage.outputTokens) : '?';
      process.stderr.write(`[tokens: ${inStr} in, ${outStr} out]\n`);
    }

    try {
      const result = HandoffInterpreter.parse(response);
      if (outputStream === process.stdout) console.log("Handoff detected. Transitioning node...");
      return result;
    } catch (e: any) {
      if (!(e instanceof HandoffParseError)) throw e;
      if (autonomous) throw e;
    }
  } else {

    if (history[history.length - 1].role === 'user') {
      let streamResponse = '';
      let usage: any;
      try {
        const result = await llm.executeTurn(systemPrompt, history, { signal: externalSignal });
        streamResponse = result.text;
        usage = result.usage;
        history.push({ role: 'assistant', content: streamResponse });
      } catch (error: any) {
        if (error instanceof LLMGatewayError && error.type === 'ABORTED') {
          if (error.partialText && providedHistory) {
            providedHistory.push({ role: 'assistant', content: error.partialText });
          }
          process.stderr.write('\n[Aborted]\n');
          return null;
        }
        if (outputStream === process.stdout) console.error(`\nError during turn: ${error.message}`);
      }
      
      if (usage && process.stderr.isTTY) {
        const inStr = usage.inputTokens !== undefined ? String(usage.inputTokens) : '?';
        const outStr = usage.outputTokens !== undefined ? String(usage.outputTokens) : '?';
        process.stderr.write(`[tokens: ${inStr} in, ${outStr} out]\n`);
      }

      try {
        const result = HandoffInterpreter.parse(streamResponse);
        if (outputStream === process.stdout) console.log("Handoff detected. Transitioning node...");
        return result;
      } catch (e: any) {
        if (!(e instanceof HandoffParseError)) throw e;
        if (autonomous) throw e;
      }
    }
  }

  if (autonomous) return null; // Should not reach here for autonomous turn


  return new Promise<HandoffResult | null>((resolve) => {
    const rl = readline.createInterface({
      input: inputStream,
      output: outputStream,
      terminal: true
    });

    let currentController: AbortController | undefined;
    rl.on('SIGINT', () => {
      currentController?.abort();
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

        currentController = new AbortController();
        const signal = currentController.signal;

        let streamResponse = '';
        let usage: any;
        try {
          const result = await llm.executeTurn(systemPrompt as string, history, { signal });
          streamResponse = result.text;
          usage = result.usage;
          history.push({ role: 'assistant', content: streamResponse });
        } catch (error: any) {
          if (error instanceof LLMGatewayError && error.type === 'ABORTED') {
            if (error.partialText) history.push({ role: 'assistant', content: error.partialText });
            process.stderr.write('\n[Aborted]\n');
            promptUser();
            return;
          }
          if (outputStream === process.stdout) console.error(`\nError during turn: ${error.message}`);
        }

        if (usage && process.stderr.isTTY) {
          const inStr = usage.inputTokens !== undefined ? String(usage.inputTokens) : '?';
          const outStr = usage.outputTokens !== undefined ? String(usage.outputTokens) : '?';
          process.stderr.write(`[tokens: ${inStr} in, ${outStr} out]\n`);
        }

        try {
          const result = HandoffInterpreter.parse(streamResponse);
          if (outputStream === process.stdout) console.log("Handoff detected. Transitioning node...");
          finish(result);
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

    const finish = (result: HandoffResult | null) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    promptUser();
  });
}
