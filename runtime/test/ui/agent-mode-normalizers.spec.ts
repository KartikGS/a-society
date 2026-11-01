import { describe, expect, it } from 'vitest';
import {
  normalizeAgentModeResponse,
  normalizeHostProbeSummary,
  normalizeSettingsStatus,
} from '../../ui/src/model-config.js';

describe('agent mode normalizers', () => {
  it('reads the turn backend fields, defaulting to API-mode readiness for older servers', () => {
    expect(normalizeSettingsStatus({ hasConfiguredModel: true, modelCount: 1, turnBackend: 'host', turnBackendReady: false }))
      .toEqual({ hasConfiguredModel: true, modelCount: 1, turnBackend: 'host', turnBackendReady: false });
    expect(normalizeSettingsStatus({ hasConfiguredModel: true, modelCount: 1 }))
      .toEqual({ hasConfiguredModel: true, modelCount: 1, turnBackend: 'api', turnBackendReady: true });
  });

  it('drops unknown hosts and falls back to API mode without a valid host', () => {
    expect(normalizeAgentModeResponse({
      settings: { mode: 'host', hostAgentId: 'codex', executablePath: '' },
      hosts: [{ id: 'claude-code', displayName: 'Claude Code', supportedVersions: { min: '2.1.304', maxExclusive: '2.2.0' } }, { id: 'codex' }],
    })).toEqual({
      settings: { mode: 'api', hostAgentId: null, executablePath: null },
      hosts: [{ id: 'claude-code', displayName: 'Claude Code', supportedVersions: { min: '2.1.304', maxExclusive: '2.2.0' }, models: [], effortLevels: [] }],
    });
  });

  it('reads declared host models and effort levels, dropping malformed entries', () => {
    expect(normalizeAgentModeResponse({
      settings: { mode: 'host', hostAgentId: 'claude-code' },
      hosts: [{
        id: 'claude-code',
        displayName: 'Claude Code',
        models: [{ id: 'opus', displayName: 'Opus' }, { id: 'haiku' }, { displayName: 'no id' }, 'sonnet'],
        effortLevels: ['low', '', 3, 'max'],
      }],
    }).hosts[0]).toMatchObject({
      models: [{ id: 'opus', displayName: 'Opus' }, { id: 'haiku', displayName: 'haiku' }],
      effortLevels: ['low', 'max'],
    });
  });

  it('rejects a probe for an unknown host and keeps unknown sign-in as null', () => {
    expect(normalizeHostProbeSummary({ hostAgentId: 'codex' })).toBeNull();
    expect(normalizeHostProbeSummary({ hostAgentId: 'claude-code', installed: false })).toMatchObject({
      installed: false,
      loggedIn: null,
      version: null,
    });
  });
});
