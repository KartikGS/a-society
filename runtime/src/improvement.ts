import path from 'node:path';
import readline from 'node:readline';
import {
  computeBackwardPassPlan,
  locateFindingsFiles,
  locateAllFindingsFiles,
} from './framework-services/backward-pass-orderer.js';
import { ContextInjectionService } from './injection.js';
import { buildImprovementEntryMessage } from './session-entry.js';
import { SessionStore } from './store.js';
import { runRoleTurn } from './orient.js';
import type { FlowRun, HandoffResult, OperatorRenderSink, RuntimeMessageParam } from './types.js';
import { HandoffParseError } from './handoff.js';
import { TelemetryManager } from './observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { buildRuntimeHealthRepairGuidance, runRuntimeHealthChecks } from './framework-services/runtime-health-checks.js';

// Co-maintenance: update if the final backward-pass feedback role convention changes for this project.
const FEEDBACK_ROLE = 'Owner';

type ExpectedImprovementSignalKind = 'meta-analysis-complete' | 'backward-pass-complete';

type ExpectedImprovementSignal<K extends ExpectedImprovementSignalKind> = Extract<HandoffResult, { kind: K }>;

function saveImprovementFlow(flowRun: FlowRun): void {
  if (!flowRun.workspaceRoot || !flowRun.projectNamespace || !flowRun.flowId) {
    return;
  }
  SessionStore.saveFlowRun(flowRun, SessionStore.flowRef(flowRun), flowRun.workspaceRoot);
}

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
    `Error: This backward pass feedback session for ${role} must end with a \`type: backward-pass-complete\` handoff block.`,
    'Set `artifact_path` to the repo-relative path of the feedback artifact you produced in this session.',
    'Do not emit `prompt-human`, `forward-pass-closed`, `meta-analysis-complete`, or a routing handoff for this step.'
  ].join(' ');
}

function describeUnexpectedSignal(result: HandoffResult): string {
  if (result.kind === 'targets') return 'routing handoff';
  if (result.kind === 'awaiting_human') return 'prompt-human';
  return result.kind;
}

function describeExpectedStep(expectedKind: ExpectedImprovementSignalKind): string {
  return expectedKind === 'meta-analysis-complete' ? 'meta-analysis' : 'feedback';
}

