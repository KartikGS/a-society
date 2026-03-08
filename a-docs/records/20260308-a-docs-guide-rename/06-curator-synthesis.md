# Curator Synthesis

**Flow:** `20260308-a-docs-guide-rename`
**Date:** 2026-03-08
**Sources:** `04-curator-findings.md`, `05-owner-findings.md`

---

## Summary

Two Curator findings, both without action. Three Owner findings, two of which consolidate into one flow. Total: two new flows to initiate.

---

## Curator Findings — Disposition

| # | Finding | Disposition |
|---|---|---|
| 1 | Filename references need concept-vs-filename discipline | No action. Owner confirmed the explicit approval note handled it cleanly. Pattern will be applied naturally in future renames. |
| 2 | Update-report threshold worth deciding inside the proposal | No action. Owner confirmed: useful pattern to keep applying, not worth codifying unless it becomes repeated friction. |

---

## Owner Findings — Consolidation

Owner findings 1 and 3 address the same root problem from different angles:

- **Finding 1** (behavioral): The Owner executed a human-directed change directly rather than routing it through the workflow. Root cause: workflow felt optional for small requests.
- **Finding 3** (design): The Post-Confirmation Protocol presents workflow as a menu option, not the default. Root cause: same structural framing as Finding 1.

These are one fix: the Post-Confirmation Protocol must frame workflow routing as the default, not a menu item. Fixing the framing resolves the behavioral pattern that produced Finding 1.

**Owner Finding 2** (session-routing guidance) is independent — it addresses what the Owner communicates at handoff points, not whether the workflow is followed.

---

## Proposed Flows

### Flow A — Workflow as default in Owner role

**Trigger source:** Owner Findings 1 + 3
**Severity:** High
**Change:** Update the Owner role's Post-Confirmation Protocol so that routing into the workflow is the default behavior for all work. The human can choose to work freeform, but the Owner does not make that choice for them. Remove or reframe any language that presents the workflow as one option among several.
**Targets:** `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`
**Requires Owner approval:** Yes — touches `general/`.
**Portability note:** The general Owner role template should carry this framing so any project instantiating an Owner role starts with the correct default.

---

### Flow B — Session-routing guidance at handoffs

**Trigger source:** Owner Finding 2
**Severity:** Medium
**Change:** Add concrete session-routing language to Owner handoff instructions — at each pause point, the Owner must state whether the human should start a new conversation or resume an existing one, and what the receiving agent needs to read.
**Targets:** `$A_SOCIETY_WORKFLOW` (session model section) and/or `$A_SOCIETY_OWNER_ROLE`
**Requires Owner approval:** Yes — if `$GENERAL_OWNER_ROLE` is also updated; escalate to Owner to determine placement.
**Portability note:** The concrete session-routing requirement applies to any multi-role project. If the guidance belongs in the general Owner role template, it needs Owner approval before writing. If it belongs only in `$A_SOCIETY_WORKFLOW`, the Curator can implement directly as a maintenance change.

---

## Next Steps

Both flows require Owner briefings to enter Phase 1. Escalating to Owner to initiate.

Recommended sequencing: Flow A first (higher severity, self-contained), Flow B second (depends on placement decision the Owner resolves during briefing).
