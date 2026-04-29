export function toKebabCaseRoleId(roleName: string): string {
  return roleName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface RoleIdentity {
  instanceRoleName: string;
  baseRoleName: string;
  instanceRoleId: string;
  baseRoleId: string;
  instanceNumber?: number;
}

export function parseRoleIdentity(roleName: string): RoleIdentity {
  const instanceRoleName = roleName.trim();
  const match = instanceRoleName.match(/^(.*)_(\d+)$/);
  const baseRoleName = match?.[1]?.trim() || instanceRoleName;
  const parsedInstanceNumber = match ? Number(match[2]) : undefined;

  return {
    instanceRoleName,
    baseRoleName,
    instanceRoleId: toKebabCaseRoleId(instanceRoleName),
    baseRoleId: toKebabCaseRoleId(baseRoleName),
    instanceNumber: parsedInstanceNumber,
  };
}
