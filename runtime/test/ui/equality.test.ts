import assert from 'node:assert';
import { areFlowRunsEqual } from '../../ui/src/equality.js';
import type { ConsentMode, FlowRun } from '../../ui/src/types.js';

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
    readyNodes: [],
    runningNodes: [],
    awaitingHumanNodes: {
      'owner-intake': { role: 'Owner', reason: 'prompt-human' },
    },
    completedNodes: [],
    completedEdgeArtifacts: {},
    pendingNodeArtifacts: {},
    status: 'awaiting_human',
    stateVersion: '7',
    consentState: {
      mode,
      fileWrites: { allowAllEditsThisFlow: false },
      bash: { allowedCommands: {} },
    },
  };
}

console.log('\nui/equality');

test('areFlowRunsEqual detects consent mode changes', () => {
  assert.strictEqual(
    areFlowRunsEqual(flowWithConsent('partial-access'), flowWithConsent('no-access')),
    false
  );
});

test('areFlowRunsEqual detects stored bash consent changes', () => {
  const left = flowWithConsent('partial-access');
  const right = flowWithConsent('partial-access');
  right.consentState!.bash.allowedCommands['npm test'] = {
    command: 'npm test',
    grantedAt: '2026-05-03T00:00:00.000Z',
  };

  assert.strictEqual(areFlowRunsEqual(left, right), false);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
