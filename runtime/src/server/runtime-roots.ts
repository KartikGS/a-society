import fs from 'node:fs';
import path from 'node:path';

/** The two process-wide roots, both fixed at startup. */
export interface RuntimeRoots {
  /** The A-Society checkout the runtime runs from. */
  frameworkRoot: string;
  /** Holds the projects and the workspace's `.a-society/` folder. */
  workspaceRoot: string;
}

export const WORKSPACE_ENV_VAR = 'A_SOCIETY_WORKSPACE';
export const DEFAULT_FRAMEWORK_FOLDER = 'a-society';

/** Parent of the nearest ancestor folder named `runtime` above `moduleDir` (path logic only). */
export function findFrameworkRoot(moduleDir: string): string {
  let current = path.resolve(moduleDir);
  while (true) {
    if (path.basename(current) === 'runtime') {
      return path.dirname(current);
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(`Could not locate the A-Society checkout: there is no "runtime" folder above ${moduleDir}.`);
    }
    current = parent;
  }
}

function isDirectory(target: string): boolean {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

/** Resolves and validates both roots. Throws on any invalid configuration; never logs. */
export function resolveRuntimeRoots(frameworkRoot: string, env: NodeJS.ProcessEnv): RuntimeRoots {
  const F = path.resolve(frameworkRoot);
  const raw = env[WORKSPACE_ENV_VAR]?.trim() ?? '';
  let W: string;

  if (raw) {
    if (!path.isAbsolute(raw)) {
      throw new Error(`${WORKSPACE_ENV_VAR} must be an absolute path (got "${raw}").`);
    }
    if (!isDirectory(raw)) {
      throw new Error(`${WORKSPACE_ENV_VAR} "${raw}" is not an existing directory.`);
    }
    W = path.resolve(raw);
  } else {
    if (path.basename(F) !== DEFAULT_FRAMEWORK_FOLDER) {
      throw new Error(
        `This A-Society checkout (${F}) is not in a folder named "${DEFAULT_FRAMEWORK_FOLDER}", so its workspace cannot be inferred. ` +
        `Set ${WORKSPACE_ENV_VAR} to the absolute path of a separate workspace folder. ` +
        'See "Running a development runtime" in runtime/INVOCATION.md.'
      );
    }
    W = path.dirname(F);
  }

  const realF = fs.realpathSync(F);
  const realW = fs.realpathSync(W);

  // I1: a workspace that holds an `a-society/` folder belongs to that checkout's runtime.
  const owned = path.join(W, DEFAULT_FRAMEWORK_FOLDER);
  if (fs.existsSync(owned) && fs.realpathSync(owned) !== realF) {
    throw new Error(
      `Workspace ${W} belongs to the A-Society checkout at ${owned}. ` +
      `A runtime started from ${F} must use a separate workspace, so two runtimes never share .a-society/ state. ` +
      `Set ${WORKSPACE_ENV_VAR} to another folder.`
    );
  }

  // I2: a checkout inside the workspace must be exactly its `a-society/` folder.
  const rel = path.relative(realW, realF);
  const inside = rel === '' || (!path.isAbsolute(rel) && rel.split(path.sep)[0] !== '..');
  if (inside && rel !== DEFAULT_FRAMEWORK_FOLDER) {
    throw new Error(
      `This A-Society checkout (${F}) is inside workspace ${W} but is not its "${DEFAULT_FRAMEWORK_FOLDER}" folder. ` +
      'Choose a workspace folder that does not contain the checkout.'
    );
  }

  return { frameworkRoot: F, workspaceRoot: W };
}
