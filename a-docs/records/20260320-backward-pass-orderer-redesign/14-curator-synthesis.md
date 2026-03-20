# Curator Synthesis — 20260320-backward-pass-orderer-redesign

**Date:** 2026-03-21
**Role:** Curator
**Artifact:** `14-curator-synthesis.md`
**Synthesizing from:** `10-curator-findings.md`, `11-developer-findings.md`, `12-ta-findings.md`, `13-owner-findings.md`

---

## Findings Consolidated

### Cluster A: Records convention gaps (parallel tracks)

**Sources:** Curator finding 1, Developer finding 2, TA finding 4 (corroboration), Owner finding 1 and 3

- The records convention has no rule for two parallel tracks filing artifacts at the same sequence position simultaneously (the `08` collision).
- `workflow.md` and the plan's `path` field are flat serial lists. They cannot represent parallel forks, convergence points, or intermediate Owner approval checkpoints between parallel tracks.
- No explicit handoff artifact is defined for post-convergence TA review steps.
- The plan path silently omits Owner approval checkpoints that the Owner knew existed (TA review, TA review sign-off before Curator brief, etc.).

**Routing: Owner proposal.** All three problems trace to the same structural limitation: the format cannot represent parallel execution. Resolving this requires a direction decision about how to extend or adapt the records and `workflow.md` conventions. Cannot implement without Owner approval.

---

### Cluster B: Pre-convention record folder handling

**Sources:** Curator finding 2, TA finding 2

- No guidance exists for agents encountering record folders that predate the `workflow.md` requirement. The absence of `workflow.md` looks like a convention violation but is not.
- When a flow establishes a new record-folder requirement, the current folder is exempt-by-origin and cannot conform retroactively. Neither the advisory nor the documentation proposal for this flow stated this explicitly.
- The bootstrapping exemption was handled by silence — the improvement protocol says invoke Component 4 when available; this flow did not, and the exemption was not acknowledged.

**Routing: Curator authority — implement directly.**
Files: `$A_SOCIETY_RECORDS`, `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

---

### Cluster C: Forward pass / backward pass boundary

**Sources:** Owner finding 2 and 4

- The Owner issued `09-owner-to-curator.md` instructing "Complete Phase 7 Registration and proceed to backward pass" in the same session. This collapsed two distinct phases (forward pass closure and backward pass initiation) into one instruction, removing the boundary.
- The improvement protocol does not explicitly prohibit this shortcut.

**Routing: Curator authority — implement directly.**
Files: `$A_SOCIETY_IMPROVEMENT`

---

### Cluster D: TA handoff section vs. Owner routing authority

**Sources:** TA finding 3, Owner finding 4

- The TA role file requires session routing output at pause points (which session to switch to, new vs. existing). The Owner's approval note in `04-owner-decision.md` stated routing is the Owner's responsibility. These directly conflict.
- An agent reading only the TA role file follows the conflicting instruction with no way to resolve it.

**Routing: Curator authority — implement directly.**
Files: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

---

### Cluster E: Advisory prompt content specification

**Sources:** TA finding 1

- The advisory introduced `prompt: string` as a field on `BackwardPassEntry` without specifying the template or its content structure. This produced an Owner correction at approval time.
- The correct behavior: any advisory introducing a type with textual output fields must either specify the content format or explicitly delegate it with a reference implementation.

**Routing: Curator authority — implement directly.**
Files: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

---

### Cluster F: Developer record-folder write authority conflict

**Sources:** Developer findings 2 and 3

- The Developer hard rule says "Write to `tooling/` only." The Handoff Output section requires the Developer to produce completion reports and backward pass findings in the active record folder. These cannot both be satisfied literally.
- This was resolved in this session only because the human explicitly authorized the artifact write.

**Routing: Curator authority — implement directly.**
Files: `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`

---

### Cluster G: Integration policy for live workflow-document drift

**Sources:** Developer finding 4

- After the redesign, Component 3 exercises the live `a-society/a-docs/workflow/main.md` during integration testing. That file currently has no YAML frontmatter (framework-state drift, not a tool defect). The Developer inferred the correct policy (treat informational, not as failure) from how other live-framework drift was handled. The redesign spec did not state this explicitly.

**Routing: Curator authority — implement directly, but deferred.** This requires reading the full `$A_SOCIETY_TOOLING_PROPOSAL` to identify the correct placement and ensure the note is consistent with existing integration policy language. The change is low-risk and within Curator maintenance authority. Deferring to next maintenance session rather than expanding this synthesis scope.

---

## Implementation: Curator-Direct Items

The following changes were made in this synthesis session:

### 1. `$A_SOCIETY_RECORDS` — Pre-convention and bootstrapping exemptions (Cluster B)
Added two rules to the `workflow.md — Forward Pass Path` section:
- Pre-convention folder exemption: folders predating the `workflow.md` requirement are not convention violations; Component 4 cannot be invoked; use manual ordering.
- Bootstrapping exemption: a flow establishing a new record-folder requirement cannot conform to it retroactively; the exemption must be noted explicitly, not handled by silence.

### 2. `$A_SOCIETY_IMPROVEMENT` — Forward pass closure boundary + Component 4 bootstrapping (Clusters B, C)
Added to the Backward Pass Protocol:
- Bootstrapping exemption guidance appended to the Component 4 mandate section.
- Forward pass closure boundary rule added to Guardrails.

### 3. `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — Handoff section, prompt spec standard, bootstrapping note (Clusters B, D, E)
- Handoff Output section updated: TA no longer prescribes session routing. The TA provides artifact paths and review context; routing is the Owner's responsibility.
- Added advisory spec standard: when introducing a type with textual output fields, specify content format or explicitly delegate with a reference implementation.
- Added bootstrapping note requirement: when an advisory establishes a new record-folder requirement, it must note the current folder's exempt-by-origin status.

