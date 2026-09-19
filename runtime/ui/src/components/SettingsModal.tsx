import { X } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  DISABLED_REASONING,
} from '../../../shared/model-reasoning.js';
import { useConfirm } from '../hooks/useConfirm';
import { Modal } from './Modal';
import {
  activateModel as activateModelApi,
  deleteMcpServer as deleteMcpServerApi,
  deleteModel as deleteModelApi,
  deleteSkill as deleteSkillApi,
  fetchAutomationSettings,
  fetchFeedSettings as fetchFeedSettingsApi,
  fetchMcpServer as fetchMcpServerApi,
  fetchMcpServers as fetchMcpServersApi,
  fetchModels as fetchModelsApi,
  fetchSkills as fetchSkillsApi,
  fetchToolSettings as fetchToolSettingsApi,
  importSkill as importSkillApi,
  saveFeedSettings as saveFeedSettingsApi,
  saveMcpServer as saveMcpServerApi,
  saveModel as saveModelApi,
  saveWebSearchSettings,
  updateAutomationSettings,
} from '../app/runtime-api';
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
import type { ModelReasoningConfig } from '../../../shared/model-reasoning.js';
import type {
  AutomationSettings,
  FeedSettings,
  SelectionMode,
  McpServerSummary,
  ModelConfig,
  ToolSettings,
} from '../../../shared/settings.js';
import type { SkillLoadResult } from '../../../shared/skills.js';

