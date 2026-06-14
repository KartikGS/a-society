import type { FlowRef, OperatorRenderSink } from '../common/types.js';
import { SdkMcpManager, type McpManager } from '../providers/mcp/manager.js';
import { getMcpServerWithSecrets } from '../settings/settings-store.js';
import { resolveEffectiveCapabilities } from './capability-selection.js';

interface ResolveRoleMcpManagerOptions {
  workspaceRoot: string;
  flowRef: FlowRef;
  roleInstanceId: string;
  nodeId: string;
  renderer: OperatorRenderSink;
  mcpManagers?: Map<string, McpManager>;
}

export async function resolveRoleMcpManager({
  workspaceRoot,
  flowRef,
  roleInstanceId,
  nodeId,
  renderer,
  mcpManagers,
}: ResolveRoleMcpManagerOptions): Promise<McpManager | undefined> {
  if (!mcpManagers) return undefined;

  const capabilities = resolveEffectiveCapabilities(workspaceRoot, flowRef, roleInstanceId);
  if (capabilities.mcpServers.length === 0) return undefined;

  const servers = capabilities.mcpServers
    .map((id) => getMcpServerWithSecrets(id))
    .filter((server): server is NonNullable<ReturnType<typeof getMcpServerWithSecrets>> => server !== null);
  if (servers.length === 0) return undefined;

  let manager = mcpManagers.get(roleInstanceId);
  if (!manager) {
    manager = new SdkMcpManager();
    mcpManagers.set(roleInstanceId, manager);
  }

  await manager.ensureConnected(servers);
  for (const notice of manager.drainConnectionNotices()) {
    renderer.emit(notice.toolName
      ? {
        kind: 'mcp.tool_unavailable',
        role: roleInstanceId,
        nodeId,
        serverName: notice.serverName,
        toolName: notice.toolName,
        reason: notice.reason,
      }
      : {
        kind: 'mcp.server_unavailable',
        role: roleInstanceId,
        nodeId,
        serverName: notice.serverName,
        reason: notice.reason,
      });
  }

  return manager.listTools().length > 0 ? manager : undefined;
}
