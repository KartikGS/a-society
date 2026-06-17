import fs from 'node:fs';
import type http from 'node:http';
import path from 'node:path';

export function listenOnLocalhost(server: http.Server): Promise<number> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('error', onError);
      reject(error);
    };

    server.once('error', onError);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', onError);
      const address = server.address();
      if (address && typeof address === 'object') {
        resolve(address.port);
        return;
      }
      reject(new Error('Test server did not expose a TCP port.'));
    });
  });
}

export function seedTestModelSettings(
  settingsDir: string,
  config: {
    providerBaseUrl: string;
    apiKey?: string;
    modelId?: string;
    contextWindow?: number;
  }
): void {
  seedTestMultiModelSettings(settingsDir, [{
    id: 'test-model',
    displayName: 'Test Model',
    providerBaseUrl: config.providerBaseUrl,
    modelId: config.modelId ?? 'mock-model',
    contextWindow: config.contextWindow,
    apiKey: config.apiKey,
    active: true,
  }]);
}

export interface SeededTestModel {
  id: string;
  providerBaseUrl: string;
  displayName?: string;
  modelId?: string;
  contextWindow?: number;
  apiKey?: string;
  active?: boolean;
}

export function seedTestMultiModelSettings(settingsDir: string, models: SeededTestModel[]): void {
  fs.mkdirSync(settingsDir, { recursive: true });

  const entries = models.map((model) => ({
    id: model.id,
    displayName: model.displayName ?? model.id,
    providerType: 'openai-compatible' as const,
    providerBaseUrl: model.providerBaseUrl,
    modelId: model.modelId ?? model.id,
    contextWindow: model.contextWindow ?? 0,
    maxOutputTokens: 0,
    reasoning: { mode: 'disabled' },
    cacheTtl: '5m',
    supportedInputTypes: [],
    active: model.active ?? false,
  }));

  fs.writeFileSync(
    path.join(settingsDir, 'settings.json'),
    JSON.stringify({ version: 1, models: entries }, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(settingsDir, 'secrets.json'),
    JSON.stringify(
      Object.fromEntries(models.map((model) => [model.id, model.apiKey ?? 'test-key'])),
      null,
      2
    ),
    'utf8'
  );
}
