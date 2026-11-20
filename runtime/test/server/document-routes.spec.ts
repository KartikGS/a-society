import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import type { FlowRef, FlowRun } from '../../src/common/types.js';
import { DOCUMENT_VIEW_MAX_BYTES, parseDocumentView } from '../../shared/document-view.js';
import type { ConsentChangePreviewRef, ProposedFileChange } from '../../shared/document-view.js';
import { EXPIRED_CHANGE_PREVIEW_MESSAGE, readFlowDocument, registerDocumentRoutes } from '../../src/server/document-routes.js';
import type { FlowReadModel } from '../../src/server/flow-read-model.js';

interface MockResponse {
  statusCode: number;
  body: unknown;
  status(code: number): MockResponse;
  json(body: unknown): void;
}

function createMockResponse(): MockResponse {
  const response: MockResponse = {
    statusCode: 200,
    body: undefined,
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(body) {
      response.body = body;
    },
  };
  return response;
}

let workspaceRoot: string;
let flowRun: FlowRun;

function makeFlowRun(): FlowRun {
  const recordFolderPath = path.join(workspaceRoot, '.a-society', 'state', 'proj', 'flow-1', 'record');
  fs.mkdirSync(recordFolderPath, { recursive: true });
  fs.mkdirSync(path.join(workspaceRoot, 'proj'), { recursive: true });
  return {
    flowId: 'flow-1',
    workspaceRoot,
    projectNamespace: 'proj',
    recordFolderPath,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    visitedNodeIds: [],
    completedHandoffs: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
  };
}

const RECORD = '.a-society/state/proj/flow-1/record';

beforeEach(() => {
  workspaceRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'document-routes-')));
  flowRun = makeFlowRun();
});

