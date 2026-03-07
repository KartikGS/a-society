# Requirement: Graph-Based Workflow Model

**Status:** Deferred — direction decision made, implementation separate
**Logged:** 2026-03-07
**Source:** BrightLaunch Initializer test run

---

## What Was Observed

During the BrightLaunch initialization test, two related friction points surfaced:

1. **Concurrent naming gap** — The communication instruction assumes one live artifact per handoff type. BrightLaunch runs multiple simultaneous client engagements, so a single `[sender]-to-[receiver].md` file would be overwritten constantly. The Initializer had to derive a per-engagement naming convention (`[client-slug]-[handoff-type].md`) independently, without guidance.

2. **Multiple workflow instances** — BrightLaunch's five-phase engagement lifecycle is a single workflow that runs N times concurrently. The framework had no model for this. The Initializer addressed the symptom (naming) but the underlying structural gap was not resolved.

These are symptoms of a deeper assumption embedded throughout the framework.

---

## The Core Problem: Single-Thread Assumption

The current framework assumes a single workflow, running once, sequentially. This assumption is not stated anywhere — it is baked into every layer:

- **Workflow instruction** — describes one phase sequence; no concept of multiple instances running simultaneously
- **Communication instruction** — defines one live artifact per handoff type; no unit-of-work identifier
- **Conversation template format** — bilateral handoff between two roles; no way to scope a handoff to a specific work unit
- **Handoff protocol** — status vocabulary (`PENDING`, `IN_PROGRESS`, etc.) applies to a handoff, not to an instance of a workflow
- **Role activation conditions** — roles are always-on; no concept of a role being scoped to a specific engagement or run

The result: any project that runs multiple instances of the same workflow simultaneously, or that has more than one workflow, must derive its own extensions without framework support.

---

## The Graph Model

A graph data structure is the right conceptual frame for what the framework needs to support:

**Nodes** — states or phases (Intake, Strategy, Production, etc.)
**Edges** — handoffs and transitions between states

Under this model, the current single-thread workflow is a degenerate case: a linear graph with one instance running at a time. The framework needs to support:

### Case 1: Multiple instances of the same graph
A project runs the same workflow multiple times simultaneously (BrightLaunch: multiple client engagements). Each instance is a separate traversal of the same graph. Work artifacts, handoffs, and status must be scoped to an instance, not just to a handoff type.

### Case 2: Branching within a single graph
Parallel tracks within one workflow (e.g., Production splits into a content track and a channel track that converge at a review gate). The current framework has no model for parallel edges or convergence nodes.

### Case 3: Multiple distinct graphs in one project
A project with more than one workflow type (e.g., a project that has both a client delivery workflow and an internal publishing workflow). These are separate graphs — different phase sequences, different handoff types, possibly different roles involved. The framework currently assumes one workflow per project.

### Case 4: Branches between graphs
Work that starts in one workflow and forks into another (e.g., a client delivery triggers a compliance review workflow). Cross-graph edges. The most complex case and likely lowest priority.

---

## What "Extending the Model" Means

This is not a note to add to an existing instruction. Extending the model properly requires changes across multiple framework layers:

1. **Workflow instruction** — introduce the concept of a *workflow instance*. The current single-sequence description becomes the baseline case. Add guidance for: how to name and track instances, how entry/exit conditions apply per instance, how concurrent instances coexist.

2. **Communication instruction** — introduce a *unit-of-work identifier* as a first-class concept in artifact naming. The current `[sender]-to-[receiver].md` pattern becomes `[unit-id]-[sender]-to-[receiver].md` when the project runs multiple instances. Define when the unit-id is required vs. optional.

3. **Conversation template format** — handoff templates must carry the unit-of-work identifier in their header. A handoff without a unit-id is ambiguous in a multi-instance project.

4. **Handoff protocol** — the status vocabulary currently applies to handoffs. It needs to apply to *handoffs within an instance*. When two instances are in flight simultaneously, their statuses are independent.

5. **Role instruction** — introduce the concept of *instance-scoped role activation*. A role may be active across all instances (e.g., Account Manager) or activated per-instance (e.g., Analyst, who only engages for a specific engagement's post-launch phase). The part-time/phase-scoped role guidance (a separate protocol change) is the precursor to this.

---

## Scope of Impact on Adopting Projects

Changes at this level are **Breaking** per the update report classification:

- Any adopting project that has built communication templates using the current `[sender]-to-[receiver].md` convention will need to review whether multi-instance naming applies to them
- Projects with a single workflow running once at a time are unaffected in practice — the single-thread case remains the default
- Projects like BrightLaunch that have already derived their own workarounds will need to evaluate whether the framework's new model matches their workaround or requires migration

The framework update report for this change must include migration guidance for both the no-impact (single-thread) and impact (multi-instance) cases.

---

## Open Questions Before Implementation Begins

1. **Unit-of-work identifier format** — how should instances be named? Client slug? Sequential number? UUID? The framework should prescribe a convention or at minimum a set of allowed patterns.

2. **Scope of Case 2 (branching within a graph)** — parallel tracks within one workflow are significantly more complex than multiple instances of a linear workflow. Should Case 2 be in scope for the first extension, or deferred to a second pass after Case 1 is stable?

3. **Cross-graph handoffs (Case 4)** — almost certainly out of scope for the first pass. Confirm before implementation begins.

4. **Backwards compatibility** — can the single-thread case be preserved exactly as-is (with the unit-id as optional), or does the model change require updates to all existing workflow instructions regardless of whether a project uses multi-instance?

---

## Direction Decision

**Extend the model** — the single-thread assumption should not merely be acknowledged as a limitation. The framework should have a first-class model for workflow instances, parallel tracks, and multiple workflow graphs. The current single-thread pattern becomes the default case of the extended model, not the only case.

Implementation is a separate work item. Scope, sequencing, and open questions above must be resolved before the Curator begins drafting. This is an `[L]` or `[ADR]` scope change — it touches multiple instructions and will produce a Breaking framework update report.
