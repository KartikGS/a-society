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
