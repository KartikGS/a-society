import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { describe, expect, it } from 'vitest';
import { formatMcpError } from '../../src/providers/mcp/errors.js';
import {
  collectToolDefinitions,
  namespaceMcpToolName,
  parseNamespacedMcpToolName,
  SdkMcpManager,
  validateProviderToolName,
} from '../../src/providers/mcp/manager.js';

describe('MCP manager', () => {
  it('includes nested fetch cause details in MCP errors', () => {
    const timeout = Object.assign(new Error('connect ETIMEDOUT 140.82.112.21:443'), {
      code: 'ETIMEDOUT',
      address: '140.82.112.21',
      port: 443,
    });
    const unreachable = Object.assign(new Error('connect ENETUNREACH 64:ff9b::8c52:7015:443 - Local (:::0)'), {
      code: 'ENETUNREACH',
      address: '64:ff9b::8c52:7015',
      port: 443,
    });
    const error = new TypeError('fetch failed', {
      cause: new AggregateError([timeout, unreachable], ''),
    });

    expect(formatMcpError(error)).toBe(
      'fetch failed (connect ETIMEDOUT 140.82.112.21:443; connect ENETUNREACH 64:ff9b::8c52:7015:443 - Local (:::0))'
    );
  });

  it('skips provider-invalid tools without dropping valid tools from the same server', () => {
    const notices: Array<{ serverName: string; toolName?: string; reason: string }> = [];
    const tools: Tool[] = [
      {
        name: 'get_me',
        description: 'Get current user',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'x'.repeat(80),
        description: 'Invalid long tool',
        inputSchema: { type: 'object', properties: {} },
      },
    ];
    const definitions = collectToolDefinitions({
      id: 'server-1',
      name: 'github',
      transport: 'http',
      url: 'https://mcp.example.com',
      args: [],
      envKeys: [],
      env: {},
      headerKeys: [],
      headers: {},
      toolNames: [],
    }, tools, notices);

    expect(definitions).toEqual([
      {
        name: 'mcp__github__get_me',
        description: 'MCP github: Get current user',
        inputSchema: { type: 'object', properties: {} },
      },
    ]);
    expect(notices).toHaveLength(1);
    expect(notices[0]).toMatchObject({
      serverName: 'github',
      toolName: 'x'.repeat(80),
    });
    expect(notices[0].reason).toContain('must match');
  });

  it('namespaces and reverses MCP tool names on the first separator', () => {
    const namespaced = namespaceMcpToolName('linear', 'issue__create');
    expect(namespaced).toBe('mcp__linear__issue__create');
    expect(parseNamespacedMcpToolName(namespaced)).toEqual({
      serverName: 'linear',
      toolName: 'issue__create',
    });
  });

  it('rejects provider-invalid namespaced tool names', () => {
    expect(validateProviderToolName('linear', 'create_issue')).toBe('mcp__linear__create_issue');
    expect(() => validateProviderToolName('linear', 'create.issue')).toThrow(/must match/);
    expect(() => validateProviderToolName('very-long-server-name-that-is-invalid-here', 'x'.repeat(40))).toThrow(/must match/);
  });

  it('returns an error result for calls to unavailable servers without mutating the tool snapshot', async () => {
    const manager = new SdkMcpManager();

    expect(manager.listTools()).toEqual([]);
    const result = await manager.callTool('mcp__linear__create_issue', { title: 'Bug' });

    expect(result).toEqual({
      content: 'MCP server "linear" is not connected for this role.',
      isError: true,
    });
    expect(manager.listTools()).toEqual([]);
  });
});