interface SettingsModalProps {
  onClose: () => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
  onModelsChange?: () => void;
  onSkillsChange?: () => void | Promise<void>;
  onMcpServersChange?: () => void | Promise<void>;
  required?: boolean;
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

type SettingsTab = 'models' | 'tools' | 'feed' | 'mcp' | 'skills';

export function SettingsModal({ onClose, onError, onSuccess, onModelsChange, onSkillsChange, onMcpServersChange, required = false }: SettingsModalProps) {
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
  const { confirm, confirmElement } = useConfirm();

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
    void onSkillsChange?.();
  }, [onSkillsChange]);

  const replaceMcpServers = useCallback((next: McpServerSummary[]): void => {
    setMcpServers(next);
    void onMcpServersChange?.();
  }, [onMcpServersChange]);

  useEffect(() => {
    async function loadModels() {
      try {
        setModels(await fetchModelsApi());
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load models.');
      }
    }

    async function loadTools() {
      try {
        replaceToolSettings(await fetchToolSettingsApi());
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load tool settings.');
      }
    }

    async function loadFeedSettings() {
      try {
        replaceFeedSettings(await fetchFeedSettingsApi());
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load feed settings.');
      }
    }

    async function loadSkills() {
      try {
        setSkillResults(await fetchSkillsApi());
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load skills.');
      }
    }

    async function loadMcpServers() {
      try {
        setMcpServers(await fetchMcpServersApi());
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load MCP servers.');
      }
    }

    async function loadAutomation() {
      try {
        setAutomation(await fetchAutomationSettings());
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to load automation settings.');
      }
    }

    void loadModels();
    void loadTools();
    void loadFeedSettings();
    void loadSkills();
    void loadMcpServers();
    void loadAutomation();
  }, [reportError]);

  async function updateAutomation(dimension: keyof AutomationSettings, mode: SelectionMode): Promise<void> {
    try {
      setAutomation(await updateAutomationSettings({ [dimension]: mode }));
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to update automation settings.');
    }
  }

  async function handleActivate(id: string) {
    try {
      await activateModelApi(id);
      replaceModels(models.map((m) => ({ ...m, active: m.id === id })));
      onSuccess?.('Active model updated.');
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to activate model.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteModelApi(id);
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
      const saved = await saveModelApi(payload, isEditing ? editingModelId : null);
      replaceModels(isEditing
        ? models.map((model) => model.id === saved.id ? saved : model)
        : models.concat(saved));
      onSuccess?.(isEditing ? 'Model updated.' : 'Model added.');
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
      replaceToolSettings(await saveWebSearchSettings({
        enabled: toolForm.webSearchEnabled,
        apiKey: toolForm.tavilyApiKey.trim(),
      }));
      onSuccess?.('Tool settings saved.');
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
      replaceFeedSettings(await saveFeedSettingsApi(
        feedForm.historyLimit ? parseInt(feedForm.historyLimit, 10) : 0,
      ));
      onSuccess?.('Feed settings saved.');
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to save feed settings.');
    } finally {
      setSavingFeed(false);
    }
  }

  async function refreshSkills(): Promise<void> {
    replaceSkillResults(await fetchSkillsApi());
  }

  async function handleImportSkill(e: React.FormEvent) {
    e.preventDefault();
    const importPath = skillForm.importPath.trim();
    if (!importPath) { reportError('Import path is required.'); return; }

    try {
      setSavingSkills(true);
      const notice = await importSkillApi(importPath);
      if (notice) reportError(notice);
      setSkillForm((current) => ({ ...current, importPath: '' }));
      await refreshSkills();
      onSuccess?.('Skill imported.');
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to import skill.');
    } finally {
      setSavingSkills(false);
    }
  }

  async function handleDeleteSkill(name: string) {
    try {
      setSavingSkills(true);
      await deleteSkillApi(name);
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
    replaceMcpServers(await fetchMcpServersApi());
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
      const saved = await saveMcpServerApi(payload, editingMcpId);
      if (saved) {
        replaceMcpServers(isEditing
          ? mcpServers.map((server) => server.id === saved.id ? saved : server)
          : mcpServers.concat(saved));
      } else {
        await refreshMcpServers();
      }
      setMcpForm(DEFAULT_MCP_FORM);
      setEditingMcpId(null);
      onSuccess?.(isEditing ? 'MCP server updated.' : 'MCP server added.');
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to save MCP server.');
    } finally {
      setSavingMcp(false);
    }
  }

  async function handleEditMcpServer(id: string): Promise<void> {
    try {
      setSavingMcp(true);
      const server = await fetchMcpServerApi(id);
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
      await deleteMcpServerApi(id);
      await refreshMcpServers();
      if (editingMcpId === id) handleCancelMcpEdit();
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Failed to delete MCP server.');
    } finally {
      setSavingMcp(false);
    }
  }

  const canEnableWebSearch = (toolSettings?.webSearch.hasApiKey ?? false) || toolForm.tavilyApiKey.trim() !== '';

  function confirmDeleteModel(id: string): void {
    const model = models.find((entry) => entry.id === id);
    void (async () => {
      const confirmed = await confirm({
        title: `Delete "${model?.displayName ?? id}"?`,
        body: 'The model configuration and its stored API key are removed from the runtime.',
        confirmLabel: 'Delete model',
      });
      if (confirmed) await handleDelete(id);
    })();
  }

  function confirmDeleteSkill(name: string): void {
    void (async () => {
      const confirmed = await confirm({
        title: `Delete "${name}"?`,
        body: 'The imported skill folder is removed from the runtime.',
        confirmLabel: 'Delete skill',
      });
      if (confirmed) await handleDeleteSkill(name);
    })();
  }

  function confirmDeleteMcpServer(id: string): void {
    const server = mcpServers.find((entry) => entry.id === id);
    void (async () => {
      const confirmed = await confirm({
        title: `Delete "${server?.name ?? id}"?`,
        body: 'The MCP server configuration is removed from the runtime.',
        confirmLabel: 'Delete server',
      });
      if (confirmed) await handleDeleteMcpServer(id);
    })();
  }

  return (
    <Modal className="settings-modal" ariaLabel="Settings" required={required} onClose={onClose}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Settings</h2>
          {!required ? (
            <button type="button" className="settings-close-btn" onClick={onClose} aria-label="Close settings">
              <X aria-hidden="true" />
            </button>
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
                  onDelete={confirmDeleteModel}
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
                  onDelete={confirmDeleteMcpServer}
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
                  onDelete={confirmDeleteSkill}
                />
              </>
            )}
          </div>
        </div>
        {confirmElement}
    </Modal>
  );
}
