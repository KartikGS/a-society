// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { DocumentView } from '../../../ui/src/components/DocumentView';
import type { DocumentRequest, DocumentView as DocumentViewData } from '../../../shared/document-view.js';

expect.extend(matchers);

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- augmentation must mirror vitest's generic signature
  interface Assertion<T = any> {
    toHaveNoViolations(): void;
  }
}

const FLOW_REF = { projectNamespace: 'demo', flowId: 'f1' };
const CHANGE_REQUEST: DocumentRequest = { kind: 'change-preview', previewId: 'p1', path: 'notes.md' };
const FILE_REQUEST: DocumentRequest = { kind: 'file', path: 'record/brief.md', label: 'Handoff to ta-design' };

const fetchMock = vi.fn();

function respondWith(body: unknown, status = 200): void {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}

function change(overrides: Partial<Extract<DocumentViewData, { kind: 'change' }>> = {}): DocumentViewData {
  return { kind: 'change', path: 'notes.md', changeKind: 'modify', origin: 'runtime-write', before: 'a\nb\n', after: 'a\nc\n', ...overrides };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('DocumentView', () => {
  it('fetches the change preview and renders diff rows with the runtime-write note', async () => {
    respondWith(change());
    render(<DocumentView flowRef={FLOW_REF} request={CHANGE_REQUEST} onClose={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(await screen.findByText('1 added, 1 removed')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/flows/demo/f1/change-previews/p1');
    expect(screen.getByRole('heading', { name: 'Proposed change' })).toHaveFocus();
    expect(screen.getByText(/Allowing applies exactly this change/)).toBeInTheDocument();
    expect(screen.queryByText('New file')).not.toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Line changes' });
    expect(table.querySelector('.diff-row-removed')).toHaveTextContent('b');
    expect(table.querySelector('.diff-row-added')).toHaveTextContent('c');
  });

  it('marks new files and shows the host-attempt note', async () => {
    respondWith(change({ changeKind: 'create', origin: 'host-attempt', before: null, after: 'x\n' }));
    render(<DocumentView flowRef={FLOW_REF} request={CHANGE_REQUEST} onClose={vi.fn()} />);
    expect(await screen.findByText('New file')).toBeInTheDocument();
    expect(screen.getByText(/The agent tried to make this change and will make it again/)).toBeInTheDocument();
  });

  it('says when a change leaves the content the same, and expands collapsed lines', async () => {
    const same = Array.from({ length: 20 }, (_, i) => `l${i}`).join('\n');
    respondWith(change({ before: same, after: same }));
    render(<DocumentView flowRef={FLOW_REF} request={CHANGE_REQUEST} onClose={vi.fn()} />);
    expect(await screen.findByText('No changes: the file content stays the same.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show 20 unchanged lines' }));
    expect(screen.getByText('l19')).toBeInTheDocument();
  });

  it('falls back to the full new content when there are too many differences', async () => {
    const before = Array.from({ length: 3000 }, (_, i) => `old ${i}`).join('\n');
    const after = Array.from({ length: 3000 }, (_, i) => `new ${i}`).join('\n');
    respondWith(change({ before, after }));
    render(<DocumentView flowRef={FLOW_REF} request={CHANGE_REQUEST} onClose={vi.fn()} />);
    expect(await screen.findByText('Too many differences to show a line diff. The full new content is shown below.')).toBeInTheDocument();
    expect(screen.getByText(/new 2999/)).toBeInTheDocument();
  });

  it('renders markdown files through the sanitized pipeline', async () => {
    respondWith({ kind: 'file', path: 'record/brief.md', content: '# Brief\n\nSee [docs](https://example.com).<script>alert(1)</script>' });
    const { container } = render(<DocumentView flowRef={FLOW_REF} request={FILE_REQUEST} onClose={vi.fn()} />);
    expect(await screen.findByRole('heading', { name: 'Brief' })).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/flows/demo/f1/file?path=record%2Fbrief.md');
    expect(screen.getByRole('heading', { name: 'Handoff to ta-design' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute('target', '_blank');
    expect(container.querySelector('script')).toBeNull();
  });

  it('renders other files as plain text', async () => {
    respondWith({ kind: 'file', path: 'src/a.ts', content: '# not a heading' });
    render(<DocumentView flowRef={FLOW_REF} request={{ kind: 'file', path: 'src/a.ts', label: 'File' }} onClose={vi.fn()} />);
    expect(await screen.findByText('# not a heading')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'not a heading' })).not.toBeInTheDocument();
  });

  it('shows the unavailable message from the body whatever the status', async () => {
    respondWith({ kind: 'unavailable', path: 'x.md', reason: 'outside-roots', message: 'x.md is outside this flow.' }, 403);
    render(<DocumentView flowRef={FLOW_REF} request={FILE_REQUEST} onClose={vi.fn()} />);
    expect(await screen.findByText('x.md is outside this flow.')).toHaveAttribute('role', 'status');
  });

  it('reports an unreadable response and a network failure', async () => {
    respondWith({ nope: true }, 500);
    const { unmount } = render(<DocumentView flowRef={FLOW_REF} request={FILE_REQUEST} onClose={vi.fn()} />);
    expect(await screen.findByText('The server returned an unreadable document response.')).toBeInTheDocument();
    unmount();

    fetchMock.mockRejectedValue(new Error('offline'));
    render(<DocumentView flowRef={FLOW_REF} request={FILE_REQUEST} onClose={vi.fn()} />);
    expect(await screen.findByText('The document could not be loaded: offline')).toBeInTheDocument();
  });

  it('closes from the close button and from Escape inside the panel', async () => {
    respondWith(change());
    const onClose = vi.fn();
    render(<DocumentView flowRef={FLOW_REF} request={CHANGE_REQUEST} onClose={onClose} />);
    await screen.findByText('1 added, 1 removed');
    fireEvent.click(screen.getByRole('button', { name: 'Close document' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole('heading', { name: 'Proposed change' }), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('aborts the previous load when the request changes', async () => {
    respondWith(change());
    const { rerender } = render(<DocumentView flowRef={FLOW_REF} request={CHANGE_REQUEST} onClose={vi.fn()} />);
    const firstSignal = (fetchMock.mock.calls[0][1] as RequestInit).signal!;
    respondWith({ kind: 'file', path: 'record/brief.md', content: 'plain' });
    rerender(<DocumentView flowRef={FLOW_REF} request={{ kind: 'file', path: 'record/brief.txt', label: 'File' }} onClose={vi.fn()} />);
    expect(firstSignal.aborted).toBe(true);
    expect(await screen.findByText('plain')).toBeInTheDocument();
  });

  it('has no detectable a11y violations', async () => {
    respondWith(change());
    const { container } = render(<DocumentView flowRef={FLOW_REF} request={CHANGE_REQUEST} onClose={vi.fn()} />);
    await screen.findByText('1 added, 1 removed');
    expect(await axe(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } })).toHaveNoViolations();
  });
});
