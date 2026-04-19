import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { toKebabCaseRoleId } from './role-id.js';

export interface RoleContextEntry {
  requiredReadingVariables: string[];
}

/**
 * Dynamically builds the RoleContextEntry for a given role by reading
 * a-docs/roles/<role-id>/required-readings.yaml.
 *
 * Preferred schema:
 * required_readings: [ $VAR_NAME, ... ]
 *
 * Legacy schema fallback:
 * universal: [ $VAR_NAME, ... ]
 * roles:
 *   role_id: [ $VAR_NAME, ... ]
 */
export function buildRoleContext(
  projectNamespace: string,
  roleName: string,
  workspaceRoot: string
): RoleContextEntry | null {
  const roleId = toKebabCaseRoleId(roleName);
  const roleYamlPath = path.join(
    workspaceRoot,
    projectNamespace,
    'a-docs',
    'roles',
    roleId,
    'required-readings.yaml'
  );
  const legacyYamlPath = path.join(
    workspaceRoot,
    projectNamespace,
    'a-docs',
    'roles',
    'required-readings.yaml'
  );
  const yamlPath = fs.existsSync(roleYamlPath) ? roleYamlPath : legacyYamlPath;

  if (!fs.existsSync(yamlPath)) {
    throw new Error(
      `required-readings.yaml not found at ${roleYamlPath} ` +
      `or legacy path ${legacyYamlPath} — cannot initialize session.`
    );
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

  const directRoleReadings = Array.isArray(config.required_readings)
    ? config.required_readings
    : Array.isArray(config)
      ? config
      : null;

  if (directRoleReadings) {
    return {
      requiredReadingVariables: [...new Set(directRoleReadings)]
    };
  }

  const universalReading = Array.isArray(config.universal) ? config.universal : [];
  const roleReading = config.roles && Array.isArray(config.roles[roleId])
    ? config.roles[roleId]
    : [];

  return {
    requiredReadingVariables: [...new Set([...universalReading, ...roleReading])]
  };
}
