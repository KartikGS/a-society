# Curator → Owner: Proposal

**Subject:** Flow A — Briefing pre-approval language and Approval Invariant timing
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-10

---

## Trigger

Backward pass from `20260308-handoff-protocol` flow. The Curator began implementation on briefing language ("this briefing constitutes that approval") before a Phase 2 decision artifact was written. No document told the Curator that was wrong. Source: `$A_SOCIETY_RECORDS/20260308-handoff-protocol/08-curator-synthesis.md`, Flow A.

---

## What and Why

Four targeted additions — one per failure point — that together close the gap from different angles:

1. **Approval Invariant** — says *what* requires approval but not *when* or *in what form*. Add timing: approval is established by a Phase 2 decision artifact, not by a briefing.
2. **Phase 1 description** — says nothing about what a briefing cannot do. Add one sentence: the briefing is scope and direction alignment; Phase 2 is a separate, subsequent step.
3. **Briefing template** — no constraint on approval language. Add a visible authorization-scope note so the Owner cannot inadvertently write unsafe language.
4. **Handoff protocol** — describes what a well-formed briefing must contain but not what it cannot authorize. Add an explicit prohibition so the Curator cannot act on briefing language alone.

All four changes are A-Society `a-docs/` maintenance — no `general/` writes. Portability deferred per the briefing scope.

---

## Where Observed

A-Society — internal. Gap was in the `20260308-handoff-protocol` flow execution.

---

## Target Location

- `$A_SOCIETY_WORKFLOW` — Invariant 2 and Phase 1 Input section
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — note block after the template header line
- `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` — Owner → Curator (Trigger → Phase 1: Briefing) section

---

## Draft Content

### Change 1 — `$A_SOCIETY_WORKFLOW`, Invariant 2

**Current:**
```
**2. Approval Invariant**
The Curator does not write to `general/` without Owner approval. Every addition to the general library is reviewed before creation. Drafting is permitted; creating is not.
```

**Proposed:**
```
**2. Approval Invariant**
The Curator does not write to `general/` without Owner approval. Every addition to the general library is reviewed before creation. Drafting is permitted; creating is not. Approval is established by a Phase 2 decision artifact with `APPROVED` status — directional alignment in a briefing is not approval. The Curator does not begin implementation on briefing language alone.
```

*Two sentences added. The core rule is unchanged and still leads. Timing and artifact form follow.*

---

### Change 2 — `$A_SOCIETY_WORKFLOW`, Phase 1 Input section

**Current:**
```
**Input:** A stated need from a trigger source. For Curator-led proposals, the Owner creates a record folder (see `$A_SOCIETY_RECORDS`) and writes `01-owner-to-curator-brief.md` from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`. For human-directed changes, the human provides the direction directly.
```

**Proposed:**
```
**Input:** A stated need from a trigger source. For Curator-led proposals, the Owner creates a record folder (see `$A_SOCIETY_RECORDS`) and writes `01-owner-to-curator-brief.md` from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`. For human-directed changes, the human provides the direction directly. The briefing establishes scope and direction alignment only — a Phase 2 decision artifact is a separate, subsequent step and may not be substituted by the briefing.
```

*One sentence added at the end of the Input paragraph.*

---

### Change 3 — `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, authorization-scope note

The template currently opens with the template-header note, then goes immediately to the fields. Add a note block between them:

**Proposed addition** (between the template-header note and the `**Subject:**` line):

```
> **Authorization scope:** A briefing establishes scope and direction alignment only. It does not authorize implementation. A Phase 2 Owner decision artifact (`APPROVED` status) is required before the Curator begins implementation. A briefing may state that a direction is acceptable in principle; it must not state or imply that implementation may proceed without that decision.
```

*Placement rationale: The constraint applies to the entire artifact, not to one field. A note block at the top — after the "do not modify" instruction, before the fields — makes it visible without cluttering any field's instructions. The common case (no pre-approval language) reads past it without friction.*

---

### Change 4 — `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`, Owner → Curator section

**Current** (end of the Owner → Curator section):
```
A briefing missing the Agreed Change or Scope fields is malformed. The Curator must not begin drafting until those fields are present.
```

**Proposed:**
```
A briefing missing the Agreed Change or Scope fields is malformed. The Curator must not begin drafting until those fields are present. A briefing cannot substitute for a Phase 2 decision artifact — pre-approval language in a briefing does not authorize implementation. The Curator must not begin implementation without an explicit `APPROVED` status in a Phase 2 decision artifact.
```

*Two sentences added as a sentence extension on the existing closing paragraph. No new subsection needed — this is a direct extension of the "what a briefing cannot do" rule already implied by the malformed-briefing check.*

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
