import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { LLMGateway, LLMGatewayError } from '../../src/providers/llm.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { CONSENT_CHECK_RESULT, defaultConsentState } from '../../src/common/types.js';
import { CONSENT_RESPONSE_DECISION } from '../../shared/protocol-constants.js';
import { ConsentGateImpl } from '../../src/improvement/consent-gate.js';
import { staleWriteMessage } from '../../src/tools/file-executor.js';
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
      text: 'Partial answer without a handoff block',
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
      }],
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
        }],
      };
    }

    this.secondCallMessages = [...messages];
    return { type: 'text', text: 'Done.' };
  }
}

class RecordingOptionsProvider implements LLMProvider {
  public optionsSeen: TurnOptions[] = [];

  async executeTurn(
    _systemPrompt: string,
    _messages: RuntimeMessageParam[],
    _tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    this.optionsSeen.push({ ...(options ?? {}) });
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

const tempDirs = new Set<string>();

function createTempWorkspace(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  tempDirs.add(dir);
  setWorkspaceRoot(dir);
  return dir;
}

async function expectGatewayError(
  promise: Promise<unknown>,
  type: LLMGatewayError['type']
): Promise<LLMGatewayError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(LLMGatewayError);
    const gatewayError = error as LLMGatewayError;
    expect(gatewayError.type).toBe(type);
    return gatewayError;
  }
  throw new Error(`Expected LLMGatewayError(${type}) to be thrown.`);
}

