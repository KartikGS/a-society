# Backward Pass Findings: Curator — 20260407-adocs-design-principles

**Date:** 2026-04-07
**Task Reference:** 20260407-adocs-design-principles
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **`agents.md` target scope conflicted inside the brief.** In `02-owner-to-curator-brief.md`, Item 1 / Principle 5 said `agents.md` should contain only the project paragraph plus authority/conflict resolution, but Item 2 simultaneously said the resulting file should retain `## Invariants`. While drafting `03-curator-to-owner.md`, I had to resolve which statement governed the actual target state. I chose to preserve invariants and flag the principle text for correction; `04-owner-to-curator.md` explicitly confirmed that this correction was right. Root cause: the governing principle text and the concrete file-level application were drafted separately and were not cross-checked against each other before briefing.

### Missing Information
- **Downstream propagation surfaces for a new standing doc were under-scoped in the brief.** The brief correctly named the primary targets but not all of the required follow-on surfaces. During proposal I had to raise scope refinements for: adding `$A_SOCIETY_ADOCS_DESIGN` to `$A_SOCIETY_REQUIRED_READINGS`, registering `$GENERAL_ADOCS_DESIGN` and `$INSTRUCTION_ADOCS_DESIGN` in `$A_SOCIETY_INDEX`, adding the extracted owner phase docs to `$A_SOCIETY_AGENT_DOCS_GUIDE`, and changing the manifest entry from `stub` to `copy`. The Owner accepted all six scope refinements in `04-owner-to-curator.md`. Root cause: the brief scoped the new files themselves but not the startup-context, registration, and scaffold surfaces that a new always-relevant documentation artifact implies.

### Unclear Instructions
- **None after review.** The only material ambiguity at briefing time was the deliberate open question around whether `## Review Artifact Quality` should stay inline or be extracted. That ambiguity was appropriate: it was surfaced explicitly in `02-owner-to-curator-brief.md` and resolved cleanly in `04-owner-to-curator.md`.

### Redundant Information
- **No new redundant surface was introduced, but one accepted remainder stays inline.** The flow successfully removed the major redundancy and phase-coupling burden from `agents.md` and `owner.md`. The only knowingly preserved remainder is the inline review-behavior content in `owner.md` (`## How the Owner Reviews an Addition` and `## Review Artifact Quality`), which was explicitly deferred rather than overlooked.

### Scope Concerns
- **The flow installs a standing standard while leaving a known exception in the anchor role file.** `a-docs-design.md` and the new meta-analysis checks now say role documents should contain only ownership, routing, and pointers, yet `owner.md` still intentionally retains `## How the Owner Reviews an Addition` and `## Review Artifact Quality`. That was the approved scope and should not be treated as an implementation miss, but the current state is "known non-conformant, pending follow-on," not "fully compliant." Root cause: this flow combined principle adoption with a deliberately partial application to the most visible role file. Closure language should name such cases as accepted residual non-conformance so later reviewers do not have to rediscover whether the remaining inline content is a bug or an explicit exception.

### Workflow Friction
- **Meta-analysis obligations and the reporting template are now out of sync.** This session is the first one using the new `### a-docs Structure Checks` section, but `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` still has only the legacy category sections. While composing `07-curator-findings.md`, I had to decide manually where to report the new structure-check results and whether to add non-templated analysis sections. Root cause: the analytical standard changed, but the reporting scaffold was not updated in the same flow. This is likely to produce inconsistent backward-pass artifacts across sessions unless the template is aligned.

### Role File Gaps
- none

---

## a-docs Structure Check Notes

- **`agents.md`:** Passes the new scope check after cleanup. It now contains only the project description, authority/conflict resolution, and project-wide invariants.
- **`owner.md`:** Improved materially, but only partially passes the stricter role-document scope standard because the two inline review-behavior sections remain by approved deferral.
- **`roles/owner/`:** The new subfolder is structurally coherent and justified. Three extracted phase documents were created immediately, so this is not a one-file subfolder exception case.
- **Meta-analysis layer:** The new `a-docs Structure Checks` section is correctly installed in both project and general meta-analysis documents, but the associated findings template has not yet caught up.

---

## Analysis Quality

**Observation:** The proposal round was used partly to repair the brief, not just to evaluate design choices.
- **Root Cause:** One governing rule in the brief contradicted the concrete application (`agents.md` scope), and multiple dependent maintenance surfaces were left implicit rather than being scoped up front.
- **Actionable Finding:** When a flow both creates a new standing documentation standard and immediately applies it to existing anchor files, the brief should include two explicit pre-handoff checks: (1) a principle-to-application consistency scan, and (2) a downstream propagation sweep covering required readings, index registration, guide entries, and scaffold/manifest impacts.

---

## Top Findings (Ranked)

1. **The brief contained an internal contradiction about the target scope of `agents.md`.** — `a-society/a-docs/records/20260407-adocs-design-principles/02-owner-to-curator-brief.md`
2. **The brief under-scoped downstream propagation work required by a new standing a-docs artifact.** — `a-society/a-docs/records/20260407-adocs-design-principles/02-owner-to-curator-brief.md`
3. **Meta-analysis now requires `a-docs Structure Checks`, but the findings template has no dedicated reporting surface for them.** — `a-society/general/improvement/reports/template-findings.md`
4. **`owner.md` remains an approved but unlabeled residual exception to the newly formalized role-document scope rule.** — `a-society/a-docs/roles/owner.md`

## Framework Contribution Candidates

1. **Brief-level consistency scan for standard-plus-application flows.** When a brief both defines a new standing rule and applies it to concrete files in the same flow, explicitly verify that the abstract rule text and the file-specific instructions are consistent before handoff. Potential home: Owner brief-writing guidance.
2. **Downstream propagation sweep for new standing artifacts.** When a flow creates a new always-relevant project artifact, the brief should explicitly assess required-readings/startup-context impact, internal and public index registration, guide entries, and manifest/scaffold semantics. Potential home: Owner brief-writing guidance.
3. **Template alignment for new recurring review families.** When meta-analysis gains a standing check family like `a-docs Structure Checks`, update the findings template in the same change or explicitly instruct where those checks should be reported. Potential home: general improvement reporting templates.
4. **Residual non-conformance labeling at closure.** When a flow adopts a stricter standing standard but intentionally defers one known violation, the closure artifact should label that state as an accepted residual exception, not merely a future priority. Potential home: forward-pass closure guidance.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260407-adocs-design-principles/07-curator-findings.md
```
