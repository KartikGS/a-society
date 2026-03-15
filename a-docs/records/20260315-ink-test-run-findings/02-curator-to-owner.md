---

**Subject:** Three agent reliability gaps — Ink test run (handoff paths, context confirmation, deep-link prohibition)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-15

---

## Trigger

Human identified three gaps from a full-lifecycle test run of the Ink project. Owner brief filed at `a-society/a-docs/records/20260315-ink-test-run-findings/01-owner-to-curator-brief.md`.

---

## What and Why

Three targeted fixes to close gaps that produced observable agent failure within one test run.

**1. Handoff Output: relative path requirement**

The canonical Handoff Output definition in `$INSTRUCTION_ROLES` Section 7 and the two general role templates do not state that copyable paths must be relative to the repository root. Without an explicit requirement, agents default to machine-specific absolute paths — which are not portable and break for any recipient whose machine layout differs. The fix adds one sentence to each location: paths must be relative to the repository root; absolute paths and `file://` URLs are never acceptable.

**2. Context confirmation completeness**

The context confirmation guidance in `$INSTRUCTION_AGENTS` does not require the confirmation statement to enumerate every item in the required reading list. The current guidance implies a fixed string. When a project adds items to required reading, the fixed string omits those items — and confirmation passes incorrectly. The fix adds two targeted sentences: (a) confirmation must enumerate the items actually loaded by name, and (b) when drafting an `agents.md` with additional required reading items, the confirmation template must be updated to match.

**3. Curator deep-link prohibition**

The hard rule in `$GENERAL_CURATOR_ROLE` prohibits hardcoded paths but does not name markdown link syntax (`[text](/absolute/path)`, `[text](file:///path)`) as a violation. An agent following the existing rule to the letter could still insert an absolute path inside a markdown hyperlink — which is exactly what happened in the Ink run. The fix adds an explicit sentence to the existing path rule: markdown link syntax using absolute paths or `file://` URLs is equally forbidden; use `$VARIABLE_NAME` references instead.

All three changes apply equally to any project type (software, writing, research) — they are framework-level path discipline and confirmation protocol rules.

---

## Where Observed

Ink project — full-lifecycle test run (initialization → first essay workflow → backward pass → curator synthesis). Four instances of absolute paths across three agents; context confirmation omissions for a custom required reading item; one `file://` URL inserted by the Curator into a role document.

---

## Target Location

- `$INSTRUCTION_ROLES` — Section 7 (Handoff Output)
- `$GENERAL_OWNER_ROLE` — Handoff Output section
- `$GENERAL_CURATOR_ROLE` — Handoff Output section; Hard Rules (path discipline)
- `$INSTRUCTION_AGENTS` — Section 5 (Context confirmation statement); Step 5 of "How to Write One"

---

## Draft Content

### Change 1a — `$INSTRUCTION_ROLES` Section 7

Current last bullet in the "At each pause point, the role should state" list:

> - Copyable inputs for the receiving role: always a read directive (`[artifact path]`); if a new session is required, also a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`)

Replace with:

> - Copyable inputs for the receiving role: always a read directive (`[artifact path]`); if a new session is required, also a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`). Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs — these are not portable and break for any recipient whose local layout differs.

---

### Change 1b — `$GENERAL_OWNER_ROLE` Handoff Output section

Current item 4:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`

Replace with:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

### Change 1c — `$GENERAL_CURATOR_ROLE` Handoff Output section

Current item 4:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`

Replace with:

> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

### Change 2a — `$INSTRUCTION_AGENTS` Section 5

Current section:

> ### 5. Context confirmation statement (mandatory)
> The exact text an agent must output to confirm they have loaded required context. State it verbatim — agents copy it. Include a note that an agent which skips this step has not loaded context, even if they claim otherwise.

Replace with:

> ### 5. Context confirmation statement (mandatory)
> The exact text an agent must output to confirm they have loaded required context. State it verbatim — agents copy it. Include a note that an agent which skips this step has not loaded context, even if they claim otherwise.
>
> The confirmation must enumerate every item in the required reading list by name. A fixed string that omits items in the list is a confirmation failure — even if those items were loaded. When a project's required reading list includes items beyond the standard set, those items must appear by name in the confirmation statement template. An `agents.md` whose confirmation template does not match its required reading list is incomplete.

---

### Change 2b — `$INSTRUCTION_AGENTS` Step 5 of "How to Write One"

Current:

> **Step 5 — Write the context confirmation statement.**
> State it exactly as agents should output it. Use a blockquote so it is visually distinct. Include the enforcement note.

Replace with:

> **Step 5 — Write the context confirmation statement.**
> State it exactly as agents should output it. Use a blockquote so it is visually distinct. Include the enforcement note. The confirmation must list every item in the required reading list by name — not a generic placeholder. If you added items to the required reading list in Step 4, the confirmation statement here must include those items. A confirmation template that does not match the required reading list is a documentation failure.

---

### Change 3 — `$GENERAL_CURATOR_ROLE` Hard Rules

Current path rule:

> - **Never hardcode a file path in documentation you write or maintain.** If the file is in the project index, use its `$VARIABLE_NAME`. If it is not yet indexed, add it to `indexes/main.md` first — then use the variable. Hardcoded paths bypass the index and create the exact drift the index is designed to prevent.

Replace with:

> - **Never hardcode a file path in documentation you write or maintain.** If the file is in the project index, use its `$VARIABLE_NAME`. If it is not yet indexed, add it to `indexes/main.md` first — then use the variable. Hardcoded paths bypass the index and create the exact drift the index is designed to prevent. This prohibition includes markdown link syntax: `[text](/absolute/path)` and `[text](file:///path)` are both violations. Use `$VARIABLE_NAME` references for any path that must be followed — never embed paths directly in link syntax.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
