import assert from 'node:assert';
import { ConsentGateImpl, isAutoAllowedBashCommand } from '../../src/improvement/consent-gate.js';
import {
  CONSENT_MODE,
  CONSENT_RESPONSE_DECISION,
} from '../../src/common/protocol-constants.js';
import { CONSENT_CHECK_RESULT, normalizeConsentState } from '../../src/common/types.js';
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
    role: 'tester',
    ...overrides,
  };
}

console.log('\nconsent-gate');

await test('file write allow_once is one-shot and next write still prompts', async () => {
  const { gate, events } = createGate();

  const first = gate.check(request({ toolName: 'write_file', input: { path: 'a.txt' } }));
  assert.deepStrictEqual(events[0], {
    kind: 'consent.requested',
    request: { kind: 'file-write', toolName: 'write_file', path: 'a.txt', nodeId: 'test-node', role: 'tester' },
  });

  gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_ONCE, 'tester');
  assert.strictEqual(await first, CONSENT_CHECK_RESULT.PROCEED);
  assert.strictEqual(gate.getState().mode, CONSENT_MODE.NO_ACCESS);

  void gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' } }));
  assert.deepStrictEqual(events[2], {
    kind: 'consent.requested',
    request: { kind: 'file-write', toolName: 'write_file', path: 'b.txt', nodeId: 'test-node', role: 'tester' },
  });
  gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'tester');
});

await test('partial-access mode allows all file writes without prompting', async () => {
  const { gate, events } = createGate();

  gate.setMode(CONSENT_MODE.PARTIAL_ACCESS);
  const eventCount = events.length;
  assert.strictEqual(await gate.check(request({ toolName: 'edit_file', input: { path: 'a.txt' } })), CONSENT_CHECK_RESULT.PROCEED);
  assert.strictEqual(await gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' } })), CONSENT_CHECK_RESULT.PROCEED);
  assert.strictEqual(events.length, eventCount);
});

await test('allow_flow on file write switches mode to partial-access', async () => {
  const { gate } = createGate();

  const first = gate.check(request({ toolName: 'edit_file', input: { path: 'a.txt' } }));
  gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_FLOW, 'tester');
  assert.strictEqual(await first, CONSENT_CHECK_RESULT.PROCEED);
  assert.strictEqual(gate.getState().mode, CONSENT_MODE.PARTIAL_ACCESS);

  assert.strictEqual(await gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' } })), CONSENT_CHECK_RESULT.PROCEED);
});

await test('consent requests preserve node and role metadata', async () => {
  const { gate, events } = createGate();

  void gate.check({
    toolName: 'edit_file',
    input: { path: 'a-society/index.md' },
    nodeId: 'curator-public-registration',
    role: 'curator',
  });

  assert.deepStrictEqual(events[0], {
    kind: 'consent.requested',
    request: {
      kind: 'file-write',
      toolName: 'edit_file',
      path: 'a-society/index.md',
      nodeId: 'curator-public-registration',
      role: 'curator',
    },
  });

  gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'curator');
});

await test('one consent request can be in-flight per role', async () => {
  const { gate, events } = createGate();

  let curatorResolved = false;
  const curator = gate.check({
    toolName: 'edit_file',
    input: { path: 'public.md' },
    nodeId: 'curator-public',
    role: 'curator_1',
  }).then((result) => {
    curatorResolved = true;
    return result;
  });
  const reviewer = gate.check({
    toolName: 'write_file',
    input: { path: 'internal.md' },
    nodeId: 'reviewer-internal',
    role: 'reviewer',
  });

  assert.deepStrictEqual(events.slice(0, 2).map((event) => (
    event.kind === 'consent.requested' ? event.request.role : null
  )), ['curator_1', 'reviewer']);
  assert.strictEqual(gate.getInFlightRequests().length, 2);

  gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_ONCE, 'reviewer');
  assert.strictEqual(await reviewer, CONSENT_CHECK_RESULT.PROCEED);
  assert.strictEqual(curatorResolved, false);

  gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'curator_1');
  assert.strictEqual(await curator, CONSENT_CHECK_RESULT.DENY);
});


