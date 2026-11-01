import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SpanStatusCode } from '@opentelemetry/api';
import { CONSENT_CHECK_RESULT, LLMGatewayError } from './types.js';
import { CONSENT_MODE } from '../../shared/protocol-constants.js';
import type {
  ConsentCheckRequest,
  ConsentGate,
  FlowRef,
  GatewayTurnResult,
  HostConversationState,
  OperatorRenderSink,
  RoleSession,
  RuntimeMessageParam,
} from './types.js';
import type { HostAgentId } from '../../shared/settings.js';
import { INTERRUPTED_TURN_CONTINUATION_MESSAGE, upsertAssistantDelta } from './history.js';
import { getHostAgent, assertHostReady } from '../providers/host-agents/registry.js';
import type {
  HostLiveEvent,
  HostPermissionDenial,
  HostPermissionProfile,
  HostTurnResult,
} from '../providers/host-agents/types.js';
import { getAgentModeSettings } from '../settings/settings-store.js';
import { getRoleStateFilePath } from '../orchestration/state-paths.js';
import { formatHostModelLabel } from '../orchestration/host-role-model.js';
import { validateWorkflowFileContent, workflowFilePaths } from '../tools/workflow-write-validation.js';
import { TelemetryManager } from '../observability/observability.js';
import { logger } from '../observability/logger.js';

export const HOST_SYSTEM_PROMPT_FILE = 'host-system-prompt.md';
export const RECOVERY_TRANSCRIPT_LIMIT_BYTES = 60 * 1024;
/** Upper bound on retries inside one turn (permission grants and workflow repairs). */
export const MAX_HOST_TURN_RETRIES = 8;

export const HOST_RECOVERY_PREAMBLE =
  'The host conversation for this role is no longer available, so this is a new conversation. ' +
  "Below is the runtime's record of the earlier exchange (messages sent to you and your final replies; " +
  'tool activity is not included). Continue from it.';

const FILE_WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

export interface HostTurnContext {
  agentId: HostAgentId;
  /** The role session whose `hostSession` this turn reads and updates. */
  session: RoleSession;
  saveSession: () => void | Promise<void>;
  flowRef: FlowRef;
  workspaceRoot: string;
  /** The host's working directory: the project folder. */
  projectRoot: string;
  recordFolderPath: string;
  /** Extra writable folders for this session only (the feedback folder). */
  extraWritableDirs?: string[];
  /** Scope reported on repair events: forward-pass node or backward-pass improvement. */
  repairScope?: 'node' | 'improvement';
  /** Host model alias for this role; null = host default model. */
  model: string | null;
  /** Host effort level for this role; null = host default effort. */
  effort: string | null;
}

export interface HostTurnExecutorInput {
  context: HostTurnContext;
  roleInstanceId: string;
  systemPrompt: string;
  history: RuntimeMessageParam[];
  signal: AbortSignal | undefined;
  operatorRenderer: OperatorRenderSink | undefined;
  consentGate: ConsentGate | undefined;
  nodeId: string | undefined;
  outputStream: NodeJS.WritableStream | undefined;
  onConversationMessages: ((messages: RuntimeMessageParam[]) => void | Promise<void>) | undefined;
  onAssistantTextDelta: ((text: string) => void) | undefined;
}

type DeliveryState = Pick<HostConversationState, 'deliveredCount' | 'deliveredTailLength'>;

function contentLength(message: RuntimeMessageParam | undefined): number {
  return message && (message.role === 'user' || message.role === 'assistant') ? message.content.length : 0;
}

function deliveryMark(history: RuntimeMessageParam[]): DeliveryState {
  return { deliveredCount: history.length, deliveredTailLength: contentLength(history[history.length - 1]) };
}

/**
 * The user text the host has not received yet: text merged into the last delivered
 * entry after delivery, then every later user message. Assistant entries are the
 * host's own replies and are never sent back.
 */
export function pendingHostMessage(history: RuntimeMessageParam[], delivered: DeliveryState | undefined): string {
  const start = delivered?.deliveredCount ?? 0;
  const parts: string[] = [];
  const tail = history[start - 1];
  if (tail?.role === 'user' && delivered && tail.content.length > delivered.deliveredTailLength) {
    parts.push(tail.content.slice(delivered.deliveredTailLength).replace(/^\n+/, ''));
  }
  for (const message of history.slice(start)) {
    if (message.role === 'user') parts.push(message.content);
  }
  return parts.filter((part) => part.trim() !== '').join('\n\n');
}

