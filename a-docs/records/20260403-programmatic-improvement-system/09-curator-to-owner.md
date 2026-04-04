**From:** Curator
**To:** Owner
**Artifact:** Curator — Part B Proposal & Update Report Draft
**Flow:** programmatic-improvement-system (2026-04-03)
**Date:** 2026-04-04

---

## Executive Summary

This proposal covers the Phase 1 (Proposal) requirements for **Part B** of the programmatic-improvement-system brief. Part A (Direct-Authority items) has been implemented immediately as requested.

Part B focuses on splitting the monolithic `$GENERAL_IMPROVEMENT` instruction into three specialized files to support the runtime's automated session injection model. This split reduces context noise for agents by providing only the instructions relevant to their current phase (meta-analysis or synthesis).

---

## Phase 0 Completion Acknowledgement (Part A)

The following direct-authority items (Part A) have been implemented across the `a-docs/` layer:

| Item | Status | Files Modified |
|---|---|---|
| **A1. Minimal Backward Pass Initiation Removal** | COMPLETED | `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, `$A_SOCIETY_WORKFLOW_TOOLING_DEV`, `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`, `$A_SOCIETY_OWNER_ROLE` |
| **A2. Update $A_SOCIETY_IMPROVEMENT (Component 4 API)** | COMPLETED | `$A_SOCIETY_IMPROVEMENT` |
| **A3. Update $A_SOCIETY_TOOLING_COUPLING_MAP** | COMPLETED | `$A_SOCIETY_TOOLING_COUPLING_MAP` |

All explicit instructions for agents to manually initiate the backward pass have been removed, replaced by notes acknowledging the runtime's programmatic orchestration of the improvement phase.

---

## Part B Proposal: Instruction Library Restructuring

### B1. Split `$GENERAL_IMPROVEMENT`

To support the runtime's ability to inject targeted instructions, the current `a-society/general/improvement/main.md` is split into three files.

#### 1. `a-society/general/improvement/main.md` (Philosophy & Principles)
**Action:** Replace in-place.
**Content:** Retains the Core Philosophy and Principles 1–5. Adds a cross-reference block directing users to the phase-specific instruction files.
**Rationale:** This remains the philosophy source-of-truth. It is no longer an execution guide for the backward pass traversal.

#### 2. `a-society/general/improvement/meta-analysis.md` (New)
**Action:** Create.
**Content:** Contains reflection categories, analysis quality guidance, generalizable findings protocol, and useful lenses.
**New Requirement:** Mandatory `meta-analysis-complete` handoff block with `findings_path` field, as specified in TA Advisory §1.2.
**Rationale:** This file is injected by the runtime into meta-analysis sessions. It focuses solely on individual reflection and artifact production.

#### 3. `a-society/general/improvement/synthesis.md` (New)
**Action:** Create.
**Content:** Contains synthesis process (routing and merge assessment) and guardrails.
**Rationale:** This file is injected into the synthesis session. It provides the rules for closing the flow and merging findings into the project log.

### B2. Index Registration

The new variables and paths will be added to `$A_SOCIETY_INDEX` and `a-society/index.md`:

| Variable | Path | Description |
|---|---|---|
| `$GENERAL_IMPROVEMENT_META_ANALYSIS` | `a-society/general/improvement/meta-analysis.md` | Meta-analysis phase instructions — injected into backward pass agent sessions by the runtime; contains reflection categories, analysis quality guidance, and `meta-analysis-complete` signal schema |
| `$GENERAL_IMPROVEMENT_SYNTHESIS` | `a-society/general/improvement/synthesis.md` | Synthesis phase instructions — injected into the synthesis (Curator) session by the runtime; contains routing rules, merge assessment, and synthesis closure behavior |

---

## B3. Framework Update Report Draft

**Classification:** Breaking
**Rationale:** The backward pass protocol has shifted from an agent-managed manual process to a runtime-managed programmatic process. The split of the instruction library requires project Curators to update their local `a-docs/improvement/` instantiations to match the new three-file structure or the new programmatic note.

### Update Report Draft

**Framework Version:** v28.0
**Previous Version:** v27.2

#### Summary

This update marks the formal shift to the **Programmatic Improvement System**. Backward pass initiation, role traversal, and context injection are now handled by the A-Society runtime. Adopting projects must update their improvement protocol documentation to align with this change.

#### Migration Guidance (Breaking)

Project Curators must assess their `[PROJECT_IMPROVEMENT]` instantiation (typically `$PROJECT_ROOT/a-docs/improvement/main.md` or equivalent) and apply the following changes:

1. **Remove Traversal Instructions:** Delete the section describing how to manually compute the backward pass order using Component 4 or manual rules. Initiation is now handled by the runtime.
2. **Remove Initiation Language:** Any instruction directing an agent to "initiate the backward pass" at forward-pass closure should be removed.
3. **Split or Update Instruction Site:**
   - **If using the A-Society runtime:** Replace the protocol section of your improvement doc with a note that meta-analysis and synthesis instructions are injected programmatically from `$GENERAL_IMPROVEMENT_META_ANALYSIS` and `$GENERAL_IMPROVEMENT_SYNTHESIS`.
   - **If NOT using the runtime:** Retain the traversal logic but consider splitting your local protocol into meta-analysis and synthesis files if your project manages distinct sessions for these phases.
4. **Target Meta-Analysis findings signal:** Update your meta-analysis instruction to require the `meta-analysis-complete` handoff block after the findings artifact is produced.

#### Files Changed
- `a-society/general/improvement/main.md` (split)
- `a-society/general/improvement/meta-analysis.md` (created)
- `a-society/general/improvement/synthesis.md` (created)
- `a-society/index.md` (index updated)

---

## Files Changed Table

| File | Action |
|---|---|
| `a-society/general/improvement/main.md` | Replace |
| `a-society/general/improvement/meta-analysis.md` | Create |
| `a-society/general/improvement/synthesis.md` | Create |
| `a-society/a-docs/indexes/main.md` | Register `$GENERAL_IMPROVEMENT_META_ANALYSIS`, `$GENERAL_IMPROVEMENT_SYNTHESIS` |
| `a-society/index.md` | Register same variables in public index |

---

## Open Questions

None. The split logic and content extraction are fully specified in the brief and TA advisory.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260403-programmatic-improvement-system/09-curator-to-owner.md
```
