export interface RoleContextEntry {
  namespace: string;
  requiredReadingVariables: string[];
}

/**
 * Registry of supported roles and their explicit required-reading sets.
 * Keys are formatted as "[namespace]__[roleName]" (e.g., "a-society__Owner").
 * This explicitly declares the co-maintenance obligation between the runtime
 * and the framework's documentation layer.
 */
export const roleContextRegistry: Record<string, RoleContextEntry> = {
  'a-society__Owner': {
    namespace: 'a-society/a-docs',
    requiredReadingVariables: [
      '$A_SOCIETY_AGENTS',
      '$A_SOCIETY_INDEX',
      '$A_SOCIETY_VISION',
      '$A_SOCIETY_STRUCTURE',
      '$A_SOCIETY_OWNER_ROLE'
    ]
  },
  'a-society__Curator': {
    namespace: 'a-society/a-docs',
    requiredReadingVariables: [
      '$A_SOCIETY_AGENTS',
      '$A_SOCIETY_INDEX',
      '$A_SOCIETY_VISION',
      '$A_SOCIETY_STRUCTURE',
      '$A_SOCIETY_AGENT_DOCS_GUIDE', // Curator specific reading
      '$A_SOCIETY_CURATOR_ROLE'
    ]
  },
  'a-society__Runtime Developer': {
    namespace: 'a-society/a-docs',
    requiredReadingVariables: [
      '$A_SOCIETY_AGENTS',
      '$A_SOCIETY_ARCHITECTURE',
      '$A_SOCIETY_INDEX',
      '$A_SOCIETY_WORKFLOW_RUNTIME_DEV', // The phase 0 document proxy
      '$A_SOCIETY_RUNTIME_DEVELOPER_ROLE'
    ]
  },
  // We can add adopting-project roles later when expanding MVP
};
