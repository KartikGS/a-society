import path from 'node:path';

/**
 * Process-wide workspace root.
 *
 * The runtime is single-tenant: exactly one workspace root per node process,
 * established once at the entry boundary (`startServer`, or a test's setup) via
 * `setWorkspaceRoot`. Workspace-scoped state then reads it through
 * `getWorkspaceRoot()` rather than threading it through call signatures.
 *
 * Multi-tenancy (one process serving multiple workspace roots) is an explicit
 * non-goal; if it is ever needed it will be introduced deliberately, not by
 * re-seeding an ambient global before each use.
 */
let workspaceRoot: string | null = null;
let frameworkRoot: string | null = null;

export function setWorkspaceRoot(root: string): void {
  workspaceRoot = path.resolve(root);
}

export function getWorkspaceRoot(): string {
  if (workspaceRoot === null) {
    throw new Error(
      'Workspace root is not configured. Call setWorkspaceRoot() at process entry before accessing workspace-scoped state.'
    );
  }
  return workspaceRoot;
}

/**
 * Process-wide framework root: the A-Society checkout the runtime runs from.
 * Set at process entry (`startServer`). When not set, defaults to
 * `<workspace>/a-society` (the default-install layout); tests rely on this.
 */
export function setFrameworkRoot(root: string): void {
  frameworkRoot = path.resolve(root);
}

export function getFrameworkRoot(): string {
  return frameworkRoot ?? path.join(getWorkspaceRoot(), 'a-society');
}

export function clearFrameworkRoot(): void {
  frameworkRoot = null;
}

/**
 * Reset to the unconfigured state so a subsequent `getWorkspaceRoot()` throws.
 * Also clears the framework root so a test cannot leak it into the next test.
 * Intended for test teardown: a test that then touches workspace-scoped state
 * without establishing its own root fails loudly instead of silently inheriting
 * a stale root (e.g. the repo's cwd, which would pollute the working tree).
 */
export function clearWorkspaceRoot(): void {
  workspaceRoot = null;
  frameworkRoot = null;
}
