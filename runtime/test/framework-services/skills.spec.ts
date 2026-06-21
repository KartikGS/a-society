import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { listSkillLoadResults, listSkills, readSkillSummary } from '../../src/framework-services/skills.js';

function makeWorkspace(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeSkill(workspaceRoot: string, name: string, content: string): void {
  const dir = path.join(workspaceRoot, '.a-society', 'skills', name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), content, 'utf8');
}

describe('skills framework service', () => {
  afterEach(() => {
    clearWorkspaceRoot();
  });

  it('lists valid skills from SKILL.md frontmatter without loading bodies', () => {
    const workspaceRoot = makeWorkspace('skills-valid-');
    try {
      setWorkspaceRoot(workspaceRoot);
      writeSkill(workspaceRoot, 'review-writing', `---
name: review-writing
description: Helps write concise reviews.
---

Long body that should stay out of summaries.
`);

      expect(listSkills()).toEqual([{
        name: 'review-writing',
        description: 'Helps write concise reviews.',
        skillMdPath: '.a-society/skills/review-writing/SKILL.md',
      }]);
      expect(readSkillSummary('review-writing')?.description).toBe('Helps write concise reviews.');
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('surfaces malformed skills while omitting them from the valid list', () => {
    const workspaceRoot = makeWorkspace('skills-malformed-');
    try {
      setWorkspaceRoot(workspaceRoot);
      writeSkill(workspaceRoot, 'missing-description', `---
name: missing-description
---

Body.
`);
      fs.mkdirSync(path.join(workspaceRoot, '.a-society', 'skills', 'missing-file'), { recursive: true });

      const results = listSkillLoadResults();
      expect(results).toEqual([
        { kind: 'malformed', name: 'missing-description', reason: 'Frontmatter field "description" is required.' },
        { kind: 'malformed', name: 'missing-file', reason: 'Missing SKILL.md.' },
      ]);
      expect(listSkills()).toEqual([]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });
});
