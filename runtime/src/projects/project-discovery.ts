import fs from 'node:fs';
import path from 'node:path';

export interface ProjectSummary {
  displayName: string;
  folderName: string;
}

export interface ProjectDiscovery {
  withADocs: ProjectSummary[];
  withoutADocs: ProjectSummary[];
}

export function discoverProjects(workspaceRoot: string): ProjectDiscovery {
  try {
    const entries = fs.readdirSync(workspaceRoot, { withFileTypes: true });
    const withADocs: ProjectSummary[] = [];
    const withoutADocs: ProjectSummary[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const summary = {
        displayName: entry.name,
        folderName: entry.name
      };
      const aDocsPath = path.join(workspaceRoot, entry.name, 'a-docs');

      if (fs.existsSync(aDocsPath) && fs.statSync(aDocsPath).isDirectory()) {
        withADocs.push(summary);
      } else {
        withoutADocs.push(summary);
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
