import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';

async function runTest() {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'precreated-flow-required-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.a-society', 'state');

  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir, { recursive: true });

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());

  try {
    SessionStore.init(workspaceRoot);

    await expect(orchestrator.runStoredFlow(
      workspaceRoot,
      projectNamespace,
      'nonexistent-flow'
    )).rejects.toThrow(/No active flow state found\. Create and persist a draft flow before starting orchestration\./);
  } finally {
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }

}

it('requires a persisted draft flow before running stored orchestration', async () => {
  await runTest();
});
