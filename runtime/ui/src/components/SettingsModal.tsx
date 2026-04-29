import { useEffect, useRef, useState } from 'react';
import type { ModelConfig, ProviderType } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

interface ModelFormState {
  displayName: string;
  providerType: ProviderType;
  providerBaseUrl: string;
  modelId: string;
  apiKey: string;
  contextWindow: string;
  maxOutputTokens: string;
  supportsThinking: boolean;
  supportsMultimodal: boolean;
}

const DEFAULT_FORM: ModelFormState = {
  displayName: '',
  providerType: 'openai-compatible',
  providerBaseUrl: '',
  modelId: '',
  apiKey: '',
  contextWindow: '',
  maxOutputTokens: '',
  supportsThinking: false,
  supportsMultimodal: false,
};

type View = 'list' | 'add';

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [view, setView] = useState<View>('list');
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [form, setForm] = useState<ModelFormState>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/settings/models');
        if (!res.ok) throw new Error(await res.text());
        setModels(await res.json() as ModelConfig[]);
        setListError(null);
      } catch (err) {
        setListError(err instanceof Error ? err.message : 'Failed to load models.');
      }
    }

    void fetchModels();
  }, []);

  async function handleActivate(id: string) {
    try {
      const res = await fetch(`/api/settings/models/${encodeURIComponent(id)}/activate`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      setModels((prev) => prev.map((m) => ({ ...m, active: m.id === id })));
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to activate model.');
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/settings/models/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setModels((prev) => {
        const next = prev.filter((m) => m.id !== id);
        if (prev.find((m) => m.id === id)?.active && next.length > 0) {
          next[0] = { ...next[0], active: true };
        }
        return next;
      });
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to delete model.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.displayName.trim()) { setFormError('Display name is required.'); return; }
    if (!form.modelId.trim()) { setFormError('Model ID is required.'); return; }
    if (!form.apiKey.trim()) { setFormError('API key is required.'); return; }
    if (form.providerType === 'openai-compatible' && !form.providerBaseUrl.trim()) {
      setFormError('Provider base URL is required for OpenAI-compatible providers.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/settings/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName.trim(),
          providerType: form.providerType,
          providerBaseUrl: form.providerBaseUrl.trim(),
          modelId: form.modelId.trim(),
          apiKey: form.apiKey.trim(),
          contextWindow: form.contextWindow ? parseInt(form.contextWindow, 10) : 0,
          maxOutputTokens: form.maxOutputTokens ? parseInt(form.maxOutputTokens, 10) : 0,
          supportsThinking: form.supportsThinking,
          supportsMultimodal: form.supportsMultimodal,
        }),
      });
      if (!res.ok) {
        const body = await res.json() as { message?: string };
        throw new Error(body.message ?? 'Failed to create model.');
      }
      const created = await res.json() as ModelConfig;
      setModels((prev) => {
        const isFirst = prev.length === 0;
        return isFirst
          ? [created]
          : prev.map((m) => ({ ...m, active: false })).concat(created);
      });
      setForm(DEFAULT_FORM);
      setView('list');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create model.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function setField<K extends keyof ModelFormState>(key: K, value: ModelFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="modal-overlay settings-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Settings</h2>
          <button type="button" className="settings-close-btn" onClick={onClose} aria-label="Close settings">×</button>
        </div>

        <div className="settings-modal-body">
          <nav className="settings-nav">
            <button type="button" className="settings-nav-item settings-nav-item-active">
              Models
            </button>
          </nav>

          <div className="settings-content">
            {view === 'list' ? (
              <ModelList
                models={models}
                error={listError}
                onAdd={() => { setForm(DEFAULT_FORM); setFormError(null); setView('add'); }}
                onActivate={handleActivate}
                onDelete={handleDelete}
              />
            ) : (
              <AddModelForm
                form={form}
                error={formError}
                submitting={submitting}
                onChange={setField}
                onSubmit={handleSubmit}
                onCancel={() => setView('list')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModelListProps {
  models: ModelConfig[];
  error: string | null;
  onAdd: () => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

function ModelList({ models, error, onAdd, onActivate, onDelete }: ModelListProps) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Configured Models</h3>
        <button type="button" className="settings-add-btn" onClick={onAdd}>+ Add Model</button>
      </div>

      {error && <p className="settings-error">{error}</p>}

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
                  {model.supportsThinking && (
                    <>
                      <span className="model-meta-sep">·</span>
                      <span>Thinking</span>
                    </>
                  )}
                  {model.supportsMultimodal && (
                    <>
                      <span className="model-meta-sep">·</span>
                      <span>Multimodal</span>
                    </>
                  )}
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
                  className="model-action-btn model-delete-btn"
                  onClick={() => {
                    if (window.confirm(`Delete "${model.displayName}"?`)) onDelete(model.id);
                  }}
                  aria-label={`Delete ${model.displayName}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface AddModelFormProps {
  form: ModelFormState;
  error: string | null;
  submitting: boolean;
  onChange: <K extends keyof ModelFormState>(key: K, value: ModelFormState[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function AddModelForm({ form, error, submitting, onChange, onSubmit, onCancel }: AddModelFormProps) {
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Add Model</h3>
      </div>

      <form className="model-form" onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="sf-displayName">Display name</label>
          <input
            id="sf-displayName"
            className="form-input"
            type="text"
            value={form.displayName}
            onChange={(e) => onChange('displayName', e.target.value)}
            placeholder="e.g. My GPT-4o"
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="sf-providerType">Provider type</label>
          <select
            id="sf-providerType"
            className="form-input"
            value={form.providerType}
            onChange={(e) => onChange('providerType', e.target.value as ProviderType)}
          >
            <option value="anthropic">Anthropic</option>
            <option value="openai-compatible">OpenAI-compatible</option>
          </select>
        </div>

        {form.providerType === 'openai-compatible' && (
          <div className="form-field">
            <label className="form-label" htmlFor="sf-providerBaseUrl">Provider base URL</label>
            <input
              id="sf-providerBaseUrl"
              className="form-input"
              type="url"
              value={form.providerBaseUrl}
              onChange={(e) => onChange('providerBaseUrl', e.target.value)}
              placeholder="e.g. https://router.huggingface.co/v1"
              required
            />
          </div>
        )}

        <div className="form-field">
          <label className="form-label" htmlFor="sf-modelId">Model ID</label>
          <input
            id="sf-modelId"
            className="form-input"
            type="text"
            value={form.modelId}
            onChange={(e) => onChange('modelId', e.target.value)}
            placeholder="e.g. gpt-4o or claude-3-5-sonnet-20241022"
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="sf-apiKey">API key</label>
          <input
            id="sf-apiKey"
            className="form-input"
            type="password"
            value={form.apiKey}
            onChange={(e) => onChange('apiKey', e.target.value)}
            placeholder="Stored securely on disk, not in the repo"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="sf-contextWindow">Context window (tokens)</label>
            <input
              id="sf-contextWindow"
              className="form-input"
              type="number"
              min="0"
              value={form.contextWindow}
              onChange={(e) => onChange('contextWindow', e.target.value)}
              placeholder="e.g. 128000"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="sf-maxOutputTokens">Max output tokens</label>
            <input
              id="sf-maxOutputTokens"
              className="form-input"
              type="number"
              min="0"
              value={form.maxOutputTokens}
              onChange={(e) => onChange('maxOutputTokens', e.target.value)}
              placeholder="e.g. 8192"
            />
          </div>
        </div>

        <div className="form-checkboxes">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={form.supportsThinking}
              onChange={(e) => onChange('supportsThinking', e.target.checked)}
            />
            Supports extended thinking / reasoning
          </label>
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={form.supportsMultimodal}
              onChange={(e) => onChange('supportsMultimodal', e.target.checked)}
            />
            Supports multimodal input (images)
          </label>
        </div>

        {error && <p className="settings-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="form-btn-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="form-btn-submit" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Model'}
          </button>
        </div>
      </form>
    </div>
  );
}
