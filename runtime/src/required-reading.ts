import { buildRoleContext } from './registry.js';

export const RUNTIME_MANAGED_REQUIRED_READING_VARIABLES = new Set([
  '$A_SOCIETY_RUNTIME_HANDOFF_CONTRACT'
]);

export function collectStartupInjectedRequiredReadingVariables(
  projectNamespace: string,
  roleName: string,
  workspaceRoot: string
): Set<string> {
  const variables = new Set<string>(RUNTIME_MANAGED_REQUIRED_READING_VARIABLES);

  try {
    const roleEntry = buildRoleContext(projectNamespace, roleName, workspaceRoot);
    if (!roleEntry) {
      return variables;
    }
    for (const variable of roleEntry.requiredReadingVariables) {
      variables.add(variable);
    }
  } catch {
    // Healthier callers validate required-readings.yaml separately. For user-message
    // construction, fall back to the runtime-managed startup set instead of throwing.
  }

  return variables;
}
