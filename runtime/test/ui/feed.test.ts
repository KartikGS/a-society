import assert from 'node:assert';
import { appendFeedItem, applyReasoningTraceToFeed } from '../../ui/src/app/feed.js';
import type { FeedItem, OperatorEvent } from '../../ui/src/types.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

function reasoningTrace(role: string, text: string): Extract<OperatorEvent, { kind: 'provider.reasoning_trace' }> {
  return {
    kind: 'provider.reasoning_trace',
    role,
    label: 'Provider reasoning trace',
    text,
    display: 'collapsed',
  };
}

console.log('\nui/feed');

test('applyReasoningTraceToFeed starts a new assistant item after a user message', () => {
  const feeds: Record<string, FeedItem[]> = {
    owner: [
      { id: 'assistant-1', type: 'assistant', label: 'Assistant', text: 'Previous answer.' },
      { id: 'user-1', type: 'user', label: 'You', text: 'Next prompt.' },
    ],
  };

  const updated = applyReasoningTraceToFeed(feeds, 'owner', reasoningTrace('owner', 'New turn reasoning.'));

  assert.strictEqual(updated.owner.length, 3);
  assert.strictEqual(updated.owner[0].segments, undefined);
  assert.strictEqual(updated.owner[2].type, 'assistant');
  assert.strictEqual(updated.owner[2].text, '');
  assert.deepStrictEqual(updated.owner[2].segments, [
    { type: 'reasoning', label: 'Provider reasoning trace', text: 'New turn reasoning.', display: 'collapsed' },
  ]);
});

test('applyReasoningTraceToFeed preserves interleaving around assistant text', () => {
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

  assert.strictEqual(feeds.owner.length, 1);
  assert.strictEqual(feeds.owner[0].text, 'Assistant text A. Assistant text B. Assistant text C.');
  assert.deepStrictEqual(feeds.owner[0].segments, [
    { type: 'text', text: 'Assistant text A. ' },
    { type: 'reasoning', label: 'Provider reasoning trace', text: 'Reasoning R1. ', display: 'collapsed' },
    { type: 'text', text: 'Assistant text B. ' },
    { type: 'reasoning', label: 'Provider reasoning trace', text: 'Reasoning R2. ', display: 'collapsed' },
    { type: 'text', text: 'Assistant text C.' },
  ]);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
