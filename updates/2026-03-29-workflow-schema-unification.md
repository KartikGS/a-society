# Framework Update: Workflow Schema Unification

**Framework Version:** v24.1
**Previous Version:** v24.0
**Date:** 2026-03-29

## Summary

This update unifies the record-folder `workflow.md` schema with the permanent workflow graph format defined in `$INSTRUCTION_WORKFLOW_GRAPH`. It replaces the flat `path[]` list with a nodes/edges subgraph model and removes the stale `synthesis_role` field from the records instruction. This unification enables consistent programmatic processing of workflow graphs across all stages of a unit of work.

## Impact Classification

| Change | Impact | Description |
|---|---|---|
| `workflow.md` schema unification | Recommended | Adopting projects should migrate their `workflow.md` schema to the nodes/edges format to remain consistent with framework standards. |
| `synthesis_role` field removal | Recommended | The `synthesis_role` field is no longer used for backward pass synthesis routing and should be removed from `workflow.md` files. |

## Impacted Files

- `$[PROJECT]_RECORDS` (`a-docs/records/main.md`)
- `$[PROJECT]_INSTRUCTION_RECORDS` (`general/instructions/records/main.md`)
- `$[PROJECT]_INSTRUCTION_WORKFLOW_GRAPH` (`general/instructions/workflow/graph.md`)

## Migration Guidance

### Migration Sequencing Note

Adopting projects should **not** migrate their existing or new `workflow.md` files to the new nodes/edges schema until the Component 4 (Backward Pass Orderer) tooling update is available. This update establishes the new specification; a follow-on Tooling Dev update will provide the compatible parser. Wait for the update report accompanying the Component 4 tooling update before implementing these changes in your project.

### Step 1: Update Records Convention

Update the `workflow.md` schema block in your project's records convention document (`$[PROJECT]_RECORDS`). Replace the old `path[]` schema with the nodes/edges schema:

```yaml
---
workflow:
  name: <string>
  nodes:
    - id: <string>
      role: <string>
      human-collaborative: <string>
  edges:
    - from: <string>
      to: <string>
      artifact: <string>
---
```

Update any descriptive text in the records convention that refers to "entries" or "path list" to use "nodes" and "edges" terminology.

### Step 2: Update Workflow Graph Instruction

If you have instantiated a local version of the workflow graph instruction, add the **Record-Folder workflow.md — Subgraph Variant** section from the updated `$INSTRUCTION_WORKFLOW_GRAPH`. This section clarifies that record-folder `workflow.md` files are flow-specific subgraphs using the same canonical schema.

## Delivery Note

A-Society does not currently have a proactive delivery mechanism for update reports. Projects should check the `a-society/updates/` directory periodically as part of their maintenance cycle.
