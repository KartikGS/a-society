import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface ModelConfig {
  id: string;
  displayName: string;
  providerType: 'anthropic' | 'openai-compatible';
  providerBaseUrl: string;
  modelId: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsThinking: boolean;
  supportedInputTypes: Array<'image' | 'audio' | 'video'>;
  active: boolean;
}

export interface ModelConfigWithKey extends ModelConfig {
  apiKey: string;
}

interface StoredToolSettings {
  webSearch: {
    enabled: boolean;
  };
}

export interface ToolSettings {
  webSearch: {
    enabled: boolean;
    hasApiKey: boolean;
  };
}

interface SettingsData {
  version: number;
  models: ModelConfig[];
  tools: StoredToolSettings;
}

interface PersistedModelConfig {
  id: string;
  displayName: string;
  providerType: 'anthropic' | 'openai-compatible';
  providerBaseUrl: string;
  modelId: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsThinking: boolean;
  supportedInputTypes?: unknown;
  active: boolean;
}

interface PersistedToolSettings {
  webSearch?: {
    enabled?: unknown;
  };
}

export const MODEL_CONFIGURATION_REQUIRED_MESSAGE =
  'No active model is configured in Settings. Add and activate a model before starting or continuing runtime work.';
const WEB_SEARCH_SECRET_KEY = '__tool_web_search_tavily_api_key';

let defaultWorkspaceRoot = process.cwd();

export function configureSettingsStore(workspaceRoot: string): void {
  defaultWorkspaceRoot = path.resolve(workspaceRoot);
}

function getSettingsDir(): string {
  const override = process.env.A_SOCIETY_SETTINGS_DIR?.trim();
  return override && override.length > 0
    ? path.resolve(override)
    : path.join(defaultWorkspaceRoot, '.a-society');
}

function getSettingsPath(): string {
  return path.join(getSettingsDir(), 'settings.json');
}

function getSecretsPath(): string {
  return path.join(getSettingsDir(), 'secrets.json');
}

function isUsableModelConfig(model: ModelConfigWithKey | null): model is ModelConfigWithKey {
  if (!model) return false;
  if (model.modelId.trim() === '' || model.apiKey.trim() === '') return false;
  if (model.providerType === 'openai-compatible' && model.providerBaseUrl.trim() === '') return false;
  return true;
}

function ensureDir(): void {
  const settingsDir = getSettingsDir();
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true, mode: 0o700 });
  }
}

function normalizeSupportedInputTypes(supportedInputTypes: unknown): Array<'image' | 'audio' | 'video'> {
  const allowed = new Set(['image', 'audio', 'video']);
  if (Array.isArray(supportedInputTypes)) {
    return supportedInputTypes
      .filter((value): value is 'image' | 'audio' | 'video' => typeof value === 'string' && allowed.has(value))
      .filter((value, index, values) => values.indexOf(value) === index);
  }
  return [];
}

function normalizeModelConfig(model: PersistedModelConfig): ModelConfig {
  return {
    id: model.id,
    displayName: model.displayName,
    providerType: model.providerType,
    providerBaseUrl: model.providerBaseUrl,
    modelId: model.modelId,
    contextWindow: model.contextWindow,
    maxOutputTokens: model.maxOutputTokens,
    supportsThinking: model.supportsThinking,
    supportedInputTypes: normalizeSupportedInputTypes(model.supportedInputTypes),
    active: model.active,
  };
}

function normalizeStoredToolSettings(tools: unknown): StoredToolSettings {
  const raw = tools && typeof tools === 'object' ? tools as PersistedToolSettings : {};
  return {
    webSearch: {
      enabled: raw.webSearch?.enabled === true,
    },
  };
}

function loadSettings(): SettingsData {
  const settingsPath = getSettingsPath();
  if (!fs.existsSync(settingsPath)) {
    return { version: 1, models: [], tools: normalizeStoredToolSettings(undefined) };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as {
      version?: number;
      models?: PersistedModelConfig[];
      tools?: PersistedToolSettings;
    };
    return {
      version: raw.version ?? 1,
      models: Array.isArray(raw.models) ? raw.models.map(normalizeModelConfig) : [],
      tools: normalizeStoredToolSettings(raw.tools),
    };
  } catch {
    return { version: 1, models: [], tools: normalizeStoredToolSettings(undefined) };
  }
}

