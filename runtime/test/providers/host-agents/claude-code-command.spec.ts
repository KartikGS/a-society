import { describe, expect, it } from 'vitest';
import { buildClaudeCommand } from '../../../src/providers/host-agents/claude-code/command.js';
import type { HostTurnRequest } from '../../../src/providers/host-agents/types.js';

function request(overrides: Partial<HostTurnRequest> = {}): HostTurnRequest {
  return {
    conversationId: '11111111-1111-4111-8111-111111111111',
    resume: false,
    systemPromptFile: '/flow/roles/owner/host-system-prompt.md',
    message: 'Begin the node.',
    cwd: '/workspace/project',
    extraWritableDirs: ['/workspace/project/a-docs/records/r1'],
    permissions: { mode: 'read-only', allowedWritePaths: [], allowedCommands: [], allowedMcpTools: [], readOnlyRoots: ['/workspace'] },
    model: null,
    ...overrides,
  };
}

function valuesAfter(args: string[], flag: string): string[] {
  const start = args.indexOf(flag) + 1;
  const end = args.findIndex((arg, index) => index >= start && arg.startsWith('--'));
  return args.slice(start, end === -1 ? undefined : end);
}

describe('buildClaudeCommand', () => {
  it('starts a new conversation with the runtime-assigned id and the prompt file', () => {
    const { args } = buildClaudeCommand(request());
    expect(args.slice(0, 4)).toEqual(['-p', '--output-format', 'stream-json', '--verbose']);
    expect(valuesAfter(args, '--session-id')).toEqual(['11111111-1111-4111-8111-111111111111']);
    expect(args).not.toContain('--resume');
    expect(valuesAfter(args, '--append-system-prompt-file')).toEqual(['/flow/roles/owner/host-system-prompt.md']);
  });

  it('resumes by id and still re-passes the prompt file', () => {
    const { args } = buildClaudeCommand(request({ resume: true }));
    expect(valuesAfter(args, '--resume')).toEqual(['11111111-1111-4111-8111-111111111111']);
    expect(args).not.toContain('--session-id');
    expect(args).toContain('--append-system-prompt-file');
  });

  it('never puts the message in argv', () => {
    const command = buildClaudeCommand(request({ message: 'UNIQUE-MESSAGE-TEXT' }));
    expect(command.stdin).toBe('UNIQUE-MESSAGE-TEXT');
    expect(command.args.join(' ')).not.toContain('UNIQUE-MESSAGE-TEXT');
  });

  it('places the variadic flags last so nothing can be swallowed', () => {
    const { args } = buildClaudeCommand(request());
    const firstVariadic = Math.min(args.indexOf('--allowedTools'), args.indexOf('--add-dir'));
    const fixedFlags = ['--permission-mode', '--permission-prompts', '--append-system-prompt-file', '--session-id'];
    for (const flag of fixedFlags) expect(args.indexOf(flag)).toBeLessThan(firstVariadic);
  });

  it('maps read-only to default mode with prompts denied and workspace reads allowed', () => {
    const { args } = buildClaudeCommand(request());
    expect(valuesAfter(args, '--permission-mode')).toEqual(['default']);
    expect(valuesAfter(args, '--permission-prompts')).toEqual(['none']);
    expect(valuesAfter(args, '--allowedTools')).toEqual(['Read(//workspace/**)']);
    expect(valuesAfter(args, '--add-dir')).toEqual(['/workspace/project/a-docs/records/r1']);
  });

  it('maps granted edits, commands and MCP tools', () => {
    const { args } = buildClaudeCommand(request({
      permissions: {
        mode: 'edits',
        allowedWritePaths: [], allowedCommands: ['npm test', 'git status'],
        allowedMcpTools: ['mcp__docs__search'],
        readOnlyRoots: ['/workspace/'],
      },
    }));
    expect(valuesAfter(args, '--permission-mode')).toEqual(['acceptEdits']);
    expect(valuesAfter(args, '--allowedTools')).toEqual([
      'Read(//workspace/**)',
      'Bash(npm test)',
      'Bash(git status)',
      'mcp__docs__search',
    ]);
  });

  it('grants single files for writing without opening all edits', () => {
    const { args } = buildClaudeCommand(request({
      permissions: { mode: 'read-only', allowedWritePaths: ['/workspace/project/a.md'], allowedCommands: [], allowedMcpTools: [], readOnlyRoots: [] },
    }));
    expect(valuesAfter(args, '--permission-mode')).toEqual(['default']);
    expect(valuesAfter(args, '--allowedTools')).toEqual(['Edit(//workspace/project/a.md)']);
  });

  it('maps full access to edits plus all Bash, never bypassPermissions', () => {
    const { args } = buildClaudeCommand(request({
      permissions: { mode: 'edits-and-commands', allowedWritePaths: [], allowedCommands: ['npm test'], allowedMcpTools: [], readOnlyRoots: [] },
    }));
    expect(valuesAfter(args, '--permission-mode')).toEqual(['acceptEdits']);
    expect(valuesAfter(args, '--allowedTools')).toEqual(['Bash']);
    expect(args.join(' ')).not.toContain('bypassPermissions');
  });

  it('passes a model only when one is chosen and omits empty variadic flags', () => {
    expect(buildClaudeCommand(request()).args).not.toContain('--model');
    const { args } = buildClaudeCommand(request({
      model: 'sonnet',
      extraWritableDirs: [],
      permissions: { mode: 'read-only', allowedWritePaths: [], allowedCommands: [], allowedMcpTools: [], readOnlyRoots: [] },
    }));
    expect(valuesAfter(args, '--model')).toEqual(['sonnet']);
    expect(args).not.toContain('--allowedTools');
    expect(args).not.toContain('--add-dir');
  });
});
