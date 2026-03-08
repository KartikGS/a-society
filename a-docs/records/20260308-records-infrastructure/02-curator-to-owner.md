# Curator → Owner: Proposal

**Subject:** Records infrastructure — flow-level artifact tracking
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-08

---

## Trigger

Owner briefing (`01-owner-to-curator-brief.md`, 2026-03-08): framework has no structural mechanism for tracking all artifacts produced during a single workflow traversal. Conversation artifacts overwrite each other; `<task-id>` field in the improvement protocol is undefined; no single place ties briefing, proposal, decision, and findings together.

---

## What and Why

This proposal introduces **records** — a folder-per-flow structure under `a-docs/records/` that contains all artifacts for one workflow traversal, sequenced chronologically.

**Why it generalizes:** Any project with a defined multi-phase workflow and inter-agent handoffs benefits from flow-level artifact tracking. The traceability problem (where did this decision come from?) and the identifier problem (what is `<task-id>` and who defines it?) are not specific to A-Society — they arise in software, legal, research, and writing projects equally. The records pattern is project-agnostic.

This proposal covers:
- A new general instruction for creating a records structure
- Updates to three existing general templates/instructions
- A new A-Society records convention document
- Updates to five existing A-Society a-docs files
- Retirement of the improvement/reports/ folder
- Deletion of live conversation artifact files
- Index and agent-docs-guide maintenance

---

## Open Question Resolutions

### OQ1 — `general/improvement/reports/main.md`

**Recommendation: Leave as-is. Update `general/improvement/protocol.md` to support both paths.**

Rationale: `general/improvement/reports/` is a standalone pattern. A project can adopt improvement without records, or records without improvement. Updating the reports template to say "findings live in records" would imply records are required — they are not. The correct location to note the records path is in `general/improvement/protocol.md` (the step that names the output location), where a two-path option can be declared cleanly. Projects adopting records update their own `improvement/protocol.md` accordingly; the general template remains correct for projects that do not.

No changes proposed to `general/improvement/reports/main.md`.

### OQ2 — Sequencing convention

**Recommendation: Prescribe zero-padded two-digit numbering (`01-`, `02-`, ...).**

Rationale: This is a portability convenience, not a domain assumption. Any project type — legal, software, writing, research — can apply a two-digit zero-padded prefix. The alternative (leaving format to projects) creates interoperability friction if projects ever share artifacts or if the general pattern is referenced across contexts. Prescribing it costs nothing and prevents lexicographic sort failure at 10+ artifacts. The general instruction will prescribe it; projects that have a compelling reason to differ may override in their own `records/main.md`.

### OQ3 — Cross-references in conversation templates

**Recommendation: Update all three TEMPLATE files to remove the "fill [live artifact]" instruction and replace with "create from this template into the active record folder."**

