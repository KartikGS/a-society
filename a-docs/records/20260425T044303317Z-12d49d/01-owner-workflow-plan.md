# Workflow Plan: Record correction-loop continuation guidance

**Status:** Draft
**Date:** 2026-04-25
**Owner:** Owner

## 1. Problem Statement
Currently, there is ambiguity regarding how to handle artifact sequencing in a record folder when a correction loop (REVISE) consumes the numbers originally planned for downstream artifacts. Agents may feel compelled to "force" the numbering to match the original `workflow.yaml` plan, leading to gaps or confusing overrides, rather than simply resuming at the next available slot.

## 2. Proposed Solution
Update the redundant records instruction to explicitly decouple "planning descriptors" from "reserved numeric slots."

**Key changes to `$INSTRUCTION_RECORDS`:**
- Clarify that `workflow.yaml` artifact names (e.g., `07-owner-to-curator-brief.md`) are descriptors for planning, not frozen filename reservations.
- Mandate that if a correction loop shifts the sequence, subsequent artifacts must resume at the actual next available numeric slot in the folder.
- Provide a worked example:
    - Plan: `05-proposal`, `06-decision`, `07-implementation`
    - Event: `06-decision` is REVISE $\rightarrow$ `06-decision-v2`, `07-owner-to-curator-correction`.
    - Result: Implementation now becomes `08-implementation.md`.

## 3. Complexity Assessment
- **Domain spread:** `general/`
- **Shared artifact impact:** High (Core library instruction)
- **Step dependency:** Low (Linear)
- **Reversibility:** High
- **Scope size:** Small
- **Tier:** Tier 2 (Targeted Routed Flow)

## 4. Path
- Owner - Intake & Briefing
- Curator - Proposal & Drafting
- Owner - Framework Decision (Approval)
- Curator - Implementation & Registration
- Owner - Closure

## 5. Known Unknowns
- None.
