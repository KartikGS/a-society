import type React from 'react';
import type { FeedSettings } from '../../types';
import type { FeedFormState } from './settings-types';

interface FeedSettingsPanelProps {
  settings: FeedSettings | null;
  form: FeedFormState;
  saving: boolean;
  onChange: (updater: (current: FeedFormState) => FeedFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FeedSettingsPanel({
  settings,
  form,
  saving,
  onChange,
  onSubmit,
}: FeedSettingsPanelProps) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Feed</h3>
      </div>

      <form className="tool-settings-form" onSubmit={onSubmit} noValidate>
        <section className="tool-settings-card">
          <div className="tool-settings-header">
            <div>
              <h4 className="tool-settings-subtitle">History</h4>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="sf-feedHistoryLimit">History limit per role</label>
            <input
              id="sf-feedHistoryLimit"
              className="form-input"
              type="number"
              min="50"
              max="10000"
              step="1"
              value={form.historyLimit}
              onChange={(e) => onChange((current) => ({ ...current, historyLimit: e.target.value }))}
              placeholder="400"
            />
          </div>

          <p className="tool-settings-note">
            Saved: {settings?.historyLimit.toLocaleString() ?? 'loading'}
          </p>
        </section>

        <div className="form-actions">
          <button type="submit" className="form-btn-submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Feed Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
