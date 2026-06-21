import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  buildForwardNodeEntryMessage,
  buildImprovementEntryMessage,
} from '../../src/context/session-entry.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { WorkflowGraph } from '../../shared/workflow-graph.js';

interface Fixture {
  tmpDir: string;
  projectNamespace: string;
  artifactPath: string;
  backwardFeedbackPath: string;
  instructionFile: string;
  findingsFile: string;
  activeRecordFolderPath: string;
}

let fixture: Fixture;

function createFixture(): Fixture {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-session-entry-'));
  const projectNamespace = 'test-project';
  const projectRoot = path.join(tmpDir, projectNamespace);
  const artifactPath = path.join(tmpDir, 'test-artifact.md');
  const backwardFeedbackPath = path.join(tmpDir, 'backward-feedback.md');
  const instructionFile = path.join(tmpDir, 'meta-analysis.md');
  const findingsFile = path.join(tmpDir, 'findings.md');

  fs.writeFileSync(artifactPath, 'Artifact content here.');
  fs.writeFileSync(backwardFeedbackPath, 'Backward feedback content.');
  fs.mkdirSync(path.join(projectRoot, 'a-docs', 'indexes'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles', 'node-doc'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles', 'owner'), { recursive: true });
  fs.writeFileSync(
    path.join(projectRoot, 'a-docs', 'indexes', 'main.md'),
    '| `$TEST_NODE_DOC` | `a-docs/roles/node-doc/main.md` |\n| `$TEST_STARTUP_DOC` | `a-docs/roles/owner/startup.md` |\n'
  );
  fs.writeFileSync(
    path.join(projectRoot, 'a-docs', 'roles', 'node-doc', 'main.md'),
    'Node-specific reading content.'
  );
  fs.writeFileSync(
    path.join(projectRoot, 'a-docs', 'roles', 'owner', 'required-readings.yaml'),
    'role: owner\nrequired_readings:\n  - $TEST_STARTUP_DOC\n'
  );
  fs.writeFileSync(
    path.join(projectRoot, 'a-docs', 'roles', 'owner', 'startup.md'),
    'Startup reading content that should not be re-injected.'
  );
  fs.writeFileSync(instructionFile, 'Meta-analysis instructions content.');
  fs.writeFileSync(findingsFile, 'Findings content here.');

  return {
    tmpDir,
    projectNamespace,
    artifactPath,
    backwardFeedbackPath,
    instructionFile,
    findingsFile,
    activeRecordFolderPath: '/project/.a-society/state/project/flow/record',
  };
}

