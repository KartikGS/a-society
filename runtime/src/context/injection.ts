import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildRoleContext } from './registry.js';
import { resolveVariableFromIndex } from './paths.js';
import { RUNTIME_MANAGED_REQUIRED_READING_VARIABLES } from './required-reading.js';
import { parseRoleIdentity } from '../../shared/role-id.js';
import type { FlowRef } from '../common/types.js';
import { resolveEffectiveCapabilities } from '../orchestration/capability-selection.js';
import { readSkillSummary } from '../framework-services/skills.js';

export interface ContextBundleResult {
  bundleContent: string;
  contextHash: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_HANDOFF_CONTRACT_PATH = path.resolve(__dirname, '../../contracts/handoff.md');
const RUNTIME_RECORDS_CONTRACT_PATH = path.resolve(__dirname, '../../contracts/records.md');

const RUNTIME_SESSION_CONTRACTS = [
  { label: 'runtime/contracts/handoff.md', filePath: RUNTIME_HANDOFF_CONTRACT_PATH },
  { label: 'runtime/contracts/records.md', filePath: RUNTIME_RECORDS_CONTRACT_PATH }
];


export class ContextInjectionService {
  /**
   * Assembles the stable runtime-owned context into a single system-prompt string.
   * Scope: role announcement, runtime session contracts, required-reading files.
   * Does NOT include active artifacts or task-scoped inputs — those are delivered
   * as node-entry user-message content by the orchestrator and session-entry helpers.
   */
  static buildContextBundle(
    projectNamespace: string,
    roleInstanceId: string,
    workspaceRoot: string,
    recordFolderPath: string,
    flowRef: FlowRef
  ): ContextBundleResult {
    const roleIdentity = parseRoleIdentity(roleInstanceId);
    let bundle = `=== A-SOCIETY RUNTIME CONTEXT BUNDLE ===\n\n`;

    // 0a. Role announcement
    bundle += `You are the ${roleIdentity.instanceRoleId} agent for ${projectNamespace}. Below is information that will help you play your role.\n`;
    bundle += `Record folder: ${recordFolderPath}\n`;
    if (roleIdentity.instanceRoleId !== roleIdentity.baseRoleId) {
      bundle += `This session uses the ${roleIdentity.baseRoleId} role authority and required readings while keeping a separate ${roleIdentity.instanceRoleId} session identity.\n`;
    }
    bundle += '\n';

    // 0b. Runtime-owned session contracts
    bundle += `--- RUNTIME-MANAGED SESSION CONTRACTS ---\n`;
    for (const contract of RUNTIME_SESSION_CONTRACTS) {
      if (fs.existsSync(contract.filePath)) {
        const content = fs.readFileSync(contract.filePath, 'utf8');
        bundle += `\n[FILE: ${contract.label}]\n`;
        bundle += `${content}\n\n`;
      } else {
        bundle += `\n[FILE ERROR: Could not read ${contract.label}]\n\n`;
      }
    }

    // 1. Resolve and inject required reading
    const roleEntry = buildRoleContext(projectNamespace, roleInstanceId, workspaceRoot);

    if (roleEntry) {
      bundle += `--- RUNTIME-LOADED REQUIRED READING FOR ${roleIdentity.instanceRoleId} IN ${projectNamespace} ---\n`;
      if (roleIdentity.instanceRoleId !== roleIdentity.baseRoleId) {
        bundle += `Loaded from base role ${roleIdentity.baseRoleId}.\n`;
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
      bundle += `--- UNKNOWN ROLE: ${roleIdentity.instanceRoleId} IN ${projectNamespace}. No required reading available. ---\n\n`;
    }

    const capabilities = resolveEffectiveCapabilities(workspaceRoot, flowRef, roleInstanceId);
    const selectedSkills = capabilities.skills
      .map((name) => readSkillSummary(workspaceRoot, name))
      .filter((skill): skill is NonNullable<typeof skill> => skill !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (selectedSkills.length > 0) {
      bundle += `--- AVAILABLE SKILLS FOR ${roleIdentity.instanceRoleId} ---\n`;
      bundle += `The following skills are available to you. Each lists a name and description. Read a skill's\n`;
      bundle += `SKILL.md with read_file only when the current task calls for it; do not read them pre-emptively.\n\n`;
      for (const skill of selectedSkills) {
        bundle += `[SKILL: ${skill.name}] ${skill.description}\n`;
        bundle += `  SKILL.md: ${skill.skillMdPath}\n`;
      }
      bundle += '\n';
    }

    // Compute hash
    const contextHash = crypto.createHash('sha256').update(bundle).digest('hex');

    return {
      bundleContent: bundle,
      contextHash
    };
  }
}
