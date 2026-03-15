**Subject:** Framework update report — tooling completion (v9.0 → v10.0)
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-15

---

## Trigger

Tooling implementation flow (Phases 0–7) is complete. Per `$A_SOCIETY_UPDATES_PROTOCOL`, the Curator assesses whether changes to `general/` or `agents/` require an update report. Two qualifying changes were identified.

---

## What and Why

Two changes from the tooling implementation flow affect adopting projects:

**Change 1 — Communication templates (Breaking):** Three new files added to `general/communication/conversation/` — the canonical conversation templates. Previously these existed only in A-Society's own `a-docs/`; adopting projects had no distributable copies. The manifest now marks them as required for all initialized projects, making any project without them incomplete. Breaking classification applies: additive change making existing instantiations incomplete.

**Change 2 — Workflow graph instruction (Recommended):** New `general/instructions/workflow/graph.md` teaches how to add machine-readable YAML frontmatter to `workflow/main.md`. Projects that use Tooling Components 3 or 4 need this to function. Projects that do not use those components are unaffected. Recommended classification applies: improvement worth adopting for some projects; absence doesn't break anything.

**Not included (does not trigger report):**
- `general/manifest.yaml` — tooling infrastructure; adopting projects don't create manifests
- All `a-docs/` changes — A-Society-internal; not distributed to adopting projects
- The `tooling/` layer itself — A-Society's own programmatic tools; not distributed

---

## Where Observed

A-Society — internal. The qualifying changes were identified during Phase 7 Registration assessment against `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Target Location

`a-society/updates/2026-03-15-communication-templates-and-workflow-graph.md`

---

## Draft Content

Full draft in `01-update-report-draft.md` in this record folder.

---

## Implementation Status

**Implementation complete:** Yes. Both changes are already implemented:
- `general/communication/conversation/TEMPLATE-*.md` — three files created (Track A of this phase)
- `general/instructions/workflow/graph.md` — created in Phase 3 (registered as `$INSTRUCTION_WORKFLOW_GRAPH`)

**Files changed:**
- `general/communication/conversation/TEMPLATE-owner-to-curator-brief.md` (new)
- `general/communication/conversation/TEMPLATE-curator-to-owner.md` (new)
- `general/communication/conversation/TEMPLATE-owner-to-curator.md` (new)
- `general/instructions/workflow/graph.md` (new, Phase 3)
- `$A_SOCIETY_PUBLIC_INDEX` — registered `$INSTRUCTION_WORKFLOW_GRAPH` (Phase 3) and tooling components (Track A)
- `$A_SOCIETY_WORKFLOW` — YAML frontmatter prepended (Phase 3)
- `$GENERAL_MANIFEST` — three source_path entries corrected from `general/instructions/` to `general/communication/` (manifest drift fix)

**Publication condition outstanding:** Yes. Version increment (`$A_SOCIETY_VERSION` v9.0 → v10.0) and report placement (`a-society/updates/`) are pending Owner approval of this submission.

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any revisions to report content or version increment
- **REVISE** — with specific changes required before publication
- **REJECTED** — with rationale

The Curator does not publish or increment the version until `03-owner-to-curator.md` shows APPROVED status.
