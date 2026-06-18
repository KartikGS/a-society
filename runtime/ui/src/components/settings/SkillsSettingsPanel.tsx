import type React from 'react';
import type { SkillLoadResult } from '../../types';
import type { SkillFormState } from './settings-types';

interface SkillsSettingsPanelProps {
  results: SkillLoadResult[];
  form: SkillFormState;
  saving: boolean;
  onChange: (updater: (current: SkillFormState) => SkillFormState) => void;
  onImport: (e: React.FormEvent) => void;
  onDelete: (name: string) => void;
}

export function SkillsSettingsPanel({
  results,
  form,
  saving,
  onChange,
  onImport,
  onDelete,
}: SkillsSettingsPanelProps) {
  const validSkills = results.filter((result): result is Extract<SkillLoadResult, { kind: 'ok' }> => result.kind === 'ok');
  const malformedSkills = results.filter((result): result is Extract<SkillLoadResult, { kind: 'malformed' }> => result.kind === 'malformed');

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Skills</h3>
      </div>

      {validSkills.length === 0 && malformedSkills.length === 0 ? (
        <p className="settings-empty">No skills configured.</p>
      ) : null}

      <p className="tool-settings-note">
        Imported skills may include runnable scripts. Import from trusted sources; scripts still run only through normal command-permission prompts.
      </p>

      {validSkills.length > 0 ? (
        <ul className="model-list">
          {validSkills.map(({ skill }) => (
            <li key={skill.name} className="model-card">
              <div className="model-card-main">
                <div className="model-card-name">{skill.name}</div>
                <div className="model-card-meta">
                  <span>{skill.description}</span>
                  <span className="model-meta-sep">·</span>
                  <span>{skill.skillMdPath}</span>
                </div>
              </div>
              <div className="model-card-actions">
                <button
                  type="button"
                  className="model-action-icon-btn model-delete-btn"
                  disabled={saving}
                  onClick={() => {
                    if (window.confirm(`Delete "${skill.name}"?`)) onDelete(skill.name);
                  }}
                  aria-label={`Delete ${skill.name}`}
                  title={`Delete ${skill.name}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 7.5h14" />
                    <path d="M9.5 7.5V5.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25V7.5" />
                    <path d="M8 10.5v6.25" />
                    <path d="M12 10.5v6.25" />
                    <path d="M16 10.5v6.25" />
                    <path d="M6.75 7.5 7.5 19c.04.83.73 1.5 1.56 1.5h5.88c.83 0 1.52-.67 1.56-1.5l.75-11.5" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {malformedSkills.length > 0 ? (
        <div className="tool-settings-card">
          <div className="tool-settings-header">
            <div>
              <h4 className="tool-settings-subtitle">Malformed Skills</h4>
            </div>
          </div>
          <ul className="model-list">
            {malformedSkills.map((entry) => (
              <li key={entry.name} className="model-card">
                <div className="model-card-main">
                  <div className="model-card-name">{entry.name}</div>
                  <div className="model-card-meta">{entry.reason}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form className="tool-settings-form skills-import-form" onSubmit={onImport} noValidate>
        <section className="tool-settings-card">
          <div className="tool-settings-header">
            <div>
              <h4 className="tool-settings-subtitle">Import Skill</h4>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="sf-skillImportPath">Folder path</label>
            <input
              id="sf-skillImportPath"
              className="form-input"
              type="text"
              value={form.importPath}
              onChange={(e) => onChange((current) => ({ ...current, importPath: e.target.value }))}
              placeholder="/path/to/skill-folder"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="form-btn-submit" disabled={saving}>
              {saving ? 'Importing...' : 'Import Skill'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
