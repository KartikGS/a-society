import { describe, expect, it } from 'vitest';
import { parseRoleIdentity, toKebabCaseRoleId } from '../../shared/role-id.js';

describe('role-id', () => {
  it('normalizes role names to kebab-case ids', () => {
    expect(toKebabCaseRoleId('Technical Architect')).toBe('technical-architect');
  });

  it('keeps unsuffixed roles as their own base role', () => {
    expect(parseRoleIdentity('owner')).toEqual({
      instanceRoleId: 'owner',
      baseRoleId: 'owner',
      instanceNumber: undefined,
    });
  });

  it('splits numeric role instances from base role authority', () => {
    expect(parseRoleIdentity('owner_2')).toEqual({
      instanceRoleId: 'owner_2',
      baseRoleId: 'owner',
      instanceNumber: 2,
    });
    expect(parseRoleIdentity('technical-architect_3')).toEqual({
      instanceRoleId: 'technical-architect_3',
      baseRoleId: 'technical-architect',
      instanceNumber: 3,
    });
  });

  it('rejects display names and malformed ids', () => {
    expect(() => parseRoleIdentity('Owner')).toThrow(/Invalid role id/);
    expect(() => parseRoleIdentity('Technical Architect')).toThrow(/Invalid role id/);
    expect(() => parseRoleIdentity('owner_0')).toThrow(/Invalid role id/);
  });
});
