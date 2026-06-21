import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Writable } from 'node:stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GatewayTurnResult, OperatorRenderSink } from '../../src/common/types.js';
import { runRoleTurn } from '../../src/common/role-turn.js';
import { HandoffParseError } from '../../src/orchestration/handoff.js';
import { LLMGateway, LLMGatewayError } from '../../src/providers/llm.js';
import { seedTestModelSettings } from '../integration/settings-test-utils.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';

const tempDirs = new Set<string>();
const flowRef = { projectNamespace: 'a-society', flowId: 'role-turn-flow' };

function createWorkspace(): string {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-role-turn-'));
  tempDirs.add(workspaceRoot);
  seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
  setWorkspaceRoot(workspaceRoot);
  return workspaceRoot;
}

function captureOutput(): { output: Writable; chunks: string[] } {
  const chunks: string[] = [];
  return {
    chunks,
    output: new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    }),
  };
}

function createRenderer(): OperatorRenderSink & { emit: ReturnType<typeof vi.fn> } {
  return {
    emit: vi.fn(),
    requestSent() {},
    receivingResponse() {},
    responseEnd() {},
    sendError() {},
  };
}

function mockGatewayTurn(result: GatewayTurnResult): void {
  vi.spyOn(LLMGateway.prototype, 'executeTurn').mockImplementation(async (_system, _history, options) => {
    options?.outputStream?.write(result.text);
    options?.onAssistantTextDelta?.(result.text);
    return result;
  });
}

describe('role-turn', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  it('returns null for empty history instead of auto-seeding a prompt', async () => {
    createWorkspace();
    const gatewaySpy = vi.spyOn(LLMGateway.prototype, 'executeTurn');

    const result = await runRoleTurn({
      roleInstanceId: 'curator',
      providedSystemPrompt: 'System prompt',
      flowRef,
      providedHistory: [],
    });

    expect(result).toBeNull();
    expect(gatewaySpy).not.toHaveBeenCalled();
  });

  it('returns awaiting_human and streams assistant text for prompt-human', async () => {
    createWorkspace();
    const { output, chunks } = captureOutput();
    mockGatewayTurn({ text: 'I need clarification. ```handoff\ntype: prompt-human\n```' });

    const result = await runRoleTurn({
      roleInstanceId: 'curator',
      providedSystemPrompt: 'System prompt',
      flowRef,
      providedHistory: [{ role: 'user', content: 'Who are you?' }],
      roleOutputStream: output,
    });

    expect(result).toEqual({ handoff: { kind: 'awaiting_human' } });
    expect(chunks.join('')).toContain('I need clarification.');
  });

  it('returns context usage without emitting a usage event itself', async () => {
    createWorkspace();
    const renderer = createRenderer();
    const { output, chunks } = captureOutput();
    mockGatewayTurn({
      text: 'I need clarification. ```handoff\ntype: prompt-human\n```',
      contextUsage: 46,
    });

    const result = await runRoleTurn({
      roleInstanceId: 'curator',
      providedSystemPrompt: 'System prompt',
      flowRef,
      providedHistory: [{ role: 'user', content: 'Who are you?' }],
      roleOutputStream: output,
      operatorRenderer: renderer,
    });

    expect(result).toEqual({
      handoff: { kind: 'awaiting_human' },
      contextUsage: 46,
    });
    expect(chunks).toEqual(['I need clarification. ```handoff\ntype: prompt-human\n```']);
    expect(renderer.emit).not.toHaveBeenCalled();
  });

  it('maps consent denial to awaiting_human with consent-denied reason', async () => {
    createWorkspace();
    vi.spyOn(LLMGateway.prototype, 'executeTurn').mockRejectedValue(
      new LLMGatewayError('CONSENT_DENIED', 'Operator denied consent.')
    );

    const result = await runRoleTurn({
      roleInstanceId: 'curator',
      providedSystemPrompt: 'System prompt',
      flowRef,
      providedHistory: [{ role: 'user', content: 'Write the file.' }],
    });

    expect(result).toEqual({
      handoff: { kind: 'awaiting_human' },
      awaitingHumanReason: 'consent-denied',
    });
  });

  it('does not emit usage events when handoff parsing fails', async () => {
    createWorkspace();
    const renderer = createRenderer();
    mockGatewayTurn({
      text: 'I broke the handoff. ```handoff\ntarget_node_id:\n```',
      contextUsage: 29,
    });

    await expect(runRoleTurn({
      roleInstanceId: 'curator',
      providedSystemPrompt: 'System prompt',
      flowRef,
      providedHistory: [{ role: 'user', content: 'Produce a handoff.' }],
      operatorRenderer: renderer,
    })).rejects.toBeInstanceOf(HandoffParseError);

    expect(renderer.emit).not.toHaveBeenCalled();
  });

  it('adds output-limit repair guidance to parse failures', async () => {
    createWorkspace();
    mockGatewayTurn({
      text: 'I started a large file but did not finish.',
      contextUsage: 8192,
      finishReason: 'length',
    });

    await expect(runRoleTurn({
      roleInstanceId: 'curator',
      providedSystemPrompt: 'System prompt',
      flowRef,
      providedHistory: [{ role: 'user', content: 'Produce a handoff.' }],
    })).rejects.toMatchObject({
      contextUsage: 8192,
      details: {
        operatorSummary: 'Model output limit reached before valid handoff',
        modelRepairMessage: expect.stringContaining('Continue from the interrupted point in smaller chunks.'),
      },
    });
  });
});
