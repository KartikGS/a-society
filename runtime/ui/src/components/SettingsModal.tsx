import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ANTHROPIC_EFFORTS,
  ANTHROPIC_THINKING_DISPLAYS,
  DISABLED_REASONING,
  OPENAI_COMPATIBLE_TOKEN_LIMIT_PARAMS,
  OPENAI_REASONING_EFFORTS,
  PROVIDER_REASONING_DISPLAYS,
  PROVIDER_REASONING_REPLAY_POLICIES,
  defaultReasoningForProvider,
  reasoningLabel,
} from '../../../src/common/model-reasoning.js';
import { normalizeFeedSettings, normalizeMcpServerSummaries, normalizeMcpServerSummary, normalizeModelConfig, normalizeModelConfigs, normalizeSkillLoadResults, normalizeToolSettings } from '../model-config';
import type {
  AnthropicEffort,
  AnthropicThinkingDisplay,
  AutomationSettings,
  FeedSettings,
  InputModality,
  SelectionMode,
  McpServerSummary,
  ModelConfig,
  ModelReasoningConfig,
  OpenAICompatibleTokenLimitParam,
  OpenAIReasoningEffort,
  PromptCacheTtl,
  ProviderReasoningDisplay,
  ProviderReasoningReplayPolicy,
  ProviderType,
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

interface ModelFormState {
  displayName: string;
  providerType: ProviderType;
  providerBaseUrl: string;
  modelId: string;
  apiKey: string;
  contextWindow: string;
  maxOutputTokens: string;
  reasoning: ModelReasoningConfig;
  cacheTtl: PromptCacheTtl;
  customReasoningExtraBodyJson: string;
  supportedInputTypes: InputModality[];
}

interface ToolFormState {
  tavilyApiKey: string;
  webSearchEnabled: boolean;
}

interface FeedFormState {
  historyLimit: string;
}

interface SkillFormState {
  importPath: string;
}

interface McpFormState {
  name: string;
  transport: 'stdio' | 'http';
  command: string;
  args: string;
  envText: string;
  url: string;
  headersText: string;
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

const INPUT_MODALITY_OPTIONS: Array<{ value: InputModality; label: string }> = [
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
];

function formatInputModality(value: InputModality): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

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

type EditorView = 'list' | 'add' | 'edit';
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
                  <AutomationToggle label="Model" mode={automation.models} onChange={(mode) => updateAutomation('models', mode)} />
                ) : null}
                <ModelList
                  models={models}
                  onAdd={startAdd}
                  onEdit={startEdit}
                  onActivate={handleActivate}
                  onDelete={handleDelete}
                />
              </>
            ) : (
              <AddModelForm
                form={form}
                mode={view}
                submitting={submitting}
                onChange={setField}
                onSubmit={handleSubmit}
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
                onSubmit={handleSaveTools}
              />
            ) : activeTab === 'feed' ? (
              <FeedSettingsPanel
                settings={feedSettings}
                form={feedForm}
                saving={savingFeed}
                onChange={(updater) => setFeedForm((current) => updater(current))}
                onSubmit={handleSaveFeed}
              />
            ) : activeTab === 'mcp' ? (
              <>
                {automation ? (
                  <AutomationToggle label="MCP server" mode={automation.mcpServers} onChange={(mode) => updateAutomation('mcpServers', mode)} />
                ) : null}
                <McpSettingsPanel
                  servers={mcpServers}
                  form={mcpForm}
                  editingId={editingMcpId}
                  saving={savingMcp}
                  onChange={(updater) => setMcpForm((current) => updater(current))}
                  onSubmit={handleSaveMcpServer}
                  onEdit={handleEditMcpServer}
                  onCancelEdit={handleCancelMcpEdit}
                  onDelete={handleDeleteMcpServer}
                />
              </>
            ) : (
              <>
                {automation ? (
                  <AutomationToggle label="Skill" mode={automation.skills} onChange={(mode) => updateAutomation('skills', mode)} />
                ) : null}
                <SkillsSettingsPanel
                  results={skillResults}
                  form={skillForm}
                  saving={savingSkills}
                  onChange={(updater) => setSkillForm((current) => updater(current))}
                  onImport={handleImportSkill}
                  onDelete={handleDeleteSkill}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationToggle({
  label,
  mode,
  onChange,
}: {
  label: string;
  mode: SelectionMode;
  onChange: (mode: SelectionMode) => void;
}) {
  return (
    <div className="automation-toggle">
      <div className="automation-toggle-text">
        <span className="automation-toggle-title">{label} selection</span>
        <span className="automation-toggle-desc">
          {mode === 'auto'
            ? 'An agent selects this for each role automatically.'
            : 'You are prompted to select this for each role.'}
        </span>
      </div>
      <div className="automation-toggle-options" role="group" aria-label={`${label} selection mode`}>
        <button
          type="button"
          className={`automation-toggle-option${mode === 'manual' ? ' automation-toggle-option-active' : ''}`}
          aria-pressed={mode === 'manual'}
          onClick={() => onChange('manual')}
        >
          Manual
        </button>
        <button
          type="button"
          className={`automation-toggle-option${mode === 'auto' ? ' automation-toggle-option-active' : ''}`}
          aria-pressed={mode === 'auto'}
          onClick={() => onChange('auto')}
        >
          Automatic
        </button>
      </div>
    </div>
  );
}

interface ModelListProps {
  models: ModelConfig[];
  onAdd: () => void;
  onEdit: (model: ModelConfig) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

function ModelList({ models, onAdd, onEdit, onActivate, onDelete }: ModelListProps) {
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

interface AddModelFormProps {
  form: ModelFormState;
  mode: EditorView;
  submitting: boolean;
  onChange: <K extends keyof ModelFormState>(key: K, value: ModelFormState[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function AddModelForm({ form, mode, submitting, onChange, onSubmit, onCancel }: AddModelFormProps) {
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
  saving: boolean;
  canEnableWebSearch: boolean;
  onChange: (updater: (current: ToolFormState) => ToolFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function ToolsSettingsPanel({
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
            {saving ? 'Saving…' : 'Save Tool Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface FeedSettingsPanelProps {
  settings: FeedSettings | null;
  form: FeedFormState;
  saving: boolean;
  onChange: (updater: (current: FeedFormState) => FeedFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function FeedSettingsPanel({
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
            {saving ? 'Saving…' : 'Save Feed Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface McpSettingsPanelProps {
  servers: McpServerSummary[];
  form: McpFormState;
  editingId: string | null;
  saving: boolean;
  onChange: (updater: (current: McpFormState) => McpFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}

function McpSettingsPanel({
  servers,
  form,
  editingId,
  saving,
  onChange,
  onSubmit,
  onEdit,
  onCancelEdit,
  onDelete,
}: McpSettingsPanelProps) {
  const isEditing = editingId !== null;
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">MCP</h3>
      </div>

      {servers.length === 0 ? (
        <p className="settings-empty">No MCP servers configured.</p>
      ) : (
        <ul className="model-list">
          {servers.map((server) => (
            <li key={server.id} className="model-card">
              <div className="model-card-main">
                <div className="model-card-name">{server.name}</div>
                <div className="model-card-meta">
                  <span>{server.transport}</span>
                  <span className="model-meta-sep">·</span>
                  <span>{server.toolNames.length} tools</span>
                  {server.toolNames.length > 0 ? (
                    <>
                      <span className="model-meta-sep">·</span>
                      <span>{server.toolNames.join(', ')}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="model-card-actions">
                <button
                  type="button"
                  className="model-action-icon-btn"
                  disabled={saving}
                  onClick={() => onEdit(server.id)}
                  aria-label={`Edit ${server.name}`}
                  title={`Edit ${server.name}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 20h4.75L19 9.75 14.25 5 4 15.25V20Z" />
                    <path d="M13.5 5.75 18.25 10.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="model-action-icon-btn model-delete-btn"
                  disabled={saving}
                  onClick={() => {
                    if (window.confirm(`Delete "${server.name}"?`)) onDelete(server.id);
                  }}
                  aria-label={`Delete ${server.name}`}
                  title={`Delete ${server.name}`}
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

      <form className="tool-settings-form skills-import-form" onSubmit={onSubmit} noValidate>
        <section className="tool-settings-card">
          <div className="tool-settings-header">
            <div>
              <h4 className="tool-settings-subtitle">{isEditing ? 'Edit MCP Server' : 'Add MCP Server'}</h4>
              <p className="tool-settings-copy">Saves only after a connection test and tool discovery succeed.</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="sf-mcpName">Name</label>
              <input
                id="sf-mcpName"
                className="form-input"
                type="text"
                value={form.name}
                onChange={(e) => onChange((current) => ({ ...current, name: e.target.value }))}
                placeholder="linear"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="sf-mcpTransport">Transport</label>
              <select
                id="sf-mcpTransport"
                className="form-input form-select"
                value={form.transport}
                onChange={(e) => onChange((current) => ({ ...current, transport: e.target.value as McpFormState['transport'] }))}
              >
                <option value="stdio">stdio</option>
                <option value="http">http</option>
              </select>
            </div>
          </div>

          {form.transport === 'stdio' ? (
            <>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpCommand">Command</label>
                <input
                  id="sf-mcpCommand"
                  className="form-input"
                  type="text"
                  value={form.command}
                  onChange={(e) => onChange((current) => ({ ...current, command: e.target.value }))}
                  placeholder="npx"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpArgs">Args</label>
                <textarea
                  id="sf-mcpArgs"
                  className="form-input form-textarea form-textarea-compact"
                  value={form.args}
                  onChange={(e) => onChange((current) => ({ ...current, args: e.target.value }))}
                  rows={3}
                  placeholder={'-y\n@modelcontextprotocol/server-example'}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpEnv">Env vars</label>
                <textarea
                  id="sf-mcpEnv"
                  className="form-input form-textarea form-textarea-compact"
                  value={form.envText}
                  onChange={(e) => onChange((current) => ({ ...current, envText: e.target.value }))}
                  rows={3}
                  placeholder="TOKEN=..."
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpUrl">URL</label>
                <input
                  id="sf-mcpUrl"
                  className="form-input"
                  type="url"
                  value={form.url}
                  onChange={(e) => onChange((current) => ({ ...current, url: e.target.value }))}
                  placeholder="https://example.com/mcp"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpHeaders">Headers</label>
                <textarea
                  id="sf-mcpHeaders"
                  className="form-input form-textarea form-textarea-compact"
                  value={form.headersText}
                  onChange={(e) => onChange((current) => ({ ...current, headersText: e.target.value }))}
                  rows={3}
                  placeholder="Authorization=Bearer ..."
                />
              </div>
            </>
          )}

          <div className="form-actions">
            {isEditing ? (
              <button type="button" className="form-btn-cancel" disabled={saving} onClick={onCancelEdit}>
                Cancel
              </button>
            ) : null}
            <button type="submit" className="form-btn-submit" disabled={saving}>
              {saving ? 'Validating…' : isEditing ? 'Save MCP Server' : 'Add MCP Server'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}

interface SkillsSettingsPanelProps {
  results: SkillLoadResult[];
  form: SkillFormState;
  saving: boolean;
  onChange: (updater: (current: SkillFormState) => SkillFormState) => void;
  onImport: (e: React.FormEvent) => void;
  onDelete: (name: string) => void;
}

function SkillsSettingsPanel({
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
              {saving ? 'Importing…' : 'Import Skill'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
