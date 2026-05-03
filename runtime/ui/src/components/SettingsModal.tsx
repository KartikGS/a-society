import { useEffect, useRef, useState } from 'react';
import { normalizeModelConfig, normalizeModelConfigs, normalizeToolSettings } from '../model-config';
import type { InputModality, ModelConfig, ProviderType, ToolSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  onModelsChange?: () => void;
  required?: boolean;
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
  supportedInputTypes: InputModality[];
}

interface ToolFormState {
  tavilyApiKey: string;
  webSearchEnabled: boolean;
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
  supportedInputTypes: [],
};

const DEFAULT_TOOL_FORM: ToolFormState = {
  tavilyApiKey: '',
  webSearchEnabled: false,
};

const INPUT_MODALITY_OPTIONS: Array<{ value: InputModality; label: string }> = [
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
];

function formatInputModality(value: InputModality): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type EditorView = 'list' | 'add' | 'edit';
type SettingsTab = 'models' | 'tools';

export function SettingsModal({ onClose, onModelsChange, required = false }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('models');
  const [view, setView] = useState<EditorView>('list');
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [form, setForm] = useState<ModelFormState>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [toolSettings, setToolSettings] = useState<ToolSettings | null>(null);
  const [toolForm, setToolForm] = useState<ToolFormState>(DEFAULT_TOOL_FORM);
  const [toolError, setToolError] = useState<string | null>(null);
  const [savingTools, setSavingTools] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  function replaceModels(next: ModelConfig[]): void {
    setModels(next);
    onModelsChange?.();
  }

  function replaceToolSettings(next: ToolSettings): void {
    setToolSettings(next);
    setToolForm({
      tavilyApiKey: '',
      webSearchEnabled: next.webSearch.enabled,
    });
  }

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/settings/models');
        if (!res.ok) throw new Error(await res.text());
        replaceModels(normalizeModelConfigs(await res.json()));
        setListError(null);
      } catch (err) {
        setListError(err instanceof Error ? err.message : 'Failed to load models.');
      }
    }

    async function fetchTools() {
      try {
        const res = await fetch('/api/settings/tools');
        if (!res.ok) throw new Error(await res.text());
        const next = normalizeToolSettings(await res.json());
        if (!next) throw new Error('Failed to load tool settings.');
        replaceToolSettings(next);
        setToolError(null);
      } catch (err) {
        setToolError(err instanceof Error ? err.message : 'Failed to load tool settings.');
      }
    }

    void fetchModels();
    void fetchTools();
  }, []);

  async function handleActivate(id: string) {
    try {
      const res = await fetch(`/api/settings/models/${encodeURIComponent(id)}/activate`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      replaceModels(models.map((m) => ({ ...m, active: m.id === id })));
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to activate model.');
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/settings/models/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      const next = models.filter((m) => m.id !== id);
      if (models.find((m) => m.id === id)?.active && next.length > 0) {
        next[0] = { ...next[0], active: true };
      }
      replaceModels(next);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to delete model.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const isEditing = view === 'edit';

    if (!form.displayName.trim()) { setFormError('Display name is required.'); return; }
    if (!form.modelId.trim()) { setFormError('Model ID is required.'); return; }
    if (!isEditing && !form.apiKey.trim()) { setFormError('API key is required.'); return; }
    if (form.providerType === 'openai-compatible' && !form.providerBaseUrl.trim()) {
      setFormError('Provider base URL is required for OpenAI-compatible providers.');
      return;
    }
    if (isEditing && !editingModelId) {
      setFormError('No model is selected for editing.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        displayName: form.displayName.trim(),
        providerType: form.providerType,
        providerBaseUrl: form.providerBaseUrl.trim(),
        modelId: form.modelId.trim(),
        apiKey: form.apiKey.trim(),
        contextWindow: form.contextWindow ? parseInt(form.contextWindow, 10) : 0,
        maxOutputTokens: form.maxOutputTokens ? parseInt(form.maxOutputTokens, 10) : 0,
        supportsThinking: form.supportsThinking,
        supportedInputTypes: form.supportedInputTypes,
      };
      const res = await fetch(isEditing ? `/api/settings/models/${encodeURIComponent(editingModelId!)}` : '/api/settings/models', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json() as { message?: string };
        throw new Error(body.message ?? (isEditing ? 'Failed to update model.' : 'Failed to create model.'));
      }
      const saved = normalizeModelConfig(await res.json());
      if (!saved) {
        throw new Error('Server returned an invalid model configuration.');
      }
      replaceModels(isEditing
        ? models.map((model) => model.id === saved.id ? saved : model)
        : models.concat(saved));
      setForm(DEFAULT_FORM);
      setEditingModelId(null);
      setView('list');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : (isEditing ? 'Failed to update model.' : 'Failed to create model.'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (!required && e.target === overlayRef.current) onClose();
  }

  function setField<K extends keyof ModelFormState>(key: K, value: ModelFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startAdd(): void {
    setActiveTab('models');
    setEditingModelId(null);
    setForm(DEFAULT_FORM);
    setFormError(null);
    setView('add');
  }

  function startEdit(model: ModelConfig): void {
    setActiveTab('models');
    setEditingModelId(model.id);
    setForm({
      displayName: model.displayName,
      providerType: model.providerType,
      providerBaseUrl: model.providerBaseUrl,
      modelId: model.modelId,
      apiKey: '',
      contextWindow: model.contextWindow > 0 ? String(model.contextWindow) : '',
      maxOutputTokens: model.maxOutputTokens > 0 ? String(model.maxOutputTokens) : '',
      supportsThinking: model.supportsThinking,
      supportedInputTypes: [...model.supportedInputTypes],
    });
    setFormError(null);
    setView('edit');
  }

  async function handleSaveTools(e: React.FormEvent) {
    e.preventDefault();
    setToolError(null);

    try {
      setSavingTools(true);
      const response = await fetch('/api/settings/tools/web-search', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: toolForm.webSearchEnabled,
          apiKey: toolForm.tavilyApiKey.trim(),
        }),
      });
      if (!response.ok) {
        const body = await response.json() as { message?: string };
        throw new Error(body.message ?? 'Failed to save tool settings.');
      }
      const next = normalizeToolSettings(await response.json());
      if (!next) throw new Error('Server returned invalid tool settings.');
      replaceToolSettings(next);
    } catch (err) {
      setToolError(err instanceof Error ? err.message : 'Failed to save tool settings.');
    } finally {
      setSavingTools(false);
    }
  }

  const canEnableWebSearch = (toolSettings?.webSearch.hasApiKey ?? false) || toolForm.tavilyApiKey.trim() !== '';

  return (
    <div className="modal-overlay settings-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Settings</h2>
          {!required ? (
            <button type="button" className="settings-close-btn" onClick={onClose} aria-label="Close settings">×</button>
          ) : null}
        </div>

        <div className="settings-modal-body">
          <nav className="settings-nav">
            <button
              type="button"
              className={`settings-nav-item${activeTab === 'models' ? ' settings-nav-item-active' : ''}`}
              onClick={() => setActiveTab('models')}
            >
              Models
            </button>
            <button
              type="button"
              className={`settings-nav-item${activeTab === 'tools' ? ' settings-nav-item-active' : ''}`}
              onClick={() => setActiveTab('tools')}
            >
              Tools
            </button>
          </nav>

          <div className="settings-content">
            {activeTab === 'models' ? (
              view === 'list' ? (
              <ModelList
                models={models}
                error={listError}
                onAdd={startAdd}
                onEdit={startEdit}
                onActivate={handleActivate}
                onDelete={handleDelete}
              />
            ) : (
              <AddModelForm
                form={form}
                mode={view}
                error={formError}
                submitting={submitting}
                onChange={setField}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setEditingModelId(null);
                  setFormError(null);
                  setView('list');
                }}
              />
              )
            ) : (
              <ToolsSettingsPanel
                settings={toolSettings}
                form={toolForm}
                error={toolError}
                saving={savingTools}
                canEnableWebSearch={canEnableWebSearch}
                onChange={(updater) => setToolForm((current) => updater(current))}
                onSubmit={handleSaveTools}
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
  onEdit: (model: ModelConfig) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

function ModelList({ models, error, onAdd, onEdit, onActivate, onDelete }: ModelListProps) {
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

interface AddModelFormProps {
  form: ModelFormState;
  mode: EditorView;
  error: string | null;
  submitting: boolean;
  onChange: <K extends keyof ModelFormState>(key: K, value: ModelFormState[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function AddModelForm({ form, mode, error, submitting, onChange, onSubmit, onCancel }: AddModelFormProps) {
  const isEditing = mode === 'edit';

  function toggleInputModality(modality: InputModality, checked: boolean) {
    const next = checked
      ? [...form.supportedInputTypes, modality]
      : form.supportedInputTypes.filter((value) => value !== modality);
    onChange('supportedInputTypes', next);
  }

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">{isEditing ? 'Edit Model' : 'Add Model'}</h3>
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
            className="form-input form-select"
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
          <div className="form-label-with-info">
            <label className="form-label" htmlFor="sf-apiKey">API key</label>
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
            id="sf-apiKey"
            className="form-input"
            type="password"
            value={form.apiKey}
            onChange={(e) => onChange('apiKey', e.target.value)}
            placeholder={isEditing ? 'Leave blank to keep the current API key' : 'Stored locally in plaintext on your machine'}
            required={!isEditing}
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
          <div className="form-fieldset">
            <span className="form-label">Supports multimodal input</span>
            <div className="form-checkbox-group">
              {INPUT_MODALITY_OPTIONS.map((option) => (
                <label key={option.value} className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.supportedInputTypes.includes(option.value)}
                    onChange={(e) => toggleInputModality(option.value, e.target.checked)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="settings-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="form-btn-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="form-btn-submit" disabled={submitting}>
            {submitting ? (isEditing ? 'Saving…' : 'Adding…') : (isEditing ? 'Save Changes' : 'Add Model')}
          </button>
        </div>
      </form>
    </div>
  );
}

interface ToolsSettingsPanelProps {
  settings: ToolSettings | null;
  form: ToolFormState;
  error: string | null;
  saving: boolean;
  canEnableWebSearch: boolean;
  onChange: (updater: (current: ToolFormState) => ToolFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function ToolsSettingsPanel({
  settings,
  form,
  error,
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

        {error && <p className="settings-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="form-btn-submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Tool Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
