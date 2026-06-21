import fs from 'node:fs';
import path from 'node:path';
import { getWorkspaceRoot } from '../common/workspace.js';

/**
 * Resolves a framework variable (e.g., "$A_SOCIETY_AGENTS")
 * by looking up the internal or general-library index tables, ensuring
 * we never hardcode framework paths inside the runtime.
 *
 * Index paths are project-relative (e.g. `a-docs/agents.md`) and are resolved
 * under the project namespace, so the same index resolves correctly regardless
 * of the folder the project lives in (e.g. a git worktree with a different
 * folder name).
 */
export function resolveVariableFromIndex(
  variable: string,
  projectNamespace: string
): string | null {
  const workspaceRoot = getWorkspaceRoot();
  const generalIndex = path.join(workspaceRoot, projectNamespace, 'index.md');
  const internalIndex = path.join(workspaceRoot, projectNamespace, 'a-docs', 'indexes', 'main.md');

  const extractPath = (indexFile: string): string | null => {
    if (!fs.existsSync(indexFile)) return null;

    const content = fs.readFileSync(indexFile, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.includes(variable)) {
        // Matches table rows like: | `$VAR` | `path/to/file` |
        const match = line.match(/\|\s*`(\$[\w-]+)`\s*\|\s*`(.*?)`/i);
        if (match && match[1] === variable && match[2]) {
          return match[2];
        }
      }
    }
    return null;
  };

  const internalRes = extractPath(internalIndex);
  if (internalRes) return path.join(workspaceRoot, projectNamespace, internalRes);

  const generalRes = extractPath(generalIndex);
  if (generalRes) return path.join(workspaceRoot, projectNamespace, generalRes);

  return null;
}
