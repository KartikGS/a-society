import path from 'node:path';
import yaml from 'js-yaml';
import type { FlowRef, FlowRun } from '../common/types.js';
import { getWorkspaceRoot } from '../common/workspace.js';
import { validateGraph } from '../framework-services/workflow-graph-validator.js';
import * as SessionStore from '../orchestration/store.js';
import { getFlowRecordDir } from '../orchestration/state-paths.js';
import { CANONICAL_WORKFLOW_FILENAME, canonicalWorkflowDefinitionPath } from '../context/workflow-file.js';

/** The two workflow files a role can change: the record's workflow and the project's canonical definition. */
export function workflowFilePaths(flowRef: FlowRef): { recordWorkflowPath: string; canonicalWorkflowPath: string } {
  return {
    recordWorkflowPath: path.resolve(getFlowRecordDir(flowRef), CANONICAL_WORKFLOW_FILENAME),
    canonicalWorkflowPath: path.resolve(canonicalWorkflowDefinitionPath(path.resolve(getWorkspaceRoot()), flowRef.projectNamespace)),
  };
}

/**
 * Validates proposed workflow content. The record workflow is also checked against the
 * latest flow state, so a change cannot orphan running or completed nodes.
 */
export function validateWorkflowFileContent(content: string, resolvedPath: string, flowRef: FlowRef): string[] {
  let doc: unknown;
  try {
    doc = yaml.load(content);
  } catch (err) {
    return [`YAML parse error: ${(err as Error).message}`];
  }
  let flowState: FlowRun | null = null;
  if (workflowFilePaths(flowRef).recordWorkflowPath === resolvedPath) {
    try {
      flowState = SessionStore.loadFlowRun(flowRef);
    } catch (err) {
      return [`Cannot load latest flow state for workflow validation: ${(err as Error).message}`];
    }
    if (!flowState) {
      return ['Cannot load latest flow state for workflow validation: flow state was not found'];
    }
  }
  return validateGraph(doc, undefined, flowState);
}
