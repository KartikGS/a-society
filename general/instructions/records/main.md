# How to Create a Records Structure

## What Is a Record?

A record is a sequenced folder that contains all artifacts produced during a single workflow traversal — forward pass and backward pass together. Where a live artifact holds only the current state of a handoff, a record holds the complete artifact history of one unit of work: the briefing that started it, the proposals and decisions that shaped it, and the findings that closed it.

Records solve two problems:

1. **Traceability** — all artifacts for one unit of work live in one place, in chronological order. Any agent or human can reconstruct the full context of a completed flow from its record folder alone.
2. **Identifier stability** — the record folder name *is* the flow identifier. There is no separate `<task-id>` field to define elsewhere. A reference to a flow simply resolves to that folder.

---

## Structure

Records live under `a-docs/records/`:

    a-docs/
      records/
        main.md                           ← this project's records convention
        [identifier]/                     ← one folder per flow
          01-[artifact-type].md           ← sequenced artifacts (chronological)
          02-[artifact-type].md
          ...

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

**Reference stability:** Do not use hardcoded sequence IDs (e.g., `05-findings.md`) in standing instructions or templates to refer to trailing artifacts like backward-pass findings. Intermediate submissions or revisions will shift their sequence position. Always refer to them by function (e.g., "the backward-pass findings artifact after all submissions have resolved").

The first sequence position (`01-`) is reserved for the workflow plan — the Phase 0 gate artifact produced by the Owner at flow intake, before any other artifact is created. Projects using the A-Society framework should declare this position explicitly in their `records/main.md` sequence table. See `$INSTRUCTION_WORKFLOW_COMPLEXITY` for the workflow plan format and its role as the Phase 0 gate.

---

## What Goes in a Record

A record contains all artifacts produced for one flow traversal:

- **Phase 0 gate artifact** — the Owner's workflow plan, produced at intake before any other artifact. This is always the first artifact in the record folder.
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
List which artifact types appear at which sequence positions. This is a commitment — agents producing artifacts follow it without deciding each time. The first position in the declared sequence must be the Owner's workflow plan (Phase 0 gate artifact). Declare it as position `01-` with the label `owner-workflow-plan`. This artifact is the prerequisite for all others in the folder.

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
