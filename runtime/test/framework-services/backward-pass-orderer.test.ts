import assert from 'node:assert';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { IMPROVEMENT_CHOICE_MODE } from '../../src/common/protocol-constants.js';
import {
  buildBackwardPassPlan,
  deterministicFindingsFilePath,
  locateFindingsFiles,
  locateAllFindingsFiles,
} from '../../src/framework-services/backward-pass-orderer.js';
import type {
  WorkflowNode,
  WorkflowEdge,
} from '../../src/framework-services/backward-pass-orderer.js';

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

console.log('\nbackward-pass-orderer (Component 4 Redesign)');

const LINEAR_NODES: WorkflowNode[] = [
  { id: '1', role: 'owner' },
  { id: '2', role: 'curator' },
];
const LINEAR_EDGES: WorkflowEdge[] = [
  { from: '1', to: '2' },
];

const REPEATED_NODES: WorkflowNode[] = [
  { id: 'o1', role: 'owner' },
  { id: 'c1', role: 'curator' },
  { id: 'ta1', role: 'technical-architect' },
  { id: 'o2', role: 'owner' },
  { id: 'c2', role: 'curator' },
];
const REPEATED_EDGES: WorkflowEdge[] = [
  { from: 'o1', to: 'c1' },
  { from: 'c1', to: 'ta1' },
  { from: 'ta1', to: 'o2' },
  { from: 'o2', to: 'c2' },
];

function sortedEdges<T extends { from: string; to: string }>(edges: T[]): T[] {
  return [...edges].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
}

test('buildBackwardPassPlan (Graph-based, Linear): verifies edges and injection', () => {
  const result = buildBackwardPassPlan(LINEAR_NODES, LINEAR_EDGES, 'a-society-feedback', IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);

  assert.strictEqual(result.entries.length, 3);

  const curatorEntry = result.entries.find(entry => entry.role === 'curator');
  assert.ok(curatorEntry);
  assert.deepStrictEqual(curatorEntry.findingsRolesToInject, []);

  const ownerEntry = result.entries.find(entry => entry.role === 'owner' && entry.stepType === 'meta-analysis');
  assert.ok(ownerEntry);
  assert.deepStrictEqual(ownerEntry.findingsRolesToInject, ['curator']);

  const feedbackEntry = result.entries.at(-1)!;
  assert.strictEqual(feedbackEntry.role, 'a-society-feedback');
  assert.strictEqual(feedbackEntry.stepType, 'feedback');
  assert.deepStrictEqual(sortedEdges(result.edges), sortedEdges([
    { from: 'curator', to: 'owner' },
    { from: 'owner', to: 'a-society-feedback' },
  ]));
});

test('buildBackwardPassPlan (Graph-based, Repeated Role): verifies worked trace §2.5', () => {
  const result = buildBackwardPassPlan(REPEATED_NODES, REPEATED_EDGES, 'a-society-feedback', IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);

  // Repeated owner/curator nodes collapse to their first forward occurrence,
  // then the remaining role graph is reversed for findings flow.

  assert.strictEqual(result.entries.length, 4);

  const technicalArchitectEntry = result.entries.find(entry => entry.role === 'technical-architect');
  assert.ok(technicalArchitectEntry);
  assert.deepStrictEqual(technicalArchitectEntry.findingsRolesToInject, []);

  const curatorEntry = result.entries.find(entry => entry.role === 'curator');
  assert.ok(curatorEntry);
  assert.deepStrictEqual(curatorEntry.findingsRolesToInject, ['technical-architect']);

  const ownerEntry = result.entries.find(entry => entry.role === 'owner' && entry.stepType === 'meta-analysis');
  assert.ok(ownerEntry);
  assert.deepStrictEqual(ownerEntry.findingsRolesToInject, ['curator']);

  const feedbackEntry = result.entries.at(-1)!;
  assert.strictEqual(feedbackEntry.role, 'a-society-feedback');
  assert.strictEqual(feedbackEntry.stepType, 'feedback');
  assert.deepStrictEqual(sortedEdges(result.edges), sortedEdges([
    { from: 'technical-architect', to: 'curator' },
    { from: 'curator', to: 'owner' },
    { from: 'owner', to: 'a-society-feedback' },
  ]));
});

