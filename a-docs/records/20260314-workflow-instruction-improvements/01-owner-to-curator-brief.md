---

**Subject:** Workflow instruction — eight targeted improvements
**Status:** BRIEFED
**Date:** 2026-03-14

---

## Agreed Change

`$INSTRUCTION_WORKFLOW` has eight distinct gaps or errors surfaced during a review session. These range from missing concepts (backward pass, parallel edge semantics, Owner-as-bookend) to incorrect framing (failure mode description, session criteria), to consistency issues (terminology, session model scope). All changes target the single file at `$INSTRUCTION_WORKFLOW`. No other files are in scope for this flow.

The eight changes, in order of appearance in the document:

**1. Add backward pass as a standard phase**
The "What Belongs in a Workflow Document" section lists five mandatory and one recommended section but never mentions the backward pass or improvement protocol. This is a gap — any project following this instruction will build a workflow without a backward pass. Add backward pass as a recommended section entry (parallel to "Session Model"), explain what it is and why it belongs in the workflow, and reference `$INSTRUCTION_IMPROVEMENT` for the protocol.

**2. Fix session model — new session criteria**
The current text has a single rule: "A new session is warranted only when the context window is exhausted or the previous session's accumulated context would be more noise than signal." This conflates two distinct situations. Split into:
- *Within a flow:* resume existing sessions by default.
- *When a flow closes:* start fresh sessions for the next flow. Accumulated context from a completed flow is almost always noise for the next one — this should be the stated default, not the exhaustion condition.

**3. Add copyable prompt to transition behavior**
The "Transition behavior" paragraph says the agent should tell the human "which session to switch to, which artifact to point the next agent at, and what to expect." It does not say the agent must produce a copyable prompt. Add: at each pause point the agent produces (a) a copyable artifact path, always; and (b) a copyable session-start prompt when a new session is required. This aligns the instruction with the v5.0 handoff standard already present in role documents.

**4. Rename "The Owner as Session Entry Point"**
The section title is imprecise — the Owner is the workflow entry point (and exit point — see item 8). "Session" is how the Owner operates, not what defines their structural role. Rename to reflect the Owner's routing and bookending function. The Curator should propose exact wording consistent with item 8 below.

**5. Session model: mandatory for two or more roles**
The current text marks the session model as "recommended" and exempts "single-role workflows or projects where the entire graph runs in one session." The second exemption is doing no work — any workflow with two or more roles has a real orchestration burden. Change: session model is mandatory for any workflow with two or more roles; optional only for genuinely single-role workflows. Drop the "entire graph runs in one session" case entirely.

**6. Graph model: parallel fork and join semantics**
The current branching section says "the condition determines which edge fires" — implying one edge fires per node. This is wrong. Add two missing patterns to the graph model:
- *Parallel fork:* a node may have multiple outgoing edges that fire simultaneously, producing parallel execution branches.
- *Join with synchronization:* a downstream node may require inputs from multiple incoming edges before it can proceed. The node waits until all required inputs have arrived.
These belong in the core graph model section (alongside the existing node/edge definitions) and also in the branching sub-section under Extended Patterns.

**7. Terminology + Owner as cross-workflow hub**
Two changes:
- Replace all instances of "phase sequence" with "workflow." "Phase sequence" is imprecise and inconsistent with usage elsewhere.
- The "Multiple distinct workflows" section currently says "Graphs run independently." This is too strong. The Owner is the cross-workflow routing layer — when a workflow terminates, the result surfaces to the Owner, who decides what to trigger next. Replace "Graphs run independently" with language that establishes the Owner as the hub connecting workflows: each workflow has its own entry and terminal node, but workflows surface to the Owner on completion, not to each other directly.

**8. Fix the "Merged with role documents" failure mode**
The current text says: "When workflow rules are scattered across role files, each role knows its piece but no one can see the whole process. Agents working across roles will apply inconsistent rules."

The first sentence is wrong — "no one can see the whole process" describes the **intended design**, not a failure. Only the Owner reads the full workflow; other roles receive well-formed inputs at their nodes. This framing contradicts what the instruction itself says about the Owner being the only reader of the workflow document.

The actual failure is: when *process rules* — invariants, transition conditions, escalation paths — are scattered across role files, those rules become inconsistent. The problem is where rules live, not who sees the full graph. Rewrite to reflect this: the failure mode is process rules fragmented across role files, producing version divergence, not "no one can see the whole process."

**9. Owner as structural bookend + backward pass ordering**
This is a new structural principle to add. The Owner is both the entry node and the terminal node of every workflow:
- *Entry:* the Owner receives the trigger (from the human or from another role), routes it into the appropriate workflow, and creates the trigger input for the first non-Owner role.
- *Terminal:* workflow completion surfaces to the Owner. The Owner acknowledges completion, logs it, and determines whether any follow-up is needed.

This closed loop enables a natural backward pass ordering: the Owner, having received the terminal confirmation, directs the backward pass starting from the role closest to implementation and moving back toward the Owner. The Owner produces findings last.

This principle belongs in "The Owner as [Workflow Entry Point]" section, and in the session model description.

---

## Scope

**In scope:** `$INSTRUCTION_WORKFLOW` only — all eight changes above.

**Out of scope:** Role documents (`$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_CURATOR_ROLE`, `$GENERAL_CURATOR_ROLE`) — these already reflect the v5.0 handoff standard. Any changes to those files from backward pass findings are a separate flow.

---

## Likely Target

`$INSTRUCTION_WORKFLOW` — `/a-society/general/instructions/workflow/main.md`

---

## Open Questions for the Curator

**Q1 — Owner-as-terminal for Curator-authority flows.**
The Owner-as-bookend principle (item 9) states the Owner is the terminal node of every workflow. Curator-authority flows (`[MAINT]` items) currently allow the Curator to close a flow without Owner confirmation mid-flow. Does the Owner still serve as the terminal node for these flows — even if only in a lightweight acknowledgment role? Or is Curator-authority a genuine exception to the bookend principle?

The Curator should recommend one of: (a) Owner is always terminal, including for Curator-authority flows, with a lightweight acknowledgment; (b) Curator-authority flows are an explicit named exception to the bookend principle; (c) the bookend principle applies only to `[LIB]` and `[ADR]` flows, not `[MAINT]`.

**Q2 — Placement of parallel fork / join in document structure.**
Item 6 says these patterns belong in both the core graph model section and the Extended Patterns branching sub-section. Confirm this is the right placement, or propose an alternative if duplicating the concepts across sections would create maintenance risk.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Workflow instruction — eight targeted improvements."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