This is a scope addition to the brief (items 10–11 cover the folder's `main.md` and live artifact deletion, but not the template header notes). Proposed update to all three templates: change the header note from `"do not modify this file. Fill [live-artifact.md] from this template"` to `"do not modify this file. Create from this template into the active record folder as NN-[type].md"`.

---

## Where Observed

A-Society — internal. The operational gap was identified during the 2026-03-08 Owner/Human alignment session: conversation artifacts are overwriting, `<task-id>` is undefined in the improvement protocol, and no structural mechanism ties all flow artifacts together.

---

## Target Location

1. `general/instructions/records/main.md` — **new file**
2. `general/instructions/communication/conversation/main.md` — **update**
3. `general/improvement/protocol.md` — **update**
4. `general/instructions/improvement/main.md` — **update**
5. `a-docs/records/main.md` — **new file**
6. `a-docs/workflow/main.md` — **update**
7. `a-docs/improvement/protocol.md` — **update**
8. `a-docs/improvement/reports/` — **retire** (delete folder and contents)
9. `a-docs/improvement/main.md` — **update**
10. `a-docs/communication/conversation/main.md` — **update**
11. `a-docs/communication/conversation/owner-to-curator-brief.md` — **delete**
12. `a-docs/communication/conversation/curator-to-owner.md` — **delete**
13. `a-docs/communication/conversation/owner-to-curator.md` — **delete**
14. `a-docs/communication/conversation/DRAFT-graph-model-2026-03-07.md` — **delete**
15. `a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md` — **update** (OQ3)
16. `a-docs/communication/conversation/TEMPLATE-curator-to-owner.md` — **update** (OQ3)
17. `a-docs/communication/conversation/TEMPLATE-owner-to-curator.md` — **update** (OQ3)
18. `a-docs/indexes/main.md` — **update**
19. `a-docs/agent-docs-guide.md` — **update**
20. `a-society/index.md` — **update**

---

## Draft Content

### Item 1 — New: `general/instructions/records/main.md`

```markdown
# How to Create a Records Structure

## What Is a Record?

A record is a sequenced folder that contains all artifacts produced during a single workflow traversal — forward pass and backward pass together. Where a live artifact holds only the current state of a handoff, a record holds the complete artifact history of one unit of work: the briefing that started it, the proposals and decisions that shaped it, and the findings that closed it.

Records solve two problems:

1. **Traceability** — all artifacts for one unit of work live in one place, in chronological order. Any agent or human can reconstruct the full context of a completed flow from its record folder alone.
2. **Identifier stability** — the record folder name *is* the flow identifier. There is no separate `<task-id>` field to define elsewhere. A reference to "the flow named `20260308-records-infrastructure`" simply resolves to that folder.

---

## Structure

Records live under `a-docs/records/`:

```
a-docs/
  records/
    main.md                           ← this project's records convention
    [identifier]/                     ← one folder per flow
      01-[artifact-type].md           ← sequenced artifacts (chronological)
      02-[artifact-type].md
      ...
```

Each record folder is named by the project's identifier convention. Files within it are named with a zero-padded two-digit sequence prefix (`01-`, `02-`, ...) followed by a descriptor. The prefix ensures lexicographic ordering matches chronological order.

---

## Identifier Convention

Projects define their own identifier format in their `a-docs/records/main.md`. The identifier must be:

- **Unique** — no two flows share the same identifier
- **Human-readable** — a reader can identify the flow from the folder name alone
- **Stable** — the identifier does not change after the record folder is created

Common conventions:
- `YYYYMMDD-slug` — date-based with a short kebab-case descriptor (e.g., `20260308-records-infrastructure`)
- `[project]-NNN` — project-code with sequential number (e.g., `acme-001`)

The project's `records/main.md` declares the identifier format and any slug vocabulary conventions.

---

## Sequencing

Files within a record folder are named with a zero-padded two-digit prefix: `01-`, `02-`, ... `09-`, `10-`, ...

**This prefix is mandatory.** Do not use unpadded numbers (`1-`, `2-`) — they break lexicographic sort at 10+.

The project's `records/main.md` defines which artifact types appear at which sequence positions (e.g., `01-` is always the briefing, `02-` is always the proposal). Revise/resubmit cycles append artifacts at the next available sequence position — they do not overwrite prior artifacts.

---

## What Goes in a Record

A record contains all artifacts produced for one flow traversal:

- **Conversation artifacts** — briefings, proposals, decisions (the handoffs between roles as the flow progresses)
- **Findings** — backward pass findings from each participating role

What does **not** go in a record:

- **Templates** — these stay in `communication/conversation/` (or wherever the project stores them); templates are referenced, not instantiated into the record
- **Work product** — files created or modified during implementation live at their own locations; only the artifact describing the change (e.g., the proposal) belongs in the record

---

## Integration with the Conversation Layer

With records, conversation artifacts are no longer created as live files at stable, overwriting paths. Instead:

- **Templates** remain in `communication/conversation/` — permanent, never modified
- **Artifacts** are created directly in the active record folder, using the next sequential filename

This removes the need for pre-replacement checks. Each flow's artifacts are distinct files in a distinct folder; nothing is overwritten.

Template header notes should say: *"Create from this template into the active record folder as NN-[type].md."*

---

## Integration with the Improvement Protocol

Backward pass findings are sequenced artifacts within the record folder — not separate files in an `improvement/reports/` folder. The project's `improvement/protocol.md` should specify:

> Output location: `[PROJECT_RECORDS]/[identifier]/NN-<role>-findings.md`

For projects that do not use records, `improvement/reports/` remains the default location for findings (see `$INSTRUCTION_IMPROVEMENT`).

---

## How to Create a Records Structure

**Step 1 — Define the identifier convention.**
Write `a-docs/records/main.md`. Declare the identifier format, slug vocabulary, and what happens when two flows begin on the same calendar date.

**Step 2 — Declare the artifact sequence.**
List which artifact types appear at which sequence positions. This is a commitment — agents producing artifacts follow it without deciding each time.

**Step 3 — Update the conversation layer.**
Remove live artifact files from `communication/conversation/`. Update template header notes to say artifacts are created into the active record folder.

**Step 4 — Update the improvement protocol.**
Change the findings output path from `improvement/reports/` to the record folder.

**Step 5 — Register in the index.**
Add `$[PROJECT]_RECORDS` pointing to `a-docs/records/main.md`. Register per the Index-Before-Reference invariant before writing any `$VAR` references to the records folder.

---

## When to Create a Records Structure

Create a records structure when:

- The project has a defined multi-phase workflow with inter-agent handoffs
- Multiple units of work are expected over time and traceability matters
- The current conversation model uses live files that overwrite between flows

A project with no inter-agent handoffs, or a single static workflow with no distinct flows, may not benefit from records. The `improvement/reports/` pattern remains available for such projects.
```

---

### Item 2 — Update: `general/instructions/communication/conversation/main.md`

The current instruction describes the live-file model (artifacts at stable overwriting paths). With records, the model changes: artifacts are created in record folders, not at stable paths. The following changes are proposed:

**Section "The Two Types of Conversation Artifacts" — replace "Live Working Artifacts" with "Record Artifacts":**

Remove:
> **1. Live Working Artifacts** — A live artifact carries the active handoff or report for the current unit of work [...] Replaced when the next unit of work begins — after a pre-replacement check confirms the prior unit is closed.

Replace with:
> **1. Record Artifacts** — A record artifact carries a handoff or report for one unit of work and lives in that unit's record folder. It is:
> - Created at a defined trigger point in the workflow
> - Named with a sequenced prefix within the record folder (e.g., `02-proposal.md`)
> - Never replaced — each unit of work produces a distinct set of artifacts in a distinct folder
>
> Projects that use a records structure (see `$INSTRUCTION_RECORDS`) create all conversation artifacts as record artifacts. Projects without a records structure may use the live artifact pattern: a stable file path, replaced between units of work after a pre-replacement check confirms the prior unit is closed.

**Section "Lifecycle of a Live Artifact" — add record-based lifecycle:**

Add before the existing lifecycle diagram:

> ### Lifecycle of a Record Artifact (for projects using records)
>
> ```
> Trigger fires
>     ↓
> Sender creates artifact in active record folder from template (as NN-[type].md)
>     ↓
> Receiver reads and acknowledges
>     ↓
> [Optional: clarification rounds — both agents update the same artifact]
>     ↓
> Artifact reaches terminal status
>     ↓
> No replacement — artifact is permanent in its record folder
> ```
>
> There is no pre-replacement check for record artifacts. Nothing is overwritten.

Retain the existing lifecycle diagram under the heading "Lifecycle of a Live Artifact (for projects without records)".

**Section "Naming Conventions" — add record artifact naming:**

Add after the existing template naming convention:
> - **Record artifacts:** `NN-[type].md` within the record folder (e.g., `02-proposal.md`, `03-decision.md`). The `NN-` prefix is zero-padded and two-digit. The type descriptor matches the artifact's role in the flow. See `$INSTRUCTION_RECORDS` for the sequencing convention.

**Section "How to Create the Conversation Layer" — update Step 3 and remove Step 4:**

Step 3 change: *"Place templates and live artifacts in the same folder"* → *"Place templates in the conversation folder; artifacts go in record folders."* Update body accordingly.

Step 4 ("Write a pre-replacement check procedure"): Remove entirely for projects using records. Retain with a note that it applies to projects using the live-artifact pattern without records.

**Section "What Makes a Conversation Layer Fail" — remove "No pre-replacement check"** failure mode (it no longer applies to record-based projects). Optionally add: *"Artifacts created in the wrong location"* — artifacts created at stable overwriting paths when the project uses records, or vice versa.

---

### Item 3 — Update: `general/improvement/protocol.md`

**Section "How It Works", Step 2 — change output location:**

Current:
> 2. **Output location:** `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md`

Replace with:
> 2. **Output location:**
>    - *If the project uses records:* `[PROJECT_RECORDS]/[identifier]/NN-<role>-findings.md` — findings are sequenced artifacts in the active record folder
>    - *If the project does not use records:* `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md`
>
>    The project's `improvement/protocol.md` declares which path applies.

---

### Item 4 — Update: `general/instructions/improvement/main.md`

**Section "What Is an `improvement/` Folder?" — change three-component to two-required + one-optional:**

Current:
> An `improvement/` folder contains three components:
> 1. **Philosophy** (`main.md`) ...
> 2. **Protocol** (`protocol.md`) ...
> 3. **Reports** (`reports/`) — the folder where all backward pass findings are stored

Replace with:
> An `improvement/` folder contains two required components and one optional:
> 1. **Philosophy** (`main.md`) — required
> 2. **Protocol** (`protocol.md`) — required
> 3. **Reports** (`reports/`) — optional: for projects that do not use a records structure, or for improvement artifacts that are not tied to a specific flow

**Section "The Three Components" — update the `reports/` subsection:**

Change heading to `reports/ — Reports Folder (Optional)`. Add at the start of the subsection:

> If the project uses a records structure (see `$INSTRUCTION_RECORDS`), backward pass findings are sequenced artifacts within the record folder — not files in `reports/`. In that case, this folder may be omitted or repurposed for non-flow-specific improvement artifacts (e.g., a periodic synthesis that spans multiple flows).
>
> If the project does not use records, `reports/` is the required storage location for all backward pass findings.

**Section "Integration with the Index" — make `$[PROJECT]_IMPROVEMENT_REPORTS` row conditional:**

Add note: *(Include only if the project uses `reports/` rather than a records structure for findings.)*

---

### Item 5 — New: `a-docs/records/main.md`

```markdown
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
```

---

### Item 6 — Update: `a-docs/workflow/main.md`

**Phase 1 — Proposal, Input field:**

Current: *"Owner writes `$A_SOCIETY_COMM_BRIEF`"*

Replace with: *"Owner creates a record folder (`$A_SOCIETY_RECORDS/[identifier]/`) and writes `01-owner-to-curator-brief.md` from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`. For human-directed changes, the human provides direction directly."*

**Phase 1 — Proposal, Output field:**

Current: *"submitted to the Owner via `$A_SOCIETY_COMM_CURATOR_TO_OWNER`"*

Replace with: *"submitted to the Owner as the next sequenced artifact in the active record folder (e.g., `02-curator-to-owner.md`), using `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`"*

**Phase 2 — Review, Output field:**

Current: *"An explicit decision via `$A_SOCIETY_COMM_OWNER_TO_CURATOR`"*

Replace with: *"An explicit decision written as the next sequenced artifact in the active record folder (e.g., `03-owner-to-curator.md`), using `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`"*

**Phase 5 — Backward Pass, Output field:**

Current: *"Findings files in `$A_SOCIETY_IMPROVEMENT_REPORTS`."*

Replace with: *"Findings artifacts in the active record folder, at the next sequenced positions (e.g., `04-curator-findings.md`, `05-owner-findings.md`). See `$A_SOCIETY_RECORDS` for the naming convention."*

**Handoffs table — update all three communication variable references:**

| Edge | Current "What Carries It" | Proposed "What Carries It" |
|---|---|---|
| Trigger → Phase 1 | `$A_SOCIETY_COMM_BRIEF` or conversation | `01-owner-to-curator-brief.md` in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`), or conversation |
| Phase 1 → Phase 2 | `$A_SOCIETY_COMM_CURATOR_TO_OWNER` | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`) |
| Phase 2 → Phase 3 | `$A_SOCIETY_COMM_OWNER_TO_CURATOR` | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) |
| Phase 2 → Phase 1 | `$A_SOCIETY_COMM_OWNER_TO_CURATOR` with required changes | Same — next sequenced artifact in the active record folder |
| Phase 2 → ∅ | `$A_SOCIETY_COMM_OWNER_TO_CURATOR` | Same |

