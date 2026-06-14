import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  configureSettingsStore,
  createModel,
  createMcpServer,
  deleteMcpServer,
  getEnabledWebSearchApiKey,
  getFeedSettings,
  getActiveModelWithKey,
  getMcpServerWithSecrets,
  getToolSettings,
  listMcpServerSummaries,
  listModels,
  updateModel,
  updateMcpServer,
  updateFeedSettings,
  updateWebSearchToolSettings,
} from '../../src/settings/settings-store.js';

let tmpDir: string;

function createWorkspaceModel(apiKey = 'workspace-key') {
  return createModel({
    displayName: 'Workspace Model',
    providerType: 'openai-compatible',
    providerBaseUrl: 'http://127.0.0.1:1/v1',
    modelId: 'workspace-model',
    contextWindow: 0,
    maxOutputTokens: 0,
    reasoning: { mode: 'disabled' },
    supportedInputTypes: [],
  }, apiKey);
}

describe('settings-store', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-settings-store-'));
    configureSettingsStore(tmpDir);
  });

  afterEach(() => {
    configureSettingsStore(process.cwd());
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('stores the default settings directory under the configured workspace root', () => {
    createWorkspaceModel();

    expect(fs.existsSync(path.join(tmpDir, '.a-society', 'settings.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.a-society', 'secrets.json'))).toBe(true);
    expect(listModels()).toHaveLength(1);
    expect(getActiveModelWithKey()?.apiKey).toBe('workspace-key');
  });

  it('updates persisted model config and preserves the API key when left blank', () => {
    const existing = createWorkspaceModel();

    const updated = updateModel(existing.id, {
      displayName: 'Workspace Model Updated',
      providerType: 'openai-compatible',
      providerBaseUrl: 'http://127.0.0.1:2/v1',
      modelId: 'workspace-model-v2',
      contextWindow: 64000,
      maxOutputTokens: 4096,
      reasoning: { mode: 'openai-chat', effort: 'medium' },
      supportedInputTypes: ['image', 'audio'],
    });

    expect(updated).toMatchObject({
      displayName: 'Workspace Model Updated',
      modelId: 'workspace-model-v2',
      supportedInputTypes: ['image', 'audio'],
    });
    expect(getActiveModelWithKey()?.apiKey).toBe('workspace-key');
  });

  it('stores the Tavily web search key in secrets and only enables when configured', () => {
    expect(getToolSettings()).toEqual({
      webSearch: {
        enabled: false,
        hasApiKey: false,
      },
    });
    expect(getEnabledWebSearchApiKey()).toBeNull();

    expect(() => updateWebSearchToolSettings({ enabled: true })).toThrow(/Tavily API key is required/);

    let tools = updateWebSearchToolSettings({ enabled: false, apiKey: 'tavily-test-key' });
    expect(tools).toEqual({
      webSearch: {
        enabled: false,
        hasApiKey: true,
      },
    });
    expect(getEnabledWebSearchApiKey()).toBeNull();

    tools = updateWebSearchToolSettings({ enabled: true });
    expect(tools).toEqual({
      webSearch: {
        enabled: true,
        hasApiKey: true,
      },
    });
    expect(getEnabledWebSearchApiKey()).toBe('tavily-test-key');
  });

  it('persists feed settings and clamps the history limit', () => {
    expect(getFeedSettings().historyLimit).toBe(400);

    expect(updateFeedSettings({ historyLimit: 25 })).toEqual({ historyLimit: 50 });
    expect(getFeedSettings().historyLimit).toBe(50);

    expect(updateFeedSettings({ historyLimit: 250 })).toEqual({ historyLimit: 250 });
    expect(getFeedSettings().historyLimit).toBe(250);

    expect(updateFeedSettings({ historyLimit: 50000 })).toEqual({ historyLimit: 10000 });
  });

  it('stores MCP server config separately from secrets and cleans secrets on delete', () => {
    const server = createMcpServer({
      name: 'linear',
      transport: 'stdio',
      command: 'node',
      args: ['server.js'],
      env: { LINEAR_API_KEY: 'secret-key' },
      toolNames: ['create_issue'],
    });

    expect(listMcpServerSummaries()).toEqual([{
      id: server.id,
      name: 'linear',
      transport: 'stdio',
      toolNames: ['create_issue'],
    }]);
    expect(getMcpServerWithSecrets(server.id)?.env).toEqual({ LINEAR_API_KEY: 'secret-key' });

    const settingsJson = JSON.parse(fs.readFileSync(path.join(tmpDir, '.a-society', 'settings.json'), 'utf8'));
    expect(JSON.stringify(settingsJson)).not.toContain('secret-key');
    const secretsJson = JSON.parse(fs.readFileSync(path.join(tmpDir, '.a-society', 'secrets.json'), 'utf8'));
    expect(secretsJson[`mcp:${server.id}:env:LINEAR_API_KEY`]).toBe('secret-key');

    const updated = updateMcpServer(server.id, {
      name: 'linear',
      transport: 'http',
      url: 'https://mcp.example.com',
      headers: { Authorization: 'Bearer token' },
      toolNames: ['search'],
    });
    expect(updated.transport).toBe('http');
    expect(getMcpServerWithSecrets(server.id)?.headers).toEqual({ Authorization: 'Bearer token' });

    deleteMcpServer(server.id);
    expect(listMcpServerSummaries()).toEqual([]);
    const cleanedSecretsJson = JSON.parse(fs.readFileSync(path.join(tmpDir, '.a-society', 'secrets.json'), 'utf8'));
    expect(Object.keys(cleanedSecretsJson).some((key) => key.startsWith(`mcp:${server.id}:`))).toBe(false);
  });

  it('rejects invalid MCP server names', () => {
    expect(() => createMcpServer({
      name: 'Not Valid',
      transport: 'stdio',
      command: 'node',
    })).toThrow(/must match/);
  });
});
