# Backward Pass Findings: Owner — 20260322-brief-proposal-quality

**Date:** 2026-03-22
**Task Reference:** 20260322-brief-proposal-quality
**Role:** Owner
**Depth:** Full

---

## Findings

### Missing Information

**Finding 1 — workflow.md creation obligation not surfaced in Owner intake documentation.**

I omitted `workflow.md` at intake. The human caught it. Per the Analysis Quality principle, "the rule was documented" is the start of the analysis, not the end — the next question is why a documented obligation was not followed.

The obligation is clearly stated in `$A_SOCIETY_RECORDS` (Creating a Record Folder, step 3: "Create `workflow.md` using the schema..."). However, neither `$A_SOCIETY_OWNER_ROLE` nor `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 0 mentions `workflow.md` creation as a required intake output. The Owner role says "creates the record folder and produces `01-owner-workflow-plan.md`"; Phase 0 output says "`01-owner-workflow-plan.md` in the record folder" — workflow.md is not named in either place.

Root cause: surfacing gap. The obligation exists in `$A_SOCIETY_RECORDS` but is not echoed in the intake-facing documents the Owner reads and executes from. An Owner who follows their role's Phase 0 instructions literally will produce the plan and brief — and miss `workflow.md`. The records convention is authoritative, but the Owner's intake path doesn't route through it.

**Fix:** Add explicit mention of workflow.md creation as a Phase 0 intake obligation to both `$A_SOCIETY_OWNER_ROLE` (Post-Confirmation Protocol / Phase 0 description) and `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` (Phase 0 output list). The general Owner role template should receive an equivalent addition in domain-agnostic form (when the project uses records with backward pass tooling, create `workflow.md` alongside the plan). This is a `[S][LIB][MAINT]` item.

---

### Unclear Instructions / Scope Concerns

**Finding 2 — Owner issued implementation constraint based on stale file state, not verified file state.**

In `04-owner-to-curator.md` I stated: "in that file 'This prohibition applies to briefs and to the main approval rationale — those two contexts only.' is already a standalone paragraph — no split is required." The Curator's re-read before editing found the two sentences were in the same paragraph. They implemented correctly by following their hard rule. No correctness impact.

Root cause: I issued a specific claim about file state from memory (the file as I read it at session start) without re-reading the specific passage at review time. The Curator's "re-read before constructing `old_string`" hard rule covers edit construction — there is no parallel written obligation for the Owner to verify specific file state before issuing state-dependent constraints in a decision artifact.

**Fix:** Add a note to `$A_SOCIETY_OWNER_ROLE` review guidance: when an approval artifact makes a specific claim about current file state (e.g., "this paragraph is already standalone"), verify by re-reading the relevant passage at review time, not from session-start context. A wrong implementation constraint is wasted instruction that the Curator must detect and override. This is a `[S][MAINT]` item (A-Society-specific guidance, not obviously generalizable to the general template without more evidence).

---

### Conflicting Instructions

- none

### Redundant Information

- none

### Workflow Friction

- none that originated with the Owner's phases.

---

## Curator Findings — Assessment

**Finding C1 (Owner implementation constraint contradicted actual file state):** Covered by Finding 2 above. Root cause analysis confirms: surfacing gap in Owner approval guidance, not a Curator execution error.

**Finding C2 (No guidance for sequencing deferred update reports from closed flows):** Valid. When a deferred update report from a previously closed flow is included in a new flow's publication cycle, the correct sequencing logic (publish in chronological order of the changes, not in order of the current flow's implementation) must be reasoned by first principles. `$A_SOCIETY_UPDATES_PROTOCOL` should address this. Filing as a Next Priority for Curator synthesis: `[S][MAINT]` — add deferred-report sequencing guidance to `$A_SOCIETY_UPDATES_PROTOCOL`.

**Finding C3 (Mid-flow scope addition — proposal rewrite):** Low priority. The handling was correct and the protocol gap is narrow (rare case, clear first-principles resolution). Not filing.

---

## Top Findings (Ranked)

1. **workflow.md creation not listed in Owner intake documentation** — externally caught; surfacing gap in `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`; `[S][LIB][MAINT]` fix
2. **Implementation constraint based on stale file state** — Curator's hard rule caught it; no Owner obligation currently written; `[S][MAINT]` fix in `$A_SOCIETY_OWNER_ROLE`
3. **No guidance for deferred update report sequencing in `$A_SOCIETY_UPDATES_PROTOCOL`** — valid Curator finding; `[S][MAINT]` Next Priority

---

Next action: Perform backward pass synthesis (step 3 of 3 — final step).

Read: all findings artifacts in the record folder, then ### Synthesis Phase in a-society/general/improvement/main.md

Expected response: Synthesis artifact at the next available sequence position in the record folder. Synthesis closes the flow unconditionally.
