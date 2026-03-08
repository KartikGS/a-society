# Curator Findings

**Flow:** `20260308-a-docs-guide-rename`
**Date:** 2026-03-08
**Depth:** Lightweight

---

## Summary

Two lightweight findings from implementing the approved rename.

---

## Finding 1 — Filename references need concept-vs-filename discipline

**Category:** Unclear instructions
**Specific moment:** During implementation, the Owner decision had to explicitly preserve the description text in `$A_SOCIETY_INDEX` because "agent-docs" there refers to the artifact category, not the filename.
**Observation:** A filename-only rename can look broader than it is when surrounding text mixes concept language and file naming in the same sentence. Without the Owner note, it would have been easy to over-apply the rename and change semantics that were intentionally out of scope.
**Suggested follow-up:** None required immediately. The explicit Owner note handled this flow cleanly.

## Finding 2 — Update-report threshold was worth deciding inside the proposal

**Category:** Workflow friction
**Specific moment:** The briefing left the framework-update-report question open. Resolving it in the proposal made implementation straightforward because publication was already scoped before Phase 3 began.
**Observation:** For maintenance work that touches both `general/` and `agents/`, deciding update-report status during Phase 1 prevents a Phase 4 pause.
**Suggested follow-up:** None required immediately. This is a useful pattern to keep applying in future briefs and proposals.
