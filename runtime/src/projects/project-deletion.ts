import fs from 'node:fs';
import path from 'node:path';
import { assertSafeStateSegment, getProjectStateDir } from '../orchestration/state-paths.js';

const FRAMEWORK_PROJECT_NAMESPACE = 'a-society';

export class ProjectDeletionError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = 'ProjectDeletionError';
  }
}

export interface DeleteProjectResult {
  projectRoot: string;
  stateProjectRoot: string;
  removedProjectRoot: boolean;
  removedStateProjectRoot: boolean;
}

function validateProjectNamespaceForDeletion(projectNamespace: string): string {
  const safeProject = assertSafeStateSegment('project namespace', projectNamespace);
  if (safeProject === FRAMEWORK_PROJECT_NAMESPACE) {
    throw new ProjectDeletionError('The A-Society framework project cannot be deleted from the runtime UI.', 400);
  }
  if (safeProject.startsWith('.') || safeProject === 'node_modules') {
    throw new ProjectDeletionError(`"${safeProject}" is not a deletable project folder.`, 400);
  }
  return safeProject;
}

function ensureDirectoryIfPresent(label: string, dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) return false;
  if (!fs.statSync(dirPath).isDirectory()) {
    throw new ProjectDeletionError(`${label} exists but is not a directory: ${dirPath}`, 400);
  }
  return true;
}

export function deleteProject(workspaceRoot: string, projectNamespace: string): DeleteProjectResult {
  const safeProject = validateProjectNamespaceForDeletion(projectNamespace);
  const resolvedWorkspaceRoot = path.resolve(workspaceRoot);
  const projectRoot = path.join(resolvedWorkspaceRoot, safeProject);
  const stateProjectRoot = getProjectStateDir(resolvedWorkspaceRoot, safeProject);

  const removedProjectRoot = ensureDirectoryIfPresent('Project folder', projectRoot);
  const removedStateProjectRoot = ensureDirectoryIfPresent('Project state folder', stateProjectRoot);

  if (!removedProjectRoot && !removedStateProjectRoot) {
    throw new ProjectDeletionError(`Project "${safeProject}" was not found in the workspace or runtime state.`, 404);
  }

  if (removedProjectRoot) {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
  if (removedStateProjectRoot) {
    fs.rmSync(stateProjectRoot, { recursive: true, force: true });
  }

  return {
    projectRoot,
    stateProjectRoot,
    removedProjectRoot,
    removedStateProjectRoot,
  };
}
