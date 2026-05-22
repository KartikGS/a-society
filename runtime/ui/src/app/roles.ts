import { parseRoleIdentity } from '../../../src/common/role-id.js';
import { SYSTEM_ROLE_KEY } from './constants';

export function toRoleKey(role: string | null | undefined): string | null {
  if (!role) return null;
  if (role === SYSTEM_ROLE_KEY) return SYSTEM_ROLE_KEY;
  return parseRoleIdentity(role).instanceRoleId;
}