await test('Allow all edits this flow resolves other visible file-write requests', async () => {
  const { gate, events } = createGate();

  const curator = gate.check(request({ toolName: 'edit_file', input: { path: 'a.txt' }, nodeId: 'curator-node', role: 'curator_1' }));
  const reviewer = gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' }, nodeId: 'reviewer-node', role: 'reviewer' }));

  assert.strictEqual(gate.getInFlightRequests().length, 2);

  gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_FLOW, 'curator_1');

  assert.strictEqual(await curator, CONSENT_CHECK_RESULT.PROCEED);
  assert.strictEqual(await reviewer, CONSENT_CHECK_RESULT.PROCEED);
  assert.strictEqual(gate.getInFlightRequests().length, 0);
  assert.deepStrictEqual(
    events
      .filter((event) => event.kind === 'consent.resolved')
      .map((event) => event.kind === 'consent.resolved' ? event.request.role : null),
    ['curator_1', 'reviewer']
  );
});

await test('safe ls commands are auto-allowed without consent', async () => {
  const { gate, events } = createGate();

  assert.strictEqual(isAutoAllowedBashCommand('ls -la a-society/runtime'), true);
  assert.strictEqual(isAutoAllowedBashCommand('ls /tmp'), false);
  assert.strictEqual(isAutoAllowedBashCommand('ls && rm -rf a-society'), false);
  assert.strictEqual(
    await gate.check(request({ toolName: 'run_command', input: { command: 'ls -la a-society/runtime' } })),
    CONSENT_CHECK_RESULT.PROCEED
  );
  assert.strictEqual(events.length, 0);
});

await test('Allow command this flow persists only the exact bash command', async () => {
  const { gate, events } = createGate();

  const first = gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }));
  gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_FLOW, 'tester');
  assert.strictEqual(await first, CONSENT_CHECK_RESULT.PROCEED);
  assert.strictEqual(gate.getState().mode, CONSENT_MODE.PARTIAL_ACCESS);
  assert.ok(gate.getState().bash.allowedCommands['npm test -- operator-feed']);

  const eventCount = events.length;
  assert.strictEqual(
    await gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } })),
    CONSENT_CHECK_RESULT.PROCEED
  );
  assert.strictEqual(events.length, eventCount);

  void gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- unified-routing' } }));
  assert.deepStrictEqual(events[eventCount], {
    kind: 'consent.requested',
    request: { kind: 'bash-command', toolName: 'run_command', command: 'npm test -- unified-routing', nodeId: 'test-node', role: 'tester' },
  });
  gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'tester');
});

await test('no-access ignores stored partial grants', async () => {
  const { gate, events } = createGate();
  const first = gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }));
  gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_FLOW, 'tester');
  assert.strictEqual(await first, CONSENT_CHECK_RESULT.PROCEED);

  gate.setMode(CONSENT_MODE.NO_ACCESS);
  const eventCount = events.length;
  void gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }));
  assert.deepStrictEqual(events[eventCount], {
    kind: 'consent.requested',
    request: { kind: 'bash-command', toolName: 'run_command', command: 'npm test -- operator-feed', nodeId: 'test-node', role: 'tester' },
  });
  gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'tester');
});

await test('full-access bypasses all consent prompts', async () => {
  const { gate, events } = createGate();
  gate.setMode(CONSENT_MODE.FULL_ACCESS);
  const eventCount = events.length;

  assert.strictEqual(await gate.check(request({ toolName: 'write_file', input: { path: 'a.txt' } })), CONSENT_CHECK_RESULT.PROCEED);
  assert.strictEqual(
    await gate.check(request({ toolName: 'run_command', input: { command: 'npm install' } })),
    CONSENT_CHECK_RESULT.PROCEED
  );
  assert.strictEqual(events.length, eventCount);
});

await test('invalid consent state hydrates to no-access', () => {
  assert.deepStrictEqual(
    normalizeConsentState({ mode: 'invalid-mode', fileWrites: true, shellNetwork: true }),
    {
      mode: CONSENT_MODE.NO_ACCESS,
      bash: { allowedCommands: {} },
    }
  );
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