test('buildBackwardPassPlan (Parallel Mode): non-Owner roles run together before Owner and feedback', () => {
  const result = buildBackwardPassPlan(REPEATED_NODES, REPEATED_EDGES, 'a-society-feedback', IMPROVEMENT_CHOICE_MODE.PARALLEL);
  
  assert.strictEqual(result.entries.length, 4);
  
  const roles = result.entries.filter(e => e.stepType === 'meta-analysis').map(e => e.role);
  assert.ok(roles.includes('curator'));
  assert.ok(roles.includes('technical-architect'));
  
  assert.ok(result.entries
    .filter(e => e.stepType === 'meta-analysis' && e.role !== 'owner')
    .every(e => e.findingsRolesToInject.length === 0));
  
  const ownerEntry = result.entries.find(e => e.role === 'owner' && e.stepType === 'meta-analysis');
  assert.ok(ownerEntry);
  assert.deepStrictEqual(ownerEntry.findingsRolesToInject, ['curator', 'technical-architect']);
  
  const feedbackEntry = result.entries.at(-1)!;
  assert.strictEqual(feedbackEntry.role, 'a-society-feedback');
  assert.strictEqual(feedbackEntry.stepType, 'feedback');
  assert.deepStrictEqual(feedbackEntry.findingsRolesToInject, []);
  assert.deepStrictEqual(sortedEdges(result.edges), sortedEdges([
    { from: 'curator', to: 'owner' },
    { from: 'technical-architect', to: 'owner' },
    { from: 'owner', to: 'a-society-feedback' },
  ]));
});

test('buildBackwardPassPlan (Graph-based, Branching): preserves real role dependencies without depth barriers', () => {
  const nodes: WorkflowNode[] = [
    { id: 'owner-intake', role: 'owner' },
    { id: 'curator-research', role: 'curator' },
    { id: 'ta-design', role: 'technical-architect' },
    { id: 'curator-brief-a', role: 'curator_2' },
    { id: 'curator-brief-b', role: 'curator_3' },
    { id: 'fs-dev', role: 'framework-services-developer' },
    { id: 'orch-dev', role: 'orchestration-developer' },
    { id: 'ui-dev', role: 'ui-developer' },
    { id: 'ta-review-parallel', role: 'technical-architect' },
    { id: 'owner-gate', role: 'owner' },
    { id: 'curator-finalize', role: 'curator' },
    { id: 'owner-close', role: 'owner' },
  ];
  const edges: WorkflowEdge[] = [
    { from: 'owner-intake', to: 'curator-research' },
    { from: 'curator-research', to: 'ta-design' },
    { from: 'ta-design', to: 'curator-brief-a' },
    { from: 'ta-design', to: 'curator-brief-b' },
    { from: 'curator-brief-a', to: 'fs-dev' },
    { from: 'curator-brief-b', to: 'orch-dev' },
    { from: 'curator-brief-a', to: 'ui-dev' },
    { from: 'fs-dev', to: 'ta-review-parallel' },
    { from: 'orch-dev', to: 'ta-review-parallel' },
    { from: 'ui-dev', to: 'ta-review-parallel' },
    { from: 'ta-review-parallel', to: 'owner-gate' },
    { from: 'owner-gate', to: 'curator-finalize' },
    { from: 'curator-finalize', to: 'owner-close' },
  ];

  const result = buildBackwardPassPlan(nodes, edges, 'a-society-feedback', IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);

  assert.deepStrictEqual(sortedEdges(result.edges), sortedEdges([
    { from: 'curator', to: 'owner' },
    { from: 'technical-architect', to: 'curator' },
    { from: 'curator_2', to: 'technical-architect' },
    { from: 'curator_3', to: 'technical-architect' },
    { from: 'framework-services-developer', to: 'curator_2' },
    { from: 'ui-developer', to: 'curator_2' },
    { from: 'orchestration-developer', to: 'curator_3' },
    { from: 'owner', to: 'a-society-feedback' },
  ]));
  assert.deepStrictEqual(
    result.entries.find(entry => entry.role === 'curator_2')?.findingsRolesToInject,
    ['framework-services-developer', 'ui-developer']
  );
  assert.deepStrictEqual(
    result.entries.find(entry => entry.role === 'curator_3')?.findingsRolesToInject,
    ['orchestration-developer']
  );
});

