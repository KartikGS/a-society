/**
 * Read-only documents the operator can open in the in-app document view: the proposed
 * change behind a file-write consent prompt, or a file such as a handoff artifact.
 */

/** Largest text, in UTF-8 bytes, served for one viewed file or one side of a change. */
export const DOCUMENT_VIEW_MAX_BYTES = 512 * 1024;

/**
 * `runtime-write`: the runtime applies exactly this change if allowed.
 * `host-attempt`: a host coding agent's denied write, which the agent redoes if allowed.
 */
export type ChangeOrigin = 'runtime-write' | 'host-attempt';

export const CHANGE_ORIGINS: readonly ChangeOrigin[] = ['runtime-write', 'host-attempt'];

/** The change a file-write consent prompt asks about. Strings only, so it is browser-safe. */
export interface ProposedFileChange {
  /** Workspace-relative path, as shown in the consent prompt. */
  path: string;
  /** Current file text; null when the file does not exist yet. */
  before: string | null;
  after: string;
  origin: ChangeOrigin;
}

/** Attached to a file-write ConsentRequest when a preview is available. */
export interface ConsentChangePreviewRef {
  /** Opaque id, valid only while the consent request is pending. */
  id: string;
  changeKind: 'create' | 'modify';
  origin: ChangeOrigin;
}

/** What the UI asks the document view to show. */
export type DocumentRequest =
  | { kind: 'change-preview'; previewId: string; path: string }
  | { kind: 'file'; path: string; label: string };

export type DocumentUnavailableReason =
  | 'invalid-request'
  | 'not-found'
  | 'expired'
  | 'outside-roots'
  | 'not-a-file'
  | 'binary'
  | 'too-large'
  | 'unreadable';

export const DOCUMENT_UNAVAILABLE_REASONS: readonly DocumentUnavailableReason[] = [
  'invalid-request', 'not-found', 'expired', 'outside-roots', 'not-a-file', 'binary', 'too-large', 'unreadable',
];

/** Body of every document endpoint response, success or not. */
export type DocumentView =
  | {
      kind: 'change';
      path: string;
      changeKind: 'create' | 'modify';
      origin: ChangeOrigin;
      before: string | null;
      after: string;
    }
  | { kind: 'file'; path: string; content: string }
  | { kind: 'unavailable'; path: string; reason: DocumentUnavailableReason; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parses a fetched document body; null when it is not a DocumentView. */
export function parseDocumentView(value: unknown): DocumentView | null {
  if (!isRecord(value) || typeof value.path !== 'string') return null;
  if (value.kind === 'change') {
    if (value.changeKind !== 'create' && value.changeKind !== 'modify') return null;
    if (!(CHANGE_ORIGINS as readonly unknown[]).includes(value.origin)) return null;
    if (value.before !== null && typeof value.before !== 'string') return null;
    if (typeof value.after !== 'string') return null;
    return {
      kind: 'change',
      path: value.path,
      changeKind: value.changeKind,
      origin: value.origin as ChangeOrigin,
      before: value.before as string | null,
      after: value.after,
    };
  }
  if (value.kind === 'file') {
    return typeof value.content === 'string' ? { kind: 'file', path: value.path, content: value.content } : null;
  }
  if (value.kind === 'unavailable') {
    if (!(DOCUMENT_UNAVAILABLE_REASONS as readonly unknown[]).includes(value.reason)) return null;
    if (typeof value.message !== 'string') return null;
    return { kind: 'unavailable', path: value.path, reason: value.reason as DocumentUnavailableReason, message: value.message };
  }
  return null;
}
