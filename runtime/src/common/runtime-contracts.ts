import path from 'node:path';

export const RUNTIME_ADOCS_MANIFEST_RELATIVE_PATH = path.join(
  'a-society',
  'runtime',
  'contracts',
  'a-docs-manifest.yaml'
);

/**
 * Canonical source of truth for the current A-Society framework version. The
 * version is declared in YAML frontmatter (`a_society_version`) at the top of
 * the changelog. Workspace-relative.
 */
export const A_SOCIETY_CHANGELOG_RELATIVE_PATH = path.join('a-society', 'CHANGELOG.md');

/**
 * Per-project version record, relative to the project's a-docs/ root. Records
 * the A-Society version this project's a-docs conform to, in YAML frontmatter
 * (`a_society_version`). Stamped at initialization, bumped by the Owner during
 * an update flow.
 */
export const A_DOCS_VERSION_RECORD_RELATIVE_PATH = path.join('a-society-version.md');
