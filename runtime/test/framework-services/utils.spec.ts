import { expect, it } from 'vitest';
import { extractFrontmatter } from '../../src/framework-services/utils.js';

it('returns frontmatter content from valid markdown', () => {
  const content = '---\nfoo: bar\nbaz: qux\n---\n\nBody text.';
  const result = extractFrontmatter(content);
  expect(result).toBe('foo: bar\nbaz: qux');
});

it('returns null when no frontmatter delimiter present', () => {
  const result = extractFrontmatter('No frontmatter here.\nJust a regular markdown file.');
  expect(result).toBeNull();
});

it('returns null when file starts with content before delimiter', () => {
  const result = extractFrontmatter('Some text\n---\nfoo: bar\n---\n');
  expect(result).toBeNull();
});

it('handles CRLF line endings', () => {
  const content = '---\r\nfoo: bar\r\n---\r\nBody.';
  const result = extractFrontmatter(content);
  expect(result).toBe('foo: bar');
});

it('returns empty string for empty frontmatter block', () => {
  const content = '---\n\n---\nBody.';
  const result = extractFrontmatter(content);
  expect(result).toBe('');
});

it('extracts only the first frontmatter block', () => {
  const content = '---\nfirst: true\n---\nSome text.\n---\nsecond: true\n---\n';
  const result = extractFrontmatter(content);
  expect(result).toBe('first: true');
});

it('handles multiline frontmatter values', () => {
  const content = '---\nworkflow:\n  name: Test\n  phases: []\n---\n';
  const result = extractFrontmatter(content);
  expect(result).toBe('workflow:\n  name: Test\n  phases: []');
});
