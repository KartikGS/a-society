import { LLMGatewayError } from '../common/types.js';
import type { ToolDefinition, ToolCall } from '../common/types.js';

const TAVILY_API_URL = 'https://api.tavily.com/search';
const DEFAULT_MAX_RESULTS = 5;
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_NETWORK_ATTEMPTS = 2;

export const WEB_SEARCH_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'web_search',
    description: 'Search the web using Tavily and return the top results. Each result includes a title, URL, and a content extract. Use this to look up current information, documentation, or anything that requires knowledge beyond your training data.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query.'
        },
        max_results: {
          type: 'number',
          description: `Maximum number of results to return (default ${DEFAULT_MAX_RESULTS}, max 10).`
        }
      },
      required: ['query']
    }
  }
];

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  results: TavilyResult[];
}

export class WebSearchExecutor {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim();
  }

  canHandle(name: string): boolean {
    return name === 'web_search';
  }

  async execute(call: ToolCall, signal?: AbortSignal): Promise<{ content: string; isError: boolean }> {
    if (call.name !== 'web_search') {
      return { content: `Error: unknown tool '${call.name}'`, isError: true };
    }

    const query = call.input.query as string;
    if (!query || typeof query !== 'string') {
      return { content: `Error: 'query' is required and must be a string.`, isError: true };
    }

    const rawMax = call.input.max_results as number | undefined;
    const maxResults = Math.min(Math.max(1, rawMax ?? DEFAULT_MAX_RESULTS), 10);

    return this.search(query, maxResults, signal);
  }

  private async search(query: string, maxResults: number, signal?: AbortSignal): Promise<{ content: string; isError: boolean }> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_NETWORK_ATTEMPTS; attempt++) {
      const timeoutSignal = createTimeoutSignal(signal, REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(TAVILY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.authorizationHeader()
          },
          body: JSON.stringify({ query, max_results: maxResults }),
          signal: timeoutSignal.signal
        });

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          return { content: `Error: Tavily API returned ${response.status}: ${body}`, isError: true };
        }

        let data: TavilyResponse;
        try {
          data = await response.json() as TavilyResponse;
        } catch (err: any) {
          return { content: `Error: failed to parse Tavily response: ${err.message}`, isError: true };
        }

        if (!data.results || data.results.length === 0) {
          return { content: 'No results found.', isError: false };
        }

        const formatted = data.results.map((r, i) =>
          `[${i + 1}] ${r.title}\n${r.url}\n${r.content}`
        ).join('\n\n');

        return { content: formatted, isError: false };
      } catch (err: any) {
        if (signal?.aborted) {
          throw new LLMGatewayError('ABORTED', 'Tool execution aborted by operator');
        }
        lastError = timeoutSignal.timedOut && err?.name === 'AbortError'
          ? new TavilyRequestTimeoutError(REQUEST_TIMEOUT_MS)
          : err;
        if (attempt < MAX_NETWORK_ATTEMPTS && isRetryableNetworkError(lastError)) {
          continue;
        }
        return {
          content: formatNetworkError(lastError, attempt),
          isError: true
        };
      } finally {
        timeoutSignal.cleanup();
      }
    }

    return { content: formatNetworkError(lastError, MAX_NETWORK_ATTEMPTS), isError: true };
  }

  private authorizationHeader(): string {
    return /^Bearer\s+/i.test(this.apiKey) ? this.apiKey : `Bearer ${this.apiKey}`;
  }
}

class TavilyRequestTimeoutError extends Error {
  readonly cause = { code: 'REQUEST_TIMEOUT' };

  constructor(timeoutMs: number) {
    super(`request timed out after ${timeoutMs}ms`);
    this.name = 'TavilyRequestTimeoutError';
  }
}

function createTimeoutSignal(parent: AbortSignal | undefined, timeoutMs: number): {
  signal: AbortSignal;
  timedOut: boolean;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const result = {
    signal: controller.signal,
    timedOut: false,
    cleanup: () => {
      clearTimeout(timeout);
      parent?.removeEventListener('abort', onParentAbort);
    }
  };

  const onParentAbort = () => controller.abort();
  const timeout = setTimeout(() => {
    result.timedOut = true;
    controller.abort();
  }, timeoutMs);

  if (parent?.aborted) {
    onParentAbort();
  } else {
    parent?.addEventListener('abort', onParentAbort, { once: true });
  }

  return result;
}

function isRetryableNetworkError(err: unknown): boolean {
  const code = networkErrorCode(err);
  return [
    'EAI_AGAIN',
    'ECONNRESET',
    'ETIMEDOUT',
    'UND_ERR_CONNECT_TIMEOUT',
    'REQUEST_TIMEOUT'
  ].includes(code);
}

function formatNetworkError(err: unknown, attempts: number): string {
  const message = err instanceof Error ? err.message : String(err);
  const detail = networkErrorDetail(err);
  const attemptsText = attempts > 1 ? ` after ${attempts} attempts` : '';
  return [
    `Error: network request failed${attemptsText}: ${message}${detail}.`,
    `Check outbound HTTPS access from the runtime process to ${TAVILY_API_URL}.`,
    'If the runtime was launched from a sandboxed command environment, restart it from a normal terminal or grant network access.'
  ].join(' ');
}

function networkErrorDetail(err: unknown): string {
  const code = networkErrorCode(err);
  const endpoint = networkErrorEndpoint(err);
  if (!code && !endpoint) return '';
  return ` (${[code, endpoint].filter(Boolean).join(', ')})`;
}

function networkErrorCode(err: unknown): string {
  const cause = err instanceof Error && err.cause && typeof err.cause === 'object'
    ? err.cause as Record<string, unknown>
    : undefined;
  const code = cause?.code;
  return typeof code === 'string' ? code : '';
}

function networkErrorEndpoint(err: unknown): string {
  const cause = err instanceof Error && err.cause && typeof err.cause === 'object'
    ? err.cause as Record<string, unknown>
    : undefined;
  const address = cause?.address;
  const port = cause?.port;
  if (typeof address !== 'string') return '';
  return typeof port === 'number' ? `${address}:${port}` : address;
}
