import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import type { FlowRef, FlowRun } from '../../src/common/types.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { FileToolExecutor } from '../../src/tools/file-executor.js';

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
      const feedbackDir = path.join(workspace, 'a-society', 'feedback');
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

    it('allows write_file inside A-Society feedback directory', async () => {
      const { executor } = setupRestrictedWorkspace();

      const result = await executor.execute({ id: '2', name: 'write_file', input: { path: 'a-society/feedback/doc.md', content: 'ok' } });

      expect(result.isError).toBe(false);
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
});
