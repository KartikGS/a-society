# Backward Pass Findings: Owner — 20260317-general-phase0-gate

**Date:** 2026-03-17
**Task Reference:** 20260317-general-phase0-gate
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- **`$A_SOCIETY_RECORDS` artifact sequence is stale.** The sequence table still documents `01-` as `owner-to-curator-brief.md`. Since Phase 0 was formalized, `01-` is `owner-workflow-plan.md` and the brief shifts to `02-`. The "Creating a Record Folder" section also directs the Owner to create `01-owner-to-curator-brief.md` as the first step. Every future flow will diverge from the documented sequence unless this is corrected. This is a Curator-authority MAINT fix.

### Unclear Instructions
- **Brief-Writing Quality language understates the approval gate.** `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` both describe a fully-specified brief as one where "the proposal round becomes a confirmation step." This is accurate about the Curator's judgment workload — but it also minimizes the structural role of the approval round, which is to produce the APPROVED decision that authorizes implementation. An agent reading "confirmation step" for a fully-specified brief may conclude the gate is procedural rather than structural. The Approval Invariant is explicit — "approval is established by a Phase 2 decision artifact, not directional alignment in a briefing" — but this language lives in `$A_SOCIETY_WORKFLOW`, not in the Brief-Writing Quality section or the brief template itself. The authorization scope block in the brief template (`$A_SOCIETY_COMM_TEMPLATE_BRIEF` and `$GENERAL_*` equivalent) states the distinction, but the brief I wrote for this flow did not draw attention to it, and the Brief-Writing Quality section provides no reinforcement of the authorization threshold.

### Redundant Information
- None.

### Scope Concerns
- None.

### Workflow Friction
- **Approval Invariant violation — structural cause.** The Curator's findings correctly identify the proximate cause (fully-specified brief, no forced pause before implementation). The deeper cause is that nothing in the workflow forces the Curator to wait between submitting `03-` and beginning implementation. The brief authorization scope block says the boundary clearly, but it is static text that agents can read and then override in execution. The authorization boundary is structural in the documented invariants but not enforced at the handoff level. A brief that generates no counter-proposal has no visible signal that a Phase 2 decision is still needed — the Curator receives a fully-specified brief, has nothing to add, and the next logical action feels like implementation. The gap is in the handoff design, not just the brief text.

---

## Top Findings (Ranked)

1. **`$A_SOCIETY_RECORDS` artifact sequence is stale** — `01-` still documented as the brief; Phase 0 made `01-` the plan and `02-` the brief; every future flow diverges from the documented sequence (`$A_SOCIETY_RECORDS`). Curator-authority MAINT. Target file: `$A_SOCIETY_RECORDS`. Fix type: update sequence table and "Creating a Record Folder" section.

2. **Brief-Writing Quality language minimizes the approval gate** — "proposal round becomes a confirmation step" understates the structural gate that the proposal round still satisfies; no reinforcement of the authorization threshold appears in either the Brief-Writing Quality section or the brief template wording (`$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_COMM_TEMPLATE_BRIEF`). Curator proposes; Owner reviews. [S][LIB][MAINT] — touches both general templates and A-Society internal role.

3. **Approval Invariant violation — gap between brief language and handoff enforcement** — the authorization boundary is documented in `$A_SOCIETY_WORKFLOW` but absent from the point of action (brief format, handoff output protocol); a fully-specified brief creates no structural pause before implementation begins. Broader fix: consider whether the Curator's pre-implementation check should be made explicit in `$A_SOCIETY_CURATOR_ROLE` as a hard rule. Direction decision involved — Owner-level scope. [S][MAINT].
