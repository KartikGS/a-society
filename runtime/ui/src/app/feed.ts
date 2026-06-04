import { operatorEventToFeedItem } from '../../../src/common/operator-feed.js';
import type { AssistantFeedSegment, FeedItem, OperatorEvent } from '../types.js';

export function nextFeedId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatOperatorEvent(event: OperatorEvent): FeedItem | null {
  return operatorEventToFeedItem(event, nextFeedId());
}

export function resolveToolFeedItem(feeds: Record<string, FeedItem[]>, role: string, toolName: string, isError: boolean): Record<string, FeedItem[]> {
  const existing = feeds[role] ?? [];
  const idx = [...existing].reverse().findIndex(item => item.type === 'tool' && item.text.startsWith(toolName));
  if (idx === -1) return feeds;
  const realIdx = existing.length - 1 - idx;
  const updated = existing.map((item, i) =>
    i === realIdx ? { ...item, type: (isError ? 'tool-error' : 'tool-success') as FeedItem['type'] } : item
  );
  return { ...feeds, [role]: updated };
}

export function resolveCompactionFeedItem(feeds: Record<string, FeedItem[]>, role: string, event: OperatorEvent): Record<string, FeedItem[]> {
  const resolved = formatOperatorEvent(event);
  if (!resolved) return feeds;

  const existing = feeds[role] ?? [];
  const idx = [...existing].reverse().findIndex(item => item.type === 'tool' && item.label === 'Compaction');
  if (idx === -1) return feeds;

  const realIdx = existing.length - 1 - idx;
  const updated = existing.map((item, i) =>
    i === realIdx
      ? { ...item, type: resolved.type, label: resolved.label, text: resolved.text }
      : item
  );
  return { ...feeds, [role]: updated };
}

export function appendFeedItem(feeds: Record<string, FeedItem[]>, role: string, item: FeedItem): Record<string, FeedItem[]> {
  const existing = feeds[role] ?? [];
  const previous = existing[existing.length - 1];
  if (item.type === 'assistant' && previous?.type === 'assistant') {
    return {
      ...feeds,
      [role]: [...existing.slice(0, -1), appendAssistantTextSegment(previous, item.text)]
    };
  }
  return { ...feeds, [role]: [...existing, item] };
}

function appendAssistantTextSegment(item: FeedItem, text: string): FeedItem {
  const segments: AssistantFeedSegment[] = item.segments
    ? [...item.segments]
    : item.text
      ? [{ type: 'text', text: item.text }]
      : [];
  const previous = segments[segments.length - 1];
  if (previous?.type === 'text') {
    segments[segments.length - 1] = { ...previous, text: previous.text + text };
  } else {
    segments.push({ type: 'text', text });
  }
  return { ...item, text: item.text + text, segments };
}

function appendAssistantReasoningSegment(
  item: FeedItem,
  event: Extract<OperatorEvent, { kind: 'provider.reasoning_trace' }>
): FeedItem {
  const segments: AssistantFeedSegment[] = item.segments
    ? [...item.segments]
    : item.text
      ? [{ type: 'text', text: item.text }]
      : [];
  const previous = segments[segments.length - 1];
  if (
    previous?.type === 'reasoning' &&
    previous.label === event.label &&
    previous.display === event.display
  ) {
    segments[segments.length - 1] = { ...previous, text: previous.text + event.text };
  } else {
    segments.push({
      type: 'reasoning',
      label: event.label,
      text: event.text,
      display: event.display,
    });
  }
  return { ...item, segments };
}

export function applyReasoningTraceToFeed(
  feeds: Record<string, FeedItem[]>,
  role: string,
  event: Extract<OperatorEvent, { kind: 'provider.reasoning_trace' }>
): Record<string, FeedItem[]> {
  const existing = feeds[role] ?? [];
  const previous = existing[existing.length - 1];

  if (previous?.type !== 'assistant') {
    return {
      ...feeds,
      [role]: [...existing, {
        id: nextFeedId(),
        type: 'assistant',
        label: 'Assistant',
        text: '',
        segments: [{
          type: 'reasoning',
          label: event.label,
          text: event.text,
          display: event.display,
        }],
      }],
    };
  }

  return {
    ...feeds,
    [role]: [...existing.slice(0, -1), appendAssistantReasoningSegment(previous, event)],
  };
}
