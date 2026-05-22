import assert from 'node:assert';
import { parseClientMessage } from '../../src/server/protocol.js';

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

console.log('\nprotocol');

test('parseClientMessage accepts valid flow-scoped messages', () => {
  const parsed = parseClientMessage(JSON.stringify({
    type: 'open_flow',
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' }
  }));

  assert.deepStrictEqual(parsed, {
    type: 'open_flow',
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' }
  });
});

test('parseClientMessage normalizes legacy consent decisions', () => {
  const parsed = parseClientMessage(JSON.stringify({
    type: 'consent_response',
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    decision: 'granted',
    role: 'Owner'
  }));

  assert.strictEqual(parsed?.type, 'consent_response');
  assert.strictEqual(parsed.decision, 'allow_once');
});

test('parseClientMessage normalizes legacy consent mode', () => {
  const parsed = parseClientMessage(JSON.stringify({
    type: 'consent_mode',
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    mode: 'ask'
  }));

  assert.strictEqual(parsed?.type, 'consent_mode');
  assert.strictEqual(parsed.mode, 'no-access');
});

test('parseClientMessage rejects malformed messages', () => {
  assert.strictEqual(parseClientMessage('{nope'), null);
  assert.strictEqual(parseClientMessage(JSON.stringify({ type: 'open_flow' })), null);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
