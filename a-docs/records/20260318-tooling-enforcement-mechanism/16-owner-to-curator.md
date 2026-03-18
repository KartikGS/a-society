**Subject:** Backward pass synthesis — Owner decision on P1–P7
**Status:** DECIDED
**Date:** 2026-03-18

---

## Curator-Direct Items (C1, C2)

Acknowledged. Curator implements both without further Owner involvement. No objections to placement or scope as described.

---

## Decisions on P1–P7

---

### P1 — Existing-session handoff format
**Decision: Approved as stated.**

The three-element rule (next action, artifacts to read, expected response) is the right definition. Scope — all A-Society role documents plus `general/roles/` templates and `$INSTRUCTION_ROLES` archetypes — is correct. This is the highest-priority proposal group: confirmed by all four roles, affects every multi-session flow, and is the most clearly generalizable finding in this flow.

Route as `[S][LIB][MAINT]`. Enter as Priority 1 in Next Priorities after this flow closes.

---

### P2 — Multi-role backward pass ordering and Component 4 mandate
**Decision: Approved as stated.**

Both parts approved:
1. Update `$A_SOCIETY_IMPROVEMENT` to state the generalizable multi-role rule (first-occurrence-reversed, excluding roles that did not fire) and require Component 4 invocation when available.
2. Update `$A_SOCIETY_TOOLING_ADDENDUM` Phase 7 to require Component 4 invocation for backward pass ordering.
3. `$GENERAL_IMPROVEMENT` receives a parallel update — the multi-role rule is domain-agnostic and belongs there.

Route as `[M][LIB][MAINT]`. Enter as Priority 2 in Next Priorities.

---

### P3 — INVOCATION.md obligation and a-docs/ dependency guidance
**Decision: Approved items 1 and 2 as stated. Item 3 modified.**

Items 1 and 2 (coupling map taxonomy addition for INVOCATION.md; addendum Phase 7 registration checklist update) approved as stated.

Item 3 modification: TA guidance for `a-docs/` format dependencies belongs in `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, not in `$A_SOCIETY_TOOLING_PROPOSAL`. The proposal is a binding component specification — adding authoring guidance there mixes spec with process instruction. The TA role document is the correct home for "when a component has an `a-docs/` format dependency, name the dependency type in your proposal and note the `[a-docs]` annotation in the coupling map." The Curator proposes accordingly.

Route as `[S][MAINT]`. Enter as Priority 3 in Next Priorities.

---

### P4 — Brief-authoring conventions
**Decision: Approved items 1, 2, 3 as stated. Implementation status: approved with modification.**

Items 1 (item authority marking), 2 (condition not action note), and 3 (Curator hard rule: return to Owner when gate condition is met) are approved as stated. Item 3 is particularly important — it closes the bypass gap directly at the role boundary. Add it as a hard rule, not a guideline.

Implementation status addition (from TA finding #1): **Approved with modification.** Do not add as a required field — it would add noise to every brief. Add instead as a standing note under the "Open Questions" section guidance in `$A_SOCIETY_COMM_TEMPLATE_BRIEF`: "When phase placement is an explicit open question, state current implementation status (which phases have completed) so the receiving role does not need to infer it from secondary sources."

Route as `[S][MAINT]`. Enter as Priority 4 in Next Priorities.

---

### P5 — Records convention decision artifact naming rule
**Decision: Approved as stated.**

The mutual-exclusivity rule is clean and correct: `NN-owner-decision.md` when the proposing role has no subsequent action; `NN-owner-to-[role].md` only when the named role has an explicit next action. Add to the non-standard slot section of `$A_SOCIETY_RECORDS`.

Route as `[S][MAINT]`. Enter as Priority 5 in Next Priorities.

---

### P6 — Post-Phase-6 gate conditions and record gap
**Decision: Advisory mode generalization approved as stated. Record gap resolved — approved with modification.**

Advisory mode generalization (Developer and TA gate conditions for post-Phase-6 additions) approved as stated. Add the "Post-Phase-6 Component Additions" section to `$A_SOCIETY_TOOLING_ADDENDUM`. Also update `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` Phase 0 gate clause to describe the gate for component additions after the original launch.

Record gap design question — resolved as follows: **do not add a new artifact type to `$A_SOCIETY_RECORDS`.** Instead, add a completion report obligation to `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` handoff output: when an implementation phase is complete, the Developer files `NN-developer-completion.md` in the active record folder before handing off. This artifact records: what was implemented, test results, and whether any deviations were escalated. This is a role doc obligation, not a records convention change — it keeps the records convention stable while closing the auditability gap.

TA non-involvement: does not warrant a new artifact. Owner paraphrase is acceptable for advisory non-involvement. The real gap was Developer completion, not TA silence.

Route as `[M][MAINT]`. Enter as Priority 6 in Next Priorities.

---

### P7 — Shared utils.ts and backward pass trigger prompt tool
**Decision: Deferred to new TA flows. Preliminary direction given.**

Both items require TA scoping before Developer implementation. They should not be tackled while P1–P6 are open. Enter as Priority 7 in Next Priorities with the following direction:

**Shared utils.ts:** A `tooling/src/utils.ts` for genuinely generic, dependency-free functions is authorized in principle. The no-cross-component-dependencies constraint applies to components depending on each other — not to a shared utility file with no component-specific logic. The TA scopes the boundary: what qualifies as "generic" (no component-specific logic, no side effects, no imports from any component file), what does not, and whether deduplication of `extractFrontmatter()` is the right trigger for creating the file.

**Backward pass trigger prompt tool:** Scope as a Component 4 extension, not a new standalone component. Component 4 already computes the role sequence — generating a copyable trigger prompt per role is a natural extension of that output. The TA scopes the interface and output format; the Developer implements.

Route as `[L]` (two TA tracks). Enter as Priority 7 in Next Priorities, after P1–P6 are complete.

---

## Flow Status

This flow (`20260318-tooling-enforcement-mechanism`) is **complete** at this artifact. The implementation work is done; the backward pass is done; all findings are routed.

**This session (Session A) is closing.** Curator implements C1 and C2 directly, then closes the Curator session.

---

## Next Priorities Update

Remove Priority 3 ("TA track: scope tooling enforcement mechanism") from the log — this flow closes it.

Add the following entries (Priority 1 replaces the removed item; all others shift accordingly after the existing Priorities 1 and 2):

- **New Priority 3:** P1 — Existing-session handoff format `[S][LIB][MAINT]`
- **New Priority 4:** P2 — Multi-role backward pass ordering + Component 4 mandate `[M][LIB][MAINT]`
- **New Priority 5:** P3 — INVOCATION.md obligation + `a-docs/` dependency TA guidance `[S][MAINT]`
- **New Priority 6:** P4 — Brief-authoring conventions `[S][MAINT]`
- **New Priority 7:** P5 — Records decision artifact naming rule `[S][MAINT]`
- **New Priority 8:** P6 — Post-Phase-6 gate conditions + Developer completion artifact `[M][MAINT]`
- **New Priority 9:** P7 — Shared utils.ts + backward pass trigger prompt tool `[L]` (TA track; open after P3–P8 are complete)

Curator updates `$A_SOCIETY_LOG` Next Priorities section as part of closing this flow.
