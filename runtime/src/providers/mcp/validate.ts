import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { normalizeMcpServerWriteParams, type McpServerWriteParams } from '../../settings/settings-store.js';
import { validateProviderToolName } from './manager.js';
import { buildMcpTransport } from './transport.js';

export interface McpValidationResult {
  toolNames: string[];
}

export async function validateMcpServerConfiguration(
  params: McpServerWriteParams
): Promise<McpValidationResult> {
  const server = normalizeMcpServerWriteParams(params, '__validation__');
  const transport = buildMcpTransport(server);
  const client = new Client({ name: 'a-society-runtime-validator', version: '0.1.0' }, { capabilities: {} });

  try {
    await client.connect(transport);
    const listed = await client.listTools();
    const toolNames = listed.tools.map((tool) => {
      validateProviderToolName(server.name, tool.name);
      return tool.name;
    });

    return {
      toolNames: toolNames
        .filter((name, index, names) => names.indexOf(name) === index)
        .sort((a, b) => a.localeCompare(b)),
    };
  } finally {
    await transport.close().catch(() => {});
  }
}
