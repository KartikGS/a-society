---
**Subject:** Workflow mechanics corrections bundle — four systemic fixes
**Status:** BRIEFED
**Date:** 2026-03-21

> **Pre-send check (Variables):** All `$VAR` references below are registered in `$A_SOCIETY_INDEX`. No unregistered variables used.

> **Count verify:** Four numbered items in Agreed Change. Subject line states four. Confirmed.

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$A_SOCIETY_CURATOR_ROLE` | modify |
| `$A_SOCIETY_OWNER_ROLE` | modify |
| `$A_SOCIETY_IMPROVEMENT` | modify |
| `$GENERAL_IMPROVEMENT` | modify |
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | modify |
| `$A_SOCIETY_RECORDS` | modify |
| `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` | modify (conditional — see Item 4 and Open Questions) |

---

**Item 1 — Log update timing** `[MAINT]` `[Curator authority — implement directly]`

The project log is currently split between two roles: the Curator owns lifecycle sections (Current State, Recent Focus, Previous, Archive) and the Owner owns Next Priorities. Human feedback identified this as a mechanics error — the Owner closes the forward pass; the log entry that records the closed flow belongs at that same moment, under the same authority.

**Change:** Transfer full log write authority to the Owner. The Owner writes all log sections (Current State, Recent Focus, Previous, Archive, and Next Priorities) at Forward Pass Closure. The Curator no longer writes to any log section.

Specific edits:

- **`$A_SOCIETY_CURATOR_ROLE`** `[replace target bullet]`: Remove the "Project log lifecycle sections" bullet from the Authority & Responsibilities "owns" list. The bullet to remove: *"Project log lifecycle sections: Curator writes and maintains the Current State, Recent Focus, Previous, and Archive sections of `$A_SOCIETY_LOG` when a flow closes."*

- **`$A_SOCIETY_OWNER_ROLE`** `[replace target bullet]`: Replace the current Next Priorities bullet in Authority & Responsibilities ("The Next Priorities section of `$A_SOCIETY_LOG` — adding new items surfaced from backward pass findings and removing items when their flows close") with a full-log authority bullet: *"The project log `$A_SOCIETY_LOG` — all sections (Current State, Recent Focus, Previous, Archive, and Next Priorities). The log entry recording a closed flow is written by the Owner at Forward Pass Closure. Next Priorities items are added when surfaced from backward pass findings and removed when their flows close."*

- **`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 5** `[insert into existing Work item list]`: Add to the Owner's work in Phase 5 — *"Update `$A_SOCIETY_LOG`: add the completed flow's entry across all relevant lifecycle sections (Current State, Recent Focus, Previous, Archive). Update Next Priorities as appropriate."*

---

**Item 2 — Curator synthesis routing simplification** `[MAINT]` `[Curator authority — implement directly]`

The current synthesis model has two paths: (a) Curator-authority items → implement directly; (b) Owner-judgment items → submit to Owner for approval, implement after approval. Human feedback identified this as unnecessarily complex. The mid-synthesis approval loop is friction. The correct simplification is structural: the boundary is `a-docs/` vs. everything else.

**Change:** Replace the two-path synthesis routing with a simple structural rule. Within `a-docs/`: implement directly. Outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create a Next Priorities entry — do not submit to the Owner for approval during synthesis.

Specific edits:

- **`$A_SOCIETY_IMPROVEMENT` How It Works, step 5** `[replace]`: Replace the current two-bullet routing block with:

  *"Routes actionable items based on structural scope:*
  - *Changes within `a-docs/`: implement directly. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets. If the change is within `a-docs/`, make it now — never queue it.*
  - *Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create a Next Priorities entry in `$A_SOCIETY_LOG`. The Owner routes these as new flows.*
  *Do not re-route improvement items through the project's main execution workflow."*

- **`$A_SOCIETY_CURATOR_ROLE`** `[insert after "Never queue synthesis-authority items" hard rule]`: Add a companion rule covering the non-a-docs path: *"Synthesis items outside `a-docs/` go to Next Priorities — not to the Owner for approval. When synthesis surfaces an item that cannot be implemented directly within `a-docs/` (e.g., an addition to `general/` or a structural decision), create a Next Priorities entry in `$A_SOCIETY_LOG`. Do not initiate an Owner approval loop from within a backward pass."*

