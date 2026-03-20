---
**Subject:** Component 4 Backward Pass Orderer — interface redesign advisory
**Status:** BRIEFED
**Date:** 2026-03-20

---

## Context

This flow redesigns Component 4 (Backward Pass Orderer) based on two decisions made in the Owner session:

1. **Component 4's input source changes.** It currently takes a `WorkflowGraph` parsed from the permanent workflow file. This is wrong — the workflow file gives the canonical structure, not the instance-specific participation. The correct input is `workflow.md` in the record folder: a path-only ordered list of role/phase pairs representing who actually participated in this flow. This file is written by the Owner at intake and appended to by authorized roles as the flow progresses.

2. **Component 4's output format changes.** It currently returns `string[]` — a flat list of role names. The output must be enriched to carry three fields per entry: role, step type (`meta-analysis` | `synthesis`), session instruction (`existing-session` | `new-session`). The synthesis entry is always appended last by the algorithm — it is not part of the traversal reversal. The `synthesisRole` parameter on `generateTriggerPrompts` is dropped — the algorithm itself determines and appends the synthesis entry.

3. **Component 4 is always invoked.** The current documentation restricts invocation to multi-role flows. This conditional is removed — the tool handles the two-role case correctly and agents should not be making this judgment call.

The Curator cannot draft the documentation changes (improvement protocol, records convention, general library) until the interface is settled. This advisory is the gate.

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` | modify |

[Requires Owner approval]

**Direction:**

Component 4 is redesigned around a new input source (`workflow.md` in the record folder) and a new enriched output format. The algorithm itself (deduplicate first occurrences, reverse) is correct and does not change. What changes is what it reads, what it returns, and the addition of the synthesis-append step as a fixed final step of the algorithm.

The enriched output entry per role:
- `role` — role name string
- `stepType` — `meta-analysis` | `synthesis`
- `sessionInstruction` — `existing-session` | `new-session`

All traversal entries are `meta-analysis / existing-session`. The appended synthesis entry is always `synthesis / new-session`. When the synthesis role also appears earlier in the traversal (e.g., Curator appears as a forward-pass participant and again as synthesis), it appears twice in the output — once as `meta-analysis` in its reversed position, once as `synthesis` appended last. This is correct and intentional.

---

## Scope

**In scope:**
- Specification of the new `workflow.md` YAML schema that Component 4 parses
- New type signatures for `computeBackwardPassOrder`, `generateTriggerPrompts`, and `orderWithPromptsFromFile`
- How the synthesis role is determined without a caller-supplied parameter
- Whether `orderWithPromptsFromFile` is the primary public entry point (reads `workflow.md` from a record folder path and returns the full enriched backward pass plan + prompts)
- Routing recommendation: does this modification follow the Post-Phase-6 addendum path or a simplified TA-advisory + Developer path?
- Confirmation that the `workflow.md` format does not create a coupling gap with any other component (consult `$A_SOCIETY_TOOLING_COUPLING_MAP`)

**Out of scope:**
- The documentation changes themselves (improvement protocol, records convention, general library) — those are the Curator's documentation proposal in the next step
- Changes to any component other than Component 4
- The `workflow.md` authoring rules and sequencing within the record folder — those belong in the documentation proposal

---

## Likely Target

- `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` — the component source to be modified
- `$A_SOCIETY_TOOLING_PROPOSAL` — the original design spec; the TA advisory supplements this
- `$A_SOCIETY_TOOLING_ADDENDUM` — workflow and phase sequencing; contains the Post-Phase-6 section that governs this routing question
- `$A_SOCIETY_TOOLING_COUPLING_MAP` — check for format dependency gaps introduced by `workflow.md`

---

## Open Questions for the TA

1. **`workflow.md` schema:** What is the exact YAML schema Component 4 expects? The agreed format is a path-only ordered list of role/phase strings (e.g., `- Owner - Intake`). Confirm the field name, value format, and whether any additional fields are needed for Component 4 to function.

2. **Synthesis role determination:** With `synthesisRole` parameter dropped, how does Component 4 know which role to append as synthesis? Options: (a) passed as a project-level config parameter to `orderWithPromptsFromFile`; (b) a fixed convention (last unique role in the path list); (c) some other mechanism. TA to recommend.

3. **`orderWithPromptsFromFile` as primary entry point:** Should this be the new primary public function — taking a record folder path, reading `workflow.md`, returning the full enriched output and prompts — with `computeBackwardPassOrder` and `generateTriggerPrompts` becoming internal? Or should both remain exported? TA to specify.

4. **Post-Phase-6 routing:** Does this modification use the addendum's Post-Phase-6 Component Additions path, or a simplified TA-advisory + Developer path that the Owner approves directly? TA to recommend based on the scope of the change.

---

## TA Confirmation Required

Before beginning the advisory, the TA must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning advisory for Component 4 Backward Pass Orderer — interface redesign."

The TA does not begin work until they have read this brief in full and confirmed acknowledgment.

Return to the Owner when the advisory is complete, with a copyable path to the advisory artifact.
