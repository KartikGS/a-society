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

test('buildBackwardPassPlan (Graph-based, Linear): verifies order and injection', () => {
  const result = buildBackwardPassPlan(LINEAR_NODES, LINEAR_EDGES, 'owner', IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);
  
  // Backward order: Curator (meta) -> Owner (meta) -> Owner (feedback)
  assert.strictEqual(result.length, 3);
  
  assert.strictEqual(result[0][0].role, 'curator');
  assert.deepStrictEqual(result[0][0].findingsRolesToInject, []); // Curator has no successor

  assert.strictEqual(result[1][0].role, 'owner');
  assert.deepStrictEqual(result[1][0].findingsRolesToInject, ['curator']); // Owner's successor is Curator (pos 1 > pos 0)

  assert.strictEqual(result[2][0].role, 'owner');
  assert.strictEqual(result[2][0].stepType, 'feedback');
});

test('buildBackwardPassPlan (Graph-based, Repeated Role): verifies worked trace §2.5', () => {
  const result = buildBackwardPassPlan(REPEATED_NODES, REPEATED_EDGES, 'owner', IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);
  
  // Distances from c2 (Curator):
  // c2: 0 -> Curator max=0 (initial)
  // o2: 1 -> Owner max=1
  // ta1: 2 -> TA max=2
  // c1: 3 -> Curator max=max(0,3)=3
  // o1: 4 -> Owner max=max(1,4)=4
  
  // Groups by max reverse distance:
  // 0: Final feedback Owner (separate loop)
  // 2: TA
  // 3: Curator
  // 4: Owner
  
  assert.strictEqual(result.length, 4);
  
  assert.strictEqual(result[0][0].role, 'technical-architect');
  assert.deepStrictEqual(result[0][0].findingsRolesToInject, []); // Successor o2 (Owner, pos 0) <= TA pos 2 -> Exclude

  assert.strictEqual(result[1][0].role, 'curator');
  assert.deepStrictEqual(result[1][0].findingsRolesToInject, ['technical-architect']); // Successor ta1 (TA, pos 2) > Curator pos 1 -> Include

  assert.strictEqual(result[2][0].role, 'owner');
  assert.deepStrictEqual(result[2][0].findingsRolesToInject, ['curator']); // Successor c1 (Curator, pos 1) > Owner pos 0 -> Include

  assert.strictEqual(result[3][0].role, 'owner');
  assert.strictEqual(result[3][0].stepType, 'feedback');
});

test('buildBackwardPassPlan (Parallel Mode): non-Owner roles run together before Owner and feedback', () => {
  const result = buildBackwardPassPlan(REPEATED_NODES, REPEATED_EDGES, 'owner', IMPROVEMENT_CHOICE_MODE.PARALLEL);
  
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[0].length, 2);
  
  const roles = result[0].map(e => e.role);
  assert.ok(roles.includes('curator'));
  assert.ok(roles.includes('technical-architect'));
  
  assert.ok(result[0].every(e => e.stepType === 'meta-analysis'));
  assert.ok(result[0].every(e => e.findingsRolesToInject.length === 0));
  
  assert.strictEqual(result[1].length, 1);
  assert.strictEqual(result[1][0].role, 'owner');
  assert.strictEqual(result[1][0].stepType, 'meta-analysis');
  assert.deepStrictEqual(result[1][0].findingsRolesToInject, []);
  
  assert.strictEqual(result[2].length, 1);
  assert.strictEqual(result[2][0].role, 'owner');
  assert.strictEqual(result[2][0].stepType, 'feedback');
  assert.deepStrictEqual(result[2][0].findingsRolesToInject, []);
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
  const result = buildBackwardPassPlan(LINEAR_NODES, LINEAR_EDGES, 'Admin', IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);
  const feedbackGroup = result[result.length - 1];
  assert.strictEqual(feedbackGroup.length, 1);
  assert.strictEqual(feedbackGroup[0].role, 'Admin');
  assert.strictEqual(feedbackGroup[0].stepType, 'feedback');
  assert.strictEqual(feedbackGroup[0].sessionInstruction, 'new-session');
  assert.deepStrictEqual(feedbackGroup[0].findingsRolesToInject, []);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
