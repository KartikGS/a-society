# Backward Pass Findings: Curator — 20260328-runtime-tool-calling

**Date:** 2026-03-28
**Task Reference:** `20260328-runtime-tool-calling`
**Role:** Curator (Meta-Analysis)

---

## 1. Conflicting Instructions: Project Log Ownership vs. Registration Phase

**Finding:** The Project Log (`$A_SOCIETY_LOG`) lists "Maintenance of all content under `a-society/a-docs/`" as a Curator responsibility, which includes the log. However, the Owner's forward-pass closure (`11-owner-forward-pass-closure.md`) stated that adding the "Recent Focus" entry at flow close is an Owner responsibility.
**Root Cause:** The `Registration Phase` description in `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` focuses on indexing (`main.md`, `a-docs-guide.md`) but does not explicitly exclude the project log. In Tier 3 flows where the Owner has a distinct "Forward Pass Closure" step *after* registration, the Curator's attempt to finalize the log entry is premature and overlaps with Owner authority.
**Actionable:** Update `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` §2 (Registration Phase) to clarify that registration covers indexing existing documentation, while the forward-pass project log summary (`Recent Focus`) is an Owner deliverable at closure.

---

## 2. Analysis Quality: Factual Errors in Log Summary

**Finding:** The Curator's draft log entry produced during the registration phase contained three factual errors: incorrect type names (`Tool`, `ToolResult` instead of `ToolDefinition`, `ProviderTurnResult`) and an incorrect characterization of the loop as "recursive" when the spec defined it as "iterative."
**Root Cause:** The Curator relied on general agentic-loop mental models rather than performing verbatim retrieval from the approved Phase 0 design (`03-ta-to-owner.md`) or implementation artifacts.
**Actionable:** Add a "Verbatim Retrieval" Advisory Standard to `$A_SOCIETY_CURATOR_ROLE`: "When summarizing technical implementations in the Project Log or registration artifacts, use the exact type names, method signatures, and methodology terms from the approved design. Do not substitute generic industry terms for project-specific implementation details."

---

## 3. Workflow Friction: Sequence Numbering Collision Risk

**Finding:** A collision risk exists when multiple roles file findings without checking the record folder's actual state.
**Root Cause:** This is a known gap already identified in `20260328-runtime-provider-agnostic` and documented in Next Priorities.
**Status:** No new action needed; this flow confirms the necessity of the "verify folder state before selecting sequence number" fix in `$GENERAL_IMPROVEMENT`.

---

## 4. Generalizable Findings

### 4.1. Verbatim Summary Discipline
The rule that summaries must use project-specific verbatim types rather than generic terms (Finding 2) is project-agnostic. Any agent-docs project where a summarizing role (Curator/Orderer) extracts details from a technical role (Developer/TA) faces this drift risk.
**Target:** `$GENERAL_CURATOR_ROLE` or general summary instructions.

---

## Handoff

**Next action:** Perform your backward pass meta-analysis (step 2 of 5)
**Read:** all prior artifacts in `a-society/a-docs/records/20260328-runtime-tool-calling/`, then `### Meta-Analysis Phase` in `a-society/general/improvement/main.md`
**Expected response:** Your findings artifact at the next available sequence position in the record folder