afterEach(() => {
  fs.rmSync(workspaceRoot, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('readFlowDocument', () => {
  it('serves text files from the record folder and the project folder', () => {
    fs.writeFileSync(path.join(flowRun.recordFolderPath, '01-brief.md'), '# Brief\n');
    fs.writeFileSync(path.join(workspaceRoot, 'proj', 'notes.txt'), 'notes');
    expect(readFlowDocument(flowRun, `${RECORD}/01-brief.md`)).toEqual({ kind: 'file', path: `${RECORD}/01-brief.md`, content: '# Brief\n' });
    expect(readFlowDocument(flowRun, 'proj/notes.txt')).toEqual({ kind: 'file', path: 'proj/notes.txt', content: 'notes' });
    const absolute = path.join(workspaceRoot, 'proj', 'notes.txt');
    expect(readFlowDocument(flowRun, absolute)).toEqual({ kind: 'file', path: absolute, content: 'notes' });
  });

  it('refuses paths outside the roots before touching the disk', () => {
    fs.mkdirSync(path.join(workspaceRoot, 'proj-sibling'), { recursive: true });
    fs.writeFileSync(path.join(workspaceRoot, 'proj-sibling', 'x.md'), 'x');
    const existsSpy = vi.spyOn(fs, 'existsSync');
    for (const requested of ['proj/../secret.md', '/etc/hosts', 'proj-sibling/x.md', 'a-society/feedback/x.md']) {
      const view = readFlowDocument(flowRun, requested);
      expect(view).toEqual({
        kind: 'unavailable',
        path: requested,
        reason: 'outside-roots',
        message: `${requested} is outside this flow's record folder and project folder, so it cannot be shown.`,
      });
    }
    expect(existsSpy).not.toHaveBeenCalled();
    readFlowDocument(flowRun, 'proj/missing.md');
    expect(existsSpy).toHaveBeenCalled();
  });

  it('refuses a symlink inside the record folder that points outside the roots', () => {
    const outside = path.join(workspaceRoot, 'outside.md');
    fs.writeFileSync(outside, 'secret');
    fs.symlinkSync(outside, path.join(flowRun.recordFolderPath, 'link.md'));
    expect(readFlowDocument(flowRun, `${RECORD}/link.md`)).toMatchObject({ kind: 'unavailable', reason: 'outside-roots' });
  });

  it('reports missing files, directories, binary files, and empty paths', () => {
    expect(readFlowDocument(flowRun, 'proj/missing.md')).toEqual({
      kind: 'unavailable', path: 'proj/missing.md', reason: 'not-found', message: 'No file exists at proj/missing.md.',
    });
    fs.mkdirSync(path.join(workspaceRoot, 'proj', 'dir'));
    expect(readFlowDocument(flowRun, 'proj/dir')).toEqual({
      kind: 'unavailable', path: 'proj/dir', reason: 'not-a-file', message: 'proj/dir is not a file.',
    });
    fs.writeFileSync(path.join(workspaceRoot, 'proj', 'img.png'), Buffer.from([0x89, 0x50, 0x00, 0x47]));
    expect(readFlowDocument(flowRun, 'proj/img.png')).toEqual({
      kind: 'unavailable', path: 'proj/img.png', reason: 'binary', message: 'proj/img.png is not a text file, so it cannot be shown.',
    });
    expect(readFlowDocument(flowRun, '  ')).toEqual({
      kind: 'unavailable', path: '  ', reason: 'invalid-request', message: 'No file path was given.',
    });
  });

  it('reports files over the limit as too large from stat, without reading them', () => {
    const big = path.join(workspaceRoot, 'proj', 'big.md');
    fs.writeFileSync(big, Buffer.alloc(DOCUMENT_VIEW_MAX_BYTES + 1, 0x61));
    const readSpy = vi.spyOn(fs, 'readFileSync');
    const statSpy = vi.spyOn(fs, 'statSync');
    expect(readFlowDocument(flowRun, 'proj/big.md')).toEqual({
      kind: 'unavailable', path: 'proj/big.md', reason: 'too-large', message: 'proj/big.md is larger than 512 KiB, so it cannot be shown.',
    });
    expect(statSpy).toHaveBeenCalled();
    expect(readSpy).not.toHaveBeenCalled();
  });
});

describe('document routes', () => {
  type Handler = (req: { params: Record<string, string>; query: Record<string, unknown> }, res: MockResponse) => void;

  function handlerFor(app: express.Express, routePath: string): Handler {
    const stack = (app as unknown as { _router: { stack: any[] } })._router.stack;
    const layer = stack.find((entry) => entry.route?.path === routePath && entry.route.methods.get);
    if (!layer) throw new Error(`Route GET ${routePath} was not registered.`);
    return layer.route.stack[layer.route.stack.length - 1].handle as Handler;
  }

  const params = { projectNamespace: 'proj', flowId: 'flow-1' };
  const ref: ConsentChangePreviewRef = { id: 'preview-1', changeKind: 'modify', origin: 'runtime-write' };
  const change: ProposedFileChange = { path: 'proj/a.md', before: 'a', after: 'b', origin: 'runtime-write' };

  function setup(readFlowRun: (ref: FlowRef) => FlowRun | null) {
    const app = express();
    const getChangePreview = vi.fn((_ref: FlowRef, previewId: string) => (previewId === 'preview-1' ? { ref, change } : null));
    registerDocumentRoutes(app, { flowReadModel: { readFlowRun } as unknown as FlowReadModel, getChangePreview });
    return {
      file: handlerFor(app, '/api/flows/:projectNamespace/:flowId/file'),
      preview: handlerFor(app, '/api/flows/:projectNamespace/:flowId/change-previews/:previewId'),
      getChangePreview,
    };
  }

  function call(handler: Handler, req: { params: Record<string, string>; query?: Record<string, unknown> }) {
    const res = createMockResponse();
    handler({ query: {}, ...req }, res);
    expect(parseDocumentView(res.body)).not.toBeNull();
    return res;
  }

  it('maps file results to the contract status codes', () => {
    fs.writeFileSync(path.join(workspaceRoot, 'proj', 'a.md'), 'A');
    fs.mkdirSync(path.join(workspaceRoot, 'proj', 'dir'));
    const { file } = setup(() => flowRun);
    const status = (query: Record<string, unknown>) => call(file, { params, query }).statusCode;
    expect(status({ path: 'proj/a.md' })).toBe(200);
    expect(status({})).toBe(400);
    expect(status({ path: ['a', 'b'] })).toBe(400);
    expect(status({ path: 'proj/missing.md' })).toBe(404);
    expect(status({ path: '/etc/hosts' })).toBe(403);
    expect(status({ path: 'proj/dir' })).toBe(422);
    expect(call(file, { params, query: {} }).body).toMatchObject({ path: '', reason: 'invalid-request' });
  });

  it('reports a missing flow as not found and an unreadable flow as 409', () => {
    const missing = setup(() => null);
    const res = call(missing.file, { params, query: { path: 'proj/a.md' } });
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({ reason: 'not-found', message: 'Flow proj/flow-1 was not found.' });

    const broken = setup(() => { throw new Error('bad flow.json'); });
    const brokenRes = call(broken.file, { params, query: { path: 'proj/a.md' } });
    expect(brokenRes.statusCode).toBe(409);
    expect(brokenRes.body).toMatchObject({ reason: 'unreadable', message: 'bad flow.json' });
  });

  it('serves a pending change preview and reports an unknown one as expired', () => {
    const { preview, getChangePreview } = setup(() => flowRun);
    const found = call(preview, { params: { ...params, previewId: 'preview-1' } });
    expect(found.statusCode).toBe(200);
    expect(found.body).toEqual({ kind: 'change', path: 'proj/a.md', changeKind: 'modify', origin: 'runtime-write', before: 'a', after: 'b' });
    expect(getChangePreview).toHaveBeenCalledWith(params, 'preview-1');

    const gone = call(preview, { params: { ...params, previewId: 'nope' } });
    expect(gone.statusCode).toBe(404);
    expect(gone.body).toEqual({ kind: 'unavailable', path: '', reason: 'expired', message: EXPIRED_CHANGE_PREVIEW_MESSAGE });
  });
});
