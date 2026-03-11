**Subject:** Variable retirement protocol — inverse of Index-Before-Reference
**Status:** BRIEFED
**Date:** 2026-03-11

---

## Agreed Change

The framework documents how to *create* and *move* index variables rigorously (Index-Before-Reference Invariant; file-move procedure in `$INSTRUCTION_INDEX`) but has no corresponding guidance for *removing* them. Retirement is the inverse of creation and requires the same structural discipline.

Two flows exposed this gap with real consequences: the `20260308-records-infrastructure` flow required the Curator to retire four variables by judgment alone; the `20260310-retire-todo-folder` flow left a stale prose reference to the retired concept name that survived both a section removal and an index-row deletion because no post-removal scan was prescribed.

The agreed change has two parts:

**Part 1 — Variable Retirement section in `$INSTRUCTION_INDEX`**

Add a "Variable Retirement" section to the general instruction for indexes. The section must prescribe the following sequence, in order:

1. Grep all active documents for the `$VARIABLE_NAME` to identify every consumer before touching anything.
2. Update or remove each reference. For each consuming document, either replace the reference with the new variable (if content was relocated, not removed) or remove the reference entirely.
3. If the project maintains a guide-type document that catalogs the purpose of docs (e.g., an a-docs-guide), check it for entries referencing the retired content and remove or update them.
4. Remove the variable row from the index.
5. Post-removal scan: grep all active documents for both the `$VARIABLE` form *and* the prose concept name of the retired content. A section removal and an index-row deletion are not a sufficient retirement — stale prose references survive both.

This sequence is the inverse of Index-Before-Reference: where creation requires registration before reference, retirement requires reference cleanup before removal.

Step 3 also resolves Priority 2 (retirement scope in briefings / agent-docs-guide cleanup). That item folds into this change: once the general instruction prescribes guide-document cleanup as a standard retirement step, the Curator follows it without needing the briefing to call it out explicitly.

**Part 2 — Invariant 4 update in `$A_SOCIETY_WORKFLOW`**

Update Invariant 4 (Index-Before-Reference) to name the Variable Retirement protocol as its counterpart — the structural discipline that governs removal just as Invariant 4 governs creation. A short parenthetical or appended sentence is sufficient; no structural change to the invariant is needed.

---

## Scope

**In scope:**
- "Variable Retirement" section added to `$INSTRUCTION_INDEX`
- Invariant 4 in `$A_SOCIETY_WORKFLOW` updated to reference the retirement protocol as its counterpart
- Priority 2 (retirement scope in briefings) is treated as resolved by Part 1, Step 3 — no separate change needed

**Out of scope:**
- Changes to `$A_SOCIETY_AGENT_DOCS_GUIDE` itself
- Changes to individual prior records or historical artifacts
- Any new index variables or content additions

---

## Likely Target

- `$INSTRUCTION_INDEX` — primary (`/a-society/general/instructions/indexes/main.md`)
- `$A_SOCIETY_WORKFLOW` — Invariant 4 only (`/a-society/a-docs/workflow/main.md`)

---

## Open Questions for the Curator

None. Both targets and the full content of the retirement sequence are specified above. The proposal round is mechanical: draft the section per the prescribed steps, draft the Invariant 4 addition, confirm placement against `$A_SOCIETY_STRUCTURE`, submit.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Variable retirement protocol — inverse of Index-Before-Reference."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
