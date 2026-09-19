import { SquarePen, Trash2 } from 'lucide-react';
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
                  <SquarePen aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="model-action-icon-btn model-delete-btn"
                  onClick={() => onDelete(model.id)}
                  aria-label={`Delete ${model.displayName}`}
                  title={`Delete ${model.displayName}`}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
