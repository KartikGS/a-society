import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DISABLED_REASONING,
} from '../../../shared/model-reasoning.js';
import { normalizeFeedSettings, normalizeMcpServerSummaries, normalizeMcpServerSummary, normalizeModelConfig, normalizeModelConfigs, normalizeSkillLoadResults, normalizeToolSettings } from '../model-config';
import {
  AddModelForm,
  AutomationToggle,
  FeedSettingsPanel,
  McpSettingsPanel,
  ModelList,
  SkillsSettingsPanel,
  ToolsSettingsPanel,
} from './settings';
import type {
  EditorView,
  FeedFormState,
  McpFormState,
  ModelFormState,
  SkillFormState,
  ToolFormState,
} from './settings/settings-types';
import type {
  AutomationSettings,
  FeedSettings,
  SelectionMode,
  McpServerSummary,
  ModelConfig,
  ModelReasoningConfig,
  SkillLoadResult,
  ToolSettings,
} from '../types';

interface SettingsModalProps {
  onClose: () => void;
  onError?: (message: string) => void;
  onModelsChange?: () => void;
  onSkillsChange?: () => void;
  onMcpServersChange?: () => void;
  required?: boolean;
}

interface McpServerConfig extends McpServerSummary {
  command?: string;
  args?: string[];
  envKeys?: string[];
  url?: string;
  headerKeys?: string[];
}

const DEFAULT_FORM: ModelFormState = {
  displayName: '',
  providerType: 'openai-compatible',
  providerBaseUrl: '',
  modelId: '',
  apiKey: '',
  contextWindow: '',
  maxOutputTokens: '',
  reasoning: DISABLED_REASONING,
  cacheTtl: '5m',
  customReasoningExtraBodyJson: '{}',
  supportedInputTypes: [],
};

const DEFAULT_TOOL_FORM: ToolFormState = {
  tavilyApiKey: '',
  webSearchEnabled: false,
};

const DEFAULT_FEED_FORM: FeedFormState = {
  historyLimit: '400',
};

const DEFAULT_SKILL_FORM: SkillFormState = {
  importPath: '',
};

const DEFAULT_MCP_FORM: McpFormState = {
  name: '',
  transport: 'stdio',
  command: '',
  args: '',
  envText: '',
  url: '',
  headersText: '',
};

function formatJsonObject(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2);
}

