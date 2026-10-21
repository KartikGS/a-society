# A-Society: Host Agent Capability Matrix

This document is the standing reference for the host coding agents that agent mode can run role turns on. It records what each supported host can do headlessly, the minimum bar a host must meet, and the restrictions an adapter must encode. It informs the agent-mode design in `$A_SOCIETY_EXECUTABLE_ARCHITECTURE`. The adapter code is authoritative for exact supported version ranges; this document is authoritative for the capability evidence behind them.

Evidence was gathered on 2026-10-21 by headless probes against the installed CLIs, plus the vendors' current documentation (links at the end).

---

## 1. Required Core (minimum bar)

A host is supportable only if it can do all of the following without a TTY:

| # | Capability | Why A-Society needs it |
|---|---|---|
| R1 | Run one turn non-interactively and exit | One turn per role activation, driven by the orchestrator |
| R2 | Return the final assistant text in machine-readable output | Handoff parsing (`HandoffInterpreter.parse`) |
| R3 | Resume a conversation by id | Role continuity across nodes, human replies, repair messages, backward pass |
| R4 | Accept role context larger than one command-line argument | Context bundles reach ~106 KiB (A-Society Owner); Linux caps one argument at 128 KiB |
| R5 | Report failure distinctly from success (exit code or result flag) | Error mapping to parked or failed turns |
| R6 | Stop cleanly on SIGTERM, leaving the conversation resumable | Operator stop |
| R7 | Run with permissions fixed in advance, with nothing waiting on a prompt | Headless turns have no one at the host's prompt |
| R8 | Report the installed version | Version gate ("we decide what we support") |

## 2. Optional Capabilities (declared per adapter)

| Capability | Fallback when absent |
|---|---|
| Append to the host's system prompt | Send the bundle in the role's first message |
| Runtime-assigned conversation id | Read the id from the first event |
| Per-turn model flag | Host default model only; role model gate is skipped |
| Model listing | Adapter-declared static aliases |
| Structured permission-denial report | Treat denials as ordinary tool failures in the reply text |
| Extra writable directories | Work only inside the working directory |
| Live event stream (text, tool calls) | Feed shows only the final reply |
| Usage and rate-limit reporting | No usage indicator |
| Auth-source reporting | Settings cannot warn about billing source |

---

## 3. Matrix

| Capability | Claude Code 2.1.306 (probed) | Codex CLI 0.141.0 (docs; live probe blocked, see §4) |
|---|---|---|
| R1 headless turn | `claude -p` | `codex exec` |
| R2 final text | `--output-format stream-json --verbose`; `result` event carries `result`, `is_error`, `subtype`, `terminal_reason` | `--json` JSONL (`thread.started`, `turn.*`, `item.*`, `error`); `-o <file>` writes the last message |
| R3 resume | `--resume <id>`; same id is kept; missing id → exit 1, stderr `No conversation found with session ID: …` | `codex exec resume <SESSION_ID> [PROMPT]` |
| Runtime-assigned id | Yes: `--session-id <uuid>` | No: read `thread_id` from `thread.started` |
| R4 large context | `--append-system-prompt-file <path>` (150 KiB verified); the argument form fails with `E2BIG` | `-c model_instructions_file=<path>` replaces built-in instructions; `-c developer_instructions=<string>` adds to them (string form is subject to the argument limit) |
| System prompt across resume | Recorded on the first request and reused on every resume without re-passing (`--system-prompt-snapshot on`, default), until host compaction re-renders it | Not verified |
| R5 failure reporting | Exit 1 + `is_error: true`; not logged in → `result: "Not logged in · Please run /login"`, `terminal_reason: api_error` | Exit 1 + `turn.failed` / `error` events |
| R6 stop | SIGTERM ends the turn (running tool gets 137); `--resume` afterwards keeps the full history | Not verified |
| R7 fixed permissions | `--permission-mode` (`default`, `acceptEdits`, `auto`, `bypassPermissions`, `dontAsk`, `plan`, `manual`) with `--permission-prompts none`: anything that would prompt is denied | `--sandbox read-only\|workspace-write\|danger-full-access` + `approval_policy=never` |
| Denial report | `result.permission_denials[]` with `tool_name` and `tool_input` | Not structured (a failed command item) |
| Extra dirs | `--add-dir <dir…>` (variadic: the prompt must go on stdin) | `--add-dir <DIR>` (writable) |
| Model | `--model <alias\|name>` (`haiku`, `sonnet`, `opus`, `fable`, full names) | `-m <model>`; catalog via `codex debug models` |
| Live events | `assistant`, `user` (tool results), `system` events; `--include-partial-messages` for deltas | `item.started` / `item.completed` |
| Usage / limits | `result.usage`, `total_cost_usd`, and a `rate_limit_event` with five-hour and seven-day utilization | `turn.completed.usage` |
| Auth source | `system/init.apiKeySource` (`none` = subscription login); `claude auth status --json` (`authMethod`, `subscriptionType`) | `codex login status` (e.g. "Logged in using ChatGPT") |
| R8 version | `claude --version` | `codex --version` |
| Session storage | `~/.claude/projects/<cwd-slug>/<session-id>.jsonl`; deleted after `cleanupPeriodDays` | `$CODEX_HOME` (`~/.codex/sessions`); `--ephemeral` disables |

