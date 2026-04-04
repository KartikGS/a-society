import path from 'node:path';
import readline from 'node:readline';
import { computeBackwardPassPlan, locateFindingsFiles, locateAllFindingsFiles } from '../../tooling/src/backward-pass-orderer.js';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { runInteractiveSession } from './orient.js';
import type { FlowRun, HandoffResult } from './types.js';

// Co-maintenance: update if the synthesis role convention changes for this project.
const SYNTHESIS_ROLE = 'Curator';

/**
 * Co-maintenance: update if $GENERAL_IMPROVEMENT_META_ANALYSIS relocates in the index.
 */
const META_ANALYSIS_INSTRUCTION_PATH = 'a-society/general/improvement/meta-analysis.md';

/**
 * Co-maintenance: update if $GENERAL_IMPROVEMENT_SYNTHESIS relocates in the index.
 */
const SYNTHESIS_INSTRUCTION_PATH = 'a-society/general/improvement/synthesis.md';

export class ImprovementOrchestrator {
  static async handleForwardPassClosure(
    flowRun: FlowRun,
    signal: { recordFolderPath: string; artifactPath: string },
    inputStream: NodeJS.ReadableStream,
    outputStream: NodeJS.WritableStream,
  ): Promise<void> {
    const rl = readline.createInterface({
      input: inputStream,
      output: outputStream,
      terminal: true
    });

    const question = (query: string): Promise<string> => {
      return new Promise((resolve) => rl.question(query, resolve));
    };

    outputStream.write(`\nForward pass complete.\n\nChoose improvement mode:\n  1) Graph-based  — roles run in reverse topological order; each receives findings from their direct forward successors\n  2) Parallel     — all roles run simultaneously; no cross-role findings injected\n  3) No improvement — close the record now\n\n`);

    let choice = (await question('Enter 1, 2, or 3: ')).trim();
    if (choice !== '1' && choice !== '2' && choice !== '3') {
      choice = (await question('Invalid selection. Enter 1, 2, or 3: ')).trim();
      if (choice !== '1' && choice !== '2' && choice !== '3') {
        outputStream.write(`[improvement] Could not read valid selection. Defaulting to no improvement.\n`);
        choice = '3';
      }
    }
    rl.close();

    if (choice === '3') {
      outputStream.write(`[improvement] No improvement selected. Record closed.\n`);
      flowRun.status = 'completed';
      SessionStore.saveFlowRun(flowRun);
      return;
    }

    const mode = choice === '1' ? 'graph-based' : 'parallel';
    flowRun.improvementPhase = {
      mode,
      currentStep: 0,
      completedRoles: [],
      findingsProduced: {}
    };
    flowRun.stateVersion = '2';
    SessionStore.saveFlowRun(flowRun);

    const plan = computeBackwardPassPlan(signal.recordFolderPath, SYNTHESIS_ROLE, mode);

    // Sequential steps
    for (let i = 0; i < plan.length; i++) {
        flowRun.improvementPhase.currentStep = i;
        const group = plan[i];
        
        // Concurrent roles within step
        await Promise.all(group.map(async (entry, groupIndex) => {
            const namespace = path.basename(flowRun.projectRoot);
            const roleKey = `${namespace}__${entry.role}`;

            if (entry.stepType === 'meta-analysis') {
                const findingsRoles = entry.findingsRolesToInject;
                const findingsFilePaths = locateFindingsFiles(signal.recordFolderPath, findingsRoles);
                
                // §2.6 / §3.6 Warning for missing findings
                for (const expectedRole of findingsRoles) {
                    const perRoleFiles = locateFindingsFiles(signal.recordFolderPath, [expectedRole]);
                    if (perRoleFiles.length === 0) {
                        outputStream.write(`[improvement] Role ${entry.role}: expected findings from ${expectedRole} but no matching file found in ${signal.recordFolderPath}. Proceeding without findings for this role.\n`);
                    }
                }

                const { bundleContent } = ContextInjectionService.buildContextBundle(
                    roleKey,
                    flowRun.projectRoot,
                    [META_ANALYSIS_INSTRUCTION_PATH, ...findingsFilePaths],
                    null
                );

                const userMessage = `Backward pass meta-analysis. Your record folder is: ${signal.recordFolderPath}.\nProduce your findings artifact at the next available sequence position in the record folder.\nWhen your findings artifact is saved, emit a meta-analysis-complete handoff block with findings_path set to the repo-relative path of your findings file.`;

                const result = await runInteractiveSession(
                    flowRun.projectRoot,
                    roleKey,
                    bundleContent,
                    [{ role: 'user', content: userMessage }],
                    inputStream,
                    outputStream
                );

                if (result && result.kind === 'meta-analysis-complete') {
                    flowRun.improvementPhase!.findingsProduced[entry.role] = result.findingsPath;
                } else {
                    outputStream.write(`[improvement] Meta-analysis for ${entry.role} did not produce a findings signal (session ended with: ${result ? result.kind : 'null'}). Proceeding without findings for this role.\n`);
                }
            } else if (entry.stepType === 'synthesis') {
                const allFindingsFiles = locateAllFindingsFiles(signal.recordFolderPath);

                const { bundleContent } = ContextInjectionService.buildContextBundle(
                    roleKey,
                    flowRun.projectRoot,
                    [SYNTHESIS_INSTRUCTION_PATH, ...allFindingsFiles],
                    null
                );

                const userMessage = `Backward pass synthesis. Your record folder is: ${signal.recordFolderPath}.\nFindings from all roles in this flow are in your context. Produce the synthesis artifact.`;

                await runInteractiveSession(
                    flowRun.projectRoot,
                    roleKey,
                    bundleContent,
                    [{ role: 'user', content: userMessage }],
                    inputStream,
                    outputStream
                );
            }
            flowRun.improvementPhase!.completedRoles.push(entry.role);
        }));
        SessionStore.saveFlowRun(flowRun);
    }

    flowRun.status = 'completed';
    SessionStore.saveFlowRun(flowRun);
    outputStream.write(`[improvement] Improvement phase complete. Flow closed.\n`);
  }
}
