import path from 'node:path';
import readline from 'node:readline';
import {
  computeBackwardPassPlan,
  locateFindingsFiles,
  locateAllFindingsFiles,
} from './framework-services/backward-pass-orderer.js';
import { ContextInjectionService } from './injection.js';
import { SessionStore } from './store.js';
import { runInteractiveSession } from './orient.js';
import type { FlowRun, HandoffResult, RuntimeMessageParam } from './types.js';
import { HandoffParseError } from './handoff.js';
import { TelemetryManager } from './observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';

// Co-maintenance: update if the synthesis role convention changes for this project.
const SYNTHESIS_ROLE = 'Curator';

type ExpectedImprovementSignalKind = 'meta-analysis-complete' | 'backward-pass-complete';

type ExpectedImprovementSignal<K extends ExpectedImprovementSignalKind> = Extract<HandoffResult, { kind: K }>;

function buildUnexpectedSignalRepairMessage(
  role: string,
  expectedKind: ExpectedImprovementSignalKind
): string {
  if (expectedKind === 'meta-analysis-complete') {
    return [
      `Error: This backward pass meta-analysis session for ${role} must end with a \`type: meta-analysis-complete\` handoff block.`,
      'Set `findings_path` to the repo-relative path of the findings artifact you produced in this session.',
      'Do not emit `prompt-human`, `forward-pass-closed`, `backward-pass-complete`, or a routing handoff for this step.'
    ].join(' ');
  }

  return [
    `Error: This backward pass synthesis session for ${role} must end with a \`type: backward-pass-complete\` handoff block.`,
    'Set `artifact_path` to the repo-relative path of the synthesis artifact you produced in this session.',
    'Do not emit `prompt-human`, `forward-pass-closed`, `meta-analysis-complete`, or a routing handoff for this step.'
  ].join(' ');
}

function describeUnexpectedSignal(result: HandoffResult): string {
  if (result.kind === 'targets') return 'routing handoff';
  if (result.kind === 'awaiting_human') return 'prompt-human';
  return result.kind;
}

function describeExpectedStep(expectedKind: ExpectedImprovementSignalKind): string {
  return expectedKind === 'meta-analysis-complete' ? 'meta-analysis' : 'synthesis';
}

async function runBackwardPassSessionUntilExpectedSignal<K extends ExpectedImprovementSignalKind>(
  flowRun: FlowRun,
  roleKey: string,
  bundleContent: string,
  initialUserMessage: string,
  expectedKind: K,
  role: string,
  inputStream: NodeJS.ReadableStream,
  outputStream: NodeJS.WritableStream
): Promise<ExpectedImprovementSignal<K>> {
  const history: RuntimeMessageParam[] = [{ role: 'user', content: initialUserMessage }];
  const stepLabel = describeExpectedStep(expectedKind);

  while (true) {
    try {
      const result = await runInteractiveSession(
        flowRun.projectRoot,
        roleKey,
        bundleContent,
        history,
        inputStream,
        outputStream
      );

      if (result === null) {
        throw new Error(`[improvement] ${expectedKind} session for ${role} ended unexpectedly without a handoff result.`);
      }

      if (result.kind === expectedKind) {
        return result as ExpectedImprovementSignal<K>;
      }

      outputStream.write(
        `[improvement] ${role} emitted ${describeUnexpectedSignal(result)} during backward pass ${stepLabel}. Requesting repair.\n`
      );
      history.push({
        role: 'user',
        content: buildUnexpectedSignalRepairMessage(role, expectedKind)
      });
    } catch (error: any) {
      if (error instanceof HandoffParseError) {
        outputStream.write(
          `[improvement] ${role} emitted an invalid handoff block during backward pass ${stepLabel}. Requesting repair.\n`
        );
        history.push({ role: 'user', content: error.details.modelRepairMessage });
        continue;
      }
      throw error;
    }
  }
}