Both hosts meet the required core on paper. Only Claude Code is verified end to end.

---

## 4. Restrictions Adapters Must Encode

- **Auth precedence (Claude Code).** If `ANTHROPIC_API_KEY` is set, Claude Code uses it instead of the subscription login, and headless runs always use it. The adapter does not strip or set credentials (A-Society never handles host auth); it reports the detected auth source so the operator is not surprised by API billing.
- **Variadic flags (Claude Code).** `--add-dir`, `--allowedTools` and similar flags consume following arguments, so the prompt goes on stdin, never as a trailing argument.
- **Context by file only.** Bundles go by file (`--append-system-prompt-file`, `model_instructions_file`), never as an argument.
- **Host read-only allowlists.** In `acceptEdits`, Claude Code runs filesystem commands inside the working directories (e.g. `touch`, `date`) without asking; network and other commands are denied. A-Society's own command allowlist does not apply in agent mode.
- **Reads outside working dirs are denied** under `--permission-prompts none` unless added with `--add-dir` or allowed by a rule.
- **Nested launch.** Claude Code runs headlessly even when started from inside another Claude Code session (`CLAUDECODE` set); no environment scrubbing is needed.
- **Silent auto-update (Claude Code).** The CLI moved from 2.1.304 to 2.1.306 within one day of probing. Version gates must check the installed version at every launch, not only at configuration time.
- **Codex models and ChatGPT sign-in.** On the probed machine, Codex 0.141.0 rejected every model with "not supported when using Codex with a ChatGPT account" (both the configured `gpt-5.6-sol` and the catalog's `gpt-5.5`). The likely cause is an outdated CLI; Codex needs re-probing on a current version before an adapter is built.
- **Codex default sandbox.** `codex exec` is read-only by default and requires a git repository unless `--skip-git-repo-check` is passed.

---

## 5. Terms of Use (facts only)

- **Anthropic.** Claude Code's legal page says OAuth (subscription) authentication supports "ordinary use of Claude Code", that "Anthropic does not permit third-party developers to … route requests through Free, Pro, or Max plan credentials on behalf of their users", and that this does not "prevent an end user from signing in to the unmodified Claude Code binary with their own Claude subscription". The Agent SDK overview bars third-party products from offering claude.ai login or rate limits without prior approval. Advertised Pro and Max limits "assume ordinary, individual usage".
- **OpenAI.** Codex docs call API keys "the right default for automation" and describe ChatGPT-plan use in CI as an advanced path for users "who need ChatGPT/Codex rate limits instead of API key usage". No Codex-specific terms on third-party orchestration of a ChatGPT plan were found.

The project's stance on these terms is recorded in `$A_SOCIETY_ARCHITECTURE`, not here.

---

## Sources

- Claude Code: [legal and compliance](https://code.claude.com/docs/en/legal-and-compliance), [run programmatically](https://code.claude.com/docs/en/headless), [settings reference](https://code.claude.com/docs/en/settings-reference), [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview), [Pro/Max plan and `ANTHROPIC_API_KEY`](https://support.claude.com/en/articles/11145838)
- Codex: [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), [config reference](https://learn.chatgpt.com/docs/config-file/config-reference), [approvals and security](https://learn.chatgpt.com/codex/agent-approvals-security), [sign in with ChatGPT](https://learn.chatgpt.com/codex/sign-in-with-chatgpt)
