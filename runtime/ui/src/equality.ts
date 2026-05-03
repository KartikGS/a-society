import type { FlowRun, WorkflowGraph } from './types.js';

export function areStringArraysEqual(left?: string[], right?: string[]): boolean {
  if (left === right) return true;
  if (!left || !right) return left === right;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function areStringMapsEqual(
  left: Record<string, string>,
  right: Record<string, string>
): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  for (const key of leftKeys) {
    if (!(key in right)) return false;
    if (left[key] !== right[key]) return false;
  }

  return true;
}

function areStringArrayMapsEqual(
  left: Record<string, string[]>,
  right: Record<string, string[]>
): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  for (const key of leftKeys) {
    if (!(key in right)) return false;
    if (!areStringArraysEqual(left[key], right[key])) return false;
  }

  return true;
}

function areAwaitingHumanMapsEqual(
  left: FlowRun['awaitingHumanNodes'],
  right: FlowRun['awaitingHumanNodes']
): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  for (const key of leftKeys) {
    if (!(key in right)) return false;
    if (left[key].role !== right[key].role) return false;
    if (left[key].reason !== right[key].reason) return false;
  }

  return true;
}

function areImprovementPhasesEqual(
  left: FlowRun['improvementPhase'],
  right: FlowRun['improvementPhase']
): boolean {
  if (left === right) return true;
  if (!left || !right) return left === right;

  return (
    left.status === right.status &&
    left.mode === right.mode &&
    left.currentStep === right.currentStep &&
    left.improvementWorkflowPath === right.improvementWorkflowPath &&
    left.forwardPassClosure.recordFolderPath === right.forwardPassClosure.recordFolderPath &&
    left.forwardPassClosure.artifactPath === right.forwardPassClosure.artifactPath &&
    areStringArraysEqual(left.completedRoles, right.completedRoles) &&
    areStringMapsEqual(left.findingsProduced, right.findingsProduced) &&
    areStringArraysEqual(left.activeNodeIds, right.activeNodeIds) &&
    areStringArraysEqual(left.completedNodeIds, right.completedNodeIds)
  );
}

function areFeedbackContextsEqual(
  left: FlowRun['feedbackContext'],
  right: FlowRun['feedbackContext']
): boolean {
  if (left === right) return true;
  if (!left || !right) return left === right;

  return (
    left.kind === right.kind &&
    left.initializationMode === right.initializationMode &&
    areStringArraysEqual(left.updateReportPaths, right.updateReportPaths)
  );
}

function areConsentStatesEqual(
  left: FlowRun['consentState'],
  right: FlowRun['consentState']
): boolean {
  if (left === right) return true;
  if (!left || !right) return left === right;

  const leftCommands = left.bash?.allowedCommands ?? {};
  const rightCommands = right.bash?.allowedCommands ?? {};
  const leftCommandKeys = Object.keys(leftCommands);
  const rightCommandKeys = Object.keys(rightCommands);

  if (leftCommandKeys.length !== rightCommandKeys.length) return false;
  for (const key of leftCommandKeys) {
    if (!(key in rightCommands)) return false;
    if (leftCommands[key].command !== rightCommands[key].command) return false;
    if (leftCommands[key].grantedAt !== rightCommands[key].grantedAt) return false;
  }

  return (
    left.mode === right.mode &&
    Boolean(left.fileWrites?.allowAllEditsThisFlow) === Boolean(right.fileWrites?.allowAllEditsThisFlow)
  );
}

export function areFlowRunsEqual(left: FlowRun | null, right: FlowRun | null): boolean {
  if (left === right) return true;
  if (!left || !right) return left === right;

  return (
    left.flowId === right.flowId &&
    left.workspaceRoot === right.workspaceRoot &&
    left.projectNamespace === right.projectNamespace &&
    left.recordFolderPath === right.recordFolderPath &&
    left.recordName === right.recordName &&
    left.recordSummary === right.recordSummary &&
    left.status === right.status &&
    left.stateVersion === right.stateVersion &&
    areStringArraysEqual(left.readyNodes, right.readyNodes) &&
    areStringArraysEqual(left.runningNodes, right.runningNodes) &&
    areAwaitingHumanMapsEqual(left.awaitingHumanNodes, right.awaitingHumanNodes) &&
    areStringArraysEqual(left.completedNodes, right.completedNodes) &&
    areStringArraysEqual(left.visitedNodeIds, right.visitedNodeIds) &&
    areStringMapsEqual(left.completedEdgeArtifacts, right.completedEdgeArtifacts) &&
    areStringArrayMapsEqual(left.pendingNodeArtifacts, right.pendingNodeArtifacts) &&
    areImprovementPhasesEqual(left.improvementPhase, right.improvementPhase) &&
    areFeedbackContextsEqual(left.feedbackContext, right.feedbackContext) &&
    areConsentStatesEqual(left.consentState, right.consentState)
  );
}

export function areWorkflowGraphsEqual(
  left: WorkflowGraph | null,
  right: WorkflowGraph | null
): boolean {
  if (left === right) return true;
  if (!left || !right) return left === right;

  if (left.nodes.length !== right.nodes.length || left.edges.length !== right.edges.length) {
    return false;
  }

  if (left.name !== right.name) return false;
  if (left.summary !== right.summary) return false;

  for (let index = 0; index < left.nodes.length; index += 1) {
    if (left.nodes[index].id !== right.nodes[index].id) return false;
    if (left.nodes[index].role !== right.nodes[index].role) return false;
    if (left.nodes[index].step_index !== right.nodes[index].step_index) return false;
    if (left.nodes[index].step_type !== right.nodes[index].step_type) return false;
  }

  for (let index = 0; index < left.edges.length; index += 1) {
    if (left.edges[index].from !== right.edges[index].from) return false;
    if (left.edges[index].to !== right.edges[index].to) return false;
  }

  return true;
}