/** The runtime transcript up to the delivered mark, oldest dropped first to fit the limit. */
export function renderRecoveryTranscript(
  history: RuntimeMessageParam[],
  delivered: DeliveryState,
  limitBytes = RECOVERY_TRANSCRIPT_LIMIT_BYTES
): string {
  const blocks: string[] = [];
  history.slice(0, delivered.deliveredCount).forEach((message, index) => {
    if (message.role !== 'user' && message.role !== 'assistant') return;
    const isTail = index === delivered.deliveredCount - 1;
    const content = isTail && message.role === 'user' ? message.content.slice(0, delivered.deliveredTailLength) : message.content;
    blocks.push(`--- ${message.role} ---\n${content}`);
  });
  const kept: string[] = [];
  let size = 0;
  for (const block of blocks.reverse()) {
    const blockSize = Buffer.byteLength(block, 'utf8') + 2;
    if (size + blockSize > limitBytes) break;
    kept.unshift(block);
    size += blockSize;
  }
  return kept.join('\n\n');
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function hashFile(filePath: string): string | null {
  try {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
  } catch {
    return null;
  }
}

interface OneTimeGrants {
  writePaths: string[];
  commands: string[];
  mcpTools: string[];
}

/** Maps the flow's consent state, plus grants made during this turn, to host flags. */
export function buildHostPermissionProfile(
  consentGate: ConsentGate | undefined,
  grants: OneTimeGrants,
  workspaceRoot: string
): HostPermissionProfile {
  const readOnlyRoots = [workspaceRoot];
  // Without a consent gate the API path runs tools unchecked; mirror that.
  if (!consentGate) {
    return { mode: 'edits-and-commands', allowedWritePaths: [], allowedCommands: [], allowedMcpTools: [], readOnlyRoots };
  }
  const state = consentGate.getState();
  const mode: HostPermissionProfile['mode'] =
    state.mode === CONSENT_MODE.FULL_ACCESS ? 'edits-and-commands'
      : state.mode === CONSENT_MODE.PARTIAL_ACCESS ? 'edits'
        : 'read-only';
  const unique = (values: string[]): string[] => [...new Set(values)];
  return {
    mode,
    allowedWritePaths: unique(grants.writePaths),
    allowedCommands: unique([...Object.keys(state.bash.allowedCommands), ...grants.commands]),
    allowedMcpTools: unique([...Object.keys(state.mcp.allowedTools), ...grants.mcpTools]),
    readOnlyRoots,
  };
}

interface DenialRequest {
  key: string;
  check: Omit<ConsentCheckRequest, 'nodeId' | 'role'>;
  label: string;
  grant: (grants: OneTimeGrants) => void;
}

/**
 * Turns a host denial into the runtime consent request it corresponds to. Writes outside
 * the runtime's write roots and tools without a runtime equivalent stay denied (null).
 */
export function mapHostDenial(denial: HostPermissionDenial, workspaceRoot: string, writeRoots: string[]): DenialRequest | null {
  const { toolName, input } = denial;
  if (FILE_WRITE_TOOLS.has(toolName)) {
    const target = input.file_path ?? input.notebook_path;
    if (typeof target !== 'string') return null;
    const absolute = path.resolve(workspaceRoot, target);
    if (!writeRoots.some((root) => isWithin(root, absolute))) return null;
    const relative = path.relative(workspaceRoot, absolute);
    return {
      key: `write:${absolute}`,
      check: { toolName: 'write_file', input: { path: relative } },
      label: `write ${relative}`,
      grant: (grants) => grants.writePaths.push(absolute),
    };
  }
  if (toolName === 'Bash') {
    if (typeof input.command !== 'string' || input.command.trim() === '') return null;
    const command = input.command.trim();
    return {
      key: `bash:${command}`,
      check: { toolName: 'run_command', input: { command } },
      label: `run \`${command}\``,
      grant: (grants) => grants.commands.push(command),
    };
  }
  if (toolName.startsWith('mcp__')) {
    return {
      key: `mcp:${toolName}`,
      check: { toolName, input },
      label: `use ${toolName}`,
      grant: (grants) => grants.mcpTools.push(toolName),
    };
  }
  return null;
}

export function buildPermissionRetryMessage(labels: string[]): string {
  return `The operator granted permission for: ${labels.join(', ')}. ` +
    'This turn runs with the updated permissions, so the earlier denials no longer apply. ' +
    'Retry the actions that were denied, then continue the task.';
}

export function buildWorkflowRepairMessage(filePath: string, errors: string[]): string {
  return `Your changes left ${filePath} invalid:\n${errors.join('\n')}\nFix the file so it passes validation before emitting your handoff.`;
}

/**
 * Builds the executor for one role turn on a host agent. Mutates `history` and the
 * context's session in place, as the API path does: user messages it adds (retries,
 * repairs) and the host's reply text are pushed onto `history`.
 */
export function createHostTurnExecutor(input: HostTurnExecutorInput): () => Promise<GatewayTurnResult> {
  const { context, roleInstanceId, systemPrompt, history, signal, operatorRenderer, consentGate, nodeId, outputStream } = input;
  const emitText = input.onAssistantTextDelta ?? ((text: string) => upsertAssistantDelta(history, text));
  const session = context.session;
  const writeRoots = [context.projectRoot, context.recordFolderPath, ...(context.extraWritableDirs ?? [])].map((dir) => path.resolve(dir));

  const appendUserMessage = async (content: string): Promise<void> => {
    const message: RuntimeMessageParam = { role: 'user', content };
    history.push(message);
    await input.onConversationMessages?.([message]);
  };

  return async () => {
    const adapter = getHostAgent(context.agentId);
    const { executablePath } = getAgentModeSettings();
    const probe = await assertHostReady(adapter, executablePath);

    const promptFile = getRoleStateFilePath(context.flowRef, roleInstanceId, HOST_SYSTEM_PROMPT_FILE);
    fs.mkdirSync(path.dirname(promptFile), { recursive: true });
    fs.writeFileSync(promptFile, systemPrompt, 'utf8');

    const workflowPaths = Object.values(workflowFilePaths(context.flowRef));
    const grants: OneTimeGrants = { writePaths: [], commands: [], mcpTools: [] };
    const retriedDenials = new Set<string>();
    let recoveredFrom: DeliveryState | null = null;

    for (let attempt = 0; ; attempt += 1) {
      const existing = session.hostSession?.agentId === context.agentId ? session.hostSession : undefined;
      let message = pendingHostMessage(history, existing);
      if (!message && existing) {
        // Everything was delivered but no reply arrived (the turn was stopped before any text).
        message = INTERRUPTED_TURN_CONTINUATION_MESSAGE;
      }
      if (!existing && recoveredFrom) {
        const transcript = renderRecoveryTranscript(history, recoveredFrom);
        message = [HOST_RECOVERY_PREAMBLE, transcript, pendingHostMessage(history, recoveredFrom)]
          .filter((part) => part.trim() !== '')
          .join('\n\n');
      }

      const conversationId = existing?.conversationId ?? crypto.randomUUID();
      const sentMark = deliveryMark(history);
      const markDelivered = async (mark: DeliveryState): Promise<void> => {
        session.hostSession = {
          agentId: context.agentId,
          conversationId,
          startedAt: existing?.startedAt ?? new Date().toISOString(),
          ...mark,
        };
        await context.saveSession();
      };

      let receiving = false;
      let emittedAny = false;
      const onEvent = (event: HostLiveEvent): void => {
        if (!receiving) {
          receiving = true;
          operatorRenderer?.receivingResponse(roleInstanceId);
        }
        switch (event.kind) {
          case 'text': {
            const delta = event.newBlock && emittedAny ? `\n\n${event.text}` : event.text;
            emittedAny ||= event.text.length > 0;
            outputStream?.write(delta);
            emitText(delta);
            break;
          }
          case 'tool_call':
            operatorRenderer?.emit({ kind: 'activity.tool_call', role: roleInstanceId, toolName: event.toolName, path: event.path, command: event.command });
            break;
          case 'tool_result':
            operatorRenderer?.emit({ kind: 'activity.tool_result', role: roleInstanceId, toolName: event.toolName, isError: event.isError });
            break;
          case 'rate_limit':
            operatorRenderer?.emit({ kind: 'usage.host_rate_limit', role: roleInstanceId, fiveHour: event.fiveHour, sevenDay: event.sevenDay });
            break;
        }
      };

      const hashesBefore = workflowPaths.map(hashFile);
      operatorRenderer?.requestSent(
        roleInstanceId,
        adapter.displayName,
        formatHostModelLabel(adapter, { model: context.model, effort: context.effort })
      );

      let result: HostTurnResult;
      try {
        result = await TelemetryManager.getTracer().startActiveSpan('host_agent.turn', {
          attributes: {
            'host.agent_id': adapter.id,
            'host.version': probe.version ?? 'unknown',
            'host.resumed': Boolean(existing),
          },
        }, async (span) => {
          try {
            const turn = await adapter.runTurn({
              conversationId,
              resume: Boolean(existing),
              systemPromptFile: promptFile,
              message,
              cwd: context.projectRoot,
              extraWritableDirs: writeRoots.filter((dir) => dir !== path.resolve(context.projectRoot)),
              permissions: buildHostPermissionProfile(consentGate, grants, context.workspaceRoot),
              model: context.model,
              effort: context.effort,
            }, onEvent, signal ?? new AbortController().signal, executablePath);
            if (turn.kind === 'completed') span.setAttribute('host.permission_denials', turn.permissionDenials.length);
            return turn;
          } catch (error) {
            span.recordException(error as Error);
            span.setStatus({ code: SpanStatusCode.ERROR });
            throw error;
          } finally {
            span.end();
          }
        });
      } catch (error) {
        // The host received the message even when the turn then failed or was stopped.
        if (error instanceof LLMGatewayError) await markDelivered(sentMark);
        throw error;
      }

      if (result.kind === 'conversation-missing') {
        if (!existing || recoveredFrom) {
          throw new LLMGatewayError('UNKNOWN', `${adapter.displayName} could not find conversation ${conversationId}.`);
        }
        logger.warn('session.host_conversation_recovered', {
          project_namespace: context.flowRef.projectNamespace,
          role_name: roleInstanceId,
          conversation_id: conversationId,
        });
        recoveredFrom = { deliveredCount: existing.deliveredCount, deliveredTailLength: existing.deliveredTailLength };
        delete session.hostSession;
        continue;
      }

      if (result.kind === 'malformed') {
        await markDelivered(sentMark);
        throw new LLMGatewayError('PROVIDER_MALFORMED', `${adapter.displayName} returned unreadable output: ${result.detail}\n${result.stderrTail}`.trim());
      }

      recoveredFrom = null;
      if (!emittedAny && result.text) {
        outputStream?.write(result.text);
        emitText(result.text);
      }
      await markDelivered(deliveryMark(history));

      if (attempt >= MAX_HOST_TURN_RETRIES) {
        return { text: result.text, contextUsage: result.contextUsage, finishReason: result.finishReason };
      }

      const workflowErrors = workflowPaths.flatMap((filePath, index) => {
        if (hashFile(filePath) === hashesBefore[index] || !fs.existsSync(filePath)) return [];
        const errors = validateWorkflowFileContent(fs.readFileSync(filePath, 'utf8'), filePath, context.flowRef);
        return errors.length > 0 ? [{ filePath, errors }] : [];
      });
      if (workflowErrors.length > 0) {
        operatorRenderer?.emit({
          kind: 'repair.requested',
          scope: context.repairScope ?? 'node',
          code: 'workflow_validation',
          summary: 'Workflow file left invalid after the turn',
          role: roleInstanceId,
          nodeId,
        });
        await appendUserMessage(workflowErrors.map(({ filePath, errors }) => buildWorkflowRepairMessage(filePath, errors)).join('\n\n'));
        continue;
      }

      if (consentGate && nodeId && result.permissionDenials.length > 0) {
        const granted: string[] = [];
        for (const denial of result.permissionDenials) {
          const request = mapHostDenial(denial, context.workspaceRoot, writeRoots);
          if (!request || retriedDenials.has(request.key)) continue;
          const decision = await consentGate.check({ ...request.check, nodeId, role: roleInstanceId }, signal);
          if (decision === CONSENT_CHECK_RESULT.DENY) {
            if (signal?.aborted) throw new LLMGatewayError('ABORTED', 'Turn aborted by operator');
            throw new LLMGatewayError('CONSENT_DENIED', 'Tool call denied by operator; awaiting human guidance.');
          }
          request.grant(grants);
          retriedDenials.add(request.key);
          granted.push(request.label);
        }
        if (granted.length > 0) {
          await appendUserMessage(buildPermissionRetryMessage(granted));
          continue;
        }
      }

      return { text: result.text, contextUsage: result.contextUsage, finishReason: result.finishReason };
    }
  };
}
