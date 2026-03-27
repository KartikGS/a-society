import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { roleContextRegistry } from './registry.js';
import { resolveVariableFromIndex } from './paths.js';

export interface ContextBundleResult {
  bundleContent: string;
  contextHash: string;
}

export class ContextInjectionService {
  /**
   * Assembles the required-reading set, the active artifact, and the runtime directive into a single context string.
   */
  static buildContextBundle(
    roleKey: string,
    projectRoot: string,
    activeArtifactPath: string,
    directivePrompt: string | null,
    mode: 'flow' | 'orient' = 'flow'
  ): ContextBundleResult {
    let bundle = `=== A-SOCIETY RUNTIME CONTEXT BUNDLE ===\n\n`;
    
    // 1. Resolve and inject required reading
    const roleEntry = roleContextRegistry[roleKey];
    if (roleEntry) {
      bundle += `--- MANDATORY CONTEXT LOADING FOR ${roleKey} ---\n`;
      for (const varName of roleEntry.requiredReadingVariables) {
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
      bundle += `--- UNKNOWN ROLE: ${roleKey}. No required reading registered. ---\n\n`;
    }

    // 2. Inject active artifact
    if (activeArtifactPath) {
      const fullActivePath = path.resolve(projectRoot, activeArtifactPath);
      bundle += `--- ACTIVE WORKSPACE ARTIFACT ---\n`;
      bundle += `[FILE: ${activeArtifactPath}]\n`;
      if (fs.existsSync(fullActivePath)) {
        const content = fs.readFileSync(fullActivePath, 'utf8');
        bundle += `${content}\n\n`;
      } else {
        bundle += `(File does not exist yet)\n\n`;
      }
    }

    // 3. Runtime directive
    bundle += `--- RUNTIME DIRECTIVE ---\n`;
    if (directivePrompt) {
      bundle += `System Instruction:\n${directivePrompt}\n\n`;
    }
    if (mode === 'orient') {
      bundle += `You are the Owner agent for this project. A new orient session has started.\nGreet the user and await their direction. Respond conversationally.\nNo machine-readable handoff block is required.\n`;
    } else {
      bundle += `IMPORTANT INSTRUCTION: Your response must always end with a valid machine-readable handoff block formatted strictly per $INSTRUCTION_MACHINE_READABLE_HANDOFF. A handoff block is required to pass control back to the orchestrator, even if it is to terminate the flow.\n`;
    }
    
    // Compute hash
    const contextHash = crypto.createHash('sha256').update(bundle).digest('hex');

    return {
      bundleContent: bundle,
      contextHash
    };
  }
}