---

**Item 3 — Backward pass tool mandate strengthening** `[LIB]` `[Requires Owner approval]` for `$GENERAL_IMPROVEMENT`; `[MAINT]` `[Curator authority — implement directly]` for `$A_SOCIETY_IMPROVEMENT`

Both improvement documents state that when a Backward Pass Orderer tool is available, it should be invoked. Neither document prohibits manual computation as a fallback. Human feedback establishes that when the tool is available, manual computation is not an alternative — the tool is mandatory. This prohibition needs to be explicit.

Specific edits:

- **`$A_SOCIETY_IMPROVEMENT` Component 4 mandate section** `[insert after existing "When Component 4 is available, invoke it" sentence]`: Add: *"When Component 4 is available, manual backward pass ordering is not permitted. Manual computation is reserved for cases where Component 4 cannot be invoked (bootstrapping exemption, unavailability). If Component 4 is available, use it — regardless of how straightforward the flow appears."*

- **`$GENERAL_IMPROVEMENT` Backward Pass Traversal / Tooling paragraph** `[insert after existing "invoke it for every flow" sentence]`: Add: *"When a Backward Pass Orderer tool is available, manual traversal computation is not permitted. Manual ordering is reserved for projects where no such tool exists or for bootstrapping cases where the tool cannot be invoked. When the tool is available, use it — do not apply the manual traversal rules above as an alternative."*

---

**Item 4 — Update report workflow integration** `[MAINT]` `[Curator authority — implement directly]`

The current model produces the update report as a separate Phase 4 artifact: the Curator implements, registers, then drafts the update report as a post-registration submission requiring another Owner review round before publishing. Human feedback identifies this as an unnecessary extra cycle. The update report covers the same changes already approved by the Owner in Phase 2. It should be drafted in Phase 1 (as part of the proposal), reviewed in Phase 2 (as part of the decision), and published in Phase 3 (during implementation) — not sequenced as a separate back-and-forth after registration.

**Change:** Integrate update report drafting and publication into the proposal/implementation cycle. All forward work — including report publication — is complete before backward pass work begins.

Specific edits:

- **`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 1** `[insert at end of Work section]`: Add: *"When the proposed change is likely to qualify for a framework update report (see `$A_SOCIETY_UPDATES_PROTOCOL`), include the update report draft as a named section in the proposal submission. The Owner reviews and approves the draft as part of the Phase 2 decision."*

- **`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 2** `[insert at end of Work section]`: Add: *"If a framework update report draft was included in the Phase 1 proposal, review it as part of this decision. The Phase 2 decision artifact covers both the content change and the update report draft — they are not reviewed separately."*

- **`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 3** `[insert into Work section]`: Add: *"If a framework update report was approved in Phase 2, publish it to `$A_SOCIETY_UPDATES_DIR` as part of implementation — before registration."*

- **`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 4** `[replace target sentence]`: Remove the update report drafting and submission step from Phase 4. Replace: *"if the registered changes qualify for a framework update report (see `$A_SOCIETY_UPDATES_PROTOCOL`), the Curator drafts the report and submits it to the Owner for review before publishing to `$A_SOCIETY_UPDATES_DIR`"* with: *"If a framework update report was approved in Phase 2, confirm it was published during Phase 3. No separate update report submission is needed."*

