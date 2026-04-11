import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

function normalizeRoleId(roleName: string): string {
  return roleName.toLowerCase().replace(/\s+/g, '-');
}

export interface RoleContextEntry {
  requiredReadingVariables: string[];
}

/**
 * Dynamically builds the RoleContextEntry for a given role by reading
 * a-docs/roles/required-readings.yaml.
 * 
 * authoratative schema:
 * universal: [ $VAR_NAME, ... ]
 * roles:
 *   role_id: [ $VAR_NAME, ... ]
 * 
 * If the YAML file is missing, an error is thrown.
 */
export function buildRoleContext(
  projectNamespace: string,
  roleName: string,
  workspaceRoot: string
): RoleContextEntry | null {
  const roleId = normalizeRoleId(roleName);

  const yamlPath = path.join(workspaceRoot, projectNamespace, 'a-docs', 'roles', 'required-readings.yaml');

  if (!fs.existsSync(yamlPath)) {
    throw new Error(`required-readings.yaml not found at ${yamlPath} — cannot initialize session.`);
  }

  let config: any;
  try {
    const content = fs.readFileSync(yamlPath, 'utf8');
    config = yaml.load(content);
  } catch (error: any) {
    throw new Error(`Error parsing required-readings.yaml: ${error.message}`);
  }

  if (!config || typeof config !== 'object') {
    throw new Error(`Invalid required-readings.yaml format at ${yamlPath}`);
  }

  const universalReading = Array.isArray(config.universal) ? config.universal : [];

  const roleReading = (config.roles && Array.isArray(config.roles[roleId])) ? config.roles[roleId] : [];

  return {
    requiredReadingVariables: [...new Set([...universalReading, ...roleReading])]
  };
}
