# A-Society Runtime Records Contract

Use these rules whenever you create, update, repair, or reference artifacts for the active flow.

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
- Put standing project documents, templates, runtime internals outside `record/`, or general project work product in `record/`.

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

For schema and runtime interpretation, follow `a-society/runtime/contracts/workflow.md`. Use this file only for record placement and writable scope.

The workflow-authority role may update `workflow.yaml` when the active path changes. Standard implementer roles do not edit it unless their node explicitly grants workflow-authority responsibility.

When you create or repair `workflow.yaml`, also follow `a-society/runtime/contracts/workflow.md`.
