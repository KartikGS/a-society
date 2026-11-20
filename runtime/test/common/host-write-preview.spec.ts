import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildHostWritePreview } from '../../src/common/host-write-preview.js';
import type { HostPermissionDenial } from '../../src/providers/host-agents/types.js';

// Claude Code 2.1.316 denial input shapes, probed 2026-11-02 (TA design §2).
const PROBED = [
  { tool_name: 'Edit', tool_use_id: 'toolu_018Mtr1AEPjquxtoZWRFrr5F', tool_input: { file_path: '/tmp/a2s-edit-probe-I9uR/a.txt', old_string: 'world', new_string: 'there', replace_all: false } },
  { tool_name: 'Write', tool_use_id: 'toolu_01GqdsjxhFNNiixUekwjzaJs', tool_input: { file_path: '/tmp/a2s-edit-probe-I9uR/b.txt', content: 'y' } },
];

let root: string;

/** A probed denial retargeted at a file in this test's workspace. */
function probed(index: 0 | 1, file: string, overrides: Record<string, unknown> = {}): HostPermissionDenial {
  const { tool_name, tool_input } = PROBED[index];
  return { toolName: tool_name, input: { ...tool_input, file_path: path.join(root, file), ...overrides } };
}

function edit(file: string, oldString: string, newString: string, extra: Record<string, unknown> = {}): HostPermissionDenial {
  return probed(0, file, { old_string: oldString, new_string: newString, ...extra });
}

function write(file: string, content: string): HostPermissionDenial {
  return probed(1, file, { content });
}

function preview(denials: HostPermissionDenial[], file: string) {
  return buildHostWritePreview(denials, path.join(root, file), root);
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'host-write-preview-'));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('buildHostWritePreview', () => {
  it('rebuilds a Write that creates a file', () => {
    expect(preview([write('b.txt', 'y')], 'b.txt')).toEqual({ path: 'b.txt', before: null, after: 'y', origin: 'host-attempt' });
  });

  it('rebuilds a Write that replaces a file', () => {
    fs.writeFileSync(path.join(root, 'b.txt'), 'x');
    expect(preview([write('b.txt', 'y')], 'b.txt')).toMatchObject({ before: 'x', after: 'y' });
  });

  it('rebuilds a unique Edit', () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'hello world\n');
    expect(preview([edit('a.txt', 'world', 'there')], 'a.txt')).toMatchObject({ before: 'hello world\n', after: 'hello there\n' });
  });

  it('rebuilds an Edit with replace_all', () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'a-a-a');
    expect(preview([edit('a.txt', 'a', 'b', { replace_all: true })], 'a.txt')).toMatchObject({ after: 'b-b-b' });
  });

  it('returns null for an Edit whose old_string is missing, ambiguous, or empty', () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'x x');
    expect(preview([edit('a.txt', 'y', 'z')], 'a.txt')).toBeNull();
    expect(preview([edit('a.txt', 'x', 'z')], 'a.txt')).toBeNull();
    expect(preview([edit('a.txt', '', 'z')], 'a.txt')).toBeNull();
  });

  it('inserts replacement patterns in new_string literally', () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'hello world');
    expect(preview([edit('a.txt', 'world', '$& $1 $$')], 'a.txt')).toMatchObject({ after: 'hello $& $1 $$' });
    expect(preview([edit('a.txt', 'o', '$&', { replace_all: true })], 'a.txt')).toMatchObject({ after: 'hell$& w$&rld' });
  });

  it('composes two Edits to one file in report order', () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'one two');
    expect(preview([edit('a.txt', 'one', '1'), edit('a.txt', '1 two', '1 2')], 'a.txt')).toMatchObject({ before: 'one two', after: '1 2' });
  });

  it('composes a Write then an Edit', () => {
    expect(preview([write('a.txt', 'draft text'), edit('a.txt', 'draft', 'final')], 'a.txt'))
      .toMatchObject({ before: null, after: 'final text' });
  });

  it('returns null when a MultiEdit or NotebookEdit targets the file', () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'hello world');
    const multi: HostPermissionDenial = { toolName: 'MultiEdit', input: { file_path: path.join(root, 'a.txt'), edits: [] } };
    const notebook: HostPermissionDenial = { toolName: 'NotebookEdit', input: { notebook_path: path.join(root, 'a.txt'), new_source: 'x' } };
    expect(preview([edit('a.txt', 'world', 'there'), multi], 'a.txt')).toBeNull();
    expect(preview([notebook], 'a.txt')).toBeNull();
  });

  it('returns null for a binary base', () => {
    fs.writeFileSync(path.join(root, 'a.bin'), Buffer.from([0x61, 0x00, 0x62]));
    expect(preview([write('a.bin', 'text')], 'a.bin')).toBeNull();
  });

  it('ignores denials for other files and non-write tools', () => {
    fs.writeFileSync(path.join(root, 'a.txt'), 'hello world');
    const bash: HostPermissionDenial = { toolName: 'Bash', input: { command: 'rm a.txt' } };
    expect(preview([write('other.txt', 'nope'), bash, edit('a.txt', 'world', 'there')], 'a.txt'))
      .toMatchObject({ before: 'hello world', after: 'hello there' });
    expect(preview([write('other.txt', 'nope')], 'a.txt')).toBeNull();
  });
});
