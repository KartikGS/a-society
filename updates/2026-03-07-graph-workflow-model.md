# A-Society Framework Update — 2026-03-07

## Summary

This update introduces a graph-based workflow model across six instruction files in `general/instructions/`. The model provides first-class support for concurrent workflow instances, branching, multiple distinct workflows, and cross-workflow handoffs. The linear single-instance workflow is preserved as the default case — existing projects using single-thread workflows are unaffected. Projects that want to support concurrent or branching workflows now have a principled framework to do so.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 6 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### RECOMMENDED 1 — Workflow instruction: graph model vocabulary and extended patterns

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_WORKFLOW`
**What changed:** New section "The Workflow as a Graph" introduced. Defines node (input/work/output contract), edge (transition condition), graph (named workflow definition), instance (one traversal), and unit-of-work ID format (`[short-slug]-[sequential-number]`). "Phases" reframed as "Phases (Nodes)"; "Handoff Protocols" reframed as "Handoff Protocols (Edges)." New step added to "How to Write One" (name the graph and determine instance behavior). New Format Rule for instance-scoped references (applies only to multi-instance workflows). New section "Extended Workflow Patterns" covering concurrent instances, branching, multiple distinct workflows, and cross-workflow handoffs.
**Why:** The single-thread assumption was embedded but unstated across all workflow guidance. Any project running multiple workflow instances simultaneously had no framework support — it had to derive its own extensions independently.
**Migration guidance:** Review your project's `$[PROJECT]_WORKFLOW`. If your workflow is linear and runs one instance at a time, no changes are required — the new section is additive and backward-compatible. If your project runs multiple instances of the same workflow concurrently, add a unit-of-work ID slug vocabulary to your workflow document, scope all handoff artifact names and status tokens to the instance, and adopt unit-prefixed conversation artifact naming per RECOMMENDED 2 below. If your workflow has branching or multiple distinct phase sequences, see the "Extended Workflow Patterns" section of the updated instruction for structural guidance.

---

### RECOMMENDED 2 — Conversation instruction: unit-of-work ID format prescribed

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_COMMUNICATION_CONVERSATION`
**What changed:** Naming Conventions section updated. The prior guidance named a concurrent live artifact format with a vague `[unit-slug]` placeholder. The format is now prescribed: `[unit-of-work-id]-[sender-role]-to-[receiver-role].md`, where the unit-of-work ID follows `[short-slug]-[sequential-number]` (e.g., `acme-001-ba-to-tech-lead.md`). The workflow document is identified as the authoritative source for the project's slug vocabulary.
**Why:** The prior format gave no guidance on how to construct a unit identifier — each Initializer had to derive one independently. The prescribed format is human-readable, unique across time, and consistent across projects.
**Migration guidance:** Review your project's `$[PROJECT]_COMM_CONVERSATION`. If your project uses concurrent live conversation artifacts, verify that their naming follows `[unit-of-work-id]-[sender-role]-to-[receiver-role].md` with IDs in `[short-slug]-[sequential-number]` format. If you have existing concurrent artifacts using a different naming scheme, assess whether migration is warranted based on your project's stage. Ensure your workflow document defines the slug vocabulary used in artifact names.

---

### RECOMMENDED 3 — Coordination instruction: instance-scoped status vocabulary and pre-replacement checks

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_COMMUNICATION_COORDINATION`
**What changed:** Three additions: (1) Status vocabulary bullet now notes that in multi-instance workflows, status tokens apply per instance — `acme-001` status is independent of `acme-002`. (2) Pre-replacement checks bullet now specifies that the check must confirm the specific instance being replaced has reached terminal status, not merely that any prior instance was closed. (3) Step 1 in "How to Create Coordination Protocols" now requires deciding per-instance vs. global status tracking for concurrent projects.
**Why:** Without explicit per-instance scoping, a status model designed for single-thread workflows could incorrectly aggregate or overwrite state across concurrent instances.
**Migration guidance:** Review your project's `$[PROJECT]_COMM_HANDOFF_PROTOCOL`. If your project runs only one workflow instance at a time, no changes are required. If your project uses concurrent instances, verify that your status vocabulary and pre-replacement check procedures are scoped per instance (keyed by unit-of-work ID), not globally per handoff type.

---

### RECOMMENDED 4 — Role instruction: activation/closure conditions connected to graph edges

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_ROLES`
**What changed:** The activation and closure condition bullets in the Primary Focus section now note their graph edge correspondence: activation = incoming edge fires at the role's entry node; closure = outgoing edge ready to fire from the exit node. One sentence added: when these map to edge conditions, the unit-of-work ID in the handoff artifact's subject field tells the agent which instance it is responsible for.
**Why:** Phase-scoped roles in multi-instance workflows need a clear activation signal per instance. Mapping activation/closure to graph edges makes this deterministic from the handoff artifact alone.
**Migration guidance:** Review role documents in your project's `$[PROJECT]_A_DOCS_DIR/roles/` for any phase-scoped or part-time roles. If those roles have activation and closure conditions defined, no structural change is required — but consider adding a note connecting each condition to the incoming/outgoing edge in your workflow graph if your project uses the graph model. If activation and closure conditions are missing from any scoped role, add them per the updated instruction.

---

### RECOMMENDED 5 — Communication entry-point: instance-scoped artifact note

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_COMMUNICATION`
**What changed:** One sentence added to the `conversation/` sub-folder description: in projects with concurrent workflow instances, live artifacts are scoped to their instance via the unit-of-work ID, with a cross-reference to `$INSTRUCTION_COMMUNICATION_CONVERSATION`.
**Why:** The communication entry-point document describes what the conversation sub-folder contains. Without this note, a Curator reading only the entry point would not know that concurrent-instance projects need instance-scoped artifact naming.
**Migration guidance:** No direct migration required. This is an entry-point orientation change. If your project's `$[PROJECT]_COMM` was produced before this update, it may not mention instance-scoped artifacts. Consider adding a parallel note if your project runs concurrent workflow instances.

---

### RECOMMENDED 6 — Improvement instruction: graph-aware backward pass guidance

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_IMPROVEMENT`
**What changed:** One paragraph added after "These are per-agent findings." in the backward pass section: in a graph-based workflow, the backward pass traverses the path actually taken by the instance under review — from terminal node back to entry node. In a branching graph, only the edges that fired during this instance are reviewed, not every possible path.
**Why:** Without this guidance, agents running a backward pass on a branching or multi-instance graph would have no principled basis for determining which work to review. Reviewing every possible path is both expensive and incorrect.
**Migration guidance:** Review your project's `$[PROJECT]_IMPROVEMENT_PROTOCOL`. If your project uses a linear single-instance workflow, the backward pass is unchanged — it traverses all phases in reverse. If your project uses branching or concurrent instances, update your improvement protocol to specify that the backward pass traverses only the path actually taken by the instance under review.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `$A_SOCIETY_UPDATES_DIR` periodically as part of their maintenance cycle.
