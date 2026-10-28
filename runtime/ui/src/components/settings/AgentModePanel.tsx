import type React from 'react';
import { useEffect, useState } from 'react';
import { fetchAgentMode, probeHostAgent, saveAgentMode } from '../../app/runtime-api';
import type { AgentModeSettings, HostAgentId, HostAgentSummary, HostProbeSummary } from '../../../../shared/settings.js';

interface AgentModePanelProps {
  onSaved: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function probeIsReady(probe: HostProbeSummary): boolean {
  return probe.installed && probe.versionSupported && probe.loggedIn !== false;
}

function ProbeStatus({ probe }: { probe: HostProbeSummary }) {
  const range = `${probe.supportedVersions.min} up to (not including) ${probe.supportedVersions.maxExclusive}`;
  const signIn = probe.loggedIn === null
    ? 'Unknown'
    : probe.loggedIn
      ? [probe.authMethod, probe.subscriptionType ? `${probe.subscriptionType} plan` : null].filter(Boolean).join(', ') || 'Yes'
      : 'Not signed in';

  return (
    <dl className="agent-mode-status" aria-label={`${probe.displayName} check`}>
      <dt>Installed</dt>
      <dd className={probe.installed ? 'agent-mode-check-ok' : 'agent-mode-check-fail'}>
        {probe.installed ? probe.executablePath ?? 'Yes' : 'Not found'}
      </dd>
      <dt>Version</dt>
      <dd className={probe.versionSupported ? 'agent-mode-check-ok' : 'agent-mode-check-fail'}>
        {probe.version ?? 'Unknown'}
        {probe.installed && !probe.versionSupported ? ` (supported: ${range})` : ''}
      </dd>
      <dt>Signed in</dt>
      <dd className={probe.loggedIn === false ? 'agent-mode-check-fail' : 'agent-mode-check-ok'}>{signIn}</dd>
    </dl>
  );
}

/**
 * Chooses whether new flows run role turns through API models or a coding agent
 * installed on this machine. The host's own sign-in, model and tools stay host-managed.
 */
export function AgentModePanel({ onSaved, onError, onSuccess }: AgentModePanelProps) {
  const [hosts, setHosts] = useState<HostAgentSummary[]>([]);
  const [form, setForm] = useState<AgentModeSettings | null>(null);
  const [probe, setProbe] = useState<HostProbeSummary | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetchAgentMode();
        if (cancelled) return;
        setHosts(response.hosts);
        setForm(response.settings);
        if (response.settings.mode === 'host' && response.settings.hostAgentId) {
          const result = await probeHostAgent(response.settings.hostAgentId, response.settings.executablePath);
          if (!cancelled) setProbe(result);
        }
      } catch (error) {
        if (!cancelled) onError(errorMessage(error, 'Failed to load agent mode settings.'));
      }
    })();
    return () => { cancelled = true; };
  }, [onError]);

  if (!form) {
    return <p className="settings-empty">Loading agent mode settings…</p>;
  }

  const hostId: HostAgentId | null = form.hostAgentId ?? hosts[0]?.id ?? null;
  const host = hosts.find((entry) => entry.id === hostId) ?? null;

  function update(patch: Partial<AgentModeSettings>): void {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setProbe(null);
  }

  async function handleCheck(): Promise<void> {
    if (!hostId || !form) return;
    setChecking(true);
    try {
      setProbe(await probeHostAgent(hostId, form.executablePath));
    } catch (error) {
      onError(errorMessage(error, 'Failed to check the coding agent.'));
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const response = await saveAgentMode({
        mode: form.mode,
        hostAgentId: form.mode === 'host' ? hostId : form.hostAgentId,
        executablePath: form.executablePath,
      });
      setForm(response.settings);
      onSaved();
      onSuccess(response.settings.mode === 'host' ? `New flows will run on ${host?.displayName ?? 'the coding agent'}.` : 'New flows will run on API models.');
    } catch (error) {
      onError(errorMessage(error, 'Failed to save agent mode settings.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Agent mode</h3>
      </div>

      <form className="tool-settings-form" onSubmit={(event) => { void handleSubmit(event); }} noValidate>
        <section className="tool-settings-card">
          <fieldset className="form-fieldset">
            <legend className="form-label">Run role turns through</legend>
            <label className="form-checkbox-label">
              <input
                type="radio"
                name="agent-mode"
                checked={form.mode === 'api'}
                onChange={() => update({ mode: 'api' })}
              />
              API models configured under Models
            </label>
            <label className="form-checkbox-label">
              <input
                type="radio"
                name="agent-mode"
                checked={form.mode === 'host'}
                disabled={hosts.length === 0}
                onChange={() => update({ mode: 'host', hostAgentId: hostId })}
              />
              A coding agent installed on this machine
            </label>
          </fieldset>

          {form.mode === 'host' ? (
            <>
              <p className="tool-settings-copy">
                Each role turn runs your installed agent as you signed in to it. The agent uses its own model,
                skills, MCP servers and context compaction; A-Society keeps the workflow, handoffs, records and feedback.
              </p>

              <div className="form-field">
                <label className="form-label" htmlFor="sf-hostAgent">Coding agent</label>
                <select
                  id="sf-hostAgent"
                  className="form-select"
                  value={hostId ?? ''}
                  onChange={(event) => update({ hostAgentId: event.target.value as HostAgentId })}
                >
                  {hosts.map((entry) => (
                    <option key={entry.id} value={entry.id}>{entry.displayName}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="sf-hostPath">Executable path (optional)</label>
                <input
                  id="sf-hostPath"
                  className="form-input"
                  value={form.executablePath ?? ''}
                  onChange={(event) => update({ executablePath: event.target.value.trim() === '' ? null : event.target.value })}
                  placeholder="Leave blank to use the command on PATH"
                />
              </div>

              <div className="agent-mode-check">
                <button type="button" className="form-btn-cancel" onClick={() => { void handleCheck(); }} disabled={checking || !hostId}>
                  {checking ? 'Checking…' : 'Check agent'}
                </button>
                {probe ? (
                  <span className={probeIsReady(probe) ? 'agent-mode-check-ok' : 'agent-mode-check-fail'} role="status">
                    {probeIsReady(probe) ? 'Ready' : 'Not ready'}
                  </span>
                ) : null}
              </div>
              {probe ? <ProbeStatus probe={probe} /> : null}

              <p className="tool-settings-note">
                A-Society never reads or stores the agent&apos;s credentials. Billing follows the agent&apos;s own sign-in:
                for Claude Code, an ANTHROPIC_API_KEY set where the runtime runs takes precedence over a subscription sign-in.
              </p>
            </>
          ) : (
            <p className="tool-settings-copy">Role turns call the active model from the Models tab.</p>
          )}

          <p className="tool-settings-note">Applies to new flows. Existing flows keep the backend they started with.</p>
        </section>

        <div className="form-actions">
          <button type="submit" className="form-btn-submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Agent Mode'}
          </button>
        </div>
      </form>
    </div>
  );
}
