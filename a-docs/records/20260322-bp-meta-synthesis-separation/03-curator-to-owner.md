# Curator → Owner: Proposal / Submission

**Subject:** Improvement docs restructure — separate meta-analysis phase from synthesis phase (Backward Pass Protocol)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-22

---

## Trigger

Owner briefing `02-owner-to-curator-brief.md` in record folder `20260322-bp-meta-synthesis-separation` — mechanical proposal round: split `### How It Works` into `### Meta-Analysis Phase` and `### Synthesis Phase` in `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT`, per the output form in that brief.

---

## What and Why

**What.** In both improvement documents, replace the contiguous block from `### How It Works` through `### Useful Lenses` (general) or `### Reflection Categories` through `### Useful Lenses` (A-Society) with two phase headings. Meta-Analysis Phase holds findings-production steps and the reflection-guidance subsections (now `####`). Synthesis Phase holds synthesis-only steps. `### How It Works` is removed; no content dropped.

**Why.** Clean separation so findings-role agents and the synthesis role each have a scoped section — prerequisite for future Component 4 prompt embedding and independently clearer navigation.

---

## Where Observed

A-Society — internal; agreed in the Owner brief for this flow.

---

## Target Location

- `$GENERAL_IMPROVEMENT`
- `$A_SOCIETY_IMPROVEMENT`

---

## Draft Content

Implementation replaces only the block *between* `### Backward Pass Traversal` and `### Guardrails` in each file — specifically the former `### How It Works` → reflection subsections → `### Useful Lenses` span. Everything above Backward Pass Traversal and `### Guardrails` onward stays as today.

**Implementation note:** The `[CUSTOMIZE]` block at the top of `$GENERAL_IMPROVEMENT` still says to declare output location in the "How It Works" section. That line is outside the Backward Pass Protocol section and was out of scope for this proposal; consider a one-line follow-up to point at the Meta-Analysis Phase if you want template text aligned with the new headings.

---

### A. `$GENERAL_IMPROVEMENT` — replacement block (insert after `### Backward Pass Traversal` … through the tooling paragraph, then this content, then `### Guardrails`)

The paragraph ending with manual traversal rules (the existing Traversal section) stays unchanged up to and including line break before the old `### How It Works`. The following is the **full** replacement for the old `### How It Works` through `### Useful Lenses` inclusive:

```markdown
### Meta-Analysis Phase

Instructions for roles producing backward pass findings.

**Step 1.** **Each agent who participated in the forward pass** produces a findings artifact reflecting on their experience — what was clear, what was ambiguous, what was missing, what conflicted. Follow the traversal order above.

**Step 2.** **Output location:**
   - *If the project uses records:* `[PROJECT_RECORDS]/[identifier]/NN-<role>-findings.md` — findings are sequenced artifacts in the active record folder
   - *If the project does not use records:* `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md`

   The project's `improvement/main.md` declares which path applies.

**Step 3.** **Template:** `[PROJECT_IMPROVEMENT_TEMPLATE_FINDINGS]`

#### What to Reflect On

Use these categories to guide your reflection (not all will apply to every task):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear

Ground every finding in a specific moment from your execution. Vague findings ("the docs could be better") are not useful.

---

#### Analysis Quality

**Externally-caught errors are higher priority, not lower.** When an error was caught by another role or the human rather than surfaced by the agent themselves, this is a signal that something failed to prevent the error. The backward pass must ask: "Why wasn't this caught by me?" The answer "the rule was documented" is the start of the analysis, not the end. The next question — "why wasn't the documented rule followed?" — leads to placement gaps, surfacing gaps, or structural gaps, all of which are actionable.

**Artifact production vs. genuine analysis.** The reflection categories are a starting point, not a checklist to fill. If a finding could have been written without tracing the error, the analysis has not been done. A genuine finding names a specific root cause, not just a description of what went wrong.

---

#### Generalizable Findings

When a finding appears project-agnostic — meaning it would apply equally to a software project, a writing project, and a research project — flag it explicitly as a potential framework contribution. Note it in the findings artifact so it is not lost.

The submission mechanism is defined separately — flag the finding explicitly in your findings artifact so it is not silently lost when the mechanism becomes available.

---

#### Useful Lenses

When evaluating whether a finding warrants action, consider:

- **Portability:** Is the fix specific to this project, or should it propagate to the general library?
- **Evolvability:** Does the fix reduce future edit cost (e.g., canonical source + cross-reference instead of duplication)?
- **Proportionality:** Is the fix worth the disruption? Small friction in a rare edge case may not warrant a doc change.

These are judgment aids, not mandatory per-finding assessments.

---

### Synthesis Phase

Instructions for the synthesis role.

**Step 1.** **The synthesis role** reviews all findings and identifies which warrant action.

**Step 2.** **Actionable items are routed based on structural scope:**
   - Changes within `a-docs/`: implement directly without a formal proposal. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets. If the change is within `a-docs/`, make it now — never queue it.
   - Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create an entry for a future flow using the project's tracking mechanism. **Before filing**, apply the merge assessment: scan existing Next Priorities items for same target files/design area and compatible authority level; when a merge is identified, replace the existing item(s) with a merged item retaining all source citations. Do not initiate an Owner approval loop from within the backward pass.

   Do not re-route improvement items through the project's main execution workflow.

   The synthesis role completing synthesis closes the backward pass. No further handoff is required — the flow is complete when synthesis is done.

---

```

