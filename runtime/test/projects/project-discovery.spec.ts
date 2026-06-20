import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
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
    clearWorkspaceRoot();
  });

  it('groups top-level directories by presence of a-docs', () => {
    const workspaceRoot = createWorkspace();
    setWorkspaceRoot(workspaceRoot);

    const discovery = discoverProjects();

    expect(discovery.withADocs.map((project) => project.folderName)).toEqual(['alpha', 'gamma']);
    expect(discovery.withoutADocs.map((project) => project.folderName)).toEqual(['beta', 'delta']);
  });

  it('returns empty groups for a missing workspace root', () => {
    const workspaceRoot = createWorkspace();
    setWorkspaceRoot(path.join(workspaceRoot, 'missing-workspace'));

    const discovery = discoverProjects();

    expect(discovery).toEqual({ withADocs: [], withoutADocs: [] });
  });

  it('flags an initialized project that is behind the changelog version', () => {
    const workspaceRoot = createWorkspace();
    setWorkspaceRoot(workspaceRoot);
    fs.mkdirSync(path.join(workspaceRoot, 'a-society'), { recursive: true });
    fs.writeFileSync(
      path.join(workspaceRoot, 'a-society', 'CHANGELOG.md'),
      '---\na_society_version: "0.2.0"\n---\n# Changelog\n',
    );
    fs.writeFileSync(
      path.join(workspaceRoot, 'alpha', 'a-docs', 'a-society-version.md'),
      '---\na_society_version: "0.1.0"\n---\n# Version\n',
    );
    fs.writeFileSync(
      path.join(workspaceRoot, 'gamma', 'a-docs', 'a-society-version.md'),
      '---\na_society_version: "0.2.0"\n---\n# Version\n',
    );

    const discovery = discoverProjects();
    const alpha = discovery.withADocs.find((p) => p.folderName === 'alpha');
    const gamma = discovery.withADocs.find((p) => p.folderName === 'gamma');

    expect(alpha).toMatchObject({ aDocsVersion: '0.1.0', currentVersion: '0.2.0', updateAvailable: true });
    expect(gamma).toMatchObject({ aDocsVersion: '0.2.0', currentVersion: '0.2.0', updateAvailable: false });
  });

  it('does not flag projects when the project has no version record', () => {
    const workspaceRoot = createWorkspace();
    setWorkspaceRoot(workspaceRoot);
    fs.mkdirSync(path.join(workspaceRoot, 'a-society'), { recursive: true });
    fs.writeFileSync(
      path.join(workspaceRoot, 'a-society', 'CHANGELOG.md'),
      '---\na_society_version: "0.2.0"\n---\n# Changelog\n',
    );

    const discovery = discoverProjects();
    const alpha = discovery.withADocs.find((p) => p.folderName === 'alpha');

    expect(alpha).toMatchObject({ aDocsVersion: null, currentVersion: '0.2.0', updateAvailable: false });
  });
});
