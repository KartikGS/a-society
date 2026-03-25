import assert from 'node:assert';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  computeBackwardPassOrder,
  orderWithPromptsFromFile,
} from '../src/backward-pass-orderer.js';
import type { WorkflowPathEntry } from '../src/backward-pass-orderer.js';

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

console.log('\nbackward-pass-orderer');

const TWO_ROLE_PATH: WorkflowPathEntry[] = [
  { role: 'Owner', phase: 'Intake' },
  { role: 'Curator', phase: 'Phase 1' },
  { role: 'Curator', phase: 'Phase 2 Findings' },
  { role: 'Owner', phase: 'Phase 2 Review' },
];

const FOUR_ROLE_PATH: WorkflowPathEntry[] = [
  { role: 'Owner', phase: 'Intake' },
  { role: 'Tooling Developer', phase: 'Implementation' },
  { role: 'Technical Architect', phase: 'Review' },
  { role: 'Curator', phase: 'Registration' },
];

test('computeBackwardPassOrder: reverses first-occurrence roles and appends synthesis', () => {
  const result = computeBackwardPassOrder(TWO_ROLE_PATH, 'Curator');
  assert.deepStrictEqual(
    result.map((entry) => [entry.role, entry.stepType, entry.sessionInstruction]),
    [
      ['Curator', 'meta-analysis', 'existing-session'],
      ['Owner', 'meta-analysis', 'existing-session'],
      ['Curator', 'synthesis', 'new-session'],
    ],
  );
});

test('four-role workflow matches order: Curator, TA, Developer, Owner, Curator', () => {
  const result = computeBackwardPassOrder(FOUR_ROLE_PATH, 'Curator');
  assert.deepStrictEqual(
    result.map((entry) => entry.role),
    ['Curator', 'Technical Architect', 'Tooling Developer', 'Owner', 'Curator'],
  );
});

test('computeBackwardPassOrder: prompts preserve findings and synthesis patterns', () => {
  const result = computeBackwardPassOrder(TWO_ROLE_PATH, 'Curator');
  const firstEntry = result[0];
  const lastMetaEntry = result[1];
  const synthesisEntry = result[2];

  assert.ok(firstEntry.prompt.includes('Perform your backward pass meta-analysis'));



  assert.ok(firstEntry.prompt.includes('### Meta-Analysis Phase'));
  assert.ok(firstEntry.prompt.includes('hand off to Owner (meta-analysis)'));
  assert.ok(lastMetaEntry.prompt.includes('hand off to Curator (synthesis)'));
  assert.ok(synthesisEntry.prompt.includes('backward pass synthesis'));
  assert.ok(synthesisEntry.prompt.includes('### Synthesis Phase'));
  assert.ok(synthesisEntry.prompt.includes('Read: all findings artifacts in the record folder'));
});

test('orderWithPromptsFromFile: reads workflow.md from a record folder and ignores synthesis_role', () => {
  const recordFolder = fs.mkdtempSync(path.join(tmpdir(), 'backward-pass-orderer-'));
  const workflowFile = path.join(recordFolder, 'workflow.md');

  fs.writeFileSync(
    workflowFile,
    `---
workflow:
  synthesis_role: Owner (ignored)
  path:
    - role: Owner
      phase: Intake
    - role: Curator
      phase: Phase 1
    - role: Owner
      phase: Review
---

# Workflow
`,
    'utf8',
  );

  try {
    const result = orderWithPromptsFromFile(recordFolder, 'Curator');
    assert.deepStrictEqual(
      result.map((entry) => [entry.role, entry.stepType]),
      [
        ['Curator', 'meta-analysis'],
        ['Owner', 'meta-analysis'],
        ['Curator', 'synthesis'],
      ],
    );
  } finally {
    fs.rmSync(recordFolder, { recursive: true, force: true });
  }
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
