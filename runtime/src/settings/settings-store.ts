import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getWorkspaceRoot } from '../common/workspace.js';
import { DISABLED_REASONING, normalizeModelReasoningConfig } from '../../shared/model-reasoning.js';
import { normalizePromptCacheTtl } from '../common/types.js';
import type {
  AutomationSettings,
  FeedSettings,
  McpServerConfig,
  McpServerSummary,
  McpTransport,
  ModelConfig,
  ModelConfigWithKey,
  SelectionMode,
  ToolSettings,
} from '../../shared/settings.js';

export type {
  AutomationSettings,
  FeedSettings,
  McpServerConfig,
  McpServerSummary,
  McpTransport,
  ModelConfig,
  ModelConfigWithKey,
  SelectionMode,
  ToolSettings,
} from '../../shared/settings.js';

export interface ResolvedMcpServer extends McpServerConfig {
  env: Record<string, string>;
  headers: Record<string, string>;
}

export interface McpServerWriteParams {
  name: string;
  transport: McpTransport;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  toolNames?: string[];
}

interface StoredToolSettings {
  webSearch: {
    enabled: boolean;
  };
}

interface SettingsData {
  models: ModelConfig[];
  mcpServers: McpServerConfig[];
  tools: StoredToolSettings;
  feed: FeedSettings;
  automation: AutomationSettings;
}

interface PersistedModelConfig {
  id: string;
  displayName: string;
  providerType: 'anthropic' | 'openai-compatible';
  providerBaseUrl: string;
  modelId: string;
  contextWindow: number;
  maxOutputTokens: number;
  reasoning?: unknown;
  cacheTtl?: unknown;
  supportedInputTypes?: unknown;
  active: boolean;
}

interface PersistedToolSettings {
  webSearch?: {
    enabled?: unknown;
  };
}

interface PersistedFeedSettings {
  historyLimit?: unknown;
}

export const MODEL_CONFIGURATION_REQUIRED_MESSAGE =
  'No active model is configured in Settings. Add and activate a model before starting or continuing runtime work.';
export const DEFAULT_FEED_HISTORY_LIMIT = 400;
export const MIN_FEED_HISTORY_LIMIT = 50;
export const MAX_FEED_HISTORY_LIMIT = 10000;
const WEB_SEARCH_SECRET_KEY = '__tool_web_search_tavily_api_key';
const MCP_SERVER_NAME_PATTERN = /^[a-z0-9-]{1,32}$/;

function getSettingsDir(): string {
  return path.join(getWorkspaceRoot(), '.a-society');
}

function getSettingsPath(): string {
  return path.join(getSettingsDir(), 'settings.json');
}

function getSecretsPath(): string {
  return path.join(getSettingsDir(), 'secrets.json');
}

export function isUsableModelConfig(model: ModelConfigWithKey | null): model is ModelConfigWithKey {
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
    reasoning: normalizeModelReasoningConfig(model.reasoning ?? DISABLED_REASONING),
    cacheTtl: normalizePromptCacheTtl(model.cacheTtl),
    supportedInputTypes: normalizeSupportedInputTypes(model.supportedInputTypes),
    active: model.active,
  };
}

export function normalizeMcpStringArray(
  value: unknown,
  options: { trim?: boolean; unique?: boolean } = {}
): string[] {
  if (!Array.isArray(value)) return [];
  const entries = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => options.trim === false ? entry : entry.trim())
    .filter((entry) => entry !== '');
  return options.unique === false
    ? entries
    : entries.filter((entry, index) => entries.indexOf(entry) === index);
}

export function isMcpTransport(value: unknown): value is McpTransport {
  return value === 'stdio' || value === 'http';
}

export function isValidMcpServerName(name: string): boolean {
  return MCP_SERVER_NAME_PATTERN.test(name);
}

