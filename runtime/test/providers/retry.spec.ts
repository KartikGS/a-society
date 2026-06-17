import { describe, expect, it, vi } from 'vitest';
import {
  withNetworkRetry,
  computeBackoffDelayMs,
  isLowLevelNetworkError,
  formatRetryNotice,
  MAX_NETWORK_RETRIES,
  BASE_RETRY_DELAY_MS,
  MAX_RETRY_DELAY_MS,
} from '../../src/providers/retry.js';

function netError(code = 'ECONNRESET'): Error & { code: string } {
  return Object.assign(new Error(`network ${code}`), { code });
}

const noSleep = (): Promise<void> => Promise.resolve();
const alwaysRetryable = (): boolean => true;

describe('computeBackoffDelayMs', () => {
  it('follows nominal exponential backoff with no jitter', () => {
    const noJitter = (): number => 0;
    expect(computeBackoffDelayMs(1, 1_000, 30_000, noJitter)).toBe(1_000);
    expect(computeBackoffDelayMs(2, 1_000, 30_000, noJitter)).toBe(2_000);
    expect(computeBackoffDelayMs(3, 1_000, 30_000, noJitter)).toBe(4_000);
    expect(computeBackoffDelayMs(4, 1_000, 30_000, noJitter)).toBe(8_000);
    expect(computeBackoffDelayMs(5, 1_000, 30_000, noJitter)).toBe(16_000);
  });

  it('adds up to one base delay of jitter on top of the nominal backoff', () => {
    expect(computeBackoffDelayMs(2, 1_000, 30_000, () => 0)).toBe(2_000);
    expect(computeBackoffDelayMs(2, 1_000, 30_000, () => 1)).toBe(3_000);
  });

  it('caps the delay at maxDelayMs', () => {
    expect(computeBackoffDelayMs(10, 1_000, 5_000, () => 0)).toBe(5_000);
    expect(computeBackoffDelayMs(10, 1_000, 5_000, () => 1)).toBe(5_000);
  });

  it('keeps the delay within [nominal, nominal + base] of the capped exponential', () => {
    const delay = computeBackoffDelayMs(3, BASE_RETRY_DELAY_MS, MAX_RETRY_DELAY_MS);
    const nominal = Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * 4);
    expect(delay).toBeGreaterThanOrEqual(nominal);
    expect(delay).toBeLessThanOrEqual(nominal + BASE_RETRY_DELAY_MS);
  });
});

describe('formatRetryNotice', () => {
  it('renders an operator-facing notice with seconds and attempt count', () => {
    expect(formatRetryNotice(1, 5_000)).toBe('Network error — retrying in 5s (1/5)');
    expect(formatRetryNotice(3, 2_000, 5)).toBe('Network error — retrying in 2s (3/5)');
  });

  it('floors sub-second delays to 1s so the notice never reads "0s"', () => {
    expect(formatRetryNotice(1, 400)).toBe('Network error — retrying in 1s (1/5)');
  });
});

describe('isLowLevelNetworkError', () => {
  it('detects known network error codes', () => {
    expect(isLowLevelNetworkError(netError('ECONNRESET'))).toBe(true);
    expect(isLowLevelNetworkError(netError('ETIMEDOUT'))).toBe(true);
    expect(isLowLevelNetworkError(netError('ENOTFOUND'))).toBe(true);
  });

  it('detects a network code nested in error.cause', () => {
    const wrapped = Object.assign(new Error('fetch failed'), { cause: netError('ECONNREFUSED') });
    expect(isLowLevelNetworkError(wrapped)).toBe(true);
  });

  it('ignores non-network errors', () => {
    expect(isLowLevelNetworkError(new Error('boom'))).toBe(false);
    expect(isLowLevelNetworkError(netError('EACCES'))).toBe(false);
    expect(isLowLevelNetworkError(undefined)).toBe(false);
  });
});

describe('withNetworkRetry', () => {
  it('returns immediately when the operation succeeds', async () => {
    const op = vi.fn().mockResolvedValue('ok');
    const result = await withNetworkRetry(op, { isRetryable: alwaysRetryable, sleep: noSleep });
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('retries a transient failure and then succeeds', async () => {
    const op = vi.fn()
      .mockRejectedValueOnce(netError())
      .mockRejectedValueOnce(netError())
      .mockResolvedValue('recovered');
    const onRetry = vi.fn();
    const result = await withNetworkRetry(op, {
      isRetryable: isLowLevelNetworkError,
      sleep: noSleep,
      onRetry,
    });
    expect(result).toBe('recovered');
    expect(op).toHaveBeenCalledTimes(3);
    expect(onRetry.mock.calls.map((call) => call[0].attempt)).toEqual([1, 2]);
  });

  it('makes one initial attempt plus exactly MAX_NETWORK_RETRIES before giving up', async () => {
    const err = netError();
    const op = vi.fn().mockRejectedValue(err);
    await expect(
      withNetworkRetry(op, { isRetryable: isLowLevelNetworkError, sleep: noSleep }),
    ).rejects.toBe(err);
    expect(op).toHaveBeenCalledTimes(MAX_NETWORK_RETRIES + 1);
  });

  it('honours a custom maxRetries', async () => {
    const op = vi.fn().mockRejectedValue(netError());
    await expect(
      withNetworkRetry(op, { isRetryable: alwaysRetryable, sleep: noSleep, maxRetries: 2 }),
    ).rejects.toBeDefined();
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('does not retry a non-retryable error', async () => {
    const err = new Error('nope');
    const op = vi.fn().mockRejectedValue(err);
    await expect(
      withNetworkRetry(op, { isRetryable: () => false, sleep: noSleep }),
    ).rejects.toBe(err);
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('stops retrying once canRetry() returns false', async () => {
    const err = netError();
    const op = vi.fn().mockRejectedValue(err);
    await expect(
      withNetworkRetry(op, { isRetryable: alwaysRetryable, sleep: noSleep, canRetry: () => false }),
    ).rejects.toBe(err);
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('does not retry once the signal is already aborted', async () => {
    const controller = new AbortController();
    const err = netError();
    const op = vi.fn().mockImplementation(async () => {
      controller.abort();
      throw err;
    });
    await expect(
      withNetworkRetry(op, { isRetryable: alwaysRetryable, sleep: noSleep, signal: controller.signal }),
    ).rejects.toBe(err);
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('surfaces the error when the signal is aborted during backoff', async () => {
    const controller = new AbortController();
    const err = netError();
    const op = vi.fn().mockRejectedValue(err);
    const sleep = vi.fn().mockImplementation(async () => {
      controller.abort();
    });
    await expect(
      withNetworkRetry(op, { isRetryable: alwaysRetryable, sleep, signal: controller.signal }),
    ).rejects.toBe(err);
    expect(op).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledTimes(1);
  });
});
