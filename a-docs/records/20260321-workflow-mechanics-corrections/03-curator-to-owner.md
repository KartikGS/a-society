---
**Subject:** Workflow mechanics corrections bundle — four systemic fixes
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-21

---

## Trigger

Human feedback identified four systemic mechanics errors in the A-Society framework: incorrect log write authority split, an unnecessarily complex mid-synthesis approval loop, an underspecified tool mandate for backward pass ordering, and an extra review cycle for update reports that should be collapsed into the main proposal/decision cycle. All four were scoped by the Owner in the brief (`02-owner-to-curator-brief.md`).

---

## Where Observed

A-Society — internal. All four issues observed during operational use of the A-Society framework development workflow.

---

## Open Question Resolutions

### Open Question 1 — Item 2: Does the synthesis routing simplification generalize to `$GENERAL_IMPROVEMENT`?

**Recommendation: Yes, it generalizes. Proposing a `[LIB]` change.**

The structural rule — implement directly within `a-docs/`; queue as a new flow entry for everything outside `a-docs/` — holds for any project using this framework. Every such project has an `a-docs/` folder. The synthesis role's authority in any project is bounded by what is within that project's documentation layer. The key insight (do not initiate an Owner approval loop from within the backward pass) is universally valid.

The only adaptation needed for the general doc is replacing the A-Society-specific "create a Next Priorities entry in `$A_SOCIETY_LOG`" with "create an entry for a future flow using the project's tracking mechanism." The structural principle is identical.

The current `$GENERAL_IMPROVEMENT` step 5 text ("Changes requiring Owner judgment: submit to the Owner for approval; implement after approval") creates the same problematic mid-synthesis approval loop in any project that instantiates it. Generalizing the fix propagates the improvement to all adopters.

**Proposed domain-agnostic formulation:** See Item 2 draft content below.

---

### Open Question 2 — Item 4: Does `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` need a new named section for the update report draft?

**Recommendation: Yes, a template section is warranted.**

A workflow instruction in Phase 1 alone is insufficient — it would leave ambiguity about where in the proposal the update report draft appears, forcing the Owner to scan for it rather than finding it at a known location. A named section makes the update report draft a first-class element of the proposal, structurally separable from the content change itself.

Additionally, under the new model, "Update Report Submission" is no longer a distinct artifact type — reports are embedded in proposals, not submitted separately post-implementation. The template's existing `Type: Update Report Submission` value and the `Implementation Status` section (which was "Update Report Submissions only") become vestigial and should be removed.

**Proposed template changes:** See Item 4 draft content below.

---

## What and Why / Target Location / Draft Content

---

### Item 1 — Log update timing `[MAINT]`

**What:** Transfer full log write authority to the Owner. The Curator no longer writes to any log section.

**Why:** The Owner closes the forward pass; the log entry recording that closure belongs at that same moment, under the same authority. Splitting log sections between roles creates a handoff gap with no structural justification.

---

#### 1a. `$A_SOCIETY_CURATOR_ROLE` — Authority & Responsibilities

**Action:** Remove the "Project log lifecycle sections" bullet from the "owns" list.

**Remove this bullet:**
> Project log lifecycle sections: Curator writes and maintains the Current State, Recent Focus, Previous, and Archive sections of `$A_SOCIETY_LOG` when a flow closes.

---

#### 1b. `$A_SOCIETY_OWNER_ROLE` — Authority & Responsibilities

**Action:** Replace the current Next Priorities bullet with a full-log authority bullet.

**Current:**
> The Next Priorities section of `$A_SOCIETY_LOG` — adding new items surfaced from backward pass findings and removing items when their flows close

**Replace with:**
> The project log `$A_SOCIETY_LOG` — all sections (Current State, Recent Focus, Previous, Archive, and Next Priorities). The log entry recording a closed flow is written by the Owner at Forward Pass Closure. Next Priorities items are added when surfaced from backward pass findings and removed when their flows close.

---

#### 1c. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Phase 5 Work

**Action:** Insert into Phase 5 Work section (after existing sentences, before "Acknowledge closure").

**Insert:**
> Update `$A_SOCIETY_LOG`: add the completed flow's entry across all relevant lifecycle sections (Current State, Recent Focus, Previous, Archive). Update Next Priorities as appropriate.

*Note: Phase 5 Work also requires a cleanup under Item 4 — see 4e below. Both changes to Phase 5 Work are presented together there.*

---

