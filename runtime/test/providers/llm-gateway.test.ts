import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LLMGateway, LLMGatewayError } from '../../src/providers/llm.js';
import { CONSENT_CHECK_RESULT, defaultConsentState } from '../../src/common/types.js';
import type {
  ConsentCheckRequest,
  ConsentCheckResult,
  ConsentGate,
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  LLMProvider,
  ProviderTurnResult,
  RuntimeMessageParam,
  ToolDefinition,
  TurnOptions,
} from '../../src/common/types.js';

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

class LateAbortTextProvider implements LLMProvider {
  constructor(private readonly abort: () => void) {}

  async executeTurn(
    _systemPrompt: string,
    _messages: RuntimeMessageParam[],
    _tools?: ToolDefinition[],
    _options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    this.abort();
    return {
      type: 'text',
      text: 'Partial answer without a handoff block'
    };
  }
}

class LateAbortToolCallProvider implements LLMProvider {
  constructor(private readonly abort: () => void) {}

  async executeTurn(
    _systemPrompt: string,
    _messages: RuntimeMessageParam[],
    _tools?: ToolDefinition[],
    _options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    this.abort();
    return {
      type: 'tool_calls',
      calls: [{ id: 'call_1', name: 'write_file', input: { path: 'plan.md', content: 'draft' } }],
      continuationMessages: [{
        role: 'assistant_tool_calls',
        calls: [{ id: 'call_1', name: 'write_file', input: { path: 'plan.md', content: 'draft' } }],
        text: 'I will write the plan now.',
      }]
    };
  }
}

class ToolCallThenTextProvider implements LLMProvider {
  public secondCallMessages: RuntimeMessageParam[] = [];
  private callCount = 0;

  constructor(
    private readonly writePath = 'plan.md',
    private readonly writeContent = 'draft'
  ) {}

  async executeTurn(
    _systemPrompt: string,
    messages: RuntimeMessageParam[],
    _tools?: ToolDefinition[],
    _options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    if (this.callCount === 0) {
      this.callCount++;
      return {
        type: 'tool_calls',
        calls: [{ id: 'call_1', name: 'write_file', input: { path: this.writePath, content: this.writeContent } }],
      continuationMessages: [{
        role: 'assistant_tool_calls',
        calls: [{ id: 'call_1', name: 'write_file', input: { path: this.writePath, content: this.writeContent } }],
        text: 'I will write the plan now.',
        }]
      };
    }

    this.secondCallMessages = [...messages];
    return { type: 'text', text: 'Done.' };
  }
}

class BlockingConsentGate implements ConsentGate {
  public requests: ConsentCheckRequest[] = [];
  private checkedResolve!: () => void;
  private decisionResolve: ((result: ConsentCheckResult) => void) | null = null;

  public readonly checked = new Promise<void>((resolve) => {
    this.checkedResolve = resolve;
  });

  check(request: ConsentCheckRequest): Promise<ConsentCheckResult> {
    this.requests.push(request);
    this.checkedResolve();
    return new Promise<ConsentCheckResult>((resolve) => {
      this.decisionResolve = resolve;
    });
  }

  resolve(decision: ConsentCheckResult): void {
    this.decisionResolve?.(decision);
  }

  respond(_decision: ConsentResponseDecision, _role: string): void {}
  setMode(_mode: ConsentMode): void {}
  getState() { return defaultConsentState(); }
  getInFlightRequests(): ConsentRequest[] { return []; }
}

console.log('\nllm-gateway');

await test('late abort after streamed text returns is still treated as aborted', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  const controller = new AbortController();
  const gateway = new LLMGateway({
    mode: 'system',
    workspaceRoot: tmpDir,
    provider: new LateAbortTextProvider(() => controller.abort()),
  });

  await assert.rejects(
    () => gateway.executeTurn(
      'System prompt',
      [{ role: 'user', content: 'Please produce a handoff.' }],
      { signal: controller.signal }
    ),
    (error: unknown) => {
      assert.ok(error instanceof LLMGatewayError);
      assert.strictEqual(error.type, 'ABORTED');
      assert.strictEqual(error.partialText, 'Partial answer without a handoff block');
      return true;
    }
  );
});

