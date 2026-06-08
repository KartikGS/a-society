/**
 * Doc-contract test for a-society/runtime/INVOCATION.md.
 *
 * Checks that the operator-facing reference documents the startup and resume
 * semantics introduced by the startup-context-and-role-continuity flow.
 * Does not test runtime behavior directly; that is covered by integration tests.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const invocationPath = path.resolve(__dirname, '../../INVOCATION.md');
const doc = fs.readFileSync(invocationPath, 'utf8');

describe('invocation-doc', () => {
  it('documents that required reading is already loaded at session start', () => {
    expect(
      doc.includes('already loaded') || doc.includes('already present') || doc.includes('loaded once')
    ).toBe(true);
  });

  it('documents prompt-human resume behavior with same-node session reuse', () => {
    expect(doc).toContain('prompt-human');
    expect(
      doc.includes('resume') || doc.includes('reuse') || doc.includes('same node')
    ).toBe(true);
  });

  it('documents later same-role-instance return with role-instance-scoped session reuse', () => {
    expect(
      doc.includes('role-instance session') || doc.includes('role-instance-scoped session')
    ).toBe(true);
  });

  it('documents role instance parallel behavior', () => {
    expect(doc).toContain('owner_1');
    expect(doc).toContain('owner_2');
    expect(doc).toContain("runner's initial-node list");
    expect(doc).toContain('Distinct role instances may run in parallel');
  });

  it('documents explicit scheduler fields and distinct-role parallelism', () => {
    expect(doc).toContain('There is no persisted ready queue');
    expect(doc).toContain('runningNodes');
    expect(doc).toContain('awaitingHumanNodes');
    expect(
      doc.includes('Distinct role instances may run in parallel') || doc.includes('distinct-role nodes concurrently')
    ).toBe(true);
  });

  it('documents durable operator feed replay', () => {
    expect(doc).toContain('roles/<roleKey>/feed.json');
    expect(doc).toContain('browser feed');
    expect(doc).toContain('replayed');
  });
});
