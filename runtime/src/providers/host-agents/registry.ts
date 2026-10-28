import { isHostAgentId, type HostAgentId } from '../../../shared/settings.js';
import { ClaudeCodeAdapter } from './claude-code/adapter.js';
import { HostAgentError } from './types.js';
import type { HostAgentAdapter, HostProbe } from './types.js';
import { assertSupportedVersion, getCachedProbe } from './version.js';

const adapters = new Map<HostAgentId, HostAgentAdapter>([['claude-code', new ClaudeCodeAdapter()]]);

export function listHostAgents(): HostAgentAdapter[] {
  return [...adapters.values()];
}

export function getHostAgent(id: string): HostAgentAdapter {
  const adapter = isHostAgentId(id) ? adapters.get(id) : undefined;
  if (!adapter) throw new HostAgentError('UNSUPPORTED_HOST', `Unsupported host agent: ${id}`);
  return adapter;
}

/**
 * The gate every host turn passes before launching: installed and in the supported
 * version range. Checked per turn because hosts update themselves.
 */
export async function assertHostReady(adapter: HostAgentAdapter, executablePath: string | null): Promise<HostProbe> {
  const probe = await getCachedProbe(adapter, executablePath);
  assertSupportedVersion(probe, adapter.supportedVersions, adapter.displayName);
  return probe;
}
