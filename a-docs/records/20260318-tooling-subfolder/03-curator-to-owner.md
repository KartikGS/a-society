---

**Subject:** Tooling files — relocate to a-docs/tooling/ subfolder
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-18

---

## Trigger

Human-directed, via Owner brief (`02-owner-to-curator-brief.md`). The four tooling documentation files currently sitting loose at `a-docs/` root form a coherent operational category warranting a dedicated subfolder, consistent with how other operational areas are organized in `a-docs/`.

---

## What and Why

This is a structural reorganization within `a-docs/` only. The four tooling-related files will move from the `a-docs/` root into a new `a-docs/tooling/` subfolder, and a `main.md` orientation document will be created as the folder's entry point.

**Why the move is correct:** The pattern in `a-docs/` is that operational areas get their own subfolder — `workflow/`, `communication/`, `improvement/`, `records/`, `updates/` all follow this pattern. The four tooling files form a coherent operational category (component spec, implementation workflow, coupling governance, deviation assessment). Four files exceeds the three-file threshold.

**Why `a-docs/tooling/` and not elsewhere:** `project-information/` is the identity layer (what A-Society *is*). These files are operational specs (how to implement and maintain the tooling layer). They belong alongside `workflow/` and `improvement/` — not inside `project-information/`.

**Filename decision — drop the `tooling-` prefix.**

All other `a-docs/` subfolders do not repeat the folder name in their filenames: `workflow/main.md`, `communication/main.md`, `improvement/main.md`, `updates/protocol.md`, `updates/template.md`. Keeping the prefix would produce anomalous filenames like `tooling/tooling-architecture-proposal.md`. Since all references use `$VARIABLE_NAME` (not hardcoded filenames), renaming requires only index row updates — the same scope as the path change itself.

New filenames:
- `architecture-proposal.md` (was `tooling-architecture-proposal.md`)
- `architecture-addendum.md` (was `tooling-architecture-addendum.md`)
- `general-coupling-map.md` (was `tooling-general-coupling-map.md`) — "general" is retained as a meaningful descriptor: this is the map of couplings to `general/`
- `ta-assessment-phase1-2.md` (was `tooling-ta-assessment-phase1-2.md`)

**No update report triggered.** This change is entirely within `a-docs/` — no changes to `general/` or `agents/`.

---

## Where Observed

A-Society — internal. The four tooling files have accumulated at the `a-docs/` root without a containing subfolder, creating an inconsistency with every other multi-file operational area in `a-docs/`.

---

## Target Location

**New folder:** `a-society/a-docs/tooling/`

**New file:** `a-society/a-docs/tooling/main.md` — registered as `$A_SOCIETY_TOOLING`

**Moved files (with renamed paths):**
- `$A_SOCIETY_TOOLING_PROPOSAL` → `a-society/a-docs/tooling/architecture-proposal.md`
- `$A_SOCIETY_TOOLING_ADDENDUM` → `a-society/a-docs/tooling/architecture-addendum.md`
- `$A_SOCIETY_TOOLING_COUPLING_MAP` → `a-society/a-docs/tooling/general-coupling-map.md`
- `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2` → `a-society/a-docs/tooling/ta-assessment-phase1-2.md`

**Index updates required (`$A_SOCIETY_INDEX`):**
- Update path for `$A_SOCIETY_TOOLING_PROPOSAL`
- Update path for `$A_SOCIETY_TOOLING_ADDENDUM`
- Update path for `$A_SOCIETY_TOOLING_COUPLING_MAP`
- Update path for `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2`
- Add new row for `$A_SOCIETY_TOOLING`

**a-docs-guide updates required (`$A_SOCIETY_AGENT_DOCS_GUIDE`):**
- Update the "Tooling Documentation" section header (currently states files live at `a-docs/` root — no longer accurate)
- Add entry for `tooling/main.md`

---

## Draft Content

### `a-docs/tooling/main.md`

```
# A-Society: Tooling

This folder contains the design, specification, and operational reference documents for A-Society's programmatic tooling layer. These documents govern how the tooling components are specified, implemented, and kept in sync with the `general/` instruction library.

---

## Documents

### `architecture-proposal.md` — `$A_SOCIETY_TOOLING_PROPOSAL`

The definitive specification for all six tooling components: automation boundary evaluation, component interfaces and data flows, open questions resolved, and accepted implementation deviations from Phases 1–2. This is the Tooling Developer's primary authority for implementation decisions.

**Who reads it:** Tooling Developer (before and during implementation), Technical Architect (when reviewing deviations), Owner (at Phase 2 Coupling Test for tooling-adjacent `general/` changes).

---

### `architecture-addendum.md` — `$A_SOCIETY_TOOLING_ADDENDUM`

The implementation workflow: Phase 0 gate requirements, phase sequencing, role responsibilities per phase, deviation escalation path, and backward pass order for the tooling implementation flow. Read this alongside the proposal when routing work through the tooling implementation flow.

**Who reads it:** Tooling Developer, Technical Architect, Owner (when routing tooling work through phases).

---

### `general-coupling-map.md` — `$A_SOCIETY_TOOLING_COUPLING_MAP`

Standing reference for the coupling between tooling components and `general/` — the format dependency table (which `general/` elements each component parses) and the invocation gap table (whether a `general/` instruction directs agents to invoke each component).

**Who reads it:** Owner checks the format dependency table at Phase 2 (Coupling Test) before approving any `general/` proposal. Technical Architect checks the invocation gap column when reviewing tooling deviations. Curator updates it at Phase 4 (Registration) after any Type A–F change.

---

### `ta-assessment-phase1-2.md` — `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2`

The Technical Architect's formal rulings on two implementation deviations identified during Phases 1 and 2, including the required spec updates. Reference this when tracing why a component diverges from an implementation-neutral reading of the proposal.

**Who reads it:** Technical Architect or Tooling Developer when tracing the basis for post-Phase 2 spec revisions.
```

---

### a-docs-guide update (section to replace)

The current "Tooling Documentation" section header reads:

> These files live at the `a-docs/` root (not in a subfolder). They are the design, specification, assessment, and coupling governance artifacts for A-Society's programmatic tooling layer.

Replace with:

> These files live in `a-docs/tooling/`. They are the design, specification, assessment, and coupling governance artifacts for A-Society's programmatic tooling layer.

And add the following entry before the existing four entries:

```
### `tooling/main.md` — `$A_SOCIETY_TOOLING`

**Why it exists:** The tooling folder contains four related documents — component spec, implementation workflow, coupling map, and TA deviation assessment — that together govern A-Society's programmatic tooling layer. Without an entry point, agents must open all four documents to determine which is relevant to their task. The main.md lists each document, its purpose, and who reads it.

**What it owns:** Orientation to the tooling subfolder — one-paragraph description of each document and its intended reader(s).

**What breaks without it:** The tooling folder has no navigable entry point. Agents must scan all four documents to understand which to consult.

**Do not consolidate with:** Any of the four tooling documents — each answers a distinct question (what to build, how to build it, format dependencies, deviation rulings). The main.md is an orientation layer, not a summary of those documents.
```

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
