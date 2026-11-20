import path from 'node:path';
import type { ProposedFileChange } from '../../shared/document-view.js';
import type { HostPermissionDenial } from '../providers/host-agents/types.js';
import { decodePreviewableText } from './file-content.js';
import { readFileBase, toProposedFileChange } from '../tools/file-change.js';

const HOST_WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const UNREBUILDABLE_TOOLS = new Set(['MultiEdit', 'NotebookEdit']);

function denialTarget(denial: HostPermissionDenial): unknown {
  return denial.input.file_path ?? denial.input.notebook_path;
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/** Applies one denied Write/Edit to the current text; null when it cannot be rebuilt. */
function applyDenial(denial: HostPermissionDenial, current: string | null): string | null {
  const { input } = denial;
  if (denial.toolName === 'Write') {
    return typeof input.content === 'string' ? input.content : null;
  }
  // Edit
  const oldString = input.old_string;
  const newString = input.new_string;
  const replaceAll = input.replace_all;
  if (typeof oldString !== 'string' || oldString === '' || typeof newString !== 'string') return null;
  if (replaceAll !== undefined && typeof replaceAll !== 'boolean') return null;
  if (current === null) return null;
  const occurrences = countOccurrences(current, oldString);
  if (replaceAll === true) {
    return occurrences >= 1 ? current.split(oldString).join(newString) : null;
  }
  if (occurrences !== 1) return null;
  const index = current.indexOf(oldString);
  return current.slice(0, index) + newString + current.slice(index + oldString.length);
}

/**
 * Rebuilds the change a host's denied writes to one file would make, applying every denial
 * for that file in report order to the file on disk. Null when any of them cannot be rebuilt.
 */
export function buildHostWritePreview(
  denials: HostPermissionDenial[],
  absolutePath: string,
  workspaceRoot: string
): ProposedFileChange | null {
  const selected = denials.filter((denial) => {
    if (!HOST_WRITE_TOOLS.has(denial.toolName)) return false;
    const target = denialTarget(denial);
    return typeof target === 'string' && path.resolve(workspaceRoot, target) === absolutePath;
  });
  if (selected.length === 0) return null;
  if (selected.some((denial) => UNREBUILDABLE_TOOLS.has(denial.toolName))) return null;

  const base = readFileBase(absolutePath);
  if (base.kind === 'unreadable') return null;
  let current: string | null = null;
  if (base.kind === 'present') {
    const decoded = decodePreviewableText(base.bytes);
    if (decoded.kind !== 'text') return null;
    current = decoded.text;
  }

  for (const denial of selected) {
    const next = applyDenial(denial, current);
    if (next === null) return null;
    current = next;
  }
  if (current === null) return null;

  return toProposedFileChange({
    path: path.relative(workspaceRoot, absolutePath),
    absolutePath,
    baseBytes: base.kind === 'present' ? base.bytes : null,
    baseHash: base.kind === 'present' ? base.hash : null,
    after: current,
  }, 'host-attempt');
}
