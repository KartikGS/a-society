import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { parseWorkflowFile } from '../../src/context/workflow-file.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import { bootstrapInitializationFlow } from '../../src/projects/initialization-bootstrap.js';
import { readRecordMetadata } from '../../src/projects/record-metadata.js';

const tempDirs = new Set<string>();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkRoot = path.resolve(__dirname, '../../..');

function createWorkspace(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-init-bootstrap-'));
  tempDirs.add(tmpDir);
  fs.symlinkSync(frameworkRoot, path.join(tmpDir, 'a-society'), 'dir');
  return tmpDir;
}

function workflowForRecord(recordFolderPath: string): any {
  return parseWorkflowFile(path.join(recordFolderPath, 'workflow.yaml')) as any;
}

describe('initialization-bootstrap', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
  });

  it('creates the greenfield project, scaffolds compulsory files, and creates a single-node Owner flow', () => {
    const workspaceRoot = createWorkspace();
    const projectName = 'greenfield-project';

    const result = bootstrapInitializationFlow(workspaceRoot, projectName, 'greenfield');
    const projectRoot = path.join(workspaceRoot, projectName);

    expect(fs.existsSync(projectRoot)).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, 'a-docs', 'agents.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, 'a-docs', 'roles', 'owner', 'main.md'))).toBe(true);
    expect(result.scaffoldResult.created.length).toBeGreaterThan(0);

    expect(result.flowRun).toMatchObject({
      projectNamespace: projectName,
      runningNodes: ['owner-intake'],
      status: 'running',
    });
    expect(result.flowRun.recordFolderPath).toBe(getFlowRecordDir(workspaceRoot, { projectNamespace: projectName, flowId: result.flowRun.flowId }));
    expect(path.basename(result.flowRun.recordFolderPath)).toBe('record');

    const workflowDoc = workflowForRecord(result.flowRun.recordFolderPath);
    expect(workflowDoc.workflow.nodes).toHaveLength(1);
    expect(workflowDoc.workflow.nodes[0]).toMatchObject({
      id: 'owner-intake',
      role: 'owner',
    });
    expect(workflowDoc.workflow.nodes[0].guidance).toEqual(expect.arrayContaining([
      expect.stringContaining('# Runtime Project Initialization'),
      expect.stringContaining('# Runtime Initialization Brief'),
      expect.stringContaining('workflow.yaml'),
      expect.stringContaining('A-Society general index:'),
    ]));
    const generalIndexGuidance = workflowDoc.workflow.nodes[0].guidance.find((entry: string) =>
      entry.includes('A-Society general index:')
    );
    expect(generalIndexGuidance).toContain('$GENERAL_OWNER_ROLE');
    expect(generalIndexGuidance).toContain('a-society/general/roles/owner/main.md');

    const metadata = readRecordMetadata(result.flowRun.recordFolderPath);
    expect(metadata).toBeTruthy();
    expect(metadata?.name).toBeUndefined();
    expect(metadata?.summary).toBeUndefined();
    expect(fs.readFileSync(path.join(result.flowRun.recordFolderPath, 'record.yaml'), 'utf8')).not.toContain('id:');

    const indexContent = fs.readFileSync(path.join(projectRoot, 'a-docs', 'indexes', 'main.md'), 'utf8');
    expect(indexContent).toContain('$GREENFIELD_PROJECT_INDEX');
    expect(indexContent).toContain('$GREENFIELD_PROJECT_OWNER_ROLE');

    const requiredReadings = fs.readFileSync(
      path.join(projectRoot, 'a-docs', 'roles', 'owner', 'required-readings.yaml'),
      'utf8'
    );
    expect(requiredReadings).toContain('$GREENFIELD_PROJECT_INDEX');
    expect(requiredReadings).toContain('$GREENFIELD_PROJECT_OWNER_ROLE');

    const briefContent = workflowDoc.workflow.nodes[0].guidance.find((entry: string) =>
      entry.includes('# Runtime Initialization Brief')
    );
    expect(fs.existsSync(path.join(result.flowRun.recordFolderPath, '00-runtime-initialization-brief.md'))).toBe(false);
    expect(briefContent).toContain('Mode: greenfield');
    expect(briefContent).not.toContain('## Runtime intent');
    expect(briefContent).toContain('## Mode-specific guidance');
    expect(briefContent).toContain('Gather the minimum project truth interactively.');
    expect(briefContent).not.toContain('Inspect existing non-`a-docs/` project files before asking questions.');
    expect(briefContent).not.toContain('## Scaffold summary');
    expect(briefContent).not.toContain('## Injected A-Society general index');
    expect(briefContent).not.toContain('## Required outcomes for this initialization flow');

    expect(workflowDoc.workflow.nodes[0].inputs).toBeUndefined();
    expect(workflowDoc.workflow.nodes[0].work).toBeUndefined();
    expect(workflowDoc.workflow.nodes[0].outputs).toBeUndefined();
    expect(workflowDoc.workflow.nodes[0].notes).toBeUndefined();
  });

  it('scaffolds an existing takeover project and embeds a takeover brief', () => {
    const workspaceRoot = createWorkspace();
    const projectName = 'takeover-project';
    const projectRoot = path.join(workspaceRoot, projectName);
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'README.md'), '# Existing project\n');

    const result = bootstrapInitializationFlow(workspaceRoot, projectName, 'takeover');

    expect(fs.existsSync(path.join(projectRoot, 'a-docs', 'agents.md'))).toBe(true);
    expect(result.scaffoldResult.created.length).toBeGreaterThan(0);

    const workflowDoc = workflowForRecord(result.flowRun.recordFolderPath);
    const briefContent = workflowDoc.workflow.nodes[0].guidance.find((entry: string) =>
      entry.includes('# Runtime Initialization Brief')
    );
    expect(fs.existsSync(path.join(result.flowRun.recordFolderPath, '00-runtime-initialization-brief.md'))).toBe(false);
    expect(briefContent).toContain('Mode: takeover');
    expect(briefContent).not.toContain('## Runtime intent');
    expect(briefContent).toContain('## Mode-specific guidance');
    expect(briefContent).toContain('Inspect existing non-`a-docs/` project files before asking questions.');
    expect(briefContent).not.toContain('Gather the minimum project truth interactively.');
    expect(briefContent).not.toContain('## Existing top-level project entries');
    expect(briefContent).not.toContain('README.md');
  });

  it('rejects a greenfield project when the target folder already exists', () => {
    const workspaceRoot = createWorkspace();
    const projectName = 'existing-greenfield-project';
    fs.mkdirSync(path.join(workspaceRoot, projectName), { recursive: true });

    expect(() => bootstrapInitializationFlow(workspaceRoot, projectName, 'greenfield'))
      .toThrow(/already exists in the workspace/);
  });
});
