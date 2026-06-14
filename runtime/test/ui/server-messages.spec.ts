import { describe, expect, it, vi } from 'vitest';
import { createFlowUiState, type FlowUiState } from '../../ui/src/app/flow-ui.js';
import { handleServerMessage, type ServerMessageHandlers } from '../../ui/src/app/server-messages.js';
import type { FlowRef } from '../../ui/src/types.js';

function createHandlers(stateRef: { current: FlowUiState }): ServerMessageHandlers {
  return {
    updateFlowUi: (_key, updater) => {
      stateRef.current = updater(stateRef.current);
    },
    ensureTab: vi.fn(),
    setProjectFlows: vi.fn(),
    setSelectorError: vi.fn(),
    refreshProjectFlows: vi.fn(),
    showToast: vi.fn(),
  };
}

describe('ui/server-messages', () => {
  it('routes MCP notices into the role feed instead of the toast surface', () => {
    const ref: FlowRef = { projectNamespace: 'test', flowId: 'flow-1' };
    const stateRef = { current: createFlowUiState() };
    const handlers = createHandlers(stateRef);

    handleServerMessage({
      type: 'operator_event',
      flowRef: ref,
      event: {
        kind: 'mcp.server_unavailable',
        role: 'owner',
        nodeId: 'owner-intake',
        serverName: 'github',
        reason: 'fetch failed',
      },
    }, handlers);
    handleServerMessage({
      type: 'operator_event',
      flowRef: ref,
      event: {
        kind: 'mcp.tool_unavailable',
        role: 'owner',
        nodeId: 'owner-intake',
        serverName: 'github',
        toolName: 'oversized_tool',
        reason: 'tool name is too long',
      },
    }, handlers);

    expect(stateRef.current.roleFeeds.owner).toEqual([
      expect.objectContaining({
        type: 'tool-error',
        label: 'MCP',
        text: 'github unavailable: fetch failed',
      }),
      expect.objectContaining({
        type: 'tool-error',
        label: 'MCP',
        text: 'github.oversized_tool skipped: tool name is too long',
      }),
    ]);
    expect(handlers.showToast).not.toHaveBeenCalled();
  });
});
