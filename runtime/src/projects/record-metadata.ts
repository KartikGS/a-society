import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { findWorkflowFilePath, parseWorkflowFile } from '../context/workflow-file.js';

const RECORD_METADATA_FILENAME = 'record.yaml';

const RESERVED_WORKFLOW_NAMES = new Set([
  'Draft Owner Intake',
  'Runtime Project Initialization',
]);

const RESERVED_WORKFLOW_SUMMARIES = new Set([
  'Runtime-created draft flow for the first Owner conversation.',
  'Runtime-created single-node Owner flow for project initialization.',
]);

export interface RecordMetadata {
  id: string;
  name?: string;
  summary?: string;
}

interface RecordMetadataDocument {
  record?: {
    id?: unknown;
    name?: unknown;
    summary?: unknown;
  };
}

function trimNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function formatTimestamp(now: Date): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}${milliseconds}Z`;
}

function metadataPath(recordFolderPath: string): string {
  return path.join(recordFolderPath, RECORD_METADATA_FILENAME);
}

function readWorkflowIdentity(recordFolderPath: string): { name?: string; summary?: string } | null {
  const workflowPath = findWorkflowFilePath(recordFolderPath);
  if (!workflowPath) return null;

  try {
    const doc = parseWorkflowFile(workflowPath) as { workflow?: { name?: unknown; summary?: unknown } };
    if (!doc?.workflow || typeof doc.workflow !== 'object') {
      return null;
    }

    return {
      name: trimNonEmptyString(doc.workflow.name),
      summary: trimNonEmptyString(doc.workflow.summary),
    };
  } catch {
    return null;
  }
}

function normalizeRecordMetadata(
  doc: RecordMetadataDocument | null,
  fallbackId: string,
): RecordMetadata {
  const id = trimNonEmptyString(doc?.record?.id) ?? fallbackId;
  const name = trimNonEmptyString(doc?.record?.name);
  const summary = trimNonEmptyString(doc?.record?.summary);

  return {
    id,
    ...(name ? { name } : {}),
    ...(summary ? { summary } : {}),
  };
}

export function recordMetadataFilename(): string {
  return RECORD_METADATA_FILENAME;
}

export function buildRecordId(now = new Date()): string {
  return `${formatTimestamp(now)}-${crypto.randomBytes(3).toString('hex')}`;
}

export function readRecordMetadata(recordFolderPath: string): RecordMetadata | null {
  const filePath = metadataPath(recordFolderPath);
  if (!fs.existsSync(filePath)) return null;

  try {
    const doc = yaml.load(fs.readFileSync(filePath, 'utf8')) as RecordMetadataDocument | null;
    return normalizeRecordMetadata(doc, path.basename(recordFolderPath));
  } catch {
    return null;
  }
}

export function writeRecordMetadata(recordFolderPath: string, metadata: RecordMetadata): void {
  const doc = {
    record: {
      id: metadata.id,
      name: metadata.name ?? null,
      summary: metadata.summary ?? null,
    },
  };

  fs.writeFileSync(
    metadataPath(recordFolderPath),
    yaml.dump(doc, { noRefs: true, lineWidth: 120 }),
    'utf8',
  );
}

export function syncRecordMetadataFromWorkflow(
  recordFolderPath: string,
  recordId: string,
): RecordMetadata {
  const existing = readRecordMetadata(recordFolderPath);
  const next: RecordMetadata = {
    id: existing?.id ?? recordId,
    ...(existing?.name ? { name: existing.name } : {}),
    ...(existing?.summary ? { summary: existing.summary } : {}),
  };

  const workflowIdentity = readWorkflowIdentity(recordFolderPath);
  if (!next.name && workflowIdentity?.name && !RESERVED_WORKFLOW_NAMES.has(workflowIdentity.name)) {
    next.name = workflowIdentity.name;
  }
  if (!next.summary && workflowIdentity?.summary && !RESERVED_WORKFLOW_SUMMARIES.has(workflowIdentity.summary)) {
    next.summary = workflowIdentity.summary;
  }

  const changed =
    !existing ||
    existing.id !== next.id ||
    existing.name !== next.name ||
    existing.summary !== next.summary;

  if (changed) {
    writeRecordMetadata(recordFolderPath, next);
  }

  return next;
}
