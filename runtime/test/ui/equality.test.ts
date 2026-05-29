import assert from 'node:assert';
import { areFlowRunsEqual } from '../../ui/src/equality.js';
import type { ConsentMode, FlowRun } from '../../ui/src/types.js';

import { CONSENT_MODE } from '../../src/common/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

function flowWithConsent(mode: ConsentMode): FlowRun {
  return {
    flowId: 'f1',
    workspaceRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './records/r1',
    runningNodes: [],
    awaitingHumanNodes: {
      'owner-intake': { role: 'owner', reason: 'prompt-human' },
    },
    pendingHumanInputs: {},
    completedNodes: [],
    completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    consentState: {
      mode,
      bash: { allowedCommands: {} },
    },
  };
}

console.log('\nui/equality');

test('areFlowRunsEqual detects consent mode changes', () => {
  assert.strictEqual(
    areFlowRunsEqual(flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS), flowWithConsent(CONSENT_MODE.NO_ACCESS)),
    false
  );
});

test('areFlowRunsEqual detects stored bash consent changes', () => {
  const left = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
  const right = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
  right.consentState!.bash.allowedCommands['npm test'] = {
    command: 'npm test',
    grantedAt: '2026-05-03T00:00:00.000Z',
  };

  assert.strictEqual(areFlowRunsEqual(left, right), false);
});

test('areFlowRunsEqual detects queued human input changes', () => {
  const left = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
  const right = flowWithConsent(CONSENT_MODE.PARTIAL_ACCESS);
  right.pendingHumanInputs['owner-intake'] = {
    text: 'Proceed with the narrower option.',
    receivedAt: '2026-05-17T00:00:00.000Z',
  };

  assert.strictEqual(areFlowRunsEqual(left, right), false);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
