import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ContextInjectionService } from '../../src/context/injection.js';
import { saveCapabilitySelection } from '../../src/orchestration/capability-selection.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';

const tempDirs = new Set<string>();

function createWorkspace(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-context-injection-'));
  tempDirs.add(tmpDir);
  const projectDir = path.join(tmpDir, 'a-society');
  fs.mkdirSync(path.join(projectDir, 'a-docs', 'roles'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'a-docs', 'indexes'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'a-docs', 'roles', 'owner'), { recursive: true });

  fs.writeFileSync(
    path.join(projectDir, 'a-docs', 'roles', 'owner', 'required-readings.yaml'),
    `role: owner\nrequired_readings:\n  - $TEST_AGENTS\n  - $A_SOCIETY_RUNTIME_HANDOFF_CONTRACT\n  - $A_SOCIETY_RUNTIME_RECORDS_CONTRACT\n  - $TEST_OWNER_ROLE\n`
  );
  fs.writeFileSync(
    path.join(projectDir, 'a-docs', 'indexes', 'main.md'),
    '| `$TEST_AGENTS` | `a-docs/agents.md` |\n| `$TEST_OWNER_ROLE` | `a-docs/roles/owner/main.md` |\n'
  );
  fs.writeFileSync(path.join(projectDir, 'a-docs', 'agents.md'), 'Agent orientation');
  fs.writeFileSync(path.join(projectDir, 'a-docs', 'roles', 'owner', 'main.md'), 'Owner role doc');
  fs.writeFileSync(path.join(projectDir, 'artifact.md'), 'Artifact body');
  setWorkspaceRoot(tmpDir);
  return tmpDir;
}

function buildBundle(role = 'owner') {
  createWorkspace();
  return ContextInjectionService.buildContextBundle(
    'a-society',
    role,
    '/test/record',
    { projectNamespace: 'a-society', flowId: 'test-flow' }
  );
}

describe('context-injection', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
  });

  it('contains role announcement, runtime contracts, and required-reading files', () => {
    const bundle = buildBundle();

    expect(bundle.bundleContent).toContain('You are the owner agent for a-society.');
    expect(bundle.bundleContent).toContain('A-Society Runtime Handoff Contract');
    expect(bundle.bundleContent).toContain('A-Society Runtime Records Contract');
    expect(bundle.bundleContent).toContain('Agent orientation');
    expect(bundle.bundleContent).toContain('Owner role doc');
  });

  it('uses RUNTIME-LOADED REQUIRED READING heading and already-loaded statement', () => {
    const bundle = buildBundle();

    expect(bundle.bundleContent).toContain('--- RUNTIME-LOADED REQUIRED READING FOR owner IN a-society ---');
    expect(bundle.bundleContent).toContain('These files are already loaded into this session by the runtime.');
    expect(bundle.bundleContent).not.toContain('--- MANDATORY CONTEXT LOADING FOR');
  });

  it('loads base role required readings for role instances', () => {
    const bundle = buildBundle('owner_1');

    expect(bundle.bundleContent).toContain('You are the owner_1 agent for a-society.');
    expect(bundle.bundleContent).toContain('uses the owner role authority and required readings');
    expect(bundle.bundleContent).toContain('Loaded from base role owner.');
    expect(bundle.bundleContent).toContain('Agent orientation');
    expect(bundle.bundleContent).toContain('Owner role doc');
    expect(bundle.bundleContent).not.toContain('FILE ERROR');
  });

  it('does not include active artifact content', () => {
    const bundle = buildBundle();

    expect(bundle.bundleContent).not.toContain('Artifact body');
    expect(bundle.bundleContent).not.toContain('[FILE: a-society/artifact.md]');
    expect(bundle.bundleContent).not.toContain('ACTIVE WORKSPACE ARTIFACT');
  });

  it('injects selected skill summaries without skill bodies', () => {
    const tmpDir = createWorkspace();
    const skillDir = path.join(tmpDir, '.a-society', 'skills', 'review-writing');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: review-writing
description: Helps write reviews.
---

Full skill body should not be injected.
`, 'utf8');
    const ref = { projectNamespace: 'a-society', flowId: 'test-flow' };
    saveCapabilitySelection(ref, 'owner', {
      skills: ['review-writing'],
      mcpServers: [],
      selectedAt: '2026-06-13T00:00:00.000Z',
    });

    const bundle = ContextInjectionService.buildContextBundle('a-society', 'owner', '/test/record', ref);

    expect(bundle.bundleContent).toContain('--- AVAILABLE SKILLS FOR owner ---');
    expect(bundle.bundleContent).toContain('[SKILL: review-writing] Helps write reviews.');
    expect(bundle.bundleContent).toContain('SKILL.md: .a-society/skills/review-writing/SKILL.md');
    expect(bundle.bundleContent).not.toContain('Full skill body should not be injected.');
  });

  it('injects runtime session contracts once even if runtime variables appear in required readings', () => {
    const bundle = buildBundle();

    expect(bundle.bundleContent.match(/A-Society Runtime Handoff Contract/g) ?? []).toHaveLength(1);
    expect(bundle.bundleContent.match(/A-Society Runtime Records Contract/g) ?? []).toHaveLength(1);
    expect(bundle.bundleContent).not.toContain('FILE ERROR: Could not resolve or read $A_SOCIETY_RUNTIME_HANDOFF_CONTRACT');
    expect(bundle.bundleContent).not.toContain('FILE ERROR: Could not resolve or read $A_SOCIETY_RUNTIME_RECORDS_CONTRACT');
  });

  it('does not inject runtime directives', () => {
    const bundle = buildBundle();

    expect(bundle.bundleContent).not.toContain('--- RUNTIME DIRECTIVE ---');
    expect(bundle.bundleContent).not.toContain('You are beginning an intake session.');
    expect(bundle.bundleContent).not.toContain('When your work for this phase is complete');
    expect(bundle.bundleContent).not.toContain('Do NOT emit a handoff block yet.');
  });

  it('produces a deterministic hash', () => {
    createWorkspace();
    const ref = { projectNamespace: 'a-society', flowId: 'test-flow' };
    const bundle1 = ContextInjectionService.buildContextBundle('a-society', 'owner', '/test/record', ref);
    const bundle2 = ContextInjectionService.buildContextBundle('a-society', 'owner', '/test/record', ref);

    expect(bundle1.contextHash).toBe(bundle2.contextHash);
    expect(bundle1.contextHash.length).toBeGreaterThan(0);
  });
});
