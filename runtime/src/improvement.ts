import fs from 'node:fs';
import path from 'node:path';
import {
  computeBackwardPassPlan,
  deterministicFindingsFilePath,
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
import { parseRoleIdentity } from './role-id.js';
import { improvementNodeId, writeImprovementWorkflow } from './improvement-workflow.js';

const FEEDBACK_ROLE = 'A-Society Feedback';
const RUNTIME_FEEDBACK_SYSTEM_PROMPT = [
  'You are the A-Society runtime feedback phase.',
  'Follow the runtime feedback instructions supplied in the latest user message.',
  'Use the supplied findings as the primary source material and emit the required backward-pass-complete handoff block.'
].join('\n');

type ExpectedImprovementSignalKind = 'meta-analysis-complete' | 'backward-pass-complete';
export type ImprovementMode = 'graph-based' | 'parallel';

type ExpectedImprovementSignal<K extends ExpectedImprovementSignalKind> = Extract<HandoffResult, { kind: K }>;
type ExpectedSignalRepair = {
  code: string;
  operatorSummary: string;
  modelRepairMessage: string;
};
type ExpectedSignalValidator<K extends ExpectedImprovementSignalKind> =
  (result: ExpectedImprovementSignal<K>) => ExpectedSignalRepair | null;

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

function cloneRuntimeHistory(history: RuntimeMessageParam[]): RuntimeMessageParam[] {
  return history.map(message => ({ ...message }));
}

function loadForwardPassRoleHistory(flowRun: FlowRun, roleName: string): RuntimeMessageParam[] {
  const sessionId = `${flowRun.flowId}__${parseRoleIdentity(roleName).instanceRoleId}`;
  const session = SessionStore.loadRoleSession(
    sessionId,
    SessionStore.flowRef(flowRun),
    flowRun.workspaceRoot
  );
  return session ? cloneRuntimeHistory(session.transcriptHistory as RuntimeMessageParam[]) : [];
}

function normalizeRepoRelativePath(filePath: string, workspaceRoot: string): string {
  const nativePath = filePath.replace(/\\/g, path.sep);
  const relativePath = path.isAbsolute(nativePath)
    ? path.relative(workspaceRoot, nativePath)
    : nativePath;
  return path.normalize(relativePath).replace(/^\.\//, '').split(path.sep).join('/');
}

function runtimeFeedbackInstructionPath(flowRun: FlowRun): string {
  return path.join(flowRun.workspaceRoot, 'a-society', 'runtime', 'FEEDBACK.md');
}

async function runBackwardPassSessionUntilExpectedSignal<K extends ExpectedImprovementSignalKind>(
  flowRun: FlowRun,
  roleName: string,
  bundleContent: string,
  initialHistory: RuntimeMessageParam[],
  expectedKind: K,
  role: string,
  outputStream: NodeJS.WritableStream,
  renderer: OperatorRenderSink,
  validateExpectedSignal?: ExpectedSignalValidator<K>,
): Promise<ExpectedImprovementSignal<K>> {
  const history = cloneRuntimeHistory(initialHistory);
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

        const repair = validateExpectedSignal?.(result as ExpectedImprovementSignal<K>);
        if (repair) {
          outputStream.write(`[improvement] ${repair.operatorSummary}. Requesting repair.\n`);
          renderer.emit({
            kind: 'repair.requested',
            scope: 'improvement',
            code: repair.code,
            summary: repair.operatorSummary
          });
          history.push({ role: 'user', content: repair.modelRepairMessage });
          continue;
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
  static markAwaitingChoice(
    flowRun: FlowRun,
    signal: { recordFolderPath: string; artifactPath: string },
  ): void {
    flowRun.status = 'awaiting_improvement_choice';
    flowRun.improvementPhase = {
      status: 'awaiting_choice',
      currentStep: 0,
      completedRoles: [],
      findingsProduced: {},
      activeNodeIds: [],
      completedNodeIds: [],
      forwardPassClosure: signal
    };
    flowRun.stateVersion = '7';
  }

  static skipImprovement(flowRun: FlowRun, outputStream?: NodeJS.WritableStream): void {
    const forwardPassClosure = flowRun.improvementPhase?.forwardPassClosure;
    if (!forwardPassClosure) {
      throw new Error('[improvement] Cannot skip improvement: forward-pass closure metadata is missing.');
    }

    flowRun.status = 'completed';
    flowRun.improvementPhase = {
      status: 'skipped',
      mode: 'none',
      currentStep: flowRun.improvementPhase?.currentStep ?? 0,
      completedRoles: flowRun.improvementPhase?.completedRoles ?? [],
      findingsProduced: flowRun.improvementPhase?.findingsProduced ?? {},
      improvementWorkflowPath: flowRun.improvementPhase?.improvementWorkflowPath,
      activeNodeIds: [],
      completedNodeIds: flowRun.improvementPhase?.completedNodeIds ?? [],
      forwardPassClosure
    };
    saveImprovementFlow(flowRun);
    outputStream?.write(`[improvement] No improvement selected. Record closed.\n`);
  }

  static async runImprovement(
    flowRun: FlowRun,
    mode: ImprovementMode,
    outputStream: NodeJS.WritableStream,
    renderer: OperatorRenderSink,
    roleOutputStreamFactory?: (roleName: string) => NodeJS.WritableStream,
  ): Promise<void> {
    const signal = flowRun.improvementPhase?.forwardPassClosure;
    if (!signal) {
      throw new Error('[improvement] Cannot start improvement: forward-pass closure metadata is missing.');
    }

    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('improvement.orchestrate', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'improvement.record_folder': signal.recordFolderPath,
      }
    }, async (span) => {
      try {
        span.setAttribute('improvement.mode', mode);
        span.addEvent('improvement.mode_selected', { mode });
        const plan = computeBackwardPassPlan(signal.recordFolderPath, FEEDBACK_ROLE, mode);
        const improvementWorkflowFilePath = writeImprovementWorkflow(signal.recordFolderPath, plan, mode);

        flowRun.improvementPhase = {
          ...flowRun.improvementPhase,
          status: 'running',
          mode,
          currentStep: 0,
          completedRoles: [],
          findingsProduced: {},
          improvementWorkflowPath: path.relative(flowRun.workspaceRoot, improvementWorkflowFilePath),
          activeNodeIds: [],
          completedNodeIds: [],
          forwardPassClosure: signal
        };
        flowRun.status = 'running';
        flowRun.stateVersion = '7';
        saveImprovementFlow(flowRun);
        span.addEvent('store.flow_saved', { stage: 'improvement_initialized' });

        span.setAttribute('improvement.plan_step_count', plan.length);

        // Sequential steps
        for (let i = 0; i < plan.length; i++) {
          flowRun.improvementPhase.currentStep = i;
          const group = plan[i];
          flowRun.improvementPhase.activeNodeIds = group.map(improvementNodeId);
          saveImprovementFlow(flowRun);
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
                const improvementGraphNodeId = improvementNodeId(entry);
                const roleOutputStream = roleOutputStreamFactory?.(roleName) ?? outputStream;
                renderer.emit({
                  kind: 'role.active',
                  nodeId: improvementGraphNodeId,
                  role: roleName,
                  artifactCount: 0,
                  activationSource: 'runtime'
                });

                if (entry.stepType === 'meta-analysis') {
                  const findingsRoles = entry.findingsRolesToInject;
                  const findingsFilePaths = locateFindingsFiles(signal.recordFolderPath, findingsRoles);
                  const assignedFindingsFilePath = deterministicFindingsFilePath(
                    signal.recordFolderPath,
                    roleName
                  );
                  fs.mkdirSync(path.dirname(assignedFindingsFilePath), { recursive: true });
                  const assignedFindingsRepoPath = normalizeRepoRelativePath(
                    assignedFindingsFilePath,
                    flowRun.workspaceRoot
                  );
                  
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
                    completionSignal: [
                      `Produce your findings artifact at exactly this runtime-assigned path: ${assignedFindingsRepoPath}.`,
                      'Do not choose a sequence number or alternate filename.',
                      `When your findings artifact is saved, emit a meta-analysis-complete handoff block with findings_path set exactly to ${assignedFindingsRepoPath}.`
                    ].join(' ')
                  });
                  const history = loadForwardPassRoleHistory(flowRun, roleName);
                  history.push({ role: 'user', content: userMessage });
                  await runBackwardPassSessionUntilExpectedSignal(
                    flowRun,
                    roleName,
                    bundleContent,
                    history,
                    'meta-analysis-complete',
                    entry.role,
                    roleOutputStream,
                    renderer,
                    (result) => {
                      const actualFindingsPath = normalizeRepoRelativePath(result.findingsPath, flowRun.workspaceRoot);
                      if (actualFindingsPath !== assignedFindingsRepoPath) {
                        return {
                          code: 'assigned_findings_path',
                          operatorSummary: `${entry.role} used findings_path ${actualFindingsPath}; expected ${assignedFindingsRepoPath}`,
                          modelRepairMessage: [
                            'Error: This backward pass meta-analysis step has a runtime-assigned findings path.',
                            `Write or move your findings artifact to ${assignedFindingsRepoPath}.`,
                            `Then emit a meta-analysis-complete handoff block with findings_path set exactly to ${assignedFindingsRepoPath}.`
                          ].join(' ')
                        };
                      }

                      if (!fs.existsSync(assignedFindingsFilePath)) {
                        return {
                          code: 'missing_findings_artifact',
                          operatorSummary: `${entry.role} emitted meta-analysis-complete before creating ${assignedFindingsRepoPath}`,
                          modelRepairMessage: [
                            'Error: The runtime-assigned findings artifact does not exist yet.',
                            `Create ${assignedFindingsRepoPath}.`,
                            `Then emit a meta-analysis-complete handoff block with findings_path set exactly to ${assignedFindingsRepoPath}.`
                          ].join(' ')
                        };
                      }

                      return null;
                    }
                  );

                  flowRun.improvementPhase!.findingsProduced[entry.role] = assignedFindingsRepoPath;
                } else if (entry.stepType === 'feedback') {
                  const allFindingsFiles = locateAllFindingsFiles(signal.recordFolderPath);

                  const feedbackInstructionPath = runtimeFeedbackInstructionPath(flowRun);

                  const userMessage = buildImprovementEntryMessage({
                    stepLabel: 'feedback',
                    recordFolderPath: signal.recordFolderPath,
                    workspaceRoot: flowRun.workspaceRoot,
                    instructionFilePath: feedbackInstructionPath,
                    findingsFilePaths: allFindingsFiles,
                    completionSignal: 'Findings from all roles in this flow are in your context. Produce the feedback artifact, then emit a backward-pass-complete handoff block with artifact_path set to the repo-relative path of the feedback artifact.'
                  });
                  const history: RuntimeMessageParam[] = [{ role: 'user', content: userMessage }];
                  await runBackwardPassSessionUntilExpectedSignal(
                    flowRun,
                    roleName,
                    RUNTIME_FEEDBACK_SYSTEM_PROMPT,
                    history,
                    'backward-pass-complete',
                    entry.role,
                    roleOutputStream,
                    renderer
                  );
                }
                flowRun.improvementPhase!.completedRoles.push(entry.role);
                flowRun.improvementPhase!.activeNodeIds = (flowRun.improvementPhase!.activeNodeIds ?? [])
                  .filter(nodeId => nodeId !== improvementGraphNodeId);
                if (!(flowRun.improvementPhase!.completedNodeIds ?? []).includes(improvementGraphNodeId)) {
                  flowRun.improvementPhase!.completedNodeIds = [
                    ...(flowRun.improvementPhase!.completedNodeIds ?? []),
                    improvementGraphNodeId
                  ];
                }
                saveImprovementFlow(flowRun);
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
        flowRun.improvementPhase.status = 'completed';
        flowRun.improvementPhase.activeNodeIds = [];
        flowRun.improvementPhase.completedNodeIds = plan.flatMap(group => group.map(improvementNodeId));
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
