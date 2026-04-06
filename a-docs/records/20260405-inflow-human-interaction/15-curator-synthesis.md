# Curator Synthesis — 20260405-inflow-human-interaction

**Date:** 2026-04-06
**Role:** Curator
**Sources:** `13-ta-findings.md`, `14-owner-findings.md`

---

## Findings Review

Two backward pass roles filed findings: Technical Architect and Owner. Both findings converge on a single root failure — the Owner embedded a design preference as a hard constraint in the TA brief, and the TA accepted that constraint without flagging it — observed from their respective vantage points.

### TA Findings (13-ta-findings.md)

**Finding 1 — TA accepted a soft constraint as hard without flagging it.**
Brief constraint 4 ("behavior must derive from whether a handoff block is present, no special signal required") was presented as a requirement. The TA treated it as non-negotiable and designed around it. When the Owner introduced `type: prompt-human` in review, the constraint was immediately relaxed. The TA had the standing to flag this at advisory time but did not because the role file contains no obligation to evaluate whether brief constraints are hard requirements or design preferences.

**Finding 2 — `type: prompt-human` was available from the existing architecture and should have been surfaced independently.**
The codebase already had two typed signals with distinct runtime behaviors (`forward-pass-closed`, `meta-analysis-complete`). Extending this pattern was the natural path. The TA did not reach it because constraint 4 had already closed that branch of the design space before the pattern evaluation occurred. Root-caused to Finding 1; not an independent failure.

**Finding 3 — No advisory standard for evaluating brief constraints before designing to them.**
The TA advisory standards are thorough on design quality but silent on brief evaluation. The structural absence made both Findings 1 and 2 possible. The TA identifies this as a candidate framework contribution to `$GENERAL_TA_ROLE`.

### Owner Findings (14-owner-findings.md)

**Finding 1 — Owner embedded a design preference as a hard constraint in the TA brief.**
The constraint was the Owner's current thinking about minimizing agent-facing syntax changes, converted into a prohibitive requirement without recognizing the category error. The brief-writing quality guidance has extensive coverage of under-specification failures but no corresponding guidance for TA design briefs' distinct failure mode: over-constraining by presenting a preference as a hard requirement. The Owner flags this as a candidate framework contribution to `$GENERAL_OWNER_ROLE`.

**Finding 2 — Pre-existing contradiction in `machine-readable-handoff.md` not caught until Curator review.**
After `type: prompt-human` was added, the existing bullet "Clarification exchanges within an active session — do not emit a block" directly contradicted the new signal. This was not caught at Phase 0 gate or integration gate; it surfaced only during Curator submission review. The Review Artifact Quality guidance covers re-reading claimed states but not checking whether a proposed addition conflicts with existing content in the target document. Low severity (caught before publication), but the pattern is worth naming.

**Finding 3 — User had to intervene on a brief-writing quality issue before the TA session.**
A correction round at brief-writing time is avoidable with one additional check. Named as workflow friction corroborating Finding 1.

---

## Routing

### Within `a-docs/` — Implemented directly

**1. `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — New advisory standard: brief constraint evaluation**

Added as the final entry in the Advisory Standards section:

> **Brief constraint evaluation must distinguish hard constraints from design preferences.** When a brief contains design constraints, classify each constraint before anchoring to it. Hard constraints are derived from external dependencies, framework invariants, explicit user direction, or immovable prior decisions — they close design space justifiably. Design preferences are the Owner's current thinking about the right approach — they close design space without requiring it. For each constraint that appears to be a design preference, evaluate whether an alternative approach produces a better outcome and surface the comparison explicitly before proceeding. Do not accept a preference as a hard requirement without flagging it. The test: "Is this constraint derived from an invariant or prior decision, or is it describing what the Owner thinks the solution should look like?" If the latter, surface the alternative and ask for explicit confirmation before designing to the constraint.

Source: `13-ta-findings.md` (Finding 3); `14-owner-findings.md` (Top Finding 1, corroborates).

---

**2. `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality — New rule: TA design brief constraint/preference partition**

Added as the final rule in the Brief-Writing Quality section:

> **TA design briefs require a constraint/preference partition.** When a brief asks a Technical Architect to produce a design, constraints in the brief must be genuinely non-negotiable — derived from framework invariants, explicit user direction, or immovable prior decisions. A design preference or working hypothesis is not a constraint; presenting it as one closes off design space the TA is specifically engaged to evaluate. If the Owner has a hypothesis about the right direction, name it as a preference with rationale and require the TA to address it — do not convert it into a prohibitive constraint. The test: "Would I reject a TA advisory that explored this option?" If the answer is "I don't know," it is not a constraint.

Source: `14-owner-findings.md` (Top Finding 1; Generalizable Contributions); `13-ta-findings.md` (Finding 3, corroborates).

---

**3. `$A_SOCIETY_OWNER_ROLE` Review Artifact Quality — New check: pre-existing conflict detection**

Added as a second paragraph in the Review Artifact Quality section:

> When a decision artifact authorizes adding content to an existing shared document, read the target document's relevant section before issuing the authorization to check whether the proposed addition conflicts with existing content. Pre-existing prohibitions, behavioral specifications, or conditional rules in the target document may directly contradict the proposed addition. The state-claim re-reading obligation covers claims made in the artifact; this check covers the inverse case — content already in the target document that would become contradicted once the proposed addition is integrated.

Source: `14-owner-findings.md` (Top Finding 2; Root Cause Analysis).

---

### Outside `a-docs/` — Next Priorities (merge assessments)

**Merge 1: TA brief constraint evaluation → "Technical Architect advisory completeness addendum"**

The existing entry targets `$GENERAL_TA_ROLE`, advisory standards design area, `[S][LIB]` authority, Framework Dev workflow. This flow's Finding 3 (TA) / Finding 1 (Owner) adds a new generalizable TA advisory standard — same target file, same design area, compatible authority and workflow. **Merged:** Added as item *(8)* to the existing entry, with source citations from `13-ta-findings.md` and `14-owner-findings.md`.

**Merge 2: Owner TA-design-brief constraint/preference partition → "Role-guidance precision follow-up"**

The existing entry targets `$GENERAL_OWNER_ROLE` Brief-Writing Quality, `[S][LIB]` authority, Framework Dev workflow. This flow's Owner Finding 1 adds a TA-design-brief-specific brief-writing rule — same target file, same design area, compatible authority and workflow. **Merged:** Added as item *(8)* to the existing entry, with source citation from `14-owner-findings.md`.

---

## Summary

Three direct `a-docs/` changes implemented:

| File | Change |
|---|---|
| `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | New advisory standard: brief constraint evaluation — classify hard vs. soft constraints before designing to them |
| `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality | New rule: TA design briefs require a constraint/preference partition |
| `$A_SOCIETY_OWNER_ROLE` Review Artifact Quality | New check: when authorizing additions to shared documents, verify the proposed content does not conflict with existing content |

Two Next Priorities entries updated by merge (no new items created):

| Entry | Update |
|---|---|
| Technical Architect advisory completeness addendum | Item *(8)* added: brief-constraint evaluation obligation |
| Role-guidance precision follow-up | Item *(8)* added: TA-design-brief constraint/preference partition |

The backward pass closes here. No further handoff is required.