*(Implementation: the following section in each target file remains the existing `### Guardrails` block; the `---` above matches the separator that previously appeared after `### Useful Lenses`.)*

---

### B. `$A_SOCIETY_IMPROVEMENT` — replacement block (insert after `### Backward Pass Traversal` … through the Bootstrapping exemption paragraph, then this content, then `### Guardrails`)

The following is the **full** replacement for the old `### How It Works` through `### Useful Lenses` inclusive:

```markdown
### Meta-Analysis Phase

Instructions for roles producing backward pass findings.

**Step 1.** **Curator produces findings first** (closest to implementation friction).
**Step 2.** **Owner produces findings second**, reviewing Curator findings and adding strategic-level observations.
**Step 3.** **Output:** The next sequenced artifact in the active record folder — e.g., `04-curator-findings.md`, `05-owner-findings.md`. See `$A_SOCIETY_RECORDS` for the naming convention.
**Step 4.** **Template:** `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`

#### Reflection Categories

Use these to guide your reflection (not all will apply every time):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear

Ground every finding in a specific moment from your execution.

---

#### Analysis Quality

**Externally-caught errors are higher priority, not lower.** When an error was caught by another role or the human rather than surfaced by the agent themselves, this is a signal that something failed to prevent the error. The backward pass must ask: "Why wasn't this caught by me?" The answer "the rule was documented" is the start of the analysis, not the end. The next question — "why wasn't the documented rule followed?" — leads to placement gaps, surfacing gaps, or structural gaps, all of which are actionable.

**Artifact production vs. genuine analysis.** The reflection categories are a starting point, not a checklist to fill. If a finding could have been written without tracing the error, the analysis has not been done. A genuine finding names a specific root cause, not just a description of what went wrong.

---

#### Generalizable Findings

When a finding appears project-agnostic — meaning it would apply equally to a software project, a writing project, and a research project — flag it explicitly as a potential A-Society contribution. Note it in the findings artifact so it is not lost.

The submission mechanism is defined separately — flag the finding explicitly in your findings artifact so it is not silently lost when the mechanism becomes available.

---

#### Useful Lenses

When evaluating whether a finding warrants action:

- **Portability:** Should the fix propagate to `general/`, or is it A-Society-specific?
- **Evolvability:** Does the fix reduce future edit cost?
- **Proportionality:** Is the fix worth the disruption?

These are judgment aids, not mandatory per-finding assessments.

---

### Synthesis Phase

Instructions for the synthesis role.

**Step 1.** **Curator synthesizes** actionable items from both findings artifacts and routes them based on structural scope:
   - Changes within `a-docs/`: implement directly. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets. If the change is within `a-docs/`, make it now — never queue it.
   - Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create a Next Priorities entry in `$A_SOCIETY_LOG`. **Before filing**, apply the merge assessment: scan existing Next Priorities items for same target files/design area and compatible authority level; when a merge is identified, replace the existing item(s) with a merged item retaining all source citations. The Owner routes these as new flows.

   Do not re-route improvement items through the project's main execution workflow.

   Curator completing synthesis closes the backward pass. No further handoff is required — the flow is complete when synthesis is done.

---

```

*(Implementation: the following section in each target file remains the existing `### Guardrails` block; the `---` above matches the separator that previously appeared after `### Useful Lenses`.)*

---

## Update Report Draft *(Proposals only — include when the proposed change is likely to qualify per `$A_SOCIETY_UPDATES_PROTOCOL`; omit otherwise)*

Omitted per brief: consult `$A_SOCIETY_UPDATES_PROTOCOL` post-implementation to determine classification; do not pre-classify in the proposal.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
