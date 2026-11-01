import type { HostPermissionProfile, HostTurnRequest } from '../types.js';

export interface ClaudeCommand {
  args: string[];
  stdin: string;
}

const PERMISSION_MODE: Record<HostPermissionProfile['mode'], 'default' | 'acceptEdits'> = {
  'read-only': 'default',
  edits: 'acceptEdits',
  'edits-and-commands': 'acceptEdits',
};

/** Claude Code permission rules write absolute paths with a leading `//`. */
function readRule(root: string): string {
  return `Read(/${root.replace(/\/+$/, '')}/**)`;
}

/** Edit rules cover every built-in file-editing tool. */
function editRule(file: string): string {
  return `Edit(/${file})`;
}

function allowedTools(permissions: HostPermissionProfile): string[] {
  const rules = permissions.readOnlyRoots.map(readRule);
  rules.push(...permissions.allowedWritePaths.map(editRule));
  if (permissions.mode === 'edits-and-commands') {
    rules.push('Bash');
  } else {
    rules.push(...permissions.allowedCommands.map((command) => `Bash(${command})`));
  }
  rules.push(...permissions.allowedMcpTools);
  return rules;
}

/**
 * Builds the `claude -p` invocation for one turn. Pure: no I/O.
 *
 * The prompt always goes on stdin. `--allowedTools` and `--add-dir` are variadic and
 * would swallow a trailing prompt argument, so they come last.
 */
export function buildClaudeCommand(req: HostTurnRequest): ClaudeCommand {
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages'];

  args.push(req.resume ? '--resume' : '--session-id', req.conversationId);
  if (req.systemPromptFile) args.push('--append-system-prompt-file', req.systemPromptFile);
  if (req.model) args.push('--model', req.model);
  if (req.effort) args.push('--effort', req.effort);
  args.push('--permission-mode', PERMISSION_MODE[req.permissions.mode], '--permission-prompts', 'none');

  const tools = allowedTools(req.permissions);
  if (tools.length > 0) args.push('--allowedTools', ...tools);
  if (req.extraWritableDirs.length > 0) args.push('--add-dir', ...req.extraWritableDirs);

  return { args, stdin: req.message };
}
