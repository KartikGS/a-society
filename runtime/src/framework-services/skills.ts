import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { SkillLoadResult, SkillSummary } from '../../shared/skills.js';

export type { SkillLoadResult, SkillSummary } from '../../shared/skills.js';

export type SkillFrontmatterResult =
  | { kind: 'ok'; name: string; description: string }
  | { kind: 'malformed'; reason: string };

const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isKebabCaseSkillName(name: string): boolean {
  return SKILL_NAME_PATTERN.test(name);
}

function skillsRoot(workspaceRoot: string): string {
  return path.join(path.resolve(workspaceRoot), '.a-society', 'skills');
}

function repoRelative(workspaceRoot: string, filePath: string): string {
  return path.relative(path.resolve(workspaceRoot), filePath).split(path.sep).join('/');
}

export function parseSkillMarkdownFrontmatter(content: string): SkillFrontmatterResult {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (!match) {
    return { kind: 'malformed', reason: 'SKILL.md must start with YAML frontmatter.' };
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(match[1]);
  } catch (error: any) {
    return { kind: 'malformed', reason: `Frontmatter YAML parse failed: ${error instanceof Error ? error.message : String(error)}` };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { kind: 'malformed', reason: 'Frontmatter must be a YAML object.' };
  }

  const raw = parsed as Record<string, unknown>;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';

  if (!name) {
    return { kind: 'malformed', reason: 'Frontmatter field "name" is required.' };
  }
  if (!isKebabCaseSkillName(name)) {
    return { kind: 'malformed', reason: 'Frontmatter field "name" must be kebab-case.' };
  }
  if (!description) {
    return { kind: 'malformed', reason: 'Frontmatter field "description" is required.' };
  }

  return { kind: 'ok', name, description };
}

function readSkillDirectory(workspaceRoot: string, folderName: string): SkillLoadResult {
  if (!isKebabCaseSkillName(folderName)) {
    return { kind: 'malformed', name: folderName, reason: 'Skill folder name must be kebab-case.' };
  }

  const skillMdPath = path.join(skillsRoot(workspaceRoot), folderName, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    return { kind: 'malformed', name: folderName, reason: 'Missing SKILL.md.' };
  }

  let content: string;
  try {
    content = fs.readFileSync(skillMdPath, 'utf8');
  } catch (error: any) {
    return { kind: 'malformed', name: folderName, reason: `Could not read SKILL.md: ${error instanceof Error ? error.message : String(error)}` };
  }

  const frontmatter = parseSkillMarkdownFrontmatter(content);
  if (frontmatter.kind === 'malformed') {
    return { kind: 'malformed', name: folderName, reason: frontmatter.reason };
  }
  if (frontmatter.name !== folderName) {
    return { kind: 'malformed', name: folderName, reason: `Frontmatter name "${frontmatter.name}" must match the skill folder name.` };
  }

  return {
    kind: 'ok',
    skill: {
      name: folderName,
      description: frontmatter.description,
      skillMdPath: repoRelative(workspaceRoot, skillMdPath),
    },
  };
}

export function listSkillLoadResults(workspaceRoot: string): SkillLoadResult[] {
  const root = skillsRoot(workspaceRoot);
  if (!fs.existsSync(root)) return [];

  const entries = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return entries.map((name) => readSkillDirectory(workspaceRoot, name));
}

export function listSkills(workspaceRoot: string): SkillSummary[] {
  return listSkillLoadResults(workspaceRoot)
    .filter((result): result is Extract<SkillLoadResult, { kind: 'ok' }> => result.kind === 'ok')
    .map((result) => result.skill);
}

export function readSkillSummary(workspaceRoot: string, name: string): SkillSummary | null {
  if (!isKebabCaseSkillName(name)) return null;
  const result = readSkillDirectory(workspaceRoot, name);
  return result.kind === 'ok' ? result.skill : null;
}
