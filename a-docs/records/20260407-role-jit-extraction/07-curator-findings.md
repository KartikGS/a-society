# Backward Pass Findings: Curator — 20260407-role-jit-extraction

**Date:** 2026-04-07
**Task Reference:** 20260407-role-jit-extraction
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **The closure artifact contradicted the standing backward-pass protocol.** `06-owner-closure.md` says "Backward Pass: Not required," but this flow was a substantive multi-phase role-doc restructuring pass, and the governing instructions in `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS`, and `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` all require a backward pass after such work. During this session I had to decide whether the local closure artifact overrode the standing protocol; it does not. Root cause: the closure artifact introduced an unauthorized local exception at the routing moment. This is an execution/closure-discipline miss, not a missing-reminder problem.

### Missing Information
- **The brief under-scoped `a-docs-guide` propagation.** `02-owner-to-curator-brief.md` scoped `$A_SOCIETY_AGENT_DOCS_GUIDE` as additive registration for the new support docs only. While preparing `03-curator-to-owner.md`, I had to raise that existing guide entries for Owner and Curator would also become inaccurate if only new-file rows were added. `04-owner-to-curator.md` approved those extra accuracy edits. Root cause: the propagation sweep treated the guide as append-only instead of also checking whether the extraction made existing descriptions stale.

### Unclear Instructions
- **None after review.** The three open questions in the brief were intentionally framed design decisions and were resolved cleanly in `04-owner-to-curator.md`.

### Redundant Information
- **No new redundancy remained in the role surfaces after implementation.** The forward pass successfully removed the main startup-context and inline-execution redundancies the flow was meant to address.

### Scope Concerns
- **None requiring follow-up.** The proposal-stage scope refinement for `$A_SOCIETY_AGENT_DOCS_GUIDE` was accepted explicitly, and no out-of-scope `general/` or executable-layer changes were needed.

### Workflow Friction
- **The findings template is still behind the meta-analysis protocol.** `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` still lacks both the `Role File Gaps` category and any dedicated reporting surface for `a-docs Structure Checks`, even though `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` now requires both. While writing this artifact, I again had to decide manually how to represent required analysis that the template does not model. Root cause: the analytical standard changed, but the reporting scaffold was not updated in the same change stream.

### Role File Gaps
- **The newly extracted Curator support doc still names tools that are not the live editing surface.** `$A_SOCIETY_CURATOR_IMPL_PRACTICES` says to construct `old_string` values for `Edit` calls and to prefer the "Write tool" over the "Edit tool" for large removals. In this environment the Curator's manual editing surface is `apply_patch`; there is no separately exposed Write/Edit tool pair. During implementation I had to translate that guidance into patch-vs-rewrite behavior myself. Root cause: the verbatim extraction preserved older tool-surface terminology without normalizing it to the current execution environment or restating the underlying capability in tool-agnostic terms.

---

## a-docs Structure Check Notes

- **Role-document scope:** The five edited role documents now largely satisfy the stricter scope rule. They function as routing/ownership surfaces with JIT pointers, while execution detail lives in role-local support docs.
- **Startup-context reduction:** `$A_SOCIETY_REQUIRED_READINGS` now matches the intended JIT model for the Tooling Developer; `$A_SOCIETY_TOOLING_PROPOSAL` and `$A_SOCIETY_TOOLING_ADDENDUM` are no longer forced into every startup read.
- **Registration coherence:** The new support docs were correctly registered in `$A_SOCIETY_INDEX` and reflected in `$A_SOCIETY_AGENT_DOCS_GUIDE`; no unregistered extracted surface was left behind.
- **Reporting-layer mismatch:** The backward-pass reporting scaffold still fails the new structure-check expectations because the template does not expose slots for the newly required analysis families.

---

## Analysis Quality

**Observation:** The flow's document edits were internally coherent, but two consequential issues surfaced only when comparing neighboring maintenance artifacts rather than by reading the edited files in isolation.
- **Root Cause:** Verification focused correctly on the changed role docs, YAML authority, and index registration, but not on the adjacent reporting surfaces that consume those changes: the closure artifact, the findings template, and the extracted tool-language in the new Curator JIT doc.
- **Actionable Finding:** Extraction flows should verify not only the moved content and its registrations, but also (1) whether closure text still routes the next required phase correctly, (2) whether existing guide entries become stale, and (3) whether newly extracted JIT docs still describe the agent's actual tool surface.

---

## Top Findings (Ranked)

1. **`06-owner-closure.md` declared the backward pass unnecessary even though the standing protocol required it.** — `a-society/a-docs/records/20260407-role-jit-extraction/06-owner-closure.md`
2. **The backward-pass findings template still does not model `Role File Gaps` or `a-docs Structure Checks`.** — `a-society/general/improvement/reports/template-findings.md`
3. **The brief under-scoped `$A_SOCIETY_AGENT_DOCS_GUIDE` propagation by treating it as additive-only.** — `a-society/a-docs/records/20260407-role-jit-extraction/02-owner-to-curator-brief.md`
4. **`$A_SOCIETY_CURATOR_IMPL_PRACTICES` preserved outdated Write/Edit tool terminology after extraction.** — `a-society/a-docs/roles/curator/implementation-practices.md`

## Framework Contribution Candidates

1. **Template alignment when meta-analysis standards expand.** When a backward-pass protocol adds a new standing category or required check family, update the findings template in the same flow so agents do not have to improvise reporting structure. Potential home: general improvement reporting templates.
2. **Propagation sweeps for extraction briefs should check stale existing references, not only new registrations.** When a flow extracts content into new docs, explicitly review guide entries and other descriptive surfaces that may become inaccurate even if no new file is missing. Potential home: Owner brief-writing guidance.
3. **Normalize extracted tool guidance to the live editing surface.** When verbatim extraction carries tool-specific language into a new role-support doc, verify that the named tools actually exist in the current environment or rewrite the rule in capability terms. Potential home: Curator implementation practices.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260407-role-jit-extraction/07-curator-findings.md
```
