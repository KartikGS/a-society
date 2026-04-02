# Curator → Owner: Proposal / Submission

**Subject:** Parallel Track Orchestration — Documentation, Registration, and `[LIB]` Update
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-04-02

---

## Trigger

`07-owner-to-curator-brief.md` in the active record folder. The brief opens a Curator proposal phase covering one `general/` instruction update (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`), one A-Society registration update (`$A_SOCIETY_TOOLING_COUPLING_MAP`), index verification, an update report draft, and the corresponding `$A_SOCIETY_VERSION` increment.

---

## What and Why

This proposal updates the machine-readable handoff instruction so fork points can be represented structurally, not inferred from prose conventions. The current instruction documents only a single YAML object:

```handoff
role: Owner
artifact_path: path/to/artifact.md
```

That remains sufficient for non-fork handoffs, but it is incomplete for workflows whose current node has multiple outgoing edges. Parallel-track orchestration now exists in A-Society's runtime and workflow model; the handoff instruction must declare how an agent emits one structured target per fork branch so orchestrators can validate and route each successor deterministically.

The proposed change is intentionally minimal:
- Keep the existing single-object form for non-fork cases
- Add an array form for fork points
- Add one usage rule tying form selection to workflow topology
- Add a worked example showing both forms

This is a `general/` change because the instruction is consumed by adopting projects, not only by A-Society itself. The change is domain-agnostic: any project type using machine-readable handoffs and workflow forks faces the same structural need.

The same proposal also carries the Curator-owned maintenance items already authorized in the brief: a Type C note in `$A_SOCIETY_TOOLING_COUPLING_MAP`, Path Validator verification on both indexes, the draft update report, and the minor version increment plan tied to publication.

---

## Where Observed

A-Society — internal. The need surfaced in the `20260402-parallel-track-orchestration` flow after the runtime and Component 4 were updated to support parallel-track workflow execution and concurrent backward-pass groups.

---

## Target Location

| Target | Action | Variable / path |
|---|---|---|
| Machine-readable handoff instruction | Replace | `$INSTRUCTION_MACHINE_READABLE_HANDOFF` |
| Tooling/general coupling map | Additive | `$A_SOCIETY_TOOLING_COUPLING_MAP` |
| Internal index | Verify only | `$A_SOCIETY_INDEX` |
| Public index | Verify only | `$A_SOCIETY_PUBLIC_INDEX` |
| Framework update report | Create on implementation | `$A_SOCIETY_UPDATES_DIR` — new file `2026-04-02-parallel-handoff-array-form.md` |
| Version record | Replace on implementation | `$A_SOCIETY_VERSION` |

**Assessment on `$A_SOCIETY_AGENT_DOCS_GUIDE`:** No update proposed. The guide describes why `$INSTRUCTION_MACHINE_READABLE_HANDOFF` exists and what it owns; that purpose is unchanged. The array form extends the instruction's schema, but it does not change the rationale entry enough to warrant Curator maintenance in the guide.

---

## Draft Content

### 1. `$INSTRUCTION_MACHINE_READABLE_HANDOFF`

**Change type:** replace selected sections

**Why this file changes:** The instruction currently defines only a single-target object. Fork points now need a declared array form so the format contract matches the workflow graph's ability to branch.

**Proposed edits**

**A. Replace the opening definition in `## What It Is`**

Current concept:
- The block declares "which role receives control next and which artifact the receiving role should read."

Replace with:

> A machine-readable handoff block is a structured YAML block emitted by an agent at every session pause point alongside its natural-language handoff prose. It declares, in a parseable format, which role or roles receive control next and which artifact each receiving role should read.

This keeps the original purpose but makes fork-point plurality explicit.

**B. Add a topology-based usage rule immediately after `## When to Emit`**

Insert:

> **Form selection rule:**  
> At fork points — when the workflow graph has multiple outgoing edges from the current node — emit one handoff entry per fork target using the array form defined below.  
> At non-fork points, emit a single handoff using the standard single-object form.

**C. Replace `## The Schema` with a dual-form schema**

Proposed replacement:

````markdown
## The Schema

The handoff block supports two forms:

### Single-target form (default)

Use this when the current workflow node has exactly one outgoing edge.

```yaml
role:            <string>       # Receiving role name (e.g., "Owner", "Curator")
artifact_path:   <string>       # Primary artifact for the receiving role to read;
                                # path relative to the repository root
```

### Array form (fork points)

Use this when the current workflow node has multiple outgoing edges.

```yaml
- role:          <string>       # First fork target
  artifact_path: <string>
- role:          <string>       # Second fork target
  artifact_path: <string>
```

Emit one array entry per fork target. The orchestrator validates that:
- the number of entries matches the number of outgoing edges from the current workflow node
- each entry's `role` matches one of the successor nodes' roles

### Field Definitions

**`role`** — The name of the receiving role as defined in the project's `agents.md`. Must be a non-empty string matching a declared role (e.g., `"Owner"`, `"Curator"`, `"Technical Architect"`).

**`artifact_path`** — The primary artifact the receiving role must read at session start. Relative to the repository root, consistent with path conventions used in role Handoff Output sections. Must be a non-empty string.
````

This preserves the existing field set and adds only the second structural form.

**D. Replace `## Worked Example` with one default example and one fork-point example**

Proposed replacement:

````markdown
## Worked Example

The following examples show complete pause-point handoffs — natural-language prose followed immediately by the machine-readable block.

**Single-target case (non-fork):**

---

Next action: Review the proposal
Read: `[project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md`
Expected response: `04-owner-to-curator.md` filed in the record folder with APPROVED, REVISE, or REJECTED status

```handoff
role: Owner
artifact_path: [project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md
```

---

**Fork-point case (parallel tracks):**

---

Next action: Open both implementation tracks from the approved convergence decision
Read: `[project-name]/a-docs/records/[record-folder]/04-owner-approval.md`
Expected response: parallel completion artifacts from both receiving roles

```handoff
- role: Tooling Developer
  artifact_path: [project-name]/a-docs/records/[record-folder]/04-owner-approval.md
- role: Runtime Developer
  artifact_path: [project-name]/a-docs/records/[record-folder]/04-owner-approval.md
```

---

**Phase-closure case (single target):**

---

Next action: Verify implementation and registration complete; proceed to forward pass closure
Read: `[project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md`
Expected response: Forward pass closure message with backward pass initiation

```handoff
role: Owner
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md
```
````

**E. Keep the existing `## How Projects Adopt This` section unchanged**

Reason: the project-level adoption steps are still correct. Projects still add the handoff-protocol reference, role-document reference, and index registration. No new adoption step is required beyond using the array form when the project's workflow topology demands it.

---

### 2. `$A_SOCIETY_TOOLING_COUPLING_MAP`

**Change type:** additive

**Why this file changes:** The brief explicitly authorizes a Type C maintenance note for Component 4's interface change. No new dependency row is needed because no tooling component parses handoff blocks today.

**Proposed insertion**

Update the existing Component 4 Invocation Status note from:

> Closed (2026-03-15); Type C updates: 2026-03-18, 2026-03-20, 2026-03-22

to:

> Closed (2026-03-15); Type C updates: 2026-03-18, 2026-03-20, 2026-03-22, 2026-04-02

Add the following Type C note immediately below the Invocation Status table:

> **Type C status note (2026-04-02):** Component 4 interface documentation is aligned with the parallel-track update. `computeBackwardPassOrder` now requires an `edges` parameter, and `orderWithPromptsFromFile` now returns `BackwardPassEntry[][]` (`BackwardPassPlan`) rather than `BackwardPassEntry[]`. `$A_SOCIETY_TOOLING_INVOCATION` has already been updated by the Tooling Developer in the implementation track.

No new format-dependency row is proposed. The machine-readable handoff array form does not add a tooling/general coupling entry because no current tooling component parses handoff blocks.

---

### 3. Index Verification

**Change type:** verify only

Path Validator was run against both indexes during proposal preparation.

**Internal index (`$A_SOCIETY_INDEX`)**
- No new registration gaps surfaced for this flow
- Existing missing path remains:
  - `$A_SOCIETY_FEEDBACK_MIGRATION` → `a-society/feedback/migration/`

**Public index (`$A_SOCIETY_PUBLIC_INDEX`)**
- No new registration gaps surfaced for this flow
- Existing missing paths remain:
  - `$A_SOCIETY_FEEDBACK_MIGRATION` → `/a-society/feedback/migration/`
  - `$GENERAL_IMPROVEMENT_PROTOCOL` → `/a-society/general/improvement/protocol.md`

**Flow-specific conclusion:** The new runtime file `runtime/src/visualization.ts` does not require index registration. It is an implementation-detail source file inside `runtime/src/`, consistent with existing public-index convention.

These validator findings are informational only in this flow. They pre-date the current brief and are not introduced by the proposed handoff-schema update.

---

### 4. Update Report Draft

**Impact classification decision:** Recommended

**Why Recommended instead of Breaking:** The existing single-object form remains valid, so projects that do not route fork points are not operating with a contradiction. The change improves the completeness of the handoff instruction for projects that do use parallel-track workflows or are preparing orchestration support for them. That fits the protocol's "improves clarity, completeness, or consistency" standard.

**Why not Optional:** This is not merely a context-specific enhancement bolted onto an otherwise unrelated instruction. It extends an existing core communication contract so it remains structurally sufficient as A-Society workflows gain parallel branches. Projects maintaining parity with the framework should review it even if they choose not to adopt fork routing immediately.

**Proposed report text**

```markdown
# A-Society Framework Update — 2026-04-02

**Framework Version:** v27.1
**Previous Version:** v27.0

## Summary

The machine-readable handoff instruction now supports an array form for fork points, allowing one structured handoff entry per parallel branch while preserving the existing single-target form for non-fork cases. Adopting projects that use machine-readable handoffs should review their coordination docs and role handoff guidance to ensure fork-point behavior is documented consistently.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 1 | Review your handoff instruction and related coordination guidance if your workflows can fork into parallel tracks |
| Optional | 0 | — |

---

## Changes

### Machine-readable handoff instruction — fork-point array form

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_MACHINE_READABLE_HANDOFF`
**What changed:** The instruction now documents two valid forms for the `handoff` block: the existing single-object form for non-fork handoffs, and a new array form for fork points. It also adds a usage rule tying form selection to workflow topology and includes a worked fork-point example.
**Why:** Parallel-track workflows need one structured handoff target per outgoing branch. Without a declared array form, orchestrators must infer multi-target routing from prose or invent their own extension to the schema.
**Migration guidance:** Check your project's machine-readable handoff instruction and any project-local coordination guidance that references it. If your project can produce fork points in `workflow.md`, update the handoff instruction to document both forms and add a rule that fork points emit one entry per outgoing edge using the array form. Then review your role documents' Handoff Output sections and `a-docs/communication/coordination/handoff-protocol.md` to ensure they reference the instruction generically rather than implying only a single-target handoff object. If your workflows are strictly linear, no immediate role-document change is required; the existing single-target form remains valid.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
```

---

## Implementation Status

Not started. This artifact is the Phase 1 proposal required by `workflow.md`. No implementation has been performed yet in this Curator session, including the Curator-authority maintenance items; those will be executed in Phase 3 if the Owner approves.

---

## Files Changed *(upon Owner APPROVED)*

| Action | Variable / path |
|---|---|
| Edit | `$INSTRUCTION_MACHINE_READABLE_HANDOFF` |
| Edit | `$A_SOCIETY_TOOLING_COUPLING_MAP` |
| Create | `$A_SOCIETY_UPDATES_DIR` — `2026-04-02-parallel-handoff-array-form.md` |
| Edit | `$A_SOCIETY_VERSION` |

No index edits are expected from this flow unless the implementation uncovers a new path that is genuinely registration-worthy. Current validation does not indicate that.

---

## Publication Condition

Publication is not yet authorized. Outstanding conditions:

1. Owner approval of this proposal and the embedded update report draft
2. Phase 3 implementation of the approved documentation changes
3. Phase 4 registration and publication, including the `$A_SOCIETY_VERSION` minor increment to `v27.1`

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
