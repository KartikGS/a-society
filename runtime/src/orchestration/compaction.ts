import crypto from 'node:crypto';
import { LLMGateway } from '../providers/llm.js';
import type { FlowRun, GatewayTurnResult, OperatorRenderSink, RoleSession, RuntimeMessageParam } from '../common/types.js';

export const AUTO_COMPACTION_CONTEXT_RATIO = 0.8;

export type CompactionTrigger = 'manual' | 'auto';

export interface RoleSessionCompactionResult {
  compacted: boolean;
  archiveId?: string;
  reason?: string;
  aborted?: boolean;
  skipped?: boolean;
}

export function shouldAutoCompact(contextUsage: number | undefined, contextWindow: number | null | undefined): boolean {
  if (contextUsage === undefined) return false;
  if (!contextWindow || contextWindow <= 0) return false;
  return contextUsage >= contextWindow * AUTO_COMPACTION_CONTEXT_RATIO;
}

function formatRuntimeMessage(message: RuntimeMessageParam, index: number): string {
  if (message.role === 'user' || message.role === 'assistant') {
    return [
      `## Message ${index + 1}: ${message.role}`,
      message.content
    ].join('\n');
  }

  if (message.role === 'assistant_tool_calls') {
    return [
      `## Message ${index + 1}: assistant_tool_calls`,
      message.text ? `Assistant text: ${message.text}` : 'Assistant text: (none)',
      'Tool calls:',
      JSON.stringify(message.calls, null, 2)
    ].join('\n');
  }

  return [
    `## Message ${index + 1}: tool_result`,
    `Tool: ${message.toolName}`,
    `Error: ${message.isError ? 'yes' : 'no'}`,
    message.content
  ].join('\n');
}

function buildSummaryPrompt(nodeId: string, exchanges: RuntimeMessageParam[]): string {
  return [
    `Summarize the current workflow node conversation for node "${nodeId}".`,
    '',
    'You are summarizing only the messages below. Do not infer facts from earlier nodes unless they appear in these messages.',
    'Preserve decisions, unresolved questions, constraints, current plan, files/artifacts mentioned, tool outcomes, and any latest repair or human-input instruction.',
    'Be concise but operational: the next assistant turn must be able to continue safely from your summary.',
    '',
    exchanges.map(formatRuntimeMessage).join('\n\n')
  ].join('\n');
}

function summarizeFlowState(flowRun: FlowRun, roleName: string, currentNodeId: string): string {
  const lines: string[] = [];

  lines.push(`Flow: ${flowRun.projectNamespace}/${flowRun.flowId}`);
  lines.push(`Role: ${roleName}`);
  lines.push(`Current node: ${currentNodeId}`);
  lines.push(`Record folder: ${flowRun.recordFolderPath}`);

  const handoffEntries = flowRun.completedHandoffs
    .filter(edge => {
      const [from, to] = edge.split('=>');
      return from === currentNodeId || to === currentNodeId;
    });
  lines.push('Current-node handoffs:');
  if (handoffEntries.length === 0) {
    lines.push('- (none)');
  } else {
    for (const edge of handoffEntries) {
      lines.push(`- ${edge}`);
    }
  }

  return lines.join('\n');
}

function latestUserMessage(exchanges: RuntimeMessageParam[]): string | null {
  const latest = exchanges[exchanges.length - 1];
  return latest?.role === 'user' ? latest.content : null;
}

function buildReplacementMessage(options: {
  archiveId: string;
  trigger: CompactionTrigger;
  roleName: string;
  nodeId: string;
  flowRun: FlowRun;
  summary: string;
  exchanges: RuntimeMessageParam[];
}): RuntimeMessageParam {
  const unresolvedMessage = latestUserMessage(options.exchanges);
  const lines: string[] = [
    '# Runtime Context Restoration',
    '',
    `Compaction id: ${options.archiveId}`,
    `Compaction trigger: ${options.trigger}`,
    '',
    'This runtime-authored message replaces earlier transcript messages for future model input. Raw history remains archived in transcript.json.',
    '',
    '## Programmatic Flow Context',
    summarizeFlowState(options.flowRun, options.roleName, options.nodeId),
    '',
    '## Current Node Conversation Summary',
    options.summary.trim() || '(The compaction model returned an empty summary.)'
  ];

  if (unresolvedMessage) {
    lines.push(
      '',
      '## Latest Unresolved User Or Runtime Message',
      unresolvedMessage
    );
  }

  lines.push(
    '',
    'Continue from this restored context. Treat current node inputs, handoff artifacts, and runtime repair instructions as authoritative.'
  );

  return { role: 'user', content: lines.join('\n') };
}

