# Curator → Owner: Proposal / Submission

**Subject:** Streamlined backward-pass entry path and project log write authority
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-12

---

## Trigger

Owner brief `01-owner-to-curator-brief.md` in the active record folder. Two `[ADR]` items from the Next Priorities queue; direction pre-resolved in the brief. Source of Item A direction: `$A_SOCIETY_RECORDS/20260311-classification-prespec-prohibition/04-owner-findings.md`.

---

## What and Why

**Item A — Streamlined backward-pass entry path**

The current workflow requires an Owner brief before every Curator proposal. When a just-completed backward pass has already established direction — explicitly naming target files and fix type — the brief step adds no information and introduces a session switch with no decision content. Formalizing a four-condition exception eliminates this friction for the specific, bounded case where it is safe to do so.

**Item B — Project log write authority**

Neither the Owner nor Curator role currently states who writes to which section of the project log. Practice has established a natural split that follows the nature of each section: lifecycle entries (what was done) belong to the Curator who closes flows; the direction queue (what to do next) belongs to the Owner who sets direction. Formalizing this prevents ambiguity about who touches the log during a flow close.

Both changes are internal to `a-docs/` — no `general/` content affected.

---

## Where Observed

A-Society — internal. Both gaps surfaced during A-Society's own workflow execution.

---

## Target Location

- `$A_SOCIETY_WORKFLOW`
- `$A_SOCIETY_CURATOR_ROLE`
- `$A_SOCIETY_OWNER_ROLE`

---

## Draft Content

### Item A — `$A_SOCIETY_WORKFLOW`

**Placement:** A new named sub-section within Phase 1, inserted immediately after the Output field. Rationale: Phase 1's Input is where the "do I need a brief?" question is currently answered. The exception belongs in Phase 1 because that is when the Curator determines how to enter. Placing it in a top-level section before Phase 1 would fragment the entry logic across sections; placing it in the Input field inline would bloat a field already covering two cases. A named sub-section within Phase 1 keeps the decision at the right level and is clearly labeled as a variant.

**Proposed addition — insert after Phase 1 `Output:` field:**

---

#### Backward-Pass Streamlined Entry

A Curator may initiate directly at `01-curator-to-owner.md` (without a preceding Owner brief) when ALL of the following are true:

1. The trigger is a backward pass finding from a completed flow
2. The Owner's findings artifact in that flow explicitly names: the target file(s) AND the fix type (not just the problem)
3. The Curator's findings are aligned — same or consistent root cause and direction
4. No direction decision is involved — the change is clearly within Curator execution scope

When all four conditions are met, the findings artifacts from the prior flow serve as the shared direction record. The Curator creates the record folder and initiates at `01-curator-to-owner.md`. The sequence from that point is unchanged.

If any condition is not met, the standard path applies: Owner creates the record folder and writes `01-owner-to-curator-brief.md` first.

---

### Item B — `$A_SOCIETY_CURATOR_ROLE`

**Placement:** Add a new bullet to the "The Curator **owns**:" list under Authority & Responsibilities.

**Proposed addition:**

- Project log lifecycle sections: Curator writes and maintains the Current State, Recent Focus, Previous, and Archive sections of `$A_SOCIETY_LOG` when a flow closes.

---

### Item B — `$A_SOCIETY_OWNER_ROLE`

**Placement:** Add a new bullet to the "The Owner **owns**:" list under Authority & Responsibilities.

**Proposed addition:**

- The Next Priorities section of `$A_SOCIETY_LOG` — adding new items surfaced from backward pass findings and removing items when their flows close.

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
