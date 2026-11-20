import crypto from 'node:crypto';
import path from 'node:path';
import { DOCUMENT_VIEW_MAX_BYTES } from '../../shared/document-view.js';

/** True when target is root or inside it. */
export function isPathWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function sha256Hex(bytes: Buffer): string {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

export type PreviewableText = { kind: 'text'; text: string } | { kind: 'binary' } | { kind: 'too-large' };

/**
 * Classifies file bytes for display: too-large past DOCUMENT_VIEW_MAX_BYTES (checked first),
 * binary when they contain NUL or are not valid UTF-8, otherwise the decoded text.
 */
export function decodePreviewableText(bytes: Buffer): PreviewableText {
  if (bytes.length > DOCUMENT_VIEW_MAX_BYTES) return { kind: 'too-large' };
  if (bytes.includes(0)) return { kind: 'binary' };
  try {
    return { kind: 'text', text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { kind: 'binary' };
  }
}

/** True when text is within the display limit and contains no NUL. */
export function isPreviewableString(text: string): boolean {
  return Buffer.byteLength(text, 'utf8') <= DOCUMENT_VIEW_MAX_BYTES && !text.includes('\u0000');
}
