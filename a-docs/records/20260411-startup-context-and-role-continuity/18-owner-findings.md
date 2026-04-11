# Backward Pass Findings: Owner — 20260411-startup-context-and-role-continuity

**Date:** 2026-04-11
**Task Reference:** 20260411-startup-context-and-role-continuity
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information

- **Registration-stage duties are still under-specified at the "index updates vs. registration work" boundary.** In `11-curator-to-owner.md`, the Curator correctly concluded that this flow required a Breaking update report, but the same proposal also said "No index or registration updates are required." I had to split those concepts explicitly in `12-owner-to-curator.md`: no index-row changes were expected, but registration work still included publishing the update report and updating `VERSION.md`. The root cause is that the proposal/registration surface does not currently force a distinction between index-description maintenance and broader Phase 4 publication obligations. That ambiguity is small, but it is exactly the kind of small ambiguity that turns into avoidable approval constraints at the Owner gate.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction

- **Correction-loop continuation through downstream phases is still precedent-driven rather than workflow-surfaced.** After `09-ta-integration-review-2.md` accepted the runtime resubmission, the active `workflow.md` still described the original happy-path artifact sequence: `07-owner-to-curator-brief.md`, `08-curator-to-owner.md`, `09-owner-to-curator.md`, `10-curator-to-owner.md`. But artifacts `07-09` had already been consumed by the runtime correction loop. To reopen the deferred Curator phase cleanly, I had to inspect neighboring records and infer that the next correct artifact was `10-owner-to-curator-brief.md`, then continue from there. The role sequence was still clear; the numbering and naming continuation were not. This is recurring workflow overhead, not a one-off slip.

### Role File Gaps

- **Owner brief-writing guidance still lacks an exact raw-string replacement rule for literal edit targets.** In `10-owner-to-curator-brief.md`, I quoted the Owner-role replacement target as `When the user makes a request, read $A_SOCIETY_WORKFLOW to route it.` but the live file contained backticks around `$A_SOCIETY_WORKFLOW`. That mismatch caused the downstream literal replacement to fail, which the Curator then surfaced in `15-curator-findings.md`. `a-society/a-docs/roles/owner/brief-writing.md` already has good rules for insertion boundaries, structured-entry replacement scope, and reference-removal sweeps, but it does not explicitly say: when a brief prescribes a literal source replacement, the quoted target must match the live raw string exactly, including markdown syntax and punctuation. This is an Owner-side precision gap, not a Curator execution error.

---

## a-docs Structure Check Notes

- [x] **agents.md scope:** No `agents.md` scope drift surfaced in this flow.
- [x] **role document scope:** `a-society/a-docs/roles/owner.md` now stays within routing/authority scope and no longer repeats a runtime-managed reread cue.
- [x] **JIT delivery:** The landed contract cleanly separates startup-injected required reading from workflow-delivered support docs.
- [x] **redundancy:** The flow removed a genuine duplication between runtime-managed injected context and Owner-role prose.
- [x] **consolidation risk:** The documentation updates stayed appropriately split between the Owner role, the reusable required-readings instruction, the update report, and record artifacts.
- [x] **orphans:** No orphaned support doc or unreferenced standing artifact surfaced during review.
- [x] **index accuracy:** The existing index descriptions remained acceptable after implementation; no broken `$VAR` resolution issue surfaced.
- [x] **structural drift:** The landed changes move the project closer to the intended machine-readable-authority plus JIT-support-doc model.

---

## Top Findings (Ranked)

1. **Correction-loop continuation for remaining downstream phases is still not workflow-surfaced.** — `a-society/a-docs/records/20260411-startup-context-and-role-continuity/workflow.md`; surfaced when moving from `09-ta-integration-review-2.md` to `10-owner-to-curator-brief.md`
2. **Owner brief-writing still needs an exact raw-string replacement rule for literal edit targets.** — `a-society/a-docs/roles/owner/brief-writing.md`; surfaced by `10-owner-to-curator-brief.md` and confirmed in `15-curator-findings.md`
3. **Curator proposal/registration practice still blurs "no index-row changes" with "no registration work."** — `11-curator-to-owner.md`; corrected in `12-owner-to-curator.md`

---

## Framework Contribution Candidates

1. **Correction-loop downstream-continuation rule for record workflows.** Add reusable guidance clarifying how artifact numbering and naming resume when a `REVISE` loop consumes the originally planned sequence positions before later forward-pass phases reopen.
2. **Literal replacement raw-string fidelity rule in Owner brief-writing guidance.** When a brief prescribes a direct source-text replacement, require the quoted target to match the live raw string exactly, including markdown syntax, punctuation, and formatting markers.
3. **Registration-obligation decomposition in Curator proposal/implementation guidance.** Separate index-row maintenance, guide/rationale updates, update-report publication, and version-record updates so a proposal cannot correctly say "Breaking report required" while also saying "no registration updates required."

---

## Template Maintenance

*This template aligns with the reflection categories and a-docs structure checks defined in `$GENERAL_IMPROVEMENT_META_ANALYSIS` as read on 2026-04-11.*

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/18-owner-findings.md
```
