# Backward Pass Findings: Curator — 20260320-backward-pass-orderer-redesign

**Date:** 2026-03-20
**Task Reference:** 20260320-backward-pass-orderer-redesign
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information

**Parallel track artifact sequencing.** The records convention covers revise/resubmit cycles (append at next available position) and single-track submissions. It does not cover the case where two parallel tracks produce review submissions to the Owner at the same stage of a flow. In this flow, the documentation track and the tooling track both completed their Owner submissions at the same time, both reaching for position 08. Both files exist at that prefix (`08-ta-assessment.md` and `08-curator-update-report.md`), which is readable but violates the convention's implicit assumption that each sequence position holds one artifact. The convention has no rule for this: not which track should yield, not how to assign positions, not whether the convention should be extended to accommodate parallel track convergence.

**Generalizable:** Yes. Any project with parallel workflow tracks will encounter this gap when tracks converge at the same submission point. Applies equally to software, writing, and research projects.

**Pre-convention record folders and workflow.md.** The records convention now requires `workflow.md` to exist in record folders where Component 4 will be invoked. This flow's record folder was created before the convention was established and does not contain `workflow.md`. The backward pass orderer cannot be invoked for this flow. This is not a problem for closed flows, but the convention provides no guidance on how to handle pre-convention record folders — an agent orienting to this flow would find a `workflow.md`-less folder that does not conform to the current standard. Future agents should know whether this is expected, historical, or an error. The convention should note that pre-convention record folders are exempt from the `workflow.md` requirement.

### Unclear Instructions
- None.

### Redundant Information
- None.

### Scope Concerns
- None. The scope boundary between the documentation track (this flow) and the tooling track (Component 4 implementation) was enforced cleanly. The coupling map, INVOCATION.md, and implementation details were correctly kept in the Developer/TA scope. No scope pressure was encountered during implementation.

### Workflow Friction

**Parallel track position collision.** The position collision at 08 was noticed at the Owner's response stage, not earlier. There was no mechanism for the two tracks to coordinate on sequence position assignment before the artifacts were created. In a single-session workflow, the Curator would have known that position 08 was taken before attempting to use it. In a parallel track flow, this coordination does not happen automatically, and the convention does not provide a protocol for it.

---

## Top Findings (Ranked)

1. Parallel track artifact sequencing gap — records convention has no rule for concurrent submissions from different tracks arriving at the same sequence position; `$A_SOCIETY_RECORDS` and `$INSTRUCTION_RECORDS`
2. Pre-convention record folder exemption not documented — agents encountering old record folders without `workflow.md` have no guidance on whether this is expected; `$A_SOCIETY_RECORDS`