function normalizeMcpServerConfig(value: unknown): McpServerConfig | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== 'string' ||
    typeof raw.name !== 'string' ||
    !isValidMcpServerName(raw.name) ||
    !isMcpTransport(raw.transport)
  ) {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    transport: raw.transport,
    ...(typeof raw.command === 'string' && raw.command.trim() !== '' ? { command: raw.command.trim() } : {}),
    args: normalizeMcpStringArray(raw.args, { trim: false }),
    envKeys: normalizeMcpStringArray(raw.envKeys),
    ...(typeof raw.url === 'string' && raw.url.trim() !== '' ? { url: raw.url.trim() } : {}),
    headerKeys: normalizeMcpStringArray(raw.headerKeys),
    toolNames: normalizeMcpStringArray(raw.toolNames),
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

function normalizeFeedHistoryLimit(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_FEED_HISTORY_LIMIT;
  const integer = Math.trunc(parsed);
  return Math.min(MAX_FEED_HISTORY_LIMIT, Math.max(MIN_FEED_HISTORY_LIMIT, integer));
}

function normalizeFeedSettings(feed: unknown): FeedSettings {
  const raw = feed && typeof feed === 'object' ? feed as PersistedFeedSettings : {};
  return {
    historyLimit: normalizeFeedHistoryLimit(raw.historyLimit),
  };
}

function normalizeSelectionMode(value: unknown): SelectionMode {
  return value === 'auto' ? 'auto' : 'manual';
}

function normalizeAutomationSettings(automation: unknown): AutomationSettings {
  const raw = automation && typeof automation === 'object' ? automation as Record<string, unknown> : {};
  return {
    models: normalizeSelectionMode(raw.models),
    skills: normalizeSelectionMode(raw.skills),
    mcpServers: normalizeSelectionMode(raw.mcpServers),
  };
}

function loadSettings(): SettingsData {
  const settingsPath = getSettingsPath();
  if (!fs.existsSync(settingsPath)) {
    return {
      models: [],
      mcpServers: [],
      tools: normalizeStoredToolSettings(undefined),
      feed: normalizeFeedSettings(undefined),
      automation: normalizeAutomationSettings(undefined),
    };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as {
      models?: PersistedModelConfig[];
      mcpServers?: unknown[];
      tools?: PersistedToolSettings;
      feed?: PersistedFeedSettings;
      automation?: unknown;
    };
    return {
      models: Array.isArray(raw.models) ? raw.models.map(normalizeModelConfig) : [],
      mcpServers: Array.isArray(raw.mcpServers)
        ? raw.mcpServers.map(normalizeMcpServerConfig).filter((entry): entry is McpServerConfig => entry !== null)
        : [],
      tools: normalizeStoredToolSettings(raw.tools),
      feed: normalizeFeedSettings(raw.feed),
      automation: normalizeAutomationSettings(raw.automation),
    };
  } catch {
    return {
      models: [],
      mcpServers: [],
      tools: normalizeStoredToolSettings(undefined),
      feed: normalizeFeedSettings(undefined),
      automation: normalizeAutomationSettings(undefined),
    };
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

function mcpEnvSecretKey(id: string, key: string): string {
  return `mcp:${id}:env:${key}`;
}

function mcpHeaderSecretKey(id: string, key: string): string {
  return `mcp:${id}:hdr:${key}`;
}

export function normalizeMcpSecretValues(values: unknown): Record<string, string> {
  const normalized: Record<string, string> = {};
  if (!values || typeof values !== 'object' || Array.isArray(values)) return normalized;
  for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
    const normalizedKey = key.trim();
    if (!normalizedKey || typeof value !== 'string') continue;
    normalized[normalizedKey] = value;
  }
  return normalized;
}

export function normalizeMcpServerWriteParams(
  params: McpServerWriteParams,
  id = '__pending__'
): ResolvedMcpServer {
  const env = normalizeMcpSecretValues(params.env);
  const headers = normalizeMcpSecretValues(params.headers);
  return {
    id,
    name: params.name.trim(),
    transport: params.transport,
    ...(params.transport === 'stdio' ? { command: (params.command ?? '').trim() } : {}),
    args: normalizeMcpStringArray(params.args, { trim: false }),
    envKeys: Object.keys(env).sort((a, b) => a.localeCompare(b)),
    env,
    ...(params.transport === 'http' ? { url: (params.url ?? '').trim() } : {}),
    headerKeys: Object.keys(headers).sort((a, b) => a.localeCompare(b)),
    headers,
    toolNames: normalizeMcpStringArray(params.toolNames).sort((a, b) => a.localeCompare(b)),
  };
}

export function getMcpServerWriteParamError(
  params: McpServerWriteParams,
  existingServers: McpServerConfig[],
  currentId?: string
): string | null {
  const name = params.name.trim();
  if (!isValidMcpServerName(name)) {
    return 'MCP server name must match /^[a-z0-9-]{1,32}$/.';
  }
  if (!isMcpTransport(params.transport)) {
    return 'MCP transport must be "stdio" or "http".';
  }
  if (existingServers.some((server) => server.name === name && server.id !== currentId)) {
    return `MCP server name "${name}" already exists.`;
  }
  if (params.transport === 'stdio' && !(params.command ?? '').trim()) {
    return 'MCP stdio server command is required.';
  }
  if (params.transport === 'http') {
    const url = (params.url ?? '').trim();
    if (!url) return 'MCP HTTP server URL is required.';
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('invalid protocol');
      }
    } catch {
      return 'MCP HTTP server URL must be a valid http:// or https:// URL.';
    }
  }
  return null;
}

function assertValidMcpServerParams(
  params: McpServerWriteParams,
  existingServers: McpServerConfig[],
  currentId?: string
): void {
  const error = getMcpServerWriteParamError(params, existingServers, currentId);
  if (error) throw new Error(error);
}

