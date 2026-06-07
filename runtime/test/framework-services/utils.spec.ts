import assert from 'node:assert';
import { it as test } from 'vitest';
import { extractFrontmatter } from '../../src/framework-services/utils.js';

test('returns frontmatter content from valid markdown', () => {
  const content = '---\nfoo: bar\nbaz: qux\n---\n\nBody text.';
  const result = extractFrontmatter(content);
  assert.strictEqual(result, 'foo: bar\nbaz: qux');
});

test('returns null when no frontmatter delimiter present', () => {
  const result = extractFrontmatter('No frontmatter here.\nJust a regular markdown file.');
  assert.strictEqual(result, null);
});

test('returns null when file starts with content before delimiter', () => {
  const result = extractFrontmatter('Some text\n---\nfoo: bar\n---\n');
  assert.strictEqual(result, null);
});

test('handles CRLF line endings', () => {
  const content = '---\r\nfoo: bar\r\n---\r\nBody.';
  const result = extractFrontmatter(content);
  assert.strictEqual(result, 'foo: bar');
});

test('returns empty string for empty frontmatter block', () => {
  const content = '---\n\n---\nBody.';
  const result = extractFrontmatter(content);
  assert.strictEqual(result, '');
});

test('extracts only the first frontmatter block', () => {
  const content = '---\nfirst: true\n---\nSome text.\n---\nsecond: true\n---\n';
  const result = extractFrontmatter(content);
  assert.strictEqual(result, 'first: true');
});

test('handles multiline frontmatter values', () => {
  const content = '---\nworkflow:\n  name: Test\n  phases: []\n---\n';
  const result = extractFrontmatter(content);
  assert.strictEqual(result, 'workflow:\n  name: Test\n  phases: []');
});
