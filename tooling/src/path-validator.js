'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Parses a markdown index table and checks whether each registered path exists.
 *
 * Expects the A-Society index table format:
 *   | `$VARIABLE` | /path/to/file | Description |
 *
 * Section-header rows (e.g. | **Agents** | | |) and separator rows are skipped.
 * Paths are resolved relative to repoRoot.
 *
 * @param {string} indexFilePath - Path to the index file (absolute or relative to cwd)
 * @param {string} repoRoot - Root directory to resolve index paths against
 * @returns {{ variable: string, path: string, status: 'ok' | 'missing' | 'parse-error' }[]}
 */
function validatePaths(indexFilePath, repoRoot) {
  if (!repoRoot) throw new Error('repoRoot is required');

  let content;
  try {
    content = fs.readFileSync(indexFilePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read index file: ${indexFilePath} — ${err.message}`);
  }

  const results = [];

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

    // Paths in the index start with '/' and are relative to repo root
    const absolutePath = path.join(repoRoot, registeredPath);

    try {
      const exists = fs.existsSync(absolutePath);
      results.push({ variable, path: registeredPath, status: exists ? 'ok' : 'missing' });
    } catch (_err) {
      results.push({ variable, path: registeredPath, status: 'parse-error' });
    }
  }

  return results;
}

module.exports = { validatePaths };
