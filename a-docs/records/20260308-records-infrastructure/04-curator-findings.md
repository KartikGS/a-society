# Curator Findings — Backward Pass

**Flow:** Records infrastructure — flow-level artifact tracking
**Role:** Curator
**Phase:** 5 — Backward Pass
**Date:** 2026-03-08
**Depth:** Full

---

## Summary

Four substantive findings. One was caught and fixed inline during the backward pass (stale agent-docs-guide entry); three are proposed for future action.

---

## Finding 1 — Stale agent-docs-guide entry not in scope (caught and fixed)

**Category:** Missing information / scope gap

**Observation:** The brief listed item 13 as "Update $A_SOCIETY_AGENT_DOCS_GUIDE — add rationale entry for records/". It did not list "remove improvement/reports/ section from agent-docs-guide." During the backward pass, I discovered that the `improvement/reports/` section remained in agent-docs-guide.md even after the folder was deleted — a stale entry referencing both a retired folder and the now-removed `$A_SOCIETY_IMPROVEMENT_REPORTS` variable.

**Specific moment:** When reading agent-docs-guide.md lines 151–160 during the backward pass, the entry for `improvement/reports/` was present and unmodified despite the folder having been deleted in the implementation phase.

**Action taken:** Removed the stale section inline as routine maintenance (within Curator authority).

**Proposed action:** When a brief includes "retire a folder," the scope should automatically include: "verify no entry exists for this folder in $A_SOCIETY_AGENT_DOCS_GUIDE and remove if present." This is a recurring pattern, not a one-off. Consider adding it as a standard scope item in the Curator role file or workflow under Implementation.

**Portability:** Applies equally to any project with an agent-docs-guide. Candidate for `general/roles/curator.md` or `$INSTRUCTION_AGENT_DOCS_GUIDE`.

---

## Finding 2 — No documented protocol for retiring index variables

**Category:** Missing information

**Observation:** The framework documents the Index-Before-Reference invariant for *adding* new variables. There is no corresponding guidance for *retiring* variables — no documented sequence of steps to: (1) identify all consumers of the retiring variable, (2) update or remove each reference, (3) remove the variable from the index.

**Specific moment:** During implementation, I correctly sequenced retirement (removed stale references before final index cleanup), but this was judgment, not protocol. A different agent might retire the variable from the index first, leaving stale `$VAR` references in docs that resolve to nothing.

**Proposed action:** Add a "Variable Retirement" note to `$A_SOCIETY_WORKFLOW` (or the Curator role) describing the correct steps. Minimal: "When retiring a variable, grep for all usages first, update or remove each, then remove from the index."

**Portability:** Domain-agnostic. Candidate for `general/instructions/indexes/main.md` as an "Index Maintenance" section.

---

## Finding 3 — `workflow/main.md` entry in agent-docs-guide describes non-existent phase names

**Category:** Unclear instructions / stale information (pre-existing, not introduced by this flow)

**Observation:** The `workflow/main.md` entry in `$A_SOCIETY_AGENT_DOCS_GUIDE` reads: *"The six-phase workflow (Observation → Proposal → Owner Review → Implementation → Registration → Backward Pass)"*. The actual workflow has five phases (Proposal, Review, Implementation, Registration, Backward Pass). "Observation" is not a named phase. Phase names in the description do not match the actual phase names in `$A_SOCIETY_WORKFLOW`.

**Specific moment:** Read during context loading. The discrepancy between "six-phase" and the five-phase workflow, and the phantom "Observation" phase, would mislead an agent loading the agent-docs-guide as their orientation document.

**Proposed action:** Routine maintenance — update the agent-docs-guide entry to accurately reflect the workflow's five phases and correct phase names. No direction decision required.

**Portability:** A-Society-specific; internal maintenance only.

---

## Finding 4 — General improvement protocol CUSTOMIZE banner does not flag the new two-path decision

**Category:** Missing information / unclear instructions

**Observation:** `general/improvement/protocol.md` now has a two-path output location option for findings (records vs. reports/), with a note that "The project's `improvement/protocol.md` declares which path applies." However, the `[CUSTOMIZE]` banner at the top of the file does not mention this decision point. A project agent customizing this template by following only the banner may miss that they need to declare their path.

**Specific moment:** When writing the update to `general/improvement/protocol.md`, I added the two-path option but did not update the `[CUSTOMIZE]` banner to call it out, because the banner was out of scope. Reviewing the result during the backward pass, the gap is visible.

**Proposed action:** Update the `[CUSTOMIZE]` banner in `general/improvement/protocol.md` to include: "Declare which output location applies (records or reports/)." One-line addition.

**Portability:** General template; applicable to any project customizing this file.

---

## Synthesis

| # | Finding | Severity | Proposed action | Scope |
|---|---|---|---|---|
| 1 | Stale agent-docs-guide entry for retired folder | Fixed inline | Add standard scope item for folder retirement | Curator role or workflow |
| 2 | No variable retirement protocol | Medium | Add retirement steps to workflow or Curator role; port to index instruction | `$A_SOCIETY_WORKFLOW` + `$INSTRUCTION_INDEX` |
| 3 | agent-docs-guide workflow entry has wrong phase count/names | Low (maintenance) | Routine update — no Owner review needed | `$A_SOCIETY_AGENT_DOCS_GUIDE` |
| 4 | CUSTOMIZE banner missing two-path declaration note | Low | One-line addition to `general/improvement/protocol.md` | `$GENERAL_IMPROVEMENT_PROTOCOL` |

Findings 3 and 4 are maintenance-level and within Curator authority. Findings 1 (pattern, not fix) and 2 require a proposal — both are candidates for a future flow.

---

## Recommended next flow

If the Owner's findings are consistent with the above, the highest-value future flow is **Finding 2** (variable retirement protocol): it is a structural gap affecting any flow that retires variables, it has a clean general-library candidate, and it is low implementation cost.

Findings 3 and 4 can be bundled as a maintenance pass in the same session or deferred.
