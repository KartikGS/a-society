# A-Society Framework Update — 2026-03-28

**Framework Version:** v23.1
**Previous Version:** v23.0

## Summary

This update adds guidance across multiple `general/` artifacts — role templates (`$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`), improvement protocol (`$GENERAL_IMPROVEMENT`), records instruction (`$INSTRUCTION_RECORDS`), machine-readable handoff instruction (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`), and development instruction (`$INSTRUCTION_DEVELOPMENT`) — addressing operational gaps identified during A-Society execution. A new Technical Architect role template (`general/roles/technical-architect.md`) is also added to the library. Projects that have instantiated `$GENERAL_OWNER_ROLE` or `$GENERAL_CURATOR_ROLE`, or are using any of the affected instructions, should review the changes below.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | No structural gaps or contradictions introduced |
| Recommended | 10 | Improvements worth adopting — Curator judgment call |
| Optional | 3 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Item 1 — Backward pass sequence number selection

**Impact:** Recommended
**Affected artifacts:** [`$GENERAL_IMPROVEMENT`]
**What changed:** Meta-Analysis Phase Step 2 now instructs roles to read the record folder's current contents before selecting a sequence number, to account for intermediate artifacts filed during registration or late forward-pass steps.
**Why:** Without this check, roles derived their sequence number from expected position in the forward pass and filed at colliding positions when registration artifacts had already occupied those slots.
**Migration guidance:** Review your project's `improvement/main.md`. If it copies the backward pass protocol from `$GENERAL_IMPROVEMENT`, add the following sentence to Step 2 of the Meta-Analysis Phase, after the output location declaration: "Before selecting a sequence number, read the record folder's current contents to identify the actual next available number — intermediate artifacts filed during registration or late forward-pass steps may have shifted the sequence forward from its expected position."

---

### Item 2a — Owner brief-writing: shared list constructs

**Impact:** Recommended
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** Brief-Writing Quality now includes a "Shared list constructs" paragraph directing Owners to enumerate all documents containing a parallel list before finalizing brief scope.
**Why:** Briefs scoping only one instance of a parallel list (e.g., an Owner review checklist in both a project-specific role and a general template) left the other instance unupdated, requiring a correction round.
**Migration guidance:** Review your project's `roles/owner.md`. If it was copied from `$GENERAL_OWNER_ROLE`, add the Shared list constructs paragraph to the Brief-Writing Quality section, after the Ordered-list insertions paragraph.

---

### Item 2b — Curator handoff: expected response scope

**Impact:** Recommended
**Affected artifacts:** [`$GENERAL_CURATOR_ROLE`]
**What changed:** Handoff Output now includes a note below the existing-session format block clarifying that `Expected response` names only the immediate next artifact — not artifacts produced after an intermediate step by another role.
**Why:** The field was used to name artifacts that only exist after another role acts first, creating incorrect expectations about what the receiving role should produce directly.
**Migration guidance:** Review your project's `roles/curator.md`. If it was copied from `$GENERAL_CURATOR_ROLE`, add the Expected response scope note below the closing fence of the existing-session format block in the Handoff Output section.

---

### Item 2c — Owner post-confirmation: library registration within existing phases

**Impact:** Recommended
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** Post-Confirmation Protocol now states that registration steps following from an existing workflow phase should be represented within those phases in `workflow.md` — not as new path nodes.
**Why:** Adding path nodes for predictable sub-steps within existing phases produced `workflow.md` paths that did not match the flow's actual structure and corrupted backward pass ordering.
**Migration guidance:** Review your project's `roles/owner.md`. If it was copied from `$GENERAL_OWNER_ROLE`, add the library-registration paragraph to the Post-Confirmation Protocol section, after the existing path-completeness bullet. Also audit any existing `workflow.md` files for extra path nodes added for registration sub-steps within established phases.

---

### Item 2d — Owner brief-writing: update report draft instruction for library flows

**Impact:** Recommended
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** Brief-Writing Quality now includes a "Library flows and update report drafts" paragraph directing Owners to explicitly instruct the downstream role to include the update report draft in the proposal when a flow modifies the distributable layer, with classification marked `TBD` if not yet determinable.
**Why:** Without explicit brief instruction, update report drafts required a separate submission cycle after the content proposal was already approved.
**Migration guidance:** Review your project's `roles/owner.md`. If it was copied from `$GENERAL_OWNER_ROLE`, add the Library flows paragraph to the Brief-Writing Quality section, after the pre-classification prohibition paragraph ("those two contexts only").

---

### Item 2e — Owner: TA Advisory Review section

**Impact:** Optional
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** New `## TA Advisory Review` section added to the Owner role, covering design correctness vs. spec completeness, interface completeness check, and data-extraction type coverage check.
**Why:** No general guidance existed for how Owners review advisories from advisory-producing roles.
**Migration guidance:** If your project has a Technical Architect or equivalent advisory-producing role, review your project's `roles/owner.md`. If it was copied from `$GENERAL_OWNER_ROLE`, add the TA Advisory Review section after the Brief-Writing Quality section.

---

### Item 2f — Owner: Tooling Invocation Discipline section

**Impact:** Optional
**Affected artifacts:** [`$GENERAL_OWNER_ROLE`]
**What changed:** New `## Tooling Invocation Discipline` section added to the Owner role, directing Owners to use documented invocations rather than reconstructing calls from source code.
**Why:** Owners reconstructed invocations from source code, which may diverge from published documentation, producing silent failures.
**Migration guidance:** If your project uses programmatic tooling components, review your project's `roles/owner.md`. If it was copied from `$GENERAL_OWNER_ROLE`, add the Tooling Invocation Discipline section after TA Advisory Review and customize the `[CUSTOMIZE]` reference to point to your project's tooling invocation document.

---

### Item 2g — Curator authority: registration scope clarification

**Impact:** Recommended
**Affected artifacts:** [`$GENERAL_CURATOR_ROLE`]
**What changed:** Authority & Responsibilities now includes a "Registration scope" bullet clarifying that registration means indexing existing documentation — authoring documentation for executable project layers is outside registration scope and is a Developer deliverable.
**Why:** "Registration" was interpreted to include authoring invocation documentation for tooling/runtime layers, blurring the boundary with Developer deliverables.
**Migration guidance:** Review your project's `roles/curator.md`. If it was copied from `$GENERAL_CURATOR_ROLE`, add the Registration scope bullet to the "The Curator owns:" list in Authority & Responsibilities.

---

### Item 2h — Curator: technical summary discipline

**Impact:** Recommended
**Affected artifacts:** [`$GENERAL_CURATOR_ROLE`]
**What changed:** Implementation Practices now includes a "Technical summary discipline" paragraph directing Curators to use exact type names, method signatures, and terminology from approved source artifacts when summarizing implementations.
**Why:** Generic substitutes for specific technical terms made summaries unverifiable against source and introduced terminology drift.
**Migration guidance:** Review your project's `roles/curator.md`. If it was copied from `$GENERAL_CURATOR_ROLE`, add the Technical summary discipline paragraph to the Implementation Practices section.

---

### Item 3 — Records: Owner decision naming distinction

**Impact:** Recommended
**Affected artifacts:** [`$INSTRUCTION_RECORDS`]
**What changed:** Sequencing section now includes an "Owner decision naming distinction" paragraph defining when to use `NN-owner-decision.md` vs. `NN-owner-to-[role].md`.
**Why:** Backward-pass findings artifacts were sometimes confused as active forward-pass handoffs, implying named roles had pending forward-pass work when they did not.
**Migration guidance:** Review your project's `records/main.md`. If it defines an artifact sequence convention, verify that the naming rules align with this distinction: `owner-to-[role]` only when the named role has a next forward-pass action; `owner-decision` for terminal intake-role decisions. No existing artifact renames are required — this is prospective guidance.

---

### Item 4 — Machine-readable handoff: phase-closure semantics and synthesis note

**Impact:** Recommended
**Affected artifacts:** [`$INSTRUCTION_MACHINE_READABLE_HANDOFF`]
**What changed:** Three additions: (a) `artifact_path` field definition extended with phase-closure semantics; (b) new "Phase-closure case" worked example; (c) note on synthesis/flow-closure handoffs (synthesis completion is the terminal event — no handoff block required).
**Why:** Phase-closure handoffs had undefined `artifact_path` semantics. Synthesis termination convention was undocumented.
**Migration guidance:** Review your project's `communication/coordination/` documentation. If it references the machine-readable handoff instruction or includes its own handoff block guidance, update to reflect: (a) `artifact_path` points to the final submission artifact for phase-closure handoffs; (b) no handoff block is emitted when synthesis closes the flow.

---

### Item 11 — New `general/roles/technical-architect.md`

**Impact:** Optional
**Affected artifacts:** [`a-society/general/roles/technical-architect.md` — new file; `$GENERAL_MANIFEST` — new entry]
**What changed:** New ready-made template for any advisory-producing role (Technical Architect or equivalent), containing four advisory standards: Advisory Completeness (prose vs. specification sections), Extension Before Bypass (architecture), Extension Before Bypass (dependency selection), and Explicit Failure States for External Input. Manifest entry added with `required: false, scaffold: copy`.
**Why:** The advisory standards were established in A-Society but had no `general/` home. Projects with an advisory-producing role had no template to start from.
**Migration guidance:** If your project has a Technical Architect or equivalent advisory-producing role, consider adopting `general/roles/technical-architect.md` as the basis for your `roles/technical-architect.md`. If a role file already exists, review the four advisory standards and incorporate any that are not yet present. Update your project's `$[PROJECT]_MANIFEST` to include the new entry if your project uses the manifest.

---

### Item 13 — Developer completion report and integration test requirements

**Impact:** Recommended
**Affected artifacts:** [`$INSTRUCTION_DEVELOPMENT`]
**What changed:** Two new sections added: "Completion Report Requirements" (requires both a deviation check and a completeness check — a stub can pass a deviation check without implementing specified behavior) and "Integration Test Record Format" (requires reproducible evidence — command output, state file excerpts, error traces, or equivalent — not narrative assertion alone).
**Why:** Existing completion reports permitted stub implementations to be filed as "no deviation." Integration gates were passed on narrative assertion without reproducible evidence.
**Migration guidance:** Review your project's `development/` folder and any Developer role that files completion reports. Update your development standards to require both checks in completion reports. Update integration gate procedures to require reproducible evidence artifacts alongside any narrative assertion.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
