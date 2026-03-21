# Backward Pass Findings: Owner — 20260322-general-lib-sync-bundle

**Date:** 2026-03-22
**Task Reference:** 20260322-general-lib-sync-bundle
**Role:** Owner
**Depth:** Lightweight

---

## Findings

### Curator Finding 1 — `[Curator authority — implement directly]` write authority gap: Endorsed

The Curator's finding is valid. Item 3 directed the Curator to write to `a-society/tooling/test/`, which is outside the Curator's declared write bounds (`a-docs/` and `general/`). The explicit label in the brief made the authorization clear, but the role doc's silence creates a latent ambiguity for any future Curator who wonders whether a brief label can override their declared write scope.

**Scoping:** The fix belongs in the **brief format guidance**, not the Curator role. The brief is where the explicit designation is made; clarifying there that `[Curator authority — implement directly]` can designate write authority outside the Curator's default scope when explicitly scoped in the brief is the right home. The Curator role does not need to enumerate all possible write targets.

**Generalizability:** Applies to any project where a Curator (or equivalent downstream role) may be directed to make targeted writes outside their default bounds on an ad-hoc basis. Belongs in `$GENERAL_OWNER_ROLE` Brief-Writing Quality (and as a MAINT echo in `$A_SOCIETY_OWNER_ROLE`). `[S][LIB][MAINT]` — route to synthesis as a Next Priority.

---

### Curator Positive Observation — Conditional inspection pattern: Noted, low priority

The Curator flagged the Item 2 conditional pattern as potentially worth capturing as a general brief-writing practice. I agree it is a useful pattern: when a known unknown can be resolved by a deterministic binary inspection (found/not found), collapsing the inspection into the proposal step eliminates a potential discovery-revision cycle.

**Assessment:** Worth capturing, but niche enough that it does not warrant its own Next Priority at this time. The pattern is implied by the "Open Questions" guidance already in the brief template. If it surfaces again in a future flow, that would justify a dedicated entry.

---

### Phase 5 obligations not consolidated — root cause of two execution errors

Two execution errors occurred in this flow, both at Forward Pass Closure:

1. **Backward pass order** — Owner computed the order manually instead of invoking Component 4, and got it wrong.
2. **Log update** — Owner declared the forward pass closed before writing the log entry.

Initial assessment ("execution errors only, no documentation gap") was wrong. The correct question is *why* both errors happened, and the answer is the same for both:

**Neither `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 5 nor `$A_SOCIETY_IMPROVEMENT` is in the Owner's required reading.** At the moment of forward pass closure, the Owner is working from memory — not from the actual procedure. The log update obligation lives in `$A_SOCIETY_OWNER_ROLE`; the Component 4 mandate lives in `$A_SOCIETY_IMPROVEMENT`. Neither is surfaced at Phase 5. There is no single reference point that consolidates the forward pass closure obligations and makes them impossible to miss.

**Proposed fix:** `$A_SOCIETY_WORKFLOW` (main.md, the cross-workflow session routing rules) should state that forward pass closure is a distinct, explicit step that consolidates all closure obligations before the backward pass begins — and that those obligations must be listed at the closure point, not scattered across role documents and separate protocol files. The A-Society-specific obligations (log update, Component 4 invocation) are instantiations of this principle. The general principle also belongs in `$INSTRUCTION_WORKFLOW` so that any project using this framework builds the same consolidation into their own workflows.

**Scope:** `[S][LIB][MAINT]` — `$A_SOCIETY_WORKFLOW` (MAINT, a-docs/) and `$INSTRUCTION_WORKFLOW` (LIB, general/). Requires Owner approval — routes to Next Priorities via synthesis.

---

### Backward pass quality — externally-caught errors and artifact vs. analysis

The backward pass on this flow initially dismissed two execution errors as "execution errors only, no documentation gap" — without asking why they occurred. This is a failure of the meta-analysis itself: the analysis stopped at the first layer ("the rule is documented") rather than proceeding to the second ("why wasn't it followed?").

Two additions to `$GENERAL_IMPROVEMENT` would address this for all projects:

**Addition 1 — Externally-caught errors are higher priority, not lower.** When an error was caught by another role or the human rather than surfaced by the agent themselves, that is a signal that something failed to prevent the error. The backward pass must ask: "Why wasn't this caught by me?" The answer "the rule was documented" is the start of the analysis, not the end. The next question — "why wasn't the documented rule followed?" — leads to placement gaps, surfacing gaps, or structural gaps, all of which are actionable.

**Addition 2 — Artifact production vs. genuine analysis.** The reflection categories are a starting point, not a checklist to fill. If a finding could have been written without tracing the error, the analysis has not been done. A genuine finding names a specific root cause, not just a description of what went wrong.

**Scope:** `[S][LIB][MAINT]` — additions to `$GENERAL_IMPROVEMENT` (LIB) with echo to `$A_SOCIETY_IMPROVEMENT` (MAINT). Routes to Next Priorities via synthesis.

---

## Top Findings (Ranked)

1. Forward pass closure obligations not consolidated — `$A_SOCIETY_WORKFLOW` + `$INSTRUCTION_WORKFLOW` — `[S][LIB][MAINT]` — Next Priorities via synthesis
2. Backward pass quality — externally-caught errors and artifact vs. analysis — `$GENERAL_IMPROVEMENT` + `$A_SOCIETY_IMPROVEMENT` — `[S][LIB][MAINT]` — Next Priorities via synthesis
3. `[Curator authority — implement directly]` write authority gap — `$GENERAL_OWNER_ROLE` Brief-Writing Quality + `$A_SOCIETY_OWNER_ROLE` echo — `[S][LIB][MAINT]` — Next Priorities via synthesis
