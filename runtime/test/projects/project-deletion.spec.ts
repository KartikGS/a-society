import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { deleteProject, ProjectDeletionError } from '../../src/projects/project-deletion.js';

const tempDirs = new Set<string>();

function makeWorkspace(): string {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-project-delete-'));
  tempDirs.add(workspaceRoot);
  return workspaceRoot;
}

describe('project-deletion', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  it('removes the project folder and project state folder', () => {
    const workspaceRoot = makeWorkspace();
    setWorkspaceRoot(workspaceRoot);
    const projectRoot = path.join(workspaceRoot, 'demo-project');
    const stateProjectRoot = path.join(workspaceRoot, '.a-society', 'state', 'demo-project');
    const siblingStateRoot = path.join(workspaceRoot, '.a-society', 'state', 'other-project');
    fs.mkdirSync(path.join(projectRoot, 'a-docs'), { recursive: true });
    fs.mkdirSync(path.join(stateProjectRoot, 'flow-1', 'record'), { recursive: true });
    fs.mkdirSync(siblingStateRoot, { recursive: true });

    const result = deleteProject('demo-project');

    expect(result).toMatchObject({
      removedProjectRoot: true,
      removedStateProjectRoot: true,
    });
    expect(fs.existsSync(projectRoot)).toBe(false);
    expect(fs.existsSync(stateProjectRoot)).toBe(false);
    expect(fs.existsSync(siblingStateRoot)).toBe(true);
  });

  it('removes state even when the project folder is already gone', () => {
    const workspaceRoot = makeWorkspace();
    setWorkspaceRoot(workspaceRoot);
    const stateProjectRoot = path.join(workspaceRoot, '.a-society', 'state', 'state-only');
    fs.mkdirSync(path.join(stateProjectRoot, 'flow-1'), { recursive: true });

    const result = deleteProject('state-only');

    expect(result).toMatchObject({
      removedProjectRoot: false,
      removedStateProjectRoot: true,
    });
    expect(fs.existsSync(stateProjectRoot)).toBe(false);
  });

  it('refuses the A-Society framework folder', () => {
    const workspaceRoot = makeWorkspace();
    setWorkspaceRoot(workspaceRoot);
    const frameworkRoot = path.join(workspaceRoot, 'a-society');
    fs.mkdirSync(path.join(frameworkRoot, 'runtime'), { recursive: true });

    let error: unknown;
    try {
      deleteProject('a-society');
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(ProjectDeletionError);
    expect((error as ProjectDeletionError).statusCode).toBe(400);
    expect(fs.existsSync(frameworkRoot)).toBe(true);
  });

  it('rejects path separators', () => {
    const workspaceRoot = makeWorkspace();
    setWorkspaceRoot(workspaceRoot);

    expect(() => deleteProject('../demo')).toThrow(/Invalid project namespace/);
  });
});
