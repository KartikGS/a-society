# Backward Pass Findings: Curator — workflow-schema-unification-multi-domain

**Date:** 2026-03-29  
**Task Reference:** workflow-schema-unification-multi-domain  
**Role:** Curator  
**Depth:** Full  

---

## Findings

### Conflicting Instructions

- **`$A_SOCIETY_CURATOR_ROLE` vs Phase 7 tooling edits.** The Curator hard rule is that executable tooling under `a-society/tooling/` is a **Tooling Developer** deliverable, not Curator-produced. Phase 7 (`07-owner-integration-gate.md`) explicitly assigned the Curator **`$A_SOCIETY_TOOLING_INVOCATION`** and **`$A_SOCIETY_TOOLING_COUPLING_MAP`** updates — documentation under `tooling/` that is clearly Curator registration scope. No conflict for INVOCATION/coupling map.
- **Tension emerged for `tooling/src/version-comparator.ts`.** To get `npm test` green after **`$A_SOCIETY_VERSION`** moved to **v25.0**, the Curator added an **ascending sort** to `compareVersions` and updated **fixtures/tests** (`09-owner-forward-pass-closure.md` flags this). That is **source** change in `tooling/`, not merely `INVOCATION.md`. The Owner accepted the change but recorded a **scope boundary finding** — correctly, per **Analysis Quality** in `$GENERAL_IMPROVEMENT` (*externally-caught errors are higher priority*). The documented rule and the registration-time pressure to ship a green suite pulled in opposite directions.

### Missing Information

- **Phase 7 checklist** did not state whether **test-failure remediation** that requires edits to **`.ts` sources** (not only `INVOCATION.md`) may be done by the Curator during registration, or must be handed back to Tooling Developer. In this flow, the protocol gap was closed by ad hoc Owner acceptance (`09-owner-forward-pass-closure.md`), not by a pre-declared rule.
- **`10-runtime-developer-findings.md`** expected the Curator artifact at **`12-curator-findings.md`**, while **`10-tooling-developer-findings.md`** pointed at **`11-runtime-developer-findings.md`**. The record folder already used **`10-`** for both Developer findings; the **next** free sequence number is **`11-`** for Curator. **Sequence handoff typos** create collision risk if another agent follows the wrong filename.

### Unclear Instructions

- **None material** for Track C proposal → approval → implement. **`05-owner-to-curator.md`** was explicit enough to implement without a second proposal round.

### Redundant Information

- **`07-owner-integration-gate.md`** listed Track C completion items that were **already done** in the earlier Track C pass. The “if not already complete” framing was correct but duplicated mental load — a one-line “Track C verified complete” would have been enough.

### Scope Concerns

- **Component 6 (`version-comparator`) sort fix** — see Conflicting Instructions. **Portable fix for the framework:** add a single sentence to **`$A_SOCIETY_WORKFLOW_TOOLING_DEV`** or **`$A_SOCIETY_TOOLING_ADDENDUM`** (or Phase 7 template in **`$A_SOCIETY_RECORDS`**) stating: *registration may include INVOCATION/coupling-map updates; edits to `tooling/src/*.ts` require Owner-acknowledged exception or Tooling Developer handoff.* Until then, Owner closure notes are the safety valve — which works but does not scale.

### Workflow Friction

- **Parallel Track C + Phase 7** worked: proposal, Owner approval, bundled update report at **v25.0**, and index registration stayed coherent.
- **Fixture churn on version bump** — `version-record-current.md` / `version-record-no-updates.md` and **dynamic `CURRENT_FRAMEWORK`** in tests reduced hardcoded **v11.1** drift; friction was **high** until tests read live `VERSION.md`. **Generalizable:** any repo whose tests assert against **framework `VERSION.md`** should prefer reading the file or a shared test helper over fixed version strings.

---

## Top Findings (Ranked)

1. **Registration-time edits to `tooling/src` without a Tooling Dev phase** — Correct fix (sort + tests) but wrong **default authority** per role boundaries; Owner flag in `09-owner-forward-pass-closure.md` is the right outcome. **Actionable:** document the exception path or forbid it explicitly in Phase 7 templates.

2. **Handoff filename mismatch (`11` vs `12` for Curator findings)** — Low cost here (single Curator file) but a pattern that breaks ordering if followed blindly. **Actionable:** backward-pass prompts should say “next available sequence” not a guessed number, or the orderer output should be the single source of truth.

3. **`compareVersions` sort order vs `VERSION.md` table order** — Implementation previously returned history-table order (newest-first in file), which violated the **ascending** expectation in tests and the Updates Protocol narrative. Sorting in the comparator aligns product with protocol — **generalizable** for any consumer of unapplied reports.

4. **Node-list order as primary contract for backward pass** — Confirms Tooling Developer finding 2.2: **`workflow.nodes[]` order** must stay execution-aligned; worth a single explicit line in **`$INSTRUCTION_RECORDS`** or graph instruction if not already duplicated.

5. **Multi-domain flow pattern documentation** — Reduces future “split into separate flows” mistakes; Track C deliverables (`$INSTRUCTION_WORKFLOW`, `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`) address a real gap called out in **`02b-owner-to-curator-brief.md`**.

---

## Generalizable (framework candidates)

| Topic | Note |
|--------|------|
| Phase 7 + tooling `src/` | Clarify Curator vs Tooling Developer boundary when tests fail during registration. |
| Version tests | Prefer reading **`VERSION.md`** in tests over hardcoded framework versions. |
| Backward pass handoff filenames | Prefer “next sequenced artifact” over hardcoded `NN` in peer findings. |

---

## Note on traversal

`10-runtime-developer-findings.md` referenced **`12-curator-findings.md`**. This artifact is filed as **`11-curator-findings.md`** — the next available sequence after **`10-tooling-developer-findings.md`** and **`10-runtime-developer-findings.md`**.
