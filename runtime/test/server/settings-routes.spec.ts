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

beforeEach(() => {
  validateModelConfigurationMock.mockReset();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-settings-routes-'));
  SettingsStore.configureSettingsStore(tmpDir);
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

function findRouteHandler(app: express.Express, method: 'post' | 'put', routePath: string) {
  const stack = (app as unknown as { _router: { stack: any[] } })._router.stack;
  const layer = stack.find((entry) => entry.route?.path === routePath && entry.route.methods[method]);
  if (!layer) throw new Error(`Route ${method.toUpperCase()} ${routePath} was not registered.`);
  return layer.route.stack[layer.route.stack.length - 1].handle as (
    req: { body: unknown; params: Record<string, string> },
    res: MockResponse
  ) => Promise<void> | void;
}

async function callSettingsRoute(
  method: 'post' | 'put',
  routePath: string,
  body: unknown,
  params: Record<string, string> = {}
): Promise<{ status: number; body: unknown }> {
  const app = express();
  registerSettingsRoutes(app);
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
});
