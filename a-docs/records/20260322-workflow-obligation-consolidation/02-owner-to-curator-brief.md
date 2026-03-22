# Owner → Curator: Briefing

**Subject:** Workflow obligation consolidation — forward pass closure, synthesis closure rule, and current-flow scoping (3 changes)
**Status:** BRIEFED
**Date:** 2026-03-22

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `$A_SOCIETY_WORKFLOW` | additive — new "Forward Pass Closure" section carrying two universal rules |
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | replace — remove contradicting synthesis conditional sentence from Session Model Step 6 |
| `$INSTRUCTION_WORKFLOW` | additive — new "Forward Pass Closure (mandatory)" item in "What Belongs in a Workflow Document" + new step in "How to Write One" |

This brief consolidates three previously separate Next Priority items that all target workflow obligation documentation and share `$INSTRUCTION_WORKFLOW` as a common LIB target. All three items are routed here together to avoid fragmented changes to the same file.

**Design decision (Owner):** Both the current-flow scoping rule and the synthesis-is-terminal rule are universal flow lifecycle rules — applicable to every workflow, not specific to framework development. They belong once in the routing index (`$A_SOCIETY_WORKFLOW`), not echoed into individual workflow files. The routing index already holds Session Routing Rules and Cross-Workflow Routing on this same basis. The only per-workflow change needed is removing the existing contradicting language in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Step 6 — a routing index rule does not auto-remove language that conflicts with it.

---

### Change 1 — `$A_SOCIETY_WORKFLOW`: Add universal forward pass closure section `[Curator authority — implement directly]` `[additive]`

Add a new "Forward Pass Closure" section to the routing index, at the same level as "Session Routing Rules" and "Cross-Workflow Routing," after "Session Routing Rules."

Content:

> ## Forward Pass Closure
>
> Every workflow defines a forward pass closure step as the terminal node of its forward pass. This step consolidates all closure obligations for that workflow — log updates, tooling invocations, and verification that all approved tasks have been executed, not merely approved — at the point where they are needed. Each workflow document specifies which obligations apply to it.
>
> Two rules apply universally at forward pass closure, across all workflows:
>
> - **Current-flow scoping:** backward pass initiation is scoped to the current flow only. Other flows' pending backward pass status is not referenced at this step.
> - **Synthesis is terminal:** backward pass synthesis closes the flow unconditionally. If follow-up is identified during synthesis, it is filed as a new trigger input for a separate flow — not routed back into the current flow.

---

### Change 2 — `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Session Model Step 6: Remove synthesis conditional `[Curator authority — implement directly]` `[replace target sentences]`

Session Model Step 6 currently ends with:

> "The Curator tells the human explicitly whether the flow is now complete or whether another Owner session is required. If another Owner session is needed, the Curator provides a copyable path to the relevant artifact and a copyable session-start prompt."

These two sentences contradict the universal synthesis-is-terminal rule now stated in the routing index. Replace them with:

> "Synthesis closes the flow unconditionally. If any Owner follow-up is identified, the Curator files it as a new trigger input for a separate flow — not as an additional Owner session within this flow. Session B then ends."

No other changes to `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`.

---

### Change 3 — `$INSTRUCTION_WORKFLOW`: Add forward pass closure as a mandatory workflow element `[Requires Owner approval]` `[additive]`

Two additions to `$INSTRUCTION_WORKFLOW`:

**3a — New mandatory item in "What Belongs in a Workflow Document"**

Insert a new item "6. Forward Pass Closure (mandatory)" between the current item 5 (Session Model) and the current item 6 (Backward Pass). Renumber the current item 6 (Backward Pass) to item 7.

Content for the new item:

> ### 6. Forward Pass Closure (mandatory)
>
> What happens when the forward pass ends? Every workflow document must name a forward pass closure step — the terminal node of the forward pass, which runs before the backward pass begins. This step is where the workflow consolidates its closure obligations: updating the project log, invoking any required tooling, and verifying that all approved tasks have been executed, not merely approved. Scattering these obligations across role documents and coordination protocols means they are invisible at the point they are needed; naming a closure step makes them visible and checkable.
>
> The two universal rules governing forward pass closure are stated in the project's workflow routing index (see the "Forward Pass Closure" section). Every workflow's closure step inherits those rules without restating them.

**3b — New step in "How to Write One"**

Insert a new step between the current Step 6 (Describe the session model) and the current Step 7 (Define the backward pass). Renumber the current Steps 7, 8, and 9 to Steps 8, 9, and 10.

Content for the new step:

> **Step 7 — Define the forward pass closure step.**
> Name the closure obligations for this workflow — what the terminal Owner node must confirm and execute before declaring the forward pass closed. Do not restate the two universal rules (current-flow scoping and synthesis-is-terminal) — reference the workflow routing index instead.

---

## Scope

**In scope:** The three changes described above, exactly as specified. The LIB addition in Change 3 is the primary deliverable requiring Owner approval. Changes 1 and 2 are MAINT and are within Curator authority.

**Out of scope:** Additive echoes of the universal rules into individual workflow files (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, `$A_SOCIETY_WORKFLOW_TOOLING_DEV`) — the routing index is the single home for these rules. Any changes to role documents. Any other backward pass protocol changes.

---

## Likely Target

- `$A_SOCIETY_WORKFLOW` — `a-society/a-docs/workflow/main.md`
- `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — `a-society/a-docs/workflow/framework-development.md`
- `$INSTRUCTION_WORKFLOW` — `a-society/general/instructions/workflow/main.md`

---

## Open Questions for the Curator

None. All three changes specify target file, target location within the file, and the exact content to add or replace. The proposal round is mechanical.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Workflow obligation consolidation — forward pass closure, synthesis closure rule, and current-flow scoping."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
