export const REQUIRED_ROLE_FILES = ['main.md', 'ownership.yaml', 'required-readings.yaml'] as const;

const ROLE_INSTANCE_ID_PATTERN = /^([a-z0-9]+(?:-[a-z0-9]+)*)(?:_([1-9][0-9]*))?$/;

export function toKebabCaseRoleId(roleName: string): string {
  return roleName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface RoleIdentity {
  instanceRoleId: string;
  baseRoleId: string;
  instanceNumber?: number;
}

export function parseRoleIdentity(roleId: string): RoleIdentity {
  const instanceRoleId = roleId.trim();
  const match = instanceRoleId.match(ROLE_INSTANCE_ID_PATTERN);
  if (!match) {
    throw new Error(
      `Invalid role id "${roleId}". Role ids must be lowercase kebab-case with an optional numeric instance suffix, e.g. "owner" or "owner_2".`
    );
  }

  return {
    instanceRoleId,
    baseRoleId: match[1],
    instanceNumber: match[2] ? Number(match[2]) : undefined,
  };
}
