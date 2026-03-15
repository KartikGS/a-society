'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { createConsentFile, FEEDBACK_TYPES } = require('./consent-utility');

/**
 * Detects whether a manifest entry path is a feedback consent file.
 * Returns the feedback type key (e.g. 'onboarding') or null.
 *
 * Matches paths of the form: feedback/[type]/consent.md
 *
 * @param {string} entryPath - The manifest entry's path field
 * @returns {string|null}
 */
function detectFeedbackConsentType(entryPath) {
  const parts = entryPath.replace(/\\/g, '/').split('/');
  if (parts.length === 3 && parts[0] === 'feedback' && parts[2] === 'consent.md') {
    const feedbackType = parts[1];
    if (FEEDBACK_TYPES[feedbackType]) return feedbackType;
  }
  return null;
}

/**
 * Derives a human-readable title from a manifest entry's file path.
 * Used when generating stub file content.
 *
 * @param {string} entryPath - e.g. "project-information/vision.md"
 * @returns {string} - e.g. "Vision"
 */
function titleFromPath(entryPath) {
  const base = path.basename(entryPath, '.md');
  return base
    .replace(/^TEMPLATE-/, 'Template: ')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Renders the content for a stub file.
 *
 * @param {object} entry - A manifest entry with { path, description, source_path }
 * @returns {string}
 */
function renderStub(entry) {
  const title = titleFromPath(entry.path);
  return `# ${title}\n\n<!-- Stub — fill in per ${entry.source_path} -->\n`;
}

/**
 * Creates the a-docs/ folder structure and files for a new project.
 *
 * For each entry in `entries`:
 *   - scaffold: 'copy'  → copies source file from aSocietyRoot/source_path verbatim,
 *                         except for feedback consent files which are rendered via Consent Utility
 *   - scaffold: 'stub'  → writes a minimal titled stub pointing to the instruction source
 *
 * Does not overwrite existing files unless options.overwrite is true.
 *
 * @param {string} projectRoot   - Absolute path to the target project root
 * @param {string} projectName   - Display name for the project (used in consent files)
 * @param {string} aSocietyRoot  - Absolute path to the a-society/ directory (template source)
 * @param {object[]} entries     - Array of manifest file entries to create
 * @param {object}  [options]
 * @param {boolean} [options.overwrite=false]         - Overwrite existing files
 * @param {string}  [options.consentValue='pending']  - Consent value for feedback consent files
 * @param {string}  [options.consentRecordedBy]       - Role recorded in consent files
 * @returns {{
 *   created: Array<{ path: string, scaffold: string, source: string }>,
 *   skipped: Array<{ path: string, reason: string }>,
 *   failed:  Array<{ path: string, reason: string }>
 * }}
 */
function scaffold(projectRoot, projectName, aSocietyRoot, entries, options = {}) {
  if (!projectRoot) throw new Error('projectRoot is required');
  if (!projectName) throw new Error('projectName is required');
  if (!aSocietyRoot) throw new Error('aSocietyRoot is required');
  if (!Array.isArray(entries)) throw new Error('entries must be an array');

  const { overwrite = false, consentValue = 'pending', consentRecordedBy } = options;
  const aDocsRoot = path.join(projectRoot, 'a-docs');

  const created = [];
  const skipped = [];
  const failed = [];

  for (const entry of entries) {
    if (!entry.path || !entry.scaffold) {
      failed.push({ path: String(entry.path || ''), reason: 'Entry missing required fields: path, scaffold' });
      continue;
    }

    const targetPath = path.join(aDocsRoot, entry.path);

    // Skip existing files unless overwrite is set
    if (fs.existsSync(targetPath) && !overwrite) {
      skipped.push({ path: targetPath, reason: 'already-existed' });
      continue;
    }

    // Ensure parent directory exists
    try {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    } catch (err) {
      failed.push({ path: targetPath, reason: `Cannot create directory: ${err.message}` });
      continue;
    }

    // Route by type
    const feedbackType = detectFeedbackConsentType(entry.path);

    if (feedbackType) {
      // Feedback consent files: delegate to Consent Utility
      const result = createConsentFile(aDocsRoot, feedbackType, projectName, consentValue, {
        overwrite,
        recordedBy: consentRecordedBy || 'Scaffolding System',
      });
      if (result.status === 'created') {
        created.push({ path: targetPath, scaffold: 'consent', source: entry.source_path || '' });
      } else if (result.status === 'already-existed') {
        skipped.push({ path: targetPath, reason: 'already-existed' });
      } else {
        failed.push({ path: targetPath, reason: result.reason || 'Consent Utility failed' });
      }

    } else if (entry.scaffold === 'copy') {
      // Generic copy: read source and write to target
      const sourcePath = path.join(aSocietyRoot, entry.source_path);
      try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        fs.writeFileSync(targetPath, content, 'utf8');
        created.push({ path: targetPath, scaffold: 'copy', source: sourcePath });
      } catch (err) {
        failed.push({ path: targetPath, reason: `Cannot copy from ${sourcePath}: ${err.message}` });
      }

    } else if (entry.scaffold === 'stub') {
      // Stub: write a minimal titled placeholder
      try {
        fs.writeFileSync(targetPath, renderStub(entry), 'utf8');
        created.push({ path: targetPath, scaffold: 'stub', source: entry.source_path || '' });
      } catch (err) {
        failed.push({ path: targetPath, reason: `Cannot write stub: ${err.message}` });
      }

    } else {
      failed.push({ path: targetPath, reason: `Unknown scaffold type: "${entry.scaffold}"` });
    }
  }

  return { created, skipped, failed };
}

/**
 * Loads a manifest YAML file and runs scaffold() against it.
 *
 * Filters to required-only entries by default. Pass `options.includeOptional: true`
 * to include entries with `required: false`.
 *
 * @param {string} projectRoot
 * @param {string} projectName
 * @param {string} aSocietyRoot
 * @param {string} manifestFilePath - Absolute path to the manifest YAML (e.g. general/manifest.yaml)
 * @param {object} [options]
 * @param {boolean} [options.includeOptional=false] - Include non-required manifest entries
 * @param {boolean} [options.overwrite=false]
 * @param {string}  [options.consentValue='pending']
 * @param {string}  [options.consentRecordedBy]
 * @returns {ReturnType<typeof scaffold>}
 */
function scaffoldFromManifestFile(projectRoot, projectName, aSocietyRoot, manifestFilePath, options = {}) {
  const { includeOptional = false } = options;

  let content;
  try {
    content = fs.readFileSync(manifestFilePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read manifest file: ${err.message}`);
  }

  let doc;
  try {
    doc = yaml.load(content);
  } catch (err) {
    throw new Error(`Cannot parse manifest YAML: ${err.message}`);
  }

  if (!doc || !Array.isArray(doc.files)) {
    throw new Error('Manifest must contain a "files" array');
  }

  const entries = includeOptional ? doc.files : doc.files.filter(f => f.required === true);

  return scaffold(projectRoot, projectName, aSocietyRoot, entries, options);
}

module.exports = { scaffold, scaffoldFromManifestFile, renderStub, detectFeedbackConsentType };
