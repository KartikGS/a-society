# Curator Synthesis — 20260318-utils-bp-trigger-tool

**Date:** 2026-03-18
**Task Reference:** 20260318-utils-bp-trigger-tool
**Role:** Curator
**Source Artifacts:** 10-curator-findings.md, 11-developer-findings.md, 12-ta-findings.md, 13-owner-findings.md

---

## Overview

Four roles produced findings. Two follow-on items warrant new trigger inputs. No Curator-direct maintenance action is authorized from this backward pass: the highest-leverage documentation fix (`$A_SOCIETY_IMPROVEMENT` Component 4 mandate) was explicitly routed by the Owner as Curator proposal -> Owner review, and the runtime guard for `generateTriggerPrompts` requires a new TA/Developer flow.

**Actionable follow-on items:** 2
**Curator-direct:** 0
**Owner-routed:** 2
**Observation-only:** 2

---

## Cross-Role Convergences

### Convergence 1 — `$A_SOCIETY_IMPROVEMENT` still routes agents to manual or partial Component 4 use

**Sources:** Curator Finding 1, Curator Finding 2, Owner Findings 1, 4, 6

The human correction to `09-owner-to-curator.md` confirmed the exact gap this flow was meant to close: manual backward-pass routing remains error-prone unless the protocol tells agents to invoke the tool path that now exists. Two problems sit in the same section of `$A_SOCIETY_IMPROVEMENT`:

1. The mandate references `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`, which is not registered in `$A_SOCIETY_INDEX`.
2. The mandate names traversal-order computation only. It does not name `orderWithPromptsFromFile`, so agents following the mandate would still miss the trigger-prompt capability added in this flow.

The Owner correctly grouped these as one maintenance bundle in `13-owner-findings.md`. This is the highest-leverage documentation follow-on from the flow.

---

### Convergence 2 — `generateTriggerPrompts` has an unhandled synthesis-absent contract gap

**Sources:** Developer Finding 2, TA Finding 2, Owner Finding 5

Three roles converged on the same correctness issue: `generateTriggerPrompts` dereferences `order[N]` at the last non-synthesis entry, but the spec never defined what should happen if the caller excludes the synthesis node via `firedNodeIds`. The current documented workflows will not hit this path, so it was correctly treated as a spec gap rather than a blocking deviation. But the code will throw if a caller does it.

This is not a Curator maintenance fix. It needs a new scoped tooling flow: define the contract first, then implement the guard and have TA review it.

---

## Observation-Only Notes

### Observation 1 — Export-removal change tables should name affected tests

**Sources:** Developer Finding 1, TA Finding 1, Owner Finding 5

The advisory's source-file change table correctly scoped the implementation work, but it did not name `workflow-graph-validator.test.ts`, which deterministically broke once `extractFrontmatter` stopped being re-exported. The Developer handled the fix correctly and the TA correctly classified it as non-deviation. No new flow is proposed from this backward pass, but this should inform future TA advisory writing when export removals are involved.

---

### Observation 2 — Watch-item briefs should quote the target passage

**Sources:** Curator Finding 3, Owner Finding 2

The watch item in `07-owner-to-curator.md` required loading both `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` to identify the assessed text. The assessment itself was easy once the passage was found. This is a brief-authoring quality note, not a new trigger input from this flow.

---

## Routed Trigger Inputs

### A. `$A_SOCIETY_IMPROVEMENT` Component 4 mandate bundle `[S][MAINT]`

**Source:** Owner Finding 6 and the Next Priorities bundle in `13-owner-findings.md`

**Work required:**
- Replace the unregistered `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` reference or register it in `$A_SOCIETY_INDEX`
- Extend the Component 4 mandate to name `orderWithPromptsFromFile` as the expected call when trigger prompts are needed, not just traversal order

**Routing:** Curator proposal -> Owner review -> Curator implementation. The Owner already classified this as a follow-on priority; it is not implemented in this synthesis.

---

### B. `generateTriggerPrompts` synthesis-absent guard `[S]`

**Source:** Owner Finding 5 and Next Priority B in `13-owner-findings.md`

**Work required:**
- Define the contract for synthesis-absent orders
- Implement a guard for `nextEntry === undefined`
- TA reviews implementation against the chosen contract

**Recommended contract direction from Owner findings:** throw with a clear error message when the synthesis node is absent

**Routing:** New Owner-routed TA/Developer flow. Not a Curator-direct action.

---

## Flow Status

The implementation flow itself is complete and the backward pass is now synthesized. Two new trigger inputs surfaced cleanly.

As of this synthesis, `$A_SOCIETY_LOG` still reflects the pre-flow `Next Priorities` state: it still carries the closed "Shared utils.ts + backward pass trigger prompt tool" priority and does not yet include the two follow-on items identified in `13-owner-findings.md`. Because `Next Priorities` are Owner-owned, I am not closing the log lifecycle sections in this step. One Owner touch is still required before the Curator closes the flow in `$A_SOCIETY_LOG`.

---

## Handoff

Switch to: Owner Session A (existing session).

```
Next action: Update `$A_SOCIETY_LOG` Next Priorities for this closed flow (remove the closed "Shared utils.ts + backward pass trigger prompt tool" item and add the two follow-on items surfaced in 13-owner-findings.md), then confirm whether the Curator should close the log lifecycle sections.
Read: a-society/a-docs/records/20260318-utils-bp-trigger-tool/14-curator-synthesis.md
      a-society/a-docs/records/20260318-utils-bp-trigger-tool/13-owner-findings.md
Expected response: Owner confirmation at `15-owner-to-curator.md`, including the Next Priorities update outcome and whether the Curator should now close `$A_SOCIETY_LOG`.
```
