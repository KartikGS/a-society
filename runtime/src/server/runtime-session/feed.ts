import { Writable } from 'node:stream';
import type {
  FeedItem,
  FlowRef,
  RoleSession,
} from '../../common/types.js';
import { SessionStore } from '../../orchestration/store.js';
import type { HistoricalMessage } from '../protocol.js';
import { getOperatorFeedRoleKey, projectMessageToFeedItem } from '../role-feed.js';
import type { ActiveSession } from './types.js';

const HISTORY_LIMIT = 400;

function isPromptLine(text: string): boolean {
  return text === '\n> ' || text === '> ' || text === '\r\n> ';
}

function nextFeedItemId(session: ActiveSession, roleKey: string): string {
  const seq = session.roleFeedSequence.get(roleKey) ?? 0;
  session.roleFeedSequence.set(roleKey, seq + 1);
  return `${roleKey}_${seq}`;
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
  roleFeedHistory: Map<string, FeedItem[]>,
  workspaceRoot: string
): Record<string, number> {
  return Object.fromEntries(
    Array.from(roleFeedHistory.keys())
      .map((roleKey) => {
        const session = SessionStore.loadRoleSession(roleKey, flowRef, workspaceRoot);
        const contextUsage = latestContextUsageFromSession(session);
        return contextUsage != null ? [roleKey, contextUsage] as const : null;
      })
      .filter((entry): entry is [string, number] => entry !== null)
  );
}

export function rememberMessage(
  session: ActiveSession,
  message: HistoricalMessage,
  workspaceRoot: string
): void {
  const roleKey = getOperatorFeedRoleKey(message);
  if (!roleKey) return;
  const history = session.roleFeedHistory.get(roleKey) ?? [];

  if (message.type === 'operator_event' && message.event.kind === 'activity.tool_result') {
    const { toolName, isError } = message.event;
    const idx = [...history].reverse().findIndex(item => item.type === 'tool' && item.text.startsWith(toolName));
    if (idx !== -1) {
      const realIdx = history.length - 1 - idx;
      history[realIdx] = { ...history[realIdx], type: isError ? 'tool-error' : 'tool-success' };
      session.roleFeedHistory.set(roleKey, history);
      SessionStore.saveRoleFeed(history, session.flowRef, roleKey, workspaceRoot);
    }
    return;
  }

  const previous = history[history.length - 1];
  if (previous?.type === 'assistant' && message.type === 'output_text') {
    history[history.length - 1] = { ...previous, text: previous.text + message.text };
    session.roleFeedHistory.set(roleKey, history);
    SessionStore.saveRoleFeed(history, session.flowRef, roleKey, workspaceRoot);
    return;
  }

  const id = nextFeedItemId(session, roleKey);
  const item = projectMessageToFeedItem(message, id);
  if (!item) return;

  history.push(item);
  if (history.length > HISTORY_LIMIT) {
    history.splice(0, history.length - HISTORY_LIMIT);
  }
  session.roleFeedHistory.set(roleKey, history);
  SessionStore.saveRoleFeed(history, session.flowRef, roleKey, workspaceRoot);
}

export function createRoleOutputStream(
  session: ActiveSession,
  role: string,
  emitHistoricalMessage: (session: ActiveSession, message: HistoricalMessage) => void
): NodeJS.WritableStream {
  return new Writable({
    write(chunk, _encoding, callback) {
      const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      if (text && !isPromptLine(text)) {
        emitHistoricalMessage(session, { type: 'output_text', role, text });
      }
      callback();
    }
  });
}
