# Backward Pass Findings: Owner — 20260327-runtime-orient-session

**Date:** 2026-03-27
**Task Reference:** 20260327-runtime-orient-session
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

None.

---

### Missing Information

**Finding 1 — §8 files-changed table is the Developer's implementation checklist; behavioral requirements in prose are not binding unless mirrored there.**

The TA's analysis of the registry guard miss is the clearest account produced in this backward pass and warrants Owner-level assessment for generalizability and action placement.

The root cause: the §8 Files Changed table is what a Developer implements against. A behavioral requirement — an error condition, a guard, a required exit path — that appears only in narrative prose (§1–§7) is not structurally present in the Developer's checklist. The Developer who reads §8 and implements exactly what is described there has not deviated from the spec. The spec has an incomplete §8.

The TA role already carries the advisory standard: "binding implementation requirements must specify execution, not just declaration." That standard was applied to trigger rules in this spec. It was not applied to the registry guard, which is equally behavioral — error message + `process.exit(1)` — and equally subject to stub risk. The gap is not that the standard doesn't cover this case. The gap is that the standard's application was inconsistent: the TA applied it to some behavioral requirements and not to others.

The required fix is targeted: extend the advisory standard to make the scope of "binding" explicit. Every behavioral requirement (guard condition, error output with spec-defined message, required exit behavior) named anywhere in §1–§7 must appear by name in the relevant §8 row — not just as a happy-path summary. The §8 row for `orient.ts` described the happy path ("registry lookup, context bundle via extended service, LLM instantiation, readline conversation loop") and was accurate for that path. It was silent on what happens when registry lookup fails.

**This finding is generalizable.** Any TA producing advisory documents faces the same structural gap: §8 is structural (it drives implementation), prose is narrative (it describes behavior). Requirements that live only in narrative are not structurally binding. The fix is the same across any project type: mirror behavioral requirements into the §8 row for the file they appear in. *(Potential `general/` contribution.)*

**Action scope:** `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` Advisory Standards — additive rule specifying that every behavioral requirement (guard, error output, exit condition) in §1–§7 prose must be named explicitly in the corresponding §8 row.

---

**Finding 2 — Runtime has no integration test infrastructure; "integration test record" is a required gate artifact with no established format.**

The Runtime Developer produced a manual terminal transcript for the integration test record. This is the correct improvisation given the absence of infrastructure, but it reveals a gap: the integration validation gate requires a deliverable whose format is undefined and whose production mechanism does not exist for the runtime layer.

The tooling layer has a structured test suite (`tooling/test/`, `npm test`). The runtime layer has no equivalent. The Developer's transcript demonstrated the binary flow up to the LLM call — and the TA integration review correctly identified that the transcript did not validate the registry guard path, because the mock API key short-circuited before that path executed. A structured test harness would have made this gap visible earlier.

The existing Next Priorities item `[M][LIB]` — Developer completion report and integration test record format — addresses the general instruction. This is a distinct, runtime-specific gap: the runtime layer has no `test/` infrastructure. The two items are different workflow types (Framework Dev vs. Runtime Dev) and different targets; no merge.

**Action scope:** New `[M]` Next Priorities item — runtime integration test infrastructure (Runtime Dev workflow).

---

### Unclear Instructions

**Finding 3 — Owner brief asked to check for a "runtime section" in `$A_SOCIETY_AGENT_DOCS_GUIDE`; no such section exists or should exist.**

The Owner brief for the Curator registration phase directed the Curator to assess whether the `$A_SOCIETY_AGENT_DOCS_GUIDE` warranted a runtime section. This was a brief error: the guide covers `a-docs/` content only, by design. The runtime layer is work product — it is not `a-docs/`. A runtime section in the a-docs guide would be a layer isolation violation.

The Curator correctly assessed that no update was needed and applied sound judgment. But the brief created unnecessary ambiguity. The Curator's time spent checking a non-existent section was wasted motion.

Root cause: the Owner did not verify the scope of `$A_SOCIETY_AGENT_DOCS_GUIDE` before including it in the brief. The review artifact quality standard ("verify that claims about current file state by re-reading the relevant passage at review time") applies equally to brief-writing: before directing a role to check a file for a specific section, verify that the file covers that kind of content.

**Action scope:** No document change warranted — this is an Owner self-correction. The brief-writing quality guidance already covers this category of error. Recording here for synthesis awareness.

---

### Redundant Information

None.

---

### Scope Concerns

None.

---

### Workflow Friction

**Finding 4 — `structure.md` describes a "Three-Folder Structure" that has been superseded by the five-folder reality.**

The Curator correctly flagged this. `a-society/a-docs/project-information/structure.md` opens with "The Three-Folder Structure" and lists `general/`, `agents/`, `a-docs/`. The `tooling/` and `runtime/` layers are absent from this placement guide. `architecture.md` covers both layers, but `structure.md` is the document agents read for placement decisions — it is the authority agents consult when asking "where does this belong?" Its silence on `tooling/` and `runtime/` creates a guidance gap for any agent making a placement decision involving these layers.

This is resolvable in synthesis as a MAINT change within `a-docs/`. The Curator should add folder reference sections for `tooling/` and `runtime/` to `structure.md`, consistent with what `architecture.md` already describes. The heading "Three-Folder Structure" should be updated to reflect the actual count.

**Action scope:** Synthesis MAINT — Curator adds `tooling/` and `runtime/` sections to `a-docs/project-information/structure.md`, updates the heading.

---

## Top Findings (Ranked)

1. **TA advisory §8 completeness gap.** Behavioral requirements (guards, error exits, required messages) in prose sections (§1–§7) that are not mirrored in the §8 Files Changed row are not binding implementation requirements. The registry guard miss is a direct consequence. The TA advisory standard "binding requirements must specify execution" must be extended to cover this case explicitly. The fix is additive and targeted. *(Generalizable — potential `general/` contribution.)* — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

2. **`structure.md` premise outdated.** "Three-Folder Structure" does not account for `tooling/` or `runtime/`. Placement guidance for the two executable layers is absent. Resolvable by Curator in synthesis (MAINT). — `a-docs/project-information/structure.md`

3. **Runtime integration test infrastructure absent.** The integration validation gate requires a test record; the runtime has no test harness or format standard. Produces improvised transcripts that may not exercise the full behavioral surface. — `runtime/` (new Next Priorities item, Runtime Dev workflow)

4. **TA extension-before-bypass heuristic (from TA findings).** Endorsed: the initial draft proposed bypassing existing infrastructure without enumerating why extension was insufficient. A standing advisory standard in the TA role document — "before proposing a new parallel path, enumerate explicitly why the existing path cannot be extended" — would surface this discipline at design time. *(Generalizable.)* — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`
