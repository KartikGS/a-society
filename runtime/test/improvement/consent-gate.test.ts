import assert from 'node:assert';
import { ConsentGateImpl, isAutoAllowedBashCommand } from '../../src/improvement/consent-gate.js';
import { normalizeConsentState } from '../../src/common/types.js';
import type { ConsentCheckRequest, OperatorEvent } from '../../src/common/types.js';

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
    requestSent() {},
    receivingResponse() {},
    responseEnd() {},
    sendError() {},
  });
  return { gate, events };
}

function request(overrides: Partial<ConsentCheckRequest>): ConsentCheckRequest {
  return {
    toolName: 'write_file',
    input: { path: 'a.txt' },
    nodeId: 'test-node',
    role: 'Tester',
    ...overrides,
  };
}

console.log('\nconsent-gate');

await test('file write allow_once is one-shot and next write still prompts', async () => {
  const { gate, events } = createGate();

  const first = gate.check(request({ toolName: 'write_file', input: { path: 'a.txt' } }));
  assert.deepStrictEqual(events[0], {
    kind: 'consent.requested',
    request: { kind: 'file-write', toolName: 'write_file', path: 'a.txt', nodeId: 'test-node', role: 'Tester' },
  });

  gate.respond('allow_once', 'Tester');
  assert.strictEqual(await first, 'proceed');
  assert.strictEqual(gate.getState().mode, 'no-access');

  void gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' } }));
  assert.deepStrictEqual(events[2], {
    kind: 'consent.requested',
    request: { kind: 'file-write', toolName: 'write_file', path: 'b.txt', nodeId: 'test-node', role: 'Tester' },
  });
  gate.respond('deny', 'Tester');
});

