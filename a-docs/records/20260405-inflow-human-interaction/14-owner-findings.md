# Backward Pass Findings: Owner — 20260405-inflow-human-interaction

**Date:** 2026-04-06
**Task Reference:** 20260405-inflow-human-interaction
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

None.

### Missing Information

- The Owner role's brief-writing quality section has no guidance specific to TA design briefs. It covers Curator briefs extensively — scope, target files, implementation approach, open questions — but does not address the distinct challenge of TA briefs, where the Owner must actively partition what is a hard constraint from what is a design preference that belongs to the TA. The Owner had no explicit instruction that embedding a design preference as a constraint in a TA brief is a brief-writing quality failure; it had to be caught by the human.

### Unclear Instructions

None.

### Redundant Information

None.

### Scope Concerns

None.

### Workflow Friction

- The user had to challenge the constraint in the TA brief mid-conversation. This introduced a correction round before the TA session even began. The Owner updated the brief, which was the right outcome, but the failure mode — Owner embedding a design preference as a hard constraint without flagging it as a choice — is not currently addressed in the Owner role document or general template.

### Role File Gaps

- The Owner role's brief-writing quality section does not distinguish between Curator briefs and TA design briefs. For Curator briefs, the principle is: fully specify the work so the Curator has no judgment calls. For TA design briefs, the principle is the opposite: describe the problem clearly and reserve constraints for things that are genuinely non-negotiable. These are categorically different brief types. The current role guidance treats brief-writing quality as a single surface.

---

## Top Findings (Ranked)

### 1. Owner embedded a design preference as a hard constraint in the TA brief, closing off valid design space — `02-owner-to-ta-brief.md`, constraint 4

**What happened:** The brief stated: *"The fix must not require in-flow agents to use a special signal or syntax to indicate they're asking a question — the behavior should be derived entirely from whether a handoff block is present."* This was presented as a constraint. The user challenged it; I acknowledged the flaw and the brief was updated.

**Root cause analysis — why wasn't this caught by me?**

The constraint felt like a reasonable framing requirement at brief-writing time. I was thinking about minimizing agent-facing syntax changes and converted that preference into a constraint without asking whether the TA should evaluate it. The Owner role document has extensive guidance on brief-writing quality — scope, target files, consumer enumeration, mode declarations — but all of it addresses the problem of *under-specifying* a brief. There is no guidance on the complementary failure mode for TA design briefs: *over-constraining* by presenting a design preference as a hard requirement.

The absence of a distinction between "Curator brief" and "TA design brief" in the role guidance is the structural gap. A Curator brief should be fully specified. A TA design brief should clearly separate hard constraints (framework invariants, user direction, immovable prior decisions) from design space (open to TA judgment). A constraint in a TA brief that is itself a design choice is a category error — it removes from the TA exactly the judgment the TA is there to provide.

**Generalizable finding:** This applies equally to any project that engages a Technical Architect for design work. The brief type determines the appropriate specification style. Flag for framework contribution.

---

### 2. The "When to Emit It" contradiction in `machine-readable-handoff.md` was not caught until Curator review — `09-curator-to-owner.md`

**What happened:** After the Curator added the `prompt-human` signal to `machine-readable-handoff.md`, the existing bullet "Clarification exchanges within an active session — do not emit a block" directly contradicted the new signal. This was not caught at Phase 0 gate review, not caught during Owner integration gate review, and only surfaced when I read the file during Curator submission review.

**Root cause analysis — why wasn't this caught earlier?**

At Phase 0 gate (04), I was reviewing the TA advisory against design correctness and completeness — I wasn't reading the target file to check for pre-existing content that would conflict with the proposed addition. At integration gate (08), I was authorizing Curator scope but not re-reading the document to check for contradictions the Curator would introduce.

The Owner role document does have guidance on this: *"When a decision artifact makes a specific claim about current file state... verify that claim by re-reading the relevant passage at review time."* But that guidance is framed around claims about current state, not about checking whether a proposed addition creates a contradiction with existing content. The pre-existing conflict case — where the document already contains a prohibition that the addition violates — is not covered.

**Proportionality note:** This was caught during the flow before acceptance, so no incorrect state was published. Low severity. But the pattern (not checking for pre-existing conflicts when authorizing additions to shared instructions) is worth naming.

---

### 3. Workflow Friction: The user had to intervene on a brief-writing quality issue before the TA session

The correction round before the TA session was avoidable. One additional check at brief-writing time — "does this constraint foreclose a design option the TA should evaluate?" — would have eliminated it. The Owner role's brief-writing quality guidance is the right place for this; it already has a dense set of per-scenario rules. Adding a TA-brief-specific rule fits the existing structure without changing the model.

---

## Generalizable Contributions

**Finding 1** is a candidate for the general Owner role template (`$GENERAL_OWNER_ROLE`), Brief-Writing Quality section:

> **TA design briefs require a constraint/preference distinction.** When a brief asks a Technical Architect to produce a design, constraints in the brief must be genuinely non-negotiable — derived from framework invariants, explicit user direction, or immovable prior decisions. A design preference or working hypothesis is not a constraint; presenting it as one closes off design space the TA is specifically there to evaluate. If the Owner has a hypothesis about the right direction, name it as a preference with rationale and require the TA to address it — do not convert it into a prohibitive constraint. The test: "Would I reject a TA advisory that explored this option?" If the answer is "I don't know," it is not a constraint.

This would also apply to the general TA role template (`$GENERAL_TA_ROLE`): TAs receiving design briefs should flag constraints that appear to be design preferences and ask for explicit confirmation before treating them as hard requirements.
