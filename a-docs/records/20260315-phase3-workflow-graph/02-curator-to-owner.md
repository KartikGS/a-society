---
artifact: 02-curator-to-owner
flow: 20260315-phase3-workflow-graph
from: Curator
to: Owner
status: PROPOSAL
---

# Curator → Owner: Phase 3 Proposal — Workflow Graph Documentation

## What This Proposes

Two artifacts for Owner review and approval before Component 3 and 4 implementation begins:

1. **`general/instructions/workflow/graph.md`** — A new general instruction explaining how any project creates and maintains a machine-readable workflow graph representation (YAML frontmatter in `workflow/main.md`). Proposed as a companion file to the existing `$INSTRUCTION_WORKFLOW`, in the same folder.

2. **YAML frontmatter for `$A_SOCIETY_WORKFLOW`** — The machine-readable graph representation of A-Society's own workflow, to be embedded at the top of `a-docs/workflow/main.md`.

Both drafts are in this record folder:
- `draft-01-workflow-graph-instruction.md` — proposed content for `general/instructions/workflow/graph.md`
- `draft-02-asoc-workflow-frontmatter.md` — proposed YAML frontmatter with derivation notes

---

## Artifact 1: `general/instructions/workflow/graph.md`

### What It Does

Instructs any project's Curator or agent on:
- What a workflow graph representation is and why it exists
- Where to embed it (YAML frontmatter at the top of `workflow/main.md`)
- The schema to use (fields: `workflow.name`, `phases`, `nodes`, `edges`)
- How to fill in each field, including `first_occurrence_position` and `is_synthesis_role`
- Maintenance rules (update the graph in the same edit as any structural prose change)
- The relationship to the prose document (prose governs in case of disagreement)

### Why It Goes in `general/`

The tooling layer (Components 3 and 4) is being distributed to adopting projects, not scoped to A-Society-only use (OQ-5 and OQ-10 resolved). Adopting projects need to create and maintain workflow graphs for their own workflows so the Backward Pass Orderer can compute traversal order. The instruction must be in `general/` so the Initializer and Curator of any project can reference it.

### Generalizability Case

The schema contains no domain-specific concepts:
- `workflow.name` — applicable to any project's named workflow
- `phases` — any project has phases
- `nodes` / `role` / `phase` / `first_occurrence_position` — applicable to any multi-role workflow regardless of domain
- `is_synthesis_role` — the synthesis role is defined in `$INSTRUCTION_IMPROVEMENT`, which is a general-/ artifact applicable to all project types
- `edges` / `artifact` — generic handoff structure, not technology- or domain-specific

A legal project's workflow (intake → review → drafting → sign-off), a writing project's workflow (brief → draft → edit → publish), and a software project's workflow all can be represented identically in this schema. No domain assumption is embedded.

### Placement Rationale

The existing `$INSTRUCTION_WORKFLOW` is at `general/instructions/workflow/main.md`. The new instruction belongs at `general/instructions/workflow/graph.md` — the same folder, as a companion file. This follows the atomic change site principle: the main workflow instruction describes what a workflow document is and how to create it; the graph instruction describes how to add a machine-readable representation to it. They are distinct but related.

No change to `$INSTRUCTION_WORKFLOW` itself is required. The graph instruction is additive.

---

## Artifact 2: YAML Frontmatter for `$A_SOCIETY_WORKFLOW`

### What It Does

Embeds the machine-readable workflow graph representation at the top of `a-docs/workflow/main.md`, before the prose content. This is required before Phase 4 begins — the Backward Pass Orderer must build against a live instance of the format.

### Schema Adherence

The frontmatter follows the Component 3 schema exactly (from `$A_SOCIETY_TOOLING_PROPOSAL`):
- 5 phases (phase-1 through phase-5)
- 8 nodes — two for Phase 1 (Owner briefing, Curator proposal), one for Phase 2, two for Phase 3/4, three for Phase 5 (Curator findings, Owner findings, Curator synthesis)
- 8 edges — including one Revise branch edge from the review node back to proposal

### Backward Pass Verification

The graph was verified against `$A_SOCIETY_IMPROVEMENT` before submission:
- Owner fires first in Phase 1 (briefing precedes Curator proposal) → `first_occurrence_position: 1`
- Curator fires second → `first_occurrence_position: 2`
- Backward pass order computed from graph: Curator findings → Owner findings → Curator synthesis
- This matches the explicit protocol text in `$A_SOCIETY_IMPROVEMENT` verbatim ✓

Full derivation notes are in `draft-02-asoc-workflow-frontmatter.md`.

---

## Review Tests (self-assessed)

| Test | Result | Notes |
|---|---|---|
| Generalizability | Pass | Schema is domain-agnostic — no technology, domain, or team structure assumptions |
| Abstraction level | Pass | Concrete enough to be actionable; abstract enough to apply to any workflow shape |
| Duplication | Pass | No overlap with `$INSTRUCTION_WORKFLOW` (prose creation) or `$A_SOCIETY_IMPROVEMENT` (backward pass ordering rules) |
| Placement | Pass | `general/instructions/workflow/graph.md` — within the workflow instruction folder; companion to main.md |
| Quality | Pass | Step-by-step fill-in instructions; worked backward-pass verification step; maintenance rules |

The YAML frontmatter is a documentation change to an `a-docs/` file — Owner review tests apply to scope and correctness, not generalizability.

---

## Implementation Plan (after Owner approval)

1. Create `general/instructions/workflow/graph.md` with the content in `draft-01`
2. Add YAML frontmatter to `a-docs/workflow/main.md` (prepend the YAML block from `draft-02`)
3. Register `general/instructions/workflow/graph.md` in `$A_SOCIETY_PUBLIC_INDEX` as `$INSTRUCTION_WORKFLOW_GRAPH`
4. Confirm Phase 3 gate is cleared — handoff to Tooling Developer for Phase 4

No change to `$A_SOCIETY_INDEX` (internal index) is required — the frontmatter addition to an existing `a-docs/` file does not create a new indexed artifact.
