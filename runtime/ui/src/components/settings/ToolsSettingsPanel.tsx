import type React from 'react';
import type { ToolSettings } from '../../../../shared/settings.js';
import type { ToolFormState } from './settings-types';

interface ToolsSettingsPanelProps {
  settings: ToolSettings | null;
  form: ToolFormState;
  saving: boolean;
  canEnableWebSearch: boolean;
  onChange: (updater: (current: ToolFormState) => ToolFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ToolsSettingsPanel({
  settings,
  form,
  saving,
  canEnableWebSearch,
  onChange,
  onSubmit,
}: ToolsSettingsPanelProps) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Tools</h3>
      </div>

      <form className="tool-settings-form" onSubmit={onSubmit} noValidate>
        <section className="tool-settings-card">
          <div className="tool-settings-header">
            <div>
              <h4 className="tool-settings-subtitle">Web Search</h4>
              <p className="tool-settings-copy">Enable Tavily-backed search for runtime tool calls.</p>
            </div>
            <label className="tool-toggle" aria-label="Enable web search">
              <input
                type="checkbox"
                checked={form.webSearchEnabled}
                disabled={!canEnableWebSearch || saving}
                onChange={(e) => onChange((current) => ({ ...current, webSearchEnabled: e.target.checked }))}
              />
              <span className="tool-toggle-track" aria-hidden="true">
                <span className="tool-toggle-thumb" />
              </span>
            </label>
          </div>

          <div className="form-field">
            <div className="form-label-with-info">
              <label className="form-label" htmlFor="sf-tavilyApiKey">Tavily API key</label>
              <div className="info-icon-wrap" aria-label="API key storage information">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <div className="info-tooltip">
                  <strong>Where are keys stored:</strong><br />
                  Within your workspace in .a-society/secrets.json. File permissions are restricted to your user account.<br /><br />
                  <strong>What this means</strong><br />
                  The runtime does not encrypt API keys. Anything with read access to your user account can read them.<br />
                  Rotate keys on a cadence you're comfortable with, and immediately if this machine is shared or compromised.
                </div>
              </div>
            </div>
            <input
              id="sf-tavilyApiKey"
              className="form-input"
              type="password"
              value={form.tavilyApiKey}
              onChange={(e) => onChange((current) => ({ ...current, tavilyApiKey: e.target.value }))}
              placeholder={settings?.webSearch.hasApiKey
                ? 'Leave blank to keep the current Tavily API key'
                : 'Enter Tavily API key'}
            />
          </div>

          <p className="tool-settings-note">
            {settings?.webSearch.hasApiKey
              ? 'A Tavily API key is already configured.'
              : 'Enter and save a Tavily API key before enabling web search.'}
          </p>
        </section>

        <div className="form-actions">
          <button type="submit" className="form-btn-submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Tool Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
