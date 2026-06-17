import fs from 'node:fs';
import path from 'node:path';
import {
  A_SOCIETY_CHANGELOG_RELATIVE_PATH,
  A_DOCS_VERSION_RECORD_RELATIVE_PATH,
} from '../common/runtime-contracts.js';
import { readVersionFrontmatter, evaluateProjectVersion } from '../framework-services/version-comparator.js';

export interface ProjectSummary {
  displayName: string;
  folderName: string;
  /** Version recorded in the project's a-docs/a-society-version.md frontmatter; null when absent/unreadable. Only populated for initialized projects. */
  aDocsVersion?: string | null;
  /** Canonical current framework version from the changelog; null when unreadable. */
  currentVersion?: string | null;
  /** True when the current framework version is strictly newer than the project's recorded version. */
  updateAvailable?: boolean;
}

export interface ProjectDiscovery {
  withADocs: ProjectSummary[];
  withoutADocs: ProjectSummary[];
}

export function discoverProjects(workspaceRoot: string): ProjectDiscovery {
  try {
    const entries = fs.readdirSync(workspaceRoot, { withFileTypes: true });
    const currentVersion = readVersionFrontmatter(path.join(workspaceRoot, A_SOCIETY_CHANGELOG_RELATIVE_PATH));
    const withADocs: ProjectSummary[] = [];
    const withoutADocs: ProjectSummary[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const aDocsPath = path.join(workspaceRoot, entry.name, 'a-docs');

      if (fs.existsSync(aDocsPath) && fs.statSync(aDocsPath).isDirectory()) {
        const aDocsVersion = readVersionFrontmatter(
          path.join(aDocsPath, A_DOCS_VERSION_RECORD_RELATIVE_PATH)
        );
        const status = evaluateProjectVersion(aDocsVersion, currentVersion);
        withADocs.push({
          displayName: entry.name,
          folderName: entry.name,
          aDocsVersion: status.aDocsVersion,
          currentVersion: status.currentVersion,
          updateAvailable: status.updateAvailable,
        });
      } else {
        withoutADocs.push({
          displayName: entry.name,
          folderName: entry.name,
        });
      }
    }

    withADocs.sort((left, right) => left.displayName.localeCompare(right.displayName));
    withoutADocs.sort((left, right) => left.displayName.localeCompare(right.displayName));

    return { withADocs, withoutADocs };
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return { withADocs: [], withoutADocs: [] };
    }
    throw error;
  }
}
