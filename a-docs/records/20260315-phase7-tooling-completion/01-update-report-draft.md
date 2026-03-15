# A-Society Framework Update — 2026-03-15

**Framework Version:** v10.0
**Previous Version:** v9.0

## Summary

This update adds three required communication template files to `general/` and a new workflow graph instruction. Projects initialized before this update are missing the template files from their `a-docs/communication/conversation/` folder; the workflow graph instruction is an optional capability upgrade for projects that want to enable programmatic backward pass ordering.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap in your current `a-docs/` — Curator must review and add missing template files |
| Recommended | 1 | New capability worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Communication templates added to `general/`

**Impact:** Breaking
**Affected artifacts:** [`general/communication/conversation/TEMPLATE-owner-to-curator-brief.md`], [`general/communication/conversation/TEMPLATE-curator-to-owner.md`], [`general/communication/conversation/TEMPLATE-owner-to-curator.md`]
**What changed:** Three conversation template files have been added to `general/communication/conversation/` — the canonical format references for inter-agent handoff artifacts (Owner briefings, Curator proposals, Owner decisions). These files are now required in every initialized project's `a-docs/communication/conversation/` folder and are distributed by the Scaffolding System as `scaffold: copy` entries.
**Why:** The conversation layer previously defined template formats only in the A-Society-internal `a-docs/` folder. Adopting projects had no local copy of the canonical templates, requiring agents to reference the A-Society source directly — a portability gap. The templates are now part of the distributable `general/` library, and the manifest marks them as required.
**Migration guidance:** Check whether your project has the following files in `a-docs/communication/conversation/`:

- `TEMPLATE-owner-to-curator-brief.md`
- `TEMPLATE-curator-to-owner.md`
- `TEMPLATE-owner-to-curator.md`

If any are missing, copy them from `general/communication/conversation/` in the A-Society framework. The files are ready-to-use; no project-specific customization is needed. If your project already has local conversation templates that differ from the canonical format, compare against the new templates and decide whether to adopt the updated format — your local templates take precedence, but the canonical format is the recommended baseline.

---

### Workflow graph instruction added to `general/`

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/workflow/graph.md`]
**What changed:** A new instruction — `$INSTRUCTION_WORKFLOW_GRAPH` — has been added to `general/instructions/workflow/`. It describes how to add a machine-readable YAML frontmatter graph representation to `$[PROJECT]_WORKFLOW` (`workflow/main.md`). The graph captures workflow structure (phases, nodes, edges, first-occurrence positions, synthesis role designation) in a format that programmatic tooling can process.
**Why:** The A-Society tooling layer's Backward Pass Orderer (Component 4) and Workflow Graph Validator (Component 3) operate on the YAML frontmatter format defined by this instruction. Without the frontmatter, these tools cannot compute backward pass traversal order deterministically. Projects using the tooling layer need this instruction to add the required frontmatter to their workflow document.
**Migration guidance:** This change is optional unless your project uses `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` or `$A_SOCIETY_TOOLING_WORKFLOW_GRAPH_VALIDATOR`. If you use either component:

1. Read `$INSTRUCTION_WORKFLOW_GRAPH`
2. Add YAML frontmatter to `$[PROJECT]_WORKFLOW` following the instruction's schema and fill-in steps
3. Verify the graph by running Component 3 (`validateWorkflowFile`) against your workflow file

If your project does not use the tooling layer, no action is required. The workflow prose document continues to function identically without the frontmatter.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
