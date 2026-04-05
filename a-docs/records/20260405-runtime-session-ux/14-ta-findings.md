# Backward Pass Findings: Technical Architect — 20260405-runtime-session-ux

**Date:** 2026-04-05
**Task Reference:** 20260405-runtime-session-ux
**Role:** Technical Architect
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information

- **Brief did not scope abort/resume to interactive vs. autonomous mode**: The Owner brief (§2 Session Resumption on Abort) described the requirement in interactive terms — "return to the prompt," "not crash the process." `orient.ts` has two execution paths: interactive and autonomous. The brief did not state whether the requirement extended to autonomous mode. I inferred "interactive only" from the framing and designed accordingly. The Owner had to correct this explicitly: "The resumable session should also be applicable on autonomous mode." A brief that states "applies to both interactive and autonomous paths" or "interactive only" would have prevented the ambiguity and the re-draft.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction

- **Partial-text-discard design required Owner correction**: My initial Q2 design disposed of the partial turn on abort (`history.pop()`). This was externally caught by the Owner before implementation. The root cause was not a missing rule — §8 behavioral requirements was included and I specified abort behavior there — but a failure to trace consequences for the model: if partial text is discarded, the model's own prior output becomes invisible to it on resumption. The advisory standards direct me to specify what happens, not to verify that what I specified preserves coherence for the model. The correction required a full re-draft of §1, §2, §3, §4, and §8.

- **Orient→orchestrator interface contract left underspecified**: My advisory specified "partial text appended to history as an assistant message" on abort. It did not specify whether this mutation targeted the caller's array by reference or a local copy. `orient.ts` copies `providedHistory` at initialization (`[...providedHistory]`), so append-to-local is the default behavior. The Developer implemented the spec literally and correctly within `orient.ts`; the defect was at the caller boundary. I identified this as Finding 1 in my own integration review — a self-caught error, but only after the implementation was complete. The advisory should have specified: "push to `providedHistory` directly (out-parameter) so the orchestrator's copy receives the mutation."

### Role File Gaps

- **No directive to check modal symmetry for affected components**: The TA advisory standards (§8 behavioral requirements, §4 file-existence verification, coupling map consultation) specify what to include in the advisory output. None of them include a prompt to verify that a design decision applies symmetrically across all execution modes of the affected component. When `orient.ts` was the target of the abort/resume design and it has distinct interactive and autonomous paths, I should have asked "does this apply to both?" as a mandatory check. The correction cost was a full advisory re-draft. This gap is project-agnostic — it would occur whenever a component has multiple execution paths and a design change is scoped to one without explicit justification. **Potential framework contribution.**

- **No standard for interface contract specification at mutation boundaries**: The advisory standards define §8 behavioral requirements as specifying observable external behaviors. They do not extend to specifying internal calling conventions — in particular, whether a function is expected to mutate a caller-provided argument (out-parameter) or operate on a local copy. When a fix requires out-parameter mutation to satisfy a persistence requirement, the advisory must name this explicitly. This is not currently prompted by any advisory standard. Finding 1 in my own integration review would have been prevented by such a standard. **Potential framework contribution.**

---

## Top Findings (Ranked)

1. **TA advisory standards lack a modal-symmetry check for multi-path components** — `a-society/a-docs/roles/technical-architect.md` (advisory standards section)
2. **No interface contract standard for out-parameter mutation in advisories** — `a-society/a-docs/roles/technical-architect.md` (advisory standards section)
3. **Owner brief scoped abort/resume requirement to interactive framing without declaring scope** — `a-society/a-docs/records/20260405-runtime-session-ux/02-owner-to-ta-brief.md`

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260405-runtime-session-ux/14-ta-findings.md
```