**Session model — update artifact references throughout:**

Replace specific artifact variable names (`$A_SOCIETY_COMM_BRIEF`, `$A_SOCIETY_COMM_CURATOR_TO_OWNER`, `$A_SOCIETY_COMM_OWNER_TO_CURATOR`) with references to "the active record folder" and the appropriate template variables (`$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`, `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`).

---

### Item 7 — Update: `a-docs/improvement/protocol.md`

**Section "How It Works", Step 3 — change output location:**

Current:
> 3. **Output:** `$A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-<role>-findings.md`

Replace with:
> 3. **Output:** The next sequenced artifact in the active record folder — e.g., `04-curator-findings.md`, `05-owner-findings.md`. See `$A_SOCIETY_RECORDS` for the naming convention.

**Step 4 — update template reference:**

Current:
> 4. **Template:** `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`

Retain as-is.

**Step 5 — update proposal reference:**

Current:
> 5. **Curator synthesizes** actionable items from both findings files and proposes them through `$A_SOCIETY_COMM_CURATOR_TO_OWNER` as new trigger inputs for Phase 1 (Proposal).

Replace with:
> 5. **Curator synthesizes** actionable items from both findings artifacts and, if actionable items exist, creates a new trigger input — either by noting it for the Owner verbally or by initiating a new flow. A new flow begins with a new record folder.

