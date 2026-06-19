import { describe, expect, it } from 'vitest';
import { areFlowRunsEqual } from '../../ui/src/equality.js';
import type { ConsentMode, FlowRun } from '../../ui/src/types.js';
import { CONSENT_MODE } from '../../shared/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';

function flowWithConsent(mode: ConsentMode): FlowRun {
  return {
    flowId: 'f1',
    workspaceRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './.a-society/state/test-project/f1/record',
    runningNodes: [],
    awaitingHumanNodes: {
      'owner-intake': { role: 'owner', reason: 'prompt-human' },
    },
    pendingHumanInputs: {},
    completedHandoffs: [],
    visitedNodeIds: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    consentState: {
      mode,
      bash: { allowedCommands: {} },
      mcp: { allowedTools: {} },
    },
  };
}

describe('ui/equality', () => {
  it('detects consent mode changes', () => {
    expect(areFlowRunsEqual(
      flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS),
      flowWithConsent(CONSENT_MODE.NO_ACCESS)
    )).toBe(false);
  });

  it('detects stored bash consent changes', () => {
    const left = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
    const right = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
    right.consentState!.bash.allowedCommands['npm test'] = {
      command: 'npm test',
      grantedAt: '2026-05-03T00:00:00.000Z',
    };

    expect(areFlowRunsEqual(left, right)).toBe(false);
  });

  it('detects stored MCP consent changes', () => {
    const left = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
    const right = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
    right.consentState!.mcp.allowedTools.mcp__linear__create_issue = {
      toolName: 'mcp__linear__create_issue',
      grantedAt: '2026-05-03T00:00:00.000Z',
    };

    expect(areFlowRunsEqual(left, right)).toBe(false);
  });

  it('detects queued human input changes', () => {
    const left = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
    const right = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
    right.pendingHumanInputs['owner-intake'] = {
      text: 'Proceed with the narrower option.',
      receivedAt: '2026-05-17T00:00:00.000Z',
    };

    expect(areFlowRunsEqual(left, right)).toBe(false);
  });
});
