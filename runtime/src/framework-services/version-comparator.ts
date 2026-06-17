import fs from 'node:fs';
import yaml from 'js-yaml';

/**
 * A-Society version comparison.
 *
 * The canonical current framework version lives in the changelog's YAML
 * frontmatter (`a_society_version`). Each initialized project records the
 * version its a-docs conform to in its own version record's frontmatter
 * (same key). An update is available when the changelog version is strictly
 * newer than the project's recorded version.
 *
 * Versions use dotted numeric components (e.g. "0.2.0"). Trailing components
 * default to 0, so "0.2" and "0.2.0" compare equal.
 */

export interface ParsedVersion {
  components: number[];
  raw: string;
}

export interface ProjectVersionStatus {
  aDocsVersion: string | null;
  currentVersion: string | null;
  updateAvailable: boolean;
}

const FRONTMATTER_VERSION_KEY = 'a_society_version';

/**
 * Extracts the leading YAML frontmatter block (delimited by `---` lines) from a
 * document and returns its parsed object, or null when no frontmatter is found
 * or it does not parse to an object.
 */
export function parseFrontmatter(content: string): Record<string, unknown> | null {
  const normalized = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return null;

  let parsed: unknown;
  try {
    parsed = yaml.load(match[1]);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  return parsed as Record<string, unknown>;
}

/**
 * Reads the `a_society_version` value from a file's YAML frontmatter. Returns
 * the version string, or null when the file is unreadable, has no frontmatter,
 * or the key is absent/blank.
 */
export function readVersionFrontmatter(filePath: string): string | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }

  const frontmatter = parseFrontmatter(content);
  if (!frontmatter) return null;

  const value = frontmatter[FRONTMATTER_VERSION_KEY];
  if (value === null || value === undefined) return null;
  const version = String(value).trim();
  return version === '' ? null : version;
}

/**
 * Parses a dotted numeric version string into its components. Returns null when
 * the string is not a non-empty sequence of dot-separated non-negative integers.
 */
export function parseVersion(value: string): ParsedVersion | null {
  const raw = (value ?? '').trim();
  if (!/^\d+(\.\d+)*$/.test(raw)) return null;
  const components = raw.split('.').map((part) => parseInt(part, 10));
  return { components, raw };
}

/**
 * Compares two parsed versions. Returns a negative number when a < b, zero when
 * equal, and a positive number when a > b. Missing trailing components are 0.
 */
export function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  const length = Math.max(a.components.length, b.components.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (a.components[i] ?? 0) - (b.components[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * Computes a project's version status against the canonical current version.
 * An update is available only when both versions parse and the current version
 * is strictly newer than the project's recorded version.
 */
export function evaluateProjectVersion(
  aDocsVersion: string | null,
  currentVersion: string | null
): ProjectVersionStatus {
  let updateAvailable = false;
  if (aDocsVersion && currentVersion) {
    const recorded = parseVersion(aDocsVersion);
    const current = parseVersion(currentVersion);
    if (recorded && current) {
      updateAvailable = compareVersions(current, recorded) > 0;
    }
  }
  return { aDocsVersion, currentVersion, updateAvailable };
}