describe('LLMGateway', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  it('treats a late abort after streamed text returns as aborted', async () => {
    createTempWorkspace();
    const controller = new AbortController();
    const gateway = new LLMGateway({
      mode: 'system',
      provider: new LateAbortTextProvider(() => controller.abort()),
    });

    const error = await expectGatewayError(
      gateway.executeTurn(
        'System prompt',
        [{ role: 'user', content: 'Please produce a handoff.' }],
        { signal: controller.signal }
      ),
      'ABORTED'
    );
    expect(error.partialText).toBe('Partial answer without a handoff block');
  });

  it('defaults prompt caching on for project turns and off for system turns', async () => {
    createTempWorkspace();
    const projectProvider = new RecordingOptionsProvider();
    const projectGateway = new LLMGateway({
      mode: 'project',
      flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
      provider: projectProvider,
    });

    await projectGateway.executeTurn('System prompt', [{ role: 'user', content: 'Hello.' }]);

    const systemProvider = new RecordingOptionsProvider();
    const systemGateway = new LLMGateway({
      mode: 'system',
      provider: systemProvider,
    });

    await systemGateway.executeTurn('System prompt', [{ role: 'user', content: 'Hello.' }]);

    expect(projectProvider.optionsSeen[0]?.cacheTurn).toBe(true);
    expect(systemProvider.optionsSeen[0]?.cacheTurn).toBe(false);
  });

  it('lets explicit prompt-cache turn options override the gateway mode default', async () => {
    createTempWorkspace();
    const provider = new RecordingOptionsProvider();
    const gateway = new LLMGateway({
      mode: 'project',
      flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
      provider,
    });

    await gateway.executeTurn('System prompt', [{ role: 'user', content: 'Hello.' }], { cacheTurn: false });

    expect(provider.optionsSeen[0]?.cacheTurn).toBe(false);
  });

  it('records tool-call continuation and denial result before consent-denied suspension', async () => {
    createTempWorkspace();
    const provider = new ToolCallThenTextProvider('demo-project/plan.md');
    const gateway = new LLMGateway({
      mode: 'project',
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

    expect(gate.requests[0]).toEqual({
      toolName: 'write_file',
      input: { path: 'demo-project/plan.md', content: 'draft' },
      role: 'curator',
      nodeId: 'curator-registration',
      preview: { path: 'demo-project/plan.md', before: null, after: 'draft', origin: 'runtime-write' },
    });
    expect(history).toHaveLength(2);
    expect(history[1]).toMatchObject({
      role: 'assistant_tool_calls',
      text: 'I will write the plan now.',
    });
    expect(persistedBatches).toHaveLength(1);
    expect(persistedBatches[0][0]).toMatchObject({ role: 'assistant_tool_calls' });

    gate.resolve(CONSENT_CHECK_RESULT.DENY);
    await expectGatewayError(pendingTurn, 'CONSENT_DENIED');
    expect(history).toHaveLength(3);
    expect(history[2]).toMatchObject({
      role: 'tool_result',
      content: expect.stringMatching(/denied/i),
    });
    expect(persistedBatches).toHaveLength(2);
    expect(persistedBatches[1][0]).toMatchObject({ role: 'tool_result' });
    expect(provider.secondCallMessages).toEqual([]);
  });

  it('prompts a write with a runtime-write preview and applies exactly the previewed content', async () => {
    const tmpDir = createTempWorkspace();
    fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'demo-project', 'plan.md'), 'old plan\n');
    const gateway = new LLMGateway({
      mode: 'project',
      flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
      provider: new ToolCallThenTextProvider('demo-project/plan.md', 'new plan\n'),
    });
    const requested: ConsentRequest[] = [];
    const served: unknown[] = [];
    const gate: ConsentGateImpl = new ConsentGateImpl(defaultConsentState(), {
      emit(event) {
        if (event.kind !== 'consent.requested') return;
        requested.push(event.request);
        if (event.request.kind === 'file-write' && event.request.preview) {
          served.push(gate.getChangePreview(event.request.preview.id)?.change);
        }
        queueMicrotask(() => gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_ONCE, event.request.role));
      },
      requestSent() {},
      receivingResponse() {},
      responseEnd() {},
      sendError() {},
    });
    const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Update the plan.' }];

    await gateway.executeTurn('System prompt', history, { consentGate: gate, roleInstanceId: 'owner', nodeId: 'owner-intake' });

    expect(requested[0]).toMatchObject({ kind: 'file-write', preview: { changeKind: 'modify', origin: 'runtime-write' } });
    expect(served).toEqual([{ path: 'demo-project/plan.md', before: 'old plan\n', after: 'new plan\n', origin: 'runtime-write' }]);
    expect(fs.readFileSync(path.join(tmpDir, 'demo-project', 'plan.md'), 'utf8')).toBe('new plan\n');
  });

  it('does not apply an approved write when the file changed while the prompt was pending', async () => {
    const tmpDir = createTempWorkspace();
    fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
    const target = path.join(tmpDir, 'demo-project', 'plan.md');
    fs.writeFileSync(target, 'old plan\n');
    const provider = new ToolCallThenTextProvider('demo-project/plan.md', 'new plan\n');
    const gateway = new LLMGateway({
      mode: 'project',
      flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
      provider,
    });
    const gate = new BlockingConsentGate();
    const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Update the plan.' }];
    const pendingTurn = gateway.executeTurn('System prompt', history, { consentGate: gate, roleInstanceId: 'owner', nodeId: 'owner-intake' });

    await gate.checked;
    fs.writeFileSync(target, 'someone else\n');
    gate.resolve(CONSENT_CHECK_RESULT.PROCEED);
    await pendingTurn;

    expect(fs.readFileSync(target, 'utf8')).toBe('someone else\n');
    expect(provider.secondCallMessages.at(-1)).toMatchObject({
      role: 'tool_result',
      content: staleWriteMessage('demo-project/plan.md'),
      isError: true,
    });
  });

  it('keeps the attempted tool call in history after a late abort from streamed tool-call text', async () => {
    createTempWorkspace();
    const controller = new AbortController();
    const gateway = new LLMGateway({
      mode: 'project',
      flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
      provider: new LateAbortToolCallProvider(() => controller.abort()),
    });
    const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please create the plan.' }];

    await expectGatewayError(
      gateway.executeTurn(
        'System prompt',
        history,
        { signal: controller.signal }
      ),
      'ABORTED'
    );

    expect(history).toHaveLength(2);
    expect(history[1]).toMatchObject({
      role: 'assistant_tool_calls',
      text: 'I will write the plan now.',
    });
  });

  it('allows feedback writes when the feedback folder is passed as an extra write root', async () => {
    const tmpDir = createTempWorkspace();
    fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
    const provider = new ToolCallThenTextProvider('.a-society/feedback/demo-flow.md', '# Feedback\n');
    const gateway = new LLMGateway({
      mode: 'project',
      flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
      provider,
      extraWriteRoots: [path.join(tmpDir, '.a-society', 'feedback')],
    });
    const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please write feedback.' }];

    await gateway.executeTurn('System prompt', history);

    expect(fs.readFileSync(path.join(tmpDir, '.a-society', 'feedback', 'demo-flow.md'), 'utf8')).toBe('# Feedback\n');
    expect(history.at(-1)).toMatchObject({
      role: 'tool_result',
      content: expect.stringMatching(/OK: wrote/),
    });
  });

  it('allows writes to the active state record folder only', async () => {
    const tmpDir = createTempWorkspace();
    fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
    const recordFolderPath = path.join(tmpDir, '.a-society', 'state', 'demo-project', 'flow-1', 'record');
    const provider = new ToolCallThenTextProvider('.a-society/state/demo-project/flow-1/record/01-note.md', '# Note\n');
    const gateway = new LLMGateway({
      mode: 'project',
      flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
      provider,
    });
    const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please write a record artifact.' }];

    await gateway.executeTurn('System prompt', history);

    expect(fs.readFileSync(path.join(recordFolderPath, '01-note.md'), 'utf8')).toBe('# Note\n');
    expect(history.at(-1)).toMatchObject({
      role: 'tool_result',
      content: expect.stringMatching(/OK: wrote/),
    });
  });

  it('blocks writes to flow state outside the active record folder', async () => {
    const tmpDir = createTempWorkspace();
    fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
    const provider = new ToolCallThenTextProvider('.a-society/state/demo-project/flow-1/flow.json', '{}');
    const gateway = new LLMGateway({
      mode: 'project',
      flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
      provider,
    });
    const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please write flow state.' }];

    await gateway.executeTurn('System prompt', history);

    expect(fs.existsSync(path.join(tmpDir, '.a-society', 'state', 'demo-project', 'flow-1', 'flow.json'))).toBe(false);
    expect(history.at(-1)).toMatchObject({
      role: 'tool_result',
      content: expect.stringMatching(/outside the permitted write area/),
    });
  });

  it('still blocks writes to sibling projects', async () => {
    const tmpDir = createTempWorkspace();
    fs.mkdirSync(path.join(tmpDir, 'demo-project'), { recursive: true });
    const provider = new ToolCallThenTextProvider('other-project/file.md', 'nope');
    const gateway = new LLMGateway({
      mode: 'project',
      flowRef: { projectNamespace: 'demo-project', flowId: 'flow-1' },
      provider,
    });
    const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please write elsewhere.' }];

    await gateway.executeTurn('System prompt', history);

    expect(fs.existsSync(path.join(tmpDir, 'other-project', 'file.md'))).toBe(false);
    expect(history.at(-1)).toMatchObject({
      role: 'tool_result',
      content: expect.stringMatching(/outside the permitted write area/),
    });
  });
});
