# Owner Findings — Backward Pass

**Flow:** Records infrastructure — flow-level artifact tracking
**Role:** Owner
**Phase:** 5 — Backward Pass
**Date:** 2026-03-08
**Depth:** Full

---

## Summary

Three findings. Two are strategic observations about the framework's evolution. One agrees with and extends a Curator finding.

---

## Finding 1 — The briefing was the bottleneck, and that's correct

**Category:** Workflow friction (positive observation)

**Observation:** This flow was the first to use the new records model, and the briefing was the most labor-intensive artifact I produced. It required mapping 14 scope items, identifying three open questions, and anticipating the Curator's implementation sequence — all before the Curator was involved. By contrast, the review (Phase 2) was fast: the Curator's proposal was well-aligned with the briefing because the briefing was thorough.

**Why this matters:** The design of the workflow correctly front-loads effort at the briefing stage. A thorough briefing reduces review friction and revision cycles. This flow had zero revisions — straight to APPROVED. That is the desired outcome of a well-written briefing, not a sign of insufficient review rigor.

**Proposed action:** No change needed. This is a validation of the current design. Worth noting for future flows: a briefing that takes significant effort is working as intended — not a sign that the Owner is doing too much.

---

## Finding 2 — The scope missed cascading deletions in the agent-docs-guide (agrees with Curator Finding 1)

**Category:** Missing information / scope gap

**Observation:** The briefing (Item 13) said "add rationale entry for `records/`" but did not say "remove the `improvement/reports/` entry." The Curator correctly caught and fixed this during backward pass, but it should have been in scope. When I wrote the briefing, I was thinking about what to *add* — not what existing entries become stale due to the retirement of `improvement/reports/`.

**Specific moment:** Writing the briefing, Item 8 (retire `improvement/reports/`) and Item 13 (update agent-docs-guide) were listed as separate items. I treated Item 13 as "add the new thing" rather than "add the new thing AND remove the stale thing." The stale entry was a logical consequence of Item 8 that I failed to propagate.

**Proposed action:** I agree with the Curator's recommendation. When a briefing includes "retire a folder," the scope should automatically include "verify and clean agent-docs-guide entries for the retired folder." This could be:
- A note in the workflow's Phase 4 (Registration) description: *"When retiring content, verify no stale entries remain in `$A_SOCIETY_AGENT_DOCS_GUIDE`."*
- Or a note in the Owner role's briefing guidelines (if they are ever formalized beyond the template).

**Portability:** Generalizes — any project with an agent-docs-guide has this risk. Candidate for `$INSTRUCTION_AGENT_DOCS_GUIDE`.

---

## Finding 3 — Variable retirement protocol gap (agrees with Curator Finding 2)

**Category:** Missing information

**Observation:** The Curator correctly identified that there is no documented protocol for retiring index variables. I'll add a strategic-level observation: this gap is part of a broader pattern. The framework documents how to *create* things thoroughly (Index-Before-Reference, placement tests, quality tests) but has no corresponding guidance for *removing* things. Retirement is the inverse of creation, and it should have the same structural discipline.

**Specific moment:** In this flow, we retired `$A_SOCIETY_IMPROVEMENT_REPORTS`, `$A_SOCIETY_COMM_BRIEF`, `$A_SOCIETY_COMM_CURATOR_TO_OWNER`, and `$A_SOCIETY_COMM_OWNER_TO_CURATOR`. The Curator handled the cleanup correctly by judgment, but a different agent might have removed the index entries first (breaking references) or forgotten to grep for consumers (leaving stale `$VAR` references).

**Proposed action:** This should be a future flow. The correct place is `general/instructions/indexes/main.md` — adding a "Variable Retirement" section with the inverse of the Index-Before-Reference invariant: *"When retiring a variable, grep for all consumers first, update or remove each reference, then remove the variable from the index."* A-Society's workflow invariants should then reference this as a counterpart to Invariant 4.

**Portability:** Fully domain-agnostic. Any project with an index has this need.

---

## Response to Curator Findings

| Curator # | Finding | Owner response |
|---|---|---|
| 1 | Stale agent-docs-guide entry (fixed inline) | Agree. The pattern (not the fix) warrants documentation. See my Finding 2 above. |
| 2 | No variable retirement protocol | Agree and extend. See my Finding 3 above — this is part of a broader "creation has discipline, retirement does not" gap. Recommend as the next flow. |
| 3 | agent-docs-guide workflow entry has wrong phase count/names | Agree this is maintenance. The Curator can fix this without a flow — it's within Curator authority as routine maintenance. |
| 4 | CUSTOMIZE banner missing two-path declaration | Agree. Low-cost, within Curator authority. Can be bundled with Finding 3. |

---

## Recommended Priority for Next Flows

1. **Variable retirement protocol** (Curator Finding 2 + Owner Finding 3) — highest value; structural gap affecting any flow that retires content. Clean general-library candidate. Low implementation cost.
2. **Retirement scope in briefings/agent-docs-guide** (Curator Finding 1 + Owner Finding 2) — can be folded into the retirement protocol flow or handled as a separate lightweight flow.
3. **Curator Findings 3 and 4** — maintenance; Curator can handle without a flow.
