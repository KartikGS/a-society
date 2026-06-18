import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { BackwardPassEntry, BackwardPassPlan } from '../framework-services/backward-pass-orderer.js';
import { IMPROVEMENT_CHOICE_MODE } from '../../shared/protocol-constants.js';
import type { ProtocolImprovementChoiceMode } from '../../shared/protocol-constants.js';

export const IMPROVEMENT_WORKFLOW_FILENAME = 'improvement.yaml';

export interface ImprovementWorkflowNode {
  id: string;
  role: string;
  step_type: BackwardPassEntry['stepType'];
}

export interface ImprovementWorkflowEdge {
  from: string;
  to: string;
}

export interface ImprovementWorkflowDefinition {
  name: string;
  summary: string;
  nodes: ImprovementWorkflowNode[];
  edges: ImprovementWorkflowEdge[];
}

export interface ImprovementWorkflowDocument {
  workflow: ImprovementWorkflowDefinition;
}

type ImprovementWorkflowMode = Exclude<ProtocolImprovementChoiceMode, typeof IMPROVEMENT_CHOICE_MODE.NONE>;

export function improvementWorkflowPath(recordFolderPath: string): string {
  return path.join(recordFolderPath, IMPROVEMENT_WORKFLOW_FILENAME);
}

function improvementWorkflowName(mode: ImprovementWorkflowMode): string {
  return mode === IMPROVEMENT_CHOICE_MODE.PARALLEL ? 'Parallel Improvement' : 'Graph-Based Improvement';
}

export function buildImprovementWorkflowDocument(
  plan: BackwardPassPlan,
  mode: ImprovementWorkflowMode,
): ImprovementWorkflowDocument {
  const nodes: ImprovementWorkflowNode[] = [];
  const edges: ImprovementWorkflowEdge[] = [];

  for (const entry of plan.entries) {
    nodes.push({
      id: entry.role,
      role: entry.role,
      step_type: entry.stepType,
    });
  }

  edges.push(...plan.edges);

  return {
    workflow: {
      name: improvementWorkflowName(mode),
      summary: 'Runtime-generated visualization of the selected improvement backward-pass plan.',
      nodes,
      edges,
    },
  };
}

export function writeImprovementWorkflow(
  recordFolderPath: string,
  plan: BackwardPassPlan,
  mode: ImprovementWorkflowMode,
): string {
  const filePath = improvementWorkflowPath(recordFolderPath);
  const document = buildImprovementWorkflowDocument(plan, mode);
  fs.writeFileSync(filePath, yaml.dump(document, { lineWidth: 120 }), 'utf8');
  return filePath;
}

function isImprovementWorkflowDocument(value: unknown): value is ImprovementWorkflowDocument {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'workflow' in value &&
    (value as { workflow?: unknown }).workflow &&
    typeof (value as { workflow?: unknown }).workflow === 'object'
  );
}

export function readImprovementWorkflow(recordFolderPath: string): ImprovementWorkflowDefinition | null {
  const filePath = improvementWorkflowPath(recordFolderPath);
  if (!fs.existsSync(filePath)) return null;

  const parsed = yaml.load(fs.readFileSync(filePath, 'utf8'));
  if (!isImprovementWorkflowDocument(parsed)) return null;

  const workflow = parsed.workflow;
  if (!Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) return null;

  return workflow;
}
