# Backward Pass Findings: Owner — 20260322-backward-pass-quality-principles

**Date:** 2026-03-22
**Task Reference:** 20260322-backward-pass-quality-principles
**Role:** Owner
**Depth:** Full

---

## Findings

### Curator Finding 1/3 — Proposal gate miscue: root cause is shared between brief and Curator hard rule

The Curator's findings 1 and 3 identify the same root cause from different angles and should be treated as one item.

The Curator's diagnosis is correct: the Approval Invariant is categorical and has no directive to check whether the active flow topology includes a Proposal phase before treating `[Requires Owner approval]` as a pre-implementation gate. That is a documentation gap in the Curator role.

But the analysis does not stop there. The brief itself contributed to the miscue. The brief said "Open Questions: None — the proposal round is mechanical, straight to draft content." That language describes the *proposal artifact's quality bar*, not the *presence or absence of a Proposal phase*. A Curator reading that line can reasonably infer: "there is a proposal phase; it just has no open questions." The brief never said "this flow has no Proposal node — implementation may proceed directly from the brief." That explicit waiver was absent.

**Root cause is shared:** The Curator's Approval Invariant is underspecified for abbreviated topologies (Curator-side gap). The brief failed to state the topology explicitly and waive the proposal gate (Owner-side gap). Both halves need fixing.

**Scope:**
- `$A_SOCIETY_CURATOR_ROLE` hard rules (MAINT): add topology check — if the workflow plan shows no Proposal node, the brief constitutes authorization; no proposal artifact is required.
- `$GENERAL_CURATOR_ROLE` (LIB): if the Approval Invariant appears with the same categorical framing, the same addition applies.
- `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality (MAINT): when a flow has no Proposal phase, the brief must explicitly state that no proposal artifact is required before implementation begins.
- `$GENERAL_OWNER_ROLE` Brief-Writing Quality (LIB): same addition.

**Merge assessment:** `$GENERAL_OWNER_ROLE` Brief-Writing Quality is the same target as Next Priority 1 ("Brief-writing and proposal quality"). `$GENERAL_CURATOR_ROLE` is also a Next Priority 1 target. The authority level is compatible `[S][LIB][MAINT]`. This item should merge into Next Priority 1 at synthesis, retaining all source citations.

---

### Curator Finding 2 — VERSION.md two-target gap: confirmed, MAINT-only

The Curator's diagnosis is correct. The update protocol says "Curator updates `$A_SOCIETY_VERSION`" without specifying that this involves two distinct write targets: the `**Version:**` header field and a new History table row. A Curator who updates only the table row has followed the letter of the instruction and missed the header — exactly what happened here.

This is A-Society-specific (the VERSION.md structure is not a general framework pattern), so the fix is MAINT-only: update `$A_SOCIETY_UPDATES_PROTOCOL` or `$A_SOCIETY_VERSION` to enumerate both write targets explicitly.

**Root cause depth:** The partial verification behavior (Curator checked what was added but not what should have been updated alongside it) is the same class of error as the Analysis Quality principles just shipped — the agent confirmed the new thing existed without verifying the related thing was also updated. The fix is documentation-side: enumerate the targets so a Curator cannot add the row without noticing the header needs updating too. No need to go deeper; the root cause terminates at documentation underspecification.

**No merge target** — no current Next Priorities item targets `$A_SOCIETY_UPDATES_PROTOCOL`. New standalone entry `[S][MAINT]`.

---

### workflow.md omitted the Registration step — incomplete path at intake

The `workflow.md` created at intake listed three steps:

1. Owner — Intake & Briefing
2. Curator — Implementation
3. Owner — Review & Forward Pass Closure

The actual forward pass ran five steps:

1. Owner — Intake & Briefing
2. Curator — Implementation
3. Owner — Review *(intermediate checkpoint — issued 03-owner-to-curator.md, directed Curator to produce update report)*
4. Curator — Registration *(update report + VERSION.md increment — entirely absent from workflow.md)*
5. Owner — Forward Pass Closure

Two violations of the records completeness rule: (1) step 3 was an intermediate Owner checkpoint, not closure — its conflation with step 5 made the path appear terminal when it wasn't; (2) the Curator Registration step (step 4) was omitted entirely.

**Why this happened:** The registration step for a `[LIB]` flow (Curator produces update report, increments version, returns to Owner) is predictable at intake — it is a standard phase of the framework development workflow. I should have included it in the path. I didn't, because "Review & Forward Pass Closure" implied I expected to be done after reviewing implementation. The LIB flag should have been a prompt to add the registration loop.

**Did it corrupt the backward pass?** No — coincidentally. The missing steps (Curator Registration, Owner Closure) add no new roles, so Component 4's first-occurrence deduplication produces the same backward pass order either way. But this is lucky, not correct. A flow where the registration step introduced a new role (e.g., a Technical Architect advisory step added late) would have produced a wrong backward pass order.

**Root cause — two levels:**
- *Execution level:* Owner did not consult `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` when populating the path at intake, where the registration phase is documented.
- *Documentation level:* No guidance in the Owner role or the records convention flags `[LIB]` as a trigger to include the registration loop in the path. The completeness rule is stated generally; the LIB-specific implication is not made explicit.

**Scope:** `$A_SOCIETY_OWNER_ROLE` intake guidance (MAINT): add note that `[LIB]` flows have a predictable registration step (Curator → update report + version increment → Owner review) that must be included in `workflow.md` at intake. `$GENERAL_OWNER_ROLE` (LIB): if the general Owner role has equivalent intake guidance, add the same note in domain-agnostic form (the pattern generalises: any flow with a known registration or publication step should include it in the path).

**Merge assessment:** `$GENERAL_OWNER_ROLE` is a Next Priority 1 target. This item also touches `$A_SOCIETY_OWNER_ROLE`. However, the concern (workflow.md path completeness for predictable steps) is different enough from Next Priority 1's concerns (brief-writing quality, proposal gate) that it warrants a separate entry. No merge.

---

### Meta-observation — Analysis Quality principles validated in the same flow that introduced them

The Curator's VERSION.md finding traces the error correctly: partial verification, root cause is protocol underspecification, fix is documentation-side. This is exactly the "why wasn't the rule followed?" analysis the new subsection calls for, applied correctly. The Curator's finding could not have been written without tracing the error. The content shipped.

This is not an actionable finding — it is an observation that the quality bar set by the new principles was met in this flow's backward pass.

---

## Top Findings (Ranked)

1. **workflow.md omitted Registration step — [LIB] flows have a predictable registration loop that must appear in the path at intake** — `$GENERAL_OWNER_ROLE` + `$A_SOCIETY_OWNER_ROLE` intake guidance — `[S][LIB][MAINT]` — new standalone Next Priority
2. **Brief must explicitly waive the proposal gate for no-Proposal-phase flows** — `$GENERAL_OWNER_ROLE` + `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality — `[S][LIB][MAINT]` — merge into Next Priority 1 at synthesis
3. **Curator Approval Invariant needs topology check** — `$GENERAL_CURATOR_ROLE` + `$A_SOCIETY_CURATOR_ROLE` — `[S][LIB][MAINT]` — merge into Next Priority 1 at synthesis
4. **VERSION.md two-target gap** — `$A_SOCIETY_UPDATES_PROTOCOL` — `[S][MAINT]` — new standalone Next Priority
