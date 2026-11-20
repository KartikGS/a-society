import fs from 'node:fs';
import { resolveExecutable } from './process-runner.js';
import { HostAgentError } from './types.js';
import type { HostAgentAdapter, HostProbe, SupportedVersionRange } from './types.js';

type VersionTriple = [number, number, number];

/** Extracts the first `x.y.z` from version output such as `2.1.309 (Claude Code)`. */
export function parseVersion(raw: string): string | null {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(raw);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : null;
}

function toTriple(version: string): VersionTriple | null {
  const parsed = parseVersion(version);
  if (!parsed) return null;
  const [major, minor, patch] = parsed.split('.').map(Number);
  return [major, minor, patch];
}

export function compareVersions(a: string, b: string): number {
  const left = toTriple(a);
  const right = toTriple(b);
  if (!left || !right) throw new Error(`Cannot compare versions "${a}" and "${b}".`);
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

export function isVersionSupported(version: string | null, range: SupportedVersionRange): boolean {
  if (!version || !toTriple(version)) return false;
  return compareVersions(version, range.min) >= 0 && compareVersions(version, range.maxExclusive) < 0;
}

export function formatSupportedRange(range: SupportedVersionRange): string {
  return `${range.min} up to (not including) ${range.maxExclusive}`;
}

/** Throws unless the probe found an installed host whose version is in range. */
export function assertSupportedVersion(
  probe: HostProbe,
  range: SupportedVersionRange,
  displayName: string
): void {
  if (!probe.installed) {
    throw new HostAgentError(
      'NOT_INSTALLED',
      `${displayName} is not installed at ${probe.executablePath ?? 'the default location on PATH'}.`
    );
  }
  if (!probe.versionSupported) {
    throw new HostAgentError(
      'UNSUPPORTED_VERSION',
      `${displayName} version ${probe.version ?? 'unknown'} is outside the supported range ${formatSupportedRange(range)}.`
    );
  }
}

const probeCache = new Map<string, { key: string; probe: HostProbe }>();

/**
 * Probes the host, reusing the last result while the resolved binary is unchanged.
 * Hosts auto-update in place, so the cache key includes the binary's mtime.
 */
export async function getCachedProbe(adapter: HostAgentAdapter, executablePath: string | null): Promise<HostProbe> {
  const resolved = resolveExecutable(adapter.executableName, executablePath);
  if (!resolved) {
    probeCache.delete(adapter.id);
    return adapter.probe(executablePath);
  }
  const key = `${resolved}:${fs.statSync(resolved).mtimeMs}`;
  const cached = probeCache.get(adapter.id);
  if (cached?.key === key) return cached.probe;
  const probe = await adapter.probe(executablePath);
  // A logged-out result is not cached, so signing in takes effect without restarting the runtime.
  if (probe.loggedIn === false) probeCache.delete(adapter.id);
  else probeCache.set(adapter.id, { key, probe });
  return probe;
}

export function clearProbeCache(): void {
  probeCache.clear();
}
