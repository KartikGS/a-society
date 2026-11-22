import { describe, expect, it } from 'vitest';
import { feedbackConsentCopy, feedbackReportNotice, joinWorkspacePath } from '../../ui/src/app/feedback-copy.js';
import type { FlowRun } from '../../shared/types.js';

function flow(phase: Record<string, unknown> | undefined, workspaceRoot = '/ws'): FlowRun {
  return { workspaceRoot, improvementPhase: phase } as unknown as FlowRun;
}

describe('feedbackConsentCopy', () => {
  it('falls back to the workspace feedback folder and says nothing is sent', () => {
    const copy = feedbackConsentCopy(null);
    expect(copy.body).toContain('`.a-society/feedback/`');
    expect(copy.body).toContain('Nothing is sent');
    expect(copy.details).toContain('submit it as a pull request');
  });
});

describe('feedbackReportNotice', () => {
  const done = { status: 'completed', feedbackConsent: 'granted', feedbackArtifactPath: '.a-society/feedback/x.md' };

  it('is non-null for a completed phase with consent granted', () => {
    expect(feedbackReportNotice(flow(done))).toEqual({
      path: '.a-society/feedback/x.md',
      absolutePath: '/ws/.a-society/feedback/x.md',
    });
  });

  it.each([
    ['pending consent', { ...done, feedbackConsent: 'pending' }],
    ['denied', { ...done, feedbackConsent: 'denied' }],
    ['running', { ...done, status: 'running' }],
    ['skipped', { ...done, status: 'skipped' }],
    ['empty path', { ...done, feedbackArtifactPath: '' }],
  ])('is null when %s', (_label, phase) => {
    expect(feedbackReportNotice(flow(phase))).toBeNull();
  });

  it('is null without a flow or phase', () => {
    expect(feedbackReportNotice(null)).toBeNull();
    expect(feedbackReportNotice(flow(undefined))).toBeNull();
  });

  it('joins a legacy path as-is', () => {
    expect(feedbackReportNotice(flow({ ...done, feedbackArtifactPath: 'a-society/feedback/x.md' }))?.absolutePath)
      .toBe('/ws/a-society/feedback/x.md');
  });
});

describe('joinWorkspacePath', () => {
  it('joins POSIX paths and trims trailing separators', () => {
    expect(joinWorkspacePath('/ws/', '.a-society/feedback/x.md')).toBe('/ws/.a-society/feedback/x.md');
  });
  it('joins Windows paths', () => {
    expect(joinWorkspacePath('C:\\ws', '.a-society/feedback/x.md')).toBe('C:\\ws\\.a-society\\feedback\\x.md');
  });
  it('returns absolute paths unchanged', () => {
    expect(joinWorkspacePath('/ws', '/abs/x.md')).toBe('/abs/x.md');
    expect(joinWorkspacePath('C:\\ws', 'D:\\r\\x.md')).toBe('D:\\r\\x.md');
  });
});
