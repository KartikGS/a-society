---
type: owner-to-runtime-developer-brief
date: "2026-04-01"
status: Active
---

**From:** Owner
**To:** Runtime Developer
**Subject:** orient-startup-simplification — behavioral prompt + terminology update
**Record:** `a-society/a-docs/records/20260401-orient-startup-simplification/`

---

## Context

The `a-society` binary (`runtime/bin/a-society.ts`) already does project listing, selection, and starts an Owner orient session. The user-facing "orient session" concept is being retired: from the user's perspective, they just start a-society and get the Owner. The orient mechanism remains as the underlying implementation, but:

1. The Owner's opening behavior should reflect its role as the project entry point — brief status from the log, then ask what the user wants to work on.
2. User-facing strings referencing "orient session" should be removed.
3. `runtime/INVOCATION.md` should document the `a-society` binary as the recommended interactive entry point, and update the `orient` command description to reflect its status as the underlying mechanism.

---

## Workflow Note

No proposal artifact is required before implementation begins. This flow has no Proposal phase — implement directly from this brief.

---

## Files Changed

| File | Action |
|---|---|
| `runtime/src/orient.ts` | Modify — 3 string changes (detailed below) |
| `runtime/INVOCATION.md` | Modify — `orient` description update + new `a-society` binary section (detailed below) |

---

## Implementation: `runtime/src/orient.ts`

**Change 1 — Initial message (line 37):**

Replace:
```
content: "A new orient session has started. Greet the user and await their direction."
```
With:
```
content: "A new session has started. Read the project log in your context and give a brief status of where the project is at, then ask what the user wants to work on."
```

**Change 2 — Startup log string (line 39):**

Replace:
```
console.log('\nStarting orient session...\n');
```
With:
```
console.log('\n');
```

**Change 3 — Close log string (line 95):**

Replace:
```
console.log('\nOrient session closed.');
```
With:
```
console.log('\nSession closed.');
```

---

## Implementation: `runtime/INVOCATION.md`

**Change 1 — `orient` command description:**

The current description reads: *"Loads a specific role context for an interactive session with full file tool sandboxing."*

Replace with: *"Underlying mechanism for interactive role sessions — loads role context, injects it as the system prompt, and opens a readline loop. For interactive Owner sessions, use the `a-society` binary instead; `orient` is the low-level entry point for programmatic or non-Owner role use."*

**Change 2 — Add `a-society` binary section:**

Add a new top-level section after the `## Commands` section (after the `flow-status` entry, before `## Session State`), titled `## Interactive Entry Point`. Content:

```
## Interactive Entry Point

### `a-society`

The recommended entry point for interactive Owner sessions. Discovers all A-Society-initialized projects in the current working directory, prompts for project selection, and starts an Owner session for the selected project via the `orient` mechanism.

- **Usage:** `a-society` (run from the workspace root containing your project folders)
- **Source:** `runtime/bin/a-society.ts`
- **Project detection:** A directory is recognized as an initialized A-Society project if it contains `a-docs/agents.md`.
```

---

## Acceptance Criteria

1. Running `a-society` → selecting a project → the Owner's first message is a brief status of where the project is at (drawn from the log in context), followed by asking what the user wants to work on. No "orient session" language in the output.
2. Session close prints `Session closed.` — no "orient" in the string.
3. `runtime/INVOCATION.md` documents the `a-society` binary as the recommended interactive entry point.
4. `orient` command description in `runtime/INVOCATION.md` reflects its role as the underlying mechanism.

---

## Open Questions

None.
