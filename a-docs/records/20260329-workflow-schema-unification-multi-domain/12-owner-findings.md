# Owner: Backward Pass Meta-Analysis Findings

**Flow:** workflow-schema-unification-multi-domain
**Role:** Owner
**Date:** 2026-03-29
**Depth:** Full

---

## Findings

### Conflicting Instructions

- **None.**

### Missing Information

- **Component 4 backward pass algorithm does not implement parallel fork support.** `$GENERAL_IMPROVEMENT` §Backward Pass Traversal step 5 states: "Parallel forks produce concurrent backward-pass nodes. Roles whose first occurrences are at the same forward-pass position (parallel fork) produce findings concurrently, not sequentially." Component 4 uses node-list first-occurrence order, which produces a flat sequential list and ignores the parallel structure of the graph entirely. For this flow, Component 4 produced `Curator → Runtime Dev → Tooling Dev → TA → Owner`; the correct order was `[Runtime Dev, Tooling Dev] → [TA, Curator] → Owner`. The algorithm was approved in `03-ta-design-advisory.md` as the simpler option — the TA brief had correctly identified topological sort as the alternative but the decision went the other way. The failure mode was not a corner case: any flow with parallel tracks will produce a wrong backward pass order. The human had to manually override Component 4's output for this flow's backward pass.

- **Phase 7 tooling source boundary not declared.** `07-owner-integration-gate.md` opened Phase 7 for the Curator without stating whether the Curator may edit `tooling/src/*.ts` when registration-time tests fail. The Curator made the edit (Component 6 ascending sort fix), which was correct and accepted, but the decision was post-hoc. The Curator findings correctly identify this: no pre-declared rule governed the situation. Owner closure note was the safety valve — it worked but does not scale.

### Unclear Instructions

- **None.**

### Redundant Information

- **Phase 7 gate listed Track C items already confirmed complete.** `07-owner-integration-gate.md` listed all Track C files under "if not already complete, complete before registering." At that point Track C implementation was done. The framing was correct but added scan overhead for the Curator. A pre-check confirmation artifact from the Curator before Phase 7 opens would have eliminated this.

### Scope Concerns

- **Component 6 sort fix was Tooling Developer scope executed by Curator.** The fix was correct and the change is accepted. But the Curator should have flagged the issue to the Owner rather than implementing it unilaterally and the Owner should have routed it to the Tooling Developer or issued an explicit exception. The right process was: Curator surfaces "test failure requires `src/` edit" → Owner decides exception or handoff. This flow used the exception path implicitly. The Curator findings correctly propose documenting this boundary.

### Workflow Friction

- **Backward pass handoff filenames were inconsistent across parallel tracks.** Tooling Developer's findings pointed to `11-runtime-developer-findings.md`; Runtime Developer's findings pointed to `12-curator-findings.md`. The Curator correctly resolved to `11-curator-findings.md` by reading the actual folder state. This is a reliable fallback, but the inconsistency is a signal that backward-pass prompt generation should not predict filenames — it should direct agents to check actual folder contents and take "next available sequence." The improvement document already requires this (Step 2: "read the record folder's current contents to identify the actual next available number") but the generated prompts in Component 4 override this with a guessed number.

- **Multi-domain flow pattern worked.** The parallel-track structure (Owner → TA → [Tooling Dev, Runtime Dev] with parallel Curator track with embedded approval) ran without coordination issues. Track C (Curator) completed independently and folded cleanly into Phase 7 registration. The embedded Owner approval checkpoint for `general/` changes functioned correctly. This validates the pattern as the default for cross-domain feature work.

---

## Top Findings (Ranked)

1. **Component 4 node-list order is wrong for parallel flows.** The algorithm produces an incorrect backward pass order for any flow with a parallel fork. The topological approach was the right answer and should have been selected in `03-ta-design-advisory.md`. This is the highest-priority correction needed. The Owner had to manually override Component 4's output for this flow — that override should never be necessary. **Actionable:** New Next Priorities item: update Component 4 to compute backward pass order via topological reverse of the graph, preserving parallel structure as concurrent nodes.

2. **Phase 7 Curator/Tooling Developer source boundary not declared.** The gap is real, the Curator finding is actionable. The fix is a single sentence in the Phase 7 template or `$A_SOCIETY_WORKFLOW_TOOLING_DEV`: "Curator registration may include INVOCATION.md and coupling-map edits; edits to `tooling/src/*.ts` require explicit Owner exception or Tooling Developer handoff." **Actionable:** Next Priorities or bundle with Role guidance precision bundle.

3. **Component 4 prompt generation hardcodes predicted sequence numbers.** Directly contradicts the improvement document's instruction to check actual folder contents. For parallel tracks where two roles share the same sequence prefix (e.g., `10-`), the predicted next number is wrong by construction. **Actionable:** Component 4 should emit "check the record folder for the next available sequence number" rather than guessing `NN+1`.

4. **Design advisories should explicitly list new imports.** Both TA and Runtime Developer flagged this. A single sentence added to `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` advisory standards addresses it. Potentially generalizable to `$GENERAL_TA_ROLE`.

---

## Generalizable Findings

| Finding | Candidate |
|---------|-----------|
| Backward pass orderer must implement parallel fork support per improvement doc step 5 | A-Society-specific (Component 4 tooling) |
| Design advisories should list required new imports in the files-changed table | Generalizable — `$GENERAL_TA_ROLE` advisory completeness standard |
| Backward pass prompts should not predict sequence numbers — direct agents to check folder state | A-Society-specific (Component 4 prompt generation) |

---

## Next Priorities Items to Surface

1. **`[M]` — Component 4 topological backward pass algorithm** — Update `computeBackwardPassOrder` to derive order via topological reverse of the nodes/edges graph, treating roles at the same topological depth as concurrent backward-pass nodes per `$GENERAL_IMPROVEMENT` §Backward Pass Traversal step 5. The node-list first-occurrence algorithm is incorrect for any flow with a parallel fork. Follows Tooling Dev workflow. Source: this flow; Owner override of Component 4 output required at forward pass closure.

2. **`[S]` — Phase 7 tooling source boundary rule** — Add a single declarative sentence to `$A_SOCIETY_RECORDS` Phase 0 or the Phase 7 section of `$A_SOCIETY_WORKFLOW_TOOLING_DEV` specifying that Curator registration is limited to INVOCATION.md and documentation edits; `tooling/src/*.ts` changes require explicit Owner exception or Tooling Developer handoff. Source: Component 6 sort fix boundary overrun in this flow (Curator findings, Finding 1; Owner closure flag).

---

## Handoff

Next: Curator synthesis (new session).

Start a new Curator session. Read `a-society/a-docs/agents.md`, then all artifacts in `a-society/a-docs/records/20260329-workflow-schema-unification-multi-domain/`, then the Synthesis Phase section of `$GENERAL_IMPROVEMENT`.
