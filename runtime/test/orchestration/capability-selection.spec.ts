import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  readCapabilitySelection,
  resolveCapabilityGate,
  resolveEffectiveCapabilities,
  saveCapabilityDimension,
  saveCapabilitySelection,
} from '../../src/orchestration/capability-selection.js';
import { getFlowDir } from '../../src/orchestration/state-paths.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';

const REF = { projectNamespace: 'test-project', flowId: 'test-flow' };

function makeWorkspace(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  setWorkspaceRoot(dir);
  return dir;
}

function writeSkill(workspaceRoot: string, name: string): void {
  const dir = path.join(workspaceRoot, '.a-society', 'skills', name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), `---
name: ${name}
description: ${name} description.
---

Body.
`, 'utf8');
}

describe('capability selection store', () => {
  it('requires selection when valid skills exist and no selection file is present', () => {
    const workspaceRoot = makeWorkspace('capability-gate-');
    try {
      writeSkill(workspaceRoot, 'review-writing');

      const gate = resolveCapabilityGate(workspaceRoot, REF, 'owner_2');
      expect(gate.kind).toBe('selection-required');
      if (gate.kind === 'selection-required') {
        expect(gate.skills.map((skill) => skill.name)).toEqual(['review-writing']);
        expect(gate.mcpServers).toEqual([]);
      }
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('round-trips explicit empty selection as the skip marker', () => {
    const workspaceRoot = makeWorkspace('capability-empty-');
    try {
      writeSkill(workspaceRoot, 'review-writing');
      saveCapabilitySelection(workspaceRoot, REF, 'owner_2', {
        skills: [],
        mcpServers: [],
        selectedAt: '2026-06-13T00:00:00.000Z',
      });

      expect(resolveCapabilityGate(workspaceRoot, REF, 'owner_2').kind).toBe('ready');
      expect(readCapabilitySelection(workspaceRoot, REF, 'owner_2')).toEqual({
        skills: [],
        mcpServers: [],
        skillsDecided: true,
        mcpDecided: true,
        selectedAt: '2026-06-13T00:00:00.000Z',
      });
      expect(fs.existsSync(path.join(getFlowDir(workspaceRoot, REF), 'roles', 'owner_2', 'capabilities.json'))).toBe(true);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('filters stale selected skills without re-prompting', () => {
    const workspaceRoot = makeWorkspace('capability-stale-');
    try {
      writeSkill(workspaceRoot, 'still-present');
      saveCapabilitySelection(workspaceRoot, REF, 'owner', {
        skills: ['deleted-skill', 'still-present'],
        mcpServers: ['deleted-server'],
        selectedAt: '2026-06-13T00:00:00.000Z',
      });

      expect(resolveCapabilityGate(workspaceRoot, REF, 'owner').kind).toBe('ready');
      expect(resolveEffectiveCapabilities(workspaceRoot, REF, 'owner')).toEqual({
        skills: ['still-present'],
        mcpServers: [],
        selectedAt: '2026-06-13T00:00:00.000Z',
      });
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('treats a malformed selection file as undecided and re-enters the gate', () => {
    const workspaceRoot = makeWorkspace('capability-malformed-');
    try {
      writeSkill(workspaceRoot, 'review-writing');
      const roleDir = path.join(getFlowDir(workspaceRoot, REF), 'roles', 'owner');
      fs.mkdirSync(roleDir, { recursive: true });
      fs.writeFileSync(path.join(roleDir, 'capabilities.json'), 'not json', 'utf8');

      expect(readCapabilitySelection(workspaceRoot, REF, 'owner')).toBeNull();
      // Consistent with the model gate: an unreadable selection re-prompts rather
      // than silently proceeding with no capabilities.
      expect(resolveCapabilityGate(workspaceRoot, REF, 'owner').kind).toBe('selection-required');
      expect(resolveEffectiveCapabilities(workspaceRoot, REF, 'owner').skills).toEqual([]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('persists one dimension at a time and keeps the other pending (mixed mode)', () => {
    const workspaceRoot = makeWorkspace('capability-dimension-');
    try {
      writeSkill(workspaceRoot, 'review-writing');

      // Decide skills only; MCP is configured but still pending.
      // (No MCP servers configured here, so simulate a skills-only decision and
      // assert the decided/pending provenance directly.)
      saveCapabilityDimension(workspaceRoot, REF, 'owner', 'skills', ['review-writing'], '2026-06-13T00:00:00.000Z');

      const selection = readCapabilitySelection(workspaceRoot, REF, 'owner');
      expect(selection).toEqual({
        skills: ['review-writing'],
        mcpServers: [],
        skillsDecided: true,
        mcpDecided: false,
        selectedAt: '2026-06-13T00:00:00.000Z',
      });

      // Skills decided + no MCP configured ⇒ gate is ready.
      expect(resolveCapabilityGate(workspaceRoot, REF, 'owner').kind).toBe('ready');
      expect(resolveEffectiveCapabilities(workspaceRoot, REF, 'owner').skills).toEqual(['review-writing']);

      // A later dimension write merges without clobbering the decided skills.
      saveCapabilityDimension(workspaceRoot, REF, 'owner', 'mcpServers', [], '2026-06-14T00:00:00.000Z');
      const merged = readCapabilitySelection(workspaceRoot, REF, 'owner');
      expect(merged?.skills).toEqual(['review-writing']);
      expect(merged?.skillsDecided).toBe(true);
      expect(merged?.mcpDecided).toBe(true);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });
});

