import type { ModelReasoningConfig } from './model-reasoning.js';
import type { PromptCacheTtl } from './prompt-cache.js';

export type ProviderType = 'anthropic' | 'openai-compatible';
/** Host coding agents that agent mode can run role turns on. */
export const HOST_AGENT_IDS = ['claude-code'] as const;
export type HostAgentId = typeof HOST_AGENT_IDS[number];

export function isHostAgentId(value: unknown): value is HostAgentId {
  return (HOST_AGENT_IDS as readonly unknown[]).includes(value);
}
export type InputModality = 'image' | 'audio' | 'video';

export interface ModelConfig {
  id: string;
  displayName: string;
  providerType: ProviderType;
  providerBaseUrl: string;
  modelId: string;
  contextWindow: number;
  maxOutputTokens: number;
  reasoning: ModelReasoningConfig;
  cacheTtl: PromptCacheTtl;
  supportedInputTypes: InputModality[];
  active: boolean;
}

export interface ModelConfigWithKey extends ModelConfig {
  apiKey: string;
}

export interface SettingsStatus {
  hasConfiguredModel: boolean;
  modelCount: number;
  /** The backend new flows will be pinned to. */
  turnBackend: 'api' | 'host';
  /** Whether that backend can run turns now (a usable model, or a ready host agent). */
  turnBackendReady: boolean;
}

/** Whether new flows run role turns through LLM APIs or a host coding agent. */
export interface AgentModeSettings {
  mode: 'api' | 'host';
  hostAgentId: HostAgentId | null;
  /** null looks the host's command up on PATH. */
  executablePath: string | null;
}

export const DEFAULT_AGENT_MODE_SETTINGS: AgentModeSettings = {
  mode: 'api',
  hostAgentId: null,
  executablePath: null,
};

export interface HostModelOption {
  id: string;
  displayName: string;
}

/** A host model choice. `model: null` = host default model; `effort: null` = host default effort. */
export interface HostModelChoice {
  model: string | null;
  effort: string | null;
}

export interface HostAgentSummary {
  id: HostAgentId;
  displayName: string;
  supportedVersions: { min: string; maxExclusive: string };
  /** Empty when the host has no per-turn model flag. */
  models: HostModelOption[];
  /** Empty when the host has no per-turn effort control. */
  effortLevels: string[];
}

export interface AgentModeResponse {
  settings: AgentModeSettings;
  hosts: HostAgentSummary[];
}

/** What a probe of the host found. Account details beyond these fields are never collected. */
export interface HostProbeSummary {
  hostAgentId: HostAgentId;
  displayName: string;
  installed: boolean;
  executablePath: string | null;
  version: string | null;
  supportedVersions: { min: string; maxExclusive: string };
  versionSupported: boolean;
  loggedIn: boolean | null;
  authMethod: string | null;
  subscriptionType: string | null;
  checkedAt: string;
}

export interface WebSearchToolSettings {
  enabled: boolean;
  hasApiKey: boolean;
}

export interface ToolSettings {
  webSearch: WebSearchToolSettings;
}

export interface FeedSettings {
  historyLimit: number;
}

export type SelectionMode = 'auto' | 'manual';

export interface AutomationSettings {
  models: SelectionMode;
  skills: SelectionMode;
  mcpServers: SelectionMode;
}

export type McpTransport = 'stdio' | 'http';

export interface McpServerConfig {
  id: string;
  name: string;
  transport: McpTransport;
  command?: string;
  args?: string[];
  envKeys?: string[];
  url?: string;
  headerKeys?: string[];
  toolNames: string[];
}

export interface McpServerSummary {
  id: string;
  name: string;
  transport: McpTransport;
  toolNames: string[];
}
