import { X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { buildLineDiff, type DiffLine } from '../app/line-diff';
import { fetchDocument, UnreadableDocumentError } from '../app/runtime-api';
import { MarkdownContent } from './MarkdownContent';
import type { ChangeOrigin, DocumentRequest, DocumentView as DocumentViewData } from '../../../shared/document-view.js';
import type { FlowRef } from '../../../shared/types.js';

interface DocumentViewProps {
  flowRef: FlowRef;
  request: DocumentRequest;
  onClose: () => void;
}

type LoadOutcome =
  | { kind: 'loaded'; view: DocumentViewData }
  | { kind: 'failed'; message: string };

const ORIGIN_NOTES: Record<ChangeOrigin, string> = {
  'runtime-write': 'Allowing applies exactly this change. If the file changes first, the write is not applied and the role is asked to retry.',
  'host-attempt': "The agent tried to make this change and will make it again after you allow it. Allowing permits writes to this file for the rest of the agent's turn.",
};

const MARKDOWN_PATH = /\.(md|markdown)$/i;

function requestKey(request: DocumentRequest): string {
  return request.kind === 'change-preview'
    ? `change-preview:${request.previewId}:${request.path}`
    : `file:${request.path}:${request.label}`;
}

function loadFailureMessage(error: unknown): string {
  if (error instanceof UnreadableDocumentError) return error.message;
  const detail = error instanceof Error ? error.message : String(error);
  return `The document could not be loaded: ${detail}`;
}

function DiffLineRow({ line }: { line: DiffLine }) {
  const marker = line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : '';
  return (
    <tr className={`diff-row diff-row-${line.kind}`}>
      <td className="diff-num">{line.oldLine ?? ''}</td>
      <td className="diff-num">{line.newLine ?? ''}</td>
      <td className="diff-marker">{marker}</td>
      <td className="diff-text">{line.text}</td>
    </tr>
  );
}

function ChangeDiff({ before, after }: { before: string | null; after: string }) {
  const diff = useMemo(() => buildLineDiff(before, after), [before, after]);
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());

  if (diff.kind === 'too-many-changes') {
    return (
      <>
        <p className="document-note">Too many differences to show a line diff. The full new content is shown below.</p>
        <pre className="document-text"><code>{after}</code></pre>
      </>
    );
  }

  const changed = diff.added + diff.removed > 0;
  return (
    <>
      <p className="document-summary">
        {changed
          ? `${diff.added} added, ${diff.removed} removed`
          : 'No changes: the file content stays the same.'}
      </p>
      <div className="diff-scroll">
        <table className="diff-table" aria-label="Line changes">
          <tbody>
            {diff.rows.map((row, index) => {
              if (row.kind !== 'collapsed') {
                return <DiffLineRow key={index} line={row} />;
              }
              if (expanded.has(index)) {
                return row.lines.map((line, offset) => (
                  <DiffLineRow key={`${index}-${offset}`} line={line} />
                ));
              }
              return (
                <tr key={index} className="diff-row diff-row-collapsed">
                  <td colSpan={4}>
                    <button
                      type="button"
                      className="diff-expand"
                      onClick={() => setExpanded((current) => new Set(current).add(index))}
                    >
                      Show {row.lines.length} unchanged lines
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DocumentBody({ view }: { view: DocumentViewData }) {
  if (view.kind === 'unavailable') {
    return <p role="status" className="document-note">{view.message}</p>;
  }
  if (view.kind === 'file') {
    return MARKDOWN_PATH.test(view.path)
      ? <div className="document-markdown"><MarkdownContent text={view.content} /></div>
      : <pre className="document-text"><code>{view.content}</code></pre>;
  }
  return (
    <>
      <div className="document-meta">
        {view.changeKind === 'create' ? <span className="document-badge">New file</span> : null}
        <p className="document-origin">{ORIGIN_NOTES[view.origin]}</p>
      </div>
      <ChangeDiff before={view.before} after={view.after} />
    </>
  );
}

/**
 * Read-only document panel shown in the graph pane: a proposed file change behind a
 * consent prompt, or a file such as a handoff or closure artifact. Content stays shown
 * after the prompt that opened it resolves; only closing or opening another document clears it.
 */
export function DocumentView({ flowRef, request, onClose }: DocumentViewProps) {
  const headingId = useId();
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const key = requestKey(request);
  const [result, setResult] = useState<{ key: string; outcome: LoadOutcome } | null>(null);
  const outcome = result?.key === key ? result.outcome : null;

  useEffect(() => {
    const controller = new AbortController();
    fetchDocument(flowRef, request, controller.signal)
      .then((view) => {
        if (!controller.signal.aborted) setResult({ key, outcome: { kind: 'loaded', view } });
      })
      .catch((error: unknown) => {
        // Aborted loads belong to a document that is no longer shown.
        if (controller.signal.aborted) return;
        setResult({ key, outcome: { kind: 'failed', message: loadFailureMessage(error) } });
      });
    return () => controller.abort();
  }, [flowRef, request, key]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [key]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    }
    section.addEventListener('keydown', handleKeyDown);
    return () => section.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const heading = request.kind === 'file' ? request.label : 'Proposed change';

  return (
    <section ref={sectionRef} className="panel document-panel" aria-labelledby={headingId}>
      <header className="document-header">
        <div className="document-heading">
          <h2 id={headingId} ref={headingRef} tabIndex={-1}>{heading}</h2>
          <p className="document-path">{request.path}</p>
        </div>
        <button
          type="button"
          className="document-close"
          aria-label="Close document"
          title="Close document"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
      </header>
      <div className="document-body">
        {outcome === null ? (
          <p role="status" className="document-note">Loading…</p>
        ) : outcome.kind === 'failed' ? (
          <p role="status" className="document-note">{outcome.message}</p>
        ) : (
          <DocumentBody key={key} view={outcome.view} />
        )}
      </div>
    </section>
  );
}