### Item 2 — Curator synthesis routing simplification `[MAINT]` (a-docs); `[LIB]` (`$GENERAL_IMPROVEMENT`)

**What:** Replace the two-path synthesis routing model with a structural rule based on `a-docs/` boundary. Within `a-docs/`: implement directly. Outside `a-docs/`: queue as a new flow — do not submit to Owner for approval during synthesis.

**Why:** The mid-synthesis approval loop is friction with no structural justification. The correct boundary is placement, not authority judgment: the synthesis role can implement anything within the project's documentation layer; everything else becomes a new flow.

---

#### 2a. `$A_SOCIETY_IMPROVEMENT` — How It Works, step 5

**Action:** Replace the current two-bullet routing block.

**Current:**
> - Changes within Curator authority (maintenance, corrections, clarifications Curator owns): implement directly to a-docs. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets for the Owner. If the Curator has the authority to make the change, they must make it during synthesis—never queue it.
> - Changes requiring Owner judgment (structural decisions, additions to `general/`, direction changes): submit to Owner for approval; implement after approval.
>
> Do not re-route improvement items through the project's main execution workflow.

**Replace with:**
> Routes actionable items based on structural scope:
> - Changes within `a-docs/`: implement directly. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets. If the change is within `a-docs/`, make it now — never queue it.
> - Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create a Next Priorities entry in `$A_SOCIETY_LOG`. The Owner routes these as new flows.
>
> Do not re-route improvement items through the project's main execution workflow.

---

#### 2b. `$A_SOCIETY_CURATOR_ROLE` — Hard Rules

**Action:** Insert a new hard rule immediately after the existing "Never queue synthesis-authority items" rule.

**Insert (new rule):**
> **Never initiate an Owner approval loop from within a backward pass.** Synthesis items outside `a-docs/` go to Next Priorities — not to the Owner for approval. When synthesis surfaces an item that cannot be implemented directly within `a-docs/` (e.g., an addition to `general/` or a structural decision), create a Next Priorities entry in `$A_SOCIETY_LOG`. Do not initiate an Owner approval loop from within a backward pass.

---

#### 2c. `$GENERAL_IMPROVEMENT` — How It Works, step 5 `[LIB — requires Owner approval]`

**Action:** Replace the current two-bullet routing block with the domain-agnostic formulation.

**Current:**
> - Changes within synthesis role authority: implement directly to a-docs without a formal proposal. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets for the Owner. If the synthesis role has the authority to make the change, they must make it during synthesis—never queue it.
> - Changes requiring Owner judgment: submit to the Owner for approval; implement after approval.
>
> Do not re-route improvement items through the project's main execution workflow.

**Replace with:**
> Routes actionable items based on structural scope:
> - Changes within `a-docs/`: implement directly without a formal proposal. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets. If the change is within `a-docs/`, make it now — never queue it.
> - Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create an entry for a future flow using the project's tracking mechanism. Do not initiate an Owner approval loop from within the backward pass.
>
> Do not re-route improvement items through the project's main execution workflow.

---

### Item 3 — Backward pass tool mandate strengthening `[MAINT]` (`$A_SOCIETY_IMPROVEMENT`); `[LIB]` (`$GENERAL_IMPROVEMENT`)

**What:** Add an explicit prohibition on manual backward pass ordering when the tool is available. The tool is mandatory when available; manual computation is only for bootstrapping or unavailability cases.

**Why:** "Should invoke" leaves room for agents to apply manual ordering when the flow seems simple. That discretion defeats the purpose of the tool and introduces inconsistency. The prohibition needs to be explicit.

---

#### 3a. `$A_SOCIETY_IMPROVEMENT` — Component 4 mandate section

**Action:** Insert after the existing "invoke it for every flow regardless of role count" sentence.

**The existing sentence for reference:**
> When Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) is available, invoke it for every flow regardless of role count.

**Insert immediately after:**
> When Component 4 is available, manual backward pass ordering is not permitted. Manual computation is reserved for cases where Component 4 cannot be invoked (bootstrapping exemption, unavailability). If Component 4 is available, use it — regardless of how straightforward the flow appears.

---

#### 3b. `$GENERAL_IMPROVEMENT` — Backward Pass Traversal / Tooling paragraph `[LIB — requires Owner approval]`

**Action:** Insert after the "invoke it for every flow regardless of role count" sentence.

**The existing sentence for reference:**
> If the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order from a workflow graph), invoke it for every flow regardless of role count.

