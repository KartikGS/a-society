# Curator Proposal: Structural Readiness Assessment at Intake

**Status:** PROPOSED
**Date:** 2026-03-23
**Brief:** `02-owner-to-curator-brief.md`

---

## Open Questions — Responses

**Q1 — Document placement:** Does the structural readiness content fit as a new section within `$INSTRUCTION_WORKFLOW_COMPLEXITY`, or does the content volume warrant a companion document?

**Assessment: New section within `$INSTRUCTION_WORKFLOW_COMPLEXITY`. No companion document.**

The Structural Readiness Assessment is not a standalone operation — it is an intake gate that feeds directly into complexity analysis. It produces no artifact of its own; its only output is a routing decision (proceed / stop / apply protocol) that leads the Owner into sections that already exist in the document. The content volume — three checks, one handling table, and a six-step protocol — adds approximately 40 lines to a 179-line document. The resulting document is within a manageable read size.

The companion-document tests from `$A_SOCIETY_STRUCTURE` do not apply:
- *Namespace parity exception:* Not applicable. The structural readiness assessment is not a distinct artifact type that projects maintain in their own folder — it is an intake behavior. It does not create a project-level artifact that requires a parallel instruction path.
- *Three-file threshold:* This is one document proposed in isolation. No new sub-folder is warranted.

Placement within `$INSTRUCTION_WORKFLOW_COMPLEXITY`: as a new section titled **Structural Readiness Assessment**, inserted between "The Dynamic Complexity Model" and "Complexity Axes." This position expresses the gating relationship clearly: the model principles apply, the readiness gate runs, and — only if the task passes — the Owner evaluates the complexity axes.

---

**Q2 — Existing content compatibility:** Does any existing content in `$INSTRUCTION_WORKFLOW_COMPLEXITY` need updating?

**Assessment: No existing sections require revision.**

- **"Known unknowns" (in Producing a Workflow Plan):** Describes downstream decisions deferred to later roles. Structural gaps are pre-intake blockers — detected before a flow opens — not open decisions within a flow. No conflict, no update needed.
- **"Incremental Pipeline Definition":** Governs how the Owner defines the path once a flow is open. Structural readiness is a pre-flow check. No conflict.
- **"The Dynamic Complexity Model":** Its opening sentence ("At intake, the Owner conducts a complexity analysis and constructs a workflow plan") describes the model in general terms. The new section, positioned before Complexity Axes, will make the gate relationship explicit without requiring a change to the model description.
- **Hard Rules table:** All hard rules still apply unchanged; the new section adds a prerequisite step but does not modify any rule.

No existing sections need updating. The new section slots in cleanly between the model description and the axes evaluation.

---

## Proposed Content

---

### Item 1 — `$INSTRUCTION_WORKFLOW_COMPLEXITY` [additive]

**Action:** Insert the following new section between the existing "The Dynamic Complexity Model" section and the existing "Complexity Axes" section.

---

**New section to insert:**

```
---

## Structural Readiness Assessment

Before conducting complexity analysis, the Owner runs a structural readiness assessment. This assessment determines whether the task can be handled by the existing structure at all. It is a gate: a task that fails it does not proceed to complexity analysis or tier selection.

There are three sequential checks.

**Check 1 — Feasibility**

Is the task possible at all? If no: tell the user directly, explain why (invariant violation, scope conflict, structural impossibility), and probe for the underlying need — sometimes an impossible framing hides an achievable one. Do not route.

**Check 2 — Structural Routability**

Can the task be handled by the existing structure? Two dimensions, both must be true:

- *Role authority:* Does any defined role have the authority and responsibility for this task? Verify against role documents — the scope boundary definition lives in the role file itself, not in a separate metadata artifact.
- *Workflow routability:* Does an existing workflow cover this task?

If either dimension fails, a structural gap exists.

**Check 3 — Frequency Assessment** *(only when a gap is found in Check 2)*

How often will this task or similar tasks recur? This determines whether the appropriate response is to build a full new workflow or role, or to handle the task as a scoped one-off exception with explicit Owner direction. This is a sizing question, not a feasibility question — ask it only after a gap is confirmed.

**Handling by Outcome**

| Outcome | Action |
|---|---|
| Impossible | Tell user directly, explain why, probe for underlying need. Do not route. |
| Structurally ready | Proceed with complexity analysis as normal. |
| Structural gap found | Apply Structural Gap Protocol (see below). |
| User overrides structural gap | Document the gap and risk explicitly in the workflow plan as a known constraint. Proceed only with explicit user direction. |

**Structural Gap Protocol**

When a structural gap is found and the user wants to proceed with addressing it:

1. Tell the user what specifically is missing — a role with appropriate authority, a workflow, or both.
2. Describe what setup would involve (new role, new workflow, or modification to existing).
3. Get explicit user permission before opening a setup flow.
4. Add the deferred task to Next Priorities in the project log with a dependency note: "depends on: [setup flow identifier]."
5. Open a separate setup flow through standard intake — including this structural readiness assessment, which will now pass since the structure is being built.
6. When the setup flow completes, the deferred task re-enters intake as a new flow.
```

