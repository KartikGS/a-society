import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { ToolDefinition } from '../../common/types.js';
import type { ResolvedMcpServer } from '../../settings/settings-store.js';
import { formatMcpError } from './errors.js';
import { buildMcpTransport } from './transport.js';

const PROVIDER_TOOL_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export interface McpToolResult {
  content: string;
  isError: boolean;
}

export interface McpConnectionNotice {
  serverName: string;
  toolName?: string;
  reason: string;
}

export interface McpManager {
  ensureConnected(servers: ResolvedMcpServer[]): Promise<void>;
  listTools(): ToolDefinition[];
  callTool(name: string, input: Record<string, unknown>, signal?: AbortSignal): Promise<McpToolResult>;
  drainConnectionNotices(): McpConnectionNotice[];
  close(): Promise<void>;
}

interface ConnectedServer {
  server: ResolvedMcpServer;
  client: Client;
  transport: Transport;
  tools: ToolDefinition[];
}

export function namespaceMcpToolName(serverName: string, toolName: string): string {
  return `mcp__${serverName}__${toolName}`;
}

export function parseNamespacedMcpToolName(name: string): { serverName: string; toolName: string } | null {
  if (!name.startsWith('mcp__')) return null;
  const remainder = name.slice('mcp__'.length);
  const separatorIndex = remainder.indexOf('__');
  if (separatorIndex <= 0 || separatorIndex === remainder.length - 2) return null;
  return {
    serverName: remainder.slice(0, separatorIndex),
    toolName: remainder.slice(separatorIndex + 2),
  };
}

export function validateProviderToolName(serverName: string, toolName: string): string {
  const namespaced = namespaceMcpToolName(serverName, toolName);
  if (!PROVIDER_TOOL_NAME_PATTERN.test(namespaced)) {
    throw new Error(
      `MCP tool "${namespaced}" must match /^[a-zA-Z0-9_-]{1,64}$/ after namespacing.`
    );
  }
  return namespaced;
}

function toToolDefinition(server: ResolvedMcpServer, tool: Tool): ToolDefinition {
  const namespaced = validateProviderToolName(server.name, tool.name);
  return {
    name: namespaced,
    description: tool.description
      ? `MCP ${server.name}: ${tool.description}`
      : `MCP ${server.name}: ${tool.name}`,
    inputSchema: tool.inputSchema as Record<string, unknown>,
  };
}

export function collectToolDefinitions(
  server: ResolvedMcpServer,
  tools: Tool[],
  notices: McpConnectionNotice[]
): ToolDefinition[] {
  const definitions: ToolDefinition[] = [];
  for (const tool of tools) {
    try {
      definitions.push(toToolDefinition(server, tool));
    } catch (error) {
      notices.push({
        serverName: server.name,
        toolName: tool.name,
        reason: formatMcpError(error),
      });
    }
  }
  return definitions;
}

function stringifyMcpContentBlock(block: CallToolResult['content'][number]): string {
  if (block.type === 'text') return block.text;
  if (block.type === 'image') return `[image: ${block.mimeType}]`;
  if (block.type === 'audio') return `[audio: ${block.mimeType}]`;
  if (block.type === 'resource') {
    const resource = block.resource;
    if ('text' in resource) return `[resource: ${resource.uri}]\n${resource.text}`;
    return `[resource: ${resource.uri}${resource.mimeType ? ` ${resource.mimeType}` : ''}]`;
  }
  if (block.type === 'resource_link') {
    return `[resource link: ${block.name} ${block.uri}]`;
  }
  return JSON.stringify(block);
}

function stringifyMcpResult(result: Awaited<ReturnType<Client['callTool']>>): string {
  if ('toolResult' in result) {
    return typeof result.toolResult === 'string'
      ? result.toolResult
      : JSON.stringify(result.toolResult, null, 2);
  }

  const parts: string[] = [];
  if (result.structuredContent) {
    parts.push(JSON.stringify(result.structuredContent, null, 2));
  }
  for (const block of result.content ?? []) {
    parts.push(stringifyMcpContentBlock(block));
  }

  return parts.filter((part) => part.trim() !== '').join('\n\n') || JSON.stringify(result, null, 2);
}

export class SdkMcpManager implements McpManager {
  private initialized = false;
  private readonly connectionsByServerName = new Map<string, ConnectedServer>();
  private readonly notices: McpConnectionNotice[] = [];

  async ensureConnected(servers: ResolvedMcpServer[]): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    for (const server of servers) {
      let transport: Transport | undefined;
      try {
        transport = buildMcpTransport(server);
        const client = new Client({ name: 'a-society-runtime', version: '0.1.0' }, { capabilities: {} });
        await client.connect(transport);
        const listed = await client.listTools();
        const tools = collectToolDefinitions(server, listed.tools, this.notices);
        this.connectionsByServerName.set(server.name, { server, client, transport, tools });
      } catch (error) {
        await transport?.close().catch(() => {});
        this.notices.push({
          serverName: server.name,
          reason: formatMcpError(error),
        });
      }
    }
  }

  listTools(): ToolDefinition[] {
    return Array.from(this.connectionsByServerName.values()).flatMap((connection) => connection.tools);
  }

  async callTool(
    name: string,
    input: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<McpToolResult> {
    const parsed = parseNamespacedMcpToolName(name);
    if (!parsed) {
      return { content: `MCP tool "${name}" is not a valid namespaced tool name.`, isError: true };
    }

    const connection = this.connectionsByServerName.get(parsed.serverName);
    if (!connection) {
      return { content: `MCP server "${parsed.serverName}" is not connected for this role.`, isError: true };
    }

    try {
      const result = await connection.client.callTool({
        name: parsed.toolName,
        arguments: input,
      }, undefined, { signal });
      return {
        content: stringifyMcpResult(result),
        isError: result.isError === true,
      };
    } catch (error) {
      return {
        content: `MCP tool "${name}" failed: ${formatMcpError(error)}`,
        isError: true,
      };
    }
  }

  drainConnectionNotices(): McpConnectionNotice[] {
    return this.notices.splice(0, this.notices.length);
  }

  async close(): Promise<void> {
    const connections = Array.from(this.connectionsByServerName.values());
    this.connectionsByServerName.clear();
    await Promise.allSettled(connections.map((connection) => connection.transport.close()));
  }
}
