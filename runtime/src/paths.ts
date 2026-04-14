import fs from 'node:fs';
import path from 'node:path';

/**
 * Resolves a framework variable (e.g., "$A_SOCIETY_AGENTS")
 * by looking up the public or internal index tables, ensuring
 * we never hardcode framework paths inside the runtime.
 */
export function resolveVariableFromIndex(
  variable: string,
  workspaceRoot: string,
  projectNamespace: string
): string | null {
  const publicIndex = path.join(workspaceRoot, projectNamespace, 'index.md');
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
  if (internalRes) return path.join(workspaceRoot, internalRes);
  
  const publicRes = extractPath(publicIndex);
  if (publicRes) return path.join(workspaceRoot, publicRes);

  return null;
}
