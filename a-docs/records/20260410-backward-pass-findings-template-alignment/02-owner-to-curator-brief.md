# Owner → Curator: Briefing

**Subject:** Backward-pass findings template alignment for standing analysis families
**Status:** BRIEFED
**Date:** 2026-04-10

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|---|
| `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` | modify |

[Requires Owner approval]

The backward-pass findings template is out of alignment with the standing meta-analysis instructions. Two recurring analysis families required by `$GENERAL_IMPROVEMENT_META_ANALYSIS` have no explicit reporting surface in the template:

1. **Role File Gaps** — a reflection category in the meta-analysis instructions that has no corresponding subsection in the template's `## Findings` section
2. **a-docs Structure Checks** — eight specific checks in the meta-analysis instructions (redundancy check, phase-coupling check, workflow-conditioning check, etc.) that have no dedicated section in the template

Agents producing findings have been improvising — either adding these sections manually during backward pass or embedding results in other categories. This friction was observed in two consecutive flows (`20260407-adocs-design-principles` and `20260407-role-jit-extraction`) and is explicitly tracked in the Current State log entry.

**Required changes:**

1. Add `### Role File Gaps` as a subsection under `## Findings`, after `### Workflow Friction`, with placeholder text `[Finding or "none"]` consistent with other subsections

2. Add `## a-docs Structure Check Notes` as a new section after `## Findings` and before `## Top Findings (Ranked)`. This section is not a single finding; it is a structured checklist derived from the eight checks in `$GENERAL_IMPROVEMENT_META_ANALYSIS`. The template should include placeholder guidance (e.g., `- [Check result or "N/A — artifact does not live in a-docs/"]`) for each of the eight checks, or a consolidated placeholder that prompts the agent to apply the checks and note results

3. Add a brief standing rule at the end of the template (after the Top Findings section or in a footer note) stating: when `$GENERAL_IMPROVEMENT_META_ANALYSIS` adds a new recurring category or check family, update this template in the same flow or explicitly specify where those results should be reported

---

## Scope

**In scope:**
- Adding the two missing reporting surfaces to `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`
- Adding the standing alignment rule
- Ensuring the template's structure matches the analytical expectations set in `$GENERAL_IMPROVEMENT_META_ANALYSIS`

**Out of scope:**
- Changes to `$GENERAL_IMPROVEMENT_META_ANALYSIS` itself — that instruction is correct; the template is the lagging surface
- Changes to other improvement-phase artifacts
- Changes to A-Society's project-specific meta-analysis or synthesis instructions

---

## Likely Target

`$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` (`a-society/general/improvement/reports/template-findings.md`)

---

## Open Questions for the Curator

1. For the `## a-docs Structure Check Notes` section, should the template enumerate all eight checks explicitly (redundancy check, phase-coupling check, workflow-conditioning check, workflow-delivery check, role document scope check, agents.md scope check, addition-without-removal check, repeated-header matching guidance) with individual placeholders, or provide a consolidated placeholder that prompts the agent to apply the checks and summarize results? Consider readability and whether agents will benefit from seeing each check named vs. a single "apply all eight and note results" prompt.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Backward-pass findings template alignment."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
