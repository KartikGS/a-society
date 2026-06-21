import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { resolveVariableFromIndex } from '../../src/context/paths.js';

const tempDirs = new Set<string>();

function makeProject(namespace: string, indexBody: string): { workspaceRoot: string; namespace: string } {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-paths-'));
  tempDirs.add(workspaceRoot);
  const aDocs = path.join(workspaceRoot, namespace, 'a-docs');
  fs.mkdirSync(path.join(aDocs, 'indexes'), { recursive: true });
  fs.writeFileSync(path.join(aDocs, 'indexes', 'main.md'), indexBody);
  fs.writeFileSync(path.join(aDocs, 'agents.md'), 'Agent orientation');
  return { workspaceRoot, namespace };
}

afterEach(() => {
  for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true });
  tempDirs.clear();
  clearWorkspaceRoot();
});

describe('resolveVariableFromIndex', () => {
  it('resolves a project-relative path under the project namespace', () => {
    const { workspaceRoot, namespace } = makeProject('demo', '| `$AGENTS` | `a-docs/agents.md` | entry |\n');
    setWorkspaceRoot(workspaceRoot);
    const resolved = resolveVariableFromIndex('$AGENTS', namespace);
    expect(resolved).toBe(path.join(workspaceRoot, 'demo', 'a-docs', 'agents.md'));
  });

  it('resolves to the actual folder for a worktree-style different folder name', () => {
    // Same project-relative index, but the project lives under a different folder
    // (as in a git worktree). It must resolve to that folder, not a hardcoded one.
    const { workspaceRoot, namespace } = makeProject('demo-worktree', '| `$AGENTS` | `a-docs/agents.md` | entry |\n');
    setWorkspaceRoot(workspaceRoot);
    const resolved = resolveVariableFromIndex('$AGENTS', namespace);
    expect(resolved).toBe(path.join(workspaceRoot, 'demo-worktree', 'a-docs', 'agents.md'));
    expect(fs.existsSync(resolved!)).toBe(true);
  });

  it('resolves strictly under the namespace (a project-folder prefix does not resolve)', () => {
    // A project-folder prefix is no longer accepted; paths must be project-relative.
    const { workspaceRoot, namespace } = makeProject('demo', '| `$AGENTS` | `demo/a-docs/agents.md` | entry |\n');
    setWorkspaceRoot(workspaceRoot);
    const resolved = resolveVariableFromIndex('$AGENTS', namespace);
    expect(resolved).toBe(path.join(workspaceRoot, 'demo', 'demo', 'a-docs', 'agents.md'));
    expect(fs.existsSync(resolved!)).toBe(false);
  });

  it('returns null for an unregistered variable', () => {
    const { workspaceRoot, namespace } = makeProject('demo', '| `$AGENTS` | `a-docs/agents.md` | entry |\n');
    setWorkspaceRoot(workspaceRoot);
    expect(resolveVariableFromIndex('$NOPE', namespace)).toBeNull();
  });
});
