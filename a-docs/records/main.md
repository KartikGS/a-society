# A-Society: Records Convention

This document declares A-Society's records structure — the naming convention, artifact sequence, and placement rules for flow-level artifact tracking.

See `$INSTRUCTION_RECORDS` for the general pattern this instantiates.

---

## Identifier Format

`YYYYMMDD-slug`

- `YYYYMMDD` — the date the flow begins (when the Owner creates the record folder at intake)
- `slug` — a short, descriptive kebab-case label for the flow (e.g., `records-infrastructure`, `role-minimum-set`)

If two flows begin on the same calendar date: append a disambiguating suffix to the slug (e.g., `20260308-records-infrastructure`, `20260308-tooling-update`).

The identifier is assigned when the Owner creates the record folder. It does not change after creation.

---

## Artifact Sequence

Within each record folder, artifacts are named with a zero-padded two-digit sequence prefix:

| Position | Artifact | Produced By | Trigger |
|---|---|---|---|
| `01-` | `owner-workflow-plan.md` | Owner | Flow intake — Phase 0 gate; all tiers |
| `02-` | `owner-to-curator-brief.md` | Owner | Tier 2/3: plan exists; brief follows |
| `03-` | `curator-to-owner.md` | Curator | Proposal drafted |
| `04-` | `owner-to-curator.md` | Owner | Review decision issued |
| `05-` | `curator-findings.md` | Curator | Backward pass (Phase 5) |
| `06-` | `owner-findings.md` | Owner | Backward pass (Phase 5) |

**Tier 1 flows** use a shortened sequence: `01-owner-workflow-plan.md` (Phase 0 gate) followed by `02-owner-backward-pass.md` (findings). No brief, proposal, or decision artifacts are produced.

If the Owner issues a Revise decision, the Curator resubmits at the next available position (e.g., `05-curator-to-owner.md`), the Owner re-decides at `06-owner-to-curator.md`, and backward pass findings shift to `07-` and `08-`. The sequence continues as long as the flow requires.

If a flow includes an additional Curator → Owner submission after the main decision artifact — for example, an update report draft submitted after implementation is complete — that submission takes the next available sequence slot **before** backward-pass findings. Backward-pass findings always occupy the final positions in the sequence.

**Naming convention for non-standard slots:** Use `NN-[role]-[descriptor].md`, where `[descriptor]` names the artifact type (e.g., `curator-update-report.md`, `owner-update-report.md`). Do not reuse the standard `[role]-to-[role].md` form for non-standard submissions.

**Owner decision naming distinction:** Use `NN-owner-decision.md` when the Owner is recording a decision and the previously active role has no subsequent action in this flow. Use `NN-owner-to-[role].md` only when the named role has a next action in the flow. Mislabeling a terminal Owner decision as an active handoff creates ambiguity about whether the named role still has pending work in this flow.

**Example:** Main flow closes at `04-owner-to-curator.md`; update report submission takes `05-curator-update-report.md` and Owner decision takes `06-owner-update-report.md`; backward-pass findings then start at `07-`.

**Prerequisite before filing findings:** Confirm all submissions in this flow are resolved — meaning the Owner has responded to every Curator → Owner artifact produced after the main decision. Do not begin backward-pass findings until this check passes.

---

## What Belongs in a Record

- All conversation artifacts for this flow (briefing, proposal, decision, revisions)
- Backward pass findings from all participating roles

Not in a record:
- Templates — these remain in `$A_SOCIETY_COMM_CONVERSATION`
- Implementation work product — files created or modified during Phase 3 live at their own locations

---

## Creating a Record Folder

The Owner creates the record folder at flow intake:

1. Name the folder: `YYYYMMDD-slug`
2. Create `01-owner-workflow-plan.md` from `$A_SOCIETY_COMM_TEMPLATE_PLAN` — this is the Phase 0 gate; it must exist before any other artifact in the folder
3. **Tier 2/3 only:** Create `02-owner-to-curator-brief.md` from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`
4. **Tier 2/3 only:** Point the Curator at `02-owner-to-curator-brief.md`

Each subsequent artifact is created at the next available sequence position by the role responsible for it.