test('locateFindingsFiles: finds deterministic role-id findings files', () => {
  const recordFolder = fs.mkdtempSync(path.join(tmpdir(), 'bp-order-files-'));
  const ownerFindingsPath = deterministicFindingsFilePath(recordFolder, 'owner');
  const ownerTwoFindingsPath = deterministicFindingsFilePath(recordFolder, 'owner_2');
  const technicalArchitectFindingsPath = deterministicFindingsFilePath(recordFolder, 'technical-architect');
  assert.strictEqual(path.basename(ownerTwoFindingsPath), 'owner_2-findings.md');
  fs.mkdirSync(path.dirname(ownerFindingsPath), { recursive: true });
  fs.writeFileSync(ownerFindingsPath, 'test');
  fs.writeFileSync(ownerTwoFindingsPath, 'test');
  fs.writeFileSync(technicalArchitectFindingsPath, 'test');
  fs.writeFileSync(path.join(recordFolder, 'random.txt'), 'test');

  try {
    const results = locateFindingsFiles(recordFolder, ['owner', 'owner_2', 'technical-architect', 'other-role']);
    assert.deepStrictEqual(results, [ownerFindingsPath, ownerTwoFindingsPath, technicalArchitectFindingsPath]);
  } finally {
    fs.rmSync(recordFolder, { recursive: true, force: true });
  }
});

test('locateFindingsFiles: returns [] for absent directory', () => {
  const results = locateFindingsFiles('/non/existent/path', ['owner']);
  assert.deepStrictEqual(results, []);
});

test('locateAllFindingsFiles: returns all deterministic findings files', () => {
  const recordFolder = fs.mkdtempSync(path.join(tmpdir(), 'bp-order-all-files-'));
  const ownerFindingsPath = deterministicFindingsFilePath(recordFolder, 'owner');
  const ownerTwoFindingsPath = deterministicFindingsFilePath(recordFolder, 'owner_2');
  const curatorFindingsPath = deterministicFindingsFilePath(recordFolder, 'curator');
  fs.mkdirSync(path.dirname(ownerFindingsPath), { recursive: true });
  fs.writeFileSync(ownerFindingsPath, 'owner');
  fs.writeFileSync(ownerTwoFindingsPath, 'owner 2');
  fs.writeFileSync(curatorFindingsPath, 'curator');

  try {
    const results = locateAllFindingsFiles(recordFolder);
    assert.deepStrictEqual(results, [curatorFindingsPath, ownerFindingsPath, ownerTwoFindingsPath]);
  } finally {
    fs.rmSync(recordFolder, { recursive: true, force: true });
  }
});

test('feedback entry has correct fields', () => {
  const result = buildBackwardPassPlan(LINEAR_NODES, LINEAR_EDGES, 'admin', IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);
  const feedbackEntry = result.entries.at(-1)!;
  assert.strictEqual(feedbackEntry.role, 'admin');
  assert.strictEqual(feedbackEntry.stepType, 'feedback');
  assert.strictEqual(feedbackEntry.sessionInstruction, 'new-session');
  assert.deepStrictEqual(feedbackEntry.findingsRolesToInject, []);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
