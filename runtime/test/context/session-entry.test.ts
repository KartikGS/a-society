import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildForwardNodeEntryMessage,
  buildImprovementEntryMessage
} from '../../src/context/session-entry.js';
import { WorkflowGraph } from '../../src/orchestration/workflow-graph.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\nsession-entry');

// --- buildForwardNodeEntryMessage ---

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-session-entry-'));
const projectNamespace = 'test-project';
const projectRoot = path.join(tmpDir, projectNamespace);
const artifactPath = path.join(tmpDir, 'test-artifact.md');
fs.writeFileSync(artifactPath, 'Artifact content here.');
const backwardFeedbackPath = path.join(tmpDir, 'backward-feedback.md');
fs.writeFileSync(backwardFeedbackPath, 'Backward feedback content.');
fs.mkdirSync(path.join(projectRoot, 'a-docs', 'indexes'), { recursive: true });
fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles'), { recursive: true });
fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles', 'node-doc'), { recursive: true });
fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles', 'owner'), { recursive: true });
fs.writeFileSync(
  path.join(projectRoot, 'a-docs', 'indexes', 'main.md'),
  `| \`$TEST_NODE_DOC\` | \`test-project/a-docs/roles/node-doc/main.md\` |\n| \`$TEST_STARTUP_DOC\` | \`test-project/a-docs/roles/owner/startup.md\` |\n`
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

test('buildForwardNodeEntryMessage: contains node header and first-node role-session framing', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
  });

  assert.ok(msg.includes('Workflow node: owner-gate (role: owner)'));
  assert.ok(msg.includes('Node started at:'));
  assert.ok(msg.includes('This is the first workflow node for this role in the current flow session.'));
  assert.ok(msg.includes('already loaded startup authority'));
  assert.ok(msg.includes('Proceed from these current node inputs.'));
});

test('buildForwardNodeEntryMessage: renders active artifact file block with content', () => {
  const relPath = path.relative(tmpDir, artifactPath);
  const wf = new WorkflowGraph({ nodes: [{ id: 'source-node', role: 'source' }, { id: 'owner-gate', role: 'owner' }], edges: [{ from: 'source-node', to: 'owner-gate' }] });
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    wf,
    completedHandoffs: [],
    receivingHandoffSnapshot: [{ fromNodeId: 'source-node', artifacts: [relPath] }]
  });

  assert.ok(msg.includes('From predecessor source-node:'));
  assert.ok(msg.includes(`[FILE: ${relPath}]`));
  assert.ok(msg.includes('Artifact content here.'));
});

test('buildForwardNodeEntryMessage: renders (File does not exist yet) for missing artifact', () => {
  const wf = new WorkflowGraph({ nodes: [{ id: 'source-node', role: 'source' }, { id: 'owner-gate', role: 'owner' }], edges: [{ from: 'source-node', to: 'owner-gate' }] });
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    wf,
    completedHandoffs: [],
    receivingHandoffSnapshot: [{ fromNodeId: 'source-node', artifacts: ['nonexistent/path.md'] }]
  });

  assert.ok(msg.includes('(File does not exist yet)'));
});

test('buildForwardNodeEntryMessage: renders superseded forward artifact paths for backward correction context', () => {
  const forwardRelPath = path.relative(tmpDir, artifactPath);
  const backwardRelPath = path.relative(tmpDir, backwardFeedbackPath);
  const wf = new WorkflowGraph({
    nodes: [{ id: 'owner-intake', role: 'owner' }, { id: 'review', role: 'reviewer' }],
    edges: [{ from: 'owner-intake', to: 'review' }]
  });
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-intake',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    wf,
    completedHandoffs: [],
    receivingHandoffSnapshot: [{ fromNodeId: 'review', artifacts: [backwardRelPath] }],
    staleForwardArtifacts: [{ toNodeId: 'review', artifacts: [forwardRelPath] }]
  });

  assert.ok(msg.includes('From successor review'));
  assert.ok(msg.includes('Backward feedback content.'));
  assert.ok(msg.includes('previously queued forward artifact(s) to review are superseded'));
  assert.ok(msg.includes('Do not treat them as delivered current work'));
  assert.ok(msg.includes(`- ${forwardRelPath}`));
  assert.ok(!msg.includes(`[FILE: ${forwardRelPath}]`));
  assert.ok(!msg.includes('Artifact content here.'));
});

test('buildForwardNodeEntryMessage: includes role-transition framing when previous node provided', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    entryMode: 'role-transition',
    previousNodeId: 'owner-intake'
  });

  assert.ok(msg.includes('continuing the same role-scoped flow session from workflow node owner-intake to owner-gate'));
  assert.ok(msg.includes('current task inputs below are authoritative for this node'));
});

test('buildForwardNodeEntryMessage: includes reopened-node framing when node re-enters', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    entryMode: 'reopened-node',
    previousNodeId: 'owner-gate'
  });

  assert.ok(msg.includes('workflow node has been reopened in the same role-scoped flow session'));
  assert.ok(msg.includes('may supersede earlier assumptions'));
});

