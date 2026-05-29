# A-Society Runtime Records Contract

This contract tells you where flow artifacts go and what you may write.

The runtime loads this contract into every managed agent session with the handoff contract. Treat it as active instruction, not background reference.

Use this contract whenever you create, update, repair, or reference artifacts for the active flow.

---

## Use The Active Record Folder

When node-entry or backward-pass context gives you a record folder, write flow artifacts only inside that folder.

The runtime-managed record folder has this shape:

```text
.a-society/
  state/
    <project-namespace>/
      <flow-id>/
        flow.json
        roles/
        record/
          record.yaml
          workflow.yaml
          owner-workflow-plan.md
          findings/
```

The active record folder is the `record/` directory shown above. It is the agent-writable flow artifact area.

Do:

- Use the exact record folder path provided by the runtime.
- Create handoff, proposal, decision, review, completion, closure, and findings artifacts inside that folder.
- Reference record artifacts by their real path when emitting handoff signals.

Do not:

- Invent a record folder path.
- Create, rename, or move the record folder.

---

## record.yaml Is Runtime Managed

The runtime creates and updates `record.yaml`:

```yaml
record:
  name: <string|null>
  summary: <string|null>
```

- `record.name` is the human-facing flow title.
- `record.summary` is the one-line flow description.

Do not create, edit, or repair `record.yaml` by hand.

---

## Handle workflow.yaml Carefully

`workflow.yaml` is the active flow's machine-readable topology snapshot. It lives directly inside `record/`.

The executable schema and runtime interpretation are defined in `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT`. This contract owns record placement and writable scope, not the workflow schema.

The workflow-authority role may update `workflow.yaml` when the active path changes. Standard implementer roles do not edit it unless their node explicitly grants workflow-authority responsibility.

When you create or repair `workflow.yaml`, also follow `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT`.

---

## Put Only Flow Artifacts In record/

Put these in the active record folder:

- Owner intake and workflow plan artifacts
- Handoff, proposal, decision, review, completion, and closure artifacts for this flow
- Flow-local implementation reports
- Backward-pass findings and runtime-generated improvement artifacts

What does not belong in `record/`:

- Standing project documentation
- Templates
- Runtime internals outside `record/`
- General work product that belongs in the project itself