async function runBackwardPassSessionUntilExpectedSignal<K extends ExpectedImprovementSignalKind>(
  flowRun: FlowRun,
  roleName: string,
  bundleContent: string,
  initialUserMessage: string,
  expectedKind: K,
  role: string,
  outputStream: NodeJS.WritableStream,
  renderer: OperatorRenderSink
): Promise<ExpectedImprovementSignal<K>> {
  const history: RuntimeMessageParam[] = [{ role: 'user', content: initialUserMessage }];
  const stepLabel = describeExpectedStep(expectedKind);

  while (true) {
    try {
      const sessionResult = await runRoleTurn(
        flowRun.workspaceRoot,
        flowRun.projectNamespace,
        roleName,
        bundleContent,
        history,
        outputStream
      );

      if (sessionResult === null) {
        throw new Error(`[improvement] ${expectedKind} session for ${role} ended unexpectedly without a handoff result.`);
      }
      const result = sessionResult.handoff;

      if (result.kind === expectedKind) {
        if (expectedKind === 'backward-pass-complete') {
          const healthCheck = runRuntimeHealthChecks(flowRun.workspaceRoot, flowRun.projectNamespace);
          if (!healthCheck.ok) {
            const guidance = buildRuntimeHealthRepairGuidance(
              healthCheck.errors,
              'backward-pass-complete'
            );
            outputStream.write(
              `[improvement] ${role} completed backward pass but runtime health checks failed. Requesting repair.\n`
            );
            renderer.emit({
              kind: 'repair.requested',
              scope: 'improvement',
              code: 'runtime_health',
              summary: guidance.operatorSummary
            });
            history.push({ role: 'user', content: guidance.modelRepairMessage });
            continue;
          }
        }

        return result as ExpectedImprovementSignal<K>;
      }

      outputStream.write(
        `[improvement] ${role} emitted ${describeUnexpectedSignal(result)} during backward pass ${stepLabel}. Requesting repair.\n`
      );
      renderer.emit({
        kind: 'repair.requested',
        scope: 'improvement',
        code: 'unexpected_signal',
        summary: `${role} emitted ${describeUnexpectedSignal(result)} during backward pass ${stepLabel}`
      });
      history.push({
        role: 'user',
        content: buildUnexpectedSignalRepairMessage(role, expectedKind)
      });
    } catch (error: any) {
      if (error instanceof HandoffParseError) {
        outputStream.write(
          `[improvement] ${role} emitted an invalid handoff block during backward pass ${stepLabel}. Requesting repair.\n`
        );
        renderer.emit({
          kind: 'repair.requested',
          scope: 'improvement',
          code: error.details.code,
          summary: error.details.operatorSummary
        });
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
    renderer: OperatorRenderSink,
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
        terminal: false
      });

      const question = (query: string): Promise<string> => {
        return new Promise((resolve) => rl.question(query, resolve));
      };

      try {
        renderer.emit({ kind: 'flow.improvement_prompt' });

        let choice = String((await question('Enter 1, 2, or 3: ')) ?? '').trim();
        if (choice !== '1' && choice !== '2' && choice !== '3') {
          choice = String((await question('Invalid selection. Enter 1, 2, or 3: ')) ?? '').trim();
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
          saveImprovementFlow(flowRun);
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
        flowRun.stateVersion = '7';
        saveImprovementFlow(flowRun);
        span.addEvent('store.flow_saved', { stage: 'improvement_initialized' });

        const plan = computeBackwardPassPlan(signal.recordFolderPath, FEEDBACK_ROLE, mode);
        span.setAttribute('improvement.plan_step_count', plan.length);

        // Sequential steps
        for (let i = 0; i < plan.length; i++) {
          flowRun.improvementPhase.currentStep = i;
          const group = plan[i];
          const isFeedback = group.some(e => e.stepType === 'feedback');
          const spanName = isFeedback ? 'improvement.feedback' : 'improvement.meta_analysis.step';
          span.addEvent('improvement.step_started', {
            step_index: i,
            step_kind: isFeedback ? 'feedback' : 'meta-analysis',
            role_count: group.length,
            roles: group.map(entry => entry.role).join(','),
          });

          await tracer.startActiveSpan(spanName, {
            kind: SpanKind.INTERNAL,
            attributes: {
              'improvement.step_index': i,
              'improvement.step_kind': isFeedback ? 'feedback' : 'meta-analysis',
            }
          }, async (stepSpan) => {
            try {
              if (isFeedback) stepSpan.addEvent('improvement.feedback_started');
              // Concurrent roles within step
              await Promise.all(group.map(async (entry) => {
                const roleName = entry.role;

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

                  // $[PROJECT]_IMPROVEMENT_META_ANALYSIS: project root + namespace + a-docs/improvement/meta-analysis.md
                  const metaAnalysisInstructionPath = path.join(flowRun.workspaceRoot, flowRun.projectNamespace, 'a-docs', 'improvement', 'meta-analysis.md');

                  const { bundleContent } = ContextInjectionService.buildContextBundle(
                    flowRun.projectNamespace,
                    roleName,
                    flowRun.workspaceRoot
                  );

                  const userMessage = buildImprovementEntryMessage({
                    stepLabel: 'meta-analysis',
                    recordFolderPath: signal.recordFolderPath,
                    workspaceRoot: flowRun.workspaceRoot,
                    instructionFilePath: metaAnalysisInstructionPath,
                    findingsFilePaths,
                    completionSignal: 'Produce your findings artifact at the next available sequence position in the record folder. When your findings artifact is saved, emit a meta-analysis-complete handoff block with findings_path set to the repo-relative path of your findings file.'
                  });
                  const result = await runBackwardPassSessionUntilExpectedSignal(
                    flowRun,
                    roleName,
                    bundleContent,
                    userMessage,
                    'meta-analysis-complete',
                    entry.role,
                    outputStream,
                    renderer
                  );

                  flowRun.improvementPhase!.findingsProduced[entry.role] = result.findingsPath;
                } else if (entry.stepType === 'feedback') {
                  const allFindingsFiles = locateAllFindingsFiles(signal.recordFolderPath);

                  // $[PROJECT]_IMPROVEMENT_FEEDBACK: project root + namespace + a-docs/improvement/feedback.md
                  const feedbackInstructionPath = path.join(flowRun.workspaceRoot, flowRun.projectNamespace, 'a-docs', 'improvement', 'feedback.md');

                  const { bundleContent } = ContextInjectionService.buildContextBundle(
                    flowRun.projectNamespace,
                    roleName,
                    flowRun.workspaceRoot
                  );

                  const userMessage = buildImprovementEntryMessage({
                    stepLabel: 'feedback',
                    recordFolderPath: signal.recordFolderPath,
                    workspaceRoot: flowRun.workspaceRoot,
                    instructionFilePath: feedbackInstructionPath,
                    findingsFilePaths: allFindingsFiles,
                    completionSignal: 'Findings from all roles in this flow are in your context. Produce the feedback artifact, then emit a backward-pass-complete handoff block with artifact_path set to the repo-relative path of the feedback artifact.'
                  });
                  await runBackwardPassSessionUntilExpectedSignal(
                    flowRun,
                    roleName,
                    bundleContent,
                    userMessage,
                    'backward-pass-complete',
                    entry.role,
                    outputStream,
                    renderer
                  );
                }
                flowRun.improvementPhase!.completedRoles.push(entry.role);
              }));
              saveImprovementFlow(flowRun);
              span.addEvent('store.flow_saved', { stage: 'step_completed', step_index: i });
              span.addEvent('improvement.step_completed', {
                step_index: i,
                step_kind: isFeedback ? 'feedback' : 'meta-analysis',
                completed_roles: group.map(entry => entry.role).join(','),
              });
            } finally {
              stepSpan.end();
            }
          });
        }

        flowRun.status = 'completed';
        saveImprovementFlow(flowRun);
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
