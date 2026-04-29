import assert from 'node:assert';
import { parseRoleIdentity, toKebabCaseRoleId } from '../src/role-id.js';

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

console.log('\nrole-id');

test('toKebabCaseRoleId normalizes role names', () => {
  assert.strictEqual(toKebabCaseRoleId('Technical Architect'), 'technical-architect');
});

test('parseRoleIdentity keeps unsuffixed roles as their own base role', () => {
  assert.deepStrictEqual(parseRoleIdentity('Owner'), {
    instanceRoleName: 'Owner',
    baseRoleName: 'Owner',
    instanceRoleId: 'owner',
    baseRoleId: 'owner',
    instanceNumber: undefined,
  });
});

test('parseRoleIdentity splits numeric role instances from base role authority', () => {
  assert.deepStrictEqual(parseRoleIdentity('Owner_2'), {
    instanceRoleName: 'Owner_2',
    baseRoleName: 'Owner',
    instanceRoleId: 'owner-2',
    baseRoleId: 'owner',
    instanceNumber: 2,
  });
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) process.exit(1);
