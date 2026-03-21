# Backward Pass Findings: Owner — 20260321-index-paths-and-bp-handoffs

**Date:** 2026-03-21
**Task Reference:** 20260321-index-paths-and-bp-handoffs
**Role:** Owner (Intake & Briefing; Review & Decision)
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information

**Brief did not specify guardrail placement within the Guardrails section.**
The brief (02) directed the Curator to add the backward pass handoff completeness rule to the Guardrails section but said nothing about where within the section. The proposal (03) resolved this as "add as a new bullet at the end of the existing guardrails." The Curator then placed it before the Forward pass closure boundary guardrail — not at the end — which is semantically defensible but contradicts the proposal spec. The Owner's review (04) validated "placement in the Guardrails section is correct" without evaluating position within the section. The deviation was only surfaced in the update report's migration guidance (05), which the Owner approved without flagging the contradiction with the proposal spec.

The underlying question — does handoff completeness belong before or after the forward pass closure boundary guardrail? — was never raised or decided. The current placement was adopted silently. The Curator's finding (08) raises this as an open question for synthesis.

### Unclear Instructions
- None beyond the placement ambiguity above.

### Redundant Information
- None.

### Scope Concerns

**`$A_SOCIETY_INDEX` follow-on must reach the priority list.**
The follow-on MAINT (A-Society's own index paths need to adopt repo-relative format) was correctly routed out of scope in 04 and confirmed unactioned in 08. It must appear in the project priority list as a Next Priority item before this flow is fully closed. Synthesis should verify this routing is complete.

### Workflow Friction

**`workflow.md` frontmatter format caused tool failure.**
The workflow.md produced for this flow was missing the `---` YAML frontmatter delimiters required by the Backward Pass Orderer. The tool failed on first invocation; the file had to be corrected manually. The records instruction and/or the workflow.md format spec should state the frontmatter requirement explicitly — the current spec documents what fields the file contains but not that it must be wrapped in `---` delimiters.

**Classification pre-specification worked well (positive finding).**
Pre-specifying Recommended for both changes in the Owner-to-Curator brief removed a potential back-and-forth during the update report phase. Change 1 (path format rule) could plausibly have been classified as Breaking — it requires remediation on every adopting project's index. Having the Owner's intended impact level in hand from the start gave the Curator a clean implementation target. Worth capturing as a recommended practice for update report flows where the Owner has a clear view of intended impact.

---

## Top Findings (Ranked)

1. Brief placement ambiguity led to a silent deviation from proposal spec — guardrail position within Guardrails section was never explicitly decided — `$INSTRUCTION_ROLES` / Owner brief-writing guidance
2. `workflow.md` missing `---` frontmatter delimiters — Backward Pass Orderer tool failure on first use — records instruction / `workflow.md` format spec
3. `$A_SOCIETY_INDEX` follow-on (repo-relative path adoption) must be confirmed on priority list before flow closes
4. Classification pre-specification in update report briefs is a friction-reducing pattern worth formalizing — Owner role template

---

## Handoff to Curator (Synthesis)

Next action: Produce backward pass synthesis (position 3 of 3)
Read: a-society/a-docs/records/20260321-index-paths-and-bp-handoffs/08-curator-findings.md
      a-society/a-docs/records/20260321-index-paths-and-bp-handoffs/09-owner-findings.md
Expected response: Synthesis artifact at 10-curator-synthesis.md
