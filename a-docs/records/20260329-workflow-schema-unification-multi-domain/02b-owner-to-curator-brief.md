# Owner → Curator: Brief (Parallel Track C)

**Subject:** Multi-domain flow documentation + framework update reports
**Status:** BRIEFED
**Date:** 2026-03-29

---

## Context

This brief initiates the parallel Curator track (Track C) of the workflow schema unification flow. Track C runs concurrently with the TA advisory and implementation tracks. The Curator produces a proposal for Owner review before implementing any `general/` changes.

This track has two distinct scopes:

1. **Multi-domain flow documentation** — add the multi-domain parallel-track flow pattern to `general/instructions/workflow/main.md` and create corresponding A-Society-specific workflow guidance in `a-docs/workflow/`
2. **Framework update reports** — publish the update report for the `general/roles/owner.md` Breaking change already implemented in this session

---

## Scope 1 — Multi-Domain Flow Documentation

### Background

Today's session removed the rule "when work requires two or more separate workflow types, route them as separate flows" from both `a-society/a-docs/roles/owner.md` and `general/roles/owner.md`, replacing it with guidance to design a single flow with parallel tracks. The `a-society/a-docs/workflow/main.md` routing index now contains a "Multi-domain flows" bullet under Session Routing Rules.

What is missing: the actual pattern documentation. Agents reading `general/instructions/workflow/main.md` to learn how to design workflows will not find guidance on multi-domain parallel-track flows. Agents reading `a-society/a-docs/workflow/` will not find a workflow document describing how to execute this pattern in A-Society.

### What the pattern is

A multi-domain flow handles a feature request that spans multiple implementation layers (e.g., tooling + runtime + framework docs) in a single flow using parallel tracks:

```
Owner → TA → [Dev Track A, Dev Track B] → TA → Owner → Curator → Owner
```

When the Curator's parallel track includes `general/` changes that require Owner approval, an embedded checkpoint is added:

```
Owner → TA → [Dev Track A, Dev Track B] → TA → Owner → Curator → Owner
|                                               ↑                        ↑
→ Curator (proposal) → Owner (approve) → Curator (implement) ————————
```

### Item 1a — `general/instructions/workflow/main.md`

The Curator must propose where and how to add the multi-domain flow pattern to the general workflow instruction document. The "Extended Workflow Patterns" section already covers parallel forks/joins, branching, and multiple distinct workflows — the multi-domain flow pattern likely belongs there as a new subsection.

The proposal must cover:
- Which section is the correct insertion point
- Draft content for the new subsection, written at the `general/` abstraction level (not A-Society-specific; applicable to software, writing, and research projects equally)
- Whether the pattern constitutes a framework update (see `$A_SOCIETY_UPDATES_PROTOCOL`)

### Item 1b — A-Society-specific workflow documentation

The Curator must propose what A-Society-specific documentation is needed. Options include:
- A new `a-docs/workflow/multi-domain-development.md` file describing the multi-domain flow pattern for A-Society roles (Owner, TA, Tooling Developer, Runtime Developer, Curator)
- Additions to existing workflow documents
- Additions to `a-docs/workflow/main.md` beyond the existing bullet

The Curator's proposal should assess which option best fits the existing `a-docs/workflow/` structure and propose specific content.

---

## Scope 2 — Framework Update Report

### Background

In this session, `general/roles/owner.md` was modified: the rule "when work requires two or more separate workflow types, route them as separate flows" was removed and replaced with guidance to design a single flow with parallel tracks. This is a Breaking change — adopting projects that have instantiated `general/roles/owner.md` must update their `a-docs/roles/owner.md` to remove the same rule.

The Curator must assess and publish the framework update report per `$A_SOCIETY_UPDATES_PROTOCOL`.

### Item 2 — Update Report

The Curator's proposal must include:
- Classification of the `general/roles/owner.md` change (Breaking, Recommended, or Optional) with rationale
- Draft update report content, scoped to what adopting projects must or should do
- Whether the `general/instructions/workflow/main.md` addition from Scope 1 warrants a separate update report entry or is bundled with this one

The Owner will review and approve the classification and draft as part of the Phase 2 decision on this proposal. The Curator implements (writes the update report to `$A_SOCIETY_UPDATES_DIR`) after Owner approval.

---

## Proposal Requirements

The Curator's proposal must cover:

1. **Multi-domain flow pattern** — proposed insertion point and draft content for `general/instructions/workflow/main.md`
2. **A-Society workflow docs** — proposed structure and draft content for `a-docs/workflow/`
3. **Framework update report** — classification, draft content, and bundling decision
4. **Files Changed** — list of all files the Curator would create or modify upon approval
5. **Update report assessment** — whether the `general/instructions/workflow/main.md` addition alone would warrant a version bump, and how it combines with the `general/roles/owner.md` Breaking change

---

## Timing

The Curator may begin drafting immediately — this brief is issued at the same time as the TA brief (`02a`). The Curator does not need to wait for the TA advisory or implementation tracks to complete before proposing. However, the Curator may not implement `general/` changes until Owner approval is received on this proposal.

---

## Return Condition

Return to Owner with the proposal. The Owner reviews, approves or requests revisions, and issues a decision artifact before the Curator implements.