---

### Item 2 — `$GENERAL_OWNER_ROLE` [additive]

**Action:** In the **Authority & Responsibilities** section, replace the Workflow Routing bullet with the version below. The change inserts two sentences at the start of the bullet body (after the em-dash), before the existing reference to producing a workflow plan artifact. The existing content is preserved; the junction is lightly rephrased to maintain grammatical coherence after the insertion.

**Current text:**
```
- **Workflow routing** — routing work into the appropriate workflow by default, including producing a workflow plan artifact at intake before any brief is written (see `$INSTRUCTION_WORKFLOW_COMPLEXITY`), and directing the user to the next session
```

**Proposed text:**
```
- **Workflow routing** — routing work into the appropriate workflow by default. Before producing the workflow plan, conduct a structural readiness assessment per `$INSTRUCTION_WORKFLOW_COMPLEXITY`: verify the task is feasible, that a role with appropriate authority exists for it, and that a workflow can route it. If a structural gap is found, apply the Structural Gap Protocol before complexity analysis. This includes producing a workflow plan artifact at intake before any brief is written (see `$INSTRUCTION_WORKFLOW_COMPLEXITY`), and directing the user to the next session.
```

*Note on junction phrasing:* The original "including producing..." was a participial clause appended to the routing statement. After the insertion of two standalone sentences, "Including producing..." in isolation reads as a fragment. The proposed text changes "including" to "This includes" to restore grammatical coherence. This is a minimal, meaning-preserving adjustment — no substantive content is altered.

---

### Item 3 — `$A_SOCIETY_OWNER_ROLE` [Curator authority — implement directly]

**Action:** In the **Authority & Responsibilities** section, replace the Workflow Routing bullet with the version below. Identical insertion to Item 2; the only difference is that this bullet references `$A_SOCIETY_COMM_TEMPLATE_PLAN` and uses "the human" rather than "the user," both preserved from the original.

**Current text:**
```
- **Workflow routing** — routing work into the appropriate workflow by default, including producing a workflow plan artifact using `$A_SOCIETY_COMM_TEMPLATE_PLAN` at intake before any brief is written (see `$INSTRUCTION_WORKFLOW_COMPLEXITY`), and directing the human to the next session
```

**Proposed text:**
```
- **Workflow routing** — routing work into the appropriate workflow by default. Before producing the workflow plan, conduct a structural readiness assessment per `$INSTRUCTION_WORKFLOW_COMPLEXITY`: verify the task is feasible, that a role with appropriate authority exists for it, and that a workflow can route it. If a structural gap is found, apply the Structural Gap Protocol before complexity analysis. This includes producing a workflow plan artifact using `$A_SOCIETY_COMM_TEMPLATE_PLAN` at intake before any brief is written (see `$INSTRUCTION_WORKFLOW_COMPLEXITY`), and directing the human to the next session.
```

---

## Behavioral Property Consistency Check

The three checks are sequential and non-overlapping:
- Check 1 (Feasibility) gates Check 2; a failed Check 1 terminates without proceeding.
- Check 2 (Structural Routability) gates Check 3; Check 3 is only reached on a confirmed gap.
- The Handling by Outcome table is exhaustive: every possible outcome has exactly one action.
- The Structural Gap Protocol is invoked only when a gap is found *and* the user wants to proceed — consistent with the table row for that outcome.
- The "User overrides structural gap" row is a distinct path from the protocol, not a sub-step of it. No overlap.

No contradictory behavioral properties found.

---

## Index Update Required

No new files are being created. No index entries are needed for this change.

---

## Implementation Scope

| Item | File | Action | Authority |
|---|---|---|---|
| 1 | `a-society/general/instructions/workflow/complexity.md` | Insert section | Requires Owner approval |
| 2 | `a-society/general/roles/owner.md` | Replace bullet | Requires Owner approval |
| 3 | `a-society/a-docs/roles/owner.md` | Replace bullet | Curator authority — implement directly |