function parseJsonObject(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Extra request body must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

function normalizeMcpServerConfig(value: unknown): McpServerConfig | null {
  const summary = normalizeMcpServerSummary(value);
  if (!summary || !value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  return {
    ...summary,
    command: typeof raw.command === 'string' ? raw.command : undefined,
    args: Array.isArray(raw.args) ? raw.args.filter((entry): entry is string => typeof entry === 'string') : [],
    envKeys: Array.isArray(raw.envKeys) ? raw.envKeys.filter((entry): entry is string => typeof entry === 'string') : [],
    url: typeof raw.url === 'string' ? raw.url : undefined,
    headerKeys: Array.isArray(raw.headerKeys) ? raw.headerKeys.filter((entry): entry is string => typeof entry === 'string') : [],
  };
}

type SettingsTab = 'models' | 'tools' | 'feed' | 'mcp' | 'skills';

export function SettingsModal({ onClose, onError, onModelsChange, onSkillsChange, onMcpServersChange, required = false }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('models');
  const [view, setView] = useState<EditorView>('list');
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [form, setForm] = useState<ModelFormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [toolSettings, setToolSettings] = useState<ToolSettings | null>(null);
  const [toolForm, setToolForm] = useState<ToolFormState>(DEFAULT_TOOL_FORM);
  const [savingTools, setSavingTools] = useState(false);
  const [feedSettings, setFeedSettings] = useState<FeedSettings | null>(null);
  const [feedForm, setFeedForm] = useState<FeedFormState>(DEFAULT_FEED_FORM);
  const [savingFeed, setSavingFeed] = useState(false);
  const [automation, setAutomation] = useState<AutomationSettings | null>(null);
  const [skillResults, setSkillResults] = useState<SkillLoadResult[]>([]);
  const [skillForm, setSkillForm] = useState<SkillFormState>(DEFAULT_SKILL_FORM);
  const [savingSkills, setSavingSkills] = useState(false);
  const [mcpServers, setMcpServers] = useState<McpServerSummary[]>([]);
  const [mcpForm, setMcpForm] = useState<McpFormState>(DEFAULT_MCP_FORM);
  const [savingMcp, setSavingMcp] = useState(false);
  const [editingMcpId, setEditingMcpId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const reportError = useCallback((message: string): void => {
    onError?.(message);
  }, [onError]);

  const replaceModels = useCallback((next: ModelConfig[]): void => {
    setModels(next);
    onModelsChange?.();
  }, [onModelsChange]);

  function replaceToolSettings(next: ToolSettings): void {
    setToolSettings(next);
    setToolForm({
      tavilyApiKey: '',
      webSearchEnabled: next.webSearch.enabled,
    });
  }

  function replaceFeedSettings(next: FeedSettings): void {
    setFeedSettings(next);
    setFeedForm({ historyLimit: String(next.historyLimit) });
  }

  const replaceSkillResults = useCallback((next: SkillLoadResult[]): void => {
    setSkillResults(next);
    onSkillsChange?.();
  }, [onSkillsChange]);

  const replaceMcpServers = useCallback((next: McpServerSummary[]): void => {
    setMcpServers(next);
    onMcpServersChange?.();
  }, [onMcpServersChange]);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/settings/models');
        if (!res.ok) throw new Error(await res.text());
        replaceModels(normalizeModelConfigs(await res.json()));
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load models.');
      }
    }

    async function fetchTools() {
      try {
        const res = await fetch('/api/settings/tools');
        if (!res.ok) throw new Error(await res.text());
        const next = normalizeToolSettings(await res.json());
        if (!next) throw new Error('Failed to load tool settings.');
        replaceToolSettings(next);
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load tool settings.');
      }
    }

    async function fetchFeedSettings() {
      try {
        const res = await fetch('/api/settings/feed');
        if (!res.ok) throw new Error(await res.text());
        const next = normalizeFeedSettings(await res.json());
        if (!next) throw new Error('Failed to load feed settings.');
        replaceFeedSettings(next);
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load feed settings.');
      }
    }

    async function fetchSkills() {
      try {
        const res = await fetch('/api/settings/skills');
        if (!res.ok) throw new Error(await res.text());
        replaceSkillResults(normalizeSkillLoadResults(await res.json()));
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load skills.');
      }
    }

    async function fetchMcpServers() {
      try {
        const res = await fetch('/api/settings/mcp');
        if (!res.ok) throw new Error(await res.text());
        replaceMcpServers(normalizeMcpServerSummaries(await res.json()));
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load MCP servers.');
      }
    }

    async function fetchAutomation() {
      try {
        const res = await fetch('/api/settings/automation');
        if (!res.ok) throw new Error(await res.text());
        const raw = await res.json() as Record<string, unknown>;
        const mode = (value: unknown): SelectionMode => (value === 'auto' ? 'auto' : 'manual');
        setAutomation({ models: mode(raw.models), skills: mode(raw.skills), mcpServers: mode(raw.mcpServers) });
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load automation settings.');
      }
    }

    void fetchModels();
    void fetchTools();
    void fetchFeedSettings();
    void fetchSkills();
    void fetchMcpServers();
    void fetchAutomation();
  }, [replaceMcpServers, replaceModels, replaceSkillResults, reportError]);

  async function updateAutomation(dimension: keyof AutomationSettings, mode: SelectionMode): Promise<void> {
    try {
      const res = await fetch('/api/settings/automation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [dimension]: mode }),
      });
      if (!res.ok) throw new Error(await res.text());
      const raw = await res.json() as Record<string, unknown>;
      const normalize = (value: unknown): SelectionMode => (value === 'auto' ? 'auto' : 'manual');
      setAutomation({ models: normalize(raw.models), skills: normalize(raw.skills), mcpServers: normalize(raw.mcpServers) });
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to update automation settings.');
    }
  }

  async function handleActivate(id: string) {
    try {
      const res = await fetch(`/api/settings/models/${encodeURIComponent(id)}/activate`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      replaceModels(models.map((m) => ({ ...m, active: m.id === id })));
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to activate model.');
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
      reportError(err instanceof Error ? err.message : 'Failed to delete model.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isEditing = view === 'edit';

    if (!form.displayName.trim()) { reportError('Display name is required.'); return; }
    if (!form.modelId.trim()) { reportError('Model ID is required.'); return; }
    if (!isEditing && !form.apiKey.trim()) { reportError('API key is required.'); return; }
    if (form.providerType === 'openai-compatible' && !form.providerBaseUrl.trim()) {
      reportError('Provider base URL is required for OpenAI-compatible providers.');
      return;
    }
    if (form.reasoning.mode === 'anthropic-manual' && form.reasoning.budgetTokens <= 0) {
      reportError('Thinking budget must be a positive number.');
      return;
    }
    if (isEditing && !editingModelId) {
      reportError('No model is selected for editing.');
      return;
    }

    setSubmitting(true);
    try {
      const reasoning: ModelReasoningConfig = form.reasoning.mode === 'custom-openai-compatible'
        ? {
            ...form.reasoning,
            request: {
              ...form.reasoning.request,
              extraBody: parseJsonObject(form.customReasoningExtraBodyJson),
            },
          }
        : form.reasoning;
      const payload = {
        displayName: form.displayName.trim(),
        providerType: form.providerType,
        providerBaseUrl: form.providerBaseUrl.trim(),
        modelId: form.modelId.trim(),
        apiKey: form.apiKey.trim(),
        contextWindow: form.contextWindow ? parseInt(form.contextWindow, 10) : 0,
        maxOutputTokens: form.maxOutputTokens ? parseInt(form.maxOutputTokens, 10) : 0,
        reasoning,
        cacheTtl: form.cacheTtl,
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
      const message = err instanceof Error ? err.message : (isEditing ? 'Failed to update model.' : 'Failed to create model.');
      reportError(message);
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
      reasoning: model.reasoning,
      cacheTtl: model.cacheTtl,
      customReasoningExtraBodyJson: model.reasoning.mode === 'custom-openai-compatible'
        ? formatJsonObject(model.reasoning.request.extraBody)
        : '{}',
      supportedInputTypes: [...model.supportedInputTypes],
    });
    setView('edit');
  }

  async function handleSaveTools(e: React.FormEvent) {
    e.preventDefault();

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
      reportError(err instanceof Error ? err.message : 'Failed to save tool settings.');
    } finally {
      setSavingTools(false);
    }
  }

  async function handleSaveFeed(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSavingFeed(true);
      const response = await fetch('/api/settings/feed', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyLimit: feedForm.historyLimit ? parseInt(feedForm.historyLimit, 10) : 0,
        }),
      });
      if (!response.ok) {
        const body = await response.json() as { message?: string };
        throw new Error(body.message ?? 'Failed to save feed settings.');
      }
      const next = normalizeFeedSettings(await response.json());
      if (!next) throw new Error('Server returned invalid feed settings.');
      replaceFeedSettings(next);
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to save feed settings.');
    } finally {
      setSavingFeed(false);
    }
  }

  async function refreshSkills(): Promise<void> {
    const response = await fetch('/api/settings/skills');
    if (!response.ok) {
      throw new Error(await response.text());
    }
    replaceSkillResults(normalizeSkillLoadResults(await response.json()));
  }

  async function handleImportSkill(e: React.FormEvent) {
    e.preventDefault();
    const importPath = skillForm.importPath.trim();
    if (!importPath) { reportError('Import path is required.'); return; }

    try {
      setSavingSkills(true);
      const response = await fetch('/api/settings/skills/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: importPath }),
      });
      const body = await response.json().catch(() => null) as { message?: string; notice?: string | null } | null;
      if (!response.ok) {
        throw new Error(body?.message ?? 'Failed to import skill.');
      }
      if (body?.notice) reportError(body.notice);
      setSkillForm((current) => ({ ...current, importPath: '' }));
      await refreshSkills();
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to import skill.');
    } finally {
      setSavingSkills(false);
    }
  }

  async function handleDeleteSkill(name: string) {
    try {
      setSavingSkills(true);
      const response = await fetch(`/api/settings/skills/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(body?.message ?? 'Failed to delete skill.');
      }
      await refreshSkills();
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to delete skill.');
    } finally {
      setSavingSkills(false);
    }
  }

  function parseMcpKeyValueText(
    value: string,
    options: { allowColonSeparator?: boolean; label: string }
  ): Record<string, string> {
    const parsed: Record<string, string> = {};
    for (const rawLine of value.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      const equalsIndex = line.indexOf('=');
      const colonIndex = options.allowColonSeparator ? line.indexOf(':') : -1;
      const separatorIndex = equalsIndex > 0 && (colonIndex <= 0 || equalsIndex < colonIndex)
        ? equalsIndex
        : colonIndex;
      if (separatorIndex <= 0) {
        throw new Error(
          options.allowColonSeparator
            ? `MCP ${options.label} rows must use KEY=value or Header: value.`
            : `MCP ${options.label} rows must use KEY=value.`
        );
      }
      const key = line.slice(0, separatorIndex).trim();
      if (!key) throw new Error(`MCP ${options.label} keys cannot be empty.`);
      parsed[key] = line.slice(separatorIndex + 1).trimStart();
    }
    return parsed;
  }

  function parseMcpArgs(value: string): string[] {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '');
  }

  async function refreshMcpServers(): Promise<void> {
    const response = await fetch('/api/settings/mcp');
    if (!response.ok) {
      throw new Error(await response.text());
    }
    replaceMcpServers(normalizeMcpServerSummaries(await response.json()));
  }

  async function handleSaveMcpServer(e: React.FormEvent) {
    e.preventDefault();
    if (!mcpForm.name.trim()) { reportError('MCP server name is required.'); return; }
    if (mcpForm.transport === 'stdio' && !mcpForm.command.trim()) {
      reportError('MCP stdio command is required.');
      return;
    }
    if (mcpForm.transport === 'http' && !mcpForm.url.trim()) {
      reportError('MCP HTTP URL is required.');
      return;
    }

    try {
      setSavingMcp(true);
      const isEditing = editingMcpId !== null;
      const payload = {
        name: mcpForm.name.trim(),
        transport: mcpForm.transport,
        command: mcpForm.command.trim(),
        args: parseMcpArgs(mcpForm.args),
        env: parseMcpKeyValueText(mcpForm.envText, { label: 'env', allowColonSeparator: false }),
        url: mcpForm.url.trim(),
        headers: parseMcpKeyValueText(mcpForm.headersText, { label: 'header', allowColonSeparator: true }),
      };
      const response = await fetch(isEditing ? `/api/settings/mcp/${encodeURIComponent(editingMcpId)}` : '/api/settings/mcp', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(body?.message ?? 'Failed to save MCP server.');
      }
      const saved = normalizeMcpServerSummary(body);
      if (saved) {
        replaceMcpServers(isEditing
          ? mcpServers.map((server) => server.id === saved.id ? saved : server)
          : mcpServers.concat(saved));
      } else {
        await refreshMcpServers();
      }
      setMcpForm(DEFAULT_MCP_FORM);
      setEditingMcpId(null);
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to save MCP server.');
    } finally {
      setSavingMcp(false);
    }
  }

  async function handleEditMcpServer(id: string): Promise<void> {
    try {
      setSavingMcp(true);
      const response = await fetch(`/api/settings/mcp/${encodeURIComponent(id)}`);
      const body = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(body?.message ?? 'Failed to load MCP server.');
      }
      const server = normalizeMcpServerConfig(body);
      if (!server) throw new Error('Server returned invalid MCP configuration.');
      setEditingMcpId(server.id);
      setMcpForm({
        name: server.name,
        transport: server.transport,
        command: server.command ?? '',
        args: (server.args ?? []).join('\n'),
        envText: (server.envKeys ?? []).map((key) => `${key}=`).join('\n'),
        url: server.url ?? '',
        headersText: (server.headerKeys ?? []).map((key) => `${key}=`).join('\n'),
      });
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to load MCP server.');
    } finally {
      setSavingMcp(false);
    }
  }

  function handleCancelMcpEdit(): void {
    setEditingMcpId(null);
    setMcpForm(DEFAULT_MCP_FORM);
  }

  async function handleDeleteMcpServer(id: string) {
    try {
      setSavingMcp(true);
      const response = await fetch(`/api/settings/mcp/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(body?.message ?? 'Failed to delete MCP server.');
      }
      await refreshMcpServers();
      if (editingMcpId === id) handleCancelMcpEdit();
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to delete MCP server.');
    } finally {
      setSavingMcp(false);
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
            <button
              type="button"
              className={`settings-nav-item${activeTab === 'feed' ? ' settings-nav-item-active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              Feed
            </button>
            <button
              type="button"
              className={`settings-nav-item${activeTab === 'mcp' ? ' settings-nav-item-active' : ''}`}
              onClick={() => setActiveTab('mcp')}
            >
              MCP
            </button>
            <button
              type="button"
              className={`settings-nav-item${activeTab === 'skills' ? ' settings-nav-item-active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              Skills
            </button>
          </nav>

          <div className="settings-content">
            {activeTab === 'models' ? (
              view === 'list' ? (
              <>
                {automation ? (
                  <AutomationToggle label="Model" mode={automation.models} onChange={(mode) => { void updateAutomation('models', mode); }} />
                ) : null}
                <ModelList
                  models={models}
                  onAdd={startAdd}
                  onEdit={startEdit}
                  onActivate={(id) => { void handleActivate(id); }}
                  onDelete={(id) => { void handleDelete(id); }}
                />
              </>
            ) : (
              <AddModelForm
                form={form}
                mode={view}
                submitting={submitting}
                onChange={setField}
                onSubmit={(event) => { void handleSubmit(event); }}
                onCancel={() => {
                  setEditingModelId(null);
                  setView('list');
                }}
              />
              )
            ) : activeTab === 'tools' ? (
              <ToolsSettingsPanel
                settings={toolSettings}
                form={toolForm}
                saving={savingTools}
                canEnableWebSearch={canEnableWebSearch}
                onChange={(updater) => setToolForm((current) => updater(current))}
                onSubmit={(event) => { void handleSaveTools(event); }}
              />
            ) : activeTab === 'feed' ? (
              <FeedSettingsPanel
                settings={feedSettings}
                form={feedForm}
                saving={savingFeed}
                onChange={(updater) => setFeedForm((current) => updater(current))}
                onSubmit={(event) => { void handleSaveFeed(event); }}
              />
            ) : activeTab === 'mcp' ? (
              <>
                {automation ? (
                  <AutomationToggle label="MCP server" mode={automation.mcpServers} onChange={(mode) => { void updateAutomation('mcpServers', mode); }} />
                ) : null}
                <McpSettingsPanel
                  servers={mcpServers}
                  form={mcpForm}
                  editingId={editingMcpId}
                  saving={savingMcp}
                  onChange={(updater) => setMcpForm((current) => updater(current))}
                  onSubmit={(event) => { void handleSaveMcpServer(event); }}
                  onEdit={(id) => { void handleEditMcpServer(id); }}
                  onCancelEdit={handleCancelMcpEdit}
                  onDelete={(id) => { void handleDeleteMcpServer(id); }}
                />
              </>
            ) : (
              <>
                {automation ? (
                  <AutomationToggle label="Skill" mode={automation.skills} onChange={(mode) => { void updateAutomation('skills', mode); }} />
                ) : null}
                <SkillsSettingsPanel
                  results={skillResults}
                  form={skillForm}
                  saving={savingSkills}
                  onChange={(updater) => setSkillForm((current) => updater(current))}
                  onImport={(event) => { void handleImportSkill(event); }}
                  onDelete={(name) => { void handleDeleteSkill(name); }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