---

### Item 8 — Retire: `a-docs/improvement/reports/`

Delete:
- `a-docs/improvement/reports/main.md`
- `a-docs/improvement/reports/META-20260307-initializer-test-run-lightweight.md`

The findings in `META-20260307-initializer-test-run-lightweight.md` are a historical artifact and are not migrated into records (retroactive migration is out of scope per the brief).

---

### Item 9 — Update: `a-docs/improvement/main.md`

**Opening paragraph — remove the three-component reference:**

The file currently says:
> All principles below are drawn from the project-agnostic framework in `$GENERAL_IMPROVEMENT`. They apply here without modification; no A-Society-specific exceptions exist.

No change needed to the content here — the file does not contain the three-component description. Verify that no reference to `improvement/reports/` or `$A_SOCIETY_IMPROVEMENT_REPORTS` exists in this file.

*(On reading: `a-docs/improvement/main.md` contains no reference to `reports/` or `$A_SOCIETY_IMPROVEMENT_REPORTS`. No changes are required to this file. Removing from scope.)*

---

### Item 10 — Update: `a-docs/communication/conversation/main.md`

Replace the entire file. Current content describes both templates and live artifacts. New content is template-only:

```markdown
# A-Society: Conversation Templates

This folder contains the permanent templates for all A-Society inter-agent conversation artifacts. Artifacts are not created here — they are created in the active record folder (see `$A_SOCIETY_RECORDS`) using these templates as format references.

---

## Templates

| File | Direction | Use When |
|---|---|---|
| `TEMPLATE-owner-to-curator-brief.md` | Owner → Curator | Creating the briefing artifact for a new flow |
| `TEMPLATE-curator-to-owner.md` | Curator → Owner | Submitting a proposal, update report, or maintenance change |
| `TEMPLATE-owner-to-curator.md` | Owner → Curator | Issuing a review decision (approved / revise / rejected) |

Templates are never modified during use. Create from a template into the active record folder at the next sequenced position; the template stays unchanged.

---

## Artifact Lifecycle

All conversation artifacts for a flow are created in that flow's record folder under `$A_SOCIETY_RECORDS`. See `$A_SOCIETY_RECORDS` for the identifier format, sequencing convention, and the canonical artifact sequence for A-Society flows.
```

