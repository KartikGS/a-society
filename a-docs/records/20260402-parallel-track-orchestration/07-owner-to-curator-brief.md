**Subject:** Parallel Track Orchestration — Documentation, Registration, and `[LIB]` Update
**Status:** BRIEFED
**Date:** 2026-04-02
**Flow:** `20260402-parallel-track-orchestration`

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `$INSTRUCTION_MACHINE_READABLE_HANDOFF` | replace — add array form schema |
| `$A_SOCIETY_TOOLING_COUPLING_MAP` | additive — Component 4 Type C note |
| `$A_SOCIETY_INDEX` | verify — Path Validator sweep |
| `$A_SOCIETY_PUBLIC_INDEX` | verify — Path Validator sweep |
| `a-society/updates/` (new file) | additive — update report for `[LIB]` scope |
| `$A_SOCIETY_VERSION` | replace — minor version increment |

### 1. Machine-Readable Handoff Schema Update `[Requires Owner approval]` `[replace]`

`$INSTRUCTION_MACHINE_READABLE_HANDOFF` must be updated to document the new array form for fork-point handoffs. The handoff block now supports two forms:

**Single-target (unchanged):**
```
```handoff
role: Owner
artifact_path: path/to/artifact.md
```
```

**Array form (new, for fork points):**
```
```handoff
- role: Tooling Developer
  artifact_path: path/to/brief-a.md
- role: Runtime Developer
  artifact_path: path/to/brief-b.md
```
```

The array form is required when the workflow graph has multiple outgoing edges from the current node (fork point). The orchestrator validates that the number of handoff targets matches the number of outgoing edges and that each target's role matches a successor node's role. The single-object form remains valid for all non-fork cases.

Add a usage rule: "At fork points (where the workflow graph has multiple outgoing edges), emit one handoff entry per fork target using the array form. At non-fork points, emit a single handoff using the standard form."

This is a `[LIB]` scope change — it modifies `general/` content that adopting projects consume.

### 2. Coupling Map Update `[Curator authority — implement directly]` `[additive]`

`$A_SOCIETY_TOOLING_COUPLING_MAP`: Add a Type C note for Component 4's interface change:
- `computeBackwardPassOrder` gained an `edges` parameter
- `orderWithPromptsFromFile` return type changed from `BackwardPassEntry[]` to `BackwardPassEntry[][]`
- The INVOCATION.md has already been updated by the Tooling Developer

No new coupling map row is needed for the handoff format — no tooling component parses handoff blocks today.

### 3. Index Verification `[Curator authority — implement directly]`

Run Path Validator against both `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` to verify no new paths need registration. The new file `runtime/src/visualization.ts` is an implementation detail (inside `runtime/src/`) and does not require public index registration per existing convention.

### 4. Update Report `[Requires Owner approval]` `[additive]`

Because this flow carries `[LIB]` scope (modifying `$INSTRUCTION_MACHINE_READABLE_HANDOFF`), an update report must be drafted. The Curator determines impact classification per `$A_SOCIETY_UPDATES_PROTOCOL`. Include the update report draft in the proposal submission.

### 5. VERSION.md Increment `[Curator authority — implement directly]` `[replace]`

Increment the minor version in `$A_SOCIETY_VERSION` and add the update report to the history table.

---

## Scope

**In scope:**
- Updating `$INSTRUCTION_MACHINE_READABLE_HANDOFF` with the array form schema, usage rule, and worked example
- Adding the Component 4 Type C note to the coupling map
- Running Path Validator sweeps on both indexes
- Drafting the `[LIB]` update report
- VERSION.md minor version increment
- Registering the update report in VERSION.md history table

**Out of scope:**
- Any changes to runtime or tooling source code (implementation is complete)
- Changes to `$A_SOCIETY_ARCHITECTURE` Component 4 description (Component 4's purpose hasn't changed — only its algorithm)
- `$A_SOCIETY_RECORDS` parallel sub-labeling (already formalized in a prior flow)
- `runtime/INVOCATION.md` or `tooling/INVOCATION.md` (already updated by implementation tracks)

---

## Likely Target

- `$INSTRUCTION_MACHINE_READABLE_HANDOFF` → `a-society/general/instructions/communication/coordination/machine-readable-handoff.md`
- `$A_SOCIETY_TOOLING_COUPLING_MAP` → `a-society/a-docs/tooling/general-coupling-map.md`
- `$A_SOCIETY_VERSION` → `a-society/VERSION.md`
- Update report → `a-society/updates/` (new file)

---

## Open Questions for the Curator

1. **Impact classification for the handoff schema change.** The schema change is backward-compatible (single-object form unchanged). Orchestrators that don't support fork points simply never encounter the array form. Determine classification per `$A_SOCIETY_UPDATES_PROTOCOL`.
2. **Whether `$A_SOCIETY_AGENT_DOCS_GUIDE` needs updating.** The handoff instruction is already referenced there; verify whether the guide's description of the handoff format needs a note about the array form.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Parallel Track Orchestration — Documentation, Registration, and `[LIB]` Update."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.

```handoff
role: Curator
artifact_path: a-society/a-docs/records/20260402-parallel-track-orchestration/07-owner-to-curator-brief.md
```