await test('tool-call continuation and denial result are recorded before consent-denied suspension', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  const provider = new ToolCallThenTextProvider('demo-project/plan.md');
  const gateway = new LLMGateway({
    mode: 'project',
    workspaceRoot: tmpDir,
    flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
    provider,
  });
  const gate = new BlockingConsentGate();
  const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please create the plan.' }];
  const persistedBatches: RuntimeMessageParam[][] = [];

  const pendingTurn = gateway.executeTurn('System prompt', history, {
    consentGate: gate,
    roleInstanceId: 'curator',
    nodeId: 'curator-registration',
    onConversationMessages: (messages) => {
      persistedBatches.push([...messages]);
    },
  });

  await gate.checked;

  assert.deepStrictEqual(gate.requests[0], {
    toolName: 'write_file',
    input: { path: 'demo-project/plan.md', content: 'draft' },
    role: 'curator',
    nodeId: 'curator-registration',
  });
  assert.strictEqual(history.length, 2);
  assert.strictEqual(history[1].role, 'assistant_tool_calls');
  assert.strictEqual(history[1].text, 'I will write the plan now.');
  assert.strictEqual(persistedBatches.length, 1);
  assert.strictEqual(persistedBatches[0][0].role, 'assistant_tool_calls');

  gate.resolve(CONSENT_CHECK_RESULT.DENY);
  await assert.rejects(
    pendingTurn,
    (error: unknown) => {
      assert.ok(error instanceof LLMGatewayError);
      assert.strictEqual(error.type, 'CONSENT_DENIED');
      return true;
    }
  );
  assert.strictEqual(history.length, 3);
  assert.strictEqual(history[2].role, 'tool_result');
  assert.match(history[2].content, /denied/i);
  assert.strictEqual(persistedBatches.length, 2);
  assert.strictEqual(persistedBatches[1][0].role, 'tool_result');
  assert.deepStrictEqual(provider.secondCallMessages, []);
});

await test('late abort after streamed tool-call text keeps the attempted tool call in history', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  const controller = new AbortController();
  const gateway = new LLMGateway({
    mode: 'project',
    workspaceRoot: tmpDir,
    flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
    provider: new LateAbortToolCallProvider(() => controller.abort()),
  });
  const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please create the plan.' }];

  await assert.rejects(
    () => gateway.executeTurn(
      'System prompt',
      history,
      { signal: controller.signal }
    ),
    (error: unknown) => {
      assert.ok(error instanceof LLMGatewayError);
      assert.strictEqual(error.type, 'ABORTED');
      return true;
    }
  );

  assert.strictEqual(history.length, 2);
  assert.strictEqual(history[1].role, 'assistant_tool_calls');
  assert.strictEqual(history[1].text, 'I will write the plan now.');
});

await test('project-scoped gateway allows feedback writes outside the active project directory', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
  const provider = new ToolCallThenTextProvider('a-society/feedback/demo-flow.md', '# Feedback\n');
  const gateway = new LLMGateway({
    mode: 'project',
    workspaceRoot: tmpDir,
    flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
    provider,
  });
  const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please write feedback.' }];

  await gateway.executeTurn('System prompt', history);

  assert.strictEqual(
    fs.readFileSync(path.join(tmpDir, 'a-society', 'feedback', 'demo-flow.md'), 'utf8'),
    '# Feedback\n'
  );
  assert.strictEqual(history.at(-1)?.role, 'tool_result');
  assert.match((history.at(-1) as any).content, /OK: wrote/);
});

await test('project-scoped gateway allows writes to the active state record folder only', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
  const recordFolderPath = path.join(tmpDir, '.a-society', 'state', 'demo-project', 'flow-1', 'record');
  const provider = new ToolCallThenTextProvider('.a-society/state/demo-project/flow-1/record/01-note.md', '# Note\n');
  const gateway = new LLMGateway({
    mode: 'project',
    workspaceRoot: tmpDir,
    flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
    provider,
  });
  const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please write a record artifact.' }];

  await gateway.executeTurn('System prompt', history);

  assert.strictEqual(
    fs.readFileSync(path.join(recordFolderPath, '01-note.md'), 'utf8'),
    '# Note\n'
  );
  assert.strictEqual(history.at(-1)?.role, 'tool_result');
  assert.match((history.at(-1) as any).content, /OK: wrote/);
});

await test('project-scoped gateway blocks writes to flow state outside the active record folder', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
  const recordFolderPath = path.join(tmpDir, '.a-society', 'state', 'demo-project', 'flow-1', 'record');
  const provider = new ToolCallThenTextProvider('.a-society/state/demo-project/flow-1/flow.json', '{}');
  const gateway = new LLMGateway({
    mode: 'project',
    workspaceRoot: tmpDir,
    flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
    provider,
  });
  const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please write flow state.' }];

  await gateway.executeTurn('System prompt', history);

  assert.strictEqual(fs.existsSync(path.join(tmpDir, '.a-society', 'state', 'demo-project', 'flow-1', 'flow.json')), false);
  assert.strictEqual(history.at(-1)?.role, 'tool_result');
  assert.match((history.at(-1) as any).content, /outside the permitted write area/);
});

await test('project-scoped gateway still blocks writes to sibling projects', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
  const provider = new ToolCallThenTextProvider('other-project/file.md', 'nope');
  const gateway = new LLMGateway({
    mode: 'project',
    workspaceRoot: tmpDir,
    flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
    provider,
  });
  const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please write elsewhere.' }];

  await gateway.executeTurn('System prompt', history);

  assert.strictEqual(fs.existsSync(path.join(tmpDir, 'other-project', 'file.md')), false);
  assert.strictEqual(history.at(-1)?.role, 'tool_result');
  assert.match((history.at(-1) as any).content, /outside the permitted write area/);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
