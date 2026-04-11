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
const artifactPath = path.join(tmpDir, 'test-artifact.md');
fs.writeFileSync(artifactPath, 'Artifact content here.');

test('buildForwardNodeEntryMessage: contains node header and non-startup distinction line', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    activeArtifacts: []
  });

  assert.ok(msg.includes('Workflow node: owner-gate (role: Owner)'));
  assert.ok(msg.includes('This is a workflow node entry, not a fresh role-orientation session.'));
  assert.ok(msg.includes('already loaded startup authority'));
  assert.ok(msg.includes('Proceed from these current node inputs.'));
});

test('buildForwardNodeEntryMessage: renders active artifact file block with content', () => {
  const relPath = path.relative(tmpDir, artifactPath);
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
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
    activeArtifacts: ['nonexistent/path.md']
  });

  assert.ok(msg.includes('(File does not exist yet)'));
});

test('buildForwardNodeEntryMessage: includes continuity section when entries provided', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    activeArtifacts: [],
    continuityEntries: [
      { nodeId: 'owner-intake', outputArtifactPath: 'records/flow/01-owner-brief.md' },
      { nodeId: 'owner-review', outputArtifactPath: null }
    ]
  });

  assert.ok(msg.includes('Role continuity from earlier nodes in this flow:'));
  assert.ok(msg.includes('- owner-intake -> records/flow/01-owner-brief.md'));
  assert.ok(msg.includes('- owner-review -> (no artifact recorded)'));
});

test('buildForwardNodeEntryMessage: omits continuity section when no entries', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    activeArtifacts: []
  });

  assert.ok(!msg.includes('Role continuity from earlier nodes in this flow:'));
});

test('buildForwardNodeEntryMessage: includes human input section when provided', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
    activeArtifacts: [],
    humanInput: 'Please focus on the security section.'
  });

  assert.ok(msg.includes('Human input:'));
  assert.ok(msg.includes('Please focus on the security section.'));
});

test('buildForwardNodeEntryMessage: omits human input section when not provided', () => {
  const msg = buildForwardNodeEntryMessage({
    nodeId: 'owner-gate',
    role: 'Owner',
    workspaceRoot: tmpDir,
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
    stepLabel: 'synthesis',
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
