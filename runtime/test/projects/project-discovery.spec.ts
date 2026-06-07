import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { discoverProjects } from '../../src/projects/project-discovery.js';

const tempDirs = new Set<string>();

function createWorkspace(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-project-discovery-'));
  tempDirs.add(tmpDir);
  fs.mkdirSync(path.join(tmpDir, 'alpha', 'a-docs'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'beta'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'gamma', 'a-docs'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'delta'), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'README.md'), 'not a directory');
  return tmpDir;
}

describe('project-discovery', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
  });

  it('groups top-level directories by presence of a-docs', () => {
    const workspaceRoot = createWorkspace();

    const discovery = discoverProjects(workspaceRoot);

    expect(discovery.withADocs.map((project) => project.folderName)).toEqual(['alpha', 'gamma']);
    expect(discovery.withoutADocs.map((project) => project.folderName)).toEqual(['beta', 'delta']);
  });

  it('returns empty groups for a missing workspace root', () => {
    const workspaceRoot = createWorkspace();

    const discovery = discoverProjects(path.join(workspaceRoot, 'missing-workspace'));

    expect(discovery).toEqual({ withADocs: [], withoutADocs: [] });
  });
});
