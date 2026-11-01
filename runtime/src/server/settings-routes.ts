import express, { type Express, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { normalizePromptCacheTtl } from '../common/types.js';
import { getWorkspaceRoot } from '../common/workspace.js';
import {
  isKebabCaseSkillName,
  listSkillLoadResults,
  parseSkillMarkdownFrontmatter,
  readSkillSummary,
} from '../framework-services/skills.js';
import { getCustomOpenAICompatibleReservedBodyKeys, isReasoningCompatibleWithProvider, normalizeModelReasoningConfig } from '../../shared/model-reasoning.js';
import { validateModelConfiguration } from '../providers/model-validation.js';
import { formatMcpError } from '../providers/mcp/errors.js';
import { validateMcpServerConfiguration } from '../providers/mcp/validate.js';
import * as SettingsStore from '../settings/settings-store.js';
import { currentTurnBackend, getTurnBackendReadiness } from '../settings/turn-backend.js';
import { getHostAgent, listHostAgents } from '../providers/host-agents/registry.js';
import { clearProbeCache, getCachedProbe } from '../providers/host-agents/version.js';
import { isHostAgentId } from '../../shared/settings.js';
import type { AgentModeResponse, AgentModeSettings, HostAgentSummary, HostProbeSummary } from '../../shared/settings.js';

function isValidProviderBaseUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isProviderType(value: unknown): value is 'anthropic' | 'openai-compatible' {
  return value === 'anthropic' || value === 'openai-compatible';
}

function validateReasoningForSettings(
  providerType: 'anthropic' | 'openai-compatible',
  reasoning: ReturnType<typeof normalizeModelReasoningConfig>
): string | null {
  if (!isReasoningCompatibleWithProvider(providerType, reasoning)) {
    return `Reasoning mode "${reasoning.mode}" is not valid for provider "${providerType}".`;
  }
  if (reasoning.mode === 'anthropic-manual' && reasoning.budgetTokens <= 0) {
    return 'Anthropic manual thinking requires a positive thinking token budget.';
  }
  if (reasoning.mode === 'custom-openai-compatible') {
    const reservedKeys = getCustomOpenAICompatibleReservedBodyKeys(reasoning.request.extraBody);
    if (reservedKeys.length > 0) {
      return `Custom reasoning extra body cannot include reserved request keys: ${reservedKeys.join(', ')}.`;
    }
  }
  return null;
}

type ModelWriteParams = Omit<SettingsStore.ModelConfig, 'id' | 'active'>;

type ParsedModelParams =
  | { ok: true; params: ModelWriteParams }
  | { ok: false; message: string };

function normalizeSupportedInputTypes(value: unknown): Array<'image' | 'audio' | 'video'> {
  return Array.isArray(value)
    ? value.filter((entry): entry is 'image' | 'audio' | 'video' =>
        entry === 'image' || entry === 'audio' || entry === 'video')
    : [];
}

function parseModelParams(params: any): ParsedModelParams {
  if (!params.displayName || !params.providerType || !params.modelId) {
    return { ok: false, message: 'displayName, providerType, and modelId are required.' };
  }
  if (!isProviderType(params.providerType)) {
    return { ok: false, message: 'providerType must be "anthropic" or "openai-compatible".' };
  }
  if (params.providerType === 'openai-compatible' && !isValidProviderBaseUrl(params.providerBaseUrl)) {
    return { ok: false, message: 'providerBaseUrl must be a valid http:// or https:// URL.' };
  }

  const providerType = params.providerType;
  const reasoning = normalizeModelReasoningConfig(params.reasoning);
  const reasoningError = validateReasoningForSettings(providerType, reasoning);
  if (reasoningError) return { ok: false, message: reasoningError };

  return {
    ok: true,
    params: {
      displayName: String(params.displayName),
      providerType,
      providerBaseUrl: String(params.providerBaseUrl ?? ''),
      modelId: String(params.modelId),
      contextWindow: Number(params.contextWindow) || 0,
      maxOutputTokens: Number(params.maxOutputTokens) || 0,
      reasoning,
      cacheTtl: normalizePromptCacheTtl(params.cacheTtl),
      supportedInputTypes: normalizeSupportedInputTypes(params.supportedInputTypes),
    },
  };
}

async function validateModelRouteConfiguration(
  modelParams: ModelWriteParams,
  apiKey: string
): Promise<string | null> {
  try {
    await validateModelConfiguration({
      providerType: modelParams.providerType,
      providerBaseUrl: modelParams.providerBaseUrl,
      modelId: modelParams.modelId,
      apiKey,
      maxOutputTokens: modelParams.maxOutputTokens,
      reasoning: modelParams.reasoning,
    });
    return null;
  } catch (err: any) {
    return err instanceof Error ? err.message : String(err);
  }
}

function skillsRoot(): string {
  return path.join(getWorkspaceRoot(), '.a-society', 'skills');
}

function skillDir(name: string): string {
  return path.join(skillsRoot(), name);
}

function copySkillDirectory(sourceDir: string, targetDir: string): void {
  const copyDir = (source: string, target: string): void => {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      if (entry.isDirectory()) {
        copyDir(sourcePath, targetPath);
      } else if (entry.isFile()) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  };

  copyDir(sourceDir, targetDir);
}

function mergeExistingSecretValues(
  next: Record<string, string>,
  existing: Record<string, string> | undefined
): Record<string, string> {
  if (!existing) return next;
  const merged: Record<string, string> = {};
  for (const [key, value] of Object.entries(next)) {
    merged[key] = value.trim() === '' && existing[key] !== undefined ? existing[key] : value;
  }
  return merged;
}

function parseMcpServerParams(
  body: any,
  existing?: SettingsStore.ResolvedMcpServer
): SettingsStore.McpServerWriteParams {
  const rawEnv = body?.env === undefined
    ? existing?.env ?? {}
    : mergeExistingSecretValues(SettingsStore.normalizeMcpSecretValues(body.env), existing?.env);
  const rawHeaders = body?.headers === undefined
    ? existing?.headers ?? {}
    : mergeExistingSecretValues(SettingsStore.normalizeMcpSecretValues(body.headers), existing?.headers);

  return {
    name: String(body?.name ?? existing?.name ?? '').trim(),
    transport: (body?.transport ?? existing?.transport ?? 'stdio') as SettingsStore.McpTransport,
    command: String(body?.command ?? existing?.command ?? '').trim(),
    args: Array.isArray(body?.args) ? SettingsStore.normalizeMcpStringArray(body.args, { unique: false }) : existing?.args ?? [],
    env: rawEnv,
    url: String(body?.url ?? existing?.url ?? '').trim(),
    headers: rawHeaders,
  };
}

function agentModeResponse(): AgentModeResponse {
  const hosts: HostAgentSummary[] = listHostAgents().map((adapter) => ({
    id: adapter.id,
    displayName: adapter.displayName,
    supportedVersions: { ...adapter.supportedVersions },
    models: adapter.models.map((option) => ({ ...option })),
    effortLevels: [...adapter.effortLevels],
  }));
  return { settings: SettingsStore.getAgentModeSettings(), hosts };
}

type ParsedAgentModeParams =
  | { ok: true; params: Partial<AgentModeSettings> }
  | { ok: false; message: string };

/** Validates a partial agent-mode update against the saved settings it would merge into. */
function parseAgentModeParams(body: Record<string, unknown>): ParsedAgentModeParams {
  const params: Partial<AgentModeSettings> = {};
  if ('mode' in body) {
    if (body.mode !== 'api' && body.mode !== 'host') return { ok: false, message: 'Agent mode must be "api" or "host".' };
    params.mode = body.mode;
  }
  if ('hostAgentId' in body) {
    if (body.hostAgentId !== null && !isHostAgentId(body.hostAgentId)) {
      return { ok: false, message: `Unsupported host agent: ${String(body.hostAgentId)}.` };
    }
    params.hostAgentId = body.hostAgentId;
  }
  if ('executablePath' in body) {
    const value = body.executablePath;
    if (value !== null && typeof value !== 'string') return { ok: false, message: 'Executable path must be a string or null.' };
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (trimmed !== '' && !path.isAbsolute(trimmed)) return { ok: false, message: 'Executable path must be absolute.' };
    params.executablePath = trimmed === '' ? null : trimmed;
  }
  const merged = { ...SettingsStore.getAgentModeSettings(), ...params };
  if (merged.mode === 'host' && !merged.hostAgentId) {
    return { ok: false, message: 'Choose a host agent before turning agent mode on.' };
  }
  return { ok: true, params };
}

export function registerSettingsRoutes(app: Express): void {
  app.use(express.json());

  app.get('/api/settings/models', (_req: Request, res: Response) => {
    res.json(SettingsStore.listModels());
  });

  app.get('/api/settings/status', async (_req: Request, res: Response) => {
    const turnBackend = currentTurnBackend();
    const readiness = await getTurnBackendReadiness(turnBackend);
    res.json({
      hasConfiguredModel: SettingsStore.hasUsableConfiguredModel(),
      modelCount: SettingsStore.listModels().length,
      turnBackend: turnBackend.kind,
      turnBackendReady: readiness.ready,
    });
  });

  app.get('/api/settings/agent-mode', (_req: Request, res: Response) => {
    res.json(agentModeResponse());
  });

  app.put('/api/settings/agent-mode', (req: Request, res: Response) => {
    const parsed = parseAgentModeParams((req.body ?? {}) as Record<string, unknown>);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    SettingsStore.updateAgentModeSettings(parsed.params);
    res.json(agentModeResponse());
  });

  /**
   * Probes a host agent: the saved one, or a candidate from the body so the operator can
   * check before saving. A missing or broken host is a probe result (200), never a 500.
   */
  app.post('/api/settings/agent-mode/probe', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const saved = SettingsStore.getAgentModeSettings();
    const hostAgentId = body.hostAgentId ?? saved.hostAgentId;
    if (!isHostAgentId(hostAgentId)) {
      res.status(400).json({ message: 'Choose a supported host agent to check.' });
      return;
    }
    const rawPath = 'executablePath' in body ? body.executablePath : saved.executablePath;
    const executablePath = typeof rawPath === 'string' && rawPath.trim() !== '' ? rawPath.trim() : null;

    const adapter = getHostAgent(hostAgentId);
    // An explicit check always re-probes, so a fresh sign-in or update shows at once.
    clearProbeCache();
    let probe;
    try {
      probe = await getCachedProbe(adapter, executablePath);
    } catch {
      probe = null;
    }
    const summary: HostProbeSummary = {
      hostAgentId,
      displayName: adapter.displayName,
      installed: probe?.installed ?? false,
      executablePath: probe?.executablePath ?? executablePath,
      version: probe?.version ?? null,
      supportedVersions: { ...adapter.supportedVersions },
      versionSupported: probe?.versionSupported ?? false,
      loggedIn: probe?.loggedIn ?? null,
      authMethod: probe?.authMethod ?? null,
      subscriptionType: probe?.subscriptionType ?? null,
      checkedAt: new Date().toISOString(),
    };
    res.json(summary);
  });

  app.get('/api/settings/active-model/context-window', (_req: Request, res: Response) => {
    const model = SettingsStore.getActiveModelWithKey();
    res.json({ contextWindow: model?.contextWindow ?? null });
  });

  app.get('/api/settings/tools', (_req: Request, res: Response) => {
    res.json(SettingsStore.getToolSettings());
  });

  app.get('/api/settings/feed', (_req: Request, res: Response) => {
    res.json(SettingsStore.getFeedSettings());
  });

  app.get('/api/settings/automation', (_req: Request, res: Response) => {
    res.json(SettingsStore.getAutomationSettings());
  });

  app.get('/api/settings/skills', (_req: Request, res: Response) => {
    res.json(listSkillLoadResults());
  });

  app.post('/api/settings/skills/import', (req: Request, res: Response) => {
    const sourcePath = typeof req.body?.path === 'string' ? path.resolve(req.body.path.trim()) : '';
    if (!sourcePath) {
      res.status(400).json({ message: 'Import path is required.' });
      return;
    }
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isDirectory()) {
      res.status(400).json({ message: 'Import path must be an existing directory.' });
      return;
    }

    const sourceSkillMd = path.join(sourcePath, 'SKILL.md');
    if (!fs.existsSync(sourceSkillMd)) {
      res.status(400).json({ message: 'Import folder must contain SKILL.md.' });
      return;
    }
    const frontmatter = parseSkillMarkdownFrontmatter(fs.readFileSync(sourceSkillMd, 'utf8'));
    if (frontmatter.kind === 'malformed') {
      res.status(400).json({ message: frontmatter.reason });
      return;
    }
    if (fs.existsSync(skillDir(frontmatter.name))) {
      res.status(400).json({ message: `Skill "${frontmatter.name}" already exists.` });
      return;
    }

    const targetDir = skillDir(frontmatter.name);
    copySkillDirectory(sourcePath, targetDir);
    res.status(201).json({
      skill: readSkillSummary(frontmatter.name),
      notice: 'This skill may bundle scripts the agent can run; they execute only through the normal command-permission prompts.',
    });
  });

  app.delete('/api/settings/skills/:name', (req: Request, res: Response) => {
    const name = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name;
    if (!isKebabCaseSkillName(name) || !fs.existsSync(skillDir(name))) {
      res.status(404).json({ message: `Skill "${name}" not found.` });
      return;
    }
    fs.rmSync(skillDir(name), { recursive: true, force: true });
    res.json({ ok: true });
  });

  app.get('/api/settings/mcp', (_req: Request, res: Response) => {
    res.json(SettingsStore.listMcpServerSummaries());
  });

  app.get('/api/settings/mcp/:id', (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const server = SettingsStore.listMcpServers().find((entry) => entry.id === id) ?? null;
    if (!server) {
      res.status(404).json({ message: `MCP server "${id}" not found.` });
      return;
    }
    res.json(server);
  });

  app.post('/api/settings/mcp', async (req: Request, res: Response) => {
    const params = parseMcpServerParams(req.body);
    const basicError = SettingsStore.getMcpServerWriteParamError(params, SettingsStore.listMcpServers());
    if (basicError) {
      res.status(400).json({ message: basicError });
      return;
    }

    try {
      const validation = await validateMcpServerConfiguration(params);
      const server = SettingsStore.createMcpServer({ ...params, toolNames: validation.toolNames });
      res.status(201).json(server);
    } catch (err: any) {
      res.status(400).json({ message: formatMcpError(err) });
    }
  });

  app.put('/api/settings/mcp/:id', async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = SettingsStore.getMcpServerWithSecrets(id);
    if (!existing) {
      res.status(404).json({ message: `MCP server "${id}" not found.` });
      return;
    }

    const params = parseMcpServerParams(req.body, existing);
    const basicError = SettingsStore.getMcpServerWriteParamError(params, SettingsStore.listMcpServers(), id);
    if (basicError) {
      res.status(400).json({ message: basicError });
      return;
    }

    try {
      const validation = await validateMcpServerConfiguration(params);
      res.json(SettingsStore.updateMcpServer(id, { ...params, toolNames: validation.toolNames }));
    } catch (err: any) {
      res.status(400).json({ message: formatMcpError(err) });
    }
  });

  app.delete('/api/settings/mcp/:id', (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    SettingsStore.deleteMcpServer(id);
    res.json({ ok: true });
  });

  app.post('/api/settings/models', async (req: Request, res: Response) => {
    const { apiKey, ...params } = req.body as any;
    const parsed = parseModelParams(params);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const apiKeyValue = String(apiKey ?? '').trim();
    if (apiKeyValue.trim() === '') {
      res.status(400).json({ message: 'API key is required.' });
      return;
    }
    const validationError = await validateModelRouteConfiguration(parsed.params, apiKeyValue);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const model = SettingsStore.createModel(parsed.params, apiKeyValue);
    res.status(201).json(model);
  });

  app.put('/api/settings/models/:id', async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { apiKey, ...params } = req.body as any;
    const parsed = parseModelParams(params);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const existing = SettingsStore.getModelWithKey(id);
    if (!existing) {
      res.status(404).json({ message: `Model "${id}" not found.` });
      return;
    }
    const apiKeyValue = typeof apiKey === 'string' && apiKey.trim() !== ''
      ? apiKey.trim()
      : existing.apiKey;
    if (apiKeyValue.trim() === '') {
      res.status(400).json({ message: 'API key is required.' });
      return;
    }
    const validationError = await validateModelRouteConfiguration(parsed.params, apiKeyValue);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    try {
      const model = SettingsStore.updateModel(id, parsed.params, typeof apiKey === 'string' ? apiKey : undefined);
      res.json(model);
    } catch (err: any) {
      res.status(404).json({ message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/settings/models/:id/activate', (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      SettingsStore.activateModel(id);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(404).json({ message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete('/api/settings/models/:id', (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    SettingsStore.deleteModel(id);
    res.json({ ok: true });
  });

  app.put('/api/settings/tools/web-search', (req: Request, res: Response) => {
    const enabled = req.body?.enabled === true;
    const apiKey = typeof req.body?.apiKey === 'string' ? req.body.apiKey : undefined;

    try {
      res.json(SettingsStore.updateWebSearchToolSettings({ enabled, apiKey }));
    } catch (err: any) {
      res.status(400).json({ message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.put('/api/settings/feed', (req: Request, res: Response) => {
    try {
      res.json(SettingsStore.updateFeedSettings({
        historyLimit: Number(req.body?.historyLimit),
      }));
    } catch (err: any) {
      res.status(400).json({ message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.put('/api/settings/automation', (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const params: Partial<SettingsStore.AutomationSettings> = {};
    for (const dimension of ['models', 'skills', 'mcpServers'] as const) {
      if (body[dimension] === 'auto' || body[dimension] === 'manual') {
        params[dimension] = body[dimension];
      }
    }
    res.json(SettingsStore.updateAutomationSettings(params));
  });
}
