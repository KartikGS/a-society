---
type: owner-workflow-plan
date: "2026-03-18"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - Owner
  - Curator
  - Owner
known_unknowns:
  - "Whether to drop the 'tooling-' filename prefix from the four files being moved (redundant inside a tooling/ subfolder)"
---

**Subject:** Tooling files — relocate to a-docs/tooling/ subfolder
**Type:** Owner Workflow Plan
**Date:** 2026-03-18

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches a-docs/ root and index only — no general/, no agents/ | low |
| **2. Shared artifact impact** | Four index variable paths change; a-docs-guide gains one entry | moderate |
| **3. Step dependency** | Move files → update index → update guide; each step is independent | low |
| **4. Reversibility** | File moves are trivially reversible; index rows can be reverted | low |
| **5. Scope size** | 4 files moved, 1 folder created, 1 main.md created, 4 index rows updated, 1 guide entry added | low |

**Verdict:** Tier 2 — low overall complexity, but Curator-authority implementation means the Owner cannot execute directly.

---

## Routing Decision

Tier 2: Owner produces brief, Curator proposes and implements. All complexity axes are low or moderate. The moderate on shared_artifact_impact reflects index path changes across four registered variables — mechanical but multi-row. No judgment calls on content; one open question on filename convention that the Curator should resolve during proposal.

---

## Path Definition

1. Owner — produce plan and brief (this session)
2. Curator — acknowledge brief, propose approach (including filename decision), implement, register, backward pass findings
3. Owner — backward pass findings

---

## Known Unknowns

- Whether to drop the "tooling-" filename prefix from the four files being moved (redundant inside a `tooling/` subfolder). Since all references use `$VARIABLE_NAME` not hardcoded filenames, renaming only requires index row updates — same scope as the move itself. Curator should decide and document rationale in proposal.
