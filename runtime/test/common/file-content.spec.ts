import { describe, expect, it } from 'vitest';
import { DOCUMENT_VIEW_MAX_BYTES } from '../../shared/document-view.js';
import { decodePreviewableText, isPathWithin, isPreviewableString, sha256Hex } from '../../src/common/file-content.js';

describe('file-content', () => {
  it('decodes valid UTF-8 text', () => {
    expect(decodePreviewableText(Buffer.from('héllo\n', 'utf8'))).toEqual({ kind: 'text', text: 'héllo\n' });
  });

  it('treats NUL bytes and invalid UTF-8 as binary', () => {
    expect(decodePreviewableText(Buffer.from([0x61, 0x00, 0x62]))).toEqual({ kind: 'binary' });
    expect(decodePreviewableText(Buffer.from([0xff, 0xfe, 0x61]))).toEqual({ kind: 'binary' });
  });

  it('checks the size limit before anything else', () => {
    expect(decodePreviewableText(Buffer.alloc(DOCUMENT_VIEW_MAX_BYTES, 0x61)).kind).toBe('text');
    expect(decodePreviewableText(Buffer.alloc(DOCUMENT_VIEW_MAX_BYTES + 1, 0x00))).toEqual({ kind: 'too-large' });
  });

  it('accepts previewable strings by UTF-8 byte length and without NUL', () => {
    expect(isPreviewableString('a'.repeat(DOCUMENT_VIEW_MAX_BYTES))).toBe(true);
    expect(isPreviewableString('é'.repeat(DOCUMENT_VIEW_MAX_BYTES / 2 + 1))).toBe(false);
    expect(isPreviewableString('a\u0000b')).toBe(false);
  });

  it('checks containment by path segments, not string prefix', () => {
    expect(isPathWithin('/a/b', '/a/b')).toBe(true);
    expect(isPathWithin('/a/b', '/a/b/c.md')).toBe(true);
    expect(isPathWithin('/a/b', '/a/bc')).toBe(false);
    expect(isPathWithin('/a/b', '/a')).toBe(false);
  });

  it('hashes bytes as sha256 hex', () => {
    expect(sha256Hex(Buffer.from(''))).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});