await test('partial-access mode allows all file writes without prompting', async () => {
  const { gate, events } = createGate();

  gate.setMode('partial-access');
  const eventCount = events.length;
  assert.strictEqual(await gate.check(request({ toolName: 'edit_file', input: { path: 'a.txt' } })), 'proceed');
  assert.strictEqual(await gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' } })), 'proceed');
  assert.strictEqual(events.length, eventCount);
});

await test('allow_flow on file write switches mode to partial-access', async () => {
  const { gate } = createGate();

  const first = gate.check(request({ toolName: 'edit_file', input: { path: 'a.txt' } }));
  gate.respond('allow_flow', 'Tester');
  assert.strictEqual(await first, 'proceed');
  assert.strictEqual(gate.getState().mode, 'partial-access');

  assert.strictEqual(await gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' } })), 'proceed');
});

await test('consent requests preserve node and role metadata', async () => {
  const { gate, events } = createGate();

  void gate.check({
    toolName: 'edit_file',
    input: { path: 'a-society/index.md' },
    nodeId: 'curator-public-registration',
    role: 'Curator',
  });

  assert.deepStrictEqual(events[0], {
    kind: 'consent.requested',
    request: {
      kind: 'file-write',
      toolName: 'edit_file',
      path: 'a-society/index.md',
      nodeId: 'curator-public-registration',
      role: 'Curator',
    },
  });

  gate.respond('deny', 'Curator');
});

await test('one consent request can be in-flight per role', async () => {
  const { gate, events } = createGate();

  let curatorResolved = false;
  const curator = gate.check({
    toolName: 'edit_file',
    input: { path: 'public.md' },
    nodeId: 'curator-public',
    role: 'Curator_1',
  }).then((result) => {
    curatorResolved = true;
    return result;
  });
  const reviewer = gate.check({
    toolName: 'write_file',
    input: { path: 'internal.md' },
    nodeId: 'reviewer-internal',
    role: 'Reviewer',
  });

  assert.deepStrictEqual(events.slice(0, 2).map((event) => (
    event.kind === 'consent.requested' ? event.request.role : null
  )), ['Curator_1', 'Reviewer']);
  assert.strictEqual(gate.getInFlightRequests().length, 2);

  gate.respond('allow_once', 'reviewer');
  assert.strictEqual(await reviewer, 'proceed');
  assert.strictEqual(curatorResolved, false);

  gate.respond('deny', 'Curator_1');
  assert.strictEqual(await curator, 'deny');
});


await test('Allow all edits this flow resolves other visible file-write requests', async () => {
  const { gate, events } = createGate();

  const curator = gate.check(request({ toolName: 'edit_file', input: { path: 'a.txt' }, nodeId: 'curator-node', role: 'Curator_1' }));
  const reviewer = gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' }, nodeId: 'reviewer-node', role: 'Reviewer' }));

  assert.strictEqual(gate.getInFlightRequests().length, 2);

  gate.respond('allow_flow', 'curator-1');

  assert.strictEqual(await curator, 'proceed');
  assert.strictEqual(await reviewer, 'proceed');
  assert.strictEqual(gate.getInFlightRequests().length, 0);
  assert.deepStrictEqual(
    events
      .filter((event) => event.kind === 'consent.resolved')
      .map((event) => event.kind === 'consent.resolved' ? event.request.role : null),
    ['Curator_1', 'Reviewer']
  );
});

await test('safe ls commands are auto-allowed without consent', async () => {
  const { gate, events } = createGate();

  assert.strictEqual(isAutoAllowedBashCommand('ls -la a-society/runtime'), true);
  assert.strictEqual(isAutoAllowedBashCommand('ls /tmp'), false);
  assert.strictEqual(isAutoAllowedBashCommand('ls && rm -rf a-society'), false);
  assert.strictEqual(
    await gate.check(request({ toolName: 'run_command', input: { command: 'ls -la a-society/runtime' } })),
    'proceed'
  );
  assert.strictEqual(events.length, 0);
});

await test('Allow command this flow persists only the exact bash command', async () => {
  const { gate, events } = createGate();

  const first = gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }));
  gate.respond('allow_flow', 'Tester');
  assert.strictEqual(await first, 'proceed');
  assert.strictEqual(gate.getState().mode, 'partial-access');
  assert.ok(gate.getState().bash.allowedCommands['npm test -- operator-feed']);

  const eventCount = events.length;
  assert.strictEqual(
    await gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } })),
    'proceed'
  );
  assert.strictEqual(events.length, eventCount);

  void gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- unified-routing' } }));
  assert.deepStrictEqual(events[eventCount], {
    kind: 'consent.requested',
    request: { kind: 'bash-command', toolName: 'run_command', command: 'npm test -- unified-routing', nodeId: 'test-node', role: 'Tester' },
  });
  gate.respond('deny', 'Tester');
});

await test('no-access ignores stored partial grants', async () => {
  const { gate, events } = createGate();
  const first = gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }));
  gate.respond('allow_flow', 'Tester');
  assert.strictEqual(await first, 'proceed');

  gate.setMode('no-access');
  const eventCount = events.length;
  void gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }));
  assert.deepStrictEqual(events[eventCount], {
    kind: 'consent.requested',
    request: { kind: 'bash-command', toolName: 'run_command', command: 'npm test -- operator-feed', nodeId: 'test-node', role: 'Tester' },
  });
  gate.respond('deny', 'Tester');
});

await test('full-access bypasses all consent prompts', async () => {
  const { gate, events } = createGate();
  gate.setMode('full-access');
  const eventCount = events.length;

  assert.strictEqual(await gate.check(request({ toolName: 'write_file', input: { path: 'a.txt' } })), 'proceed');
  assert.strictEqual(
    await gate.check(request({ toolName: 'run_command', input: { command: 'npm install' } })),
    'proceed'
  );
  assert.strictEqual(events.length, eventCount);
});

await test('old ask-shaped consent state hydrates to no-access', () => {
  assert.deepStrictEqual(
    normalizeConsentState({ mode: 'ask', fileWrites: 'granted', shellNetwork: 'granted' }),
    {
      mode: 'no-access',
      bash: { allowedCommands: {} },
    }
  );
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
