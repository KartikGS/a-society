# Curator → Owner: Update Report Submission

**Subject:** Initializer quality hardening — implementation complete + update report for `$INSTRUCTION_AGENTS` changes
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-11

---

## Trigger

Follows Owner decision in `03-owner-to-curator.md` (APPROVED). Owner directed the Curator to assess update report trigger conditions after implementation and verify before concluding. Implementation is complete; this submission closes that loop.

---

## What and Why

Implementation of all approved changes across `$A_SOCIETY_INITIALIZER_ROLE` (Gaps 1–3) and `$INSTRUCTION_AGENTS` (Gap 4). No deviations from the approved proposal.

Update report assessment:

**`$A_SOCIETY_INITIALIZER_ROLE` (Gaps 1–3):** No update report triggered. These changes fix the Initializer's behavioral protocol. Adopting projects receive the Initializer's output (`a-docs/`), not the Initializer file itself. The changes do not alter what a correct `a-docs/` structurally contains. Trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` are not met.

**`$INSTRUCTION_AGENTS` (Gap 4):** Update report triggered. These are corrections to a `general/` instruction that directly affected what adopting projects were told to put in their `agents.md` files. Trigger condition met: "An existing `general/` instruction has changed in a way that affects the guidance adopting projects received at initialization."

Impact classification:
- **Breaking** — Reading order correction. Existing initialized projects have agents.md files with vision/structure listed before the index. When an agent follows this sequence, `$VAR` references in vision and structure cannot be resolved because the index has not been loaded yet. This is a live functional gap in the orientation sequence of any project initialized before this fix.
- **Recommended** — Authority hierarchy specification. Existing agents.md files may not specify a hierarchy, or may specify an incorrect one. No session fails as a direct result, but conflict resolution may be applied inconsistently.

Breaking change present → version increment: v2.1 → v3.0.

---

## Where Observed

A-Society — a test run of the Initializer against a seed-file project surfaced the instruction gaps.

---

## Target Location

**Implementation (complete):**
- `$A_SOCIETY_INITIALIZER_ROLE` — Hard Rules, Phase 2, Phase 4
- `$INSTRUCTION_AGENTS` — "What Every agents.md Must Contain" sections 4 and 6; "How to Write One" Steps 4 and 6

**Publication (pending Owner approval):**
- `$A_SOCIETY_UPDATES_DIR` — new file `2026-03-11-agents-md-reading-order.md`
- `$A_SOCIETY_VERSION` — increment v2.1 → v3.0

---

## Draft Content

### Update Report Draft: `2026-03-11-agents-md-reading-order.md`

---

```
# A-Society Framework Update Report

**Framework Version:** v3.0
**Previous Version:** v2.1
**Date:** 2026-03-11
**Report:** 2026-03-11-agents-md-reading-order

---

## Summary

Two corrections to `$INSTRUCTION_AGENTS` affecting what adopting projects were instructed to produce in their `agents.md` files:

- **[Breaking]** Required reading order corrected: the index must come second (before vision and structure), not fourth.
- **[Recommended]** Authority hierarchy now specified: project vision → project structure → role document → agents.md.

Projects initialized before this report were produced using the incorrect instruction. The reading order gap is functional — agents following the old sequence cannot resolve `$VAR` references in vision and structure documents before they appear in the required reading list.

Known adopting projects at time of publication: LLM Journey.

---

## Changes

### Change 1 — Required reading order in agents.md [Breaking]

**What changed:** `$INSTRUCTION_AGENTS` previously specified the required reading sequence as: agents.md → vision → structure → index → role file. The correct sequence is: agents.md → index → vision → structure → role file. The index must come second so that `$VAR` references in vision and structure documents can be resolved as agents read them.

**Why Breaking:** Any project initialized before this fix has an agents.md where the index is listed after vision and structure. An agent following this sequence encounters `$VAR` references in vision and structure before loading the index, making those references unresolvable in order. This is a live functional gap in the orientation sequence.

**Migration guidance:**

1. Open your project's `a-docs/agents.md`.
2. Find the Required Reading section.
3. Check whether the index (e.g., `$[PROJECT]_INDEX` or `indexes/main.md`) is listed before vision and structure.
4. If not, move the index entry to second position, immediately after agents.md itself.
5. The corrected sequence should read: agents.md → index → vision → structure → [any additional universal reads] → role file.

---

### Change 2 — Authority hierarchy specification in agents.md [Recommended]

**What changed:** `$INSTRUCTION_AGENTS` previously told implementers to "state the resolution order explicitly" without specifying what that order should be. The instruction now specifies: project vision (highest precedence) → project structure → role document → agents.md. Implementers must not invert this hierarchy.

**Why Recommended:** Existing agents.md files may be missing the hierarchy entirely, or may specify it in an incorrect order. Either case can lead to incorrect conflict resolution — e.g., a role document overriding the project vision. This does not prevent sessions from functioning, but it undermines the framework's intended authority structure.

**Migration guidance:**

1. Open your project's `a-docs/agents.md`.
2. Find the Authority and Conflict Resolution section.
3. Check whether it specifies a precedence order for document authority.
4. If absent or incorrect, update it to state: project vision takes highest precedence, followed by project structure, then the role document, then agents.md. End with: "if the conflict cannot be resolved using these sources, stop and ask the human."

---

## Delivery Note

Distribution mechanism for framework update reports is an open problem. Until resolved, Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
```

---

## Implementation Status

**Implementation complete:** Yes

**Files changed:**
- `$A_SOCIETY_INITIALIZER_ROLE` — Hard Rules (shell prohibition), Phase 2 (scope boundary), Phase 4 (design-decision disclosure check)
- `$INSTRUCTION_AGENTS` — "What Every agents.md Must Contain" sections 4 and 6; "How to Write One" Steps 4 and 6

**Publication condition outstanding:** Yes — awaiting Owner approval of this submission. Upon approval: (1) write report to `$A_SOCIETY_UPDATES_DIR/2026-03-11-agents-md-reading-order.md`, (2) update `$A_SOCIETY_VERSION` to v3.0.

---

## Owner Confirmation Required

The Owner must respond in `05-owner-to-curator.md` with one of:
- **APPROVED** — Curator writes the update report to `$A_SOCIETY_UPDATES_DIR` and updates `$A_SOCIETY_VERSION` to v3.0
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not publish the report or increment the version until `05-owner-to-curator.md` shows APPROVED status.
