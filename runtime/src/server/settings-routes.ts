import express, { type Express, type Request, type Response } from 'express';
import { getCustomOpenAICompatibleReservedBodyKeys, isReasoningCompatibleWithProvider, normalizeModelReasoningConfig } from '../common/model-reasoning.js';
import * as SettingsStore from '../settings/settings-store.js';

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

export function registerSettingsRoutes(app: Express): void {
  app.use(express.json());

  app.get('/api/settings/models', (_req: Request, res: Response) => {
    res.json(SettingsStore.listModels());
  });

  app.get('/api/settings/status', (_req: Request, res: Response) => {
    res.json({
      hasConfiguredModel: SettingsStore.hasUsableConfiguredModel(),
      modelCount: SettingsStore.listModels().length
    });
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

  app.post('/api/settings/models', (req: Request, res: Response) => {
    const { apiKey, ...params } = req.body as any;
    if (!params.displayName || !params.providerType || !params.modelId) {
      res.status(400).json({ message: 'displayName, providerType, and modelId are required.' });
      return;
    }
    if (!isProviderType(params.providerType)) {
      res.status(400).json({ message: 'providerType must be "anthropic" or "openai-compatible".' });
      return;
    }
    if (params.providerType === 'openai-compatible') {
      if (!isValidProviderBaseUrl(params.providerBaseUrl)) {
        res.status(400).json({ message: 'providerBaseUrl must be a valid http:// or https:// URL.' });
        return;
      }
    }
    const providerType = params.providerType;
    const reasoning = normalizeModelReasoningConfig(params.reasoning);
    const reasoningError = validateReasoningForSettings(providerType, reasoning);
    if (reasoningError) {
      res.status(400).json({ message: reasoningError });
      return;
    }
    const model = SettingsStore.createModel({
      displayName: String(params.displayName),
      providerType,
      providerBaseUrl: String(params.providerBaseUrl ?? ''),
      modelId: String(params.modelId),
      contextWindow: Number(params.contextWindow) || 0,
      maxOutputTokens: Number(params.maxOutputTokens) || 0,
      reasoning,
      supportedInputTypes: Array.isArray(params.supportedInputTypes)
        ? params.supportedInputTypes
            .filter((value: unknown): value is 'image' | 'audio' | 'video' =>
              value === 'image' || value === 'audio' || value === 'video')
        : [],
    }, String(apiKey ?? ''));
    res.status(201).json(model);
  });

  app.put('/api/settings/models/:id', (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { apiKey, ...params } = req.body as any;
    if (!params.displayName || !params.providerType || !params.modelId) {
      res.status(400).json({ message: 'displayName, providerType, and modelId are required.' });
      return;
    }
    if (!isProviderType(params.providerType)) {
      res.status(400).json({ message: 'providerType must be "anthropic" or "openai-compatible".' });
      return;
    }
    if (params.providerType === 'openai-compatible') {
      if (!isValidProviderBaseUrl(params.providerBaseUrl)) {
        res.status(400).json({ message: 'providerBaseUrl must be a valid http:// or https:// URL.' });
        return;
      }
    }
    const providerType = params.providerType;
    const reasoning = normalizeModelReasoningConfig(params.reasoning);
    const reasoningError = validateReasoningForSettings(providerType, reasoning);
    if (reasoningError) {
      res.status(400).json({ message: reasoningError });
      return;
    }

    try {
      const model = SettingsStore.updateModel(id, {
        displayName: String(params.displayName),
        providerType,
        providerBaseUrl: String(params.providerBaseUrl ?? ''),
        modelId: String(params.modelId),
        contextWindow: Number(params.contextWindow) || 0,
        maxOutputTokens: Number(params.maxOutputTokens) || 0,
        reasoning,
        supportedInputTypes: Array.isArray(params.supportedInputTypes)
          ? params.supportedInputTypes
              .filter((value: unknown): value is 'image' | 'audio' | 'video' =>
                value === 'image' || value === 'audio' || value === 'video')
          : [],
      }, typeof apiKey === 'string' ? apiKey : undefined);
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
}
