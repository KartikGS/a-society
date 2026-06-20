import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateModelConfiguration } from '../../src/providers/model-validation.js';
import { validateMcpServerConfiguration } from '../../src/providers/mcp/validate.js';
import { registerSettingsRoutes } from '../../src/server/settings-routes.js';
import * as SettingsStore from '../../src/settings/settings-store.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';

vi.mock('../../src/providers/model-validation.js', () => ({
  validateModelConfiguration: vi.fn(),
}));

vi.mock('../../src/providers/mcp/validate.js', () => ({
  validateMcpServerConfiguration: vi.fn(),
}));

const validateModelConfigurationMock = vi.mocked(validateModelConfiguration);
const validateMcpServerConfigurationMock = vi.mocked(validateMcpServerConfiguration);
let workspaceRoot: string;

beforeEach(() => {
  validateModelConfigurationMock.mockReset();
  validateMcpServerConfigurationMock.mockReset();
  workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-settings-routes-'));
  setWorkspaceRoot(workspaceRoot);
});

interface MockResponse {
  statusCode: number;
  body: unknown;
  status(code: number): MockResponse;
  json(body: unknown): void;
}

function createMockResponse(): MockResponse {
  const response: MockResponse = {
    statusCode: 200,
    body: undefined,
    status(code: number): MockResponse {
      response.statusCode = code;
      return response;
    },
    json(body: unknown): void {
      response.body = body;
    },
  };
  return response;
}

type RouteMethod = 'get' | 'post' | 'put' | 'delete';

function findRouteHandler(app: express.Express, method: RouteMethod, routePath: string) {
  const stack = (app as unknown as { _router: { stack: any[] } })._router.stack;
  const layer = stack.find((entry) => entry.route?.path === routePath && entry.route.methods[method]);
  if (!layer) throw new Error(`Route ${method.toUpperCase()} ${routePath} was not registered.`);
  return layer.route.stack[layer.route.stack.length - 1].handle as (
    req: { body: unknown; params: Record<string, string> },
    res: MockResponse
  ) => Promise<void> | void;
}

async function callSettingsRoute(
  method: RouteMethod,
  routePath: string,
  body: unknown = {},
  params: Record<string, string> = {}
): Promise<{ status: number; body: unknown }> {
  const app = express();
  registerSettingsRoutes(app, workspaceRoot);
  const response = createMockResponse();
  await findRouteHandler(app, method, routePath)({ body, params }, response);
  return { status: response.statusCode, body: response.body };
}

function modelPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    displayName: 'Test Model',
    providerType: 'anthropic',
    providerBaseUrl: '',
    modelId: 'claude-test',
    apiKey: 'test-key',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    reasoning: { mode: 'disabled' },
    cacheTtl: '5m',
    supportedInputTypes: [],
    ...overrides,
  };
}

