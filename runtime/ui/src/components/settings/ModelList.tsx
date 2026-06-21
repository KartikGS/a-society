import { reasoningLabel } from '../../../../shared/model-reasoning.js';
import type { InputModality, ModelConfig } from '../../../../shared/settings.js';

interface ModelListProps {
  models: ModelConfig[];
  onAdd: () => void;
  onEdit: (model: ModelConfig) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatInputModality(value: InputModality): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ModelList({ models, onAdd, onEdit, onActivate, onDelete }: ModelListProps) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Configured Models</h3>
        <button type="button" className="settings-add-btn" onClick={onAdd}>+ Add Model</button>
      </div>

      {models.length === 0 ? (
        <p className="settings-empty">No models configured. Add one to get started.</p>
      ) : (
        <ul className="model-list">
          {models.map((model) => (
            <li key={model.id} className="model-card" data-active={model.active}>
              <div className="model-card-main">
                <div className="model-card-name">
                  {model.displayName}
                  {model.active && <span className="model-active-badge">Active</span>}
                </div>
                <div className="model-card-meta">
                  <span>{model.modelId}</span>
                  <span className="model-meta-sep">·</span>
                  <span>{model.providerType}</span>
                  {model.contextWindow > 0 && (
                    <>
                      <span className="model-meta-sep">·</span>
                      <span>{model.contextWindow.toLocaleString()} ctx</span>
                    </>
                  )}
                  {reasoningLabel(model.reasoning) && (
                    <>
                      <span className="model-meta-sep">·</span>
                      <span>{reasoningLabel(model.reasoning)}</span>
                    </>
                  )}
                  {(model.supportedInputTypes ?? []).map((modality) => (
                    <span key={modality} className="model-meta-pair">
                      <span className="model-meta-sep">·</span>
                      <span>{formatInputModality(modality)}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="model-card-actions">
                {!model.active && (
                  <button
                    type="button"
                    className="model-action-btn model-activate-btn"
                    onClick={() => onActivate(model.id)}
                  >
                    Set Active
                  </button>
                )}
                <button
                  type="button"
                  className="model-action-icon-btn"
                  onClick={() => onEdit(model)}
                  aria-label={`Edit ${model.displayName}`}
                  title={`Edit ${model.displayName}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 20h4.75L19 9.75 14.25 5 4 15.25V20Z" />
                    <path d="M13.5 5.75 18.25 10.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="model-action-icon-btn model-delete-btn"
                  onClick={() => {
                    if (window.confirm(`Delete "${model.displayName}"?`)) onDelete(model.id);
                  }}
                  aria-label={`Delete ${model.displayName}`}
                  title={`Delete ${model.displayName}`}
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
      )}
    </div>
  );
}
