import { LLMGatewayError } from '../types.js';
import type { ToolDefinition, ToolCall } from '../types.js';

const TAVILY_API_URL = 'https://api.tavily.com/search';
const DEFAULT_MAX_RESULTS = 5;

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
    this.apiKey = apiKey;
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
    let response: Response;
    try {
      response = await fetch(TAVILY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: this.apiKey, query, max_results: maxResults }),
        signal
      });
    } catch (err: any) {
      if (signal?.aborted || err?.name === 'AbortError') {
        throw new LLMGatewayError('ABORTED', 'Tool execution aborted by operator');
      }
      return { content: `Error: network request failed: ${err.message}`, isError: true };
    }

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
  }
}
