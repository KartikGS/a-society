**Subject:** Phase 0 architecture design — orient command and a-society CLI entry point
**Status:** BRIEFED
**Date:** 2026-03-27

---

## Background

The user wants to ship A-Society with a user-facing experience described by the following README steps:

1. Clone the project
2. Run the installation script
3. Type `a-society`
4. Select a project from the list — the owner agent for that project loads automatically

This requires two new capabilities on top of the existing runtime:

**1. A new `orient` command on the runtime CLI** — starts an interactive owner agent session for a selected project without requiring a pre-existing workflow document, record folder, or starting artifact. The existing `start-flow`, `resume-flow`, and `flow-status` commands all assume an active flow is already in motion. `orient` is a distinct entry point: context injection only, no workflow graph routing.

**2. A new `a-society` CLI binary** — installed to PATH by an install script. When invoked:
- Scans the workspace for initialized projects (presence of `a-docs/agents.md` is the signal)
- Presents an interactive selection menu
- Calls the runtime's `orient` command for the selected project, loading the Owner role

The runtime already has the LLM Gateway (Anthropic API), Context Injection Service (roleContextRegistry), and Session Store. The design question is how to extend — not replace — those components to serve this new entry point.

---

## Scope

**In scope:**
- Architecture design for the `orient` command: session model, how it uses (or differs from) the existing FlowRun model, LLM Gateway reuse, and what context is injected
- Architecture design for the `a-society` CLI binary: where it lives, how it is structured, how it calls into the runtime
- Architecture design for the install script: approach (npm link, shell symlink, global install), what it installs, and what the user must do post-install
- Project discovery design: how the binary finds initialized projects, what signals it uses, and how edge cases are handled
- Interface design for the `orient` command: its CLI signature, arguments, and how it integrates with the existing `cli.ts` entry point
- Assessment of whether the orient session requires a Session Store entry or can be ephemeral

**Out of scope:**
- Implementation — this brief is for the Phase 0 design document only
- Changes to the existing `start-flow`, `resume-flow`, or `flow-status` commands
- Changes to the documentation layer (`general/` or `a-docs/`) — if the TA identifies a documentation gap or coupling dependency, surface it as a flag to Owner, not as in-scope design work
- Changes to tooling components

---

## What the Phase 0 Architecture Document Must Cover

The architecture document should answer all of the following:

1. **Orient session model** — Does `orient` reuse `FlowRun` with a stripped-down configuration, or does it require a distinct `OrientSession` type? What is the lifecycle (start, active, closed)? What state, if any, is persisted?

2. **Context injection** — What does the runtime inject into the orient session? At minimum: the `agents.md` for the selected project and the Owner role document. Does the roleContextRegistry need extension, or is it sufficient as-is?

3. **LLM Gateway reuse** — Does `orient` use the existing LLM Gateway without modification, or does it require changes (e.g., streaming vs. non-streaming, different conversation loop model)?

4. **CLI interface** — What is the `orient` command signature in `cli.ts`? What arguments does it accept? Is the project path passed in, or does `orient` handle discovery itself?

5. **a-society binary** — Where does it live in the repository (runtime/src/, a new bin/ directory, or elsewhere)? What does it do: discovery, menu presentation, then delegates to `orient`. What menu library or mechanism handles interactive selection?

6. **Project discovery** — What is the discovery algorithm? What root path does it scan from? How does it handle edge cases (no projects found, partially-initialized projects, nested a-docs)?

7. **Install script** — What approach? What does it install and where? What does the user need to do after running it? Is it idempotent?

8. **Files changed** — A complete list of files to be created or modified, with expected action (new / modify / extend).

---

## Constraints

- The existing `start-flow`, `resume-flow`, and `flow-status` commands must not change behavior.
- The `orient` command must use the existing LLM Gateway — do not introduce a second API client.
- The design must be compatible with the existing `runtime/src/` structure. Significant restructuring requires explicit Owner justification.
- If the design introduces any `a-docs/` format dependencies (e.g., parsing `agents.md` or role files), document them explicitly per the TA role's a-docs/ format dependency rules.
- The install script must set `ANTHROPIC_API_KEY` expectation clearly — the runtime requires it, and the user README must reflect this.

---

## Open Questions for the TA

None that the Owner can resolve in advance — all five known unknowns in the workflow plan (session model, CLI placement, project discovery edge cases, install approach, session persistence) are design questions that require the TA's technical judgment and are the primary purpose of the Phase 0 document.

---

## Gate Condition

Return to Owner when the Phase 0 architecture document is complete and ready for review. Provide the artifact path. The Owner reviews against vision and existing runtime architecture before any implementation begins.

---

## TA Confirmation Required

Before beginning Phase 0 design, the Technical Architect must acknowledge this brief:

> "Brief acknowledged. Beginning Phase 0 architecture design for orient command and a-society CLI entry point."

The TA does not begin drafting until this brief has been read in full and confirmed.
