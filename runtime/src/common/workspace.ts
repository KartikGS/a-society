import path from 'node:path';

/**
 * Process-wide workspace root.
 *
 * The runtime is single-tenant: exactly one workspace root per node process,
 * established once at the entry boundary (`buildServer`, or a test's setup) via
 * `setWorkspaceRoot`. Workspace-scoped state then reads it through
 * `getWorkspaceRoot()` rather than threading it through call signatures.
 *
 * Multi-tenancy (one process serving multiple workspace roots) is an explicit
 * non-goal; if it is ever needed it will be introduced deliberately, not by
 * re-seeding an ambient global before each use.
 */
let workspaceRoot: string | null = null;

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
 * Reset to the unconfigured state so a subsequent `getWorkspaceRoot()` throws.
 * Intended for test teardown: a test that then touches workspace-scoped state
 * without establishing its own root fails loudly instead of silently inheriting
 * a stale root (e.g. the repo's cwd, which would pollute the working tree).
 */
export function clearWorkspaceRoot(): void {
  workspaceRoot = null;
}