export async function compactRoleSession(options: {
  session: RoleSession;
  flowRun: FlowRun;
  roleName: string;
  trigger: CompactionTrigger;
  signal: AbortSignal;
  operatorRenderer: OperatorRenderSink;
  nodeId: string;
  exchanges: RuntimeMessageParam[];
}): Promise<RoleSessionCompactionResult> {
  const nodeId = options.nodeId;
  if (!nodeId) {
    return { compacted: false, reason: 'Session has no current node.' };
  }

  const exchanges = options.exchanges;

  if (exchanges.length === 0 || options.session.transcriptHistory.length === 0) {
    return { compacted: false, reason: 'Session has no transcript messages to compact.' };
  }

  const llm = new LLMGateway({
    mode: 'system',
    workspaceRoot: options.flowRun.workspaceRoot,
  });
  let result: GatewayTurnResult;
  try {
    result = await llm.executeTurn(
      [
        'You are the A-Society runtime context compactor.',
        'Return only a concise operational summary of the supplied current-node conversation.',
        'Do not emit a handoff block. Do not call tools.'
      ].join('\n'),
      [{ role: 'user', content: buildSummaryPrompt(nodeId, exchanges) }],
      {
        signal: options.signal,
        operatorRenderer: options.operatorRenderer,
        roleInstanceId: options.roleName,
        nodeId,
      }
    );
  } finally {
    options.operatorRenderer.responseEnd(options.roleName);
  }

  const archiveId = crypto.randomUUID();
  const replacementMessage = buildReplacementMessage({
    archiveId,
    trigger: options.trigger,
    roleName: options.roleName,
    nodeId,
    flowRun: options.flowRun,
    summary: result.text,
    exchanges
  });

  options.session.compactionArchives = [
    ...(options.session.compactionArchives ?? []),
    {
      id: archiveId,
      trigger: options.trigger,
      nodeId,
      compactedAt: new Date().toISOString(),
      archivedTranscriptHistory: [...options.session.transcriptHistory as RuntimeMessageParam[]],
      replacementMessage
    }
  ];
  options.session.transcriptHistory = [replacementMessage];
  options.session.currentNodeContext = {
    nodeId,
    exchanges: [replacementMessage]
  };
  options.session.latestContextUsage = 0;

  return { compacted: true, archiveId };
}

export async function autoCompactRoleSessionBeforeTurn(options: {
  session: RoleSession;
  flowRun: FlowRun;
  roleName: string;
  nodeId: string;
  contextWindow: number | null | undefined;
  signal: AbortSignal;
  operatorRenderer: OperatorRenderSink;
  activeHistory: RuntimeMessageParam[];
}): Promise<RoleSessionCompactionResult> {
  if (!shouldAutoCompact(options.session.latestContextUsage, options.contextWindow)) {
    return { compacted: false, skipped: true };
  }

  options.operatorRenderer.emit({ kind: 'session.compaction_started', role: options.roleName, trigger: 'auto' });

  try {
    const result = await compactRoleSession({
      session: options.session,
      flowRun: options.flowRun,
      roleName: options.roleName,
      trigger: 'auto',
      signal: options.signal,
      operatorRenderer: options.operatorRenderer,
      nodeId: options.nodeId,
      exchanges: options.activeHistory,
    });

    if (!result.compacted) {
      options.operatorRenderer.emit({
        kind: 'session.compaction_failed',
        role: options.roleName,
        trigger: 'auto',
        reason: result.reason ?? 'No context was available to compact.'
      });
      return result;
    }

    options.operatorRenderer.emit({
      kind: 'session.compacted',
      role: options.roleName,
      nodeId: options.nodeId,
      trigger: 'auto',
      archiveId: result.archiveId!
    });
    return result;
  } catch (error) {
    if (options.signal?.aborted) {
      const reason = 'Context compaction aborted by operator.';
      options.operatorRenderer.emit({
        kind: 'session.compaction_failed',
        role: options.roleName,
        trigger: 'auto',
        reason
      });
      return { compacted: false, aborted: true, reason };
    }

    options.operatorRenderer.emit({
      kind: 'session.compaction_failed',
      role: options.roleName,
      trigger: 'auto',
      reason: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
