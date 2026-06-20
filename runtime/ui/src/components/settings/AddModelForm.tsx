import type React from 'react';
import {
  ANTHROPIC_EFFORTS,
  ANTHROPIC_THINKING_DISPLAYS,
  DISABLED_REASONING,
  OPENAI_COMPATIBLE_TOKEN_LIMIT_PARAMS,
  OPENAI_REASONING_EFFORTS,
  PROVIDER_REASONING_DISPLAYS,
  PROVIDER_REASONING_REPLAY_POLICIES,
  defaultReasoningForProvider,
} from '../../../../shared/model-reasoning.js';
import type {
  AnthropicEffort,
  AnthropicThinkingDisplay,
  ModelReasoningConfig,
  OpenAICompatibleTokenLimitParam,
  OpenAIReasoningEffort,
  ProviderReasoningDisplay,
  ProviderReasoningReplayPolicy,
} from '../../../../shared/model-reasoning.js';
import type { InputModality, ProviderType } from '../../../../shared/settings.js';
import type { EditorView, ModelFormState } from './settings-types';

const INPUT_MODALITY_OPTIONS: Array<{ value: InputModality; label: string }> = [
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
];

interface AddModelFormProps {
  form: ModelFormState;
  mode: EditorView;
  submitting: boolean;
  onChange: <K extends keyof ModelFormState>(key: K, value: ModelFormState[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function AddModelForm({ form, mode, submitting, onChange, onSubmit, onCancel }: AddModelFormProps) {
  const isEditing = mode === 'edit';

  function updateProviderType(providerType: ProviderType): void {
    onChange('providerType', providerType);
    if (form.reasoning.mode !== 'disabled') {
      onChange('reasoning', defaultReasoningForProvider(providerType));
    }
  }

  function updateReasoningMode(mode: ModelReasoningConfig['mode']): void {
    if (mode === 'disabled') {
      onChange('reasoning', DISABLED_REASONING);
      return;
    }
    if (mode === 'openai-chat') {
      onChange('reasoning', { mode, effort: 'medium' });
      return;
    }
    if (mode === 'anthropic-adaptive') {
      onChange('reasoning', { mode, effort: 'medium', display: 'omitted' });
      return;
    }
    if (mode === 'custom-openai-compatible') {
      onChange('reasoning', {
        mode,
        request: {
          tokenLimitParam: 'max_tokens',
          extraBody: {},
        },
        trace: {
          responseDeltaField: 'reasoning_content',
          requestMessageField: 'reasoning_content',
          replay: 'tool-calls-only',
          display: 'collapsed',
          label: 'Provider reasoning trace',
        },
      });
      onChange('customReasoningExtraBodyJson', '{}');
      return;
    }
    onChange('reasoning', { mode, effort: 'medium', display: 'omitted', budgetTokens: 2048 });
  }

  function updateOpenAIEffort(effort: OpenAIReasoningEffort): void {
    if (form.reasoning.mode !== 'openai-chat') return;
    onChange('reasoning', { ...form.reasoning, effort });
  }

  function updateAnthropicEffort(effort: AnthropicEffort): void {
    if (form.reasoning.mode !== 'anthropic-adaptive' && form.reasoning.mode !== 'anthropic-manual') return;
    onChange('reasoning', { ...form.reasoning, effort });
  }

  function updateAnthropicDisplay(display: AnthropicThinkingDisplay): void {
    if (form.reasoning.mode !== 'anthropic-adaptive' && form.reasoning.mode !== 'anthropic-manual') return;
    onChange('reasoning', { ...form.reasoning, display });
  }

  function updateAnthropicBudget(value: string): void {
    if (form.reasoning.mode !== 'anthropic-manual') return;
    const parsed = Number(value);
    onChange('reasoning', {
      ...form.reasoning,
      budgetTokens: Number.isFinite(parsed) ? Math.trunc(parsed) : 0,
    });
  }

  function updateCustomTokenLimitParam(tokenLimitParam: OpenAICompatibleTokenLimitParam): void {
    if (form.reasoning.mode !== 'custom-openai-compatible') return;
    onChange('reasoning', {
      ...form.reasoning,
      request: { ...form.reasoning.request, tokenLimitParam },
    });
  }

  function updateCustomTraceField<K extends 'responseDeltaField' | 'requestMessageField' | 'label'>(
    key: K,
    value: string
  ): void {
    if (form.reasoning.mode !== 'custom-openai-compatible') return;
    const trace = form.reasoning.trace ?? {
      responseDeltaField: '',
      requestMessageField: '',
      replay: 'tool-calls-only' as const,
      display: 'collapsed' as const,
      label: 'Provider reasoning trace',
    };
    onChange('reasoning', {
      ...form.reasoning,
      trace: { ...trace, [key]: value },
    });
  }

  function updateCustomTraceReplay(replay: ProviderReasoningReplayPolicy): void {
    if (form.reasoning.mode !== 'custom-openai-compatible') return;
    const trace = form.reasoning.trace;
    if (!trace) return;
    onChange('reasoning', {
      ...form.reasoning,
      trace: { ...trace, replay },
    });
  }

  function updateCustomTraceDisplay(display: ProviderReasoningDisplay): void {
    if (form.reasoning.mode !== 'custom-openai-compatible') return;
    const trace = form.reasoning.trace;
    if (!trace) return;
    onChange('reasoning', {
      ...form.reasoning,
      trace: { ...trace, display },
    });
  }

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
            onChange={(e) => updateProviderType(e.target.value as ProviderType)}
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

        {form.providerType === 'anthropic' && (
          <div className="form-fieldset">
            <span className="form-label">Prompt cache TTL</span>
            <div className="cache-ttl-options" role="group" aria-label="Anthropic prompt cache TTL">
              <button
                type="button"
                className={`cache-ttl-option${form.cacheTtl === '5m' ? ' cache-ttl-option-active' : ''}`}
                aria-pressed={form.cacheTtl === '5m'}
                onClick={() => onChange('cacheTtl', '5m')}
              >
                5 min
              </button>
              <button
                type="button"
                className={`cache-ttl-option${form.cacheTtl === '1h' ? ' cache-ttl-option-active' : ''}`}
                aria-pressed={form.cacheTtl === '1h'}
                onClick={() => onChange('cacheTtl', '1h')}
              >
                1 hour
              </button>
            </div>
            <p className="form-note">Anthropic charges a higher write rate when a prefix is cached; 1 hour uses the higher long-lived cache write rate.</p>
          </div>
        )}

        <div className="form-checkboxes">
          <div className="form-fieldset">
            <span className="form-label">Reasoning</span>
            <select
              className="form-input form-select"
              value={form.reasoning.mode}
              onChange={(e) => updateReasoningMode(e.target.value as ModelReasoningConfig['mode'])}
            >
              <option value="disabled">Disabled</option>
              {form.providerType === 'openai-compatible' && (
                <>
                  <option value="openai-chat">OpenAI Chat reasoning</option>
                  <option value="custom-openai-compatible">Custom OpenAI-compatible</option>
                </>
              )}
              {form.providerType === 'anthropic' && (
                <>
                  <option value="anthropic-adaptive">Anthropic adaptive thinking</option>
                  <option value="anthropic-manual">Anthropic manual thinking</option>
                </>
              )}
            </select>
          </div>

          {form.reasoning.mode === 'openai-chat' && (
            <div className="form-fieldset">
              <span className="form-label">Reasoning effort</span>
              <select
                className="form-input form-select"
                value={form.reasoning.effort}
                onChange={(e) => updateOpenAIEffort(e.target.value as OpenAIReasoningEffort)}
              >
                {OPENAI_REASONING_EFFORTS.map((effort) => (
                  <option key={effort} value={effort}>{effort}</option>
                ))}
              </select>
            </div>
          )}

          {form.reasoning.mode === 'custom-openai-compatible' && (
            <>
              <div className="form-fieldset">
                <span className="form-label">Token limit parameter</span>
                <select
                  className="form-input form-select"
                  value={form.reasoning.request.tokenLimitParam}
                  onChange={(e) => updateCustomTokenLimitParam(e.target.value as OpenAICompatibleTokenLimitParam)}
                >
                  {OPENAI_COMPATIBLE_TOKEN_LIMIT_PARAMS.map((param) => (
                    <option key={param} value={param}>{param}</option>
                  ))}
                </select>
              </div>
              <div className="form-fieldset">
                <span className="form-label">Extra request body JSON</span>
                <textarea
                  className="form-input form-textarea"
                  value={form.customReasoningExtraBodyJson}
                  onChange={(e) => onChange('customReasoningExtraBodyJson', e.target.value)}
                  spellCheck={false}
                  rows={6}
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="sf-reasoningResponseField">Response delta field</label>
                  <input
                    id="sf-reasoningResponseField"
                    className="form-input"
                    type="text"
                    value={form.reasoning.trace?.responseDeltaField ?? ''}
                    onChange={(e) => updateCustomTraceField('responseDeltaField', e.target.value)}
                    placeholder="reasoning_content"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="sf-reasoningRequestField">Request message field</label>
                  <input
                    id="sf-reasoningRequestField"
                    className="form-input"
                    type="text"
                    value={form.reasoning.trace?.requestMessageField ?? ''}
                    onChange={(e) => updateCustomTraceField('requestMessageField', e.target.value)}
                    placeholder="reasoning_content"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="sf-reasoningReplay">Replay</label>
                  <select
                    id="sf-reasoningReplay"
                    className="form-input form-select"
                    value={form.reasoning.trace?.replay ?? 'tool-calls-only'}
                    onChange={(e) => updateCustomTraceReplay(e.target.value as ProviderReasoningReplayPolicy)}
                  >
                    {PROVIDER_REASONING_REPLAY_POLICIES.map((policy) => (
                      <option key={policy} value={policy}>{policy}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="sf-reasoningDisplay">Display</label>
                  <select
                    id="sf-reasoningDisplay"
                    className="form-input form-select"
                    value={form.reasoning.trace?.display ?? 'collapsed'}
                    onChange={(e) => updateCustomTraceDisplay(e.target.value as ProviderReasoningDisplay)}
                  >
                    {PROVIDER_REASONING_DISPLAYS.map((display) => (
                      <option key={display} value={display}>{display}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-fieldset">
                <span className="form-label">Trace label</span>
                <input
                  className="form-input"
                  type="text"
                  value={form.reasoning.trace?.label ?? ''}
                  onChange={(e) => updateCustomTraceField('label', e.target.value)}
                  placeholder="Provider reasoning trace"
                />
              </div>
            </>
          )}

          {(form.reasoning.mode === 'anthropic-adaptive' || form.reasoning.mode === 'anthropic-manual') && (
            <>
              <div className="form-fieldset">
                <span className="form-label">Effort</span>
                <select
                  className="form-input form-select"
                  value={form.reasoning.effort}
                  onChange={(e) => updateAnthropicEffort(e.target.value as AnthropicEffort)}
                >
                  {ANTHROPIC_EFFORTS.map((effort) => (
                    <option key={effort} value={effort}>{effort}</option>
                  ))}
                </select>
              </div>
              <div className="form-fieldset">
                <span className="form-label">Thinking display</span>
                <select
                  className="form-input form-select"
                  value={form.reasoning.display}
                  onChange={(e) => updateAnthropicDisplay(e.target.value as AnthropicThinkingDisplay)}
                >
                  {ANTHROPIC_THINKING_DISPLAYS.map((display) => (
                    <option key={display} value={display}>{display}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {form.reasoning.mode === 'anthropic-manual' && (
            <div className="form-fieldset">
              <span className="form-label">Thinking budget</span>
              <input
                className="form-input"
                type="number"
                min="1"
                value={form.reasoning.budgetTokens > 0 ? String(form.reasoning.budgetTokens) : ''}
                onChange={(e) => updateAnthropicBudget(e.target.value)}
                placeholder="e.g. 2048"
              />
            </div>
          )}

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

        <div className="form-actions">
          <button type="button" className="form-btn-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            className="form-btn-submit"
            disabled={submitting}
            title="A small sample request will be sent to verify this model configuration before saving."
          >
            {submitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Model')}
          </button>
        </div>
      </form>
    </div>
  );
}
