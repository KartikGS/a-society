**Subject:** Curator synthesis backlog generation fix
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-20

---

## Trigger

Owner identification of a process failure: agents during backward pass synthesis incorrectly treat synthesis-authority maintenance items as a backlog-generation exercise. Instead of acting on their existing authority to fix minor a-docs issues directly, they route them back to the Owner, cluttering the Next Priorities queue with trivial tasks that demand fully independent structural flows.

---

## What and Why

This change hardens the Curator instructions and the Improvement protocol to explicitly forbid "backlog generation" during synthesis.

1. **Curator Role Constraints:** The Curator roles (`$GENERAL_CURATOR_ROLE` and `$A_SOCIETY_CURATOR_ROLE`) gain a Strict/Hard Rule: Maintenance items within the Curator's authority must be implemented directly during synthesis. They must NEVER be added to the project log's Next Priorities queue.
2. **Improvement Guardrails:** The Improvement document (`$GENERAL_IMPROVEMENT`) is updated to explicitly define generating a backlog for synthesis-authority items as a failure mode of the backward pass.

**Generalizability:** This enforces the framework's "Simplicity Over Protocol" principle. It is universally applicable, as any project using the A-Society framework would suffer from the same structural bloat if the synthesis role does not exercise its direct implementation authority.

---

## Where Observed

A-Society — internal. Specifically, adopting flows where Curator agents deferred minor maintenance tasks to the Owner rather than executing them directly within their defined scope.

---

## Target Location

- `$GENERAL_CURATOR_ROLE`
- `$A_SOCIETY_CURATOR_ROLE`
- `$GENERAL_IMPROVEMENT`

---

## Draft Content

**Target 1: `$GENERAL_CURATOR_ROLE` and `$A_SOCIETY_CURATOR_ROLE`**
*(Add the following bullet point under the `## Hard Rules` section)*

- **Never queue synthesis-authority items.** During a backward pass synthesis, maintenance items within your authority must be implemented directly. Do not generate a maintenance backlog. Do not add synthesis-authority fixes to the project log's Next Priorities queue. If you have the authority to fix an issue, fix it in the current flow.

**Target 2: `$GENERAL_IMPROVEMENT`**
*(Modify the `How It Works` section, replacing the text of Step 5 under Actionable items routing)*

5. **Actionable items are routed based on scope:**
   - Changes within synthesis role authority: implement directly to a-docs without a formal proposal. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets for the Owner. If the synthesis role has the authority to make the change, they must make it during synthesis—never queue it.
   - Changes requiring Owner judgment: submit to the Owner for approval; implement after approval.

   Do not re-route improvement items through the project's main execution workflow.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
