import type { FlowRef } from '../common/types.js';
import { listSkills } from '../framework-services/skills.js';
import { configureSettingsStore, listMcpServerSummaries, listModels } from '../settings/settings-store.js';
import { resolveEffectiveCapabilities } from './capability-selection.js';
import { resolveRoleModel } from './role-model.js';

export interface RoleConfigurationSummary {
  modelDisplayName?: string;
  skillNames?: string[];
  mcpServerNames?: string[];
}

/**
 * The role's complete effective configuration, by name, for the `role.configured`
 * result feed bubble. A dimension is included only when it was actually in play for
 * this flow — more than one model configured, at least one skill, or at least one
 * MCP server — regardless of whether it was decided manually or automatically.
 */
export function buildRoleConfigurationSummary(
  workspaceRoot: string,
  ref: FlowRef,
  roleInstanceId: string
): RoleConfigurationSummary {
  configureSettingsStore(workspaceRoot);
  const effective = resolveEffectiveCapabilities(workspaceRoot, ref, roleInstanceId);
  const mcpNameById = new Map(listMcpServerSummaries().map((server) => [server.id, server.name]));
  return {
    modelDisplayName: listModels().length > 1
      ? resolveRoleModel(workspaceRoot, ref, roleInstanceId)?.displayName
      : undefined,
    skillNames: listSkills(workspaceRoot).length > 0 ? effective.skills : undefined,
    mcpServerNames: listMcpServerSummaries().length > 0
      ? effective.mcpServers.map((id) => mcpNameById.get(id) ?? id)
      : undefined,
  };
}
