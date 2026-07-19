import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { listProjectRoles } from '../../src/projects/project-roles.js';

const tempDirs = new Set<string>();

function makeWorkspace(): string {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-project-roles-'));
  tempDirs.add(workspaceRoot);
  setWorkspaceRoot(workspaceRoot);
  return workspaceRoot;
}

function writeRole(workspaceRoot: string, project: string, roleId: string, withMain = true): void {
  const roleDir = path.join(workspaceRoot, project, 'a-docs', 'roles', roleId);
  fs.mkdirSync(roleDir, { recursive: true });
  if (withMain) fs.writeFileSync(path.join(roleDir, 'main.md'), `# Role: ${roleId}\n`, 'utf8');
}

describe('project-roles', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  it('returns an empty list for uninitialized projects', () => {
    makeWorkspace();
    expect(listProjectRoles('demo')).toEqual([]);
  });

  it('discovers role ids with a main.md, sorted', () => {
    const workspaceRoot = makeWorkspace();
    writeRole(workspaceRoot, 'demo', 'technical-architect');
    writeRole(workspaceRoot, 'demo', 'owner');
    // A directory without main.md is not a role.
    writeRole(workspaceRoot, 'demo', 'not-a-role', false);

    expect(listProjectRoles('demo')).toEqual(['owner', 'technical-architect']);
  });
});
