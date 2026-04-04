**Subject:** Project-Scoped Improvement Session Instructions — Forward Pass Closure
**Flow:** 20260404-project-scoped-improvement-instructions
**Artifact:** 06-owner-closure.md
**Date:** 2026-04-04

---

## Closure Verification

**Runtime track (03b):** Verified. `improvement.ts` constants removed; `path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'meta-analysis.md')` and `synthesis.md` computed at each usage site. Incidental `triggers.ts` fix (deprecated `orderWithPromptsFromFile` → `computeBackwardPassPlan`) is sound — `flowRun.recordFolderPath` is a valid `FlowRun` property, API matches. Module compiles, tests pass.

**Curator MAINT (03a §1):** Verified. `a-society/a-docs/improvement/meta-analysis.md` and `synthesis.md` created; placeholders resolved; `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` and `$A_SOCIETY_IMPROVEMENT_SYNTHESIS` index entries already registered — no index update required.

**`$INSTRUCTION_IMPROVEMENT` (04 §B1):** Verified. "Project-Specific Phase Files (Runtime)" section present; three-item component list updated; index table rows for `$[PROJECT]_IMPROVEMENT_META_ANALYSIS` and `$[PROJECT]_IMPROVEMENT_SYNTHESIS` added; record-folder artifact path note present in reports/ section.

**`$GENERAL_MANIFEST` (04 §B2):** Verified. `improvement/meta-analysis.md` and `improvement/synthesis.md` entries present with `required: false`, `scaffold: copy`, correct `source_path` values.

**Update report (04 §B3):** Verified at `a-society/updates/2026-04-04-project-scoped-improvement-instructions.md`. Classification: Breaking.

**Version bump:** Verified. `VERSION.md` shows v29.0; history table entry records this flow.

**Path portability (multi-track):** `03b-runtime-developer-completion.md` contains no `file://` URLs or machine-specific absolute paths. ✓

---

## Pre-Closure Sweep

**Next Priorities sweep:** Scope (`improvement.ts`, `$INSTRUCTION_IMPROVEMENT`, `$GENERAL_MANIFEST`, `a-docs/improvement/`) overlaps no remaining Next Priorities items. No entries updated, narrowed, or removed beyond the closing flow's own entry (already removed at intake for the absorbed `[S][LIB]` item; the flow entry itself removed at closure).

**Log updated:** Status v28.0 → v29.0. Recent Focus updated to this flow. Previous shifted (programmatic-improvement-system added; parallel-track-orchestration cycled to archive). Next Priorities entry for this flow removed.

---

## Forward Pass: Closed

All approved tasks executed. No outstanding Curator → Owner submissions. Forward pass is complete.

---

## Backward Pass Initiation

This flow is eligible for Component 4 invocation. Record folder: `a-society/a-docs/records/20260404-project-scoped-improvement-instructions/`. `workflow.md` is present with a valid graph.

Invoke Component 4 to generate the backward pass plan:

```
npx tsx a-society/tooling/src/backward-pass-orderer.ts \
  a-society/a-docs/records/20260404-project-scoped-improvement-instructions \
  Curator \
  graph-based
```

**Backward pass order (from workflow graph):**

Forward pass first occurrences: Owner (owner-intake), Runtime Developer (runtime-developer-fix) and Curator (curator-phase) in parallel, Owner again (owner-integration-gate), Curator again (curator-implementation), Owner again (owner-forward-pass-closure).

Unique first occurrences in forward order: Owner, then Runtime Developer + Curator as a concurrent pair.

Backward order: Runtime Developer + Curator concurrent → Owner → Curator (synthesis).

**Per-role instructions:**

Each role reads the backward pass instructions injected by the runtime (or, for manual sessions: `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` for findings-producing roles; `$A_SOCIETY_IMPROVEMENT_SYNTHESIS` for Curator synthesis). Findings artifacts go in the record folder at the next available sequence position.

**Concurrent findings (step 1):**

```
Next action: Produce backward pass findings for this flow
Read: a-society/a-docs/records/20260404-project-scoped-improvement-instructions/ (record folder contents for context)
      a-society/a-docs/improvement/meta-analysis.md (phase instructions)
Expected response: next available sequence artifact — Runtime Developer findings file
```

```
Next action: Produce backward pass findings for this flow
Read: a-society/a-docs/records/20260404-project-scoped-improvement-instructions/ (record folder contents for context)
      a-society/a-docs/improvement/meta-analysis.md (phase instructions)
Expected response: next available sequence artifact — Curator findings file
```

**Step 2 — Owner findings** (after Runtime Developer and Curator findings are filed):

```
Next action: Produce backward pass findings for this flow
Read: a-society/a-docs/records/20260404-project-scoped-improvement-instructions/ (record folder contents)
      a-society/a-docs/improvement/meta-analysis.md (phase instructions)
      [Runtime Developer findings file]
      [Curator findings file]
Expected response: next available sequence artifact — Owner findings file
```

**Step 3 — Curator synthesis** (after Owner findings are filed):

```
Next action: Synthesize all findings and close the backward pass
Read: a-society/a-docs/records/20260404-project-scoped-improvement-instructions/ (all findings)
      a-society/a-docs/improvement/synthesis.md (synthesis instructions)
Expected response: next available sequence artifact — Curator synthesis file
```

Synthesis closes the flow. No further session follows.
