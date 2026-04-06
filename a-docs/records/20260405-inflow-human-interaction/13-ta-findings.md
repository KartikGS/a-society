# Backward Pass Findings: Technical Architect — 20260405-inflow-human-interaction

**Date:** 2026-04-06
**Task Reference:** 20260405-inflow-human-interaction
**Role:** Technical Architect
**Depth:** Full

---

## Context

The Owner raised two pointed questions for this meta-analysis:

1. Why did the TA not arrive at the `type: prompt-human` typed-signal solution independently? It fits the existing architecture more naturally.
2. Why did the TA accept constraint 4 in the brief ("behavior must derive from whether a handoff block is present, no special signal required") without questioning it, when the TA is the role better positioned to evaluate technical design choices?

Both questions name the same failure from different angles. The analysis below traces it to root cause.

---

## Findings

### Conflicting Instructions

- None.

### Missing Information

- None.

### Unclear Instructions

- None.

### Redundant Information

- None.

### Scope Concerns

- None.

### Workflow Friction

- None.

### Role File Gaps

**Finding 1 — The TA accepted a brief constraint that was a design preference, not a hard requirement, without flagging or evaluating it.**

The brief (§02) included constraint 4: *"The fix must not require in-flow agents to use a special signal or syntax to indicate they're asking a question — the behavior should be derived entirely from whether a handoff block is present."*

I read this as a hard requirement and anchored my entire design to it. I never asked: "Is this constraint a non-negotiable external invariant, or is it the Owner's current design thinking — something that could be revised if a better option exists?"

It was the latter. When the Owner raised `type: prompt-human` in review, they immediately revised the constraint ("you can forget about that constraint"). The constraint was soft. I treated it as hard.

**Why this happened:** My role file does not include a step for evaluating embedded constraints in briefs before designing around them. The advisory standards cover "before proposing new infrastructure, enumerate why the existing path cannot be extended" — that is, evaluating the *solution space*. There is no corresponding obligation to evaluate the *problem framing*, including whether stated constraints are correctly scoped.

**What the correct TA behavior was:** Flag the constraint explicitly in the advisory. Something like: "The brief constrains the design to avoid special signals. Before proceeding on that basis, I want to flag that the existing typed-signal pattern (`forward-pass-closed`, `meta-analysis-complete`) provides a natural extension point for this behavior. If the constraint is firm, I will proceed with error-type splitting. If it can be relaxed, `type: prompt-human` produces a cleaner result. Please confirm which direction to take." Then let the Owner decide — informed, not assumed.

---

**Finding 2 — The `type: prompt-human` solution was available from the existing architecture and should have been surfaced independently.**

The codebase already has two typed signals with distinct runtime behaviors: `forward-pass-closed` (triggers improvement orchestration) and `meta-analysis-complete` (signals backward pass completion). The pattern "specific runtime behavior = typed signal" is established. `type: prompt-human` (triggers human prompt) is a third application of the same pattern.

I did not arrive at this independently because constraint 4 had already closed that branch of the design space in my evaluation. Once I accepted the constraint, I never reached the part of the analysis that would have examined the existing typed-signal pattern as a natural extension point.

**Root cause:** The constraint acceptance failure in Finding 1 directly caused this design miss. The two failures are not independent — they are the same failure observed at different points in the design process.

---

**Finding 3 — The TA role file does not include guidance on evaluating brief constraints before designing to them.**

This is the structural gap that made both failures possible. The TA advisory standards are thorough about *design quality* (interface specification, import naming, extension-before-bypass, etc.) but say nothing about *brief evaluation*. A brief can contain embedded design preferences that constrain the solution space in suboptimal ways. The TA is the role best positioned to catch this — but only if the role file includes the obligation to look for it.

**Specific absence:** No entry in the advisory standards that reads something like: "When a brief contains design constraints, distinguish hard constraints (external dependencies, invariants, non-negotiable requirements) from design preferences (the Owner's current thinking). For design preferences, evaluate whether an alternative approach produces a better outcome and surface the comparison explicitly before proceeding."

**Framework implication:** This finding is potentially generalizable. Any role that receives a brief with embedded constraints faces the same failure mode. The TA is the sharpest case because technical design constraints are frequently preferences disguised as requirements, and the TA is the role with the standing to challenge them. But the general principle — distinguish constraint types and evaluate soft constraints before anchoring to them — applies to any agent role that operates from a brief.

**Flagged as potential framework contribution:** Yes. The obligation to distinguish hard constraints from design preferences in a brief belongs in the general TA role template (`$GENERAL_TA_ROLE`) or, more broadly, in a principle that applies to any role receiving a brief.

---

## Top Findings (Ranked)

1. **TA accepted a soft design constraint as hard without flagging it** — `02-owner-to-ta-brief.md`, constraint 4; TA role file (advisory standards section)
2. **Typed-signal pattern already established in codebase; TA should have surfaced it independently** — `runtime/src/handoff.ts` (existing `forward-pass-closed`, `meta-analysis-complete` signals); root-caused to Finding 1
3. **No advisory standard for evaluating brief constraints before designing to them** — TA role file (`a-society/a-docs/roles/technical-architect.md`, advisory standards section); candidate for `$GENERAL_TA_ROLE` propagation
