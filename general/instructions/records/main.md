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

**Parallel track sub-labeling:** When the intake role declares parallel tracks at intake, meaning the forward-pass path includes two or more roles working concurrently before a convergence point, the intake role must pre-assign sub-labeled sequence positions for the convergence artifacts expected from those tracks. Use `NNa-`, `NNb-`, and so on (for example, `08a-curator-findings.md`, `08b-developer-findings.md`). The intake role assigns these sub-labels in `workflow.md` and in the project's records convention at intake, before any parallel work begins. This is an intake obligation, not a post-hoc correction after a collision is discovered.

The first sequence position (`01-`) is reserved for the workflow plan — the Phase 0 gate artifact produced by the Owner at flow intake, before any other artifact is created. Projects using the A-Society framework should declare this position explicitly in their `records/main.md` sequence table. See `$INSTRUCTION_WORKFLOW_COMPLEXITY` for the workflow plan format and its role as the Phase 0 gate.

---

## workflow.md — Forward Pass Path

Some projects using this framework maintain a `workflow.md` file in each record folder alongside the sequenced artifacts. This is a structured YAML file representing the flow's forward-pass path in machine-readable form. It is not a sequenced artifact — it has no `NN-` prefix.

**When to use `workflow.md`:** When the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order), `workflow.md` is the input that tool reads. Projects without such tooling do not need `workflow.md`.

**Schema:**

```yaml
workflow:
  synthesis_role: <string>   # The role that performs backward pass synthesis
  path:
    - role: <string>         # Role name
      phase: <string>        # Phase descriptor (human orientation only)
```

**Who creates it:** The role that performs flow intake, at the same time as the workflow plan artifact, before any sequenced artifacts are created.

**Completeness obligation:** When populating `workflow.md` at intake, the intake role must list every role step they expect, including intermediate review and approval checkpoints between roles. If the intake role will review or approve work before the next non-intake role acts, that checkpoint must appear as its own intake-role entry in `workflow.md`. For example, if a project's workflow includes `RoleA - Deliverable` and the intake role reviews that deliverable before `RoleB` proceeds, `IntakeRole - RoleA Review` must appear as a distinct entry. No review checkpoint may be omitted because it was implied. Silent checkpoints produce `workflow.md` paths that do not match the flow that actually ran, which corrupt backward pass ordering.

**Who can edit it:** The intake role and any role the project designates as workflow-authority for this flow. Regular implementer roles do not edit it.

**When it is appended:** When a workflow-authority role defines their portion of the path that the intake role could not specify at intake.

**What the orderer reads from it:** The `synthesis_role` field and the `role` entries in the `path` list. The `phase` field is for human orientation and is not parsed programmatically.

**Relationship to the plan's `path` field:** If the project's workflow plan artifact contains a `path` field (a flat string list for human planning), both coexist. They serve different consumers: the plan's `path` is for human-oriented complexity assessment; `workflow.md` is for programmatic backward pass ordering. When creating `workflow.md`, populate it from the plan's `path`. `workflow.md` is authoritative for programmatic ordering; the plan's `path` governs human-oriented planning only.

**Pre-convention record folders:** Record folders created before the project established the `workflow.md` requirement are exempt from that requirement. The absence of `workflow.md` in a pre-convention folder is not a convention violation — it is expected. A Backward Pass Orderer tool, if the project uses one, cannot be invoked for these folders; use manual backward pass ordering instead. Future agents encountering a record folder without `workflow.md` should verify whether the folder predates this requirement before treating the absence as an error. Projects should record the convention introduction date or version in their `records/main.md` so this determination is unambiguous.

**Bootstrapping exemption:** When a flow establishes a new record-folder requirement, such as the introduction of `workflow.md` itself, that flow's record folder is exempt-by-origin from the requirement it creates. The flow that introduces a requirement cannot retroactively conform to it. This exemption must be noted explicitly in the flow's artifacts; it must not be handled by silence. An agent encountering this case must either (a) acknowledge the exemption in the initiation artifact and proceed with manual ordering, or (b) create the required file manually for the current folder if conformance is achievable without contradiction.

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
List which artifact types appear at which sequence positions. This is a commitment — agents producing artifacts follow it without deciding each time. The first position in the declared sequence must be the Owner's workflow plan (Phase 0 gate artifact). Declare it as position `01-` with the label `owner-workflow-plan`. This artifact is the prerequisite for all others in the folder. If the project will use a Backward Pass Orderer tool, also declare `workflow.md` as a non-sequenced artifact created at intake alongside the workflow plan. Document its schema, authoring authority, and the tool that reads it in the project's `records/main.md`.

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
