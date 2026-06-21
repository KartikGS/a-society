import type { ModelReasoningConfig } from '../../../../shared/model-reasoning.js';
import type { PromptCacheTtl } from '../../../../shared/prompt-cache.js';
import type { InputModality, ProviderType } from '../../../../shared/settings.js';

export interface ModelFormState {
  displayName: string;
  providerType: ProviderType;
  providerBaseUrl: string;
  modelId: string;
  apiKey: string;
  contextWindow: string;
  maxOutputTokens: string;
  reasoning: ModelReasoningConfig;
  cacheTtl: PromptCacheTtl;
  customReasoningExtraBodyJson: string;
  supportedInputTypes: InputModality[];
}

export interface ToolFormState {
  tavilyApiKey: string;
  webSearchEnabled: boolean;
}

export interface FeedFormState {
  historyLimit: string;
}

export interface SkillFormState {
  importPath: string;
}

export interface McpFormState {
  name: string;
  transport: 'stdio' | 'http';
  command: string;
  args: string;
  envText: string;
  url: string;
  headersText: string;
}

export type EditorView = 'list' | 'add' | 'edit';
