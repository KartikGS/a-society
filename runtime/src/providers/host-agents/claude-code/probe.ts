import { HostAgentError } from '../types.js';
import type { HostProbe, SupportedVersionRange } from '../types.js';
import { resolveExecutable, runHostCommand } from '../process-runner.js';
import { isVersionSupported, parseVersion } from '../version.js';

export const CLAUDE_EXECUTABLE_NAME = 'claude';

interface AuthStatus {
  loggedIn: boolean | null;
  authMethod: string | null;
  subscriptionType: string | null;
}

/**
 * Keeps only the three auth fields A-Society shows. The rest of `auth status`
 * (account email, organization) is never stored or passed on.
 */
export function parseAuthStatus(stdout: string): AuthStatus {
  try {
    const parsed: unknown = JSON.parse(stdout);
    if (typeof parsed === 'object' && parsed !== null) {
      const status = parsed as Record<string, unknown>;
      return {
        loggedIn: typeof status.loggedIn === 'boolean' ? status.loggedIn : null,
        authMethod: typeof status.authMethod === 'string' ? status.authMethod : null,
        subscriptionType: typeof status.subscriptionType === 'string' ? status.subscriptionType : null,
      };
    }
  } catch {
    // fall through: the host could not report auth state
  }
  return { loggedIn: null, authMethod: null, subscriptionType: null };
}

function notInstalled(executablePath: string | null): HostProbe {
  return {
    installed: false,
    executablePath,
    version: null,
    versionSupported: false,
    loggedIn: null,
    authMethod: null,
    subscriptionType: null,
  };
}

/** Runs `claude --version` and `claude auth status --json`. Never throws for a missing binary. */
export async function probeClaudeCode(configuredPath: string | null, range: SupportedVersionRange): Promise<HostProbe> {
  const executable = resolveExecutable(CLAUDE_EXECUTABLE_NAME, configuredPath);
  if (!executable) return notInstalled(configuredPath);

  try {
    const versionRun = await runHostCommand(executable, ['--version']);
    const version = parseVersion(versionRun.stdout);
    const auth = await runHostCommand(executable, ['auth', 'status', '--json']);
    return {
      installed: true,
      executablePath: executable,
      version,
      versionSupported: isVersionSupported(version, range),
      ...parseAuthStatus(auth.stdout),
    };
  } catch (error) {
    if (error instanceof HostAgentError && error.type === 'NOT_INSTALLED') return notInstalled(configuredPath);
    throw error;
  }
}
