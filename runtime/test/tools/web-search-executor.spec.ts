import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebSearchExecutor } from '../../src/tools/web-search-executor.js';

function stubFetch(status: number, body: unknown): void {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => typeof body === 'string' ? body : JSON.stringify(body),
    json: async () => body,
  })));
}

function stubFetchNetworkError(message: string, cause?: Record<string, unknown>): void {
  vi.stubGlobal('fetch', vi.fn(async () => {
    const error = new Error(message);
    if (cause) error.cause = cause;
    throw error;
  }));
}

describe('web-search-executor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('canHandle', () => {
    it('returns true for web_search', () => {
      const executor = new WebSearchExecutor('test-key');

      expect(executor.canHandle('web_search')).toBe(true);
    });

    it('returns false for other tool names', () => {
      const executor = new WebSearchExecutor('test-key');

      expect(executor.canHandle('read_file')).toBe(false);
      expect(executor.canHandle('run_command')).toBe(false);
      expect(executor.canHandle('')).toBe(false);
    });
  });

  describe('input validation', () => {
    it('returns error for unknown tool name', async () => {
      const executor = new WebSearchExecutor('test-key');

      const result = await executor.execute({ id: '1', name: 'unknown_tool', input: { query: 'test' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('unknown tool');
    });

    it('returns error when query is missing', async () => {
      const executor = new WebSearchExecutor('test-key');

      const result = await executor.execute({ id: '2', name: 'web_search', input: {} });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('query');
    });
  });

  describe('successful responses', () => {
    it('formats results with index, title, url, and content', async () => {
      const executor = new WebSearchExecutor('test-key');
      stubFetch(200, {
        results: [
          { title: 'Result One', url: 'https://example.com/1', content: 'First content.', score: 0.9 },
          { title: 'Result Two', url: 'https://example.com/2', content: 'Second content.', score: 0.8 },
        ],
      });

      const result = await executor.execute({ id: '1', name: 'web_search', input: { query: 'test query' } });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('[1]');
      expect(result.content).toContain('Result One');
      expect(result.content).toContain('https://example.com/1');
      expect(result.content).toContain('First content.');
      expect(result.content).toContain('[2]');
      expect(result.content).toContain('Result Two');
    });

    it('returns no-results message when results array is empty', async () => {
      const executor = new WebSearchExecutor('test-key');
      stubFetch(200, { results: [] });

      const result = await executor.execute({ id: '2', name: 'web_search', input: { query: 'nothing here' } });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('No results found');
    });

    it('clamps max_results to 10', async () => {
      const executor = new WebSearchExecutor('test-key');
      let capturedBody: Record<string, unknown> | undefined;
      vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
        capturedBody = JSON.parse(init.body as string) as Record<string, unknown>;
        return { ok: true, status: 200, json: async () => ({ results: [] }), text: async () => '' };
      }));

      await executor.execute({ id: '3', name: 'web_search', input: { query: 'q', max_results: 50 } });

      expect(capturedBody?.max_results).toBe(10);
    });

    it('clamps max_results minimum to 1', async () => {
      const executor = new WebSearchExecutor('test-key');
      let capturedBody: Record<string, unknown> | undefined;
      vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
        capturedBody = JSON.parse(init.body as string) as Record<string, unknown>;
        return { ok: true, status: 200, json: async () => ({ results: [] }), text: async () => '' };
      }));

      await executor.execute({ id: '4', name: 'web_search', input: { query: 'q', max_results: -5 } });

      expect(capturedBody?.max_results).toBe(1);
    });

    it('sends bearer auth header and query in request body', async () => {
      const executor = new WebSearchExecutor('test-key');
      let capturedBody: Record<string, unknown> | undefined;
      let capturedHeaders: Record<string, unknown> | undefined;
      vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
        capturedHeaders = init.headers as Record<string, unknown>;
        capturedBody = JSON.parse(init.body as string) as Record<string, unknown>;
        return { ok: true, status: 200, json: async () => ({ results: [] }), text: async () => '' };
      }));

      await executor.execute({ id: '5', name: 'web_search', input: { query: 'my search' } });

      expect(capturedHeaders?.Authorization).toBe('Bearer test-key');
      expect(capturedBody?.query).toBe('my search');
      expect(capturedBody?.api_key).toBeUndefined();
    });

    it('does not duplicate Bearer prefix when key already includes it', async () => {
      const executor = new WebSearchExecutor('Bearer existing-key');
      let capturedHeaders: Record<string, unknown> | undefined;
      vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
        capturedHeaders = init.headers as Record<string, unknown>;
        return { ok: true, status: 200, json: async () => ({ results: [] }), text: async () => '' };
      }));

      await executor.execute({ id: '6', name: 'web_search', input: { query: 'my search' } });

      expect(capturedHeaders?.Authorization).toBe('Bearer existing-key');
    });
  });

  describe('error handling', () => {
    it('returns error on non-2xx HTTP status', async () => {
      const executor = new WebSearchExecutor('test-key');
      stubFetch(401, 'Unauthorized');

      const result = await executor.execute({ id: '1', name: 'web_search', input: { query: 'test' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('401');
    });

    it('returns error on network failure', async () => {
      const executor = new WebSearchExecutor('test-key');
      stubFetchNetworkError('network timeout');

      const result = await executor.execute({ id: '2', name: 'web_search', input: { query: 'test' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('network request failed');
      expect(result.content).toContain('network timeout');
      expect(result.content).toContain('runtime process');
    });

    it('retries retryable network failures before returning results', async () => {
      const executor = new WebSearchExecutor('test-key');
      let calls = 0;
      vi.stubGlobal('fetch', vi.fn(async () => {
        calls++;
        if (calls === 1) {
          const error = new Error('fetch failed');
          error.cause = { code: 'ETIMEDOUT', address: '52.1.243.68', port: 443 };
          throw error;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [{ title: 'Recovered', url: 'https://example.com/recovered', content: 'Recovered content.', score: 1 }],
          }),
          text: async () => '',
        };
      }));

      const result = await executor.execute({ id: '3', name: 'web_search', input: { query: 'test' } });

      expect(result.isError).toBe(false);
      expect(calls).toBe(2);
      expect(result.content).toContain('Recovered');
    });

    it('returns detailed error after retryable network failures are exhausted', async () => {
      const executor = new WebSearchExecutor('test-key');
      stubFetchNetworkError('fetch failed', { code: 'ETIMEDOUT', address: '52.1.243.68', port: 443 });

      const result = await executor.execute({ id: '4', name: 'web_search', input: { query: 'test' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('after 2 attempts');
      expect(result.content).toContain('ETIMEDOUT');
      expect(result.content).toContain('52.1.243.68:443');
    });

    it('returns error on malformed JSON response', async () => {
      const executor = new WebSearchExecutor('test-key');
      vi.stubGlobal('fetch', vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => { throw new SyntaxError('Unexpected token'); },
        text: async () => '',
      })));

      const result = await executor.execute({ id: '5', name: 'web_search', input: { query: 'test' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('failed to parse');
    });
  });
});
