import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
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
export function buildRoleContext(roleKey, projectRoot) {
    // roleKey format: "namespace__Role Name" — namespace is the project subfolder under projectRoot
    const parts = roleKey.split('__');
    if (parts.length !== 2) {
        throw new Error(`Invalid roleKey format: '${roleKey}'. Expected 'namespace__RoleName'.`);
    }
    const namespace = parts[0];
    const roleId = parts[1].toLowerCase().replace(/\s+/g, '-');
    const yamlPath = path.join(projectRoot, namespace, 'a-docs', 'roles', 'required-readings.yaml');
    if (!fs.existsSync(yamlPath)) {
        throw new Error(`required-readings.yaml not found at ${yamlPath} — cannot initialize session.`);
    }
    let config;
    try {
        const content = fs.readFileSync(yamlPath, 'utf8');
        config = yaml.load(content);
    }
    catch (error) {
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