test('buildForwardNodeEntryMessage: includes human input section when provided', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    humanInput: 'Please focus on the security section.'
  });

  assert.ok(msg.includes('Human input:'));
  assert.ok(msg.includes('Please focus on the security section.'));
});

test('buildForwardNodeEntryMessage: renders node contract fields and node-specific required reading on first entry', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    nodeContext: {
      required_readings: ['$TEST_NODE_DOC'],
      guidance: ['Use the approved review checklist.'],
      inputs: ['Curator proposal artifact'],
      work: ['Apply the approval tests and decide Approved, Revise, or Rejected.'],
      outputs: ['Owner decision artifact'],
      transitions: ['Approved -> curator-implementation-registration'],
      notes: ['Approval is not completion.']
    }
  });

  assert.ok(msg.includes('Workflow node contract (first entry to this node only):'));
  assert.ok(msg.includes('Guidance:'));
  assert.ok(msg.includes('Use the approved review checklist.'));
  assert.ok(msg.includes('Declared inputs:'));
  assert.ok(msg.includes('Curator proposal artifact'));
  assert.ok(msg.includes('[FILE: $TEST_NODE_DOC'));
  assert.ok(msg.includes('Node-specific reading content.'));
});

test('buildForwardNodeEntryMessage: injects workflow contract when requested', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-intake',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    includeWorkflowContract: true
  });

  assert.ok(msg.includes('Runtime workflow contract:'));
  assert.ok(msg.includes('[FILE: a-society/runtime/contracts/workflow.md]'));
  assert.ok(msg.includes('A-Society Runtime Workflow Contract'));
});

test('buildForwardNodeEntryMessage: omits workflow contract by default', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
  });

  assert.ok(!msg.includes('Runtime workflow contract:'));
  assert.ok(!msg.includes('A-Society Runtime Workflow Contract'));
});

test('buildForwardNodeEntryMessage: omits human input section when not provided', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'owner',
    workspaceRoot: tmpDir,
    projectNamespace,
  });

  assert.ok(!msg.includes('Human input:'));
});

// --- buildImprovementEntryMessage ---

const instructionFile = path.join(tmpDir, 'meta-analysis.md');
const findingsFile = path.join(tmpDir, 'findings.md');
const activeRecordFolderPath = '/project/.a-society/state/project/flow/record';
fs.writeFileSync(instructionFile, 'Meta-analysis instructions content.');
fs.writeFileSync(findingsFile, 'Findings content here.');

test('buildImprovementEntryMessage: contains step label, record folder, and files', () => {
  const msg = buildImprovementEntryMessage({
    stepLabel: 'meta-analysis',
    recordFolderPath: activeRecordFolderPath,
    workspaceRoot: tmpDir,
    instructionFilePath: instructionFile,
    findingsFilePaths: [findingsFile],
    completionSignal: 'Emit a meta-analysis-complete handoff block.'
  });

  assert.ok(msg.includes('Backward pass meta-analysis.'));
  assert.ok(msg.includes(`Record folder: ${activeRecordFolderPath}`));
  assert.ok(msg.includes('Meta-analysis instructions content.'));
  assert.ok(msg.includes('Findings content here.'));
  assert.ok(msg.includes('Emit a meta-analysis-complete handoff block.'));
});

test('buildImprovementEntryMessage: renders instruction file as [FILE: relpath] block', () => {
  const msg = buildImprovementEntryMessage({
    stepLabel: 'meta-analysis',
    recordFolderPath: activeRecordFolderPath,
    workspaceRoot: tmpDir,
    instructionFilePath: instructionFile,
    findingsFilePaths: [],
    completionSignal: 'Done.'
  });

  const relInstruction = path.relative(tmpDir, instructionFile);
  assert.ok(msg.includes(`[FILE: ${relInstruction}]`));
});

test('buildImprovementEntryMessage: renders findings files as [FILE: relpath] blocks', () => {
  const msg = buildImprovementEntryMessage({
    stepLabel: 'feedback',
    recordFolderPath: activeRecordFolderPath,
    workspaceRoot: tmpDir,
    instructionFilePath: instructionFile,
    findingsFilePaths: [findingsFile],
    completionSignal: 'Done.'
  });

  const relFindings = path.relative(tmpDir, findingsFile);
  assert.ok(msg.includes(`[FILE: ${relFindings}]`));
  assert.ok(msg.includes('Findings content here.'));
});

test('buildImprovementEntryMessage: renders (File does not exist yet) for missing files', () => {
  const msg = buildImprovementEntryMessage({
    stepLabel: 'meta-analysis',
    recordFolderPath: activeRecordFolderPath,
    workspaceRoot: tmpDir,
    instructionFilePath: path.join(tmpDir, 'missing-instruction.md'),
    findingsFilePaths: [path.join(tmpDir, 'missing-findings.md')],
    completionSignal: 'Done.'
  });

  assert.strictEqual((msg.match(/\(File does not exist yet\)/g) || []).length, 2);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

fs.rmSync(tmpDir, { recursive: true, force: true });

if (failed > 0) process.exit(1);
