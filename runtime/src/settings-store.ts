import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
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
  supportsMultimodal: boolean;
  active: boolean;
}

export interface ModelConfigWithKey extends ModelConfig {
  apiKey: string;
}

interface SettingsData {
  version: number;
  models: ModelConfig[];
}

const SETTINGS_DIR = path.join(os.homedir(), '.a-society');
const SETTINGS_PATH = path.join(SETTINGS_DIR, 'settings.json');
const SECRETS_PATH = path.join(SETTINGS_DIR, 'secrets.json');

function ensureDir(): void {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true, mode: 0o700 });
  }
}

function loadSettings(): SettingsData {
  if (!fs.existsSync(SETTINGS_PATH)) {
    return { version: 1, models: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')) as SettingsData;
  } catch {
    return { version: 1, models: [] };
  }
}

function saveSettings(data: SettingsData): void {
  ensureDir();
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), 'utf8');
  fs.chmodSync(SETTINGS_PATH, 0o600);
}

function loadSecrets(): Record<string, string> {
  if (!fs.existsSync(SECRETS_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(SECRETS_PATH, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveSecrets(secrets: Record<string, string>): void {
  ensureDir();
  fs.writeFileSync(SECRETS_PATH, JSON.stringify(secrets, null, 2), 'utf8');
  fs.chmodSync(SECRETS_PATH, 0o600);
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