- **`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Session Model, Step 4** `[replace target sentence about update-report draft]`: Replace *"The Curator implements, registers, and drafts any required update-report submission in the active record folder."* with *"The Curator implements (including publishing any update report approved in Phase 2) and registers."* Remove the phrase *"and any update-report draft awaiting review"* from the handoff instruction at the end of Step 4.

- **`$A_SOCIETY_CURATOR_ROLE` Authority & Responsibilities** `[replace target bullet]`: Replace the Framework update reports bullet — *"Framework update reports: drafting outbound reports when `general/` or `agents/` changes qualify (per `$A_SOCIETY_UPDATES_PROTOCOL`), submitting to the Owner for approval, and publishing to `a-society/updates/` once approved"* — with: *"Framework update reports: when a proposed change is likely to qualify (per `$A_SOCIETY_UPDATES_PROTOCOL`), draft the report as part of the Phase 1 proposal; the Owner approves it in Phase 2 alongside the content change; publish to `$A_SOCIETY_UPDATES_DIR` during Phase 3 implementation."*

- **`$A_SOCIETY_RECORDS` Artifact Sequence section** `[replace target paragraph and example]`: Remove or update the paragraph and example that describe the update report as a post-implementation submission with its own sequence slots (`05-curator-update-report.md`, `06-owner-update-report.md`). The example: *"Main flow closes at `04-owner-to-curator.md`; update report submission takes `05-curator-update-report.md` and Owner decision takes `06-owner-update-report.md`; backward-pass findings then start at `07-`."* should be removed. The preceding paragraph *"If a flow includes an additional Curator → Owner submission after the main decision artifact — for example, an update report draft submitted after implementation is complete — that submission takes the next available sequence slot before backward-pass findings."* should have the update report example removed (the general rule about post-decision submissions may remain if it serves other cases; assess during proposal formulation).

- **`$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`** — see Open Questions.

---

> **Responsibility transfer note (Item 1):** The following instruction currently names the Curator as responsible for log lifecycle sections. The transfer to Owner must be confirmed resolved in both locations:
> - `$A_SOCIETY_CURATOR_ROLE` — Authority & Responsibilities "Project log lifecycle sections" bullet (in-scope above)
> - `$A_SOCIETY_OWNER_ROLE` — "The Next Priorities section of `$A_SOCIETY_LOG`" bullet (in-scope above)
>
> Cross-layer check: `$GENERAL_OWNER_ROLE` does not mention log sections (the CUSTOMIZE placeholder covers project-specific owned artifacts). No change needed in the general template for Item 1.

---

## Scope

**In scope:**
- All four items from the Next Priorities entry for this bundle
- Cross-layer consistency checks per the Curator's Standing Checks obligation — if changes to `$A_SOCIETY_IMPROVEMENT` reveal corresponding drift in `$GENERAL_IMPROVEMENT` beyond Item 3's named change, flag it but do not implement out-of-scope drift
- The `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` update report field question (assess and propose a resolution — see Open Questions)

**Out of scope:**
- Changes to `$A_SOCIETY_WORKFLOW_TOOLING_DEV` — this brief is scoped to Framework Development workflow only
- Changes to `$GENERAL_CURATOR_ROLE` — the general template does not name update report steps or log sections; no change needed
- Changes to `$A_SOCIETY_UPDATES_PROTOCOL`, `$A_SOCIETY_UPDATES_TEMPLATE`, or the update report template — the protocol and template themselves are not changing; only the workflow timing is

---

## Likely Target

| Item | Primary targets |
|---|---|
| Item 1 — Log update timing | `$A_SOCIETY_CURATOR_ROLE`, `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` |
| Item 2 — Synthesis routing | `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_CURATOR_ROLE` |
| Item 3 — Tool mandate | `$A_SOCIETY_IMPROVEMENT`, `$GENERAL_IMPROVEMENT` |
| Item 4 — Update report workflow | `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, `$A_SOCIETY_CURATOR_ROLE`, `$A_SOCIETY_RECORDS`, `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` (conditional) |

All paths resolvable via `$A_SOCIETY_INDEX`. Placement is binding: verify against `$A_SOCIETY_STRUCTURE` if any doubt arises.

---

## Open Questions for the Curator

1. **Item 2 — Synthesis routing and `$GENERAL_IMPROVEMENT`**: The general improvement doc still has the "submit to Owner for approval" path for synthesis items requiring Owner judgment (step 5, How It Works). Item 2 is scoped to `$A_SOCIETY_IMPROVEMENT` only. Assess during proposal formulation: does the two-path simplification (a-docs → implement directly; outside a-docs → Next Priorities) generalize to all projects, or is it A-Society-specific? If it generalizes, propose the domain-agnostic formulation as a `[LIB]` change in the same proposal. If not, document why the general doc should retain the current model.

2. **Item 4 — `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`**: Item 4 requires the update report draft to appear in the Phase 1 proposal submission. Assess whether `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` needs a new named section for the update report draft (structural template change), or whether a workflow instruction in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 1 is sufficient (non-structural). Include your recommendation in the proposal. If a template section is warranted, draft the proposed section content for Owner review — this is an output-format change and requires Owner approval.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for workflow mechanics corrections bundle — four systemic fixes."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
