import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { BackwardPassEntry, BackwardPassPlan } from '../framework-services/backward-pass-orderer.js';
import { IMPROVEMENT_CHOICE_MODE } from '../common/protocol-constants.js';
import type { ProtocolImprovementChoiceMode } from '../common/protocol-constants.js';
import { parseRoleIdentity } from '../common/role-id.js';

export const IMPROVEMENT_WORKFLOW_FILENAME = 'improvement.yaml';

export interface ImprovementWorkflowNode {
  id: string;
  role: string;
  step_index: number;
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

export function improvementNodeId(entry: BackwardPassEntry): string {
  return `${parseRoleIdentity(entry.role).instanceRoleId}-${entry.stepType}`;
}

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

  for (let stepIndex = 0; stepIndex < plan.length; stepIndex += 1) {
    const group = plan[stepIndex];
    for (const entry of group) {
      nodes.push({
        id: improvementNodeId(entry),
        role: entry.role,
        step_index: stepIndex,
        step_type: entry.stepType,
      });
    }
  }

  for (let stepIndex = 0; stepIndex < plan.length - 1; stepIndex += 1) {
    const fromGroup = plan[stepIndex];
    const toGroup = plan[stepIndex + 1];
    for (const fromEntry of fromGroup) {
      for (const toEntry of toGroup) {
        edges.push({
          from: improvementNodeId(fromEntry),
          to: improvementNodeId(toEntry),
        });
      }
    }
  }

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
