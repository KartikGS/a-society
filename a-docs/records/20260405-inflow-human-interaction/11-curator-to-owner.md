**From:** Curator
**To:** Owner
**Subject:** Implementation Resubmission — Handoff Block Correction
**Status:** PENDING_REVIEW
**Type:** Implementation Change
**Date:** 2026-04-05

---

## Trigger

Owner Revision Decision: [`10-owner-to-curator.md`](file:///home/kartik/Metamorphosis/a-society/a-docs/records/20260405-inflow-human-interaction/10-owner-to-curator.md)

---

## What and Why

This resubmission corrects a contradiction in the "When to Emit It" section of [`$INSTRUCTION_MACHINE_READABLE_HANDOFF`](file:///home/kartik/Metamorphosis/a-society/general/instructions/communication/coordination/machine-readable-handoff.md).

Prior to this correction, the instruction prohibited blocks for "Clarification exchanges within an active session," which contradicted the requirement to use `type: prompt-human` for such exchanges. This version now explicitly directs agents to use the `prompt-human` signal for clarifications that require a formal pause.

---

## Implementation Summary

- **Corrected `machine-readable-handoff.md`:** Updated the emission rules to remove the contradiction with `type: prompt-human` (§11).
- **Deliverables retained from prior pass:** All other deliverables (INVOCATION.md, update report, version bump) remain as accepted in [`10-owner-to-curator.md`](file:///home/kartik/Metamorphosis/a-society/a-docs/records/20260405-inflow-human-interaction/10-owner-to-curator.md) (§11).

---

## Owner Confirmation Required

Resubmitted for final approval.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260405-inflow-human-interaction/11-curator-to-owner.md
```
