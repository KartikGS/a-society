---

**Subject:** Workflow instruction — nine targeted improvements
**Status:** APPROVED
**Date:** 2026-03-14

---

## Decision

APPROVED — with one implementation constraint. See below.

---

## Rationale

All five review tests pass.

**Generalizability:** All nine changes apply to software, writing, and research projects equally. The backward pass, parallel fork/join, Owner-as-bookend, and delegated-authority exception are patterns applicable to any multi-role project type. None assume a specific domain or technology.

**Abstraction level:** Changes are correctly scoped. The delegated-authority exception is well-bounded — the scope constraint (must exclude direction, library-level, and structural decisions) is stated explicitly and prevents silent scope creep. The parallel fork/join definitions are precise without being implementation-specific.

**Duplication:** No overlap with existing content. The backward pass section correctly references `$INSTRUCTION_IMPROVEMENT` rather than reproducing it. The Q2 recommendation (short definitions in the core graph model, full usage guidance in Extended Patterns) is the right call — it avoids maintaining the same explanation in two places.

**Placement:** `$INSTRUCTION_WORKFLOW` is the correct and only target.

**Quality:** An unfamiliar agent following this instruction would produce a correct workflow document. One implementation constraint applies — see below.

On the open questions: Q1 recommendation (b — delegated-authority as explicit named exception) is accepted. The scope constraint as written in the draft is correctly bounded. Q2 recommendation (single-source prose in Extended Patterns, definitional entries in core graph model) is accepted.

On the brief subject line discrepancy: the proposal is correct — there are nine items, not eight. The brief had a drafting error in the subject line only; all nine items were present in the Agreed Change section and are all in scope.

---

## Implementation Constraints

**One correction required during implementation — do not implement the draft as-is on this point:**

In the Extended Patterns / Branching section, the existing sentence "At runtime, the condition determines which edge fires" (singular) is left unchanged in the draft. This creates an internal inconsistency: the sentence implies one edge fires per decision, but the parallel fork paragraph immediately below it describes multiple edges firing simultaneously. These are two distinct branching patterns — conditional branching (one of N fires) vs. parallel fork (multiple fire simultaneously) — and the section treats them as if they are the same thing introduced by the same sentence.

Fix: split the branching section into two clearly named sub-patterns before implementing:
1. **Conditional branching** — retaining the existing language about defining a condition for each outgoing edge, clarifying that at runtime one edge fires based on which condition is met.
2. **Parallel fork and join** — the new content, as drafted, describing simultaneous edge firing and join synchronization.

The two patterns should not share an introductory sentence. The current draft's structure implies parallel fork is a sub-case of conditional branching; it is not.

All other changes implement as drafted.

---

## Follow-Up Actions

1. **Update report:** This change modifies `$INSTRUCTION_WORKFLOW` in `general/` — a document consumed by adopting projects. Assess whether a framework update report is required. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL`.
2. **Backward pass:** Required from both roles.
3. **Version increment:** Handled by the Curator as part of Phase 4 registration if an update report is produced.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Workflow instruction — nine targeted improvements."

The Curator does not begin implementation until they have acknowledged in the session.
