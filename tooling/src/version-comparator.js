'use strict';

const fs = require('fs');

/**
 * Parses a "vMAJOR.MINOR" string into { major, minor }.
 * Throws if the format does not match.
 *
 * @param {string} str
 * @returns {{ major: number, minor: number }}
 */
function parseVersion(str) {
  const m = (str || '').trim().match(/^v(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Invalid version format: "${str}"`);
  return { major: parseInt(m[1], 10), minor: parseInt(m[2], 10) };
}

/**
 * Returns true if version a is strictly greater than version b.
 *
 * @param {{ major: number, minor: number }} a
 * @param {{ major: number, minor: number }} b
 * @returns {boolean}
 */
function isGreaterThan(a, b) {
  if (a.major !== b.major) return a.major > b.major;
  return a.minor > b.minor;
}

/**
 * Parses A-Society's VERSION.md.
 *
 * Extracts the current version from: **Version:** vX.Y
 * Extracts the history table: | Version | Date | Update Report |
 *
 * Report filenames are extracted from the Update Report column when they
 * match the YYYY-MM-DD-slug.md naming convention. Rows without a parseable
 * filename (e.g. the v1.0 baseline entry) produce a null filename and are
 * excluded from the unapplied-reports list.
 *
 * @param {string} filePath
 * @returns {{ currentVersion: string, history: { version: string, filename: string | null }[] }}
 */
function parseFrameworkVersionFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read VERSION.md: ${filePath} — ${err.message}`);
  }

  const versionMatch = content.match(/^\*\*Version:\*\*\s*(v\d+\.\d+)/m);
  if (!versionMatch) throw new Error(`Cannot find "**Version:**" in: ${filePath}`);
  const currentVersion = versionMatch[1];

  const history = [];
  let inTable = false;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      if (inTable) break;
      continue;
    }
    if (trimmed.replace(/\|/g, '').replace(/-/g, '').trim() === '') continue; // separator

    const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
    if (cells.length < 3) continue;
    if (cells[0] === 'Version') { inTable = true; continue; } // header row
    if (!inTable) continue;

    const version = cells[0];
    const reportCell = cells[2];

    // Extract filename: must start with YYYY-MM-DD- and end with .md
    const filenameMatch = reportCell.match(/^(\d{4}-\d{2}-\d{2}-[^\s]+\.md)/);
    const filename = filenameMatch ? filenameMatch[1] : null;

    history.push({ version, filename });
  }

  return { currentVersion, history };
}

/**
 * Parses a project's a-society-version.md to determine its current recorded version.
 *
 * The recorded version is the "Version After" value from the last applied-updates
 * row. If no updates have been applied (placeholder row with "—"), falls back to
 * the Baseline Version.
 *
 * @param {string} filePath
 * @returns {string} e.g. "v5.0"
 */
function parseProjectVersionFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read project version file: ${filePath} — ${err.message}`);
  }

  const baselineMatch = content.match(/^\*\*Baseline Version:\*\*\s*(v\d+\.\d+)/m);
  if (!baselineMatch) throw new Error(`Cannot find "**Baseline Version:**" in: ${filePath}`);
  const baselineVersion = baselineMatch[1];

  let inTable = false;
  let lastVersion = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      if (inTable) break;
      continue;
    }
    if (trimmed.replace(/\|/g, '').replace(/-/g, '').trim() === '') continue;

    const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
    if (cells.length < 2) continue;
    if (cells[0] === 'Version After') { inTable = true; continue; }
    if (!inTable) continue;

    if (cells[0].match(/^v\d+\.\d+$/)) {
      lastVersion = cells[0];
    }
  }

  return lastVersion || baselineVersion;
}

/**
 * Compares a project's recorded framework version against A-Society's current
 * version and returns the list of update reports that have not yet been applied.
 *
 * @param {string} projectVersionPath - Path to the project's a-docs/a-society-version.md
 * @param {string} frameworkVersionPath - Path to A-Society's VERSION.md
 * @param {string} _updatesDir - Path to a-society/updates/ (reserved; reports are identified via VERSION.md history)
 * @returns {{
 *   projectVersion: string,
 *   currentVersion: string,
 *   unappliedReports: { filename: string, version: string }[]
 * }}
 */
function compareVersions(projectVersionPath, frameworkVersionPath, _updatesDir) {
  const projectVersion = parseProjectVersionFile(projectVersionPath);
  const { currentVersion, history } = parseFrameworkVersionFile(frameworkVersionPath);

  const projectParsed = parseVersion(projectVersion);

  const unappliedReports = history
    .filter(entry => entry.filename !== null)
    .filter(entry => {
      try {
        return isGreaterThan(parseVersion(entry.version), projectParsed);
      } catch (_err) {
        return false;
      }
    })
    .map(entry => ({ filename: entry.filename, version: entry.version }));

  return { projectVersion, currentVersion, unappliedReports };
}

module.exports = { compareVersions, parseVersion, isGreaterThan };
