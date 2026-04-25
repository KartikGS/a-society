# Framework Update Report: Record Correction-Loop Continuation Guidance

**Status:** Published
**Date:** 2026-04-25
**Impact:** Recommended

## Summary
Clarified the relationship between `workflow.yaml` artifact sequencing and live record folder filenames during correction loops to prevent "number forcing" and preserve chronological integrity.

## Changes

### 1. General Instructions Update (`$INSTRUCTION_RECORDS`)
- **Change:** Added explicit guidance that artifact names in `workflow.yaml` are "planning descriptors," not "frozen filename reservations."
- **Impact:** Prevents agents from creating sequence gaps or overwriting artifacts to force-match a plan when a `REVISE` loop has shifted the sequence.
- **Migration Guidance:** Adopting projects should update their internal records convention to clarify that subsequent artifacts must resume at the next available numeric slot.

## Delivery Note
This is a recommended update for all projects using the A-Society records convention. It does not break existing record structures but improves the reliability of agent-led artifact sequencing.
