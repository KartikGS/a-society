import { FEEDBACK_CONSENT_STATUS, FEEDBACK_REPORTS_DIR } from '../../../shared/protocol-constants.js';
import type { FlowRun } from '../../../shared/types.js';

export function feedbackConsentCopy(flowRun: FlowRun | null): { title: string; body: string; details: string } {
  const artifactPath = flowRun?.improvementPhase?.feedbackArtifactPath ?? `${FEEDBACK_REPORTS_DIR}/`;
  const feedbackContext = flowRun?.feedbackContext;
  const body = `Meta-analysis is complete. If you approve, the feedback agent will spend one more turn writing an upstream report to \`${artifactPath}\` in your workspace. Nothing is sent: submitting the report is a separate step you take yourself.`;

  if (feedbackContext?.kind === 'initialization') {
    const modeLabel = feedbackContext.initializationMode === 'greenfield' ? 'greenfield' : 'takeover';
    return {
      title: 'Generate initialization feedback?',
      body,
      details: `This ${modeLabel} initialization report should focus on what the runtime inferred, what required human input, and where initialization guidance or scaffolding created friction. Review or redact the file before you submit it as a pull request.`
    };
  }

  if (feedbackContext?.kind === 'update') {
    const versionLabel = feedbackContext.updateFromVersion && feedbackContext.updateToVersion
      ? ` (${feedbackContext.updateFromVersion} → ${feedbackContext.updateToVersion})`
      : '';
    return {
      title: 'Generate update-flow feedback?',
      body,
      details: `This update report${versionLabel} should focus on which update guidance applied, where migration guidance was unclear, and what the framework should improve for future update flows. Review or redact the file before you submit it as a pull request.`
    };
  }

  return {
    title: 'Generate upstream feedback?',
    body,
    details: 'This report should capture reusable framework gaps, workflow friction, runtime issues, and cross-project patterns surfaced by this flow. Review or redact the file before you submit it as a pull request.'
  };
}

export interface FeedbackReportNotice {
  path: string;
  absolutePath: string;
}

/** Joins a workspace-relative report path onto the workspace root for display, keeping absolute paths as-is. */
export function joinWorkspacePath(workspaceRoot: string, relativePath: string): string {
  if (relativePath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(relativePath)) {
    return relativePath;
  }
  const sep = workspaceRoot.includes('\\') && !workspaceRoot.includes('/') ? '\\' : '/';
  return workspaceRoot.replace(/[\\/]+$/, '') + sep + relativePath.split('/').join(sep);
}

/** Non-null once the server has completed the improvement phase with a granted, written feedback report. */
export function feedbackReportNotice(flowRun: FlowRun | null): FeedbackReportNotice | null {
  const phase = flowRun?.improvementPhase;
  if (!flowRun || !phase || phase.status !== 'completed') return null;
  if (phase.feedbackConsent !== FEEDBACK_CONSENT_STATUS.GRANTED) return null;
  const path = phase.feedbackArtifactPath;
  if (!path) return null;
  return { path, absolutePath: joinWorkspacePath(flowRun.workspaceRoot, path) };
}
