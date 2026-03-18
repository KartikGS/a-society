# Backward Pass Findings: Technical Architect — 20260318-tooling-enforcement-mechanism

**Date:** 2026-03-18
**Task Reference:** 20260318-tooling-enforcement-mechanism
**Role:** Technical Architect
**Depth:** Full

---

## Findings

### Conflicting Instructions

- None.

---

### Missing Information

**1. Brief omitted current implementation status, making phase placement a matter of inference.**

OQ3 asked where the new component slots in the existing tooling workflow. The correct recommendation depends critically on whether Phases 1–6 are complete or in progress: if in progress, the component could join Phase 1; if complete, it needs a standalone sprint. The brief stated that Phases 1–2 "have no inter-component dependencies and the plan validator similarly has no dependencies" — but did not state the current implementation status. I inferred completion from the coupling map's invocation status column (all six entries show "Closed 2026-03-15"). That inference was correct, but a future TA given the same type of brief for a different post-Phase-6 addition would face the same inference challenge, with no guarantee the coupling map's closed dates tell the full story.

The TA brief template (and more broadly, the standard briefing practice for TA sessions) should include a statement of current implementation state when phase placement is an explicit open question.

**2. Coupling map's `general/`-only scope assumption was undocumented; the first `a-docs/` format dependency broke it.**

The coupling map header states it records "which `general/` elements each tooling component parses programmatically." This phrasing encodes an implicit assumption: that all format dependencies will be `general/` elements. This assumption held for six components. Component 7 broke it — `$A_SOCIETY_COMM_TEMPLATE_PLAN` is an `a-docs/` file.

No document had explicitly stated the `general/`-only constraint or what to do when a dependency fell outside it. When I flagged the ambiguity in OQ4, the Owner escalated it to a hard constraint (C1: "the Curator must determine and propose a concrete representation — not defer it"). The Curator resolved it via column header change plus `[a-docs]` row annotation. The fix is practical, but the coupling map's header wording still reads "`general/` elements" — the annotation acknowledges the exception without updating the stated scope.

More importantly: the absence of a documented boundary meant the resolution was ad-hoc at approval time, not anticipated at design time. A future TA encountering the same situation (a component with an `a-docs/` format dependency) would have no guidance on what representation to recommend.

---

### Unclear Instructions

**3. TA advisory mode gate conditions are specific to the original tooling launch; not generalized for post-Phase-6 additions.**

The addendum describes TA involvement during implementation as on-demand advisory: "TA is not required at phase completion if no deviations occurred." For the original Phase 1, this is clear. For Phase 1A — a standalone sprint added after the initial phases — the gate condition is less clear. The addendum's Phase 1 section doesn't address the scenario where Phase 1 has already closed and a new Phase 1-class component is being added.

The Owner resolved this correctly in `04-owner-decision.md` C3 and confirmed it in `08-owner-to-curator.md`: "TA review is not required — Phase 1A gate requires TA only when a deviation was escalated; none was." This is the right call. But a future Developer working on a post-Phase-6 addition without this Owner framing would have to interpret addendum language written for a context that no longer applies. The addendum's advisory mode description should be generalized to cover component additions after initial phase completion.

---

### Redundant Information

- None.

---

### Scope Concerns

**4. No TA-authored artifact records the non-event of TA non-involvement during Phase 1A.**

The TA's role in this flow produced one artifact: `03-ta-to-owner.md`. After that, Phase 1A proceeded without deviation and TA advisory mode was never invoked. The outcome — "TA not consulted, implementation clean" — is recorded only in `08-owner-to-curator.md` as an Owner statement. There is no TA-authored record of this.

This is consistent with the Developer's finding #5 (implementation completion also unrecorded in a Developer artifact). Together they point to a general pattern: the record convention captures substantive artifacts (proposals, decisions, findings) but has no lightweight artifact type for "advisory role was available but not invoked." A future reader auditing the record folder sees the design proposal (03) and then nothing from the TA until backward pass findings (13) — with no way to verify from a TA-authored source that no deviation occurred.

Whether a lightweight "advisory pass" artifact is warranted is a design question for the Owner and Curator. I surface it here rather than propose a solution.

---

### Workflow Friction

**5. Existing-session handoff format is absent from the TA role doc.**

The handoff output section of `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` specifies what to provide when a new session is required: `"You are a [Role] agent for A-Society. Read [path to agents.md]."` It gives no equivalent for existing sessions — only "switch to the receiving role's existing session." My handoff at the end of `03-ta-to-owner.md` stated the receiving role, what to read, and which artifact to respond in — reasonable output, but not derived from a documented rule.

The Developer flagged this for the Developer role (finding #5) and the Curator flagged it for the Curator role (finding #4). It affects the TA role doc as well: the TA handoff is typically to an existing Owner session (Session A), not a new session, so the missing existing-session guidance is the common case for TA handoffs.

*Generalizable finding: this gap applies equally to any project using the A-Society framework where agent roles hand off to existing sessions. The role docs in `general/roles/` inherit the same omission. Flag as potential `general/` contribution — consistent with Curator's finding #4 flag.*

---

## Top Findings (Ranked)

1. **Coupling map's `general/`-only scope was implicit; first `a-docs/` dependency broke the design** — no document stated the constraint or guided the resolution; fix was ad-hoc at approval. Affects: `$A_SOCIETY_TOOLING_COUPLING_MAP` (header/scope statement); future TA guidance for component designs with `a-docs/` dependencies.

2. **Brief omitted implementation status; OQ3 phase placement was resolved by coupling map inference** — a future TA scoping a post-Phase-6 component from a similar brief would face the same inferential gap. Affects: TA brief practice (no template currently governs this); `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` or `$A_SOCIETY_COMM_TEMPLATE_BRIEF`.

3. **Backward pass order for multi-role flows unresolved in any single document** — confirmed from the TA perspective: neither `$A_SOCIETY_IMPROVEMENT` nor the addendum provides a generalizable rule; this flow's order required human direction. Affects: `$A_SOCIETY_IMPROVEMENT` backward pass traversal section; `$A_SOCIETY_TOOLING_ADDENDUM` Phase 7.

4. **TA advisory non-involvement leaves a record gap** — no TA-authored artifact confirms "no deviation, TA not consulted" between design (03) and findings (13); Owner paraphrase is the only record. Consistent with Developer's finding #5. Affects: `$A_SOCIETY_TOOLING_ADDENDUM` (advisory mode conventions); `$A_SOCIETY_RECORDS`.

5. **Existing-session handoff format undocumented in TA role doc** — affects the TA role specifically; also confirmed by Developer and Curator for their own roles. *Generalizable.* Affects: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` (handoff output section); `general/roles/` templates.