export class ImprovementOrchestrator {
  static async handleForwardPassClosure(
    flowRun: FlowRun,
    signal: { recordFolderPath: string; artifactPath: string },
    inputStream: NodeJS.ReadableStream,
    outputStream: NodeJS.WritableStream,
  ): Promise<void> {
    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('improvement.orchestrate', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'improvement.record_folder': signal.recordFolderPath,
      }
    }, async (span) => {
      const rl = readline.createInterface({
        input: inputStream,
        output: outputStream,
        terminal: true
      });

      const question = (query: string): Promise<string> => {
        return new Promise((resolve) => rl.question(query, resolve));
      };

      try {
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
          span.setAttribute('improvement.mode', 'none');
          span.addEvent('improvement.mode_selected', { mode: 'none' });
          outputStream.write(`[improvement] No improvement selected. Record closed.\n`);
          flowRun.status = 'completed';
          SessionStore.saveFlowRun(flowRun);
          span.addEvent('store.flow_saved', { stage: 'improvement_skipped' });
          return;
        }

        const mode = choice === '1' ? 'graph-based' : 'parallel';
        span.setAttribute('improvement.mode', mode);
        span.addEvent('improvement.mode_selected', { mode });
        flowRun.improvementPhase = {
          mode,
          currentStep: 0,
          completedRoles: [],
          findingsProduced: {}
        };
        flowRun.stateVersion = '2';
        SessionStore.saveFlowRun(flowRun);
        span.addEvent('store.flow_saved', { stage: 'improvement_initialized' });

        const plan = computeBackwardPassPlan(signal.recordFolderPath, SYNTHESIS_ROLE, mode);
        span.setAttribute('improvement.plan_step_count', plan.length);

        // Sequential steps
        for (let i = 0; i < plan.length; i++) {
          flowRun.improvementPhase.currentStep = i;
          const group = plan[i];
          const isSynthesis = group.some(e => e.stepType === 'synthesis');
          const spanName = isSynthesis ? 'improvement.synthesis' : 'improvement.meta_analysis.step';
          span.addEvent('improvement.step_started', {
            step_index: i,
            step_kind: isSynthesis ? 'synthesis' : 'meta-analysis',
            role_count: group.length,
            roles: group.map(entry => entry.role).join(','),
          });

          await tracer.startActiveSpan(spanName, {
            kind: SpanKind.INTERNAL,
            attributes: {
              'improvement.step_index': i,
              'improvement.step_kind': isSynthesis ? 'synthesis' : 'meta-analysis',
            }
          }, async (stepSpan) => {
            try {
              if (isSynthesis) stepSpan.addEvent('improvement.synthesis_started');
              // Concurrent roles within step
              await Promise.all(group.map(async (entry) => {
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
                      span.addEvent('improvement.no_findings_warning', {
                        step_index: i,
                        role: entry.role,
                        expected_role: expectedRole,
                      });
                    }
                  }

                  // $[PROJECT]_IMPROVEMENT_META_ANALYSIS: project root + a-docs/improvement/meta-analysis.md
                  const metaAnalysisInstructionPath = path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'meta-analysis.md');

                  const { bundleContent } = ContextInjectionService.buildContextBundle(
                    roleKey,
                    flowRun.projectRoot,
                    [metaAnalysisInstructionPath, ...findingsFilePaths]
                  );

                  const userMessage = `Backward pass meta-analysis. Your record folder is: ${signal.recordFolderPath}.\nProduce your findings artifact at the next available sequence position in the record folder.\nWhen your findings artifact is saved, emit a meta-analysis-complete handoff block with findings_path set to the repo-relative path of your findings file.`;
                  const result = await runBackwardPassSessionUntilExpectedSignal(
                    flowRun,
                    roleKey,
                    bundleContent,
                    userMessage,
                    'meta-analysis-complete',
                    entry.role,
                    inputStream,
                    outputStream
                  );

                  flowRun.improvementPhase!.findingsProduced[entry.role] = result.findingsPath;
                } else if (entry.stepType === 'synthesis') {
                  const allFindingsFiles = locateAllFindingsFiles(signal.recordFolderPath);

                  // $[PROJECT]_IMPROVEMENT_SYNTHESIS: project root + a-docs/improvement/synthesis.md
                  const synthesisInstructionPath = path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'synthesis.md');

                  const { bundleContent } = ContextInjectionService.buildContextBundle(
                    roleKey,
                    flowRun.projectRoot,
                    [synthesisInstructionPath, ...allFindingsFiles]
                  );

                  const userMessage = `Backward pass synthesis. Your record folder is: ${signal.recordFolderPath}.\nFindings from all roles in this flow are in your context. Produce the synthesis artifact, then emit a backward-pass-complete handoff block with artifact_path set to the repo-relative path of the synthesis artifact.`;
                  await runBackwardPassSessionUntilExpectedSignal(
                    flowRun,
                    roleKey,
                    bundleContent,
                    userMessage,
                    'backward-pass-complete',
                    entry.role,
                    inputStream,
                    outputStream
                  );
                }
                flowRun.improvementPhase!.completedRoles.push(entry.role);
              }));
              SessionStore.saveFlowRun(flowRun);
              span.addEvent('store.flow_saved', { stage: 'step_completed', step_index: i });
              span.addEvent('improvement.step_completed', {
                step_index: i,
                step_kind: isSynthesis ? 'synthesis' : 'meta-analysis',
                completed_roles: group.map(entry => entry.role).join(','),
              });
            } finally {
              stepSpan.end();
            }
          });
        }

        flowRun.status = 'completed';
        SessionStore.saveFlowRun(flowRun);
        span.addEvent('store.flow_saved', { stage: 'improvement_completed' });
        outputStream.write(`[improvement] Improvement phase complete. Flow closed.\n`);
      } catch (e: any) {
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw e;
      } finally {
        span.end();
      }
    });
  }
}
