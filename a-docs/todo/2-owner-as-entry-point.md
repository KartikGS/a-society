# Requirement: Owner as Universal Session Entry Point

**Status:** Implemented
**Logged:** 2026-03-08
**Scoped:** 2026-03-08
**Implemented:** 2026-03-08
**Source:** Direct observation — human orchestrator unable to identify which workflow was active mid-session

---

## What Was Observed

During an Owner session on A-Society, the human asked "What is the workflow we follow?" — revealing that the orchestrator of the framework could not naturally orient to the current workflow state. The human commented: "This is just bad UX. Even I don't know what workflow I am following right now."

This is not a knowledge gap — the workflow document exists and is well-structured. The problem is that the framework has no **front door**. The workflow is defined, but there is no mechanism that presents it to the user at session start and helps them enter it. The user must already know what the project's workflows are and which one they want to execute before they begin.

---

## The Core Problem: No Session Entry Protocol

The current framework defines:
- **Roles** — what agents are and what they own
- **Workflows** — how work moves through phases
- **Communication** — how agents exchange artifacts

What it does not define:
- **How a user enters a session** — what happens between "I need to work on my project" and "work is flowing through a workflow"

The result: users must carry the workflow structure in their own memory. They must know which roles exist, which workflow applies to their need, and which role to start with. For projects with one simple workflow, this is manageable. For projects with multiple workflows, multiple roles, or infrequent sessions, it is a UX failure.

---

## The Model: Owner as Router

The Owner role becomes the **universal entry point** for all project sessions. The user always starts the same way:

> *"You are a [project-name] owner agent. Read agents.md."*

After loading context, the Owner's first action (after context confirmation) is to **present available workflows** and help the user decide what to work on. The Owner then either:
1. **Handles it directly** — if the work is Owner-level (direction discussions, reviews, scope decisions)
2. **Routes to the appropriate workflow** — creating the trigger input and telling the human which session to switch to

### Design Decisions

**Only the Owner knows all workflows.** Other agents see their node contract (inputs, work, outputs) — not the full map. This aligns with Principle 1 (Context Is a Scarce Resource). The Owner reads the workflow document(s); other agents receive well-formed input artifacts that tell them everything they need.

**Menu is always available, never blocking.** The post-confirmation output always includes the available workflows. But the user is free to skip the menu and state their need directly. The Owner routes intelligently either way:
- User picks a workflow → Owner enters that workflow's trigger protocol
- User describes a need → Owner maps it to a workflow or engages freeform
- User wants to discuss/think → Owner engages as a thinking partner

**Defensive signal for non-Owner agents.** When a non-Owner agent receives input that does not match its expected input format (as defined in its role or workflow node contract), it should flag the discrepancy rather than proceed silently. This is the mechanism for detecting workflow bypass — the agent doesn't need to see the full map to know that its entry conditions weren't properly met.

**The broader philosophy.** The purpose of workflows is completeness — bifurcating work across roles and orchestrating communication ensures nothing is skipped. A user who bypasses the workflow is taking on risk. The framework should make the designed path easy and visible, and make workflow bypass detectable.

---

## Implementation Scope

**5 files changed across `general/`.** 2 medium + 2 small + 1 minimal. Plus A-Society's own instantiation.

### `general/` layer

| Step | File | Change | Effort |
|---|---|---|---|
| 1 | `general/roles/owner.md` | Add **workflow routing** as a responsibility. Add **post-confirmation protocol**: present available workflows, route or converse. Add workflow document to context loading. | **Medium** |
| 2 | `general/instructions/roles/main.md` | Add **defensive signal** guidance to role instruction: role files should define expected input formats; agents receiving unexpected input should flag rather than proceed. Add note to Owner archetype about routing responsibility. | **Medium** |
| 3 | `general/instructions/workflow/main.md` | Add guidance: each workflow needs a **one-line summary** for the Owner to present at session start. Add note that the **Owner is the session entry point**. | **Small** |
| 4 | `a-docs/roles/owner.md` | Instantiate routing responsibility + post-confirmation protocol for A-Society | **Small** |
| 5 | `a-docs/workflow/main.md` | Add one-line summary to A-Society's workflow | **Minimal** |

### What does NOT change

- `agents.md` (either general instruction or A-Society's own) — workflows are Owner context, not universal orientation
- Curator role — unchanged
- Communication layer — unchanged
- Architecture invariants — unchanged
- Workflow internal structure (phases, handoffs, invariants) — unchanged

### Downstream (not in this scope)

- **Initializer impact:** The Initializer should create workflow-aware Owner roles and include one-line summaries when bootstrapping workflows. Separate scope item.
- **Framework update report:** Recommended classification — adopting projects benefit from adding routing but existing projects continue to function without it.

---

## Dependencies

| Step | File | Depends on |
|---|---|---|
| 1 | `general/roles/owner.md` | None — defines the new Owner behavior |
| 2 | `general/instructions/roles/main.md` | None — independent; adds defensive signal guidance |
| 3 | `general/instructions/workflow/main.md` | Step 1 — references Owner as entry point |
| 4 | `a-docs/roles/owner.md` | Step 1 — instantiates the pattern |
| 5 | `a-docs/workflow/main.md` | Step 3 — instantiates the one-line summary |

---

## Direction Decision

**Confirmed by human.** The Owner becomes the universal session entry point. Only the Owner sees the full workflow map. Non-Owner agents flag unexpected inputs as a defensive signal. Implementation may proceed following the dependency order above.
