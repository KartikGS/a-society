# Backward Pass Findings: Curator — 20260409-executable-layer-unification-setup

**Date:** 2026-04-09
**Task Reference:** `20260409-executable-layer-unification-setup`
**Role:** Curator
**Depth:** Full
**Scope Note:** Per explicit session direction, the backward-pass trigger miss is excluded from this analysis.

---

## Findings

### Conflicting Instructions
- **none**

### Missing Information
- **No standing compiled-output policy for `runtime/dist/`.** During late verification-support updates, changing the handoff example required touching both `runtime/test/handoff.test.ts` and the tracked compiled artifact `runtime/dist/runtime/test/handoff.test.js`. The approved setup flow correctly kept `dist/` decisions out of scope, but no standing executable-layer document or developer guidance says whether tracked compiled output should be regenerated, hand-updated, or removed when a source-backed verification artifact changes. This turned a structural-doc flow into accidental dual maintenance. The Owner closure correctly filed a new Next Priority for this, but the missing standing rule is the underlying gap.

### Unclear Instructions
- **None after revision.** Once `04-owner-to-curator.md` corrected the source claim and expanded the standing-doc scope, the implementation pass itself was directionally clear.

### Redundant Information
- **none**

### Scope Concerns
- **The `runtime/dist/` boundary stayed operationally fuzzy until late verification.** The brief intentionally left package/layout/output decisions for a follow-on executable implementation flow, but once verification-support edits touched tracked compiled output, the deferred boundary became a live execution issue rather than a future design concern. This was handled correctly by filing a new follow-up instead of broadening the flow, but the boundary should have been surfaced earlier as a known consequence of touching runtime-backed examples.

### Workflow Friction
- **The first proposal required an avoidable revise loop.** In `03-curator-to-owner.md` I stated that `$INSTRUCTION_WORKFLOW_MODIFY` and `$INSTRUCTION_WORKFLOW_COMPLEXITY` did not require direct wording changes and omitted several load-bearing support docs from the in-scope set. `04-owner-to-curator.md` caught both problems. Root cause: I treated the structural rewrite as a primary-surface architecture pass and did not force an explicit support-doc propagation sweep before submitting the first proposal. Because the error was caught by the Owner rather than by me, this is a higher-priority signal than the later correction.

### Role File Gaps
- **`$A_SOCIETY_CURATOR_IMPL_PRACTICES` lacks a standing structural-rewrite stale-term sweep rule.** The support doc tells me to verify source claims, normalize terminology within maintained guidance, and compare internal/public indexes directly, but it does not require an end-of-pass sweep for retired role/layer names across adjacent guide, example, and test surfaces after a standing rename. That gap is why pre-unification wording in `$A_SOCIETY_AGENT_DOCS_GUIDE` and old role names in the handoff tests survived until late verification instead of being caught during the main implementation pass.

---

## a-docs Structure Check Notes

1. **Role-document scope check** — The replacement executable role docs and workflow docs are cleaner than the retired split they replace. Execution detail lives in role-local support docs rather than re-bloating the startup role files.
2. **Addition-without-removal check** — This flow initially failed the check. Late verification still found pre-unification wording in `$A_SOCIETY_AGENT_DOCS_GUIDE` and old role-name examples in `runtime/test/handoff.test.ts` plus `runtime/dist/runtime/test/handoff.test.js`. These were corrected before closure, but the miss shows that structural rename flows need a mandatory retired-term sweep, not just file-targeted edits.
3. **Workflow-delivery check** — After the revise cycle, the flow delivered the needed support docs at the right moments. I did not encounter a pointer-only JIT gap once `04-owner-to-curator.md` expanded the standing-doc scope explicitly.
4. **agents.md scope check** — No issue in this flow. `agents.md` remained out of scope and did not become stale as a result of the executable-layer rewrite.

---

## Analysis Quality

**The owner-caught revise is the primary signal from this flow.** The existence of a source-claim verification rule in `$A_SOCIETY_CURATOR_IMPL_PRACTICES` did not prevent the miss because I did not apply it rigorously enough to the two workflow instructions I described narrowly in the first proposal. The right lesson is not "be more careful"; it is that structural rename flows need an explicit propagation sweep across support docs and narrow source claims before proposal submission.

**Late validation prevented closure drift, but it came too late in the pass.** The stale-term leftovers in the guide and handoff tests were caught before forward-pass closure, which is good. But they were found only after publication and verification work had already started. That means the current verification habit is effective as a backstop, not as the primary prevention layer.

---

## Top Findings (Ranked)

1. **The first proposal's source-claim and scope miss was caught externally by the Owner.** — `a-society/a-docs/records/20260409-executable-layer-unification-setup/03-curator-to-owner.md`, `a-society/a-docs/records/20260409-executable-layer-unification-setup/04-owner-to-curator.md`
2. **No standing compiled-output policy exists for tracked `runtime/dist/` artifacts in the unified executable package.** — `a-society/runtime/dist/runtime/test/handoff.test.js`, `a-society/a-docs/project-information/log.md`
3. **Curator guidance lacks a mandatory stale-term sweep for structural renames across adjacent guide/example/test surfaces.** — `$A_SOCIETY_CURATOR_IMPL_PRACTICES`, `$A_SOCIETY_AGENT_DOCS_GUIDE`, `a-society/runtime/test/handoff.test.ts`

---

## Generalizable Findings

- **Structural rename / layer-retirement flows need a mandatory retired-term sweep before publication.** A file-by-file implementation pass is not enough when a flow replaces a standing role family, layer name, or workflow vocabulary. Adjacent guide docs, examples, and tests will often preserve the retired model unless the sweep is required explicitly. Potential home: `$GENERAL_CURATOR_ROLE` or the framework-development workflow's implementation/verification guidance.

- **Tracked generated output needs an explicit ownership rule or it silently turns documentation flows into dual-maintenance flows.** If a repository keeps compiled artifacts under version control, any change to a source-backed example or test may require a second write into generated output even when the primary flow is structural documentation work. Potential home: executable addendum / executable developer implementation discipline.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260409-executable-layer-unification-setup/09-curator-findings.md
```
