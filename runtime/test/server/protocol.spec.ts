import { describe, expect, it } from 'vitest';
import {
  CLIENT_MESSAGE_TYPE,
  CONSENT_MODE,
  CONSENT_RESPONSE_DECISION,
  FEEDBACK_CONSENT_DECISION,
} from '../../src/common/protocol-constants.js';
import { parseClientMessage } from '../../src/server/protocol.js';

describe('protocol', () => {
  it('accepts valid flow-scoped messages', () => {
    const parsed = parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.OPEN_FLOW,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    }));

    expect(parsed).toEqual({
      type: CLIENT_MESSAGE_TYPE.OPEN_FLOW,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
    });
  });

  it('accepts greenfield initialization by project namespace', () => {
    const parsed = parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION,
      projectNamespace: 'new-demo',
    }));

    expect(parsed).toEqual({
      type: CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION,
      projectNamespace: 'new-demo',
    });
  });

  it('accepts current consent decisions and modes', () => {
    const consentResponse = parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
      decision: CONSENT_RESPONSE_DECISION.ALLOW_ONCE,
      role: 'owner',
    }));
    const consentMode = parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.CONSENT_MODE,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
      mode: CONSENT_MODE.NO_ACCESS,
    }));
    const feedbackConsent = parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.FEEDBACK_CONSENT_CHOICE,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
      decision: FEEDBACK_CONSENT_DECISION.GRANTED,
    }));

    expect(consentResponse).toMatchObject({
      type: CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE,
      decision: CONSENT_RESPONSE_DECISION.ALLOW_ONCE,
    });
    expect(consentMode).toMatchObject({
      type: CLIENT_MESSAGE_TYPE.CONSENT_MODE,
      mode: CONSENT_MODE.NO_ACCESS,
    });
    expect(feedbackConsent).toMatchObject({
      type: CLIENT_MESSAGE_TYPE.FEEDBACK_CONSENT_CHOICE,
      decision: FEEDBACK_CONSENT_DECISION.GRANTED,
    });
  });

  it('accepts role configuration with optional model and capability arrays', () => {
    const parsed = parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.ROLE_CONFIGURATION,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
      nodeId: 'owner-intake',
      modelConfigId: 'model-b',
      skills: ['review-writing'],
      mcpServers: [],
    }));

    expect(parsed).toEqual({
      type: CLIENT_MESSAGE_TYPE.ROLE_CONFIGURATION,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
      nodeId: 'owner-intake',
      modelConfigId: 'model-b',
      skills: ['review-writing'],
      mcpServers: [],
    });
  });

  it('rejects role configuration without capability arrays', () => {
    const parsed = parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.ROLE_CONFIGURATION,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
      nodeId: 'owner-intake',
    }));

    expect(parsed).toBeNull();
  });

  it('rejects legacy consent values', () => {
    expect(parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
      decision: FEEDBACK_CONSENT_DECISION.GRANTED,
      role: 'owner',
    }))).toBeNull();

    expect(parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
      decision: FEEDBACK_CONSENT_DECISION.DENIED,
      role: 'owner',
    }))).toBeNull();

    expect(parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.CONSENT_MODE,
      flowRef: { projectNamespace: 'demo', flowId: 'flow-1' },
      mode: 'ask',
    }))).toBeNull();
  });

  it('rejects legacy greenfield projectName field', () => {
    const parsed = parseClientMessage(JSON.stringify({
      type: CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION,
      projectName: 'new-demo',
    }));

    expect(parsed).toBeNull();
  });

  it('rejects malformed messages', () => {
    expect(parseClientMessage('{nope')).toBeNull();
    expect(parseClientMessage(JSON.stringify({ type: CLIENT_MESSAGE_TYPE.OPEN_FLOW }))).toBeNull();
  });
});
