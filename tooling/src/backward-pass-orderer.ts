import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { extractFrontmatter } from './utils.js';

export interface WorkflowPathEntry {
  role: string;
  phase: string;
}

export interface RecordWorkflowFrontmatter {
  workflow: {
    synthesis_role: string;
    path: WorkflowPathEntry[];
  };
}

export interface BackwardPassEntry {
  role: string;
  stepType: 'meta-analysis' | 'synthesis';
  sessionInstruction: 'existing-session' | 'new-session';
  prompt: string;
}

export type BackwardPassPlan = BackwardPassEntry[];

function createMetaAnalysisPrompt(
  role: string,
  position: number,
  total: number,
  nextRole: string,
  nextStepType: 'meta-analysis' | 'synthesis',
): string {
  const handoff = nextStepType === 'synthesis'
    ? `hand off to ${nextRole} (synthesis)`
    : `hand off to ${nextRole}`;

  return [
    `You are the ${role} agent for A-Society. Read a-society/a-docs/agents.md.`,
    'You are performing a backward pass findings review.',
    `Backward pass position: ${position} of ${total}`,
    `Read the prior artifacts in the record folder. Produce your findings at the next available sequence position. When complete, ${handoff}.`,
  ].join('\n\n');
}

function createSynthesisPrompt(role: string, position: number, total: number): string {
  return [
    `You are the ${role} agent for A-Society. Read a-society/a-docs/agents.md.`,
    `You are performing backward pass synthesis (position ${position} of ${total} - final step).`,
    'Read all findings artifacts in the record folder and produce the synthesis at the next available sequence position.',
  ].join('\n\n');
}

function parseRecordWorkflowFrontmatter(doc: unknown): RecordWorkflowFrontmatter {
  if (!doc || typeof doc !== 'object') {
    throw new Error('workflow.md frontmatter must parse to an object');
  }

  const rawWorkflow = (doc as Record<string, unknown>).workflow;
  if (!rawWorkflow || typeof rawWorkflow !== 'object') {
    throw new Error('workflow.md frontmatter must contain a workflow object');
  }

  const synthesisRole = (rawWorkflow as Record<string, unknown>).synthesis_role;
  if (typeof synthesisRole !== 'string' || synthesisRole.trim() === '') {
    throw new Error('workflow.synthesis_role must be a non-empty string');
  }

  const rawPath = (rawWorkflow as Record<string, unknown>).path;
  if (!Array.isArray(rawPath)) {
    throw new Error('workflow.path must be an array');
  }

  const normalizedPath = rawPath.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`workflow.path[${index}] must be an object`);
    }

    const role = (entry as Record<string, unknown>).role;
    const phase = (entry as Record<string, unknown>).phase;

    if (typeof role !== 'string' || role.trim() === '') {
      throw new Error(`workflow.path[${index}].role must be a non-empty string`);
    }

    if (typeof phase !== 'string' || phase.trim() === '') {
      throw new Error(`workflow.path[${index}].phase must be a non-empty string`);
    }

    return { role, phase };
  });

  return {
    workflow: {
      synthesis_role: synthesisRole,
      path: normalizedPath,
    },
  };
}

export function computeBackwardPassOrder(
  pathEntries: WorkflowPathEntry[],
  synthesisRole: string,
): BackwardPassPlan {
  const seenRoles = new Set<string>();
  const firstOccurrenceRoles: string[] = [];

  for (const entry of pathEntries) {
    if (!seenRoles.has(entry.role)) {
      seenRoles.add(entry.role);
      firstOccurrenceRoles.push(entry.role);
    }
  }

  const traversalRoles = firstOccurrenceRoles.reverse();
  const totalSteps = traversalRoles.length + 1;

  const plan: BackwardPassPlan = traversalRoles.map((role, index) => {
    const nextRole = index < traversalRoles.length - 1
      ? traversalRoles[index + 1]
      : synthesisRole;
    const nextStepType = index < traversalRoles.length - 1
      ? 'meta-analysis'
      : 'synthesis';

    return {
      role,
      stepType: 'meta-analysis' as const,
      sessionInstruction: 'existing-session' as const,
      prompt: createMetaAnalysisPrompt(role, index + 1, totalSteps, nextRole, nextStepType),
    };
  });

  plan.push({
    role: synthesisRole,
    stepType: 'synthesis',
    sessionInstruction: 'new-session',
    prompt: createSynthesisPrompt(synthesisRole, totalSteps, totalSteps),
  });

  return plan;
}

export function orderWithPromptsFromFile(recordFolderPath: string): BackwardPassPlan {
  const workflowFilePath = path.join(recordFolderPath, 'workflow.md');

  let content: string;
  try {
    content = fs.readFileSync(workflowFilePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read workflow.md at ${workflowFilePath}: ${(err as Error).message}`);
  }

  const yamlStr = extractFrontmatter(content);
  if (yamlStr === null) {
    throw new Error(`No YAML frontmatter found in ${workflowFilePath}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(yamlStr);
  } catch (err) {
    throw new Error(`Invalid YAML in ${workflowFilePath}: ${(err as Error).message}`);
  }

  const frontmatter = parseRecordWorkflowFrontmatter(parsed);
  return computeBackwardPassOrder(
    frontmatter.workflow.path,
    frontmatter.workflow.synthesis_role,
  );
}
