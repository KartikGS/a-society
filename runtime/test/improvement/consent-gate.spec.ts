import { describe, expect, it } from 'vitest';
import {
  CONSENT_CHECK_RESULT,
  normalizeConsentState,
} from '../../src/common/types.js';
import type { ConsentCheckRequest, OperatorEvent } from '../../src/common/types.js';
import {
  CONSENT_MODE,
  CONSENT_RESPONSE_DECISION,
} from '../../shared/protocol-constants.js';
import { ConsentGateImpl, isAutoAllowedBashCommand } from '../../src/improvement/consent-gate.js';

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

describe('consent-gate', () => {
  it('treats file write allow_once as one-shot and prompts on the next write', async () => {
    const { gate, events } = createGate();

    const first = gate.check(request({ toolName: 'write_file', input: { path: 'a.txt' } }));
    expect(events[0]).toEqual({
      kind: 'consent.requested',
      request: { kind: 'file-write', toolName: 'write_file', path: 'a.txt', nodeId: 'test-node', role: 'tester' },
    });

    gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_ONCE, 'tester');
    expect(await first).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(gate.getState().mode).toBe(CONSENT_MODE.NO_ACCESS);

    const second = gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' } }));
    expect(events[2]).toEqual({
      kind: 'consent.requested',
      request: { kind: 'file-write', toolName: 'write_file', path: 'b.txt', nodeId: 'test-node', role: 'tester' },
    });
    gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'tester');
    expect(await second).toBe(CONSENT_CHECK_RESULT.DENY);
  });

  it('allows all file writes without prompting in partial-access mode', async () => {
    const { gate, events } = createGate();

    gate.setMode(CONSENT_MODE.PARTIAL_ACCESS);
    const eventCount = events.length;

    expect(await gate.check(request({ toolName: 'edit_file', input: { path: 'a.txt' } }))).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(await gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' } }))).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(events).toHaveLength(eventCount);
  });

  it('switches to partial-access mode on allow_flow for a file write', async () => {
    const { gate } = createGate();

    const first = gate.check(request({ toolName: 'edit_file', input: { path: 'a.txt' } }));
    gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_FLOW, 'tester');

    expect(await first).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(gate.getState().mode).toBe(CONSENT_MODE.PARTIAL_ACCESS);
    expect(await gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' } }))).toBe(CONSENT_CHECK_RESULT.PROCEED);
  });

  it('preserves node and role metadata in consent requests', async () => {
    const { gate, events } = createGate();

    const pending = gate.check({
      toolName: 'edit_file',
      input: { path: 'a-society/index.md' },
      nodeId: 'curator-public-registration',
      role: 'curator',
    });

    expect(events[0]).toEqual({
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
    expect(await pending).toBe(CONSENT_CHECK_RESULT.DENY);
  });

  it('allows one consent request to be in-flight per role', async () => {
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

    expect(events.slice(0, 2).map((event) => (
      event.kind === 'consent.requested' ? event.request.role : null
    ))).toEqual(['curator_1', 'reviewer']);
    expect(gate.getInFlightRequests()).toHaveLength(2);

    gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_ONCE, 'reviewer');
    expect(await reviewer).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(curatorResolved).toBe(false);

    gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'curator_1');
    expect(await curator).toBe(CONSENT_CHECK_RESULT.DENY);
  });

  it('resolves other visible file-write requests when allowing all edits this flow', async () => {
    const { gate, events } = createGate();

    const curator = gate.check(request({ toolName: 'edit_file', input: { path: 'a.txt' }, nodeId: 'curator-node', role: 'curator_1' }));
    const reviewer = gate.check(request({ toolName: 'write_file', input: { path: 'b.txt' }, nodeId: 'reviewer-node', role: 'reviewer' }));

    expect(gate.getInFlightRequests()).toHaveLength(2);

    gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_FLOW, 'curator_1');

    expect(await curator).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(await reviewer).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(gate.getInFlightRequests()).toHaveLength(0);
    expect(events
      .filter((event) => event.kind === 'consent.resolved')
      .map((event) => event.kind === 'consent.resolved' ? event.request.role : null)
    ).toEqual(['curator_1', 'reviewer']);
  });

  it('auto-allows safe ls commands without consent', async () => {
    const { gate, events } = createGate();

    expect(isAutoAllowedBashCommand('ls -la a-society/runtime')).toBe(true);
    expect(isAutoAllowedBashCommand('ls /tmp')).toBe(false);
    expect(isAutoAllowedBashCommand('ls && rm -rf a-society')).toBe(false);
    expect(await gate.check(request({ toolName: 'run_command', input: { command: 'ls -la a-society/runtime' } })))
      .toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(events).toHaveLength(0);
  });

  it('persists only the exact bash command on allow_flow', async () => {
    const { gate, events } = createGate();

    const first = gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }));
    gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_FLOW, 'tester');
    expect(await first).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(gate.getState().mode).toBe(CONSENT_MODE.PARTIAL_ACCESS);
    expect(gate.getState().bash.allowedCommands['npm test -- operator-feed']).toBeTruthy();

    const eventCount = events.length;
    expect(await gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } })))
      .toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(events).toHaveLength(eventCount);

    const differentCommand = gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- unified-routing' } }));
    expect(events[eventCount]).toEqual({
      kind: 'consent.requested',
      request: { kind: 'bash-command', toolName: 'run_command', command: 'npm test -- unified-routing', nodeId: 'test-node', role: 'tester' },
    });
    gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'tester');
    expect(await differentCommand).toBe(CONSENT_CHECK_RESULT.DENY);
  });

  it('ignores stored partial grants in no-access mode', async () => {
    const { gate, events } = createGate();
    const first = gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }));
    gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_FLOW, 'tester');
    expect(await first).toBe(CONSENT_CHECK_RESULT.PROCEED);

    gate.setMode(CONSENT_MODE.NO_ACCESS);
    const eventCount = events.length;
    const pending = gate.check(request({ toolName: 'run_command', input: { command: 'npm test -- operator-feed' } }));

    expect(events[eventCount]).toEqual({
      kind: 'consent.requested',
      request: { kind: 'bash-command', toolName: 'run_command', command: 'npm test -- operator-feed', nodeId: 'test-node', role: 'tester' },
    });
    gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'tester');
    expect(await pending).toBe(CONSENT_CHECK_RESULT.DENY);
  });

  it('bypasses all consent prompts in full-access mode', async () => {
    const { gate, events } = createGate();
    gate.setMode(CONSENT_MODE.FULL_ACCESS);
    const eventCount = events.length;

    expect(await gate.check(request({ toolName: 'write_file', input: { path: 'a.txt' } }))).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(await gate.check(request({ toolName: 'run_command', input: { command: 'npm install' } }))).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(await gate.check(request({ toolName: 'mcp__linear__create_issue', input: { title: 'Bug' } }))).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(events).toHaveLength(eventCount);
  });

  it('prompts for MCP tools by default and previews arguments', async () => {
    const { gate, events } = createGate();

    const pending = gate.check(request({
      toolName: 'mcp__linear__create_issue',
      input: { title: 'Broken build' },
    }));

    expect(events[0]).toEqual({
      kind: 'consent.requested',
      request: {
        kind: 'mcp-tool',
        toolName: 'mcp__linear__create_issue',
        serverName: 'linear',
        toolDisplayName: 'create_issue',
        argsPreview: '{"title":"Broken build"}',
        nodeId: 'test-node',
        role: 'tester',
      },
    });

    gate.respond(CONSENT_RESPONSE_DECISION.DENY, 'tester');
    expect(await pending).toBe(CONSENT_CHECK_RESULT.DENY);
  });

  it('honors an MCP allow_flow grant in partial-access mode', async () => {
    const { gate, events } = createGate();

    const first = gate.check(request({ toolName: 'mcp__linear__create_issue', input: { title: 'Bug' } }));
    gate.respond(CONSENT_RESPONSE_DECISION.ALLOW_FLOW, 'tester');
    expect(await first).toBe(CONSENT_CHECK_RESULT.PROCEED);

    const eventCount = events.length;
    expect(await gate.check(request({ toolName: 'mcp__linear__create_issue', input: { title: 'Next' } }))).toBe(CONSENT_CHECK_RESULT.PROCEED);
    expect(events).toHaveLength(eventCount);
    expect(gate.getState().mcp.allowedTools.mcp__linear__create_issue.toolName).toBe('mcp__linear__create_issue');
  });

  it('hydrates invalid consent state to no-access', () => {
    expect(normalizeConsentState({ mode: 'invalid-mode', fileWrites: true, shellNetwork: true })).toEqual({
      mode: CONSENT_MODE.NO_ACCESS,
      bash: { allowedCommands: {} },
      mcp: { allowedTools: {} },
    });
  });

  it('normalizes malformed MCP grants to empty', () => {
    expect(normalizeConsentState({
      mode: CONSENT_MODE.PARTIAL_ACCESS,
      mcp: { allowedTools: { bad: { command: 'not an mcp grant' } } },
    })).toEqual({
      mode: CONSENT_MODE.PARTIAL_ACCESS,
      bash: { allowedCommands: {} },
      mcp: { allowedTools: {} },
    });
  });
});
