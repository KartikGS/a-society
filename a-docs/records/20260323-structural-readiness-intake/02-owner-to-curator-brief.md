# Owner → Curator: Briefing

**Subject:** Structural Readiness Assessment at Intake — 3 file changes
**Status:** BRIEFED
**Date:** 2026-03-23

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | additive |
| `$GENERAL_OWNER_ROLE` | additive |
| `$A_SOCIETY_OWNER_ROLE` | additive |

**What is changing and why:**

Current complexity analysis asks "how complex is this task?" — it does not ask "is the existing structure capable of handling this task at all?" This means the Owner has no framework-defined criteria for detecting when a task is impossible, when no role has authority for it, or when no workflow can route it. Other projects' Owners, with less context than A-Society's, are especially exposed: without explicit detection criteria, they may invent paths or improvise structure instead of surfacing the gap.

This change adds a **Structural Readiness Assessment** as a prerequisite step before complexity analysis, and a **Structural Gap Protocol** specifying what to do when a gap is found.

---

**Item 1 — `$INSTRUCTION_WORKFLOW_COMPLEXITY` [Requires Owner approval] [additive]**

Add a new section titled **Structural Readiness Assessment** positioned before the existing "Complexity Axes" section (i.e., it gates entry into complexity analysis). The section covers three sequential checks and a handling table.

**Check 1 — Feasibility**
Is the task possible at all? If no: tell the user directly, explain why (invariant violation, scope conflict, structural impossibility), probe for the underlying need — sometimes an impossible framing hides an achievable one. Do not route.

**Check 2 — Structural Routability**
Can the task be handled by the existing structure? Two dimensions, both must be true:
- *Role authority*: Does any defined role have the authority and responsibility for this task? Verify against role documents — the scope boundary definition lives in the role file itself, not in a separate metadata artifact.
- *Workflow routability*: Does an existing workflow cover this task?

If either dimension fails, a structural gap exists.

**Check 3 — Frequency Assessment** (only when a gap is found in Check 2)
How often will this task or similar tasks recur? This determines whether the appropriate response is to build a full new workflow/role or to handle it as a scoped one-off exception with explicit Owner direction. This is a sizing question, not a feasibility question — ask it only after a gap is confirmed.

**Handling by Outcome table:**

| Outcome | Action |
|---|---|
| Impossible | Tell user directly, explain why, probe for underlying need. Do not route. |
| Structurally ready | Proceed with complexity analysis as normal. |
| Structural gap found | Apply Structural Gap Protocol (see below). |
| User overrides structural gap | Document the gap and risk explicitly in the workflow plan as a known constraint. Proceed only with explicit user direction. |

**Structural Gap Protocol subsection:**

When a structural gap is found and the user wants to proceed with addressing it:

1. Tell the user what specifically is missing — a role with appropriate authority, a workflow, or both.
2. Describe what setup would involve (new role, new workflow, or modification to existing).
3. Get explicit user permission before opening a setup flow.
4. Add the deferred task to Next Priorities in the project log with a dependency note: "depends on: [setup flow identifier]."
5. Open a separate setup flow through standard intake — including this structural readiness assessment, which will now pass since the structure is being built.
6. When the setup flow completes, the deferred task re-enters intake as a new flow.

---

**Item 2 — `$GENERAL_OWNER_ROLE` [Requires Owner approval] [additive]**

In the **Authority & Responsibilities** section, extend the Workflow Routing bullet. Add the following obligation before the existing complexity analysis reference:

> Before producing the workflow plan, conduct a structural readiness assessment per `$INSTRUCTION_WORKFLOW_COMPLEXITY`: verify the task is feasible, that a role with appropriate authority exists for it, and that a workflow can route it. If a structural gap is found, apply the Structural Gap Protocol before complexity analysis.

Insertion position: at the start of the Workflow Routing bullet body, before the existing sentence about producing a workflow plan artifact at intake.

---

**Item 3 — `$A_SOCIETY_OWNER_ROLE` [Curator authority — implement directly] [additive]**

Echo the same addition to the Workflow Routing bullet in the Authority & Responsibilities section, identical wording to Item 2.

---

## Scope

**In scope:** The three file changes above. Detection criteria, handling guidelines, and the Structural Gap Protocol as described.

**Out of scope:**
- Changes to the general Curator role or any other role not named above
- Any tooling changes (no programmatic component is involved in this change)
- Changes to the workflow documents themselves (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, etc.)

---

## Likely Target

- `$INSTRUCTION_WORKFLOW_COMPLEXITY` — `a-society/general/instructions/workflow/complexity.md`
- `$GENERAL_OWNER_ROLE` — `a-society/general/roles/owner.md`
- `$A_SOCIETY_OWNER_ROLE` — `a-society/a-docs/roles/owner.md`

---

## Open Questions for the Curator

1. **Document placement:** Does the structural readiness content fit cleanly as a new section within `$INSTRUCTION_WORKFLOW_COMPLEXITY`, or does the content volume warrant a companion document? If a companion document is proposed, it must satisfy the namespace parity exception criteria from `$A_SOCIETY_STRUCTURE` or meet the three-file threshold for a new subfolder. Assess during drafting and include the reasoning in the proposal.

2. **Existing content compatibility:** Does any existing content in `$INSTRUCTION_WORKFLOW_COMPLEXITY` (e.g., the "known unknowns" guidance, the "incremental pipeline definition" section) need updating to reflect structural gaps as a first-class category? Surface in the proposal if so.

---

## Follow-Up Actions

After implementation and registration, consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether a framework update report is required and at what classification.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Structural Readiness Assessment at Intake."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
