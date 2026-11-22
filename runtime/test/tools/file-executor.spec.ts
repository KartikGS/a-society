import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import type { FlowRef, FlowRun } from '../../src/common/types.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { FileToolExecutor, staleWriteMessage } from '../../src/tools/file-executor.js';
import { sha256Hex } from '../../src/common/file-content.js';

const PROJECT_NAMESPACE = 'project';
const tempDirs = new Set<string>();

function makeTempWorkspace(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-executor-test-'));
  tempDirs.add(dir);
  setWorkspaceRoot(dir);
  return dir;
}

function flowRef(flowId = 'flow-1', projectNamespace = PROJECT_NAMESPACE): FlowRef {
  return { projectNamespace, flowId };
}

function makeExecutor(workspaceRoot: string, ref = flowRef()): FileToolExecutor {
  fs.mkdirSync(path.join(workspaceRoot, ref.projectNamespace), { recursive: true });
  return new FileToolExecutor(ref);
}

function projectPath(relativePath: string, projectNamespace = PROJECT_NAMESPACE): string {
  return path.join(projectNamespace, relativePath);
}

function seedFlowRun(
  workspaceRoot: string,
  ref = flowRef(),
  overrides: Partial<FlowRun> = {}
): FlowRun {
  setWorkspaceRoot(workspaceRoot);
  const recordFolderPath = getFlowRecordDir(ref);
  fs.mkdirSync(recordFolderPath, { recursive: true });
  const flowRun: FlowRun = {
    flowId: ref.flowId,
    workspaceRoot,
    projectNamespace: ref.projectNamespace,
    recordFolderPath,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    visitedNodeIds: ['owner-intake'],
    completedHandoffs: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    ...overrides,
  };
  SessionStore.saveFlowRun(flowRun, ref);
  return flowRun;
}

