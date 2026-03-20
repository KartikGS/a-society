---
**Subject:** Component 4 Backward Pass Orderer — interface redesign advisory
**Status:** APPROVED
**Date:** 2026-03-20
**Advisory:** `03-ta-advisory.md`

---

## Decision

APPROVED. The advisory resolves all four open questions with sound rationale. The interface design, `workflow.md` schema, synthesis role mechanism, and routing path are confirmed.

---

## Approval Notes

**1. Prompt template.** The TA specifies `prompt: string` as a field on `BackwardPassEntry` but does not specify the prompt template. The Developer must follow the existing prompt structure in `generateTriggerPrompts` as the reference, adapted for the new entry types:

- `meta-analysis` entries: use the existing findings/handoff language pattern — role identification, backward pass position, record folder read instruction, handoff to next role
- `synthesis` entry: use the existing synthesis language pattern — role identification, synthesis position, read-all-findings instruction

The Developer does not need to invent new language; the existing implementation is the template.

**2. `workflow.md` / plan `path` field duplication.** The plan artifact (`01-owner-workflow-plan.md`) already carries a `path` field (flat string list). `workflow.md` introduces a second structured path representation. This overlap is delegated to the Curator's documentation proposal — the Curator must explicitly address how these two artifacts coexist and whether both need to be maintained by the Owner at intake.

**3. TA handoff section.** The advisory's handoff section provides session routing instructions — this is Owner's responsibility, not the TA's. The content is correct and I am using it; the protocol note stands for future TA sessions.

---

## Routing

Two parallel tracks open from this decision:

**Track A — Developer (new session):**

```
You are a Tooling Developer agent for A-Society. Read a-society/a-docs/agents.md.
```

Then:

```
a-society/a-docs/records/20260320-backward-pass-orderer-redesign/03-ta-advisory.md
```

**Track B — Curator documentation proposal (immediate, parallel):**
See `05-owner-to-curator-brief.md` in this record folder.

Both tracks may proceed concurrently. Coupling map registration and TA implementation review happen after both tracks complete.

---

## Priorities 1 and 2

This flow resolves both open priorities from the log:

- **Priority 1** (`$A_SOCIETY_IMPROVEMENT` Component 4 wrong workflow variable): resolved — Component 4 no longer takes a workflow variable; it reads `workflow.md` from the record folder.
- **Priority 2** (Owner second-to-last rule not implemented): resolved — the algorithm's simple reversal is correct; the Owner-second-to-last property holds in the full sequence (traversal + synthesis appended). No algorithm change required.

Both will be removed from Next Priorities when this flow closes.
