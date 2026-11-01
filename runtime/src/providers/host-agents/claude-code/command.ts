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

/** Descriptor redirects such as `2>&1` and `>/dev/null`, which Claude Code ignores when matching rules. */
const DESCRIPTOR_REDIRECT = /(^|\s)(\d*>&\d+|&>\s*\/dev\/null|\d*>>?\s*\/dev\/null)(?=\s|$)/g;

/**
 * Splits a command line into the pieces Claude Code checks one by one: on `;`, `&&`,
 * `||`, `|`, `&` and newlines outside quotes, backslash escapes, `$( … )` and backticks.
 */
export function splitShellCommand(command: string): string[] {
  const pieces: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let substitutionDepth = 0;
  let inBackticks = false;

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index];
    const next = command[index + 1];
    if (char === '\\' && quote !== "'") {
      current += char + (next ?? '');
      index += 1;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      current += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '`') {
      inBackticks = !inBackticks;
    } else if (char === '$' && next === '(') {
      substitutionDepth += 1;
      current += '$(';
      index += 1;
      continue;
    } else if (char === ')' && substitutionDepth > 0) {
      substitutionDepth -= 1;
    } else if (substitutionDepth === 0 && !inBackticks) {
      const isRedirect = char === '&' && (command[index - 1] === '>' || next === '>');
      if ((char === ';' || char === '|' || char === '&' || char === '\n') && !isRedirect) {
        pieces.push(current);
        current = '';
        if ((char === '|' || char === '&') && next === char) index += 1;
        continue;
      }
    }
    current += char;
  }
  pieces.push(current);
  return pieces.map((piece) => piece.trim()).filter((piece) => piece !== '');
}

/**
 * Rules that let Claude Code run one granted command. Claude Code matches each piece of a
 * compound command separately, with descriptor redirects dropped and quoting kept, so a
 * single whole-command rule only matches simple commands. Verified on 2.1.316.
 */
export function bashRulesForCommand(command: string): string[] {
  const pieces = splitShellCommand(command).map((piece) => piece.replace(DESCRIPTOR_REDIRECT, '$1').replace(/\s+/g, ' ').trim());
  return [...new Set([command.trim(), ...pieces].filter((rule) => rule !== '').map((rule) => `Bash(${rule})`))];
}

function allowedTools(permissions: HostPermissionProfile): string[] {
  const rules = permissions.readOnlyRoots.map(readRule);
  rules.push(...permissions.allowedWritePaths.map(editRule));
  if (permissions.mode === 'edits-and-commands') {
    rules.push('Bash');
  } else {
    rules.push(...permissions.allowedCommands.flatMap(bashRulesForCommand));
  }
  rules.push(...permissions.allowedMcpTools);
  return [...new Set(rules)];
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
