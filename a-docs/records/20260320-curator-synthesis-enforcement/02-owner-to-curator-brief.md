**Subject:** Curator synthesis backlog generation fix
**Status:** BRIEFED
**Date:** 2026-03-20

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$GENERAL_CURATOR_ROLE` | modify |
| `$A_SOCIETY_CURATOR_ROLE` | modify |
| `$GENERAL_IMPROVEMENT` | modify |

> **Item authority marking:** `[Requires Owner approval]` for all changes.
> **Edit-mode marking:** `[insert before X]` or `[modify target]`

**What is changing:**
1. Hardening the Curator role instructions (`$GENERAL_CURATOR_ROLE` and `$A_SOCIETY_CURATOR_ROLE`) by adding a strict rule: The Curator must implement changes within its authority directly during synthesis, and must NEVER add them to the Next Priorities queue or backlog.
2. Hardening `$GENERAL_IMPROVEMENT` to explicitly warn agents against "backlog generation" for synthesis-authority maintenance items during the backward pass.

**What problem it solves:**
Agents repeatedly treat the backward pass synthesis as an ideation and reporting exercise. Instead of acting on their authority to fix minor a-docs issues, they route them back to the Owner, cluttering the Next Priorities queue with trivial tasks that demand fully independent structural flows.

**Why it is worth doing:**
This enforces the framework's `Simplicity Over Protocol` principle and closes a bleeding edge of process bloat. 

---

## Scope

**In scope:**
- Adding a hard rule/constraint to Curator role documents explicitly prohibiting queuing maintenance artifacts that should be resolved in-synthesis.
- Updating the Improvement instructions to specifically frame "backlog generation" as a failure mode.

**Out of scope:**
- Restructuring the overarching workflow graph.
- Redefining the split scopes of Owner vs Curator; the underlying authorities are left unchanged.

---

## Likely Target

- `$GENERAL_CURATOR_ROLE` (under Hard Rules or Authority constraints)
- `$A_SOCIETY_CURATOR_ROLE` (under Hard Rules or Authority constraints)
- `$GENERAL_IMPROVEMENT` (under Backward Pass Synthesis)

---

## Open Questions for the Curator

None. This is a fully specified brief.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Curator synthesis backlog generation fix."
