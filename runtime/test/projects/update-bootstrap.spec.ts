import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { parseWorkflowFile } from '../../src/context/workflow-file.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import { bootstrapUpdateFlow } from '../../src/projects/update-bootstrap.js';
import { readVersionFrontmatter } from '../../src/framework-services/version-comparator.js';

const tempDirs = new Set<string>();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkRoot = path.resolve(__dirname, '../../..');

function currentVersion(): string {
  const version = readVersionFrontmatter(path.join(frameworkRoot, 'CHANGELOG.md'));
  if (!version) throw new Error('framework CHANGELOG.md has no a_society_version frontmatter');
  return version;
}

function createWorkspace(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-update-bootstrap-'));
  tempDirs.add(tmpDir);
  fs.symlinkSync(frameworkRoot, path.join(tmpDir, 'a-society'), 'dir');
  setWorkspaceRoot(tmpDir);
  return tmpDir;
}

function createInitializedProject(workspaceRoot: string, name: string, recordedVersion: string): string {
  const projectRoot = path.join(workspaceRoot, name);
  fs.mkdirSync(path.join(projectRoot, 'a-docs'), { recursive: true });
  fs.writeFileSync(
    path.join(projectRoot, 'a-docs', 'a-society-version.md'),
    `---\na_society_version: "${recordedVersion}"\n---\n# Version\n`,
  );
  return projectRoot;
}

describe('update-bootstrap', () => {
  afterEach(() => {
    for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true });
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  it('creates an Owner-only update flow with update context and update feedback context', () => {
    const workspaceRoot = createWorkspace();
    const projectName = 'behind-project';
    const projectRoot = createInitializedProject(workspaceRoot, projectName, '0.1.0');

    const result = bootstrapUpdateFlow(projectName);

    expect(result.flowRun).toMatchObject({
      projectNamespace: projectName,
      runningNodes: ['owner-intake'],
      status: 'running',
    });
    expect(result.flowRun.feedbackContext).toMatchObject({
      kind: 'update',
      updateFromVersion: '0.1.0',
      updateToVersion: currentVersion(),
    });
    expect(result.flowRun.recordFolderPath).toBe(
      getFlowRecordDir({ projectNamespace: projectName, flowId: result.flowRun.flowId }),
    );

    const workflowDoc = parseWorkflowFile(path.join(result.flowRun.recordFolderPath, 'workflow.yaml')) as any;
    expect(workflowDoc.workflow.nodes).toHaveLength(1);
    expect(workflowDoc.workflow.nodes[0]).toMatchObject({ id: 'owner-intake', role: 'owner' });
    expect(workflowDoc.workflow.nodes[0].work).toEqual(expect.arrayContaining([
      expect.stringContaining('# Runtime Project Update'),
      expect.stringContaining('# Runtime Update Brief'),
      expect.stringContaining('A-Society general index:'),
    ]));
    const brief = workflowDoc.workflow.nodes[0].work.find((g: string) => g.includes('# Runtime Update Brief'));
    expect(brief).toContain('Version this project conforms to: 0.1.0');
    expect(brief).toContain(`Target version: ${currentVersion()}`);

    // The update flow must not touch the project's a-docs.
    expect(readVersionFrontmatter(path.join(projectRoot, 'a-docs', 'a-society-version.md'))).toBe('0.1.0');
  });

  it('refuses to start when the project is already current', () => {
    const workspaceRoot = createWorkspace();
    createInitializedProject(workspaceRoot, 'current-project', currentVersion());

    expect(() => bootstrapUpdateFlow('current-project')).toThrow(/already up to date/);
  });

  it('refuses to start when the project has no a-docs', () => {
    const workspaceRoot = createWorkspace();
    fs.mkdirSync(path.join(workspaceRoot, 'bare-project'), { recursive: true });

    expect(() => bootstrapUpdateFlow('bare-project')).toThrow(/no a-docs/);
  });
});
