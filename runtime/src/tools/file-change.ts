import fs from 'node:fs';
import type { ChangeOrigin, ProposedFileChange } from '../../shared/document-view.js';
import { decodePreviewableText, isPreviewableString, sha256Hex } from '../common/file-content.js';

export type FileBase =
  | { kind: 'absent' }
  | { kind: 'present'; bytes: Buffer; hash: string }
  | { kind: 'unreadable'; error: NodeJS.ErrnoException };

/** Reads the current file once. ENOENT/ENOTDIR → absent; other read errors → unreadable. Never throws. */
export function readFileBase(absolutePath: string): FileBase {
  try {
    const bytes = fs.readFileSync(absolutePath);
    return { kind: 'present', bytes, hash: sha256Hex(bytes) };
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return { kind: 'absent' };
    return { kind: 'unreadable', error };
  }
}

export interface FileChange {
  /** Workspace-relative path as the tool call or consent prompt names it. */
  path: string;
  absolutePath: string;
  /** null: the file did not exist when the change was computed. */
  baseBytes: Buffer | null;
  /** sha256Hex(baseBytes); null when absent. */
  baseHash: string | null;
  after: string;
}

/** Null when the base is not previewable text or `after` is not previewable. */
export function toProposedFileChange(change: FileChange, origin: ChangeOrigin): ProposedFileChange | null {
  let before: string | null = null;
  if (change.baseBytes !== null) {
    const decoded = decodePreviewableText(change.baseBytes);
    if (decoded.kind !== 'text') return null;
    before = decoded.text;
  }
  if (!isPreviewableString(change.after)) return null;
  return { path: change.path, before, after: change.after, origin };
}
