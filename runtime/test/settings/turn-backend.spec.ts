import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { getAgentModeSettings, MODEL_CONFIGURATION_REQUIRED_MESSAGE, updateAgentModeSettings } from '../../src/settings/settings-store.js';
import { currentTurnBackend, getTurnBackendReadiness, resolveTurnBackend } from '../../src/settings/turn-backend.js';
import { clearProbeCache } from '../../src/providers/host-agents/version.js';

const FAKE_CLAUDE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../providers/host-agents/fake-claude.mjs');
const HOST = { kind: 'host', agentId: 'claude-code' } as const;
let tmpDir: string;
const savedEnv = { ...process.env };

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'turn-backend-'));
  setWorkspaceRoot(tmpDir);
  clearProbeCache();
});

afterEach(() => {
  process.env = { ...savedEnv };
  clearWorkspaceRoot();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('agent mode settings', () => {
  it('defaults to API mode and pins new flows to it', () => {
    expect(getAgentModeSettings()).toEqual({ mode: 'api', hostAgentId: null, executablePath: null });
    expect(currentTurnBackend()).toEqual({ kind: 'api' });
  });

  it('pins new flows to the selected host', () => {
    updateAgentModeSettings({ mode: 'host', hostAgentId: 'claude-code' });
    expect(currentTurnBackend()).toEqual(HOST);
  });

  it('falls back to API mode for an unknown host or malformed settings', () => {
    fs.mkdirSync(path.join(tmpDir, '.a-society'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.a-society', 'settings.json'), JSON.stringify({ agentMode: { mode: 'host', hostAgentId: 'codex', executablePath: '  ' } }));
    expect(getAgentModeSettings()).toEqual({ mode: 'api', hostAgentId: null, executablePath: null });
  });

  it('treats flows without a pinned backend as API flows', () => {
    expect(resolveTurnBackend({})).toEqual({ kind: 'api' });
    expect(resolveTurnBackend({ turnBackend: HOST })).toEqual(HOST);
  });
});

describe('getTurnBackendReadiness', () => {
  it('requires a usable model in API mode', async () => {
    expect(await getTurnBackendReadiness({ kind: 'api' })).toEqual({ ready: false, message: MODEL_CONFIGURATION_REQUIRED_MESSAGE });
  });

  it('is ready for an installed, supported, signed-in host', async () => {
    updateAgentModeSettings({ mode: 'host', hostAgentId: 'claude-code', executablePath: FAKE_CLAUDE });
    expect(await getTurnBackendReadiness(HOST)).toEqual({ ready: true });
  });

  it('names the first failing check', async () => {
    const missing = path.join(tmpDir, 'no-claude');
    updateAgentModeSettings({ mode: 'host', hostAgentId: 'claude-code', executablePath: missing });
    expect(await getTurnBackendReadiness(HOST)).toEqual({
      ready: false,
      message: `Agent mode is set to Claude Code, but it is not ready: not installed at ${missing}.`,
    });

    updateAgentModeSettings({ executablePath: FAKE_CLAUDE });
    process.env.FAKE_CLAUDE_VERSION = '2.1.200';
    expect(await getTurnBackendReadiness(HOST)).toEqual({
      ready: false,
      message: 'Agent mode is set to Claude Code, but it is not ready: version 2.1.200 is outside the supported range 2.1.304 up to (not including) 2.2.0.',
    });

    clearProbeCache();
    delete process.env.FAKE_CLAUDE_VERSION;
    process.env.FAKE_CLAUDE_LOGGED_IN = '0';
    expect(await getTurnBackendReadiness(HOST)).toEqual({
      ready: false,
      message: 'Agent mode is set to Claude Code, but it is not ready: not logged in — run `claude auth login`.',
    });
  });

  it('checks a host flow against the host even when the setting is back on API', async () => {
    // Flows keep the backend they were created with (D6).
    updateAgentModeSettings({ mode: 'api', executablePath: FAKE_CLAUDE });
    expect(await getTurnBackendReadiness(HOST)).toEqual({ ready: true });
  });
});
