# Backward Pass Findings: Owner — 20260316-workflow-dynamic-complexity

**Date:** 2026-03-16
**Task Reference:** 20260316-workflow-dynamic-complexity
**Role:** Owner
**Depth:** Standard

---

## Implementation Verification

All five targets confirmed implemented correctly:

- `complexity.md` — created; Tier 1 record artifacts constraint applied correctly (implementation files removed from list; clarifying sentence present)
- `$A_SOCIETY_INDEX` — new row for `$INSTRUCTION_WORKFLOW_COMPLEXITY` present
- `$A_SOCIETY_PUBLIC_INDEX` — new row for `$INSTRUCTION_WORKFLOW_COMPLEXITY` present
- `$INSTRUCTION_WORKFLOW_MODIFY` — cross-reference added to "Relationship to Other Instructions" with correct design-time vs. intake-time framing
- `$A_SOCIETY_AGENT_DOCS_GUIDE` — new entry present
- Manifest — correctly not updated; `general/manifest.yaml` enumerates `workflow/main.md` only, not other workflow instruction files

---

## Findings

### Missing Information

**1. `$INSTRUCTION_WORKFLOW` has no reference to `complexity.md`.**

`$INSTRUCTION_WORKFLOW` (main.md) is the primary entry point for agents approaching workflow-related guidance. It has no pointer to `$INSTRUCTION_WORKFLOW_COMPLEXITY`. An agent starting from `main.md` — which is the natural starting point for any workflow-related question — has no path to the intake routing guidance. The complexity model is only discoverable via `modify.md`, which has a narrower audience (agents already modifying a workflow).

This is a navigational gap: the most important entry point for workflow guidance does not surface the most important new capability in the framework. A one-line addition to main.md's relationship section would resolve it.

**Candidate for a Curator maintenance proposal.**

**2. Owner role documents do not reflect the complexity analysis responsibility.**

Conducting a complexity analysis at intake and producing a workflow plan is now a core Owner responsibility — it is what the Owner does at the start of every flow. Neither `$A_SOCIETY_OWNER_ROLE` nor `$GENERAL_OWNER_ROLE` (the general template) reference this responsibility or point to `$INSTRUCTION_WORKFLOW_COMPLEXITY`.

An agent instantiated as the Owner — in this project or any other — would correctly read their role document and have no indication that complexity analysis is expected of them. The new instruction exists but the role that must execute it has no awareness of it.

This is a more significant gap than the navigational gap above. The instruction and the role are disconnected.

**Candidate for a Curator maintenance proposal, higher priority than finding 1.**

### Conflicting Instructions

None.

### Unclear Instructions

None. The draft content is precise; the Hard Rules applicability table resolves the most likely ambiguities a reader would encounter.

### Redundant Information

None.

### Scope Concerns

None. The implementation stayed within the approved scope. The Manifest determination (no update required) was correctly reasoned from the manifest's actual enumeration pattern.

### Workflow Friction

Minimal. The brief's open questions were well-scoped and the Curator's resolutions were directly adoptable without revision cycles. The only constraint issued at Phase 2 was the Tier 1 record artifacts clarification — a one-sentence fix that was applied correctly.

---

## Top Findings (Ranked)

1. Owner role documents (`$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`) do not reflect the complexity analysis responsibility — agents playing the Owner role have no path to `$INSTRUCTION_WORKFLOW_COMPLEXITY` from their role document; requires a Curator maintenance proposal
2. `$INSTRUCTION_WORKFLOW` (main.md) has no reference to `$INSTRUCTION_WORKFLOW_COMPLEXITY` — primary entry point for workflow guidance does not surface the new capability; requires a one-line addition in a follow-up maintenance proposal
