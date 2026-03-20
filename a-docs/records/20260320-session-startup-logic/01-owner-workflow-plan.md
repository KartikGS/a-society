---
subject: Session Startup Logic Fix
axes:
  duration: low
  multi-role: low
  cross-functional: low
  design-decisions: low
  stability-risk: low
tier: 1
path: Owner implements directly under Tier 1 authority.
known_unknowns:
  - None
---

# Owner Workflow Plan

## Subject
Session Startup Logic Fix

## Complexity Assessment
The change removes hedging language around "start a new session" vs "resume existing" instructions across six files, making the rule concrete: "If this is a new flow, declare that a new session is required. If within an active flow, declare that the existing session should be resumed. Do not hedge or ask the human if a session exists." The logic is purely a documentation wording replacement.

## Path
Tier 1: Owner performs the fixes directly in Session A. No briefing or Curator proposal round is required.

## Known Unknowns
None.