function saveSettings(data: SettingsData): void {
  const settingsPath = getSettingsPath();
  ensureDir();
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
  fs.chmodSync(settingsPath, 0o600);
}

function loadSecrets(): Record<string, string> {
  const secretsPath = getSecretsPath();
  if (!fs.existsSync(secretsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(secretsPath, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveSecrets(secrets: Record<string, string>): void {
  const secretsPath = getSecretsPath();
  ensureDir();
  fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2), 'utf8');
  fs.chmodSync(secretsPath, 0o600);
}

export function listModels(): ModelConfig[] {
  return loadSettings().models;
}

export function createModel(
  params: Omit<ModelConfig, 'id' | 'active'>,
  apiKey: string
): ModelConfig {
  const data = loadSettings();
  const isFirst = data.models.length === 0;
  const model: ModelConfig = { ...params, id: crypto.randomUUID(), active: isFirst };
  data.models.push(model);
  saveSettings(data);

  const secrets = loadSecrets();
  secrets[model.id] = apiKey;
  saveSecrets(secrets);

  return model;
}

export function updateModel(
  id: string,
  params: Omit<ModelConfig, 'id' | 'active'>,
  apiKey?: string
): ModelConfig {
  const data = loadSettings();
  const idx = data.models.findIndex((model) => model.id === id);
  if (idx === -1) {
    throw new Error(`Model "${id}" not found.`);
  }

  const existing = data.models[idx];
  const updated: ModelConfig = {
    ...params,
    id: existing.id,
    active: existing.active,
  };
  data.models[idx] = updated;
  saveSettings(data);

  if (typeof apiKey === 'string' && apiKey.trim() !== '') {
    const secrets = loadSecrets();
    secrets[id] = apiKey;
    saveSecrets(secrets);
  }

  return updated;
}

export function deleteModel(id: string): void {
  const data = loadSettings();
  const idx = data.models.findIndex((m) => m.id === id);
  if (idx === -1) return;

  const wasActive = data.models[idx].active;
  data.models.splice(idx, 1);
  if (wasActive && data.models.length > 0) {
    data.models[0].active = true;
  }
  saveSettings(data);

  const secrets = loadSecrets();
  delete secrets[id];
  saveSecrets(secrets);
}

export function activateModel(id: string): void {
  const data = loadSettings();
  let found = false;
  for (const model of data.models) {
    model.active = model.id === id;
    if (model.id === id) found = true;
  }
  if (!found) throw new Error(`Model "${id}" not found.`);
  saveSettings(data);
}

export function getActiveModelWithKey(): ModelConfigWithKey | null {
  const data = loadSettings();
  const active = data.models.find((m) => m.active) ?? null;
  if (!active) return null;

  const secrets = loadSecrets();
  return { ...active, apiKey: secrets[active.id] ?? '' };
}

export function hasUsableConfiguredModel(): boolean {
  return isUsableModelConfig(getActiveModelWithKey());
}

export function getToolSettings(): ToolSettings {
  const data = loadSettings();
  const secrets = loadSecrets();
  const apiKey = secrets[WEB_SEARCH_SECRET_KEY] ?? '';
  const hasApiKey = apiKey.trim() !== '';

  return {
    webSearch: {
      enabled: data.tools.webSearch.enabled && hasApiKey,
      hasApiKey,
    },
  };
}

export function updateWebSearchToolSettings(params: {
  enabled: boolean;
  apiKey?: string;
}): ToolSettings {
  const data = loadSettings();
  const secrets = loadSecrets();
  const nextApiKey = typeof params.apiKey === 'string' ? params.apiKey.trim() : '';

  if (nextApiKey !== '') {
    secrets[WEB_SEARCH_SECRET_KEY] = nextApiKey;
    saveSecrets(secrets);
  }

  const hasApiKey = (secrets[WEB_SEARCH_SECRET_KEY] ?? '').trim() !== '';
  if (params.enabled && !hasApiKey) {
    throw new Error('Tavily API key is required to enable web search.');
  }

  data.tools.webSearch.enabled = params.enabled && hasApiKey;
  saveSettings(data);
  return getToolSettings();
}

export function getEnabledWebSearchApiKey(): string | null {
  const data = loadSettings();
  if (!data.tools.webSearch.enabled) return null;

  const secrets = loadSecrets();
  const apiKey = secrets[WEB_SEARCH_SECRET_KEY] ?? '';
  return apiKey.trim() !== '' ? apiKey : null;
}