describe('file-executor', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  describe('read_file', () => {
    it('reads an existing file', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.writeFileSync(path.join(workspace, 'hello.txt'), 'hello world');

      const result = await executor.execute({ id: '1', name: 'read_file', input: { path: 'hello.txt' } });

      expect(result).toEqual({ isError: false, content: 'hello world' });
    });

    it('returns error for missing file', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);

      const result = await executor.execute({ id: '2', name: 'read_file', input: { path: 'nope.txt' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('no such file');
    });

    it('returns error when path is a directory', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.mkdirSync(path.join(workspace, 'adir'));

      const result = await executor.execute({ id: '3', name: 'read_file', input: { path: 'adir' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('directory');
    });

    it('returns error for path outside workspace', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);

      const result = await executor.execute({ id: '4', name: 'read_file', input: { path: '../outside.txt' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('outside the workspace root');
    });
  });

  describe('read_file_lines', () => {
    function setupLines() {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.writeFileSync(path.join(workspace, 'lines.txt'), ['alpha', 'beta', 'gamma', 'delta', 'epsilon'].join('\n'));
      return { workspace, executor };
    }

    it('returns requested line range with 1-based numbers', async () => {
      const { executor } = setupLines();

      const result = await executor.execute({ id: '1', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 2, end_line: 4 } });

      expect(result.isError).toBe(false);
      expect(result.content).toBe('2\tbeta\n3\tgamma\n4\tdelta');
    });

    it('clamps end_line to file length', async () => {
      const { executor } = setupLines();

      const result = await executor.execute({ id: '2', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 4, end_line: 999 } });

      expect(result.isError).toBe(false);
      expect(result.content).toBe('4\tdelta\n5\tepsilon');
    });

    it('reads a single line', async () => {
      const { executor } = setupLines();

      const result = await executor.execute({ id: '3', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 1, end_line: 1 } });

      expect(result.isError).toBe(false);
      expect(result.content).toBe('1\talpha');
    });

    it('returns error when start_line is less than 1', async () => {
      const { executor } = setupLines();

      const result = await executor.execute({ id: '4', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 0, end_line: 3 } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('start_line');
    });

    it('returns error when end_line is less than start_line', async () => {
      const { executor } = setupLines();

      const result = await executor.execute({ id: '5', name: 'read_file_lines', input: { path: 'lines.txt', start_line: 4, end_line: 2 } });

      expect(result.isError).toBe(true);
    });

    it('returns error for missing file', async () => {
      const { executor } = setupLines();

      const result = await executor.execute({ id: '6', name: 'read_file_lines', input: { path: 'nope.txt', start_line: 1, end_line: 3 } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('no such file');
    });
  });

  describe('edit_file', () => {
    it('replaces a unique string in the file', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.writeFileSync(path.join(workspace, projectPath('edit.txt')), 'foo bar baz');

      const result = await executor.execute({ id: '1', name: 'edit_file', input: { path: projectPath('edit.txt'), old_string: 'bar', new_string: 'QUX' } });

      expect(result.isError).toBe(false);
      expect(fs.readFileSync(path.join(workspace, projectPath('edit.txt')), 'utf8')).toBe('foo QUX baz');
    });

    it('preserves content outside the replaced region', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.writeFileSync(path.join(workspace, projectPath('preserve.txt')), 'line1\nline2\nline3\n');

      await executor.execute({ id: '2', name: 'edit_file', input: { path: projectPath('preserve.txt'), old_string: 'line2', new_string: 'LINE_TWO' } });

      expect(fs.readFileSync(path.join(workspace, projectPath('preserve.txt')), 'utf8')).toBe('line1\nLINE_TWO\nline3\n');
    });

    it('returns error when old_string is not found', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.writeFileSync(path.join(workspace, projectPath('notfound.txt')), 'hello world');

      const result = await executor.execute({ id: '3', name: 'edit_file', input: { path: projectPath('notfound.txt'), old_string: 'zzz', new_string: 'aaa' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('not found');
    });

    it('returns error when old_string appears more than once', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.writeFileSync(path.join(workspace, projectPath('ambiguous.txt')), 'foo foo foo');

      const result = await executor.execute({ id: '4', name: 'edit_file', input: { path: projectPath('ambiguous.txt'), old_string: 'foo', new_string: 'bar' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('more than once');
    });

    it('returns error for missing file', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);

      const result = await executor.execute({ id: '5', name: 'edit_file', input: { path: projectPath('ghost.txt'), old_string: 'x', new_string: 'y' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('no such file');
    });
  });

  describe('write_file', () => {
    it('creates a new file with content', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);

      const result = await executor.execute({ id: '1', name: 'write_file', input: { path: projectPath('new.txt'), content: 'created' } });

      expect(result.isError).toBe(false);
      expect(fs.readFileSync(path.join(workspace, projectPath('new.txt')), 'utf8')).toBe('created');
    });

    it('overwrites an existing file', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.writeFileSync(path.join(workspace, projectPath('overwrite.txt')), 'old content');

      await executor.execute({ id: '2', name: 'write_file', input: { path: projectPath('overwrite.txt'), content: 'new content' } });

      expect(fs.readFileSync(path.join(workspace, projectPath('overwrite.txt')), 'utf8')).toBe('new content');
    });

    it('creates intermediate directories', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);

      const result = await executor.execute({ id: '3', name: 'write_file', input: { path: projectPath('deep/nested/dir/file.txt'), content: 'deep' } });

      expect(result.isError).toBe(false);
      expect(fs.readFileSync(path.join(workspace, projectPath('deep/nested/dir/file.txt')), 'utf8')).toBe('deep');
    });

    it('reports byte count on success', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);

      const result = await executor.execute({ id: '4', name: 'write_file', input: { path: projectPath('bytes.txt'), content: 'abcde' } });

      expect(result.isError).toBe(false);
      expect(result.content).toContain('5 bytes');
    });
  });

  describe('list_directory', () => {
    function setupDirectory() {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.writeFileSync(path.join(workspace, 'b.txt'), '');
      fs.writeFileSync(path.join(workspace, 'a.txt'), '');
      fs.mkdirSync(path.join(workspace, 'subdir'));
      return { executor };
    }

    it('returns sorted JSON array of entries', async () => {
      const { executor } = setupDirectory();

      const result = await executor.execute({ id: '1', name: 'list_directory', input: { path: '.' } });

      expect(result.isError).toBe(false);
      expect(JSON.parse(result.content)).toEqual(['a.txt', 'b.txt', 'project/', 'subdir/']);
    });

    it('appends "/" to directory entries', async () => {
      const { executor } = setupDirectory();

      const result = await executor.execute({ id: '2', name: 'list_directory', input: { path: '.' } });

      expect(JSON.parse(result.content)).toContain('subdir/');
    });

    it('returns error for missing directory', async () => {
      const { executor } = setupDirectory();

      const result = await executor.execute({ id: '3', name: 'list_directory', input: { path: 'ghost' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('no such directory');
    });

    it('returns error when path is a file', async () => {
      const { executor } = setupDirectory();

      const result = await executor.execute({ id: '4', name: 'list_directory', input: { path: 'a.txt' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('not a directory');
    });
  });

  describe('sandbox', () => {
    const cases = [
      ['read_file', { path: '../../etc/passwd' }],
      ['read_file_lines', { path: '../../etc/passwd', start_line: 1, end_line: 1 }],
      ['edit_file', { path: '../../etc/passwd', old_string: 'x', new_string: 'y' }],
      ['write_file', { path: '../../evil.txt', content: 'bad' }],
      ['list_directory', { path: '../../' }],
    ] as const;

    for (const [toolName, input] of cases) {
      it(`${toolName} rejects path outside workspace`, async () => {
        const workspace = makeTempWorkspace();
        const executor = makeExecutor(workspace);

        const result = await executor.execute({ id: '1', name: toolName, input });

        expect(result.isError).toBe(true);
        expect(result.content).toContain('outside the workspace root');
      });
    }
  });

  describe('write restrictions', () => {
    function setupRestrictedWorkspace() {
      const workspace = makeTempWorkspace();
      const ref = flowRef('flow-1', 'my-project');
      const projectDir = path.join(workspace, ref.projectNamespace);
      const feedbackDir = path.join(workspace, '.a-society', 'feedback');
      const recordFolderPath = getFlowRecordDir(ref);
      fs.mkdirSync(projectDir, { recursive: true });
      fs.mkdirSync(feedbackDir, { recursive: true });
      fs.mkdirSync(recordFolderPath, { recursive: true });
      const executor = makeExecutor(workspace, ref);
      return { workspace, executor, recordFolderPath };
    }

    it('allows write_file inside project directory', async () => {
      const { executor } = setupRestrictedWorkspace();

      const result = await executor.execute({ id: '1', name: 'write_file', input: { path: 'my-project/notes.md', content: 'ok' } });

      expect(result.isError).toBe(false);
    });

    it('rejects writes to the legacy and new feedback folders by default', async () => {
      const { executor } = setupRestrictedWorkspace();

      for (const target of ['a-society/feedback/doc.md', '.a-society/feedback/doc.md']) {
        const result = await executor.execute({ id: '2', name: 'write_file', input: { path: target, content: 'ok' } });
        expect(result.isError).toBe(true);
        expect(result.content).toBe(
          `Error: path '${target}' is outside the permitted write area — writes are restricted to the project directory and the active record folder.`
        );
      }
    });

    it('allows the feedback folder only when passed as an extra write root, and names it in rejections', async () => {
      const { workspace } = setupRestrictedWorkspace();
      const executor = new FileToolExecutor(flowRef('flow-1', 'my-project'), {
        extraWriteRoots: [path.join(workspace, '.a-society', 'feedback')],
      });

      const ok = await executor.execute({ id: '2', name: 'write_file', input: { path: '.a-society/feedback/doc.md', content: 'ok' } });
      expect(ok.isError).toBe(false);

      const rejected = await executor.execute({ id: '3', name: 'write_file', input: { path: 'root.md', content: 'x' } });
      expect(rejected.content).toBe(
        `Error: path 'root.md' is outside the permitted write area — writes are restricted to the project directory, the active record folder, and .a-society/feedback.`
      );
    });

    it('scopes a dev-checkout project to its own folder and record folder', async () => {
      const workspace = makeTempWorkspace();
      const ref = flowRef('flow-dev', 'a-society-dev');
      fs.mkdirSync(path.join(workspace, 'a-society', 'feedback'), { recursive: true });
      fs.mkdirSync(path.join(workspace, 'a-society-dev'), { recursive: true });
      const recordFolderPath = getFlowRecordDir(ref);
      fs.mkdirSync(recordFolderPath, { recursive: true });
      const executor = new FileToolExecutor(ref);

      const write = (p: string) => executor.execute({ id: p, name: 'write_file', input: { path: p, content: 'ok' } });
      expect((await write('a-society-dev/x.md')).isError).toBe(false);
      expect((await write(path.relative(workspace, path.join(recordFolderPath, 'x.md')))).isError).toBe(false);
      expect((await write('a-society/x.md')).isError).toBe(true);
      expect((await write('a-society/feedback/x.md')).isError).toBe(true);
    });

    it('allows write_file inside active record folder', async () => {
      const { workspace, executor, recordFolderPath } = setupRestrictedWorkspace();

      const result = await executor.execute({
        id: '3',
        name: 'write_file',
        input: { path: path.relative(workspace, path.join(recordFolderPath, 'note.md')), content: 'ok' },
      });

      expect(result.isError).toBe(false);
    });

    it('blocks write_file outside permitted write roots', async () => {
      const { executor } = setupRestrictedWorkspace();

      const result = await executor.execute({ id: '4', name: 'write_file', input: { path: 'other-project/file.md', content: 'bad' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('outside the permitted write area');
    });

    it('blocks write_file at workspace root', async () => {
      const { executor } = setupRestrictedWorkspace();

      const result = await executor.execute({ id: '5', name: 'write_file', input: { path: 'root-file.md', content: 'bad' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('outside the permitted write area');
    });

    it('blocks edit_file outside permitted write roots', async () => {
      const { workspace, executor } = setupRestrictedWorkspace();
      const outsideFile = path.join(workspace, 'other-project', 'existing.md');
      fs.mkdirSync(path.dirname(outsideFile), { recursive: true });
      fs.writeFileSync(outsideFile, 'original content');

      const result = await executor.execute({ id: '6', name: 'edit_file', input: { path: 'other-project/existing.md', old_string: 'original', new_string: 'modified' } });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('outside the permitted write area');
      expect(fs.readFileSync(outsideFile, 'utf8')).toBe('original content');
    });

    it('allows read_file anywhere in workspace even with write restrictions', async () => {
      const { workspace, executor } = setupRestrictedWorkspace();
      const outsideFile = path.join(workspace, 'other-project', 'readable.md');
      fs.mkdirSync(path.dirname(outsideFile), { recursive: true });
      fs.writeFileSync(outsideFile, 'readable content');

      const result = await executor.execute({ id: '7', name: 'read_file', input: { path: 'other-project/readable.md' } });

      expect(result).toEqual({ isError: false, content: 'readable content' });
    });

    it('allows list_directory anywhere in workspace even with write restrictions', async () => {
      const { executor } = setupRestrictedWorkspace();

      const result = await executor.execute({ id: '8', name: 'list_directory', input: { path: '.' } });

      expect(result.isError).toBe(false);
    });
  });

  describe('workflow validation state', () => {
    it('rejects record workflow writes that remove live flow-state nodes', async () => {
      const workspace = makeTempWorkspace();
      const ref = flowRef();
      const recordWorkflowPath = path.join(getFlowRecordDir(ref), 'workflow.yaml');
      seedFlowRun(workspace, ref, { runningNodes: ['curator-work'] });
      const executor = makeExecutor(workspace, ref);
      const ownerOnlyWorkflow = 'workflow:\n  name: T\n  nodes:\n    - id: owner-intake\n      role: owner\n  edges: []\n';

      const result = await executor.execute({
        id: '1',
        name: 'write_file',
        input: {
          path: path.relative(workspace, recordWorkflowPath),
          content: ownerOnlyWorkflow,
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('workflow state references node "curator-work"');
    });

    it('uses schema validation without active flow-state constraints for canonical workflow writes', async () => {
      const workspace = makeTempWorkspace();
      const ref = flowRef();
      const canonicalWorkflowPath = path.join(workspace, 'project', 'a-docs', 'workflow', 'main.yaml');
      seedFlowRun(workspace, ref, { runningNodes: ['curator-work'] });
      const executor = makeExecutor(workspace, ref);
      const ownerOnlyWorkflow = 'workflow:\n  name: T\n  nodes:\n    - id: owner-intake\n      role: owner\n  edges: []\n';

      const result = await executor.execute({
        id: '2',
        name: 'write_file',
        input: {
          path: path.relative(workspace, canonicalWorkflowPath),
          content: ownerOnlyWorkflow,
        },
      });

      expect(result.isError).toBe(false);
    });
  });

  describe('unknown tool', () => {
    it('returns error for unknown tool name', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);

      const result = await executor.execute({ id: '1', name: 'nonexistent_tool', input: {} });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('unknown tool');
    });
  });

  describe('prepare and approval binding', () => {
    const NOT_FOUND = 'Error: old_string not found in file. Read the relevant section again to get the current content before retrying.';
    const AMBIGUOUS = 'Error: old_string appears more than once in the file — read the relevant section again and include more surrounding context to make it unique.';

    it('prepares a create with a null base', () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      const preparation = executor.prepare({ id: 'p1', name: 'write_file', input: { path: projectPath('new.md'), content: 'hello' } });
      expect(preparation).toMatchObject({ kind: 'ready', change: { path: projectPath('new.md'), baseBytes: null, baseHash: null, after: 'hello' } });
    });

    it('prepares an overwrite and an edit with the base hash of the file read', () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      const filePath = path.join(workspace, projectPath('doc.md'));
      fs.writeFileSync(filePath, 'alpha\nbeta\n');
      const hash = sha256Hex(fs.readFileSync(filePath));

      const overwrite = executor.prepare({ id: 'p2', name: 'write_file', input: { path: projectPath('doc.md'), content: 'gamma' } });
      expect(overwrite).toMatchObject({ kind: 'ready', change: { baseHash: hash, after: 'gamma' } });

      const edit = executor.prepare({ id: 'p3', name: 'edit_file', input: { path: projectPath('doc.md'), old_string: 'beta', new_string: 'delta' } });
      expect(edit).toMatchObject({ kind: 'ready', change: { baseHash: hash, after: 'alpha\ndelta\n' } });
      if (edit?.kind !== 'ready' || !edit.change) throw new Error('expected a change');
      expect(edit.change.baseBytes?.toString('utf8')).toBe('alpha\nbeta\n');
    });

    it('returns null where validate does not check, and ready without a change for reads', () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      expect(executor.prepare({ id: 'n1', name: 'run_command', input: { command: 'ls' } })).toBeNull();
      expect(executor.prepare({ id: 'n2', name: 'write_file', input: { content: 'x' } })).toBeNull();
      expect(executor.prepare({ id: 'n3', name: 'read_file', input: { path: 'anything.txt' } })).toEqual({ kind: 'ready', change: null });
    });

    it('keeps every validate error string unchanged through validate and prepare', () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.writeFileSync(path.join(workspace, projectPath('dup.md')), 'x x');
      const missing = path.join(workspace, projectPath('missing.md'));
      const cases: Array<[Record<string, unknown>, string, string]> = [
        [{ path: '../outside.md', content: 'x' }, 'write_file', `Error: path '../outside.md' is outside the workspace root and cannot be accessed.`],
        [{ path: 'root.md', content: 'x' }, 'write_file', `Error: path 'root.md' is outside the permitted write area — writes are restricted to the project directory and the active record folder.`],
        [{ path: projectPath('dup.md'), old_string: 'y', new_string: 'z' }, 'edit_file', NOT_FOUND],
        [{ path: projectPath('dup.md'), old_string: 'x', new_string: 'z' }, 'edit_file', AMBIGUOUS],
        [{ path: projectPath('missing.md'), old_string: 'x', new_string: 'z' }, 'edit_file', `Error: no such file: ${missing}`],
      ];
      for (const [input, name, message] of cases) {
        const call = { id: 'v', name, input };
        expect(executor.validate(call)).toEqual({ content: message, isError: true });
        expect(executor.prepare(call)).toEqual({ kind: 'rejected', content: message });
      }
    });

    it('writes when the binding still matches', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      const filePath = path.join(workspace, projectPath('doc.md'));
      fs.writeFileSync(filePath, 'one\ntwo\n');
      const call = { id: 'b1', name: 'edit_file', input: { path: projectPath('doc.md'), old_string: 'two', new_string: 'TWO' } };
      const preparation = executor.prepare(call);
      if (preparation?.kind !== 'ready' || !preparation.change) throw new Error('expected a change');

      const result = await executor.execute(call, undefined, { expectedBaseHash: preparation.change.baseHash });
      expect(result.isError).toBe(false);
      expect(fs.readFileSync(filePath, 'utf8')).toBe('one\nTWO\n');
    });

    it('refuses a bound edit when another line changed after prepare, though the edit itself still applies', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      const filePath = path.join(workspace, projectPath('doc.md'));
      fs.writeFileSync(filePath, 'one\ntwo\nthree\n');
      const call = { id: 'b2', name: 'edit_file', input: { path: projectPath('doc.md'), old_string: 'two', new_string: 'TWO' } };
      const preparation = executor.prepare(call);
      if (preparation?.kind !== 'ready' || !preparation.change) throw new Error('expected a change');

      // A different line changes: old_string is still unique, so only the hash can reject this.
      fs.writeFileSync(filePath, 'one\ntwo\nTHREE\n');
      expect(executor.validate(call)).toBeNull();

      const result = await executor.execute(call, undefined, { expectedBaseHash: preparation.change.baseHash });
      expect(result).toEqual({ content: staleWriteMessage(projectPath('doc.md')), isError: true });
      expect(fs.readFileSync(filePath, 'utf8')).toBe('one\ntwo\nTHREE\n');

      // Without the binding the same call applies.
      const unbound = await executor.execute(call);
      expect(unbound.isError).toBe(false);
      expect(fs.readFileSync(filePath, 'utf8')).toBe('one\nTWO\nTHREE\n');
    });

    it('refuses a bound create when the file appeared after prepare', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      const filePath = path.join(workspace, projectPath('late.md'));
      const call = { id: 'b3', name: 'write_file', input: { path: projectPath('late.md'), content: 'mine' } };
      expect(executor.prepare(call)).toMatchObject({ kind: 'ready', change: { baseHash: null } });
      fs.writeFileSync(filePath, 'theirs');

      const result = await executor.execute(call, undefined, { expectedBaseHash: null });
      expect(result).toEqual({ content: staleWriteMessage(projectPath('late.md')), isError: true });
      expect(fs.readFileSync(filePath, 'utf8')).toBe('theirs');
    });

    it('prepares no change for write_file to a directory, and execute fails as before', async () => {
      const workspace = makeTempWorkspace();
      const executor = makeExecutor(workspace);
      fs.mkdirSync(path.join(workspace, projectPath('folder')), { recursive: true });
      const call = { id: 'b4', name: 'write_file', input: { path: projectPath('folder'), content: 'x' } };
      expect(executor.prepare(call)).toEqual({ kind: 'ready', change: null });
      const result = await executor.execute(call);
      expect(result.isError).toBe(true);
      expect(result.content).toMatch(/^Error: could not write file:/);
    });
  });
});