describe('session-entry', () => {
  beforeEach(() => {
    fixture = createFixture();
    setWorkspaceRoot(fixture.tmpDir);
  });

  afterEach(() => {
    fs.rmSync(fixture.tmpDir, { recursive: true, force: true });
    clearWorkspaceRoot();
  });

  describe('buildForwardNodeEntryMessage', () => {
    it('contains node header', () => {
      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
      });

      expect(message).toContain('Node owner-gate started at:');
      expect(message).toContain('Proceed from these current node inputs.');
    });

    it('uses resumed label when isResume is true', () => {
      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        isResume: true,
      });

      expect(message).toContain('Node owner-gate resumed at:');
    });

    it('renders active artifact file block with content', () => {
      const relPath = path.relative(fixture.tmpDir, fixture.artifactPath);
      const workflow = new WorkflowGraph({
        nodes: [{ id: 'source-node', role: 'source' }, { id: 'owner-gate', role: 'owner' }],
        edges: [{ from: 'source-node', to: 'owner-gate' }],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        handoffContext: {
          wf: workflow,
          completedHandoffs: [],
          receivingHandoffSnapshot: [{ fromNodeId: 'source-node', artifacts: [relPath] }],
        },
      });

      expect(message).toContain('From predecessor source-node:');
      expect(message).toContain(`[FILE: ${relPath}]`);
      expect(message).toContain('Artifact content here.');
    });

    it('renders missing artifact marker', () => {
      const workflow = new WorkflowGraph({
        nodes: [{ id: 'source-node', role: 'source' }, { id: 'owner-gate', role: 'owner' }],
        edges: [{ from: 'source-node', to: 'owner-gate' }],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        handoffContext: {
          wf: workflow,
          completedHandoffs: [],
          receivingHandoffSnapshot: [{ fromNodeId: 'source-node', artifacts: ['nonexistent/path.md'] }],
        },
      });

      expect(message).toContain('(File does not exist yet)');
    });

    it('warns against reading pending handoffs from the record folder', () => {
      const workflow = new WorkflowGraph({
        nodes: [{ id: 'source-node', role: 'source' }, { id: 'owner-gate', role: 'owner' }],
        edges: [{ from: 'source-node', to: 'owner-gate' }],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        handoffContext: {
          wf: workflow,
          completedHandoffs: [],
        },
      });

      expect(message).toContain('Handoffs not yet received from:');
      expect(message).toContain('Do not search the record folder for these handoffs. Any matching files there may be stale; the runtime will inject each handoff here when it is ready.');
      expect(message).toContain('If you need one of these handoffs before you can proceed, emit await-handoff.');
      expect(message).toContain('- source-node');
    });

    it('renders superseded forward artifact paths for backward correction context', () => {
      const forwardRelPath = path.relative(fixture.tmpDir, fixture.artifactPath);
      const backwardRelPath = path.relative(fixture.tmpDir, fixture.backwardFeedbackPath);
      const workflow = new WorkflowGraph({
        nodes: [{ id: 'owner-intake', role: 'owner' }, { id: 'review', role: 'reviewer' }],
        edges: [{ from: 'owner-intake', to: 'review' }],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-intake',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        handoffContext: {
          wf: workflow,
          completedHandoffs: [],
          receivingHandoffSnapshot: [{ fromNodeId: 'review', artifacts: [backwardRelPath] }],
          staleForwardArtifacts: [{ toNodeId: 'review', artifacts: [forwardRelPath] }],
        },
      });

      expect(message).toContain('From successor review');
      expect(message).toContain('Backward feedback content.');
      expect(message).toContain('previously queued forward artifact(s) to review are superseded');
      expect(message).toContain('Do not treat them as delivered current work');
      expect(message).toContain(`- ${forwardRelPath}`);
      expect(message).not.toContain(`[FILE: ${forwardRelPath}]`);
      expect(message).not.toContain('Artifact content here.');
    });

    it('renders node work and node-specific required reading on first entry', () => {
      const workflow = new WorkflowGraph({
        nodes: [{
          id: 'owner-gate',
          role: 'owner',
          required_readings: ['$TEST_NODE_DOC'],
          work: ['Apply the approval tests and decide Approved, Revise, or Rejected.'],
        }],
        edges: [],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        handoffContext: { wf: workflow, completedHandoffs: [] },
      });

      expect(message).toContain('Node-specific instructions for node owner-gate:');
      expect(message).toContain('Work:');
      expect(message).toContain('Apply the approval tests and decide Approved, Revise, or Rejected.');
      expect(message).toContain('[FILE: $TEST_NODE_DOC');
      expect(message).toContain('Node-specific reading content.');
    });

    it('injects the human-collaborative directive when the node is flagged', () => {
      const workflow = new WorkflowGraph({
        nodes: [{
          id: 'owner-gate',
          role: 'owner',
          'human-colab': true,
          work: ['Decide with the human in the loop.'],
        }],
        edges: [],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        handoffContext: { wf: workflow, completedHandoffs: [] },
      });
      expect(message).toContain('human-collaborative node');
      expect(message).toContain('Keep the human in the decision loop');
      expect(message).toContain('surface the proposed decision before proceeding');
      expect(message).toContain('do not treat this node\'s work as final');
    });

    it('omits the human-collaborative directive by default', () => {
      const workflow = new WorkflowGraph({
        nodes: [{ id: 'owner-gate', role: 'owner', work: ['Just do the work.'] }],
        edges: [],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        handoffContext: { wf: workflow, completedHandoffs: [] },
      });
      expect(message).not.toContain('human-collaborative node');
    });

    it('injects workflow contract when node work references workflow authority', () => {
      const workflow = new WorkflowGraph({
        nodes: [{
          id: 'owner-intake',
          role: 'owner',
          work: ['Create or repair workflow.yaml using the active path.'],
        }],
        edges: [],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-intake',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        handoffContext: { wf: workflow, completedHandoffs: [] },
      });

      expect(message).toContain('Runtime workflow contract:');
      expect(message).toContain('[FILE: a-society/runtime/contracts/workflow.md]');
      expect(message).toContain('A-Society Runtime Workflow Contract');
    });

    it('omits workflow contract by default', () => {
      const workflow = new WorkflowGraph({
        nodes: [{ id: 'owner-gate', role: 'owner', work: ['Review the submitted artifact.'] }],
        edges: [],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        handoffContext: { wf: workflow, completedHandoffs: [] },
      });

      expect(message).not.toContain('Runtime workflow contract:');
      expect(message).not.toContain('A-Society Runtime Workflow Contract');
    });

    it('omits first-entry node directives on resume', () => {
      const workflow = new WorkflowGraph({
        nodes: [{
          id: 'owner-gate',
          role: 'owner',
          'human-colab': true,
          required_readings: ['$TEST_NODE_DOC'],
          work: ['Update workflow.yaml with the active path.'],
        }],
        edges: [],
      });

      const message = buildForwardNodeEntryMessage({
        nodeId: 'owner-gate',
        workspaceRoot: fixture.tmpDir,
        projectNamespace: fixture.projectNamespace,
        isResume: true,
        handoffContext: { wf: workflow, completedHandoffs: [] },
      });

      expect(message).not.toContain('human-collaborative node');
      expect(message).not.toContain('Runtime workflow contract:');
      expect(message).not.toContain('Node-specific instructions for node owner-gate:');
      expect(message).not.toContain('Node-specific reading content.');
    });
  });

  describe('buildImprovementEntryMessage', () => {
    it('contains step label, record folder, and files', () => {
      const message = buildImprovementEntryMessage({
        stepLabel: 'meta-analysis',
        recordFolderPath: fixture.activeRecordFolderPath,
        workspaceRoot: fixture.tmpDir,
        instructionFilePath: fixture.instructionFile,
        findingsFilePaths: [fixture.findingsFile],
        completionSignal: 'Emit a meta-analysis-complete handoff block.',
      });

      expect(message).toContain('Backward pass meta-analysis.');
      expect(message).toContain(`Record folder: ${fixture.activeRecordFolderPath}`);
      expect(message).toContain('Meta-analysis instructions content.');
      expect(message).toContain('Findings content here.');
      expect(message).toContain('Emit a meta-analysis-complete handoff block.');
    });

    it('renders instruction file as a relative file block', () => {
      const message = buildImprovementEntryMessage({
        stepLabel: 'meta-analysis',
        recordFolderPath: fixture.activeRecordFolderPath,
        workspaceRoot: fixture.tmpDir,
        instructionFilePath: fixture.instructionFile,
        findingsFilePaths: [],
        completionSignal: 'Done.',
      });

      expect(message).toContain(`[FILE: ${path.relative(fixture.tmpDir, fixture.instructionFile)}]`);
    });

    it('renders findings files as relative file blocks', () => {
      const message = buildImprovementEntryMessage({
        stepLabel: 'feedback',
        recordFolderPath: fixture.activeRecordFolderPath,
        workspaceRoot: fixture.tmpDir,
        instructionFilePath: fixture.instructionFile,
        findingsFilePaths: [fixture.findingsFile],
        completionSignal: 'Done.',
      });

      expect(message).toContain(`[FILE: ${path.relative(fixture.tmpDir, fixture.findingsFile)}]`);
      expect(message).toContain('Findings content here.');
    });

    it('renders missing markers for missing files', () => {
      const message = buildImprovementEntryMessage({
        stepLabel: 'meta-analysis',
        recordFolderPath: fixture.activeRecordFolderPath,
        workspaceRoot: fixture.tmpDir,
        instructionFilePath: path.join(fixture.tmpDir, 'missing-instruction.md'),
        findingsFilePaths: [path.join(fixture.tmpDir, 'missing-findings.md')],
        completionSignal: 'Done.',
      });

      expect(message.match(/\(File does not exist yet\)/g) ?? []).toHaveLength(2);
    });
  });
});
