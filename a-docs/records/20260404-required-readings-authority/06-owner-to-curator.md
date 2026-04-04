# Owner → Curator: Decision

**Subject:** Required readings authority restructure — required-readings.yaml + context injection cleanup
**Status:** APPROVED
**Date:** 2026-04-04
**Record:** `a-society/a-docs/records/20260404-required-readings-authority/`

---

## Decision

**APPROVED.** Proceed to implementation.

All five review tests pass. Coupling test passes with one Phase 4 obligation (see below). Manifest check is already scoped in the proposal.

---

## Approval Rationale

The proposal correctly scopes the full transition: new `$INSTRUCTION_REQUIRED_READINGS` at `general/instructions/roles/required-readings.md`, removal of vestigial frontmatter and prose from all three general/ role templates, corrected scoping of `$INSTRUCTION_AGENTS` and `$INSTRUCTION_ROLES` (removal, not preservation-with-warning), manifest update, update report draft, and all direct-authority a-docs items.

Placement of the new instruction at `a-society/general/instructions/roles/required-readings.md` is approved — the namespace parity exception applies: the project artifact lives at `a-docs/roles/required-readings.yaml` and the instruction mirrors that path.

The update report classification is correct: Breaking (new mandatory artifact type added to `general/` that initialized projects do not yet have) + Recommended (documentation cleanup). Version increment: v29.0 → v30.0.

---

## Required Corrections During Implementation

**1. Update report migration guidance item 4** — Replace "Update the project log and version record" with "Update your project's version record (`a-docs/a-society-version.md`) to record that this update has been applied." The project log is A-Society's internal artifact; the migration guidance must be addressed to the adopting project's Curator.

---

## Required Phase 4 Steps (Curator)

Standard Phase 4 checklist applies. Additionally:

**Coupling map update (Type A)** — The new `a-docs/roles/required-readings.yaml` schema is a new `[a-docs]` format dependency on the runtime (same pattern as the `improvement.ts` row in the coupling map). Add a new row to `$A_SOCIETY_TOOLING_COUPLING_MAP`:

| `general/` or `[a-docs]` element | Format dependency | Component that depends on it |
|---|---|---|
| `a-docs/roles/required-readings.yaml` format `[a-docs]`: `universal` list (sequence of `$VAR` strings); `roles` map keyed by lowercase hyphenated role identifier, each value a sequence of `$VAR` strings | Yes | `runtime/src/registry.ts` (centralized required-reading resolution) |

This is a Type A update. The runtime side is already implemented (04b complete). The coupling map row is the outstanding documentation obligation.

**Index registration** — Register `$A_SOCIETY_REQUIRED_READINGS` (pointing to `a-society/a-docs/roles/required-readings.yaml`) in `$A_SOCIETY_INDEX`, and `$INSTRUCTION_REQUIRED_READINGS` (pointing to `a-society/general/instructions/roles/required-readings.md`) in both `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX`.

**a-docs-guide** — Add rationale entry for `a-society/a-docs/roles/required-readings.yaml`.

**Version and update report** — Publish update report to `a-society/updates/2026-04-04-required-readings-authority.md`. Bump version v29.0 → v30.0 in `$A_SOCIETY_VERSION` (both the header field and a new History table row). These two writes are a single atomic registration step.

---

## Out of Scope Reminder

Runtime implementation is complete (04b). Do not re-implement or modify runtime behavior during the Curator pass. The Curator's scope is: general/ instruction, general/ role templates, manifest, a-docs cleanup (role files, agents.md, required-readings.yaml instance), index registration, coupling map row, a-docs-guide, Initializer update, and update report publication.

---

Next action: Implement all approved items and file completion artifact.
Read: `a-society/a-docs/records/20260404-required-readings-authority/06-owner-to-curator.md`
Expected response: `07-curator-to-owner.md` in the same record folder — Phase 4 exit checklist confirmed, all items enumerated.
