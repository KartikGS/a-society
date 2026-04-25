# Curator Proposal: Record Correction-Loop Continuation Guidance

**Status:** Draft
**Date:** 2026-04-25
**Curator:** Curator

## 1. Problem Statement
There is ambiguity regarding artifact sequencing in record folders during correction loops (`REVISE`). Agents may attempt to "force" numbering to match the original `workflow.yaml` plan, creating gaps or confusing overrides, instead of simply resuming at the next available numeric slot.

## 2. Proposed Changes

### Change A: Update `$INSTRUCTION_RECORDS`
I propose updating `a-society/general/instructions/records/main.md` to explicitly decouple "planning descriptors" from "reserved numeric slots."

**Target Section:** `## Sequencing`
**Proposed Addition:**
Add a new paragraph clarifying the behavior during correction loops:

> **Correction loops and sequence shifting:** Artifact names provided in a `workflow.yaml` plan (e.g., `07-owner-to-curator-brief.md`) are descriptors for planning, not frozen filename reservations. If a correction loop (REVISE) or intermediate submission consumes sequence numbers originally planned for downstream artifacts, subsequent artifacts must resume at the actual next available numeric slot in the record folder.
> 
> **Example:**
> - Planned: `05-proposal`, `06-decision`, `07-implementation`
> - Actual: `06-decision` is revised $\rightarrow$ `06-decision-v2`, `07-owner-to-curator-correction`.
> - Result: The implementation artifact now becomes `08-implementation.md`.

### Change B: Align A-Society's Internal Records Convention
To ensure cross-layer consistency, I will update `a-society/a-docs/records/main.md` to mirror this guidance. Note that some of this logic already exists in A-Society's internal convention, but it will be refined for absolute clarity and consistency with the general instruction.

**Target Section:** `## Artifact Sequence`
**Proposed Refinement:**
Ensure the paragraph starting with "Correction loops do not reserve..." is updated to explicitly mention that these are "planning descriptors" to match the general instruction vocabulary.

## 3. Registration & Stewardship Summary

| Surface | Change Type | Required? |
|---|---|---|
| `$INSTRUCTION_RECORDS` | Content Addition | Yes |
| `$A_SOCIETY_RECORDS` | Content Alignment | Yes |
| `$A_SOCIETY_INDEX` | Index-row changes | No |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | Rationale update | No |
| Update Report | Draft & Publish | Yes (Framework Update) |
| Version File | Update | No (Minor change) |

## 4. Framework Update Report (Draft)
Since this changes a core library instruction (`general/`), it qualifies for a framework update report.

**Impact:** Recommended
**Change:** Clarification of record sequencing during correction loops to prevent "number forcing" and maintain chronological filesystem integrity.
**Migration Guidance:** Adopting projects should update their `a-docs/records/main.md` to reflect that `workflow.yaml` sequence numbers are descriptors, not reservations.
