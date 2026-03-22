# Backward Pass Synthesis: Curator — 20260322-backward-pass-quality-principles

**Date:** 2026-03-22
**Task Reference:** 20260322-backward-pass-quality-principles
**Role:** Curator (Synthesis)

---

## Findings Reviewed

| # | Source | Finding | Owner Verdict |
|---|---|---|---|
| A | Curator (05) findings 1+3; Owner (06) finding 1/3 | Proposal gate miscue — Approval Invariant has no topology check; brief failed to state no Proposal phase and waive the artifact requirement | Confirmed — root cause shared between Curator hard rule and brief; both halves need fixing |
| B | Curator (05) finding 2; Owner (06) finding 2/3 | VERSION.md two-target gap — protocol does not enumerate header field + History row as distinct required writes | Confirmed — MAINT-only; fix `$A_SOCIETY_UPDATES_PROTOCOL` |
| C | Owner (06) — workflow.md omission finding | workflow.md omitted Registration step — LIB flows have a predictable registration loop that must appear in the path at intake | New finding — standalone Next Priority |

Note: Curator findings 1 and 3 share the same root cause and are treated as one item (Finding A) per Owner merger assessment.

---

## Routing

Routing rule: MAINT-only scope (within `a-docs/`, no LIB component) → implement directly. Any LIB component → Next Priorities (require Owner approval).

- Finding A: LIB component (`$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`) → Next Priorities (merge into Priority 1 per Owner direction)
- Finding B: MAINT-only (`$A_SOCIETY_UPDATES_PROTOCOL`, within `a-docs/`) → implement directly
- Finding C: LIB component (`$GENERAL_OWNER_ROLE`) → Next Priorities (new standalone entry per Owner direction)

---

## Direct Implementation

### Finding B — VERSION.md two-target gap: `$A_SOCIETY_UPDATES_PROTOCOL`

**Target:** `a-society/a-docs/updates/protocol.md` — Version Requirements section.

**Change:** After the sentence "These two writes are a single atomic registration step," added an explicit enumeration of the two distinct write targets within `$A_SOCIETY_VERSION`: (1) the `**Version:**` header field at the top of the file, and (2) a new row in the History table. Added the statement that a Curator who updates only the History table row has not completed the registration step.

**Status:** Implemented.

---

## Next Priorities — Routed to `$A_SOCIETY_LOG`

### Finding A — Proposal gate miscue: Approval Invariant topology check and brief topology waiver

**Merge target:** Existing Next Priority 1 (Brief-writing and proposal quality: behavioral property consistency and write authority label).

**Additions merged into Priority 1:**
- `$GENERAL_OWNER_ROLE` Brief-Writing Quality (LIB): add item (c) — when a flow has no Proposal phase, the brief must explicitly state that no proposal artifact is required before implementation begins. Echo to `$A_SOCIETY_OWNER_ROLE` (MAINT).
- `$GENERAL_CURATOR_ROLE` (LIB): add Approval Invariant topology check — if the workflow plan shows no Proposal node, the brief constitutes authorization; no proposal artifact is required. Echo to `$A_SOCIETY_CURATOR_ROLE` (MAINT).

**Status:** Priority 1 updated in `$A_SOCIETY_LOG` (title and body merged; source citations extended).

### Finding C — workflow.md Registration step omission

**Action:** New standalone Next Priority entry added to `$A_SOCIETY_LOG`.

`[S][LIB][MAINT]` — workflow.md path completeness: LIB flows must include Registration step at intake — `$A_SOCIETY_OWNER_ROLE` intake guidance (MAINT): add note that `[LIB]` flows have a predictable registration step (Curator → update report + version increment → Owner review) that must be included in `workflow.md` at intake; the LIB scope tag is the signal to add this loop. `$GENERAL_OWNER_ROLE` (LIB): if the general Owner role has equivalent intake guidance, add the same note in domain-agnostic form — any flow with a known post-implementation publication or registration step should include it in the path at intake.

**Status:** New priority added in `$A_SOCIETY_LOG`.

---

## Backward Pass Status

Closed. All findings reviewed and routed. One direct implementation applied (`$A_SOCIETY_UPDATES_PROTOCOL`). Next Priorities updated: Priority 1 merged with Finding A additions; new standalone Priority 4 added for Finding C. No open items remain for this flow.
