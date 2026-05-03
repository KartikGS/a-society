import assert from 'node:assert';
import { ConsentGateImpl, isAutoAllowedBashCommand } from '../../src/improvement/consent-gate.js';
import { normalizeConsentState } from '../../src/common/types.js';
import type { OperatorEvent } from '../../src/common/types.js';

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
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

function createGate() {
  const events: OperatorEvent[] = [];
  const gate = new ConsentGateImpl(undefined, {
    emit(event) {
      events.push(event);
    },
    startWait() {},
    stopWait() {},
  });
  return { gate, events };
}

console.log('\nconsent-gate');

await test('file write Allow is one-shot and does not persist an edit grant', async () => {
  const { gate, events } = createGate();

  const first = gate.check({ toolName: 'write_file', input: { path: 'a.txt' } });
  assert.deepStrictEqual(events[0], {
    kind: 'consent.requested',
    request: { kind: 'file-write', toolName: 'write_file', path: 'a.txt' },
  });

  gate.respond('allow_once');
  assert.strictEqual(await first, 'proceed');
  assert.strictEqual(gate.getState().fileWrites.allowAllEditsThisFlow, false);

  void gate.check({ toolName: 'write_file', input: { path: 'b.txt' } });
  assert.deepStrictEqual(events[2], {
    kind: 'consent.requested',
    request: { kind: 'file-write', toolName: 'write_file', path: 'b.txt' },
  });
  gate.respond('deny');
});

await test('Allow all edits this flow persists partial edit access', async () => {
  const { gate, events } = createGate();

  const first = gate.check({ toolName: 'edit_file', input: { path: 'a.txt' } });
  gate.respond('allow_flow');
  assert.strictEqual(await first, 'proceed');
  assert.strictEqual(gate.getState().mode, 'partial-access');
  assert.strictEqual(gate.getState().fileWrites.allowAllEditsThisFlow, true);

  const eventCount = events.length;
  assert.strictEqual(await gate.check({ toolName: 'write_file', input: { path: 'b.txt' } }), 'proceed');
  assert.strictEqual(events.length, eventCount);
});

await test('safe ls commands are auto-allowed without consent', async () => {
  const { gate, events } = createGate();

  assert.strictEqual(isAutoAllowedBashCommand('ls -la a-society/runtime'), true);
  assert.strictEqual(isAutoAllowedBashCommand('ls /tmp'), false);
  assert.strictEqual(isAutoAllowedBashCommand('ls && rm -rf a-society'), false);
  assert.strictEqual(
    await gate.check({ toolName: 'run_command', input: { command: 'ls -la a-society/runtime' } }),
    'proceed'
  );
  assert.strictEqual(events.length, 0);
});

await test('Allow command this flow persists only the exact bash command', async () => {
  const { gate, events } = createGate();

  const first = gate.check({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } });
  gate.respond('allow_flow');
  assert.strictEqual(await first, 'proceed');
  assert.strictEqual(gate.getState().mode, 'partial-access');
  assert.ok(gate.getState().bash.allowedCommands['npm test -- operator-feed']);

  const eventCount = events.length;
  assert.strictEqual(
    await gate.check({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }),
    'proceed'
  );
  assert.strictEqual(events.length, eventCount);

  void gate.check({ toolName: 'run_command', input: { command: 'npm test -- unified-routing' } });
  assert.deepStrictEqual(events[eventCount], {
    kind: 'consent.requested',
    request: { kind: 'bash-command', toolName: 'run_command', command: 'npm test -- unified-routing' },
  });
  gate.respond('deny');
});

await test('no-access ignores stored partial grants', async () => {
  const { gate, events } = createGate();
  const first = gate.check({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } });
  gate.respond('allow_flow');
  assert.strictEqual(await first, 'proceed');

  gate.setMode('no-access');
  const eventCount = events.length;
  void gate.check({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } });
  assert.deepStrictEqual(events[eventCount], {
    kind: 'consent.requested',
    request: { kind: 'bash-command', toolName: 'run_command', command: 'npm test -- operator-feed' },
  });
  gate.respond('deny');
});

await test('full-access bypasses all consent prompts', async () => {
  const { gate, events } = createGate();
  gate.setMode('full-access');
  const eventCount = events.length;

  assert.strictEqual(await gate.check({ toolName: 'write_file', input: { path: 'a.txt' } }), 'proceed');
  assert.strictEqual(
    await gate.check({ toolName: 'run_command', input: { command: 'npm install' } }),
    'proceed'
  );
  assert.strictEqual(events.length, eventCount);
});

await test('old ask-shaped consent state hydrates to no-access', () => {
  assert.deepStrictEqual(
    normalizeConsentState({ mode: 'ask', fileWrites: 'granted', shellNetwork: 'granted' }),
    {
      mode: 'no-access',
      fileWrites: { allowAllEditsThisFlow: false },
      bash: { allowedCommands: {} },
    }
  );
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
