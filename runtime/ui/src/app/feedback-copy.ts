import type { FlowRun } from '../../../shared/types.js';

export function feedbackConsentCopy(flowRun: FlowRun | null): { title: string; body: string; details: string } {
  const artifactPath = flowRun?.improvementPhase?.feedbackArtifactPath ?? 'a-society/feedback/';
  const feedbackContext = flowRun?.feedbackContext;

  if (feedbackContext?.kind === 'initialization') {
    const modeLabel = feedbackContext.initializationMode === 'greenfield' ? 'greenfield' : 'takeover';
    return {
      title: 'Generate initialization feedback?',
      body: `Meta-analysis is complete. If you approve, the feedback agent will spend one more turn writing an upstream report directly to \`${artifactPath}\`.`,
      details: `This ${modeLabel} initialization report should focus on what the runtime inferred, what required human input, and where initialization guidance or scaffolding created friction. Review or redact the file before sharing it upstream in a manual PR.`
    };
  }

  if (feedbackContext?.kind === 'update') {
    const versionLabel = feedbackContext.updateFromVersion && feedbackContext.updateToVersion
      ? ` (${feedbackContext.updateFromVersion} → ${feedbackContext.updateToVersion})`
      : '';
    return {
      title: 'Generate update-flow feedback?',
      body: `Meta-analysis is complete. If you approve, the feedback agent will spend one more turn writing an upstream report directly to \`${artifactPath}\`.`,
      details: `This update report${versionLabel} should focus on which update guidance applied, where migration guidance was unclear, and what the framework should improve for future update flows. Review or redact the file before sharing it upstream in a manual PR.`
    };
  }

  return {
    title: 'Generate upstream feedback?',
    body: `Meta-analysis is complete. If you approve, the feedback agent will spend one more turn writing an upstream report directly to \`${artifactPath}\`.`,
    details: 'This report should capture reusable framework gaps, workflow friction, runtime issues, and cross-project patterns surfaced by this flow. Review or redact the file before sharing it upstream in a manual PR.'
  };
}
