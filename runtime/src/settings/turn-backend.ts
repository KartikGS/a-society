import type { FlowRun, TurnBackend } from '../common/types.js';
import { getHostAgent } from '../providers/host-agents/registry.js';
import { formatSupportedRange, getCachedProbe } from '../providers/host-agents/version.js';
import { getAgentModeSettings, hasUsableConfiguredModel, MODEL_CONFIGURATION_REQUIRED_MESSAGE } from './settings-store.js';

export type TurnBackendReadiness = { ready: true } | { ready: false; message: string };

/** The backend new flows are pinned to, from the agent-mode setting. */
export function currentTurnBackend(): TurnBackend {
  const settings = getAgentModeSettings();
  return settings.mode === 'host' && settings.hostAgentId
    ? { kind: 'host', agentId: settings.hostAgentId }
    : { kind: 'api' };
}

/** Flows created before agent mode carry no backend and run on the API. */
export function resolveTurnBackend(flowRun: Pick<FlowRun, 'turnBackend'>): TurnBackend {
  return flowRun.turnBackend ?? { kind: 'api' };
}

/**
 * Whether a backend can run turns right now. API mode needs a usable model; host mode
 * needs the host installed, inside the supported version range, and signed in.
 */
export async function getTurnBackendReadiness(backend: TurnBackend): Promise<TurnBackendReadiness> {
  if (backend.kind === 'api') {
    return hasUsableConfiguredModel() ? { ready: true } : { ready: false, message: MODEL_CONFIGURATION_REQUIRED_MESSAGE };
  }

  const adapter = getHostAgent(backend.agentId);
  const { executablePath } = getAgentModeSettings();
  const notReady = (reason: string): TurnBackendReadiness => ({
    ready: false,
    message: `Agent mode is set to ${adapter.displayName}, but it is not ready: ${reason}.`,
  });
  let probe;
  try {
    probe = await getCachedProbe(adapter, executablePath);
  } catch (error) {
    return notReady(error instanceof Error ? error.message : String(error));
  }

  if (!probe.installed) {
    return notReady(`not installed at ${executablePath ?? `"${adapter.executableName}" on PATH`}`);
  }
  if (!probe.versionSupported) {
    return notReady(`version ${probe.version ?? 'unknown'} is outside the supported range ${formatSupportedRange(adapter.supportedVersions)}`);
  }
  if (probe.loggedIn === false) {
    return notReady(`not logged in — run \`${adapter.executableName} auth login\``);
  }
  return { ready: true };
}
