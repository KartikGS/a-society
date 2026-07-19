import fs from 'node:fs';
import path from 'node:path';
import { getWorkspaceRoot } from '../common/workspace.js';
import { assertSafeStateSegment } from '../orchestration/state-paths.js';

/**
 * Discover the base role ids defined for a project by scanning its a-docs/roles/
 * directory. A directory counts as a role when it contains a main.md role doc.
 * Returns an empty list for uninitialized projects (no a-docs/roles).
 */
export function listProjectRoles(projectNamespace: string): string[] {
  const safeProject = assertSafeStateSegment('project namespace', projectNamespace);
  const rolesDir = path.join(getWorkspaceRoot(), safeProject, 'a-docs', 'roles');
  if (!fs.existsSync(rolesDir) || !fs.statSync(rolesDir).isDirectory()) return [];

  const roleIds: string[] = [];
  for (const entry of fs.readdirSync(rolesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!fs.existsSync(path.join(rolesDir, entry.name, 'main.md'))) continue;
    roleIds.push(entry.name);
  }
  return roleIds.sort((left, right) => left.localeCompare(right));
}
