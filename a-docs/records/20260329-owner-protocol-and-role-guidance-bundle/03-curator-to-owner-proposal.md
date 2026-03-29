# Curator → Owner: Proposal

**Subject:** Owner protocol and role guidance bundle — 11 items (Groups A, B, C)
**Status:** PROPOSED
**Date:** 2026-03-29
**Record:** `a-society/a-docs/records/20260329-owner-protocol-and-role-guidance-bundle/`

---

## 1. Summary of Items

This proposal addresses all 11 items from the brief, organized into three groups. The parity check confirms that all Group C items are genuinely absent or require the precision upgrades described in the brief.

| Group | Cluster | Focus |
|---|---|---|
| **A** | Log Validity | Intake and Closure validity sweep protocols; lifecycle documentation. |
| **B** | Merge Criteria | Multi-domain parallel-track support for merge assessment. |
| **C** | Role Guidance | Precision upgrades for `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` parity. |

---

## 2. Proposed Changes

### Group A — Log Validity Sweep Protocol

**A1. Intake validity sweep** — `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE`
Add a new **Intake Validity Sweep** section after the "Post-Confirmation Protocol" section. This protocol ensures that Next Priorities are resolved before work begins.

> ### Intake Validity Sweep
> 
> After forming a scope assessment (files, design areas, or concepts the work will likely touch), the Owner sweeps the **Next Priorities** list for entries whose target files or design areas overlap with that assessment.
> 
> For each overlapping entry, the Owner evaluates whether it has been invalidated by prior work under one of four cases:
> 
> 1. **Addressed** — a prior flow already implemented what the entry describes.
> 2. **Contradicted** — a prior flow changed the design in a direction that makes the entry incorrect.
> 3. **Restructured** — a prior flow renamed, moved, or removed the file or concept the entry references.
> 4. **Partially addressed** — a prior flow addressed part of the entry; the remainder is valid but the entry overclaims.
> 
> Flagged entries are surfaced to the user with the rationale and invalidation case. The user confirms or overrides. The Owner updates the log (removing or narrowing entries) before proceeding to the workflow plan.

**A2. Closure validity sweep** — `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE`
Add to the **Forward Pass Closure** guidance in `$GENERAL_OWNER_ROLE` (new section) and `$A_SOCIETY_OWNER_ROLE` (§10).

> At forward pass closure, after the flow's changes are confirmed, the Owner sweeps Next Priorities entries whose target files or design areas overlap with the scope of the completed flow. The same four-case taxonomy applies (addressed, contradicted, restructured, partially addressed). Relevant entries are updated, narrowed, or removed before the closure artifact is filed.

**A3. Entry lifecycle documentation** — `$INSTRUCTION_LOG`
Add to the **Entry Lifecycle** section (§2) as a new subsection. Placing it here ensures the protocol is defined alongside the lifecycle rules it modifies, while the role files own the behavioral execution.

> **Validity Sweeps**
> 
> The Owner performs a validity sweep of Next Priorities at two points in every flow:
> 
> 1. **Intake Sweep:** Triggered by the Owner's scope assessment of a new request. Overlapping entries are checked for invalidation (Addressed, Contradicted, Restructured, or Partially Addressed) before the workflow plan is produced.
> 2. **Closure Sweep:** Triggered by the completed flow's scope at forward pass closure. Overlapping entries are checked for invalidation and resolved before the flow is marked closed.

---

### Group B — Merge Criteria Update

**B1. Criterion 3 revision** — `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE`, and `$INSTRUCTION_LOG`
Replace criterion 3 in the merge assessment table for all three files.

> 3. **Same workflow type and role path, or routable as parallel tracks in a single multi-domain flow.** Items that would route through different workflow types (e.g., one Framework Dev, one Tooling Dev) may still merge if they share a design area and are cohesive enough to run as independent parallel tracks in a single flow without sequencing conflict.

---

### Group C — Role Guidance Precision (8 items)

These items bring the general role templates into parity with the A-Society specific roles.

**C1.** `$GENERAL_CURATOR_ROLE` — **Proposal-stage rendered-content matching.** 
Add to the **Implementation Practices** section.

> **Proposal stage — rendered-content matching.** When proposing content that includes code fences, tables, list structures, or other formatted blocks to be inserted into an existing document, re-read adjacent exemplars in the target file and match their rendering pattern exactly. Do not rely on the brief's presentation format when the target document renders the same kind of content differently.

**C2.** `$GENERAL_OWNER_ROLE` — **Prose-insertion boundary anchors.** 
Update the "Prose insertions" paragraph in the **Brief-Writing Quality** section.

