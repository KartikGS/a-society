import fs from 'node:fs';
import path from 'node:path';

export function seedTestModelSettings(
  settingsDir: string,
  config: {
    providerBaseUrl: string;
    apiKey?: string;
    modelId?: string;
  }
): void {
  fs.mkdirSync(settingsDir, { recursive: true });

  const model = {
    id: 'test-model',
    displayName: 'Test Model',
    providerType: 'openai-compatible' as const,
    providerBaseUrl: config.providerBaseUrl,
    modelId: config.modelId ?? 'mock-model',
    contextWindow: 0,
    maxOutputTokens: 0,
    supportsThinking: false,
    supportedInputTypes: [],
    active: true,
  };

  fs.writeFileSync(
    path.join(settingsDir, 'settings.json'),
    JSON.stringify({ version: 1, models: [model] }, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(settingsDir, 'secrets.json'),
    JSON.stringify({ [model.id]: config.apiKey ?? 'test-key' }, null, 2),
    'utf8'
  );
}
