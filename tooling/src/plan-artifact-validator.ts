import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { extractFrontmatter } from './utils.js';

const PLAN_FILENAME = '01-owner-workflow-plan.md';

// Allowed values for complexity axes — co-maintained with $A_SOCIETY_COMM_TEMPLATE_PLAN.
// When that template's required fields or allowed values change, update these constants.
const COMPLEXITY_ALLOWED = new Set(['low', 'moderate', 'elevated', 'high']);

// Allowed tier values: integers 1, 2, 3 and their string equivalents (YAML parses
// unquoted integers as numbers; quoted "1" as strings — both are accepted).
const TIER_ALLOWED = new Set<unknown>([1, 2, 3, '1', '2', '3']);

const COMPLEXITY_AXES = [
  'domain_spread',
  'shared_artifact_impact',
  'step_dependency',
  'reversibility',
  'scope_size',
] as const;

export interface PlanValidationError {
  field: string;
  issue: string;
}

export interface PlanValidationResult {
  valid: boolean;
  file_status: 'present' | 'absent';
  path_checked: string;
  errors: PlanValidationError[];
}

/**
 * Validates parsed YAML frontmatter against the approved plan artifact schema.
 *
 * Schema is co-maintained with $A_SOCIETY_COMM_TEMPLATE_PLAN.
 * When that template's required fields or allowed values change, update COMPLEXITY_ALLOWED,
 * TIER_ALLOWED, COMPLEXITY_AXES, and this function to match.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateFields(doc: unknown): PlanValidationError[] {
  const errors: PlanValidationError[] = [];

  if (!doc || typeof doc !== 'object') {
    errors.push({ field: 'document', issue: 'not an object' });
    return errors;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = doc as any;

  // type: must equal 'owner-workflow-plan'
  if (d.type !== 'owner-workflow-plan') {
    errors.push({
      field: 'type',
      issue: d.type == null ? 'null' : `invalid value: ${d.type}`,
    });
  }

  // date: must be non-null (format not validated — any non-null string passes)
  if (d.date == null) {
    errors.push({ field: 'date', issue: 'null' });
  }

  // complexity: object with five required axes, each non-null and in the allowed set
  if (!d.complexity || typeof d.complexity !== 'object') {
    for (const axis of COMPLEXITY_AXES) {
      errors.push({ field: `complexity.${axis}`, issue: 'missing field' });
    }
  } else {
    for (const axis of COMPLEXITY_AXES) {
      const val = d.complexity[axis];
      if (val == null) {
        errors.push({ field: `complexity.${axis}`, issue: 'null' });
      } else if (!COMPLEXITY_ALLOWED.has(val)) {
        errors.push({ field: `complexity.${axis}`, issue: `invalid value: ${val}` });
      }
    }
  }

  // tier: non-null, in {1, 2, 3} (integer or string representation)
  if (d.tier == null) {
    errors.push({ field: 'tier', issue: 'null' });
  } else if (!TIER_ALLOWED.has(d.tier)) {
    errors.push({ field: 'tier', issue: `invalid value: ${d.tier}` });
  }

  // path: non-empty list
  if (!Array.isArray(d.path)) {
    errors.push({ field: 'path', issue: d.path == null ? 'null' : 'not a list' });
  } else if (d.path.length === 0) {
    errors.push({ field: 'path', issue: 'empty list' });
  }

  // known_unknowns: list (empty list is valid)
  if (!Array.isArray(d.known_unknowns)) {
    errors.push({
      field: 'known_unknowns',
      issue: d.known_unknowns == null ? 'null' : 'not a list',
    });
  }

  return errors;
}

/**
 * Validates the plan artifact in the given record folder.
 *
 * Checks for `01-owner-workflow-plan.md` at `[recordFolderPath]/01-owner-workflow-plan.md`,
 * then validates its YAML frontmatter against the approved schema.
 *
 * Exit code contract (for CLI wrappers):
 *   0 — plan present and all required fields valid   (result.valid === true)
 *   1 — plan absent, or present with field failures  (result.valid === false)
 *   2 — parse error or invalid invocation            (throws Error)
 *
 * @throws {Error} on missing/empty recordFolderPath argument, unreadable file,
 *                 absent YAML frontmatter block, or malformed YAML.
 */
export function validatePlanArtifact(recordFolderPath: string): PlanValidationResult {
  if (!recordFolderPath) throw new Error('recordFolderPath is required');

  const absoluteFolderPath = path.resolve(recordFolderPath);
  const planPath = path.join(absoluteFolderPath, PLAN_FILENAME);

  // Presence check — absent plan returns exit-code-1 result, not a throw
  if (!fs.existsSync(planPath)) {
    return {
      valid: false,
      file_status: 'absent',
      path_checked: planPath,
      errors: [{ field: 'file', issue: 'absent' }],
    };
  }

  // Read — unreadable file is exit-code-2 (throw)
  let content: string;
  try {
    content = fs.readFileSync(planPath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read file: ${planPath} — ${(err as Error).message}`);
  }

  // Frontmatter extraction — absent block is exit-code-2 (throw)
  const yamlStr = extractFrontmatter(content);
  if (yamlStr === null) {
    throw new Error(`No YAML frontmatter found in ${planPath}`);
  }

  // YAML parse — malformed YAML is exit-code-2 (throw)
  let doc: unknown;
  try {
    doc = yaml.load(yamlStr);
  } catch (err) {
    throw new Error(`YAML parse error in ${planPath}: ${(err as Error).message}`);
  }

  // Field validation — failures are exit-code-1 (result.valid === false)
  const errors = validateFields(doc);

  return {
    valid: errors.length === 0,
    file_status: 'present',
    path_checked: planPath,
    errors,
  };
}
