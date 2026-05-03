import fs from 'node:fs';
import path from 'node:path';
import {
  computeBackwardPassPlan,
  deterministicFindingsFilePath,
  locateFindingsFiles,
  locateAllFindingsFiles,
} from '../framework-services/backward-pass-orderer.js';
import { ContextInjectionService } from '../context/injection.js';
import { buildImprovementEntryMessage } from '../context/session-entry.js';
import { SessionStore } from '../orchestration/store.js';
import { runRoleTurn } from '../orchestration/orient.js';
import type { FlowRun, HandoffResult, OperatorRenderSink, RuntimeMessageParam } from '../common/types.js';
import { HandoffParseError } from '../orchestration/handoff.js';
import { TelemetryManager } from '../observability/observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { buildRuntimeHealthRepairGuidance, runRuntimeHealthChecks } from '../framework-services/runtime-health-checks.js';
import { parseRoleIdentity } from '../common/role-id.js';
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
  const session = SessionStore.loadRoleSession(
    parseRoleIdentity(roleName).instanceRoleId,
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
  return path.join(flowRun.workspaceRoot, 'a-society', 'runtime', 'contracts', 'feedback.md');
}

function sanitizeFeedbackFileSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';
}

function feedbackKindFileSegment(flowRun: FlowRun): string {
  const feedbackContext = flowRun.feedbackContext ?? { kind: 'standard' as const };
  if (feedbackContext.kind === 'initialization') {
    return feedbackContext.initializationMode === 'greenfield'
      ? 'initialization-greenfield'
      : 'initialization-takeover';
  }
  if (feedbackContext.kind === 'update-application') {
    return 'update-application';
  }
  return 'flow';
}

function assignedFeedbackArtifactRelativePath(flowRun: FlowRun): string {
  const existing = flowRun.improvementPhase?.feedbackArtifactPath;
  if (existing) return existing;

  return path.posix.join(
    'a-society',
    'feedback',
    `${sanitizeFeedbackFileSegment(flowRun.projectNamespace)}-${feedbackKindFileSegment(flowRun)}-${flowRun.flowId}.md`
  );
}

