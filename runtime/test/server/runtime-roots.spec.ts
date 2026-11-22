import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { findFrameworkRoot, resolveRuntimeRoots } from '../../src/server/runtime-roots.js';

const temps: string[] = [];
function tmp(): string {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-roots-')));
  temps.push(dir);
  return dir;
}
function mk(...parts: string[]): string {
  const dir = path.join(...parts);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

afterEach(() => {
  for (const dir of temps.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe('findFrameworkRoot', () => {
  it('returns the parent of the nearest runtime folder', () => {
    expect(findFrameworkRoot('/x/ws/a-society/runtime/src/server')).toBe('/x/ws/a-society');
  });

  it('throws E1 when no runtime folder exists above the module', () => {
    expect(() => findFrameworkRoot('/')).toThrow('Could not locate the A-Society checkout: there is no "runtime" folder above /.');
  });
});

describe('resolveRuntimeRoots', () => {
  it('resolves a default install to the checkout parent (constraint 3)', () => {
    const base = tmp();
    const F = mk(base, 'ws', 'a-society');
    mk(F, 'runtime', 'src', 'server');
    expect(findFrameworkRoot(path.join(F, 'runtime', 'src', 'server'))).toBe(F);
    expect(resolveRuntimeRoots(F, {})).toEqual({ frameworkRoot: F, workspaceRoot: path.join(base, 'ws') });
  });

  it('accepts a default install with A_SOCIETY_WORKSPACE set to its own parent', () => {
    const base = tmp();
    const F = mk(base, 'ws', 'a-society');
    expect(resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: path.join(base, 'ws') }))
      .toEqual({ frameworkRoot: F, workspaceRoot: path.join(base, 'ws') });
  });

  it('points a default-named checkout at a scratch workspace', () => {
    const base = tmp();
    const F = mk(base, 'ws', 'a-society');
    const scratch = mk(base, 'scratch');
    expect(resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: scratch }).workspaceRoot).toBe(scratch);
  });

  it('refuses a dev checkout without A_SOCIETY_WORKSPACE (E4)', () => {
    const base = tmp();
    const F = mk(base, 'ws', 'a-society-dev');
    expect(() => resolveRuntimeRoots(F, {})).toThrow(
      `This A-Society checkout (${F}) is not in a folder named "a-society", so its workspace cannot be inferred.`
    );
  });

  it('runs a dev checkout against a scratch workspace', () => {
    const base = tmp();
    const F = mk(base, 'ws', 'a-society-dev');
    const scratch = mk(base, 'scratch');
    expect(resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: scratch })).toEqual({ frameworkRoot: F, workspaceRoot: scratch });
  });

  it('refuses a dev checkout pointed at the main workspace (E5)', () => {
    const base = tmp();
    const W = mk(base, 'ws');
    mk(W, 'a-society');
    const F = mk(W, 'a-society-dev');
    expect(() => resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: W })).toThrow(
      `Workspace ${W} belongs to the A-Society checkout at ${path.join(W, 'a-society')}.`
    );
  });

  it('accepts a workspace whose a-society entry is a symlink to the checkout', () => {
    const base = tmp();
    const F = mk(base, 'checkouts', 'a-society-dev');
    const W = mk(base, 'ws');
    fs.symlinkSync(F, path.join(W, 'a-society'));
    expect(resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: W })).toEqual({ frameworkRoot: F, workspaceRoot: W });
  });

  it('refuses a checkout inside the workspace under another name (E6)', () => {
    const base = tmp();
    const W = mk(base, 'ws');
    const F = mk(W, 'a-society-dev');
    expect(() => resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: W })).toThrow(
      `This A-Society checkout (${F}) is inside workspace ${W} but is not its "a-society" folder.`
    );
  });

  it('refuses a workspace equal to the checkout itself (E6)', () => {
    const base = tmp();
    const F = mk(base, 'ws', 'a-society-dev');
    expect(() => resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: F })).toThrow('is not its "a-society" folder');
  });

  it('rejects a relative workspace (E2), a missing one (E3), and treats whitespace as unset', () => {
    const base = tmp();
    const F = mk(base, 'ws', 'a-society');
    expect(() => resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: 'relative/path' }))
      .toThrow('A_SOCIETY_WORKSPACE must be an absolute path (got "relative/path").');
    const missing = path.join(base, 'missing');
    expect(() => resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: missing }))
      .toThrow(`A_SOCIETY_WORKSPACE "${missing}" is not an existing directory.`);
    expect(resolveRuntimeRoots(F, { A_SOCIETY_WORKSPACE: '   ' }).workspaceRoot).toBe(path.join(base, 'ws'));
  });
});
