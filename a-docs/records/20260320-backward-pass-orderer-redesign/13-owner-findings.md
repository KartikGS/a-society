# Backward Pass Findings: Owner — 20260320-backward-pass-orderer-redesign

**Date:** 2026-03-21
**Task Reference:** 20260320-backward-pass-orderer-redesign
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

None.

---

### Missing Information

**1. Plan path omits Owner approval checkpoints.**

The workflow plan listed:

```
TA - Advisory
Curator - Documentation Proposal
```

What actually happened:

```
TA - Advisory
Owner - Review of TA advisory (04-owner-decision.md)
Owner - Curator Brief (05-owner-to-curator-brief.md)
Curator - Documentation Proposal
```

The Owner review of the TA advisory was not in the path. Neither was the Owner-to-Curator briefing as a distinct step. The path listed "Owner - Intake & Briefing" as a single entry covering both the plan production and the brief — but in practice the TA advisory inserted an additional Owner review checkpoint that the path did not represent.

This is a planning failure, not just a format gap. The Owner wrote the path and omitted the approval checkpoint that the Owner knew would be required. The path should have read:

```
Owner - Intake & Briefing
TA - Advisory
Owner - TA Review
Curator - Documentation Proposal
Owner - Review
...
```

This happened again later in the flow. The path listed `TA - Implementation Review` then `Owner - Gate` without modeling that these were sequential, not parallel. The Owner gate fires after the TA assessment, which fires after both parallel tracks converge — and none of that structure appears in the flat serial path.

**Root cause:** The path field (and `workflow.md`) is a flat serial list. It has no representation for parallel forks, convergence points, or the fact that some Owner entries are approval-of-role-X rather than initiating steps. A flat list can only represent "Owner appears here" — not what the Owner is doing or what triggered them.

**Generalizable:** Yes. Any flow with more than two roles and approval checkpoints will produce a path that silently omits intermediate Owner steps unless the Owner is extremely deliberate about listing every checkpoint entry separately.

---

**2. Component 4 was not invoked for this flow's backward pass.**

This flow redesigned Component 4 to be more useful. We then ran the backward pass without invoking it.

The proximate cause is the bootstrapping problem: this record folder predates `workflow.md`, so Component 4 cannot read from it. But the Owner never acknowledged this explicitly at the point of backward pass initiation. The backward pass trigger prompt told me "position 4 of 5" — meaning the order was computed manually upstream — and I proceeded without noting the gap.

This is what the human described as "tools for show." The observation is correct. The backward pass orderer exists, the protocol says to invoke it when available, and this flow did not do so. The bootstrapping exemption is real but it was handled by silence rather than by explicit acknowledgment.

**What should have happened:** When the Curator noted in `10-curator-findings.md` that `workflow.md` is absent from this record folder, the Owner should have either (a) manually created `workflow.md` for this folder and invoked Component 4 to generate the trigger prompts, or (b) explicitly noted the exemption-by-origin in `09-owner-to-curator.md` before backward pass began, so every role received that context. Neither happened.

**Generalizable:** Yes. Any flow that establishes a new tooling requirement creates a bootstrapping case where the tool cannot be used for that flow. The protocol needs explicit guidance on this: what to do when the tool exists but the current record folder cannot use it.

---

### Unclear Instructions

**3. The path field does not represent parallel flows — and the graph is not used to fill that gap.**

The human observed that the graph representation was supposed to make parallel flows representable. It has not. The workflow graph files (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, `$A_SOCIETY_WORKFLOW_TOOLING_DEV`) have edges that could model the parallel Developer + Curator tracks converging at the Owner gate. But:

- `workflow.md` in the record folder (path-only, flat list) cannot represent this structure
- The graph files themselves are not consulted during the flow execution — only Component 3 (schema validation) and Component 4 (backward pass ordering) read them
- Component 4 now reads `workflow.md`, not the graph file — so even the backward pass orderer is decoupled from the graph's richer structure

The graph representation encodes more structure than is actually used. An agent reading the Tooling Development workflow graph can see the parallel fork between Developer Phases 1-2 and Curator Phase 3. But that structure does not drive any executable behavior — it is reference documentation only. The position collision at 08 is the direct consequence: two parallel tracks with no coordination mechanism.

**What the gap is:** The path field in `workflow.md` captures serial participation but not concurrency. There is no format for "these two roles run in parallel and converge at this point." Until there is, parallel track coordination (including sequence position assignment) is entirely manual.

---

### Scope Concerns

None.

---

### Workflow Friction

**4. Backward pass initiation was conflated with Phase 7 registration.**

`09-owner-to-curator.md` directed the Curator to "Complete Phase 7 Registration and proceed to backward pass" in the same session. This was wrong.

The Owner is the terminal node of the forward pass. The forward pass closes when the Owner explicitly clears it. The backward pass initiates separately, after the forward pass is confirmed closed. Bundling "registration → backward pass" into one instruction removed that boundary. The Curator cannot initiate backward pass until the Owner has closed the forward pass — and the Owner cannot close the forward pass until registration is confirmed complete. This is a sequencing error.

The correct instruction would have been: "Complete Phase 7 Registration and return to Owner for forward pass closure." Then the Owner reviews the completed registration, confirms the forward pass is closed, and separately initiates the backward pass by providing trigger prompts for each role.

**Why this matters beyond this flow:** If the backward pass begins before the forward pass is fully closed, the findings may be incomplete or based on a flow that is still in progress. The improvement protocol's integrity depends on the backward pass being a clean retrospective, not an overlapping operation.

**Generalizable:** Yes. The instruction "complete registration and proceed to backward pass" is a shortcut that collapses two distinct phases. Role documents and workflow instructions should prohibit this collapse explicitly.

---

## Top Findings (Ranked)

1. **Plan path omits Owner approval checkpoints — flat serial list cannot represent parallel forks or intermediate Owner gates.** The path field silently omitted TA review steps that the Owner knew existed. The graph's richer structure is not propagated to `workflow.md`. The position collision at 08 is a direct consequence. Relevant: `$A_SOCIETY_RECORDS`, `$INSTRUCTION_RECORDS`, `$A_SOCIETY_WORKFLOW`, `$GENERAL_IMPROVEMENT`.

2. **Backward pass initiation conflated with Phase 7 registration — Owner removed the forward pass closure boundary.** The Owner is the terminal node; backward pass should not be initiated until the Owner explicitly closes the forward pass as a distinct step. Relevant: `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, Owner role.

3. **Component 4 not invoked for this flow — bootstrapping exemption handled by silence.** The protocol says to invoke Component 4 when available; this flow did not. The exemption was real but undocumented at the point of backward pass initiation. Relevant: `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_RECORDS`.

4. **TA handoff section conflicts with Owner routing authority — corroborating the TA's own finding.** The TA role file requires session routing output at pause points; the Owner's approval note corrected this. The conflict needs resolution in the TA role document. Relevant: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`.

---

Hand off to Curator for synthesis (position 5 of 5 — new session).
