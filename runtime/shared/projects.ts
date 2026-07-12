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

/** The two ways a project's a-docs can be initialized: adopting an existing codebase or starting fresh. */
export const INITIALIZATION_MODE = {
  TAKEOVER: 'takeover',
  GREENFIELD: 'greenfield',
} as const;
export type InitializationMode = (typeof INITIALIZATION_MODE)[keyof typeof INITIALIZATION_MODE];

/** Every way a flow can be created: opening an initialized project, initializing one (takeover/greenfield), or applying an update. */
export const FLOW_CREATION_MODE = {
  INITIALIZED: 'initialized',
  ...INITIALIZATION_MODE,
  UPDATE: 'update',
} as const;
export type FlowCreationMode = (typeof FLOW_CREATION_MODE)[keyof typeof FLOW_CREATION_MODE];

/** All flow-creation modes as a runtime list, for validating untrusted input (e.g. HTTP request bodies). */
export const FLOW_CREATION_MODES: readonly FlowCreationMode[] = Object.values(FLOW_CREATION_MODE);