function feedbackContextLines(flowRun: FlowRun): string[] {
  const feedbackContext = flowRun.feedbackContext ?? { kind: 'standard' as const };
  const lines = [`Source flow ID: ${flowRun.flowId}`];

  if (feedbackContext.kind === 'initialization') {
    lines.push(
      `Flow kind: initialization (${feedbackContext.initializationMode === 'greenfield' ? 'greenfield' : 'takeover'})`
    );
    lines.push('Focus on what the runtime could infer, what required human input, and where initialization guidance caused friction.');
    return lines;
  }

  if (feedbackContext.kind === 'update-application') {
    lines.push('Flow kind: update application');
    lines.push('Focus on which update guidance applied, where migration guidance was unclear, and what the runtime or framework should improve for future update flows.');
    for (const reportPath of feedbackContext.updateReportPaths ?? []) {
      lines.push(`Referenced update report: ${reportPath}`);
    }
    return lines;
  }

  lines.push('Flow kind: standard');
  lines.push('Focus on reusable framework gaps, workflow friction, runtime issues, and cross-project patterns surfaced by this flow.');
  return lines;
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
              summary: guidance.operatorSummary,
              role
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
            summary: repair.operatorSummary,
            role
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
        summary: `${role} emitted ${describeUnexpectedSignal(result)} during backward pass ${stepLabel}`,
        role
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
          summary: error.details.operatorSummary,
          role
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
    singleRole?: boolean,
  ): void {
    flowRun.status = 'awaiting_improvement_choice';
    flowRun.improvementPhase = {
      status: 'awaiting_choice',
      currentStep: 0,
      completedRoles: [],
      findingsProduced: {},
      activeNodeIds: [],
      completedNodeIds: [],
      feedbackArtifactPath: assignedFeedbackArtifactRelativePath(flowRun),
      feedbackConsent: 'pending',
      singleRole: singleRole ?? false,
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
      feedbackArtifactPath: flowRun.improvementPhase?.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun),
      feedbackConsent: flowRun.improvementPhase?.feedbackConsent,
      forwardPassClosure
    };
    saveImprovementFlow(flowRun);
    outputStream?.write(`[improvement] No improvement selected. Record closed.\n`);
  }

  static skipFeedback(flowRun: FlowRun, outputStream?: NodeJS.WritableStream): void {
    const improvementPhase = flowRun.improvementPhase;
    if (!improvementPhase?.forwardPassClosure) {
      throw new Error('[improvement] Cannot skip feedback: forward-pass closure metadata is missing.');
    }

    flowRun.status = 'completed';
    flowRun.improvementPhase = {
      ...improvementPhase,
      status: 'completed',
      activeNodeIds: [],
      feedbackArtifactPath: improvementPhase.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun),
      feedbackConsent: 'denied',
    };
    saveImprovementFlow(flowRun);
    outputStream?.write('[improvement] Upstream feedback skipped. Flow closed.\n');
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
          feedbackArtifactPath: assignedFeedbackArtifactRelativePath(flowRun),
          feedbackConsent: 'pending',
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
          const isFeedback = group.some(e => e.stepType === 'feedback');
          if (isFeedback) {
            flowRun.status = 'awaiting_feedback_consent';
            flowRun.improvementPhase.status = 'awaiting_feedback_consent';
            flowRun.improvementPhase.activeNodeIds = [];
            flowRun.improvementPhase.feedbackArtifactPath = flowRun.improvementPhase.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
            flowRun.improvementPhase.feedbackConsent = 'pending';
            saveImprovementFlow(flowRun);
            span.addEvent('store.flow_saved', { stage: 'awaiting_feedback_consent', step_index: i });
            outputStream.write(
              `[improvement] Meta-analysis complete. Awaiting feedback consent before writing ${flowRun.improvementPhase.feedbackArtifactPath}.\n`
            );
            return;
          }

          flowRun.improvementPhase.activeNodeIds = group.map(improvementNodeId);
          saveImprovementFlow(flowRun);
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

  static async runFeedback(
    flowRun: FlowRun,
    outputStream: NodeJS.WritableStream,
    renderer: OperatorRenderSink,
    roleOutputStreamFactory?: (roleName: string) => NodeJS.WritableStream,
  ): Promise<void> {
    const signal = flowRun.improvementPhase?.forwardPassClosure;
    if (!signal) {
      throw new Error('[improvement] Cannot run feedback: forward-pass closure metadata is missing.');
    }

    const currentStep = flowRun.improvementPhase?.currentStep;
    if (currentStep === undefined) {
      throw new Error('[improvement] Cannot run feedback: improvement step index is missing.');
    }

    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('improvement.feedback', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'flow.id': flowRun.flowId,
        'improvement.record_folder': signal.recordFolderPath,
      }
    }, async (span) => {
      try {
        const mode = flowRun.improvementPhase?.mode;
        if (!mode || mode === 'none') {
          throw new Error('[improvement] Cannot run feedback: improvement mode is missing.');
        }

        const plan = computeBackwardPassPlan(signal.recordFolderPath, FEEDBACK_ROLE, mode);
        const group = plan[currentStep];
        if (!group || !group.some(entry => entry.stepType === 'feedback')) {
          throw new Error('[improvement] Cannot run feedback: the current improvement step is not a feedback step.');
        }

        const assignedFeedbackRepoPath = flowRun.improvementPhase?.feedbackArtifactPath ?? assignedFeedbackArtifactRelativePath(flowRun);
        const assignedFeedbackFilePath = path.resolve(flowRun.workspaceRoot, assignedFeedbackRepoPath);
        fs.mkdirSync(path.dirname(assignedFeedbackFilePath), { recursive: true });

        const existingPhase = flowRun.improvementPhase;
        if (!existingPhase?.forwardPassClosure) {
          throw new Error('[improvement] Cannot run feedback: improvement phase state is incomplete.');
        }

        flowRun.status = 'running';
        flowRun.improvementPhase = {
          status: 'running',
          mode,
          currentStep,
          completedRoles: existingPhase.completedRoles ?? [],
          findingsProduced: existingPhase.findingsProduced ?? {},
          improvementWorkflowPath: existingPhase.improvementWorkflowPath,
          activeNodeIds: group.map(improvementNodeId),
          completedNodeIds: existingPhase.completedNodeIds ?? [],
          feedbackArtifactPath: assignedFeedbackRepoPath,
          feedbackConsent: 'granted',
          forwardPassClosure: existingPhase.forwardPassClosure,
        };
        saveImprovementFlow(flowRun);
        span.addEvent('store.flow_saved', { stage: 'feedback_started', step_index: currentStep });

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

          const allFindingsFiles = locateAllFindingsFiles(signal.recordFolderPath);
          const feedbackInstructionPath = runtimeFeedbackInstructionPath(flowRun);

          const userMessage = buildImprovementEntryMessage({
            stepLabel: 'feedback',
            recordFolderPath: signal.recordFolderPath,
            workspaceRoot: flowRun.workspaceRoot,
            instructionFilePath: feedbackInstructionPath,
            findingsFilePaths: allFindingsFiles,
            contextLines: feedbackContextLines(flowRun),
            completionSignal: [
              'Findings from all roles in this flow are in your context.',
              `Produce the upstream feedback artifact at exactly this runtime-assigned path: ${assignedFeedbackRepoPath}.`,
              'Do not choose an alternate filename or location.',
              `When the feedback artifact is saved, emit a backward-pass-complete handoff block with artifact_path set exactly to ${assignedFeedbackRepoPath}.`
            ].join(' ')
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
            renderer,
            (result) => {
              const actualArtifactPath = normalizeRepoRelativePath(result.artifactPath, flowRun.workspaceRoot);
              if (actualArtifactPath !== assignedFeedbackRepoPath) {
                return {
                  code: 'assigned_feedback_path',
                  operatorSummary: `${entry.role} used artifact_path ${actualArtifactPath}; expected ${assignedFeedbackRepoPath}`,
                  modelRepairMessage: [
                    'Error: This backward pass feedback step has a runtime-assigned artifact path.',
                    `Write or move the feedback artifact to ${assignedFeedbackRepoPath}.`,
                    `Then emit a backward-pass-complete handoff block with artifact_path set exactly to ${assignedFeedbackRepoPath}.`
                  ].join(' ')
                };
              }

              if (!fs.existsSync(assignedFeedbackFilePath)) {
                return {
                  code: 'missing_feedback_artifact',
                  operatorSummary: `${entry.role} emitted backward-pass-complete before creating ${assignedFeedbackRepoPath}`,
                  modelRepairMessage: [
                    'Error: The runtime-assigned feedback artifact does not exist yet.',
                    `Create ${assignedFeedbackRepoPath}.`,
                    `Then emit a backward-pass-complete handoff block with artifact_path set exactly to ${assignedFeedbackRepoPath}.`
                  ].join(' ')
                };
              }

              return null;
            }
          );

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

        flowRun.status = 'completed';
        flowRun.improvementPhase = {
          ...flowRun.improvementPhase!,
          status: 'completed',
          activeNodeIds: [],
          completedNodeIds: plan.flatMap(stepGroup => stepGroup.map(improvementNodeId)),
          feedbackArtifactPath: assignedFeedbackRepoPath,
          feedbackConsent: 'granted',
        };
        saveImprovementFlow(flowRun);
        span.addEvent('store.flow_saved', { stage: 'feedback_completed' });
        outputStream.write('[improvement] Improvement phase complete. Flow closed.\n');
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
