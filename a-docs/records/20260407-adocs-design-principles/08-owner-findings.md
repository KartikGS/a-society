# Backward Pass Findings: Owner — 20260407-adocs-design-principles

**Date:** 2026-04-07
**Task Reference:** 20260407-adocs-design-principles
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **None encountered while executing.** The internal contradiction in the brief (agents.md scope vs. Invariants section) was one I *produced*, not one I read. Addressed under Role File Gaps below.

### Missing Information
- **No downstream propagation sweep obligation existed in brief-writing guidance.** When briefing for a flow that creates a new always-relevant documentation artifact, I had no documented heuristic for which secondary surfaces are implied: required readings, startup-context injection, index registration (internal and public), guide entries, scaffold/manifest entries. I scoped the new files themselves but not these follow-on surfaces. The Curator had to raise six scope refinements during the proposal round (`03-curator-to-owner.md`), all of which were correct and accepted in `04-owner-to-curator.md`. Root cause: `$A_SOCIETY_OWNER_BRIEF_WRITING` has no propagation sweep step for new standing artifacts.

### Unclear Instructions
- **None encountered.**

### Redundant Information
- **None encountered.**

### Scope Concerns
- **Deferred residual non-conformance in `owner.md` is unlabeled at closure.** At forward pass closure, I logged the retained inline sections (`## How the Owner Reviews an Addition`, `## Review Artifact Quality`) as a Next Priorities item. I did not label the current state of `owner.md` in the closure artifact itself as "accepted residual exception." A future reviewer reading `06-owner-closure.md` cannot distinguish between a known approved exception and an implementation miss without re-reading the approval decision. The Curator flagged this independently in `07-curator-findings.md`. Root cause: the closure format has no field or convention for accepted residual exceptions — only verification of completed tasks and Next Priorities.

### Workflow Friction
- **None beyond the two structural issues below.**

### Role File Gaps

1. **`$A_SOCIETY_OWNER_BRIEF_WRITING` has no pre-handoff consistency scan obligation.** The brief's Principle 5 text said agents.md should contain only two elements; the concrete application in Item 2 simultaneously retained a third (`## Invariants`). I drafted both separately and did not cross-check them. The Curator caught the contradiction during proposal. Root cause: `$A_SOCIETY_OWNER_BRIEF_WRITING` does not include a pre-handoff step requiring the Owner to verify that abstract principle text and concrete file-level instructions are mutually consistent. Since the rule was not documented, this is not a behavioral miss — but the absence of the rule is actionable.

   **Note on external catch:** The Curator catching this rather than me is higher-priority signal, per the analysis quality standard. The brief is the Owner's primary quality gate. A contradiction surviving that gate and reaching the Curator is the most expensive place to find it.

2. **`$A_SOCIETY_OWNER_BRIEF_WRITING` has no downstream propagation sweep step.** Covered above under Missing Information; included here as the actionable location — the fix belongs in brief-writing guidance, not in general Owner orientation.

---

## a-docs Structure Check Notes

Applied to the flow's principal a-docs targets as approved and closed by the Owner.

- **`agents.md` after cleanup:** Passes all scope checks. Three sections remain: project description, authority/conflict resolution, and project-wide invariants. No phase-coupled or workflow-conditional content.
- **`owner.md` after restructure:** Phase-coupled content (brief-writing, TA review, closure discipline) correctly extracted and replaced with pointers. Two inline sections (`## How the Owner Reviews an Addition`, `## Review Artifact Quality`) remain by approved deferral — accepted residual exception, not an implementation miss.
- **`a-docs-design.md` (new):** Correctly scoped as a design-principles document — no routing, no phase instructions, no redundancy with injected context.
- **`roles/owner/` phase documents (new):** Each file contains content applicable to one workflow phase. No cross-phase bleed observed in `brief-writing.md`, `ta-advisory-review.md`, or `forward-pass-closure.md`.
- **Meta-analysis additions:** The new `### a-docs Structure Checks` section is correctly installed in both instances. The associated findings template (`$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`) was not updated in the same flow and does not yet have a reporting surface for these checks — a gap visible during this backward pass itself.

---

## Analysis Quality

**The two brief-quality failures were both externally caught.** The internal contradiction (agents.md scope) was caught by the Curator. The propagation under-scoping was caught by the Curator. Neither was surfaced by my own pre-handoff check because no such check was documented. The absence of the documented obligation, not a lapse in execution, is the root cause — which means the fix is additive (add the checks to `$A_SOCIETY_OWNER_BRIEF_WRITING`) rather than behavioral.

The closure-labeling gap was also caught externally (Curator findings). In this case, the root cause is structural: the closure format doesn't provide a mechanism for labeling residual exceptions, so even a careful closure can omit the label without violating any stated convention.

---

## Top Findings (Ranked)

1. **`$A_SOCIETY_OWNER_BRIEF_WRITING` has no pre-handoff principle-to-application consistency scan.** Brief contradiction reached the Curator rather than being caught by the Owner. — `a-society/a-docs/roles/owner/brief-writing.md`
2. **`$A_SOCIETY_OWNER_BRIEF_WRITING` has no downstream propagation sweep for new standing artifacts.** Six scope refinements had to be raised during proposal. — `a-society/a-docs/roles/owner/brief-writing.md`
3. **Forward pass closure format provides no mechanism for labeling accepted residual exceptions.** Deferred violations are indistinguishable from implementation misses in the closure artifact. — `a-society/a-docs/roles/owner/forward-pass-closure.md`
4. **`$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` was not updated when `### a-docs Structure Checks` was added to meta-analysis.** Reporting surface is absent; agents must decide ad hoc where to report structure-check findings. — `a-society/general/improvement/reports/template-findings.md`

---

## Framework Contribution Candidates

1. **Pre-handoff principle-to-application consistency scan.** When a brief both defines a new standing rule and applies it to concrete files, the Owner should explicitly verify that abstract principle text and file-specific instructions are consistent before handoff. Potential home: Owner brief-writing guidance (`$A_SOCIETY_OWNER_BRIEF_WRITING`, and the general equivalent if it exists).

2. **Downstream propagation sweep for new standing artifacts.** When a brief creates a new always-relevant project artifact, explicitly assess: required readings, startup-context injection, index registration (internal and public), guide entries, manifest/scaffold semantics. Potential home: Owner brief-writing guidance.

3. **Accepted residual exception field in closure format.** When a flow adopts a stricter standard but intentionally defers a known violation, the closure artifact should explicitly label the current state of the affected document as an accepted residual exception. Potential home: forward-pass closure guidance (`$A_SOCIETY_OWNER_CLOSURE`, and general equivalent).

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260407-adocs-design-principles/08-owner-findings.md
```
