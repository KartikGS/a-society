import { describe, expect, it } from 'vitest';
import { buildLineDiff, DIFF_CONTEXT_LINES, type DiffRow } from '../../ui/src/app/line-diff.js';

function lines(count: number, prefix = 'line'): string {
  return Array.from({ length: count }, (_, i) => `${prefix} ${i + 1}`).join('\n') + '\n';
}

function rowsOf(before: string | null, after: string): DiffRow[] {
  const result = buildLineDiff(before, after);
  if (result.kind !== 'rows') throw new Error('expected rows');
  return result.rows;
}

describe('buildLineDiff', () => {
  it('numbers old and new lines from 1 and counts changes', () => {
    const result = buildLineDiff('a\nb\nc\n', 'a\nB\nc\nd\n');
    expect(result).toEqual({
      kind: 'rows',
      added: 2,
      removed: 1,
      rows: [
        { kind: 'context', oldLine: 1, newLine: 1, text: 'a' },
        { kind: 'removed', oldLine: 2, newLine: null, text: 'b' },
        { kind: 'added', oldLine: null, newLine: 2, text: 'B' },
        { kind: 'context', oldLine: 3, newLine: 3, text: 'c' },
        { kind: 'added', oldLine: null, newLine: 4, text: 'd' },
      ],
    });
  });

  it('treats a null base as a new file and adds no line for a trailing newline', () => {
    const result = buildLineDiff(null, 'one\ntwo\n');
    expect(result).toEqual({
      kind: 'rows',
      added: 2,
      removed: 0,
      rows: [
        { kind: 'added', oldLine: null, newLine: 1, text: 'one' },
        { kind: 'added', oldLine: null, newLine: 2, text: 'two' },
      ],
    });
  });

  it('collapses long unchanged runs between changes, keeping context on both sides', () => {
    const before = `start\n${lines(10)}end\n`;
    const after = `START\n${lines(10)}END\n`;
    const rows = rowsOf(before, after);
    const collapsed = rows.filter((row) => row.kind === 'collapsed');
    expect(collapsed).toHaveLength(1);
    expect(collapsed[0].kind === 'collapsed' && collapsed[0].lines).toHaveLength(10 - 2 * DIFF_CONTEXT_LINES);
    const contextCount = rows.filter((row) => row.kind === 'context').length;
    expect(contextCount).toBe(2 * DIFF_CONTEXT_LINES);
  });

  it('keeps a middle run of exactly twice the context uncollapsed', () => {
    const rows = rowsOf(`x\n${lines(2 * DIFF_CONTEXT_LINES)}y\n`, `X\n${lines(2 * DIFF_CONTEXT_LINES)}Y\n`);
    expect(rows.some((row) => row.kind === 'collapsed')).toBe(false);
  });

  it('collapses the start and end of the file beyond the context window', () => {
    const before = `${lines(8, 'head')}mid\n${lines(8, 'tail')}`;
    const after = `${lines(8, 'head')}MID\n${lines(8, 'tail')}`;
    const rows = rowsOf(before, after);
    expect(rows[0].kind).toBe('collapsed');
    expect(rows[0].kind === 'collapsed' && rows[0].lines).toHaveLength(8 - DIFF_CONTEXT_LINES);
    const last = rows[rows.length - 1];
    expect(last.kind).toBe('collapsed');
    expect(last.kind === 'collapsed' && last.lines).toHaveLength(8 - DIFF_CONTEXT_LINES);
  });

  it('does not collapse start or end runs within the context window', () => {
    const rows = rowsOf(`${lines(DIFF_CONTEXT_LINES)}x\n`, `${lines(DIFF_CONTEXT_LINES)}X\n`);
    expect(rows.some((row) => row.kind === 'collapsed')).toBe(false);
  });

  it('returns one collapsed row for a long unchanged file and plain rows for a short one', () => {
    const long = rowsOf(lines(20), lines(20));
    expect(long).toHaveLength(1);
    expect(long[0].kind).toBe('collapsed');

    const short = rowsOf(lines(2 * DIFF_CONTEXT_LINES), lines(2 * DIFF_CONTEXT_LINES));
    expect(short).toHaveLength(2 * DIFF_CONTEXT_LINES);
    expect(short.every((row) => row.kind === 'context')).toBe(true);
  });

  it('reports too-many-changes when the edit length is exceeded', () => {
    const before = Array.from({ length: 3000 }, (_, i) => `old ${i}`).join('\n');
    const after = Array.from({ length: 3000 }, (_, i) => `new ${i}`).join('\n');
    expect(buildLineDiff(before, after)).toEqual({ kind: 'too-many-changes' });
  });
});
