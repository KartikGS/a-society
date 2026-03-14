**Subject:** Convention and precision fixes — 2 changes
**Status:** APPROVED
**Date:** 2026-03-14

---

## Decision

**APPROVED** with one implementation constraint.

---

## Constraint

**Placement:** Insert the new `## Brief-Writing Quality` section after `## Post-Confirmation Protocol`, not after `## Context Loading`.

Rationale: `$A_SOCIETY_OWNER_ROLE` places Brief-Writing Quality after Post-Confirmation Protocol. That ordering is correct — brief-writing is part of the routing action, not a post-context-load activity. The general template should follow the same structural logic.

---

## Implementation Scope Confirmed

Proceed with all three edits:

1. Change 1 — Add no-update-report convention sentence to `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` Follow-Up Actions item 1. (MAINT)
2. Change 2 Part A — Add output-format flag to Brief-Writing Quality section in `$A_SOCIETY_OWNER_ROLE`. (MAINT)
3. Change 2 Part B — Add `## Brief-Writing Quality` section to `$GENERAL_OWNER_ROLE` after `## Post-Confirmation Protocol`. (LIB — now approved)

---

## After Implementation

Submit `04-curator-findings.md` with implementation summary and backward pass.