describe('settings routes', () => {
  it('validates model creation before saving', async () => {
    validateModelConfigurationMock.mockRejectedValue(new Error('sample request failed'));

    const response = await callSettingsRoute('post', '/api/settings/models', modelPayload());

    expect(response.body).toMatchObject({ message: expect.stringContaining('sample request failed') });
    expect(response.status).toBe(400);
    expect(validateModelConfigurationMock).toHaveBeenCalledWith(expect.objectContaining({
      providerType: 'anthropic',
      modelId: 'claude-test',
      apiKey: 'test-key',
    }));
    expect(SettingsStore.listModels()).toEqual([]);
  });

  it('reuses the stored API key when editing leaves the key field blank', async () => {
    validateModelConfigurationMock.mockResolvedValue(undefined);
    const existing = SettingsStore.createModel({
      displayName: 'Existing Model',
      providerType: 'anthropic',
      providerBaseUrl: '',
      modelId: 'claude-before',
      contextWindow: 0,
      maxOutputTokens: 0,
      reasoning: { mode: 'disabled' },
      cacheTtl: '5m',
      supportedInputTypes: [],
    }, 'stored-key');

    const response = await callSettingsRoute(
      'put',
      '/api/settings/models/:id',
      modelPayload({
        displayName: 'Updated Model',
        modelId: 'claude-after',
        apiKey: '',
      }),
      { id: existing.id }
    );

    expect(response.body).toMatchObject({
      displayName: 'Updated Model',
      modelId: 'claude-after',
    });
    expect(response.status).toBe(200);
    expect(validateModelConfigurationMock).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'stored-key' }));
    expect(SettingsStore.getModelWithKey(existing.id)?.apiKey).toBe('stored-key');
  });

  it('persists Anthropic prompt cache TTL while validating the model', async () => {
    validateModelConfigurationMock.mockResolvedValue(undefined);

    const response = await callSettingsRoute('post', '/api/settings/models', modelPayload({ cacheTtl: '1h' }));

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ cacheTtl: '1h' });
    expect(validateModelConfigurationMock).toHaveBeenCalledWith(expect.not.objectContaining({ cacheTtl: expect.anything() }));
    expect(SettingsStore.listModels()[0]?.cacheTtl).toBe('1h');
  });

  it('imports the full skill folder including bundled scripts', async () => {
    const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-import-skill-'));
    fs.mkdirSync(path.join(sourceDir, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'SKILL.md'), `---
name: review-writing
description: Helps write reviews.
---

Run scripts/foo.py when needed.
`, 'utf8');
    fs.writeFileSync(path.join(sourceDir, 'scripts', 'foo.py'), 'print("ok")\n', 'utf8');

    const imported = await callSettingsRoute('post', '/api/settings/skills/import', { path: sourceDir });

    expect(imported.status).toBe(201);
    expect(imported.body).toMatchObject({
      skill: {
        name: 'review-writing',
        description: 'Helps write reviews.',
        skillMdPath: '.a-society/skills/review-writing/SKILL.md',
      },
      notice: 'This skill may bundle scripts the agent can run; they execute only through the normal command-permission prompts.',
    });
    expect(fs.readFileSync(path.join(workspaceRoot, '.a-society', 'skills', 'review-writing', 'scripts', 'foo.py'), 'utf8'))
      .toBe('print("ok")\n');
  });

  it('surfaces malformed skills and returns 404 when deleting a missing skill', async () => {
    fs.mkdirSync(path.join(workspaceRoot, '.a-society', 'skills', 'broken-skill'), { recursive: true });

    const listed = await callSettingsRoute('get', '/api/settings/skills');
    expect(listed.body).toEqual([
      { kind: 'malformed', name: 'broken-skill', reason: 'Missing SKILL.md.' },
    ]);

    const deleted = await callSettingsRoute('delete', '/api/settings/skills/:name', {}, { name: 'missing-skill' });
    expect(deleted.status).toBe(404);
    expect(deleted.body).toMatchObject({ message: 'Skill "missing-skill" not found.' });
  });

  it('validates MCP server creation before saving discovered tools', async () => {
    validateMcpServerConfigurationMock.mockResolvedValue({ toolNames: ['create_issue'] });

    const response = await callSettingsRoute('post', '/api/settings/mcp', {
      name: 'linear',
      transport: 'stdio',
      command: 'node',
      args: ['server.js'],
      env: { LINEAR_API_KEY: 'secret-key' },
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'linear',
      transport: 'stdio',
      toolNames: ['create_issue'],
    });
    expect(validateMcpServerConfigurationMock).toHaveBeenCalledWith(expect.objectContaining({
      name: 'linear',
      command: 'node',
      env: { LINEAR_API_KEY: 'secret-key' },
    }));
    const [saved] = SettingsStore.listMcpServerSummaries();
    expect(saved.toolNames).toEqual(['create_issue']);
    expect(SettingsStore.getMcpServerWithSecrets(saved.id)?.env).toEqual({ LINEAR_API_KEY: 'secret-key' });
  });

  it('blocks MCP server save when validation fails', async () => {
    const timeout = Object.assign(new Error('connect ETIMEDOUT 140.82.112.21:443'), {
      code: 'ETIMEDOUT',
      address: '140.82.112.21',
      port: 443,
    });
    validateMcpServerConfigurationMock.mockRejectedValue(new TypeError('fetch failed', {
      cause: new AggregateError([timeout], ''),
    }));

    const response = await callSettingsRoute('post', '/api/settings/mcp', {
      name: 'linear',
      transport: 'stdio',
      command: 'node',
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ message: 'fetch failed (connect ETIMEDOUT 140.82.112.21:443)' });
    expect(SettingsStore.listMcpServerSummaries()).toEqual([]);
  });

  it('deletes MCP servers', async () => {
    const server = SettingsStore.createMcpServer({
      name: 'linear',
      transport: 'stdio',
      command: 'node',
      env: { TOKEN: 'secret' },
      toolNames: ['search'],
    });

    const response = await callSettingsRoute('delete', '/api/settings/mcp/:id', {}, { id: server.id });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(SettingsStore.listMcpServerSummaries()).toEqual([]);
    expect(SettingsStore.getMcpServerWithSecrets(server.id)).toBeNull();
  });

  it('reads and updates automation settings, ignoring invalid values', async () => {
    const initial = await callSettingsRoute('get', '/api/settings/automation');
    expect(initial.body).toEqual({ models: 'manual', skills: 'manual', mcpServers: 'manual' });

    const updated = await callSettingsRoute('put', '/api/settings/automation', { skills: 'auto', mcpServers: 'bogus' });
    expect(updated.status).toBe(200);
    // skills accepted; the invalid mcpServers value is ignored (stays manual).
    expect(updated.body).toEqual({ models: 'manual', skills: 'auto', mcpServers: 'manual' });

    const reread = await callSettingsRoute('get', '/api/settings/automation');
    expect(reread.body).toEqual({ models: 'manual', skills: 'auto', mcpServers: 'manual' });
  });
});
