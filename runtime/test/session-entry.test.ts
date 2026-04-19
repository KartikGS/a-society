import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildOwnerBootstrapMessage,
  buildForwardNodeEntryMessage,
  buildImprovementEntryMessage
} from '../src/session-entry.js';

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

// --- buildOwnerBootstrapMessage ---

test('buildOwnerBootstrapMessage: contains the approved startup contract text', () => {
  const msg = buildOwnerBootstrapMessage();

  assert.ok(msg.includes('A fresh interactive Owner session has started.'));
  assert.ok(msg.includes('The runtime already loaded your required-reading authority files into context.'));
  assert.ok(msg.includes('summarize the project log'));
  assert.ok(msg.includes('type: prompt-human'));
  assert.ok(msg.includes('Do not spend this first turn rereading'));
});

test('buildOwnerBootstrapMessage: does not instruct rereading files by default', () => {
  const msg = buildOwnerBootstrapMessage();

  assert.ok(!msg.includes('Read the project log'));
  assert.ok(!msg.includes('Read $A_SOCIETY'));
});

// --- buildForwardNodeEntryMessage ---

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-session-entry-'));
const projectNamespace = 'test-project';
const projectRoot = path.join(tmpDir, projectNamespace);
const artifactPath = path.join(tmpDir, 'test-artifact.md');
fs.writeFileSync(artifactPath, 'Artifact content here.');
fs.mkdirSync(path.join(projectRoot, 'a-docs', 'indexes'), { recursive: true });
fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles'), { recursive: true });
fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles', 'node-doc'), { recursive: true });
fs.writeFileSync(
  path.join(projectRoot, 'a-docs', 'indexes', 'main.md'),
  `| \`$TEST_NODE_DOC\` | \`test-project/a-docs/roles/node-doc/main.md\` |\n`
);
fs.writeFileSync(
  path.join(projectRoot, 'a-docs', 'roles', 'node-doc', 'main.md'),
  'Node-specific reading content.'
);

test('buildForwardNodeEntryMessage: contains node header and first-node role-session framing', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    activeArtifacts: []
  });

  assert.ok(msg.includes('Workflow node: owner-gate (role: Owner)'));
  assert.ok(msg.includes('This is the first workflow node for this role in the current flow session.'));
  assert.ok(msg.includes('already loaded startup authority'));
  assert.ok(msg.includes('Proceed from these current node inputs.'));
});

test('buildForwardNodeEntryMessage: renders active artifact file block with content', () => {
  const relPath = path.relative(tmpDir, artifactPath);
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    activeArtifacts: [relPath]
  });

  assert.ok(msg.includes(`[FILE: ${relPath}]`));
  assert.ok(msg.includes('Artifact content here.'));
  assert.ok(msg.includes('Current task inputs:'));
});

test('buildForwardNodeEntryMessage: renders (File does not exist yet) for missing artifact', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    activeArtifacts: ['nonexistent/path.md']
  });

  assert.ok(msg.includes('(File does not exist yet)'));
});

test('buildForwardNodeEntryMessage: includes role-transition framing when previous node provided', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    activeArtifacts: [],
    entryMode: 'role-transition',
    previousNodeId: 'owner-intake'
  });

  assert.ok(msg.includes('continuing the same role-scoped flow session from workflow node owner-intake to owner-gate'));
  assert.ok(msg.includes('current task inputs below are authoritative for this node'));
});

test('buildForwardNodeEntryMessage: includes reopened-node framing when node re-enters', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    activeArtifacts: [],
    entryMode: 'reopened-node',
    previousNodeId: 'owner-gate'
  });

  assert.ok(msg.includes('workflow node has been reopened in the same role-scoped flow session'));
  assert.ok(msg.includes('may supersede earlier assumptions'));
});

test('buildForwardNodeEntryMessage: includes human input section when provided', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    activeArtifacts: [],
    humanInput: 'Please focus on the security section.'
  });

  assert.ok(msg.includes('Human input:'));
  assert.ok(msg.includes('Please focus on the security section.'));
});

test('buildForwardNodeEntryMessage: renders node contract fields and node-specific required reading on first entry', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    activeArtifacts: [],
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

test('buildForwardNodeEntryMessage: omits human input section when not provided', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    projectNamespace,
    activeArtifacts: []
  });

  assert.ok(!msg.includes('Human input:'));
});

// --- buildImprovementEntryMessage ---

const instructionFile = path.join(tmpDir, 'meta-analysis.md');
const findingsFile = path.join(tmpDir, 'findings.md');
fs.writeFileSync(instructionFile, 'Meta-analysis instructions content.');
fs.writeFileSync(findingsFile, 'Findings content here.');

test('buildImprovementEntryMessage: contains step label, record folder, and files', () => {
  const msg = buildImprovementEntryMessage({
    stepLabel: 'meta-analysis',
    recordFolderPath: '/project/records/flow',
    workspaceRoot: tmpDir,
    instructionFilePath: instructionFile,
    findingsFilePaths: [findingsFile],
    completionSignal: 'Emit a meta-analysis-complete handoff block.'
  });

  assert.ok(msg.includes('Backward pass meta-analysis.'));
  assert.ok(msg.includes('Record folder: /project/records/flow'));
  assert.ok(msg.includes('Meta-analysis instructions content.'));
  assert.ok(msg.includes('Findings content here.'));
  assert.ok(msg.includes('Emit a meta-analysis-complete handoff block.'));
});

test('buildImprovementEntryMessage: renders instruction file as [FILE: relpath] block', () => {
  const msg = buildImprovementEntryMessage({
    stepLabel: 'meta-analysis',
    recordFolderPath: '/project/records/flow',
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
    recordFolderPath: '/project/records/flow',
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
    recordFolderPath: '/project/records/flow',
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