### 4. `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` — Record-folder write exception (Cluster F)
Added an explicit exception to the "Write to `tooling/` only" hard rule covering record-folder artifacts (completion reports and backward pass findings).

---

## Owner-Proposal Items

The following require Owner direction before implementation. These must not be queued as a maintenance backlog — they are presented here for Owner routing in the next Owner session.

### Parallel track representation gap (Cluster A)

**Problem:** The records convention and `workflow.md` schema support only serial flow paths. When a flow has parallel tracks, the convention produces:
- Sequence position collisions (two roles independently choose the same `NN-` number with no coordination mechanism)
- Silent omission of intermediate Owner checkpoints in the plan path
- Undefined post-convergence handoff artifacts

**Root cause:** The flat serial list in `workflow.md` and in the plan's `path` field cannot represent parallel execution — forks, convergence, or the identity of intermediate Owner nodes.

**Generalizable:** Yes. Any project with parallel workflow tracks faces the same gap. The fix, if it extends the schema, belongs in `$INSTRUCTION_RECORDS` (general) as well as `$A_SOCIETY_RECORDS`.

**Options for Owner to consider:**
1. Extend `workflow.md` schema to represent parallel forks and convergence points
2. Add a lightweight coordination rule for the most common case (e.g., position sub-labeling like `08a`, `08b` for parallel tracks; Owner pre-assigns at intake)
3. Require the Owner to explicitly list every intermediate Owner checkpoint in `workflow.md` at intake, regardless of flow complexity

**Files affected on approval:** `$A_SOCIETY_RECORDS`, `$INSTRUCTION_RECORDS`, potentially `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, `$A_SOCIETY_WORKFLOW_TOOLING_DEV`, Component 4 schema if format changes.

---

## Generalizable Findings — Potential `general/` Contributions

The following findings are generalizable and may warrant `$INSTRUCTION_RECORDS` or `$GENERAL_IMPROVEMENT` updates once the Owner approves the direction:

1. **Pre-convention folder exemption** — any project that adds a new record-folder requirement faces the same issue. A note in `$INSTRUCTION_RECORDS` would propagate this to all adopting projects. (Currently only applied to `$A_SOCIETY_RECORDS`.)
2. **Forward pass closure boundary** — applies equally to any project using the improvement protocol. A note in `$GENERAL_IMPROVEMENT` would propagate this. (Currently only applied to `$A_SOCIETY_IMPROVEMENT`.)
3. **Parallel track position collision rule** — pending Owner direction (see Owner-proposal above).

---

## Handoff to Owner

Switch to the Owner's existing session.

```
Next action: Review synthesis findings requiring Owner direction
Read: a-society/a-docs/records/20260320-backward-pass-orderer-redesign/14-curator-synthesis.md
Expected response: Owner approves or routes the parallel-track representation gap proposal (Cluster A); decides whether to propagate pre-convention exemption and forward-pass closure boundary to general/ (Generalizable Findings 1 and 2)
```
