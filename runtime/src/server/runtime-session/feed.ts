import { Writable } from 'node:stream';
import type {
  FeedItem,
  FlowRef,
  OperatorEvent,
  RoleSession,
} from '../../common/types.js';
import * as SessionStore from '../../orchestration/store.js';
import { getFeedSettings } from '../../settings/settings-store.js';
import type { HistoricalMessage } from '../protocol.js';
import { getOperatorFeedRoleKey, projectMessageToFeedItem } from '../role-feed.js';
import type { ActiveSession } from './types.js';

function nextFeedItemId(session: ActiveSession, roleKey: string): string {
  const seq = session.roleFeedSequence.get(roleKey) ?? 0;
  session.roleFeedSequence.set(roleKey, seq + 1);
  return `${roleKey}_${seq}`;
}

function pruneFeedHistory(history: FeedItem[]): void {
  const historyLimit = getFeedSettings().historyLimit;
  if (history.length > historyLimit) {
    history.splice(0, history.length - historyLimit);
  }
}

export function recoverRoleFeedSequence(roleFeedHistory: Map<string, FeedItem[]>): Map<string, number> {
  const sequence = new Map<string, number>();
  for (const [roleKey, items] of roleFeedHistory) {
    const prefix = `${roleKey}_`;
    let max = -1;
    for (const item of items) {
      if (!item.id.startsWith(prefix)) continue;
      const seq = parseInt(item.id.slice(prefix.length), 10);
      if (Number.isFinite(seq) && seq > max) max = seq;
    }
    sequence.set(roleKey, max + 1);
  }
  return sequence;
}

export function latestContextUsageFromSession(session: RoleSession | null): number | null {
  return session?.latestContextUsage ?? null;
}

export function loadLatestContextUsageByRole(
  flowRef: FlowRef,
  roleFeedHistory: Map<string, FeedItem[]>
): Record<string, number> {
  return Object.fromEntries(
    Array.from(roleFeedHistory.keys())
      .map((roleKey) => {
        const session = SessionStore.loadRoleSession(roleKey, flowRef);
        const contextUsage = latestContextUsageFromSession(session);
        return contextUsage != null ? [roleKey, contextUsage] as const : null;
      })
      .filter((entry): entry is [string, number] => entry !== null)
  );
}

function isPendingCompactionItem(item: FeedItem): boolean {
  return item.type === 'tool' && item.label === 'Compaction';
}

function isPendingAutoSelectionItem(item: FeedItem): boolean {
  return item.type === 'tool' && item.label === 'Role Configuration';
}

function applyReasoningTraceToFeed(
  session: ActiveSession,
  history: FeedItem[],
  roleKey: string,
  event: Extract<OperatorEvent, { kind: 'provider.reasoning_trace' }>
): void {
  const previous = history[history.length - 1];
  if (previous?.type === 'reasoning') {
    history[history.length - 1] = { ...previous, text: previous.text + event.text };
  } else {
    const item = projectMessageToFeedItem(
      { type: 'operator_event', event },
      nextFeedItemId(session, roleKey)
    );
    if (item) history.push(item);
  }

  pruneFeedHistory(history);
  session.roleFeedHistory.set(roleKey, history);
  SessionStore.saveRoleFeed(history, session.flowRef, roleKey);
}

function appendProjectedFeedItem(
  session: ActiveSession,
  history: FeedItem[],
  roleKey: string,
  message: HistoricalMessage
): void {
  const id = nextFeedItemId(session, roleKey);
  const item = projectMessageToFeedItem(message, id);
  if (!item) return;

  history.push(item);
  pruneFeedHistory(history);
  session.roleFeedHistory.set(roleKey, history);
  SessionStore.saveRoleFeed(history, session.flowRef, roleKey);
}

export function rememberMessage(
  session: ActiveSession,
  message: HistoricalMessage
): void {
  const roleKey = getOperatorFeedRoleKey(message);
  if (!roleKey) return;
  const history = session.roleFeedHistory.get(roleKey) ?? [];

  if (message.type === 'operator_event' && message.event.kind === 'provider.reasoning_trace') {
    applyReasoningTraceToFeed(session, history, roleKey, message.event);
    return;
  }

  if (message.type === 'operator_event' && message.event.kind === 'activity.tool_result') {
    const { toolName, isError } = message.event;
    const idx = [...history].reverse().findIndex(item => item.type === 'tool' && item.text.startsWith(toolName));
    if (idx !== -1) {
      const realIdx = history.length - 1 - idx;
      history[realIdx] = { ...history[realIdx], type: isError ? 'tool-error' : 'tool-success' };
      session.roleFeedHistory.set(roleKey, history);
      SessionStore.saveRoleFeed(history, session.flowRef, roleKey);
    }
    return;
  }

  if (
    message.type === 'operator_event' &&
    (message.event.kind === 'session.compacted' || message.event.kind === 'session.compaction_failed')
  ) {
    const projected = projectMessageToFeedItem(message, 'compaction-resolution');
    const idx = [...history].reverse().findIndex(isPendingCompactionItem);
    if (idx !== -1 && projected) {
      const realIdx = history.length - 1 - idx;
      history[realIdx] = {
        ...history[realIdx],
        type: projected.type,
        label: projected.label,
        text: projected.text,
      };
      session.roleFeedHistory.set(roleKey, history);
      SessionStore.saveRoleFeed(history, session.flowRef, roleKey);
      return;
    }

    return;
  }

  if (
    message.type === 'operator_event' &&
    (message.event.kind === 'role.auto_configured' || message.event.kind === 'role.auto_selection_fell_back')
  ) {
    const projected = projectMessageToFeedItem(message, 'auto-selection-resolution');
    const idx = [...history].reverse().findIndex(isPendingAutoSelectionItem);
    if (idx !== -1 && projected) {
      const realIdx = history.length - 1 - idx;
      history[realIdx] = {
        ...history[realIdx],
        type: projected.type,
        label: projected.label,
        text: projected.text,
      };
      session.roleFeedHistory.set(roleKey, history);
      SessionStore.saveRoleFeed(history, session.flowRef, roleKey);
      return;
    }
    if (projected) appendProjectedFeedItem(session, history, roleKey, message);
    return;
  }

  const previous = history[history.length - 1];
  if (previous?.type === 'assistant' && message.type === 'output_text') {
    history[history.length - 1] = { ...previous, text: previous.text + message.text };
    session.roleFeedHistory.set(roleKey, history);
    SessionStore.saveRoleFeed(history, session.flowRef, roleKey);
    return;
  }

  appendProjectedFeedItem(session, history, roleKey, message);
}

export function createRoleOutputStream(
  session: ActiveSession,
  role: string,
  emitHistoricalMessage: (session: ActiveSession, message: HistoricalMessage) => void
): NodeJS.WritableStream {
  return new Writable({
    write(chunk, _encoding, callback) {
      const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      if (text) {
        emitHistoricalMessage(session, { type: 'output_text', role, text });
      }
      callback();
    }
  });
}
