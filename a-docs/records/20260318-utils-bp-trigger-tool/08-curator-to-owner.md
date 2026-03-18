**Subject:** utils.ts + Component 4 trigger prompt extension — Curator implementation complete
**To:** Owner
**Status:** SUBMITTED — Items 1–3 complete; watch item assessment included
**Date:** 2026-03-18

---

## Items 1–3: Complete

**Item 1 — INVOCATION.md: Component 4 new functions** ✓

Updated `$A_SOCIETY_TOOLING_INVOCATION` (Component 3+4 section). Added four new subsections, inserted between the existing `orderFromGraph` subsection and the YAML schema section:

- **Interfaces: `TriggerPromptOptions` and `BackwardPassTriggerEntry`** — TypeScript interface definitions with inline field documentation
- **Generate trigger prompts: `generateTriggerPrompts`** — function signature, call example, and notes on purity and optional context field behavior
- **Order and generate trigger prompts: `orderWithPromptsFromFile`** — single-call convenience function signature, call example, and equivalence note

All interface details and signatures are drawn from `03-ta-advisory.md` Sections 3b–3c with both Owner corrections from `04-owner-to-developer.md` applied (path `a-society/a-docs/agents.md` with no leading slash; article `"the [role]"` — the INVOCATION.md format is reference documentation, not the template strings themselves, so the correction applies to the documented invocation behavior and prompt format).

**Item 2 — Architecture component table: Component 4 description update** ✓

Updated `$A_SOCIETY_ARCHITECTURE` Component 4 row:
- **Was:** "Computes correct backward pass traversal order from a workflow graph"
- **Now:** "Computes correct backward pass traversal order from a workflow graph and generates per-role session trigger prompts"

No other rows changed.

**Item 3 — Coupling map: Type C update** ✓

Updated `$A_SOCIETY_TOOLING_COUPLING_MAP`:
- Format dependency table: no new rows added. The trigger prompt generator uses the same workflow graph YAML frontmatter schema already tracked for Component 4.
- Invocation status table: Component 4 row updated to record the Type C change — status now reads "Closed (2026-03-15); Type C update processed 2026-03-18".

---

## Item 4: Watch Item Assessment — Trigger Prompt Capability in `$GENERAL_IMPROVEMENT`

**Assessment: No change to `$GENERAL_IMPROVEMENT` is needed.**

**Reasoning:**

`$GENERAL_IMPROVEMENT` (general/improvement/main.md) currently directs agents to the Backward Pass Orderer in its Tooling paragraph:

> If the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order from a workflow graph), invoke it rather than computing the order manually when the flow has more than two participating roles. Pass the project's workflow document path. The orderer returns roles in backward pass order, excluding roles that did not fire in this instance. Consult the project's tooling documentation for the specific invocation path.

This direction is correct and sufficient after the Item 1 update. The invocation gap for Component 4 remains closed. Three considerations support no change:

1. **The general template is intentionally capability-agnostic.** `$GENERAL_IMPROVEMENT` does not enumerate what a Backward Pass Orderer can do — it names the tool type and directs agents to the project's tooling documentation. A-Society's trigger prompt capability is one project's implementation detail, not a universal feature of any Backward Pass Orderer. Adding it to the general template would violate the portability invariant.

2. **The direction chain is complete.** The general template directs → project tooling documentation → INVOCATION.md now documents `generateTriggerPrompts` and `orderWithPromptsFromFile`. Agents following the existing direction discover the new capability through the correct path. No gap in the chain exists after Item 1.

3. **`$A_SOCIETY_IMPROVEMENT` scopes A-Society-specific behavior separately.** The "Component 4 mandate" section in `$A_SOCIETY_IMPROVEMENT` covers the traversal order use case. Whether that section should be extended to mention trigger prompt generation is a question outside this flow's scope — and the current mandate does not create ambiguity about the new capability's availability (agents following the mandate already land in INVOCATION.md).

No proposed change to submit. Owner confirmation requested.

---

## Return to Owner

Owner reviews this submission and confirms:
- Items 1–3 accepted
- Watch item assessment accepted (no `$GENERAL_IMPROVEMENT` change) or issues a decision if a change is required

After confirmation, Owner proceeds to backward pass.
