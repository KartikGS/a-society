import assert from 'node:assert';
import { WebSearchExecutor } from '../../src/tools/web-search-executor.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve(fn()).then(
    () => { console.log(`  ✓ ${name}`); passed++; },
    (err) => { console.error(`  ✗ ${name}`); console.error(`    ${(err as Error).message}`); failed++; }
  );
}

// ---------------------------------------------------------------------------
// Stub helpers
// ---------------------------------------------------------------------------

function stubFetch(status: number, body: unknown): void {
  (globalThis as any).fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body
  });
}

function stubFetchNetworkError(message: string): void {
  (globalThis as any).fetch = async () => { throw new Error(message); };
}

// ---------------------------------------------------------------------------
// canHandle
// ---------------------------------------------------------------------------
console.log('\nweb-search-executor › canHandle');
{
  const ex = new WebSearchExecutor('test-key');

  await test('returns true for web_search', async () => {
    assert.strictEqual(ex.canHandle('web_search'), true);
  });

  await test('returns false for other tool names', async () => {
    assert.strictEqual(ex.canHandle('read_file'), false);
    assert.strictEqual(ex.canHandle('run_command'), false);
    assert.strictEqual(ex.canHandle(''), false);
  });
}

// ---------------------------------------------------------------------------
// execute › input validation
// ---------------------------------------------------------------------------
console.log('\nweb-search-executor › input validation');
{
  const ex = new WebSearchExecutor('test-key');

  await test('returns error for unknown tool name', async () => {
    const r = await ex.execute({ id: '1', name: 'unknown_tool', input: { query: 'test' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('unknown tool'));
  });

  await test('returns error when query is missing', async () => {
    const r = await ex.execute({ id: '2', name: 'web_search', input: {} });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('query'));
  });
}

// ---------------------------------------------------------------------------
// execute › successful responses
// ---------------------------------------------------------------------------
console.log('\nweb-search-executor › successful responses');
{
  const ex = new WebSearchExecutor('test-key');

  await test('formats results with index, title, url, and content', async () => {
    stubFetch(200, {
      results: [
        { title: 'Result One', url: 'https://example.com/1', content: 'First content.', score: 0.9 },
        { title: 'Result Two', url: 'https://example.com/2', content: 'Second content.', score: 0.8 }
      ]
    });
    const r = await ex.execute({ id: '1', name: 'web_search', input: { query: 'test query' } });
    assert.strictEqual(r.isError, false);
    assert.ok(r.content.includes('[1]'));
    assert.ok(r.content.includes('Result One'));
    assert.ok(r.content.includes('https://example.com/1'));
    assert.ok(r.content.includes('First content.'));
    assert.ok(r.content.includes('[2]'));
    assert.ok(r.content.includes('Result Two'));
  });

  await test('returns no-results message when results array is empty', async () => {
    stubFetch(200, { results: [] });
    const r = await ex.execute({ id: '2', name: 'web_search', input: { query: 'nothing here' } });
    assert.strictEqual(r.isError, false);
    assert.ok(r.content.includes('No results found'));
  });

  await test('clamps max_results to 10', async () => {
    let capturedBody: any;
    (globalThis as any).fetch = async (_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return { ok: true, status: 200, json: async () => ({ results: [] }), text: async () => '' };
    };
    await ex.execute({ id: '3', name: 'web_search', input: { query: 'q', max_results: 50 } });
    assert.strictEqual(capturedBody.max_results, 10);
  });

  await test('clamps max_results minimum to 1', async () => {
    let capturedBody: any;
    (globalThis as any).fetch = async (_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return { ok: true, status: 200, json: async () => ({ results: [] }), text: async () => '' };
    };
    await ex.execute({ id: '4', name: 'web_search', input: { query: 'q', max_results: -5 } });
    assert.strictEqual(capturedBody.max_results, 1);
  });

  await test('sends api_key and query in request body', async () => {
    let capturedBody: any;
    (globalThis as any).fetch = async (_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return { ok: true, status: 200, json: async () => ({ results: [] }), text: async () => '' };
    };
    await ex.execute({ id: '5', name: 'web_search', input: { query: 'my search' } });
    assert.strictEqual(capturedBody.api_key, 'test-key');
    assert.strictEqual(capturedBody.query, 'my search');
  });
}

// ---------------------------------------------------------------------------
// execute › error handling
// ---------------------------------------------------------------------------
console.log('\nweb-search-executor › error handling');
{
  const ex = new WebSearchExecutor('test-key');

  await test('returns error on non-2xx HTTP status', async () => {
    stubFetch(401, 'Unauthorized');
    const r = await ex.execute({ id: '1', name: 'web_search', input: { query: 'test' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('401'));
  });

  await test('returns error on network failure', async () => {
    stubFetchNetworkError('network timeout');
    const r = await ex.execute({ id: '2', name: 'web_search', input: { query: 'test' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('network request failed'));
    assert.ok(r.content.includes('network timeout'));
  });

  await test('returns error on malformed JSON response', async () => {
    (globalThis as any).fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('Unexpected token'); },
      text: async () => ''
    });
    const r = await ex.execute({ id: '3', name: 'web_search', input: { query: 'test' } });
    assert.strictEqual(r.isError, true);
    assert.ok(r.content.includes('failed to parse'));
  });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
