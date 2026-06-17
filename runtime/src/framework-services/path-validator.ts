import fs from 'node:fs';
import path from 'node:path';

export interface PathValidationResult {
  variable: string;
  path: string;
  status: 'ok' | 'missing' | 'parse-error';
}

/**
 * Parses a markdown index table and checks whether each registered path exists.
 *
 * Expects the A-Society index table format:
 *   | `$VARIABLE` | path/to/file | Description |
 *
 * Section-header rows (e.g. | **Agents** | | |) and separator rows are skipped.
 *
 * Index paths are project-relative and are resolved under `projectRoot` (the
 * folder that contains the project's `a-docs/`).
 */
export function validatePaths(
  indexFilePath: string,
  projectRoot: string
): PathValidationResult[] {
  if (!projectRoot) throw new Error('projectRoot is required');

  let content: string;
  try {
    content = fs.readFileSync(indexFilePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read index file: ${indexFilePath} — ${(err as Error).message}`);
  }

  const results: PathValidationResult[] = [];

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed.startsWith('|')) continue;
    if (trimmed.replace(/\|/g, '').replace(/-/g, '').trim() === '') continue; // separator row

    const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
    if (cells.length < 2) continue;

    // Variable cell must contain a $-prefixed name wrapped in backticks
    const varMatch = cells[0].match(/`(\$[^`]+)`/);
    if (!varMatch) continue;

    const variable = varMatch[1];
    const registeredPath = cells[1].trim().replace(/^`|`$/g, '');

    if (!registeredPath) {
      results.push({ variable, path: registeredPath, status: 'parse-error' });
      continue;
    }

    // Index paths are project-relative.
    const absolutePath = path.join(projectRoot, registeredPath);

    try {
      const exists = fs.existsSync(absolutePath);
      results.push({ variable, path: registeredPath, status: exists ? 'ok' : 'missing' });
    } catch (_err) {
      results.push({ variable, path: registeredPath, status: 'parse-error' });
    }
  }

  return results;
}
