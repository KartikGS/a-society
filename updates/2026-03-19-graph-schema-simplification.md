# A-Society Framework Update — 2026-03-19

**Framework Version:** v14.0
**Previous Version:** v13.0

## Summary

This update simplifies workflow graph frontmatter to nodes-and-edges only. The retired `phases`, `phase`, `first_occurrence_position`, and `is_synthesis_role` fields are no longer part of the framework schema, and backward pass must no longer be modeled as workflow graph nodes. Curators of adopting projects that use workflow graph frontmatter should review their workflow documents. Known-adopter note: the Ink project currently uses the retired schema and will need migration.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 0 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Workflow graph schema simplified to nodes-and-edges only

**Impact:** Breaking
**Affected artifacts:** [`general/instructions/workflow/graph.md`]
**What changed:** The workflow graph schema now contains only `workflow.name`, `workflow.nodes` (`id` + `role`), and `workflow.edges` (`from`, `to`, optional `artifact`). The `workflow.phases` list is removed. Node fields `phase`, `first_occurrence_position`, and `is_synthesis_role` are removed. The instruction now defines the graph as a forward-pass structure only: adjacent same-role work with no intervening handoff belongs in one node, and backward pass is verified against the project's improvement document rather than encoded as graph metadata.
**Why:** The previous schema duplicated one concept as two structures (`phases` and nodes) and mixed forward-pass structure with backward-pass policy. This made workflow frontmatter harder to maintain and increased drift risk between workflow prose, improvement protocol, and tooling.
**Migration guidance:** Check your project's `workflow/main.md` YAML frontmatter. If it includes `workflow.phases`, `workflow.nodes[].phase`, `workflow.nodes[].first_occurrence_position`, or `workflow.nodes[].is_synthesis_role`, rewrite it to the simplified schema. Keep `workflow.name`. Rewrite `workflow.nodes` so each node contains only `id` and `role`, representing one structural forward-pass node. Merge adjacent same-role work with no intervening handoff into one node. Keep `workflow.edges` as the handoff structure. Remove backward-pass findings or synthesis nodes from the graph. Then check the backward pass section of your workflow prose and your project's improvement document to ensure backward pass is described there rather than encoded in graph fields. If your project has tooling that validates or consumes workflow graphs, review that tooling's documentation before invoking it; tooling alignment may be a separate migration step.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `$A_SOCIETY_UPDATES_DIR` periodically as part of their maintenance cycle.
