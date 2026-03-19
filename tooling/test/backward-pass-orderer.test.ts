import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { backwardPassOrderer } from '../src/backward-pass-orderer.js';
import type { WorkflowGraph } from '../src/backward-pass-orderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const TWO_ROLE_GRAPH: WorkflowGraph = {
  workflow: {
    name: 'Two Role',
    nodes: [
      { id: 'owner-phase-1', role: 'Owner' },
      { id: 'curator-phase-1', role: 'Curator' },
      { id: 'curator-phase-2-findings', role: 'Curator' },
      { id: 'owner-phase-2-findings', role: 'Owner' },
      { id: 'curator-phase-2-synthesis', role: 'Curator' },
    ],
    edges: [],
  }
};

const FOUR_ROLE_GRAPH: WorkflowGraph = {
  workflow: {
    name: 'Four Role',
    nodes: [
      { id: 'owner-1', role: 'Owner' },
      { id: 'developer-1', role: 'Tooling Developer' },
      { id: 'ta-1', role: 'Technical Architect' },
      { id: 'curator-synthesis', role: 'Curator' },
    ],
    edges: [],
  }
};

test('computeBackwardPassOrder: array index derivation reverses first occurrences', () => {
  const result = backwardPassOrderer.computeBackwardPassOrder(TWO_ROLE_GRAPH);
  // Expected first occurrences: Owner, Curator.
  // Reversed: Curator, Owner
  assert.deepStrictEqual(result, ['Curator', 'Owner']);
});

test('four-role workflow matches order: TA, Developer, Owner, Curator', () => {
  const result = backwardPassOrderer.computeBackwardPassOrder(FOUR_ROLE_GRAPH);
  // Expected first occurrences: Owner, Tooling Developer, Technical Architect, Curator.
  // Reversed: Curator, Technical Architect, Tooling Developer, Owner.
  assert.deepStrictEqual(result, ['Curator', 'Technical Architect', 'Tooling Developer', 'Owner']);
});

test('generateTriggerPrompts: handles synthesis present', () => {
  const prompts = backwardPassOrderer.generateTriggerPrompts(TWO_ROLE_GRAPH, 'Curator');
  const curationPrompt = prompts['Curator'];
  const ownerPrompt = prompts['Owner'];
  
  assert.ok(curationPrompt.includes('backward pass synthesis'), 'Curator prompt should include synthesis wording');
  assert.ok(ownerPrompt.includes('findings review'), 'Owner prompt should include findings wording');
  assert.ok(ownerPrompt.includes('process is complete'), 'Owner prompt should include process is complete');
});

test('generateTriggerPrompts: handles synthesis absent', () => {
  const prompts = backwardPassOrderer.generateTriggerPrompts(TWO_ROLE_GRAPH);
  const curationPrompt = prompts['Curator'];
  const ownerPrompt = prompts['Owner'];
  
  assert.ok(!curationPrompt.includes('backward pass synthesis'), 'Curator prompt should NOT include synthesis wording');
  assert.ok(!ownerPrompt.includes('backward pass synthesis'), 'Owner prompt should NOT include synthesis wording');
  assert.ok(curationPrompt.includes('hand off to Owner'), "Curator handoff is correct");
  assert.ok(ownerPrompt.includes('process is complete'), "Owner handoff is correct");
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
