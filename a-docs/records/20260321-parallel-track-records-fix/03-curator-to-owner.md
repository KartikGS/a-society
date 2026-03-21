**Subject:** Parallel track records convention fix — A1, A2, Gen1, Gen2
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-21

---

## Trigger

Improvement-cycle findings from the prior `backward-pass-orderer-redesign` flow identified four documentation gaps in records and improvement handling. The Owner approved the direction for all four in that flow's approval artifact and routed them into this framework-development flow as a mechanical proposal-and-implementation item with no open direction questions.

---

## What and Why

This proposal packages four additive rule changes:

1. **A1 — Parallel track sub-labeling rule.** Add an intake-time rule requiring pre-assigned sub-labeled sequence positions for parallel convergence artifacts so concurrent tracks do not collide when they rejoin the record sequence.
2. **A2 — Checkpoint discipline rule.** Add an authorship rule requiring `workflow.md` to include every expected review and approval checkpoint so the documented forward pass matches the flow that actually ran.
3. **Gen1 — Pre-convention folder exemption.** Propagate the already-established A-Society exemption language into `$INSTRUCTION_RECORDS` so projects adopting records conventions can distinguish true violations from folders that predate the requirement or originate the requirement.
4. **Gen2 — Forward pass closure boundary.** Propagate the already-established A-Society guardrail into `$GENERAL_IMPROVEMENT` so projects do not start backward-pass reflection before the forward pass has been explicitly closed by the intake role.

These additions are generalizable because they govern record sequencing, machine-readable workflow fidelity, convention-introduction edge cases, and the boundary between execution and reflection. Those constraints apply equally to a software project, a writing project, and a research project whenever the project uses records, structured workflow paths, or a backward pass.

---

## Where Observed

A-Society — internal. The gaps surfaced during the `backward-pass-orderer-redesign` flow, specifically around parallel convergence artifact naming, omitted Owner review checkpoints in `workflow.md`, handling of folders that predate the `workflow.md` convention, and the need for a clean boundary between forward-pass completion and backward-pass initiation.

---

## Target Location

- `$A_SOCIETY_RECORDS` — additive: A1 in the Artifact Sequence section; A2 in `workflow.md — Forward Pass Path`
- `$INSTRUCTION_RECORDS` — additive: A1 in the Sequencing section; A2 and Gen1 in `workflow.md — Forward Pass Path`
- `$GENERAL_IMPROVEMENT` — additive: Gen2 in `### Guardrails`

---

## Draft Content

### A1 — Parallel track sub-labeling

**For `$A_SOCIETY_RECORDS`:**

> **Parallel track sub-labeling:** When the Owner declares parallel tracks at intake, meaning the forward-pass path includes two or more roles working concurrently before a convergence point, the Owner must pre-assign sub-labeled sequence positions for the convergence artifacts expected from those tracks. Use `NNa-`, `NNb-`, and so on (for example, `08a-curator-findings.md`, `08b-developer-findings.md`). The Owner assigns these sub-labels in `workflow.md` and in the record folder convention at intake, before any parallel work begins. This is an intake obligation, not a post-hoc correction after a collision is discovered.

**For `$INSTRUCTION_RECORDS`:**

> **Parallel track sub-labeling:** When the intake role declares parallel tracks at intake, meaning the forward-pass path includes two or more roles working concurrently before a convergence point, the intake role must pre-assign sub-labeled sequence positions for the convergence artifacts expected from those tracks. Use `NNa-`, `NNb-`, and so on (for example, `08a-curator-findings.md`, `08b-developer-findings.md`). The intake role assigns these sub-labels in `workflow.md` and in the project's records convention at intake, before any parallel work begins. This is an intake obligation, not a post-hoc correction after a collision is discovered.

### A2 — Checkpoint discipline

**For `$A_SOCIETY_RECORDS`:**

> **Completeness obligation:** When populating `workflow.md` at intake, the Owner must list every role step they expect, including intermediate Owner review and approval checkpoints between roles. If the Owner will review or approve work before the next non-Owner role acts, that checkpoint must appear as its own Owner entry in `workflow.md`. For example, `TA - Advisory` must be followed by `Owner - TA Review` when the Owner reviews the advisory before the Curator proceeds. No Owner checkpoint may be omitted because it was implied. Silent checkpoints produce `workflow.md` paths that do not match the flow that actually ran, which corrupts backward pass ordering.

**For `$INSTRUCTION_RECORDS`:**

> **Completeness obligation:** When populating `workflow.md` at intake, the intake role must list every role step they expect, including intermediate review and approval checkpoints between roles. If the intake role will review or approve work before the next non-intake role acts, that checkpoint must appear as its own intake-role entry in `workflow.md`. For example, if a project's workflow includes `TA - Advisory` and the Owner reviews that advisory before the Curator proceeds, `Owner - TA Review` must appear as a distinct step. No review checkpoint may be omitted because it was implied. Silent checkpoints produce `workflow.md` paths that do not match the flow that actually ran, which corrupts backward pass ordering.

### Gen1 — Pre-convention folder exemption

**For `$INSTRUCTION_RECORDS`:**

> **Pre-convention record folders:** Record folders created before the project established the `workflow.md` requirement are exempt from that requirement. The absence of `workflow.md` in a pre-convention folder is not a convention violation — it is expected. A Backward Pass Orderer tool, if the project uses one, cannot be invoked for these folders; use manual backward pass ordering instead. Future agents encountering a record folder without `workflow.md` should verify whether the folder predates this requirement before treating the absence as an error. Projects should record the convention introduction date or version in their `records/main.md` so this determination is unambiguous.

> **Bootstrapping exemption:** When a flow establishes a new record-folder requirement, such as the introduction of `workflow.md` itself, that flow's record folder is exempt-by-origin from the requirement it creates. The flow that introduces a requirement cannot retroactively conform to it. This exemption must be noted explicitly in the flow's artifacts; it must not be handled by silence. An agent encountering this case must either (a) acknowledge the exemption in the initiation artifact and proceed with manual ordering, or (b) create the required file manually for the current folder if conformance is achievable without contradiction.

### Gen2 — Forward pass closure boundary

**For `$GENERAL_IMPROVEMENT`:**

> - **Forward pass closure boundary:** Do not begin the backward pass before the forward pass is explicitly closed by the intake role as a distinct step. The intake role is the terminal node of every forward pass. Issuing a single instruction that collapses "complete registration" and "proceed to backward pass" into one step removes the boundary. The correct sequence is: (1) the final forward-pass role completes its work and returns to the intake role; (2) the intake role reviews the completed work, confirms that the forward pass is closed, and issues a separate backward-pass initiation. Findings produced before the forward pass is confirmed closed may be based on incomplete work.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
