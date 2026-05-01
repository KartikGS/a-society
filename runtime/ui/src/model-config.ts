import type { InputModality, ModelConfig, ProviderType, SettingsStatus } from './types';

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
    supportsThinking: raw.supportsThinking === true,
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
