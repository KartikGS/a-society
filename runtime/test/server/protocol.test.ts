import assert from 'node:assert';
import {
  CLIENT_MESSAGE_TYPE,
  CONSENT_MODE,
  CONSENT_RESPONSE_DECISION,
  FEEDBACK_CONSENT_DECISION,
} from '../../src/common/protocol-constants.js';
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
    type: CLIENT_MESSAGE_TYPE.OPEN_FLOW,
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' }
  }));

  assert.deepStrictEqual(parsed, {
    type: CLIENT_MESSAGE_TYPE.OPEN_FLOW,
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' }
  });
});

test('parseClientMessage accepts greenfield initialization by project namespace', () => {
  const parsed = parseClientMessage(JSON.stringify({
    type: CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION,
    projectNamespace: 'new-demo'
  }));

  assert.deepStrictEqual(parsed, {
    type: CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION,
    projectNamespace: 'new-demo'
  });
});

test('parseClientMessage accepts current consent decisions and modes', () => {
  const consentResponse = parseClientMessage(JSON.stringify({
    type: CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE,
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    decision: CONSENT_RESPONSE_DECISION.ALLOW_ONCE,
    role: 'Owner'
  }));
  const consentMode = parseClientMessage(JSON.stringify({
    type: CLIENT_MESSAGE_TYPE.CONSENT_MODE,
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    mode: CONSENT_MODE.NO_ACCESS
  }));
  const feedbackConsent = parseClientMessage(JSON.stringify({
    type: CLIENT_MESSAGE_TYPE.FEEDBACK_CONSENT_CHOICE,
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    decision: FEEDBACK_CONSENT_DECISION.GRANTED
  }));

  assert.strictEqual(consentResponse?.type, CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE);
  assert.strictEqual(consentResponse.decision, CONSENT_RESPONSE_DECISION.ALLOW_ONCE);
  assert.strictEqual(consentMode?.type, CLIENT_MESSAGE_TYPE.CONSENT_MODE);
  assert.strictEqual(consentMode.mode, CONSENT_MODE.NO_ACCESS);
  assert.strictEqual(feedbackConsent?.type, CLIENT_MESSAGE_TYPE.FEEDBACK_CONSENT_CHOICE);
  assert.strictEqual(feedbackConsent.decision, FEEDBACK_CONSENT_DECISION.GRANTED);
});

test('parseClientMessage rejects legacy consent values', () => {
  assert.strictEqual(parseClientMessage(JSON.stringify({
    type: CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE,
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    decision: FEEDBACK_CONSENT_DECISION.GRANTED,
    role: 'Owner'
  })), null);

  assert.strictEqual(parseClientMessage(JSON.stringify({
    type: CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE,
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    decision: FEEDBACK_CONSENT_DECISION.DENIED,
    role: 'Owner'
  })), null);

  assert.strictEqual(parseClientMessage(JSON.stringify({
    type: CLIENT_MESSAGE_TYPE.CONSENT_MODE,
    flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    mode: 'ask'
  })), null);
});

test('parseClientMessage rejects legacy greenfield projectName field', () => {
  const parsed = parseClientMessage(JSON.stringify({
    type: CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION,
    projectName: 'new-demo'
  }));

  assert.strictEqual(parsed, null);
});

test('parseClientMessage rejects malformed messages', () => {
  assert.strictEqual(parseClientMessage('{nope'), null);
  assert.strictEqual(parseClientMessage(JSON.stringify({ type: CLIENT_MESSAGE_TYPE.OPEN_FLOW })), null);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
