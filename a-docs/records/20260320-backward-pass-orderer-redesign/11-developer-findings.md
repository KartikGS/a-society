# Backward Pass Findings: Tooling Developer — 20260320-backward-pass-orderer-redesign

**Date:** 2026-03-20
**Task Reference:** 20260320-backward-pass-orderer-redesign
**Role:** Tooling Developer
**Depth:** Full

---

## Findings

### Missing Information

**1. No explicit TA review handoff artifact after the parallel tracks converge.**

`04-owner-decision.md` states that "coupling map registration and TA implementation review happen after both tracks complete," but the record sequence did not define the handoff artifact that opens that TA review step. The review was routable from the decision text, but not pre-structured in the record folder.

**Generalizable:** Yes. Any flow with parallel tracks that reconverge into a TA implementation review will encounter the same gap unless the post-convergence review artifact is explicitly defined.

---

### Unclear Instructions

**2. The Tooling Developer's record-artifact duties remain unclear against the role's write boundary.**

The Tooling Developer role requires completion reporting in the active record folder, and this backward pass likewise expected a record-folder artifact (`11-developer-findings.md`). The same role also says "Write to `tooling/` only" and explicitly denies write authority over `a-docs/`.

The conflict was resolvable in this session because the human explicitly authorized writing the artifact. Without that override, the role instructions leave the correct behavior unclear.

---

### Conflicting Instructions

**3. Record-folder reporting requirement conflicts with the `tooling/`-only hard rule.**

This is stronger than ambiguity:

- The role requires Developer-produced record artifacts such as `NN-developer-completion.md`
- This backward pass required `11-developer-findings.md`
- The hard rule says the Developer writes to `tooling/` only and has no write authority over `a-docs/`

Those instructions cannot all be followed literally at once without an explicit exception rule for record-folder reporting.

---

### Redundant Information

- None.

---

### Scope Concerns

- None. The redesign boundary held cleanly. Tooling implementation and verification stayed in `tooling/`, while documentation updates remained in the Curator's scope.

---

### Workflow Friction

**4. Integration verification needed an inferred framework-drift policy for Component 3.**

After the redesign, Component 4 no longer depends on A-Society's permanent workflow graph file. During verification, the integration suite still exercised Component 3 against the live `a-society/a-docs/workflow/main.md`, which currently has no YAML frontmatter. That is framework-state drift, not a Component 4 defect.

The integration suite already treated other live-framework drift issues informationally, so the workflow-validator check was aligned to that same policy. This was the right implementation choice, but the redesign artifacts did not say so explicitly.

---

## Top Findings (Ranked)

1. **Developer record-artifact duty conflicts with `tooling/`-only write authority** — the role requires record-folder outputs while also forbidding writes outside `tooling/`; this needs an explicit exception or routing rule.
2. **No explicit TA review handoff artifact after parallel-track convergence** — the flow says TA review happens next, but the record sequence does not define the artifact that opens that review step.
3. **Integration policy for live workflow-document drift had to be inferred** — Component 3's live-file validation failure was framework drift, not tool breakage, but the redesign docs did not state how that should be treated in verification.
