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
 * Extracts YAML frontmatter from a markdown file.
 * Returns the parsed object or null if no valid frontmatter is found.
 */
function extractFrontmatter(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (lines[0].trim() !== '---') return null;
    
    let closingIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        closingIndex = i;
        break;
      }
    }
    
    if (closingIndex === -1) return null;
    
    const yamlContent = lines.slice(1, closingIndex).join('\n');
    return yaml.load(yamlContent);
  } catch (error: any) {
    console.error(`Error reading or parsing frontmatter in ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Dynamically builds the RoleContextEntry for a given role by reading agents.md
 * (for universal reading) and the role's specific file (for role reading).
 * 
 * Fields read:
 * - 'universal_required_reading' from agents.md
 * - 'required_reading' from the role file
 * 
 * The roleKey format 'namespace__RoleName' is load-bearing; roleKeys that do not
 * follow this convention will not resolve to a file.
 */
export function buildRoleContext(roleKey: string, projectRoot: string): RoleContextEntry | null {
  // 1. Resolve and read agents.md for universal reading
  const agentsPath = resolveVariableFromIndex('$A_SOCIETY_AGENTS', projectRoot);
  if (!agentsPath || !fs.existsSync(agentsPath)) {
    console.error(`Could not resolve $A_SOCIETY_AGENTS at ${agentsPath || '$A_SOCIETY_AGENTS'}`);
    return null;
  }

  const agentsFrontmatter = extractFrontmatter(agentsPath);
  if (!agentsFrontmatter || !Array.isArray(agentsFrontmatter.universal_required_reading)) {
    console.error(`agents.md at ${agentsPath} is missing valid 'universal_required_reading' frontmatter.`);
    return null;
  }

  const universalReading = agentsFrontmatter.universal_required_reading;

  // 2. Resolve and read role file for role-specific reading
  const roleVar = roleKeyToIndexVariable(roleKey);
  if (!roleVar) {
    console.error(`Invalid roleKey format: '${roleKey}'. Expected 'namespace__RoleName'.`);
    return null;
  }

  const rolePath = resolveVariableFromIndex(roleVar, projectRoot);
  if (!rolePath || !fs.existsSync(rolePath)) {
    console.error(`Could not resolve ${roleVar} for roleKey '${roleKey}' at ${rolePath || roleVar}`);
    return null;
  }

  const roleFrontmatter = extractFrontmatter(rolePath);
  if (!roleFrontmatter) {
    console.error(`Role file at ${rolePath} is missing valid frontmatter.`);
    return null;
  }

  const roleReading = Array.isArray(roleFrontmatter.required_reading) ? roleFrontmatter.required_reading : [];

  // 3. Merge and return
  return {
    requiredReadingVariables: [...new Set([...universalReading, ...roleReading])]
  };
}
