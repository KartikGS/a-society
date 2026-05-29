import assert from 'node:assert';
import type { FlowRun } from '../../src/common/types.js';

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

console.log('\ntypes');

test('FlowRun: conforms to new multi-node structure', () => {
  const flowRun: FlowRun = {
    flowId: 'f1',
    workspaceRoot: '.',
    projectNamespace: 'test-project',
    recordFolderPath: './.a-society/state/test-project/f1/record',
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedNodes: [],
    completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION
  };

  assert.strictEqual(flowRun.runningNodes.length, 0);
  assert.strictEqual(flowRun.completedNodes.length, 0);
  assert.deepStrictEqual(flowRun.receivingHandoff, {});
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