> **Prose insertions:** When a brief directs the downstream role to insert text into existing prose, provide the exact **immediately adjacent** target clause or phrase at the insertion boundary. Acceptable forms: "after the clause ending '...X'," "before the sentence beginning 'Y'," or "replace the phrase 'Z' with." If the insertion is bounded from both sides, name the immediately adjacent clause on each side — not a nearby landmark elsewhere in the section. A brief that names only the section leaves the receiving role to infer the exact insertion point, which creates ambiguity and can require a correction round.

**C3.** `$GENERAL_OWNER_ROLE` — **Registration/index constraints.** 
Add a new **Constraint-Writing Quality** section before the "TA Advisory Review" section.

> ## Constraint-Writing Quality
> 
> When a decision artifact or review constraint directs downstream implementation checks, write the constraint with the same precision required of briefs. Constraint language should be mechanically followable by the receiving role without needing pattern inference.
> 
> **Registration scope must be file-based.** When directing index registration or verification, scope the instruction by the newly created or modified files, not by their parent directory, unless the directory boundary is itself the point of the constraint.

**C4.** `$GENERAL_OWNER_ROLE` — **Instruction-text variable references.** 
Add to the **Brief-Writing Quality** section, after "Prose insertions".

> **Instruction-text variable references:** When a brief proposes text that itself contains `$VAR` references, use only variable names that actually exist in the relevant index. If no project-agnostic variable name exists for the concept being described, use a functional description instead rather than inventing a fictional placeholder.

**C5.** `$GENERAL_OWNER_ROLE` — **Log before closure.** 
Add to the **Forward Pass Closure Discipline** section (to be created for parity with A-Society).

> ### Forward Pass Closure Discipline
> 
> When a closing flow surfaces new Next Priorities items, add or merge those log entries in the project log before filing the forward pass closure artifact. The closure artifact should reflect the already-updated project state; filing it is not the step that leaves log maintenance for later.

**C6.** `$GENERAL_OWNER_ROLE` — **Explicit mirror assessment.** 
Add to the **Brief-Writing Quality** section.

> **Project-specific convention changes require mirror assessment.** When a brief modifies a project-specific convention that instantiates a reusable general instruction, explicitly assess the general counterpart in the brief. Either scope the general instruction as a co-change or declare it out of scope with rationale. Do not leave the mirror decision implicit.

**C7.** `$GENERAL_OWNER_ROLE` — **Schema-migration briefs sweep.** 
Add to the **Brief-Writing Quality** section.

> **Schema migrations require a vocabulary sweep.** When a brief changes a schema, field name, or structural vocabulary, explicitly scope a surrounding prose sweep for deprecated terms as part of the same work. Updating the schema block alone is incomplete if adjacent explanations still use the old terminology.

**C8.** `$GENERAL_CURATOR_ROLE` — **Implementation-stage terminology sweep.** 
Add to the **Implementation Practices** section.

> **Implementation stage — terminology sweep for schema changes.** When implementing a change that renames structural terms, sweep surrounding prose for deprecated terminology as part of the same implementation pass, not deferred to a follow-up.

---

## 3. Framework Update Report (Draft)

**Update Name:** Owner protocol and role guidance bundle
**Date:** 2026-03-29
**Impact Classification:** TBD (Assessed as Recommended/Optional bundle)

**Summary:** 
Introduces the Log Validity Sweep protocol for Owners, ensuring Next Priorities entries remain accurate across flows. It also upgrades the precision of general Owner and Curator role templates to match established A-Society standards for brief-writing, constraint definition, and schema implementation.

**Changes:**
1. **Log Validity sweeps (Owner/Log Instruction):** Formalizes intake and closure sweeps to catch addressed or contradicted priorities.
2. **Merge Criteria update:** Accounts for multi-domain parallel tracks.
3. **Brief-Writing Quality upgrades (Owner Role):** Requires adjacent prose anchors, real variable names, and explicit mirror assessments.
4. **Implementation Discipline (Curator Role):** Formalizes rendered-content matching and implementation-stage terminology sweeps for schema changes.

**Curator Migration Guidance:**
Adopting project Curators should update their project-specific Owner and Curator role files to incorporate these precision guides, and append the validity sweep protocol to their project log instruction if customized.

---

## 4. Rationale for `$INSTRUCTION_LOG` Placement

While Owner role files own the execution of log sweeps, placing the protocol in `$INSTRUCTION_LOG` reflects that the sweep is a foundational rule of the log's **Entry Lifecycle**. This ensures the requirement is visible to anyone defining a log for a new project, and establishes the "four case" taxonomy in a project-agnostic document before it is specialized in role behavior.

---

Next action: Await Owner review of this proposal.
Read: `a-society/a-docs/records/20260329-owner-protocol-and-role-guidance-bundle/03-curator-to-owner-proposal.md`
Expected response: `owner-to-curator-decision` approving implementation.
