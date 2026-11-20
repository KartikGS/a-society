import { diffLines } from 'diff';

/** Unchanged lines kept visible next to each change. */
export const DIFF_CONTEXT_LINES = 3;
/** Edit-length budget for jsdiff; beyond it the diff is abandoned. */
export const DIFF_MAX_EDIT_LENGTH = 2000;

export type DiffLine = {
  kind: 'context' | 'added' | 'removed';
  oldLine: number | null;
  newLine: number | null;
  text: string;
};

export type DiffRow = DiffLine | { kind: 'collapsed'; lines: DiffLine[] };

export type LineDiffResult =
  | { kind: 'rows'; rows: DiffRow[]; added: number; removed: number }
  | { kind: 'too-many-changes' };

/** Splits a change value into lines; a trailing newline does not add an empty line. */
function splitLines(value: string): string[] {
  if (value === '') return [];
  const lines = value.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function flattenChanges(before: string, after: string): DiffLine[] | null {
  const changes = diffLines(before, after, { maxEditLength: DIFF_MAX_EDIT_LENGTH });
  if (changes === undefined) return null;

  const lines: DiffLine[] = [];
  let oldLine = 1;
  let newLine = 1;
  for (const change of changes) {
    for (const text of splitLines(change.value)) {
      if (change.added) {
        lines.push({ kind: 'added', oldLine: null, newLine: newLine++, text });
      } else if (change.removed) {
        lines.push({ kind: 'removed', oldLine: oldLine++, newLine: null, text });
      } else {
        lines.push({ kind: 'context', oldLine: oldLine++, newLine: newLine++, text });
      }
    }
  }
  return lines;
}

/** Turns one run of unchanged lines into rows, collapsing what is far from any change. */
function contextRunRows(run: DiffLine[], atStart: boolean, atEnd: boolean): DiffRow[] {
  const keep = DIFF_CONTEXT_LINES;
  if (atStart && atEnd) {
    return run.length <= 2 * keep ? run : [{ kind: 'collapsed', lines: run }];
  }
  if (atStart) {
    if (run.length <= keep) return run;
    return [{ kind: 'collapsed', lines: run.slice(0, run.length - keep) }, ...run.slice(run.length - keep)];
  }
  if (atEnd) {
    if (run.length <= keep) return run;
    return [...run.slice(0, keep), { kind: 'collapsed', lines: run.slice(keep) }];
  }
  if (run.length <= 2 * keep) return run;
  return [
    ...run.slice(0, keep),
    { kind: 'collapsed', lines: run.slice(keep, run.length - keep) },
    ...run.slice(run.length - keep),
  ];
}

/** Line diff of `before` (null = new file) against `after`, with distant unchanged lines collapsed. */
export function buildLineDiff(before: string | null, after: string): LineDiffResult {
  const lines = flattenChanges(before ?? '', after);
  if (lines === null) return { kind: 'too-many-changes' };

  const rows: DiffRow[] = [];
  let added = 0;
  let removed = 0;
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.kind !== 'context') {
      if (line.kind === 'added') added += 1;
      else removed += 1;
      rows.push(line);
      index += 1;
      continue;
    }
    const start = index;
    while (index < lines.length && lines[index].kind === 'context') index += 1;
    rows.push(...contextRunRows(lines.slice(start, index), start === 0, index === lines.length));
  }
  return { kind: 'rows', rows, added, removed };
}
