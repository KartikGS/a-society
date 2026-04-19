export function toKebabCaseRoleId(roleName: string): string {
  return roleName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
