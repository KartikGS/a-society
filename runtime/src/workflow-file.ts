import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const CANONICAL_WORKFLOW_FILENAME = 'workflow.yaml';
const PROJECT_WORKFLOW_RELATIVE_PATH = path.join('a-docs', 'workflow', 'main.yaml');

export interface WorkflowNode {
  id: string;
  role?: string;
  'human-collaborative'?: string;
  required_readings?: string[];
  guidance?: string[];
  inputs?: string[];
  work?: string[];
  outputs?: string[];
  transitions?: string[];
  notes?: string[];
}

export interface WorkflowEdge {
  from: string;
  to: string;
  artifact?: string;
}

export interface WorkflowDefinition {
  name?: string;
  summary?: string;
  use_when?: string;
  companion_docs?: string[];
  invariants?: Array<{ name: string; rule: string }>;
  escalation?: Array<{ situation: string; escalated_by: string; to: string }>;
  session_model?: string[];
  forward_pass_closure?: string[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export function canonicalWorkflowFilename(): string {
  return CANONICAL_WORKFLOW_FILENAME;
}

export function findWorkflowFilePath(recordFolderPath: string): string | null {
  const candidatePath = path.join(recordFolderPath, CANONICAL_WORKFLOW_FILENAME);
  return fs.existsSync(candidatePath) ? candidatePath : null;
}

export function parseWorkflowFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

export function canonicalWorkflowDefinitionPath(
  workspaceRoot: string,
  projectNamespace: string
): string {
  return path.join(workspaceRoot, projectNamespace, PROJECT_WORKFLOW_RELATIVE_PATH);
}

function isWorkflowDefinition(value: unknown): value is { workflow: WorkflowDefinition } {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'workflow' in value &&
    (value as { workflow?: unknown }).workflow &&
    typeof (value as { workflow?: unknown }).workflow === 'object'
  );
}

export function resolveFlowWorkflow(
  recordFolderPath: string,
  workspaceRoot: string,
  projectNamespace: string
): WorkflowDefinition {
  const recordWorkflowPath = findWorkflowFilePath(recordFolderPath);
  if (!recordWorkflowPath) {
    throw new Error(`Workflow file not found in ${recordFolderPath}`);
  }

  const recordDoc = parseWorkflowFile(recordWorkflowPath);
  if (!isWorkflowDefinition(recordDoc)) {
    throw new Error(`Workflow file at ${recordWorkflowPath} must contain a workflow object`);
  }

  const recordWorkflow = recordDoc.workflow;
  const canonicalPath = canonicalWorkflowDefinitionPath(workspaceRoot, projectNamespace);
  if (!fs.existsSync(canonicalPath)) {
    return recordWorkflow;
  }

  const canonicalDoc = parseWorkflowFile(canonicalPath);
  if (!isWorkflowDefinition(canonicalDoc)) {
    throw new Error(`Canonical workflow file at ${canonicalPath} must contain a workflow object`);
  }

  const canonicalWorkflow = canonicalDoc.workflow;
  const canonicalNodeById = new Map(
    (Array.isArray(canonicalWorkflow.nodes) ? canonicalWorkflow.nodes : [])
      .filter((node): node is WorkflowNode => Boolean(node && typeof node === 'object' && typeof node.id === 'string'))
      .map((node) => [node.id, node])
  );

  const recordNodes = Array.isArray(recordWorkflow.nodes) ? recordWorkflow.nodes : [];

  return {
    ...canonicalWorkflow,
    ...recordWorkflow,
    nodes: recordNodes.map((node) => {
      if (!node || typeof node !== 'object' || typeof node.id !== 'string') {
        return node;
      }

      const canonicalNode = canonicalNodeById.get(node.id);
      return canonicalNode ? { ...canonicalNode, ...node } : node;
    }),
    edges: Array.isArray(recordWorkflow.edges) ? recordWorkflow.edges : []
  };
}
