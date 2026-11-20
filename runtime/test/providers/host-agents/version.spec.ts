import { describe, expect, it } from 'vitest';
import {
  assertSupportedVersion,
  compareVersions,
  isVersionSupported,
  parseVersion,
} from '../../../src/providers/host-agents/version.js';
import { HostAgentError } from '../../../src/providers/host-agents/types.js';
import type { HostProbe } from '../../../src/providers/host-agents/types.js';

const RANGE = { min: '2.1.304', maxExclusive: '2.2.0' };

function probe(overrides: Partial<HostProbe> = {}): HostProbe {
  return {
    installed: true,
    executablePath: '/usr/bin/claude',
    version: '2.1.309',
    versionSupported: true,
    loggedIn: true,
    authMethod: 'claude.ai',
    subscriptionType: 'pro',
    ...overrides,
  };
}

describe('host agent version gate', () => {
  it('parses the version out of CLI output', () => {
    expect(parseVersion('2.1.309 (Claude Code)\n')).toBe('2.1.309');
    expect(parseVersion('codex-cli 0.141.0')).toBe('0.141.0');
    expect(parseVersion('unknown')).toBeNull();
  });

  it('compares numerically, not lexically', () => {
    expect(compareVersions('2.1.310', '2.1.309')).toBeGreaterThan(0);
    expect(compareVersions('2.10.0', '2.9.9')).toBeGreaterThan(0);
    expect(compareVersions('2.1.304', '2.1.304')).toBe(0);
  });

  it('accepts the minimum and rejects the exclusive maximum', () => {
    expect(isVersionSupported('2.1.304', RANGE)).toBe(true);
    expect(isVersionSupported('2.1.999', RANGE)).toBe(true);
    expect(isVersionSupported('2.1.303', RANGE)).toBe(false);
    expect(isVersionSupported('2.2.0', RANGE)).toBe(false);
    expect(isVersionSupported(null, RANGE)).toBe(false);
  });

  it('refuses a missing or out-of-range host with a typed error naming the range', () => {
    expect(() => assertSupportedVersion(probe(), RANGE, 'Claude Code')).not.toThrow();

    const missing = (() => {
      try { assertSupportedVersion(probe({ installed: false }), RANGE, 'Claude Code'); } catch (error) { return error; }
      return null;
    })();
    expect(missing).toBeInstanceOf(HostAgentError);
    expect((missing as HostAgentError).type).toBe('NOT_INSTALLED');

    expect(() => assertSupportedVersion(probe({ version: '2.2.1', versionSupported: false }), RANGE, 'Claude Code'))
      .toThrow('Claude Code version 2.2.1 is outside the supported range 2.1.304 up to (not including) 2.2.0.');
  });
});
