import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateModelConfiguration } from '../../src/providers/model-validation.js';
import { registerSettingsRoutes } from '../../src/server/settings-routes.js';
import * as SettingsStore from '../../src/settings/settings-store.js';

vi.mock('../../src/providers/model-validation.js', () => ({
  validateModelConfiguration: vi.fn(),
}));

const validateModelConfigurationMock = vi.mocked(validateModelConfiguration);
let workspaceRoot: string;

beforeEach(() => {
  validateModelConfigurationMock.mockReset();
  workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-settings-routes-'));
  SettingsStore.configureSettingsStore(workspaceRoot);
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
});