**Insert immediately after:**
> When a Backward Pass Orderer tool is available, manual traversal computation is not permitted. Manual ordering is reserved for projects where no such tool exists or for bootstrapping cases where the tool cannot be invoked. When the tool is available, use it — do not apply the manual traversal rules above as an alternative.

---

### Item 4 — Update report workflow integration `[MAINT]`

**What:** Integrate update report drafting and publication into the proposal/implementation cycle. Draft in Phase 1, review in Phase 2, publish in Phase 3. The update report is no longer a separate post-implementation submission requiring its own back-and-forth.

**Why:** The update report covers the same changes already approved by the Owner in Phase 2. A separate review cycle is redundant and creates unnecessary sequencing overhead.

---

#### 4a. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Phase 1 Work

**Action:** Insert at the end of the Work section (before "Output:").

**Insert:**
> When the proposed change is likely to qualify for a framework update report (see `$A_SOCIETY_UPDATES_PROTOCOL`), include the update report draft as a named section in the proposal submission. The Owner reviews and approves the draft as part of the Phase 2 decision.

---

#### 4b. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Phase 2 Work

**Action:** Insert at the end of the Work section (after test 7, Manifest Check, before "Output:").

**Insert:**
> If a framework update report draft was included in the Phase 1 proposal, review it as part of this decision. The Phase 2 decision artifact covers both the content change and the update report draft — they are not reviewed separately.

---

#### 4c. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Phase 3 Work

**Action:** Insert into Work section (after the existing work sentence, before "Output:").

**Insert:**
> If a framework update report was approved in Phase 2, publish it to `$A_SOCIETY_UPDATES_DIR` as part of implementation — before registration.

---

#### 4d. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Phase 4 Work

**Action:** Replace the update report drafting sentence.

**Current:**
> If the registered changes qualify for a framework update report (see `$A_SOCIETY_UPDATES_PROTOCOL`), the Curator drafts the report and submits it to the Owner for review before publishing to `$A_SOCIETY_UPDATES_DIR`

**Replace with:**
> If a framework update report was approved in Phase 2, confirm it was published during Phase 3. No separate update report submission is needed.

---

#### 4e. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Phase 5 Work (combined with Item 1c)

**Action:** Rebuild Phase 5 Work to incorporate the Item 1 log update addition and remove the now-stale update-report review sentence (direct consequence of Item 4: no pending update-report submissions exist at Phase 5 under the new model).

**Current:**
> **Work:** Review any pending update-report submission. Confirm all forward-pass work is complete and registered. Acknowledge closure and initiate the backward pass.

**Replace with:**
> **Work:** Confirm all forward-pass work is complete and registered. Update `$A_SOCIETY_LOG`: add the completed flow's entry across all relevant lifecycle sections (Current State, Recent Focus, Previous, Archive). Update Next Priorities as appropriate. Acknowledge closure and initiate the backward pass.

*Note: "Review any pending update-report submission" is removed because under the new model there are no pending update-report submissions at Phase 5 — the report was approved in Phase 2 and published in Phase 3. This is a direct consequence of Item 4 that creates in-scope drift if left unaddressed.*

---

#### 4f. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Session Model, Step 4

**Action (two targeted replacements):**

**First replacement** — opening sentence of Step 4:

**Current:**
> The Curator implements, registers, and drafts any required update-report submission in the active record folder.

**Replace with:**
> The Curator implements (including publishing any update report approved in Phase 2) and registers.

**Second replacement** — remove phrase from handoff instruction later in Step 4:

**Current phrase:**
> provides a copyable path to the registration confirmation and any update-report draft awaiting review

**Replace with:**
> provides a copyable path to the registration confirmation

---

#### 4g. `$A_SOCIETY_CURATOR_ROLE` — Authority & Responsibilities, Framework update reports bullet

**Action:** Replace the Framework update reports bullet.

**Current:**
> Framework update reports: drafting outbound reports when `general/` or `agents/` changes qualify (per `$A_SOCIETY_UPDATES_PROTOCOL`), submitting to the Owner for approval, and publishing to `a-society/updates/` once approved

**Replace with:**
> Framework update reports: when a proposed change is likely to qualify (per `$A_SOCIETY_UPDATES_PROTOCOL`), draft the report as part of the Phase 1 proposal; the Owner approves it in Phase 2 alongside the content change; publish to `$A_SOCIETY_UPDATES_DIR` during Phase 3 implementation.

---

#### 4h. `$A_SOCIETY_RECORDS` — Artifact Sequence section

