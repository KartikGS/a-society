**Subject:** Phase 0 review — orient command and a-society CLI entry point
**Status:** APPROVED
**Date:** 2026-03-27
**Artifact reviewed:** `03-ta-phase0-architecture.md`

---

## Decision

APPROVED. The Phase 0 architecture document is correct and complete. Implementation may begin.

---

## Design Correctness

All eight brief topics are covered and the design is sound:

- **OrientSession as a distinct type** is the right call. Reusing `FlowRun` with dummy or null fields for `workflowDocumentPath`, `recordFolderPath`, and `currentNode` would misrepresent the type's semantics. A clean distinct type is preferable.
- **Ephemeral session** (no SessionStore entry) is correct. No structural position means no meaningful resume concept. The rationale holds.
- **`buildContextBundle` `mode` parameter** is the minimal right fix for suppressing the handoff directive in orient sessions. Default `'flow'` preserves all existing callers without change.
- **Shell wrapper via `realpath`** correctly resolves the `npm link` symlink back to the package location. Cross-platform without requiring GNU coreutils.
- **`@inquirer/prompts`** is the appropriate menu library — ESM-compatible with the runtime's existing module system.
- **Project discovery at `process.cwd()` with one-level scan** is correct for the framework's canonical workspace layout. The edge case table covers all identified cases appropriately.
- **`npm link` install approach** is idempotent and standard for local CLI development. No alternative is more appropriate at this stage.

---

## Spec Completeness

The document is complete enough for the Developer to implement from it without additional design judgment:

- All textual output fields (orient directive string, initial user message, error messages, menu prompt, not-found messages) are fully specified.
- Threading path for the `mode` parameter (`orient.ts` → `buildContextBundle`) is specified in §2.
- Threading path for `path.resolve(workspaceRoot)` in `cli.ts` before passing to `runOrientSession` is specified in §4.
- `runOrientSession` call from `a-society.ts` (direct import, no spawn) is specified in §5.

No implementation gaps identified.

---

## Flags and Notes

**Watch item acknowledged:** The registry key derivation coupling (`'{folderName}__Owner'`) is a runtime-internal convention, not a `general/` or `a-docs/` format dependency. The coupling map taxonomy does not need to cover it. The broader question of a runtime `a-docs/` dependency map is tracked in Next Priorities and remains open.

**No proposal round required.** This is a Runtime Development flow. The Phase 0 gate is the approval mechanism; there is no separate Curator proposal cycle.

---

## Implementation Scope

Implement exactly what the Phase 0 architecture document specifies. Files changed per §8:

| File | Action |
|---|---|
| `runtime/src/types.ts` | Modify — add `OrientSession` interface |
| `runtime/src/injection.ts` | Modify — add `mode: 'flow' \| 'orient'` parameter to `buildContextBundle`; branch directive assembly |
| `runtime/src/orient.ts` | New — `runOrientSession` |
| `runtime/src/cli.ts` | Modify — orient branch, usage message update |
| `runtime/bin/a-society.ts` | New — binary source |
| `runtime/bin/a-society` | New — shell wrapper (chmod +x) |
| `runtime/package.json` | Modify — bin field, @inquirer/prompts dependency |
| `a-society/install.sh` | New — install script (chmod +x) |

Do not deviate from the spec without flagging to Owner first.

---

## Gate Condition

Return to Owner when implementation is complete and integration validation has passed. Provide: the integration test record and a completion report naming any deviations from the Phase 0 spec (or explicitly stating none). Do not proceed to TA integration review without this artifact.
