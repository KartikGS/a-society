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

interface SettingsData {
  version: number;
  models: ModelConfig[];
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

export const MODEL_CONFIGURATION_REQUIRED_MESSAGE =
  'No active model is configured in Settings. Add and activate a model before starting or continuing runtime work.';

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

function loadSettings(): SettingsData {
  const settingsPath = getSettingsPath();
  if (!fs.existsSync(settingsPath)) {
    return { version: 1, models: [] };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as {
      version?: number;
      models?: PersistedModelConfig[];
    };
    return {
      version: raw.version ?? 1,
      models: Array.isArray(raw.models) ? raw.models.map(normalizeModelConfig) : [],
    };
  } catch {
    return { version: 1, models: [] };
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