**Assessment of general rule:** The general rule ("If a flow includes an additional Curator → Owner submission after the main decision artifact, that submission takes the next available sequence slot before backward-pass findings") is a valid general pattern that could serve future edge cases beyond update reports. It should be retained, but stripped of its update-report-specific framing.

**Action (three targeted edits):**

**First edit** — Remove the update-report-specific example from the general rule paragraph:

**Current:**
> If a flow includes an additional Curator → Owner submission after the main decision artifact — for example, an update report draft submitted after implementation is complete — that submission takes the next available sequence slot before backward-pass findings. Backward-pass findings always occupy the final positions in the sequence.

**Replace with:**
> If a flow includes an additional Curator → Owner submission after the main decision artifact, that submission takes the next available sequence slot before backward-pass findings. Backward-pass findings always occupy the final positions in the sequence.

**Second edit** — Update naming convention examples to remove update-report-specific references:

**Current:**
> **Naming convention for non-standard slots:** Use `NN-[role]-[descriptor].md`, where `[descriptor]` names the artifact type (e.g., `curator-update-report.md`, `owner-update-report.md`). Do not reuse the standard `[role]-to-[role].md` form for non-standard submissions.

**Replace with:**
> **Naming convention for non-standard slots:** Use `NN-[role]-[descriptor].md`, where `[descriptor]` names the artifact type (e.g., `curator-addendum.md`, `owner-addendum.md`). Do not reuse the standard `[role]-to-[role].md` form for non-standard submissions.

**Third edit** — Remove the update report example line entirely:

**Current:**
> **Example:** Main flow closes at `04-owner-to-curator.md`; update report submission takes `05-curator-update-report.md` and Owner decision takes `06-owner-update-report.md`; backward-pass findings then start at `07-`.

**Remove this line entirely.**

---

#### 4i. `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` — Template section addition and cleanup `[requires Owner approval — output-format change]`

**Three changes proposed:**

**First change** — Add new conditional section before "Owner Confirmation Required":

```
## Update Report Draft *(Proposals only — include when the proposed change is likely to qualify per `$A_SOCIETY_UPDATES_PROTOCOL`; omit otherwise)*

[The draft update report, formatted per `$A_SOCIETY_UPDATES_TEMPLATE`. The Owner reviews and approves this draft as part of the Phase 2 decision alongside the content change — they are not reviewed separately.]
```

**Second change** — Update the `Type` frontmatter field. Under the new model, "Update Report Submission" is no longer a distinct artifact type (reports are embedded in proposals, not submitted separately). Remove it from the Type values:

**Current:**
> **Type:** Proposal | Update Report Submission | Maintenance Change

**Replace with:**
> **Type:** Proposal | Maintenance Change

**Third change** — Remove the `Implementation Status` section. This section was explicitly scoped to "Update Report Submissions only." Since "Update Report Submission" is no longer a distinct type, this section is vestigial:

**Remove this section entirely:**
```
## Implementation Status *(Update Report Submissions only — omit for Proposals and Maintenance Changes)*

**Implementation complete:** [Yes / No — if No, state what remains]
**Files changed:** [List the files modified during implementation, using `$VAR` references where registered. If implementation is not yet complete, list files expected to change.]
**Publication condition outstanding:** [Yes / No — if Yes, state what condition and what is blocking]
```

---

## Cross-Layer Drift Flag (out of scope — flagging for future flow)

**`$INSTRUCTION_RECORDS`** (`a-society/general/instructions/records/main.md`) likely contains parallel language to the `$A_SOCIETY_RECORDS` update report example and/or post-decision submission paragraph addressed in Item 4h above. If the general instruction carries the same update-report-specific framing, it will drift from `$A_SOCIETY_RECORDS` after this flow's changes are implemented. This is outside the current brief's scope (`$INSTRUCTION_RECORDS` is not listed in the Files Changed table). Flagging here as a candidate for a future flow or Next Priorities entry.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

Items requiring Owner approval in this proposal:
- **Item 2c** — `$GENERAL_IMPROVEMENT` step 5 replacement `[LIB]`
- **Item 3b** — `$GENERAL_IMPROVEMENT` tooling paragraph insertion `[LIB]`
- **Item 4i** — `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` three-part structural change (output-format change)

Items 1, 2a, 2b, 3a, 4a–4h are `[MAINT]` / `[Curator authority — implement directly]` per the brief. These will be implemented alongside the approved items after the Phase 2 decision.

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