---

### Items 11–14 — Delete: live conversation artifacts from `a-docs/communication/conversation/`

Delete these files:
- `owner-to-curator-brief.md`
- `curator-to-owner.md`
- `owner-to-curator.md`
- `DRAFT-graph-model-2026-03-07.md`

These files are superseded by the record folder model. Historical content in these files (if any active flow is in progress) is preserved in the record folder for the current flow.

---

### Items 15–17 — Update: TEMPLATE files in `a-docs/communication/conversation/` (OQ3)

**`TEMPLATE-owner-to-curator-brief.md` — update header note:**

Current:
> **Template** — do not modify this file. Fill `owner-to-curator-brief.md` (the live artifact) from this template.

Replace with:
> **Template** — do not modify this file. Create from this template into the active record folder as `01-owner-to-curator-brief.md` (or the next available sequence position if `01-` is taken).

**`TEMPLATE-curator-to-owner.md` — update header note:**

Current:
> **Template** — do not modify this file. Fill `curator-to-owner.md` (the live artifact) from this template.

Replace with:
> **Template** — do not modify this file. Create from this template into the active record folder at the next sequenced position (e.g., `02-curator-to-owner.md`).

**`TEMPLATE-owner-to-curator.md` — update header note:**

Current:
> **Template** — do not modify this file. Fill `owner-to-curator.md` (the live artifact) from this template.

