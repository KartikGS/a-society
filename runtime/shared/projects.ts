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
