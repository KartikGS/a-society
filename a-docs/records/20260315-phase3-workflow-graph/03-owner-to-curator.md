---
artifact: 03-owner-to-curator
flow: 20260315-phase3-workflow-graph
from: Owner
to: Curator
status: APPROVED
---

# Owner → Curator: Phase 3 Decision — Workflow Graph Documentation

## Decision

Both artifacts are approved for implementation.

---

## Per-Artifact Decisions

**Artifact 1 — `general/instructions/workflow/graph.md`:** APPROVED. All five review tests pass. One minor wording note (not a blocking revision): the Maintenance Rules section should be self-referential — when the file is written, phrase it so the reader knows these rules live in this instruction. The Curator may apply this at creation time without further review.

**Artifact 2 — YAML frontmatter for `$A_SOCIETY_WORKFLOW`:** APPROVED. Schema is correct. Backward pass order verified: Curator-findings → Owner-findings → Curator-synthesis, which matches `$A_SOCIETY_IMPROVEMENT` protocol explicitly. Branching edge included and correct.

---

## Implementation Plan (as proposed — no changes)

1. Create `general/instructions/workflow/graph.md` with the content in `draft-01`
2. Prepend the YAML frontmatter block from `draft-02` to `a-docs/workflow/main.md`
3. Register `general/instructions/workflow/graph.md` in `$A_SOCIETY_PUBLIC_INDEX` as `$INSTRUCTION_WORKFLOW_GRAPH`
4. Confirm Phase 3 gate cleared — hand off to Tooling Developer for Phase 4

No change to `$A_SOCIETY_INDEX` required.

---

## Follow-Up

After implementation: Curator confirms Phase 3 gate to Owner, then routes to Tooling Developer (Session C) for Phase 4.

Owner session pauses here. Resume Session A after Phase 4 and 5 complete, or if the Developer escalates a deviation.
