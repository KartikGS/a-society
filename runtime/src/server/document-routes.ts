import fs from 'node:fs';
import path from 'node:path';
import type { Express, Request, Response } from 'express';
import {
  DOCUMENT_VIEW_MAX_BYTES,
  type ConsentChangePreviewRef,
  type DocumentUnavailableReason,
  type DocumentView,
  type ProposedFileChange,
} from '../../shared/document-view.js';
import type { FlowRef, FlowRun } from '../common/types.js';
import { decodePreviewableText, isPathWithin } from '../common/file-content.js';
import type { FlowReadModel } from './flow-read-model.js';

/**
 * Read-only document endpoints for the operator's in-app document view: pending consent
 * change previews, and text files inside a flow's record folder or project folder.
 */

const UNAVAILABLE_STATUS: Record<DocumentUnavailableReason, number> = {
  'invalid-request': 400,
  'not-found': 404,
  expired: 404,
  'outside-roots': 403,
  'not-a-file': 422,
  binary: 422,
  'too-large': 422,
  unreadable: 500,
};

export const EXPIRED_CHANGE_PREVIEW_MESSAGE =
  'This change preview is no longer available. The permission request was already answered or cancelled.';

function unavailable(p: string, reason: DocumentUnavailableReason, message: string): DocumentView {
  return { kind: 'unavailable', path: p, reason, message };
}

function unreadable(p: string, error: unknown): DocumentView {
  const message = error instanceof Error ? error.message : String(error);
  return unavailable(p, 'unreadable', `${p} could not be read: ${message}.`);
}

/** Resolves and reads a requested file for display, confined to the flow's record and project folders. */
export function readFlowDocument(flowRun: FlowRun, requestedPath: string): DocumentView {
  const p = requestedPath;
  if (p.trim() === '') return unavailable(p, 'invalid-request', 'No file path was given.');

  const absolute = path.isAbsolute(p) ? path.resolve(p) : path.resolve(flowRun.workspaceRoot, p);
  const roots = [flowRun.recordFolderPath, path.join(flowRun.workspaceRoot, flowRun.projectNamespace)]
    .map((root) => path.resolve(root));
  const outsideRoots = unavailable(
    p,
    'outside-roots',
    `${p} is outside this flow's record folder and project folder, so it cannot be shown.`
  );
  if (!roots.some((root) => isPathWithin(root, absolute))) return outsideRoots;

  try {
    if (!fs.existsSync(absolute)) return unavailable(p, 'not-found', `No file exists at ${p}.`);

    const real = fs.realpathSync(absolute);
    const realRoots = roots.filter((root) => fs.existsSync(root)).map((root) => fs.realpathSync(root));
    if (!realRoots.some((root) => isPathWithin(root, real))) return outsideRoots;

    const stat = fs.statSync(real);
    if (!stat.isFile()) return unavailable(p, 'not-a-file', `${p} is not a file.`);
    const tooLarge = unavailable(p, 'too-large', `${p} is larger than 512 KiB, so it cannot be shown.`);
    if (stat.size > DOCUMENT_VIEW_MAX_BYTES) return tooLarge;

    const decoded = decodePreviewableText(fs.readFileSync(real));
    if (decoded.kind === 'binary') return unavailable(p, 'binary', `${p} is not a text file, so it cannot be shown.`);
    if (decoded.kind === 'too-large') return tooLarge;
    return { kind: 'file', path: p, content: decoded.text };
  } catch (error) {
    return unreadable(p, error);
  }
}

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function flowRefFromParams(req: Request): FlowRef {
  return {
    projectNamespace: routeParam(req.params.projectNamespace),
    flowId: routeParam(req.params.flowId),
  };
}

function sendDocument(res: Response, view: DocumentView, status?: number): void {
  res.status(status ?? (view.kind === 'unavailable' ? UNAVAILABLE_STATUS[view.reason] : 200)).json(view);
}

export function registerDocumentRoutes(app: Express, deps: {
  flowReadModel: FlowReadModel;
  getChangePreview(ref: FlowRef, previewId: string): { ref: ConsentChangePreviewRef; change: ProposedFileChange } | null;
}): void {
  app.get('/api/flows/:projectNamespace/:flowId/change-previews/:previewId', (req, res) => {
    const preview = deps.getChangePreview(flowRefFromParams(req), routeParam(req.params.previewId));
    if (!preview) {
      sendDocument(res, unavailable('', 'expired', EXPIRED_CHANGE_PREVIEW_MESSAGE));
      return;
    }
    sendDocument(res, {
      kind: 'change',
      path: preview.change.path,
      changeKind: preview.ref.changeKind,
      origin: preview.ref.origin,
      before: preview.change.before,
      after: preview.change.after,
    });
  });

  app.get('/api/flows/:projectNamespace/:flowId/file', (req, res) => {
    const requested = req.query.path;
    if (typeof requested !== 'string') {
      sendDocument(res, unavailable('', 'invalid-request', 'No file path was given.'));
      return;
    }
    const ref = flowRefFromParams(req);
    let flowRun: FlowRun | null;
    try {
      flowRun = deps.flowReadModel.readFlowRun(ref);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendDocument(res, unavailable(requested, 'unreadable', message), 409);
      return;
    }
    if (!flowRun) {
      sendDocument(res, unavailable(
        requested,
        'not-found',
        `Flow ${ref.projectNamespace}/${ref.flowId} was not found.`
      ));
      return;
    }
    sendDocument(res, readFlowDocument(flowRun, requested));
  });
}
