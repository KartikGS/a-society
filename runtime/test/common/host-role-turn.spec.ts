import { describe, expect, it } from 'vitest';
import {
  buildHostPermissionProfile,
  mapHostDenial,
  pendingHostMessage,
  renderRecoveryTranscript,
} from '../../src/common/host-role-turn.js';
import { CONSENT_CHECK_RESULT, defaultConsentState } from '../../src/common/types.js';
import type { ConsentGate, ConsentState, RuntimeMessageParam } from '../../src/common/types.js';
import { CONSENT_MODE } from '../../shared/protocol-constants.js';

function gate(state: ConsentState): ConsentGate {
  return {
    check: async () => CONSENT_CHECK_RESULT.PROCEED,
    respond: () => undefined,
    setMode: () => undefined,
    getState: () => state,
    getInFlightRequests: () => [],
  };
}

const NO_GRANTS = { writePaths: [], commands: [], mcpTools: [] };

describe('pendingHostMessage', () => {
  const history: RuntimeMessageParam[] = [
    { role: 'user', content: 'entry' },
    { role: 'assistant', content: 'reply' },
    { role: 'user', content: 'human answer' },
    { role: 'user', content: 'repair note' },
  ];

  it('sends every user message on a new conversation and never assistant text', () => {
    expect(pendingHostMessage(history, undefined)).toBe('entry\n\nhuman answer\n\nrepair note');
  });

  it('sends only user messages after the delivered mark', () => {
    expect(pendingHostMessage(history, { deliveredCount: 2, deliveredTailLength: 5 })).toBe('human answer\n\nrepair note');
    expect(pendingHostMessage(history, { deliveredCount: 4, deliveredTailLength: 11 })).toBe('');
  });

  it('sends text merged into the last delivered user message after delivery', () => {
    // The orchestrator merges consecutive user messages into one entry.
    const merged: RuntimeMessageParam[] = [{ role: 'user', content: 'entry\n\nhuman answer' }];
    expect(pendingHostMessage(merged, { deliveredCount: 1, deliveredTailLength: 'entry'.length })).toBe('human answer');
    expect(pendingHostMessage(merged, { deliveredCount: 1, deliveredTailLength: merged[0].role === 'user' ? merged[0].content.length : 0 })).toBe('');
  });
});

describe('renderRecoveryTranscript', () => {
  it('renders the delivered exchange and drops the oldest blocks past the limit', () => {
    const history: RuntimeMessageParam[] = [
      { role: 'user', content: 'a'.repeat(100) },
      { role: 'assistant', content: 'first reply' },
      { role: 'tool_result', callId: 'x', toolName: 'read_file', content: 'ignored', isError: false },
      { role: 'user', content: 'second' },
      { role: 'user', content: 'not delivered' },
    ];
    expect(renderRecoveryTranscript(history, { deliveredCount: 4, deliveredTailLength: 6 }))
      .toBe(`--- user ---\n${'a'.repeat(100)}\n\n--- assistant ---\nfirst reply\n\n--- user ---\nsecond`);
    expect(renderRecoveryTranscript(history, { deliveredCount: 4, deliveredTailLength: 6 }, 60))
      .toBe('--- assistant ---\nfirst reply\n\n--- user ---\nsecond');
  });
});

describe('mapHostDenial', () => {
  const roots = ['/ws/proj', '/ws/.a-society/state/proj/flow/record'];

  it('maps writes inside the write roots to a workspace-relative write_file request', () => {
    const request = mapHostDenial({ toolName: 'Edit', input: { file_path: '/ws/proj/a.md' } }, '/ws', roots);
    expect(request?.check).toEqual({ toolName: 'write_file', input: { path: 'proj/a.md' } });
    const grants = { writePaths: [] as string[], commands: [], mcpTools: [] };
    request?.grant(grants);
    expect(grants.writePaths).toEqual(['/ws/proj/a.md']);
  });

  it('keeps writes outside the write roots denied', () => {
    expect(mapHostDenial({ toolName: 'Write', input: { file_path: '/ws/other-project/a.md' } }, '/ws', roots)).toBeNull();
    expect(mapHostDenial({ toolName: 'Write', input: { file_path: '/ws/proj-evil/a.md' } }, '/ws', roots)).toBeNull();
  });

  it('maps commands and MCP tools, and leaves other tools denied', () => {
    expect(mapHostDenial({ toolName: 'Bash', input: { command: ' npm test ' } }, '/ws', roots)?.check)
      .toEqual({ toolName: 'run_command', input: { command: 'npm test' } });
    expect(mapHostDenial({ toolName: 'mcp__docs__search', input: { q: 'x' } }, '/ws', roots)?.check)
      .toEqual({ toolName: 'mcp__docs__search', input: { q: 'x' } });
    expect(mapHostDenial({ toolName: 'Read', input: { file_path: '/etc/hosts' } }, '/ws', roots)).toBeNull();
    expect(mapHostDenial({ toolName: 'WebFetch', input: { url: 'https://x' } }, '/ws', roots)).toBeNull();
  });
});

describe('buildHostPermissionProfile', () => {
  it('maps each consent mode', () => {
    const state = defaultConsentState();
    expect(buildHostPermissionProfile(gate(state), NO_GRANTS, '/ws').mode).toBe('read-only');
    expect(buildHostPermissionProfile(gate({ ...state, mode: CONSENT_MODE.PARTIAL_ACCESS }), NO_GRANTS, '/ws').mode).toBe('edits');
    expect(buildHostPermissionProfile(gate({ ...state, mode: CONSENT_MODE.FULL_ACCESS }), NO_GRANTS, '/ws').mode).toBe('edits-and-commands');
  });

  it('combines flow grants with grants made during the turn', () => {
    const state: ConsentState = {
      mode: CONSENT_MODE.PARTIAL_ACCESS,
      bash: { allowedCommands: { 'npm test': { command: 'npm test', grantedAt: 'x' } } },
      mcp: { allowedTools: { mcp__a__b: { toolName: 'mcp__a__b', grantedAt: 'x' } } },
    };
    const profile = buildHostPermissionProfile(gate(state), { writePaths: ['/ws/p/a.md'], commands: ['npm test', 'git status'], mcpTools: [] }, '/ws');
    expect(profile).toEqual({
      mode: 'edits',
      allowedWritePaths: ['/ws/p/a.md'],
      allowedCommands: ['npm test', 'git status'],
      allowedMcpTools: ['mcp__a__b'],
      readOnlyRoots: ['/ws'],
    });
  });
});
