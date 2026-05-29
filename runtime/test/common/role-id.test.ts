import assert from 'node:assert';
import { parseRoleIdentity, toKebabCaseRoleId } from '../../src/common/role-id.js';

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
  assert.deepStrictEqual(parseRoleIdentity('owner'), {
    instanceRoleId: 'owner',
    baseRoleId: 'owner',
    instanceNumber: undefined,
  });
});

test('parseRoleIdentity splits numeric role instances from base role authority', () => {
  assert.deepStrictEqual(parseRoleIdentity('owner_2'), {
    instanceRoleId: 'owner_2',
    baseRoleId: 'owner',
    instanceNumber: 2,
  });
  assert.deepStrictEqual(parseRoleIdentity('technical-architect_3'), {
    instanceRoleId: 'technical-architect_3',
    baseRoleId: 'technical-architect',
    instanceNumber: 3,
  });
});

test('parseRoleIdentity rejects display names and malformed ids', () => {
  assert.throws(() => parseRoleIdentity('Owner'), /Invalid role id/);
  assert.throws(() => parseRoleIdentity('Technical Architect'), /Invalid role id/);
  assert.throws(() => parseRoleIdentity('owner_0'), /Invalid role id/);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) process.exit(1);
