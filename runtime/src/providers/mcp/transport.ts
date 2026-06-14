import { StdioClientTransport, getDefaultEnvironment } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { ResolvedMcpServer } from '../../settings/settings-store.js';

export function buildMcpTransport(server: ResolvedMcpServer): Transport {
  if (server.transport === 'stdio') {
    return new StdioClientTransport({
      command: server.command ?? '',
      args: server.args ?? [],
      env: { ...getDefaultEnvironment(), ...server.env },
      stderr: 'pipe',
    });
  }

  return new StreamableHTTPClientTransport(new URL(server.url ?? ''), {
    requestInit: {
      headers: server.headers,
    },
  });
}
