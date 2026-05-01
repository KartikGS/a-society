import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  configureSettingsStore,
  createModel,
  getEnabledWebSearchApiKey,
  getActiveModelWithKey,
  getToolSettings,
  listModels,
  updateModel,
  updateWebSearchToolSettings,
} from '../src/settings-store.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\nsettings-store');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-settings-store-'));
const originalSettingsDir = process.env.A_SOCIETY_SETTINGS_DIR;

delete process.env.A_SOCIETY_SETTINGS_DIR;
configureSettingsStore(tmpDir);

test('default settings directory lives under the configured workspace root', () => {
  createModel({
    displayName: 'Workspace Model',
    providerType: 'openai-compatible',
    providerBaseUrl: 'http://127.0.0.1:1/v1',
    modelId: 'workspace-model',
    contextWindow: 0,
    maxOutputTokens: 0,
    supportsThinking: false,
    supportedInputTypes: [],
  }, 'workspace-key');

  const settingsPath = path.join(tmpDir, '.a-society', 'settings.json');
  const secretsPath = path.join(tmpDir, '.a-society', 'secrets.json');

  assert.ok(fs.existsSync(settingsPath), 'settings.json should be created in the workspace .a-society directory');
  assert.ok(fs.existsSync(secretsPath), 'secrets.json should be created in the workspace .a-society directory');
  assert.strictEqual(listModels().length, 1);
  assert.strictEqual(getActiveModelWithKey()?.apiKey, 'workspace-key');
});

test('updateModel changes persisted config and preserves api key when left blank', () => {
  const existing = listModels()[0];
  const updated = updateModel(existing.id, {
    displayName: 'Workspace Model Updated',
    providerType: 'openai-compatible',
    providerBaseUrl: 'http://127.0.0.1:2/v1',
    modelId: 'workspace-model-v2',
    contextWindow: 64000,
    maxOutputTokens: 4096,
    supportsThinking: true,
    supportedInputTypes: ['image', 'audio'],
  });

  assert.strictEqual(updated.displayName, 'Workspace Model Updated');
  assert.strictEqual(updated.modelId, 'workspace-model-v2');
  assert.deepStrictEqual(updated.supportedInputTypes, ['image', 'audio']);
  assert.strictEqual(getActiveModelWithKey()?.apiKey, 'workspace-key');
});

test('web search tool stores Tavily key in secrets and only enables when configured', () => {
  assert.deepStrictEqual(getToolSettings(), {
    webSearch: {
      enabled: false,
      hasApiKey: false,
    },
  });
  assert.strictEqual(getEnabledWebSearchApiKey(), null);

  assert.throws(
    () => updateWebSearchToolSettings({ enabled: true }),
    /Tavily API key is required/
  );

  let tools = updateWebSearchToolSettings({ enabled: false, apiKey: 'tavily-test-key' });
  assert.deepStrictEqual(tools, {
    webSearch: {
      enabled: false,
      hasApiKey: true,
    },
  });
  assert.strictEqual(getEnabledWebSearchApiKey(), null);

  tools = updateWebSearchToolSettings({ enabled: true });
  assert.deepStrictEqual(tools, {
    webSearch: {
      enabled: true,
      hasApiKey: true,
    },
  });
  assert.strictEqual(getEnabledWebSearchApiKey(), 'tavily-test-key');
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (originalSettingsDir === undefined) {
  delete process.env.A_SOCIETY_SETTINGS_DIR;
} else {
  process.env.A_SOCIETY_SETTINGS_DIR = originalSettingsDir;
}
configureSettingsStore(process.cwd());
fs.rmSync(tmpDir, { recursive: true, force: true });

if (failed > 0) {
  process.exit(1);
}
