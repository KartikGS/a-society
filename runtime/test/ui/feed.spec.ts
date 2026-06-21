import { describe, expect, it } from 'vitest';
import { appendFeedItem, applyReasoningTraceToFeed } from '../../ui/src/app/feed.js';
import type { FeedItem, OperatorEvent } from '../../shared/types.js';

function reasoningTrace(role: string, text: string): Extract<OperatorEvent, { kind: 'provider.reasoning_trace' }> {
  return {
    kind: 'provider.reasoning_trace',
    role,
    label: 'Provider reasoning trace',
    text,
    display: 'collapsed',
  };
}

describe('ui/feed', () => {
  it('starts a new reasoning item after a user message', () => {
    const feeds: Record<string, FeedItem[]> = {
      owner: [
        { id: 'assistant-1', type: 'assistant', label: 'Assistant', text: 'Previous answer.' },
        { id: 'user-1', type: 'user', label: 'You', text: 'Next prompt.' },
      ],
    };

    const updated = applyReasoningTraceToFeed(feeds, 'owner', reasoningTrace('owner', 'New turn reasoning.'));

    expect(updated.owner[2]).toMatchObject({
      type: 'reasoning',
      label: 'Provider reasoning trace',
      text: 'New turn reasoning.',
      reasoningDisplay: 'collapsed',
    });
    expect(updated.owner).toHaveLength(3);
  });

  it('appends to the latest reasoning item', () => {
    let feeds: Record<string, FeedItem[]> = {};

    feeds = applyReasoningTraceToFeed(feeds, 'owner', reasoningTrace('owner', 'Reasoning A. '));
    feeds = applyReasoningTraceToFeed(feeds, 'owner', reasoningTrace('owner', 'Reasoning B.'));

    expect(feeds.owner).toEqual([expect.objectContaining({
      type: 'reasoning',
      text: 'Reasoning A. Reasoning B.',
      reasoningDisplay: 'collapsed',
    })]);
  });

  it('preserves chronological item order around assistant text', () => {
    let feeds: Record<string, FeedItem[]> = {};

    feeds = appendFeedItem(feeds, 'owner', {
      id: 'assistant-text-1',
      type: 'assistant',
      label: 'Assistant',
      text: 'Assistant text A. ',
    });
    feeds = applyReasoningTraceToFeed(feeds, 'owner', reasoningTrace('owner', 'Reasoning R1. '));
    feeds = appendFeedItem(feeds, 'owner', {
      id: 'assistant-text-2',
      type: 'assistant',
      label: 'Assistant',
      text: 'Assistant text B. ',
    });
    feeds = applyReasoningTraceToFeed(feeds, 'owner', reasoningTrace('owner', 'Reasoning R2. '));
    feeds = appendFeedItem(feeds, 'owner', {
      id: 'assistant-text-3',
      type: 'assistant',
      label: 'Assistant',
      text: 'Assistant text C.',
    });

    expect(feeds.owner.map((item) => item.type)).toEqual([
      'assistant',
      'reasoning',
      'assistant',
      'reasoning',
      'assistant',
    ]);
    expect(feeds.owner.map((item) => item.text)).toEqual([
      'Assistant text A. ',
      'Reasoning R1. ',
      'Assistant text B. ',
      'Reasoning R2. ',
      'Assistant text C.',
    ]);
  });
});
