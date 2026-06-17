/**
 * Network-error retry policy shared by the LLM providers.
 *
 * Providers establish their request inside {@link withNetworkRetry} so a transient
 * connection failure (DNS, refused/reset connection, connect timeout) is retried
 * with exponential backoff instead of failing the turn immediately. The SDK clients
 * are constructed with `maxRetries: 0`, so this helper is the single retry authority:
 * one initial attempt plus up to {@link MAX_NETWORK_RETRIES} retries. Owning the loop
 * (instead of the SDK's opaque retries) is what lets us surface each attempt to the
 * operator via the `onRetry` hook.
 *
 * Retries are gated by the caller's `canRetry` predicate so a failure that occurs
 * *after* output has already been streamed to the operator is surfaced rather than
 * retried — re-running the turn would duplicate the streamed text.
 */

/** Maximum number of retry attempts after the initial request. */
export const MAX_NETWORK_RETRIES = 5;

/** Base backoff delay; the first retry waits roughly this long. */
export const BASE_RETRY_DELAY_MS = 1_000;

/** Upper bound on a single backoff delay. */
export const MAX_RETRY_DELAY_MS = 30_000;

/** Node/undici error codes that indicate a transient network failure. */
const LOW_LEVEL_NETWORK_ERROR_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
]);

/**
 * Detects raw network failures that are not wrapped in a provider SDK error class.
 * The SDKs normally wrap fetch failures into their own connection-error types, but
 * this is a defensive fallback for errors that reach us unwrapped.
 */
export function isLowLevelNetworkError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; current && typeof current === 'object' && depth < 5; depth += 1) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string' && LOW_LEVEL_NETWORK_ERROR_CODES.has(code)) return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

/**
 * Operator-facing notice for a pending retry, e.g. "Network error — retrying in 5s (1/5)".
 * Surfaced as a transient toast so the operator knows the turn is reconnecting.
 */
export function formatRetryNotice(
  attempt: number,
  delayMs: number,
  maxRetries: number = MAX_NETWORK_RETRIES,
): string {
  const seconds = Math.max(1, Math.round(delayMs / 1000));
  return `Network error — retrying in ${seconds}s (${attempt}/${maxRetries})`;
}

/**
 * Computes the backoff delay for a 1-based retry attempt: nominal exponential growth
 * (`base * 2^(attempt-1)` → 1s, 2s, 4s, 8s, 16s, …) capped at {@link MAX_RETRY_DELAY_MS},
 * plus up to one base delay of additive jitter. The jitter only adds time, so concurrent
 * turns de-synchronize without any delay dropping below the nominal backoff curve.
 */
export function computeBackoffDelayMs(
  attempt: number,
  baseDelayMs: number = BASE_RETRY_DELAY_MS,
  maxDelayMs: number = MAX_RETRY_DELAY_MS,
  random: () => number = Math.random,
): number {
  const capped = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
  const jittered = capped + random() * baseDelayMs;
  return Math.round(Math.min(maxDelayMs, jittered));
}

function defaultSleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0 || signal?.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const onDone = (): void => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onDone);
      resolve();
    };
    const timer = setTimeout(onDone, ms);
    signal?.addEventListener('abort', onDone, { once: true });
  });
}

export interface NetworkRetryOptions {
  /** Aborts both the operation and any in-progress backoff. */
  signal?: AbortSignal;
  /** Classifies whether a thrown error is a retryable network failure. */
  isRetryable: (error: unknown) => boolean;
  /** Maximum retries after the initial attempt. Defaults to {@link MAX_NETWORK_RETRIES}. */
  maxRetries?: number;
  /** Blocks retrying once it returns false (e.g. output already streamed). */
  canRetry?: () => boolean;
  /** Invoked before each backoff sleep, for operator notices and observability. */
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Overridable for tests; defaults to a real, abort-aware timer. */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  /** Overridable for tests; defaults to `Math.random`. */
  random?: () => number;
}

/**
 * Runs `operation`, retrying transient network failures with exponential backoff.
 * Re-throws the last error once retries are exhausted, the failure is not a
 * retryable network error, `canRetry` returns false, or the signal is aborted.
 */
export async function withNetworkRetry<T>(
  operation: () => Promise<T>,
  options: NetworkRetryOptions,
): Promise<T> {
  const maxRetries = options.maxRetries ?? MAX_NETWORK_RETRIES;
  const sleep = options.sleep ?? defaultSleep;
  let retries = 0;

  for (;;) {
    try {
      return await operation();
    } catch (error) {
      const canRetry = options.canRetry ? options.canRetry() : true;
      if (
        options.signal?.aborted ||
        retries >= maxRetries ||
        !canRetry ||
        !options.isRetryable(error)
      ) {
        throw error;
      }
      retries += 1;
      const delayMs = computeBackoffDelayMs(retries, options.baseDelayMs, options.maxDelayMs, options.random);
      options.onRetry?.({ attempt: retries, delayMs, error });
      await sleep(delayMs, options.signal);
      if (options.signal?.aborted) throw error;
    }
  }
}
