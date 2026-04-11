import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildRoleContext } from './registry.js';
import { resolveVariableFromIndex } from './paths.js';

export interface ContextBundleResult {
  bundleContent: string;
  contextHash: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_HANDOFF_CONTRACT_PATH = path.resolve(__dirname, '../HANDOFF-CONTRACT.md');
const RUNTIME_MANAGED_REQUIRED_READING_VARIABLES = new Set([
  '$A_SOCIETY_RUNTIME_HANDOFF_CONTRACT'
]);

export class ContextInjectionService {
  /**
   * Assembles the required-reading set and active artifact(s) into a single context string.
   */
  static buildContextBundle(
    roleKey: string,
    projectRoot: string,
    activeArtifactPath: string | string[]
  ): ContextBundleResult {
    let bundle = `=== A-SOCIETY RUNTIME CONTEXT BUNDLE ===\n\n`;
    
    // Extract role display name and project name from roleKey: "namespace__Role Name"
    const parts = roleKey.split('__');
    const projectName = parts[0];
    const roleDisplayName = parts[1] || roleKey;

    // 0a. Role announcement
    bundle += `You are the ${roleDisplayName} agent for ${projectName}. Below is information that will help you play your role.\n\n`;

    // 0b. Date injection
    const today = new Date().toISOString().split('T')[0];
    bundle += `Today's date is ${today}.\n\n`;

    // 0c. Runtime-owned session contracts
    bundle += `--- RUNTIME-MANAGED SESSION CONTRACTS ---\n`;
    if (fs.existsSync(RUNTIME_HANDOFF_CONTRACT_PATH)) {
      const content = fs.readFileSync(RUNTIME_HANDOFF_CONTRACT_PATH, 'utf8');
      bundle += `\n[FILE: runtime/HANDOFF-CONTRACT.md]\n`;
      bundle += `${content}\n\n`;
    } else {
      bundle += `\n[FILE ERROR: Could not read runtime/HANDOFF-CONTRACT.md]\n\n`;
    }

    // 1. Resolve and inject required reading
    const roleEntry = buildRoleContext(roleKey, projectRoot);

    if (roleEntry) {
      bundle += `--- MANDATORY CONTEXT LOADING FOR ${roleKey} ---\n`;
      for (const varName of roleEntry.requiredReadingVariables) {
        if (RUNTIME_MANAGED_REQUIRED_READING_VARIABLES.has(varName)) {
          continue;
        }
        const resolvedPath = resolveVariableFromIndex(varName, projectRoot);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
          const content = fs.readFileSync(resolvedPath, 'utf8');
          // Present it clearly as file content
          bundle += `\n[FILE: ${varName} (resolved to ${resolvedPath})]\n`;
          bundle += `${content}\n\n`;
        } else {
          bundle += `\n[FILE ERROR: Could not resolve or read ${varName}]\n`;
        }
      }
    } else {
      bundle += `--- UNKNOWN ROLE: ${roleKey}. No required reading available. ---\n\n`;
    }

    // 2. Inject active artifact(s)
    const paths = Array.isArray(activeArtifactPath) ? activeArtifactPath : (activeArtifactPath ? [activeArtifactPath] : []);
    const total = paths.length;

    for (let i = 0; i < paths.length; i++) {
      const p = paths[i];
      const fullPath = path.resolve(projectRoot, p);
      bundle += `--- ACTIVE WORKSPACE ARTIFACT${total > 1 ? ` (${i + 1} of ${total})` : ''} ---\n`;
      bundle += `[FILE: ${p}]\n`;
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        bundle += `${content}\n\n`;
      } else {
        bundle += `(File does not exist yet)\n\n`;
      }
    }

    // Compute hash
    const contextHash = crypto.createHash('sha256').update(bundle).digest('hex');

    return {
      bundleContent: bundle,
      contextHash
    };
  }
}
