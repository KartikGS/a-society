export type PromptCacheTtl = '5m' | '1h';

export function normalizePromptCacheTtl(value: unknown): PromptCacheTtl {
  return value === '1h' ? '1h' : '5m';
}