function buildMcpServerConfig(id: string, params: McpServerWriteParams): McpServerConfig {
  const resolved = normalizeMcpServerWriteParams(params, id);
  return {
    id,
    name: resolved.name,
    transport: resolved.transport,
    ...(resolved.transport === 'stdio' ? { command: resolved.command ?? '' } : {}),
    args: resolved.args,
    envKeys: resolved.envKeys,
    ...(resolved.transport === 'http' ? { url: resolved.url ?? '' } : {}),
    headerKeys: resolved.headerKeys,
    toolNames: resolved.toolNames,
  };
}

function deleteMcpSecretsForServer(secrets: Record<string, string>, id: string): void {
  const prefixes = [`mcp:${id}:env:`, `mcp:${id}:hdr:`];
  for (const key of Object.keys(secrets)) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      delete secrets[key];
    }
  }
}

function saveMcpSecrets(id: string, params: McpServerWriteParams): void {
  const secrets = loadSecrets();
  deleteMcpSecretsForServer(secrets, id);

  for (const [key, value] of Object.entries(normalizeMcpSecretValues(params.env))) {
    secrets[mcpEnvSecretKey(id, key)] = value;
  }
  for (const [key, value] of Object.entries(normalizeMcpSecretValues(params.headers))) {
    secrets[mcpHeaderSecretKey(id, key)] = value;
  }

  saveSecrets(secrets);
}

export function listModels(): ModelConfig[] {
  return loadSettings().models;
}

export function getModelWithKey(id: string): ModelConfigWithKey | null {
  const model = loadSettings().models.find((entry) => entry.id === id) ?? null;
  if (!model) return null;

  const secrets = loadSecrets();
  return { ...model, apiKey: secrets[model.id] ?? '' };
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

export function listMcpServers(): McpServerConfig[] {
  return loadSettings().mcpServers;
}

export function listMcpServerSummaries(): McpServerSummary[] {
  return loadSettings().mcpServers.map((server) => ({
    id: server.id,
    name: server.name,
    transport: server.transport,
    toolNames: [...server.toolNames],
  }));
}

export function getMcpServerWithSecrets(id: string): ResolvedMcpServer | null {
  const server = loadSettings().mcpServers.find((entry) => entry.id === id) ?? null;
  if (!server) return null;

  const secrets = loadSecrets();
  const env: Record<string, string> = {};
  for (const key of server.envKeys ?? []) {
    env[key] = secrets[mcpEnvSecretKey(server.id, key)] ?? '';
  }
  const headers: Record<string, string> = {};
  for (const key of server.headerKeys ?? []) {
    headers[key] = secrets[mcpHeaderSecretKey(server.id, key)] ?? '';
  }

  return { ...server, env, headers };
}

export function createMcpServer(params: McpServerWriteParams): McpServerConfig {
  const data = loadSettings();
  assertValidMcpServerParams(params, data.mcpServers);
  const id = crypto.randomUUID();
  const server = buildMcpServerConfig(id, params);
  data.mcpServers.push(server);
  saveSettings(data);
  saveMcpSecrets(id, params);
  return server;
}

export function updateMcpServer(id: string, params: McpServerWriteParams): McpServerConfig {
  const data = loadSettings();
  const idx = data.mcpServers.findIndex((server) => server.id === id);
  if (idx === -1) {
    throw new Error(`MCP server "${id}" not found.`);
  }
  assertValidMcpServerParams(params, data.mcpServers, id);
  const server = buildMcpServerConfig(id, params);
  data.mcpServers[idx] = server;
  saveSettings(data);
  saveMcpSecrets(id, params);
  return server;
}

export function deleteMcpServer(id: string): void {
  const data = loadSettings();
  const idx = data.mcpServers.findIndex((server) => server.id === id);
  if (idx === -1) return;

  data.mcpServers.splice(idx, 1);
  saveSettings(data);

  const secrets = loadSecrets();
  deleteMcpSecretsForServer(secrets, id);
  saveSecrets(secrets);
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

export function getFeedSettings(): FeedSettings {
  return loadSettings().feed;
}

export function getAutomationSettings(): AutomationSettings {
  return loadSettings().automation;
}

export function updateAutomationSettings(params: Partial<AutomationSettings>): AutomationSettings {
  const data = loadSettings();
  data.automation = normalizeAutomationSettings({ ...data.automation, ...params });
  saveSettings(data);
  return data.automation;
}

export function updateFeedSettings(params: {
  historyLimit: number;
}): FeedSettings {
  const data = loadSettings();
  data.feed = {
    historyLimit: normalizeFeedHistoryLimit(params.historyLimit),
  };
  saveSettings(data);
  return data.feed;
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
