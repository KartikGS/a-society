# Owner → Curator: Briefing

**Subject:** Records infrastructure — flow-level artifact tracking
**Status:** BRIEFED
**Date:** 2026-03-08

---

## Agreed Change

The framework currently has no structural mechanism for tracking all artifacts produced during a single workflow traversal (forward pass + backward pass). Conversation artifacts live as "live files" that get overwritten between flows. Backward pass findings land in `improvement/reports/` with a `<task-id>` field that is referenced but never defined anywhere in the workflow. There is no single place where an agent (or human) can look at one flow and see: briefing, proposal, decision, findings — all tied together.

The agreed change introduces **records** — a folder-per-flow structure under `a-docs/records/` that contains all artifacts for a single workflow traversal, sequenced chronologically. This resolves both the tracking gap and the orphan `<task-id>` problem (the record folder name *is* the identifier).

The conversation layer changes accordingly: conversation artifacts are no longer created as live files that get overwritten. Instead, they are created directly in the record folder for the active flow. The `communication/conversation/` folder becomes template-only (templates + `main.md`).

Backward pass findings also move into the record folder, which means `improvement/reports/` is retired entirely.

---

## Scope

**In scope:**

### General layer (design first — these are project-agnostic patterns)

1. **New instruction:** `general/instructions/records/main.md` — how to create a records structure for any project. Covers: what records are, folder structure (`a-docs/records/[identifier]/`), that projects define their own identifier convention, sequencing rules for artifacts within a record folder, what goes in a record (conversation artifacts + findings), and how records integrate with the workflow and improvement protocol.

2. **Update:** `general/instructions/communication/conversation/main.md` — the "live artifact" model changes. The conversation folder becomes template-only. Artifacts are created directly in record folders. The live artifact lifecycle section, pre-replacement check section, and naming conventions must reflect this. Templates remain in `communication/conversation/`.

3. **Update:** `general/improvement/protocol.md` — findings output location changes from `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md` to the record folder for the active flow, with sequenced naming.

4. **Update:** `general/instructions/improvement/main.md` — the `reports/` sub-folder description changes. The reports folder is no longer the home for backward pass findings (they live in records). The three-component model (`main.md`, `protocol.md`, `reports/`) becomes a two-component model (`main.md`, `protocol.md`). Alternatively, `reports/` can be redefined as optional for non-flow-specific improvement artifacts — Curator should decide what is cleanest.

### A-Society layer (instantiation)

5. **New:** `a-docs/records/main.md` — A-Society's records convention. Identifier format: `YYYYMMDD-slug` (date-based). Sequencing: `NN-` prefix (zero-padded). Which artifacts go in a record (briefing, proposal, decision, curator findings, owner findings).

6. **Update:** `a-docs/workflow/main.md` — reference `$A_SOCIETY_RECORDS` for artifact tracking. Phase descriptions should reference record folders as the destination for handoff artifacts rather than the conversation live files.

7. **Update:** `a-docs/improvement/protocol.md` — findings output location changes from `$A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-<role>-findings.md` to the record folder (`$A_SOCIETY_RECORDS/[identifier]/NN-<role>-findings.md`).

8. **Retire:** `a-docs/improvement/reports/` — delete the entire folder (including `main.md` and `META-20260307-initializer-test-run-lightweight.md`). Findings now live in records.

9. **Update:** `a-docs/improvement/main.md` — remove references to the reports folder. The three-component description becomes two components.

10. **Update:** `a-docs/communication/conversation/main.md` — becomes template-only reference. Remove live artifact entries from the artifact table. Update lifecycle description.

11. **Delete:** live conversation artifacts from `a-docs/communication/conversation/`:
    - `owner-to-curator-brief.md`
    - `curator-to-owner.md`
    - `owner-to-curator.md`
    - `DRAFT-graph-model-2026-03-07.md`

12. **Update:** `$A_SOCIETY_INDEX` — add `$A_SOCIETY_RECORDS`, remove `$A_SOCIETY_IMPROVEMENT_REPORTS`, remove live conversation artifact variables (`$A_SOCIETY_COMM_BRIEF`, `$A_SOCIETY_COMM_CURATOR_TO_OWNER`, `$A_SOCIETY_COMM_OWNER_TO_CURATOR`), update any paths that have changed.

13. **Update:** `$A_SOCIETY_AGENT_DOCS_GUIDE` — add rationale entry for `records/`.

14. **Update:** `$A_SOCIETY_PUBLIC_INDEX` (`a-society/index.md`) — add `$INSTRUCTION_RECORDS` if the general instruction warrants public registration.

**Out of scope:**
- Changes to `general/improvement/main.md` (the ready-made philosophy template) — it does not reference reports locations.
- Changes to `general/improvement/reports/main.md` (the ready-made reports index template) — this is a separate decision about whether the general template should be retired or kept as optional. The Curator may flag this but should not act on it in this flow without Owner agreement.
- Changes to `general/instructions/workflow/main.md` — the workflow instruction already says "Historical records — completed work artifacts live alongside the workflow, not inside it." The records instruction is a new peer document, not a modification to the workflow instruction.
- Retroactive migration of existing historical artifacts — no existing artifacts are moved into records. History before this flow is not tracked in the new model.

---

## Likely Target

- `general/instructions/records/main.md` — new file (namespace parity with `a-docs/records/main.md`)
- `general/instructions/communication/conversation/main.md` — update
- `general/improvement/protocol.md` — update
- `general/instructions/improvement/main.md` — update
- `a-docs/records/main.md` — new file
- `a-docs/workflow/main.md` — update
- `a-docs/improvement/protocol.md` — update
- `a-docs/improvement/main.md` — update
- `a-docs/communication/conversation/main.md` — update
- `$A_SOCIETY_INDEX` — update
- `$A_SOCIETY_AGENT_DOCS_GUIDE` — update

---

## Open Questions for the Curator

1. **General template for `improvement/reports/`** — the ready-made template at `general/improvement/reports/main.md` currently exists as something adopting projects copy. With records as the new home for findings, should this template be updated to say "findings live in records," or should it be retired, or should it remain as an optional structure for projects that don't use records? Research the cleanest approach and propose.

2. **Sequencing convention** — should the general instruction prescribe zero-padded two-digit numbering (`01-`, `02-`), or leave the numbering format to projects? My instinct says prescribe it (it's a portability convenience), but the Curator should verify this doesn't create a domain-specific assumption.

3. **Cross-references in conversation templates** — the TEMPLATE files currently say "Fill `owner-to-curator-brief.md` (the live artifact) from this template." These instructions need updating to reference the record folder. The Curator should update the template instructions to say artifacts are created from the template into the active record folder.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Records infrastructure — flow-level artifact tracking."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
