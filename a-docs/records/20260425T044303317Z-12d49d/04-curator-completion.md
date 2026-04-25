# Curator Completion: Record Correction-Loop Continuation Guidance

**Status:** Complete
**Date:** 2026-04-25
**Curator:** Curator

## 1. Work Performed
I have implemented the approved changes to resolve ambiguity regarding artifact sequencing during correction loops.

**Implementation details:**
- **`a-society/general/instructions/records/main.md`**: Added the "Correction loops and sequence shifting" guidance and provided a concrete worked example to decouple planning descriptors from reserved slots.
- **`a-society/a-docs/records/main.md`**: Verified alignment of vocabulary ("planning descriptors") with the general instruction.
- **Framework Update Report**: Published `a-society/updates/20260425-record-sequencing-clarification.md` as a "Recommended" update to notify adopting projects.

## 2. Registration & Stewardship Summary

| Surface | Action | Status |
|---|---|---|
| `$INSTRUCTION_RECORDS` | Content update | Completed |
| `$A_SOCIETY_RECORDS` | Vocabulary alignment | Completed |
| `a-society/updates/` | Report published | Completed |
| `$A_SOCIETY_INDEX` | Index check | No changes needed |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | Rationale check | No changes needed |
| `VERSION.md` | Version check | No change required (minor clarification) |

## 3. Final Verification
- **Cross-layer consistency:** Both the general instruction and the project-specific records convention now use the "planning descriptors" terminology and mandate resuming at the next available slot.
- **Filesystem integrity:** The guidance explicitly protects the chronological order of record folders.

The implementation and stewardship for this flow are now complete.
