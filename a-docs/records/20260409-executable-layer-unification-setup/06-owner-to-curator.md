# Owner → Curator: Decision

**Subject:** Executable layer unification — structural setup
**Status:** APPROVED
**Date:** 2026-04-09

---

## Decision

APPROVED. The revised proposal and update-report draft are approved for implementation, subject to the constraints below.

---

## Rationale

The revised submission now passes the relevant review checks.

1. **Generalizability test** — The `general/`-surface changes move A-Society from direct invocation of framework-specific tools toward capability-based wording with manual fallbacks. That is more project-agnostic, not less, and applies cleanly across adopting projects regardless of domain.

2. **Abstraction level test** — The proposal now holds the right line between framework structure and implementation detail. It retires the standing tooling/runtime split without pre-committing the follow-on code migration to unnecessary path churn.

3. **Duplication test** — The revised scope removes, replaces, or consolidates the duplicated executable narratives instead of leaving parallel tooling/runtime stories alive in support docs, workflows, and indexes.

4. **Placement test** — The target locations are now coherent. Standing executable design belongs under the new executable doc set, standing operator-facing execution remains under `runtime/`, and `tooling/` is explicitly transitional rather than a new-placement target.

5. **Quality test** — The proposal is now precise enough to implement without guesswork. The prior source-verification error is corrected, the omitted support docs are now in scope, and the surviving operator-surface ownership rule is explicit.

6. **Coupling / co-maintenance test** — The proposal no longer leaves the coupling surface implicit. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, `$A_SOCIETY_TA_ADVISORY_STANDARDS`, `$A_SOCIETY_UPDATES_PROTOCOL`, and the replacement executable coupling map are all in scope, so the retired tooling-coupling model will not remain load-bearing by accident.

7. **Manifest check** — No new `general/` file type is being introduced. No `$GENERAL_MANIFEST` update is required from this setup flow as currently scoped.

The update-report draft is also approved in direction. A framework update report is warranted for this change set.

---

## If APPROVED — Implementation Constraints

1. **Retire the public tooling workflow row explicitly.** In `$A_SOCIETY_PUBLIC_INDEX`, remove `$A_SOCIETY_WORKFLOW_TOOLING_DEV` as part of the workflow replacement pass. The public-index section in the proposal correctly adds the executable workflow, but implementation must also clear the old tooling workflow row that still exists today.

2. **Do not overreach into the generic project tooling concept.** This flow retires A-Society's standalone executable tooling layer as a standing framework boundary. It does **not** retire the generic idea that an adopting project may maintain a tooling document describing its canonical tools. Keep `$INSTRUCTION_TOOLING` and the generic `$TOOLING_STANDARD` examples in `$INSTRUCTION_INDEX` out of scope unless a separate contradiction is found.

3. **Preserve a concrete co-maintenance rule in the update-report protocol.** When replacing "Version Comparator implementation" wording in `$A_SOCIETY_UPDATES_PROTOCOL`, do not make the maintenance obligation vague. The rewritten text must still say, in concrete terms, that the code implementing the executable update-comparison capability must be updated concurrently when the stable contract changes.

4. **Keep the surviving operator-surface rule consistent across all touched surfaces.** After implementation, the standing rule must read the same way everywhere it appears: `runtime/INVOCATION.md` is the sole default operator-facing executable reference; it is authored by the Orchestration Developer and registered/verified by the Curator; no separate tooling invocation reference survives by default.

---

## If REVISE — Required Changes

None.

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Publish the approved framework update report during Phase 3-4 implementation. Before publication, verify the final affected-artifact list and wording against the files actually changed, and confirm the final classification and version increment against `$A_SOCIETY_UPDATES_PROTOCOL`.
2. **Backward pass:** Backward pass findings are required from both roles unless implementation proves trivial enough to justify an explicit waiver. No waiver is granted here.
3. **Version increment:** If the final approved report remains Breaking, increment `$A_SOCIETY_VERSION` from `v32.1` to `v33.0` as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Executable layer unification — structural setup."

The Curator does not begin implementation until they have acknowledged in the session.
