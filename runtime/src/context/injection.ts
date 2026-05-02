import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildRoleContext } from './registry.js';
import { resolveVariableFromIndex } from './paths.js';
import { RUNTIME_MANAGED_REQUIRED_READING_VARIABLES } from './required-reading.js';
import { parseRoleIdentity } from '../common/role-id.js';

export interface ContextBundleResult {
  bundleContent: string;
  contextHash: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_HANDOFF_CONTRACT_PATH = path.resolve(__dirname, '../../contracts/handoff.md');


export class ContextInjectionService {
  /**
   * Assembles the stable runtime-owned context into a single system-prompt string.
   * Scope: role announcement, date, runtime handoff contract, required-reading files.
   * Does NOT include active artifacts or task-scoped inputs — those are delivered
   * as node-entry user-message content by the orchestrator and session-entry helpers.
   */
  static buildContextBundle(
    projectNamespace: string,
    roleName: string,
    workspaceRoot: string
  ): ContextBundleResult {
    const roleIdentity = parseRoleIdentity(roleName);
    let bundle = `=== A-SOCIETY RUNTIME CONTEXT BUNDLE ===\n\n`;

    // 0a. Role announcement
    bundle += `You are the ${roleIdentity.instanceRoleName} agent for ${projectNamespace}. Below is information that will help you play your role.\n`;
    if (roleIdentity.instanceRoleId !== roleIdentity.baseRoleId) {
      bundle += `This session uses the ${roleIdentity.baseRoleName} role authority and required readings while keeping a separate ${roleIdentity.instanceRoleName} session identity.\n`;
    }
    bundle += '\n';

    // 0b. Runtime-owned session contracts
    bundle += `--- RUNTIME-MANAGED SESSION CONTRACTS ---\n`;
    if (fs.existsSync(RUNTIME_HANDOFF_CONTRACT_PATH)) {
      const content = fs.readFileSync(RUNTIME_HANDOFF_CONTRACT_PATH, 'utf8');
      bundle += `\n[FILE: runtime/contracts/handoff.md]\n`;
      bundle += `${content}\n\n`;
    } else {
      bundle += `\n[FILE ERROR: Could not read runtime/contracts/handoff.md]\n\n`;
    }

    // 1. Resolve and inject required reading
    const roleEntry = buildRoleContext(projectNamespace, roleName, workspaceRoot);

    if (roleEntry) {
      bundle += `--- RUNTIME-LOADED REQUIRED READING FOR ${roleIdentity.instanceRoleName} IN ${projectNamespace} ---\n`;
      if (roleIdentity.instanceRoleId !== roleIdentity.baseRoleId) {
        bundle += `Loaded from base role ${roleIdentity.baseRoleName}.\n`;
      }
      bundle += `These files are already loaded into this session by the runtime. Use them directly. Do not spend your first turn rereading or re-listing them unless the current task specifically requires close inspection of one file.\n`;
      for (const varName of roleEntry.requiredReadingVariables) {
        if (RUNTIME_MANAGED_REQUIRED_READING_VARIABLES.has(varName)) {
          continue;
        }
        const resolvedPath = resolveVariableFromIndex(varName, workspaceRoot, projectNamespace);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
          const content = fs.readFileSync(resolvedPath, 'utf8');
          bundle += `\n[FILE: ${varName} (resolved to ${resolvedPath})]\n`;
          bundle += `${content}\n\n`;
        } else {
          bundle += `\n[FILE ERROR: Could not resolve or read ${varName}]\n`;
        }
      }
    } else {
      bundle += `--- UNKNOWN ROLE: ${roleIdentity.instanceRoleName} IN ${projectNamespace}. No required reading available. ---\n\n`;
    }

    // Compute hash
    const contextHash = crypto.createHash('sha256').update(bundle).digest('hex');

    return {
      bundleContent: bundle,
      contextHash
    };
  }
}
