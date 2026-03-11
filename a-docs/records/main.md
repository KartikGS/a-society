# A-Society: Records Convention

This document declares A-Society's records structure — the naming convention, artifact sequence, and placement rules for flow-level artifact tracking.

See `$INSTRUCTION_RECORDS` for the general pattern this instantiates.

---

## Identifier Format

`YYYYMMDD-slug`

- `YYYYMMDD` — the date the flow begins (when the Owner writes the briefing)
- `slug` — a short, descriptive kebab-case label for the flow (e.g., `records-infrastructure`, `role-minimum-set`)

If two flows begin on the same calendar date: append a disambiguating suffix to the slug (e.g., `20260308-records-infrastructure`, `20260308-tooling-update`).

The identifier is assigned when the Owner creates the record folder. It does not change after creation.

---

## Artifact Sequence

Within each record folder, artifacts are named with a zero-padded two-digit sequence prefix:

| Position | Artifact | Produced By | Trigger |
|---|---|---|---|
| `01-` | `owner-to-curator-brief.md` | Owner | Human/Owner align on a change |
| `02-` | `curator-to-owner.md` | Curator | Proposal drafted |
| `03-` | `owner-to-curator.md` | Owner | Review decision issued |
| `04-` | `curator-findings.md` | Curator | Backward pass (Phase 5) |
| `05-` | `owner-findings.md` | Owner | Backward pass (Phase 5) |

If the Owner issues a Revise decision, the Curator resubmits at the next available position (e.g., `04-curator-to-owner.md`), the Owner re-decides at `05-owner-to-curator.md`, and backward pass findings shift to `06-` and `07-`. The sequence continues as long as the flow requires.

If a flow includes an additional Curator → Owner submission after the main decision artifact — for example, an update report draft submitted after implementation is complete — that submission takes the next available sequence slot **before** backward-pass findings. Backward-pass findings always occupy the final positions in the sequence. Example: main flow closes at `03-owner-to-curator.md`; update report submission takes `04-curator-to-owner.md` and Owner decision takes `05-owner-to-curator.md`; backward-pass findings then start at `06-`. Before filing findings, confirm that all submissions in this flow are resolved — meaning the Owner has responded to every Curator → Owner artifact that followed the main decision.

---

## What Belongs in a Record

- All conversation artifacts for this flow (briefing, proposal, decision, revisions)
- Backward pass findings from all participating roles

Not in a record:
- Templates — these remain in `$A_SOCIETY_COMM_CONVERSATION`
- Implementation work product — files created or modified during Phase 3 live at their own locations

---

## Creating a Record Folder

The Owner creates the record folder when writing the briefing:

1. Name the folder: `YYYYMMDD-slug`
2. Create `01-owner-to-curator-brief.md` from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`
3. Point the Curator at `01-owner-to-curator-brief.md`

Each subsequent artifact is created at the next available sequence position by the role responsible for it.
