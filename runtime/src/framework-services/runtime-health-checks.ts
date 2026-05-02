import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import yaml from 'js-yaml';
import { resolveProjectRecordsRoot, resolveProjectRoot } from '../projects/draft-flow.js';
import { parseRoleIdentity, toKebabCaseRoleId } from '../common/role-id.js';
import { validatePaths } from './path-validator.js';
import { validateWorkflowFile } from './workflow-graph-validator.js';
import { canonicalWorkflowDefinitionPath, parseWorkflowFile } from '../context/workflow-file.js';
import { RUNTIME_MANAGED_REQUIRED_READING_VARIABLES } from '../context/required-reading.js';

export interface RuntimeHealthCheckResult {
  ok: boolean;
  errors: string[];
}

export interface RuntimeHealthRepairGuidance {
  operatorSummary: string;
  modelRepairMessage: string;
}

type CompletionSignalKind = 'forward-pass-closed' | 'backward-pass-complete';

interface IndexEntry {
  variable: string;
  registeredPath: string;
}

interface OwnershipSurface {
  roleId: string;
  surfacePath: string;
}

function readIndexEntries(indexFilePath: string): IndexEntry[] {
  const content = fs.readFileSync(indexFilePath, 'utf8');
  const entries: IndexEntry[] = [];

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    if (trimmed.replace(/\|/g, '').replace(/-/g, '').trim() === '') continue;

    const cells = trimmed.split('|').map((cell) => cell.trim()).filter((cell) => cell !== '');
    if (cells.length < 2) continue;

    const variableMatch = cells[0].match(/`(\$[^`]+)`/);
    if (!variableMatch) continue;

    entries.push({
      variable: variableMatch[1],
      registeredPath: cells[1].trim().replace(/^`|`$/g, '')
    });
  }

  return entries;
}

function isDirectory(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function isFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function readYamlFile(filePath: string): unknown {
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

function addMissingFileError(errors: string[], label: string, filePath: string, workspaceRoot: string): void {
  errors.push(`${label} is missing at ${path.relative(workspaceRoot, filePath)}`);
}

function collectStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function collectRoleRequiredReadingVariables(filePath: string): string[] {
  const parsed = readYamlFile(filePath);

  if (Array.isArray(parsed)) {
    return parsed.filter((entry): entry is string => typeof entry === 'string');
  }

  if (!parsed || typeof parsed !== 'object') {
    return [];
  }

  const doc = parsed as Record<string, unknown>;
  return collectStringArray(doc.required_readings);
}

function collectOwnershipSurfacePaths(filePath: string): string[] {
  const parsed = readYamlFile(filePath);

  if (!parsed || typeof parsed !== 'object') {
    return [];
  }

  const doc = parsed as Record<string, unknown>;
  if (!Array.isArray(doc.surfaces)) {
    return [];
  }

  return doc.surfaces
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
    .map((entry) => entry.path)
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '');
}

function collectWorkflowVariables(workflowDoc: unknown): string[] {
  if (!workflowDoc || typeof workflowDoc !== 'object' || !('workflow' in workflowDoc)) {
    return [];
  }

  const workflow = (workflowDoc as { workflow?: unknown }).workflow;
  if (!workflow || typeof workflow !== 'object') {
    return [];
  }

  const vars = new Set<string>();
  const workflowRecord = workflow as Record<string, unknown>;

  for (const entry of collectStringArray(workflowRecord.companion_docs)) {
    vars.add(entry);
  }

  if (Array.isArray(workflowRecord.nodes)) {
    for (const node of workflowRecord.nodes) {
      if (!node || typeof node !== 'object') continue;
      const nodeRecord = node as Record<string, unknown>;
      for (const variable of collectStringArray(nodeRecord.required_readings)) {
        vars.add(variable);
      }
    }
  }

  return Array.from(vars);
}

function collectWorkflowRoles(workflowDoc: unknown): string[] {
  if (!workflowDoc || typeof workflowDoc !== 'object' || !('workflow' in workflowDoc)) {
    return [];
  }

  const workflow = (workflowDoc as { workflow?: unknown }).workflow;
  if (!workflow || typeof workflow !== 'object') {
    return [];
  }

  const roles = new Set<string>();
  const workflowRecord = workflow as Record<string, unknown>;
  if (!Array.isArray(workflowRecord.nodes)) {
    return [];
  }

  for (const node of workflowRecord.nodes) {
    if (!node || typeof node !== 'object') continue;
    const role = (node as Record<string, unknown>).role;
    if (typeof role === 'string' && role.trim() !== '') {
      roles.add(role);
    }
  }

  return Array.from(roles);
}

function collectWorkflowNodeReadingOverlapErrors(
  workflowDoc: unknown,
  roleRequiredReadingsByRoleId: Map<string, Set<string>>
): string[] {
  if (!workflowDoc || typeof workflowDoc !== 'object' || !('workflow' in workflowDoc)) {
    return [];
  }

  const workflow = (workflowDoc as { workflow?: unknown }).workflow;
  if (!workflow || typeof workflow !== 'object') {
    return [];
  }

  const workflowRecord = workflow as Record<string, unknown>;
  if (!Array.isArray(workflowRecord.nodes)) {
    return [];
  }

  const errors: string[] = [];

  for (const node of workflowRecord.nodes) {
    if (!node || typeof node !== 'object') continue;
    const nodeRecord = node as Record<string, unknown>;
    const nodeId = typeof nodeRecord.id === 'string' ? nodeRecord.id : '<unknown>';
    const roleName = typeof nodeRecord.role === 'string' ? nodeRecord.role : '<unknown>';
    const roleId = parseRoleIdentity(roleName).baseRoleId;
    const startupVariables = new Set<string>([
      ...RUNTIME_MANAGED_REQUIRED_READING_VARIABLES,
      ...(roleRequiredReadingsByRoleId.get(roleId) || [])
    ]);

    for (const variable of collectStringArray(nodeRecord.required_readings)) {
      if (!startupVariables.has(variable)) {
        continue;
      }

      if (roleRequiredReadingsByRoleId.get(roleId)?.has(variable)) {
        errors.push(
          `a-docs/workflow/main.yaml node "${nodeId}" repeats ${variable} in required_readings, but that variable is already startup-loaded for role "${roleName}" via a-docs/roles/${roleId}/required-readings.yaml`
        );
      } else {
        errors.push(
          `a-docs/workflow/main.yaml node "${nodeId}" repeats ${variable} in required_readings, but that variable is already injected by the runtime before node entry`
        );
      }
    }
  }

  return errors;
}

function addUnregisteredVariableErrors(
  errors: string[],
  ownerLabel: string,
  variableNames: string[],
  registeredVariables: Set<string>
): void {
  for (const variable of variableNames) {
    if (!registeredVariables.has(variable)) {
      errors.push(`${ownerLabel} references ${variable}, but that variable is not registered in a-docs/indexes/main.md`);
    }
  }
}

function normalizeOwnershipSurfacePath(surfacePath: string): string {
  return surfacePath.replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function fileIsCoveredByOwnershipSurface(filePath: string, surfacePath: string): boolean {
  const normalizedFilePath = filePath.replace(/\\/g, '/');
  const normalizedSurfacePath = normalizeOwnershipSurfacePath(surfacePath);

  if (normalizedSurfacePath.endsWith('/')) {
    return normalizedFilePath.startsWith(normalizedSurfacePath);
  }

  return normalizedFilePath === normalizedSurfacePath || normalizedFilePath.startsWith(`${normalizedSurfacePath}/`);
}

function readGitTrackedFiles(projectRoot: string): string[] | null {
  const topLevelResult = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: projectRoot,
    encoding: 'utf8'
  });

  if (topLevelResult.status !== 0) {
    return null;
  }

  const topLevel = topLevelResult.stdout.trim();
  if (!topLevel || path.resolve(topLevel) !== path.resolve(projectRoot)) {
    return null;
  }

  const listResult = spawnSync('git', ['ls-files', '-z'], {
    cwd: projectRoot,
    encoding: 'utf8'
  });

  if (listResult.status !== 0) {
    return null;
  }

  return listResult.stdout.split('\0').filter((entry) => entry.trim() !== '');
}

function shouldIgnoreOwnershipCoverageEntry(entryPath: string): boolean {
  const parts = entryPath.split(path.sep).filter(Boolean);
  return parts.some((part) => part === '.git' || part === 'node_modules' || part === 'dist' || part === '.state');
}

function walkProjectFiles(projectRoot: string, relativeDir = ''): string[] {
  const currentDir = path.join(projectRoot, relativeDir);
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const nextRelativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
    if (shouldIgnoreOwnershipCoverageEntry(nextRelativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...walkProjectFiles(projectRoot, nextRelativePath));
    } else if (entry.isFile()) {
      files.push(nextRelativePath.replace(/\\/g, '/'));
    }
  }

  return files;
}

function collectProjectFilesForOwnershipCoverage(projectRoot: string): string[] {
  return readGitTrackedFiles(projectRoot) || walkProjectFiles(projectRoot);
}

export function runRuntimeHealthChecks(
  workspaceRoot: string,
  projectNamespace: string
): RuntimeHealthCheckResult {
  const errors: string[] = [];
  const projectRoot = resolveProjectRoot(workspaceRoot, projectNamespace);
  const aDocsRoot = path.join(projectRoot, 'a-docs');
  const rolesRoot = path.join(aDocsRoot, 'roles');
  const improvementRoot = path.join(aDocsRoot, 'improvement');
  const workflowRoot = path.join(aDocsRoot, 'workflow');
  const workflowPath = canonicalWorkflowDefinitionPath(workspaceRoot, projectNamespace);
  const indexPath = path.join(aDocsRoot, 'indexes', 'main.md');
  const preferredRecordsRoot = path.join(projectRoot, 'a-docs', 'records');
  const legacyRecordsRoot = path.join(projectRoot, 'records');

  if (!isDirectory(aDocsRoot)) {
    errors.push(`Required a-docs root is missing at ${path.relative(workspaceRoot, aDocsRoot)}`);
    return { ok: false, errors };
  }

  if (!isDirectory(rolesRoot)) {
    errors.push(`Required roles folder is missing at ${path.relative(workspaceRoot, rolesRoot)}`);
  }

  if (!isDirectory(workflowRoot)) {
    errors.push(`Required workflow folder is missing at ${path.relative(workspaceRoot, workflowRoot)}`);
  }

  if (!isDirectory(improvementRoot)) {
    errors.push(`Required improvement folder is missing at ${path.relative(workspaceRoot, improvementRoot)}`);
  }

  if (!isFile(indexPath)) {
    addMissingFileError(errors, 'Required index file', indexPath, workspaceRoot);
  }

  if (!isFile(workflowPath)) {
    addMissingFileError(errors, 'Required workflow definition', workflowPath, workspaceRoot);
  }

  const metaAnalysisPath = path.join(improvementRoot, 'meta-analysis.md');
  const feedbackPath = path.join(improvementRoot, 'feedback.md');
  if (!isFile(metaAnalysisPath)) {
    addMissingFileError(errors, 'Required backward-pass meta-analysis instructions', metaAnalysisPath, workspaceRoot);
  }
  if (!isFile(feedbackPath)) {
    addMissingFileError(errors, 'Required backward-pass feedback instructions', feedbackPath, workspaceRoot);
  }

  const recordsRoot = resolveProjectRecordsRoot(workspaceRoot, projectNamespace);
  if (!isDirectory(recordsRoot)) {
    errors.push(
      `Required records root is missing; expected ${path.relative(workspaceRoot, preferredRecordsRoot)} or legacy ${path.relative(workspaceRoot, legacyRecordsRoot)}`
    );
  }

  let registeredVariables: Set<string> | null = null;
  const roleRequiredReadingsByRoleId = new Map<string, Set<string>>();
  const ownershipSurfaces: OwnershipSurface[] = [];
  if (isFile(indexPath)) {
    try {
      const indexEntries = readIndexEntries(indexPath);
      registeredVariables = new Set(indexEntries.map((entry) => entry.variable));
    } catch (error: any) {
      errors.push(`Cannot read a-docs/indexes/main.md: ${error.message}`);
    }

    try {
      const pathResults = validatePaths(indexPath, workspaceRoot);
      for (const result of pathResults) {
        if (result.status === 'missing') {
          errors.push(`a-docs/indexes/main.md registers ${result.variable} -> ${result.path}, but that path is missing`);
        } else if (result.status === 'parse-error') {
          errors.push(`a-docs/indexes/main.md entry for ${result.variable} could not be parsed`);
        }
      }
    } catch (error: any) {
      errors.push(`Path validation failed for a-docs/indexes/main.md: ${error.message}`);
    }
  }

  if (isDirectory(rolesRoot)) {
    const roleEntries = fs.readdirSync(rolesRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
    if (roleEntries.length === 0) {
      errors.push('a-docs/roles must contain at least one role folder');
    }

    for (const entry of roleEntries) {
      const roleId = entry.name;
      const rolePath = path.join(rolesRoot, roleId);
      if (toKebabCaseRoleId(roleId) !== roleId) {
        errors.push(`Role folder "${roleId}" must use kebab-case`);
      }

      const roleMainPath = path.join(rolePath, 'main.md');
      const roleOwnershipPath = path.join(rolePath, 'ownership.yaml');
      const roleRequiredReadingsPath = path.join(rolePath, 'required-readings.yaml');

      if (!isFile(roleMainPath)) {
        addMissingFileError(errors, `Role ${roleId} main document`, roleMainPath, workspaceRoot);
      }
      if (!isFile(roleOwnershipPath)) {
        addMissingFileError(errors, `Role ${roleId} ownership file`, roleOwnershipPath, workspaceRoot);
      }
      if (!isFile(roleRequiredReadingsPath)) {
        addMissingFileError(errors, `Role ${roleId} required readings file`, roleRequiredReadingsPath, workspaceRoot);
      } else {
        try {
          const variables = collectRoleRequiredReadingVariables(roleRequiredReadingsPath);
          roleRequiredReadingsByRoleId.set(roleId, new Set(variables));
          if (registeredVariables) {
            addUnregisteredVariableErrors(
              errors,
              `a-docs/roles/${roleId}/required-readings.yaml`,
              variables,
              registeredVariables
            );
          }
        } catch (error: any) {
          errors.push(`Cannot parse a-docs/roles/${roleId}/required-readings.yaml: ${error.message}`);
        }
      }

      if (isFile(roleOwnershipPath)) {
        try {
          for (const surfacePath of collectOwnershipSurfacePaths(roleOwnershipPath)) {
            ownershipSurfaces.push({ roleId, surfacePath });
          }
        } catch (error: any) {
          errors.push(`Cannot parse a-docs/roles/${roleId}/ownership.yaml: ${error.message}`);
        }
      }
    }
  }

  if (isFile(workflowPath)) {
    const validation = validateWorkflowFile(workflowPath);
    if (!validation.valid) {
      for (const validationError of validation.errors) {
        errors.push(`a-docs/workflow/main.yaml: ${validationError}`);
      }
    }

    try {
      const workflowDoc = parseWorkflowFile(workflowPath);
      if (registeredVariables) {
        addUnregisteredVariableErrors(
          errors,
          'a-docs/workflow/main.yaml',
          collectWorkflowVariables(workflowDoc),
          registeredVariables
        );
      }

      for (const overlapError of collectWorkflowNodeReadingOverlapErrors(
        workflowDoc,
        roleRequiredReadingsByRoleId
      )) {
        errors.push(overlapError);
      }

      if (isDirectory(rolesRoot)) {
        for (const roleName of collectWorkflowRoles(workflowDoc)) {
          const roleFolder = parseRoleIdentity(roleName).baseRoleId;
          const roleFolderPath = path.join(rolesRoot, roleFolder);
          if (!isDirectory(roleFolderPath)) {
            errors.push(`a-docs/workflow/main.yaml references role "${roleName}", but a-docs/roles/${roleFolder} is missing`);
          }
        }
      }
    } catch (error: any) {
      errors.push(`Cannot parse a-docs/workflow/main.yaml: ${error.message}`);
    }
  }

  if (ownershipSurfaces.length > 0) {
    const uncoveredFiles = collectProjectFilesForOwnershipCoverage(projectRoot)
      .filter((filePath) => !ownershipSurfaces.some((surface) => fileIsCoveredByOwnershipSurface(filePath, surface.surfacePath)))
      .sort();

    for (const uncoveredFile of uncoveredFiles) {
      errors.push(`Project file ${uncoveredFile} is not covered by any ownership.yaml surface`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function buildRuntimeHealthRepairGuidance(
  errors: string[],
  completionSignal: CompletionSignalKind
): RuntimeHealthRepairGuidance {
  const completionInstruction = completionSignal === 'forward-pass-closed'
    ? 'Do not close the forward pass until these issues are repaired.'
    : 'Do not mark the backward pass complete until these issues are repaired.';
  const retryInstruction = completionSignal === 'forward-pass-closed'
    ? 'When the repairs are complete, emit a `type: forward-pass-closed` handoff block again.'
    : 'When the repairs are complete, emit a `type: backward-pass-complete` handoff block again.';

  return {
    operatorSummary: 'A-docs runtime health checks failed',
    modelRepairMessage: [
      'Runtime health checks failed after your completion signal.',
      `Errors: ${errors.join('; ')}`,
      'Repair the existing project structure in place. Do not start a new flow or create a replacement project tree.',
      'Minimum runtime surfaces that must be healthy include:',
      '- a-docs/indexes/main.md with valid registered paths',
      '- a-docs/roles/<base-role-id>/{main.md, ownership.yaml, required-readings.yaml}',
      '- a-docs/workflow/main.yaml',
      '- a-docs/improvement/{meta-analysis.md, feedback.md}',
      '- a records root at a-docs/records/ or legacy records/',
      completionInstruction,
      retryInstruction
    ].join('\n')
  };
}
