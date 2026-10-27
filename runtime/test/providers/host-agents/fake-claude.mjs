#!/usr/bin/env node
// Fake `claude` CLI for host-agent tests. Emits Claude Code stream-json shaped output.
//
// Seam contract: writes output to stdout only, never waits on stdin beyond EOF, and
// exits with 143 within 100 ms of SIGTERM.
//
// Environment:
//   FAKE_CLAUDE_STATE      directory for conversation logs and invocations.jsonl (required for -p)
//   FAKE_CLAUDE_SCRIPT     JSON file: { "turns": [Turn, ...] }
//   FAKE_CLAUDE_VERSION    reported version (default 2.1.309)
//   FAKE_CLAUDE_LOGGED_IN  "0" reports logged out and fails turns with "Not logged in"
//
// Turn: { match?: regex on stdin, reply?: string, toolUses?: [{name, input}],
//         denials?: [{tool_name, tool_input}], error?: string, rateLimited?: boolean,
//         hang?: boolean, delayMs?: number }
// A turn whose `match` fits stdin wins; otherwise the turn at the invocation index is used.
/* global process, setInterval, setTimeout */
import fs from 'node:fs';
import path from 'node:path';

process.on('SIGTERM', () => process.exit(143));

const args = process.argv.slice(2);
const version = process.env.FAKE_CLAUDE_VERSION ?? '2.1.309';
const loggedIn = process.env.FAKE_CLAUDE_LOGGED_IN !== '0';
const emit = (event) => process.stdout.write(`${JSON.stringify(event)}\n`);

if (args[0] === '--version') {
  process.stdout.write(`${version} (Claude Code)\n`);
  process.exit(0);
}

if (args[0] === 'auth' && args[1] === 'status') {
  process.stdout.write(JSON.stringify(loggedIn
    ? { loggedIn: true, authMethod: 'claude.ai', apiProvider: 'firstParty', email: 'someone@example.com', subscriptionType: 'pro' }
    : { loggedIn: false, authMethod: 'none', apiProvider: 'firstParty' }));
  process.exit(loggedIn ? 0 : 1);
}

if (!args.includes('-p')) {
  process.stderr.write(`fake-claude: unsupported arguments ${args.join(' ')}\n`);
  process.exit(2);
}

const flag = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};

const stdin = fs.readFileSync(0, 'utf8');
const stateDir = process.env.FAKE_CLAUDE_STATE;
if (!stateDir) {
  process.stderr.write('fake-claude: FAKE_CLAUDE_STATE is not set\n');
  process.exit(2);
}
fs.mkdirSync(stateDir, { recursive: true });

const resumeId = flag('--resume');
const sessionId = resumeId ?? flag('--session-id');
const invocationsFile = path.join(stateDir, 'invocations.jsonl');
const invocationIndex = fs.existsSync(invocationsFile)
  ? fs.readFileSync(invocationsFile, 'utf8').split('\n').filter(Boolean).length
  : 0;
fs.appendFileSync(invocationsFile, `${JSON.stringify({ args, stdin, cwd: process.cwd() })}\n`);

const conversationFile = path.join(stateDir, `${sessionId}.json`);
if (resumeId && !fs.existsSync(conversationFile)) {
  const message = `No conversation found with session ID: ${resumeId}`;
  process.stderr.write(`${message}\n`);
  emit({ type: 'result', subtype: 'error_during_execution', is_error: true, session_id: resumeId, permission_denials: [], errors: [message] });
  process.exit(1);
}

emit({ type: 'system', subtype: 'init', session_id: sessionId, cwd: process.cwd(), model: 'fake-model', permissionMode: flag('--permission-mode') ?? 'default', apiKeySource: 'none', claude_code_version: version });

if (!loggedIn) {
  emit({ type: 'assistant', session_id: sessionId, message: { role: 'assistant', model: '<synthetic>', content: [{ type: 'text', text: 'Not logged in · Please run /login' }] } });
  emit({ type: 'result', subtype: 'success', is_error: true, result: 'Not logged in · Please run /login', session_id: sessionId, terminal_reason: 'api_error', permission_denials: [] });
  process.exit(1);
}

const script = process.env.FAKE_CLAUDE_SCRIPT ? JSON.parse(fs.readFileSync(process.env.FAKE_CLAUDE_SCRIPT, 'utf8')) : { turns: [] };
const turns = script.turns ?? [];
const turn = turns.find((candidate) => candidate.match && new RegExp(candidate.match).test(stdin))
  ?? turns[Math.min(invocationIndex, turns.length - 1)]
  ?? { reply: 'ok' };

const history = fs.existsSync(conversationFile) ? JSON.parse(fs.readFileSync(conversationFile, 'utf8')) : [];
history.push({ role: 'user', content: stdin });

const finish = () => {
  if (turn.rateLimited) {
    emit({ type: 'rate_limit_event', session_id: sessionId, rate_limit_info: { status: 'rejected', resetsAt: 1800000000, unifiedWindows: { five_hour: { utilization: 1 } } } });
    emit({ type: 'result', subtype: 'success', is_error: true, result: "You've hit your usage limit", session_id: sessionId, permission_denials: [] });
    process.exit(1);
  }
  if (turn.error) {
    emit({ type: 'result', subtype: 'success', is_error: true, result: turn.error, session_id: sessionId, permission_denials: [] });
    process.exit(1);
  }
  (turn.toolUses ?? []).forEach((use, index) => {
    const id = `toolu_fake_${index}`;
    emit({ type: 'assistant', session_id: sessionId, message: { role: 'assistant', content: [{ type: 'tool_use', id, name: use.name, input: use.input }] } });
    emit({ type: 'user', session_id: sessionId, message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content: 'done', is_error: Boolean(use.isError) }] } });
  });
  const reply = turn.reply ?? 'ok';
  const usage = { input_tokens: 2, cache_read_input_tokens: 1000, cache_creation_input_tokens: 10, output_tokens: 5 };
  emit({ type: 'assistant', session_id: sessionId, message: { role: 'assistant', content: [{ type: 'text', text: reply }], usage } });
  emit({ type: 'rate_limit_event', session_id: sessionId, rate_limit_info: { status: 'allowed', unifiedWindows: { five_hour: { utilization: 0.1 }, seven_day: { utilization: 0.05 } } } });
  history.push({ role: 'assistant', content: reply });
  fs.writeFileSync(conversationFile, JSON.stringify(history));
  emit({ type: 'result', subtype: 'success', is_error: false, result: reply, stop_reason: 'end_turn', session_id: sessionId, terminal_reason: 'completed', usage: { ...usage, iterations: [usage] }, permission_denials: turn.denials ?? [] });
  process.exit(0);
};

if (turn.hang) {
  setInterval(() => undefined, 1000);
} else if (turn.delayMs) {
  setTimeout(finish, turn.delayMs);
} else {
  finish();
}
