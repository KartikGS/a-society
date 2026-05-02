import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';

async function runTest() {
  console.log('Starting precreated-flow-required integration test...');

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'precreated-flow-required-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.state');

  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir);

  process.env.A_SOCIETY_STATE_DIR = testStateDir;

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());

  const inputStream = new PassThrough();
  const outputStream = new PassThrough();

  try {
    SessionStore.init();

    await assert.rejects(
      () => orchestrator.runStoredFlow(
        workspaceRoot,
        projectNamespace,
        'Owner',
        inputStream,
        outputStream
      ),
      /No active flow state found\. Create and persist a draft flow before starting orchestration\./
    );
  } finally {
    inputStream.destroy();
    outputStream.destroy();
    fs.rmSync(tmpBase, { recursive: true, force: true });
    delete process.env.A_SOCIETY_STATE_DIR;
  }

  console.log('Integration test PASSED.');
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
