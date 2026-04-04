import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { resolveVariableFromIndex } from './paths.js';

export interface RoleContextEntry {
  requiredReadingVariables: string[];
}

/**
 * Derives the index variable name from a roleKey.
 * format: "namespace__Role Name" -> "$NAMESPACE_ROLE_NAME_ROLE"
 */
function roleKeyToIndexVariable(roleKey: string): string | null {
  const parts = roleKey.split('__');
  if (parts.length !== 2) return null;

  const namespacePart = parts[0].replace(/-/g, '_').toUpperCase();
  const roleNamePart = parts[1].split(' ').map(word => word.toUpperCase()).join('_');

  return `$${namespacePart}_${roleNamePart}_ROLE`;
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
export function buildRoleContext(roleKey: string, projectRoot: string): RoleContextEntry | null {
  const yamlPath = path.join(projectRoot, 'a-docs', 'roles', 'required-readings.yaml');
  
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
  
  // Extract role identifier from roleKey: "namespace__Role Name" -> "role name"
  const parts = roleKey.split('__');
  if (parts.length !== 2) {
    throw new Error(`Invalid roleKey format: '${roleKey}'. Expected 'namespace__RoleName'.`);
  }
  const roleId = parts[1].toLowerCase();

  const roleReading = (config.roles && Array.isArray(config.roles[roleId])) ? config.roles[roleId] : [];

  return {
    requiredReadingVariables: [...new Set([...universalReading, ...roleReading])]
  };
}

