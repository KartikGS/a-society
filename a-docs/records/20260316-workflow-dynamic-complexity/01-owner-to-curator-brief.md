---

**Subject:** Dynamic workflow construction — complexity-proportional task routing
**Status:** BRIEFED
**Date:** 2026-03-16

---

## Agreed Change

The current A-Society workflow applies the same structure to every task regardless of size, scope, or complexity. This is a fundamental flaw: for simple tasks, the overhead of a full multi-role pipeline — brief, proposal, approval, implementation, backward pass — exceeds the work itself, which erodes trust in the framework and creates pressure to bypass it.

The solution agreed in this session is a **dynamic complexity model**: the Owner, at intake, conducts a task complexity analysis and constructs a workflow proportional to the task. A trivial task routes to a single agent with a minimal record. A complex, multi-domain task routes to the full pipeline. The workflow is not a fixed template applied uniformly — it is constructed per task, governed by the same principles and hard rules, scaled to the task's actual demands.

Three additional insights from the session must be captured:

1. **The workflow plan as the decision artifact.** For proportionally-sized flows, the Owner's complexity analysis and routing decision *is* the approval gate — not a separate phase. The plan replaces the heavyweight brief where the brief would be disproportionate.

2. **Incremental pipeline definition.** A full pipeline does not need to be defined at intake. Other roles, once engaged, may be better positioned to make downstream decisions. The Owner defines the known path; agents extend it as clarity develops. This reduces speculative structure at the start of a flow.

3. **Backward graph tracking.** The backward pass structure should not be pre-defined. Instead, the executed workflow is tracked as it runs, and this log is passed to the backward graph builder at close. This produces a backward pass that reflects what was actually done, not what was hypothetically planned — and naturally scales: a simple forward graph produces a simple backward graph.

This is a new framework-level capability. It does not replace the existing workflow — it governs how the workflow is selected and sized for a given task.

---

## Scope

**In scope:**

- A new instruction document defining the dynamic complexity model. The document must cover:
  - The problem statement: complexity-blind workflow applies uniform overhead to all tasks
  - The five complexity axes the Owner uses at intake:
    1. **Domain spread** — does this touch one domain or multiple?
    2. **Shared artifact impact** — does it modify any public or shared artifact (e.g., the index, a public interface, a shared template)?
    3. **Dependency between steps** — do later steps depend on decisions made in earlier steps?
    4. **Reversibility** — can the change be easily undone?
    5. **Scope size** — how many files, systems, or roles are affected?
  - How the Owner uses these axes to produce a workflow plan at intake
  - What proportional workflow construction looks like: from single-agent to full pipeline
  - The workflow plan as a decision artifact — how it satisfies the approval gate requirement for lightweight flows
  - Incremental pipeline definition: agents extend the path as clarity develops; the Owner does not need to pre-specify every downstream step
  - Backward graph tracking: the mechanism for logging the executed workflow and feeding it to the backward graph builder at close
  - How the model interacts with existing hard rules (particularly Hard Rule 2)
  - Acknowledgement that the complexity analysis principles will be refined over time as flows reveal where the model fails

- Index registration: one new row in `$A_SOCIETY_INDEX`, one new row in `$A_SOCIETY_PUBLIC_INDEX`
- Cross-reference from `$INSTRUCTION_WORKFLOW_MODIFY`: a pointer to the new document in its "Relationship to Other Instructions" section
- Entry in `$A_SOCIETY_AGENT_DOCS_GUIDE`

**Out of scope:**

- Changes to the existing workflow phases, handoffs, or invariants in `$A_SOCIETY_WORKFLOW` — the dynamic model governs workflow construction, not the internal structure of any given workflow
- Changes to any existing hard rules — the Curator's proposal for Hard Rule 2 compatibility (see Open Questions) is a resolution, not a rule change
- Changes to `$INSTRUCTION_WORKFLOW_MODIFY` beyond the cross-reference addition
- The backward graph builder tooling implementation — the instruction defines the mechanism conceptually; tooling is a separate work item

---

## Likely Target

- **New file:** `/a-society/general/instructions/workflow/complexity.md` — subject to the Curator's placement assessment (see Open Questions)
- **Index registration:** `$A_SOCIETY_INDEX` (`a-society/a-docs/indexes/main.md`)
- **Public index registration:** `$A_SOCIETY_PUBLIC_INDEX` (`a-society/index.md`)
- **Cross-reference:** `$INSTRUCTION_WORKFLOW_MODIFY` (`a-society/general/instructions/workflow/modify.md`) — "Relationship to Other Instructions" section
- **a-docs-guide entry:** `$A_SOCIETY_AGENT_DOCS_GUIDE` (`a-society/a-docs/a-docs-guide.md`)

---

## Open Questions for the Curator

**Q1 — Placement.** The dynamic complexity model is about per-task workflow construction (runtime), while `$INSTRUCTION_WORKFLOW_MODIFY` is about modifying the static workflow structure (design-time). These are distinct operations. The Curator should assess whether the new instruction belongs as a standalone document in `general/instructions/workflow/` (the current assumption: `complexity.md`) or as a section within an existing instruction. The Curator's placement rationale must be explicit in the proposal.

**Q2 — Hard Rule 2 compatibility.** Hard Rule 2 states: "Every workflow must have at least one approval gate before implementation." For single-agent flows where no Curator or second role is involved, the Owner's complexity analysis and routing decision must be defined as satisfying this rule — or the rule must be explicitly qualified to reflect the complexity model's lightweight tier. The Curator must propose a resolution. Two options are on the table: (a) define the Owner's workflow plan as the approval gate for all tiers, making Rule 2 satisfied by construction; (b) add a qualifier to Rule 2 that scopes it to multi-role flows only. The Curator should evaluate both and propose the option that best preserves the rule's intent without creating unnecessary friction.

**Q3 — Tracking mechanism.** The backward graph tracking requires a log of the executed workflow. The Curator must propose what form this log takes and where it lives. Options include: a lightweight artifact the Owner produces at intake that is updated as the flow progresses, a terminal artifact produced at close that reconstructs the executed path, or a convention for deriving the graph from the record folder's artifact sequence. The mechanism must be concrete enough to be actionable without requiring new tooling.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for dynamic workflow construction — complexity-proportional task routing."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
