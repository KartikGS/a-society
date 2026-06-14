import type { FeedSettings, InputModality, McpServerSummary, ModelConfig, ProviderType, SettingsStatus, SkillLoadResult, SkillSummary, ToolSettings } from './types';
import { normalizeModelReasoningConfig } from '../../src/common/model-reasoning.js';

const INPUT_MODALITY_SET = new Set<InputModality>(['image', 'audio', 'video']);

function isProviderType(value: unknown): value is ProviderType {
  return value === 'anthropic' || value === 'openai-compatible';
}

function normalizeInteger(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.trunc(parsed);
}

function normalizeSupportedInputTypes(supportedInputTypes: unknown): InputModality[] {
  if (Array.isArray(supportedInputTypes)) {
    return supportedInputTypes
      .filter((value): value is InputModality => typeof value === 'string' && INPUT_MODALITY_SET.has(value as InputModality))
      .filter((value, index, values) => values.indexOf(value) === index);
  }
  return [];
}

export function normalizeModelConfig(value: unknown): ModelConfig | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== 'string' ||
    typeof raw.displayName !== 'string' ||
    !isProviderType(raw.providerType) ||
    typeof raw.modelId !== 'string'
  ) {
    return null;
  }

  return {
    id: raw.id,
    displayName: raw.displayName,
    providerType: raw.providerType,
    providerBaseUrl: typeof raw.providerBaseUrl === 'string' ? raw.providerBaseUrl : '',
    modelId: raw.modelId,
    contextWindow: normalizeInteger(raw.contextWindow),
    maxOutputTokens: normalizeInteger(raw.maxOutputTokens),
    reasoning: normalizeModelReasoningConfig(raw.reasoning),
    supportedInputTypes: normalizeSupportedInputTypes(raw.supportedInputTypes),
    active: raw.active === true,
  };
}

export function normalizeModelConfigs(value: unknown): ModelConfig[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => normalizeModelConfig(entry))
    .filter((entry): entry is ModelConfig => entry !== null);
}

export function normalizeSettingsStatus(value: unknown): SettingsStatus | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  if (typeof raw.hasConfiguredModel !== 'boolean') return null;

  return {
    hasConfiguredModel: raw.hasConfiguredModel,
    modelCount: normalizeInteger(raw.modelCount),
  };
}

export function normalizeToolSettings(value: unknown): ToolSettings | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  const webSearch = raw.webSearch;
  if (!webSearch || typeof webSearch !== 'object') return null;

  const webSearchRaw = webSearch as Record<string, unknown>;
  if (typeof webSearchRaw.enabled !== 'boolean' || typeof webSearchRaw.hasApiKey !== 'boolean') {
    return null;
  }

  return {
    webSearch: {
      enabled: webSearchRaw.enabled,
      hasApiKey: webSearchRaw.hasApiKey,
    },
  };
}

export function normalizeFeedSettings(value: unknown): FeedSettings | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  const historyLimit = normalizeInteger(raw.historyLimit);
  if (historyLimit <= 0) return null;

  return { historyLimit };
}

export function normalizeSkillSummary(value: unknown): SkillSummary | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  if (
    typeof raw.name !== 'string' ||
    typeof raw.description !== 'string' ||
    typeof raw.skillMdPath !== 'string'
  ) {
    return null;
  }

  return {
    name: raw.name,
    description: raw.description,
    skillMdPath: raw.skillMdPath,
  };
}

export function normalizeSkillLoadResults(value: unknown): SkillLoadResult[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry): SkillLoadResult | null => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry as Record<string, unknown>;
      if (raw.kind === 'ok') {
        const skill = normalizeSkillSummary(raw.skill);
        return skill ? { kind: 'ok', skill } : null;
      }
      if (raw.kind === 'malformed' && typeof raw.name === 'string' && typeof raw.reason === 'string') {
        return { kind: 'malformed', name: raw.name, reason: raw.reason };
      }
      return null;
    })
    .filter((entry): entry is SkillLoadResult => entry !== null);
}

export function normalizeMcpServerSummary(value: unknown): McpServerSummary | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== 'string' ||
    typeof raw.name !== 'string' ||
    (raw.transport !== 'stdio' && raw.transport !== 'http') ||
    !Array.isArray(raw.toolNames)
  ) {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    transport: raw.transport,
    toolNames: raw.toolNames.filter((entry): entry is string => typeof entry === 'string'),
  };
}

export function normalizeMcpServerSummaries(value: unknown): McpServerSummary[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => normalizeMcpServerSummary(entry))
    .filter((entry): entry is McpServerSummary => entry !== null);
}
