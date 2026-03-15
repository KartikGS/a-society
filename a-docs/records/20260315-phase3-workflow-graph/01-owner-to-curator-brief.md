---
artifact: 01-owner-to-curator-brief
flow: 20260315-phase3-workflow-graph
from: Owner
to: Curator
---

# Owner → Curator: Phase 3 Briefing — Workflow Graph Documentation

**Agreed Change:** Produce the two Phase 3 documentation artifacts required before Component 3 and 4 implementation begins.

**Scope:**

1. A new general instruction — `general/instructions/workflow/graph.md` — explaining how any project creates and maintains a machine-readable workflow graph representation (YAML frontmatter embedded in `workflow/main.md`). This file must pass the generalizability test: domain-agnostic, applicable to software, writing, legal, research, and any other project type equally.

2. YAML frontmatter for A-Society's own workflow document (`$A_SOCIETY_WORKFLOW`) — the live instance of the format, embedded at the top of `a-docs/workflow/main.md`.

**Constraints:**

- The YAML schema is specified in the proposal (`$A_SOCIETY_TOOLING_PROPOSAL`, Component 3). Follow it exactly — do not redesign the schema.
- The `general/` instruction must pass the standard review tests before it is created. Follow the proposal flow: draft → Owner review → approval → implement.
- The frontmatter is a documentation layer change to an existing file. It is implemented only after Owner approves both artifacts.
- The Tooling Developer does not implement Component 3 or 4 until this gate clears. The instruction and the live frontmatter instance are both required.
- OQ-4 (storage location) was resolved as Option B: YAML frontmatter embedded in the workflow prose document.
- OQ-5 (general/ instruction for adopting projects) is resolved: the instruction is distributed to adopters (it goes in general/).
- OQ-10 (scope — A-Society-only vs. distributed) is resolved: the Backward Pass Orderer is distributed to adopters; hence the general/ instruction is needed.

**Note on existing `$INSTRUCTION_WORKFLOW`:** A comprehensive workflow instruction already exists at `general/instructions/workflow/main.md`. The new graph instruction is a companion file in the same folder (`general/instructions/workflow/graph.md`), not a replacement or modification of main.md. Namespace parity with the existing structure is appropriate.

**Record folder created by:** Curator, in response to human direction "begin phase 3."