Replace with:
> **Template** — do not modify this file. Create from this template into the active record folder at the next sequenced position (e.g., `03-owner-to-curator.md`).

---

### Item 18 — Update: `a-docs/indexes/main.md`

**Add:**
```
| `$A_SOCIETY_RECORDS` | `/a-society/a-docs/records/main.md` | A-Society records convention — identifier format, artifact sequence, and placement rules for flow-level artifact tracking |
```

**Remove these rows:**
```
| `$A_SOCIETY_IMPROVEMENT_REPORTS` | `/a-society/a-docs/improvement/reports/main.md` | ...
| `$A_SOCIETY_COMM_BRIEF` | `/a-society/a-docs/communication/conversation/owner-to-curator-brief.md` | ...
| `$A_SOCIETY_COMM_CURATOR_TO_OWNER` | `/a-society/a-docs/communication/conversation/curator-to-owner.md` | ...
| `$A_SOCIETY_COMM_OWNER_TO_CURATOR` | `/a-society/a-docs/communication/conversation/owner-to-curator.md` | ...
```

**Update description for `$A_SOCIETY_COMM_CONVERSATION`:**

Current description: *"A-Society conversation artifacts — live handoffs, templates, and lifecycle"*

Replace with: *"A-Society conversation templates — permanent format references for all inter-agent handoff artifacts"*

---

### Item 19 — Update: `a-docs/agent-docs-guide.md`

Add a new entry after the `communication/` section (or as a standalone section before `general/`):

```markdown
## `records/`

### `records/main.md` — `$A_SOCIETY_RECORDS`

**Why it exists:** Every workflow traversal produces multiple artifacts: a briefing, a proposal, a decision, and backward pass findings. Without a dedicated structure, these artifacts either scatter across folders or overwrite each other as live files. The records structure ties all artifacts for one flow into one folder, in chronological sequence. The record folder name *is* the flow identifier — no separate `<task-id>` field is needed.

**What it owns:** A-Society's records convention: the identifier format (`YYYYMMDD-slug`), the canonical artifact sequence within a record folder, the sequencing prefix convention (`01-`, `02-`, ...), and the rule for what belongs in a record versus what does not.

**What breaks without it:** Agents creating flow artifacts have no canonical convention for naming or locating them. The identifier referenced in `$A_SOCIETY_IMPROVEMENT_PROTOCOL` is undefined. Flow artifacts scatter or overwrite.

**Do not consolidate with:** `workflow/main.md` — the workflow describes phase sequencing; records describes artifact storage within a flow. Do not consolidate with `communication/conversation/main.md` — the conversation folder holds templates; records holds the artifacts produced from those templates.
```

---

### Item 20 — Update: `a-society/index.md` (Public Index)

**Add to the Instructions section:**
```
| `$INSTRUCTION_RECORDS` | `/a-society/general/instructions/records/main.md` | How to create a records structure for any project |
```

---

## Implementation Notes

1. **Register before reference** (Index-Before-Reference invariant): `$A_SOCIETY_RECORDS` must be added to `$A_SOCIETY_INDEX` before any document references it by variable name. Index update (Item 18) must be implemented before workflow/improvement/agent-docs-guide updates that reference `$A_SOCIETY_RECORDS`.

2. **Item 9 (`a-docs/improvement/main.md`) has no required changes.** On reading, the file contains no reference to `improvement/reports/` or `$A_SOCIETY_IMPROVEMENT_REPORTS`. It may be removed from scope at the Owner's discretion.

3. **Record folder already exists.** The record folder `20260308-records-infrastructure/` was created by the Owner when writing the briefing (`01-owner-to-curator-brief.md`). This confirms the records model is operationally valid — no bootstrapping issue.

4. **DRAFT-graph-model-2026-03-07.md** — this file was not listed in the index, so no index cleanup is required for it beyond deletion.

---

## Owner Confirmation Required

The Owner must respond in the active record folder as `03-owner-to-curator.md` (from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
