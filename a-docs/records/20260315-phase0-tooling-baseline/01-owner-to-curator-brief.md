---

**Subject:** Phase 0 tooling baseline — four documentation artifacts
**Status:** BRIEFED
**Date:** 2026-03-15

> **Briefing note:** This brief was created by the Curator to capture human direction given inline, substituting for a formal Owner session. The human directed the Curator to produce the four Phase 0 documentation artifacts with two explicit corrections applied. The Owner's approval gate (Phase 2 decision artifact) is still required before any artifact is created.

---

## Agreed Change

The Technical Architect's approved architecture proposal and workflow/roles addendum define a Phase 0 gate before any tooling implementation begins. Phase 0 requires the following four documentation artifacts, each approved by the Owner before the Tooling Developer session opens:

1. **Tooling Developer role document** — a new `a-docs/` role file establishing the behavioral contract for the implementation role
2. **Updated architecture document** — reflects four confirmed decisions: `tooling/` as fourth top-level folder, Node.js as the runtime, agent-invoked model, and the Developer's responsibility for initializing the `tooling/` Node.js project scaffolding
3. **Minimum necessary files manifest** (`general/manifest.yaml`) — the machine-readable source of truth for what a complete `a-docs/` contains (OQ-6 resolved as Option B: explicit manifest file)
4. **Update report naming convention parsing contract** — a formal addition to `$A_SOCIETY_UPDATES_PROTOCOL` specifying the machine-parseable field format that Component 6 (Version Comparator) requires (OQ-9)

Two corrections apply, identified in review of the addendum:

- **Correction 1:** The Developer, not the Curator, initializes the `tooling/` Node.js project (package.json, directory structure) after the architecture document is approved. The addendum (Phase 0, item 3) incorrectly assigned this to the Curator. The Curator's Phase 0 scope is documentation only; the Developer is the implementation role.
- **Correction 2:** The minimum necessary files manifest lives at `general/manifest.yaml`. The proposal left this as OQ-6; the human has confirmed Option B with that specific path.

---

## Scope

**In scope:**
- Drafting all four artifacts listed above as proposals for Owner review
- Applying both corrections in the role document and architecture update
- Noting the need to index the architecture proposal and addendum documents (currently unindexed, needed before the Developer role is functional)

**Out of scope:**
- Implementation of any tooling component (gated on Phase 0 clearing)
- Index registration of new artifacts (happens post-approval, per standard)
- Backward pass findings (separate artifact, end of flow)
- Drafting the `general/instructions/workflow/` instruction for Phase 3 (separate flow)

---

## Likely Target

1. New: `a-society/a-docs/roles/tooling-developer.md` — to be indexed as `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` after approval
2. Update: `$A_SOCIETY_ARCHITECTURE` — `/a-society/a-docs/project-information/architecture.md`
3. New: `a-society/general/manifest.yaml` — to be indexed as `$GENERAL_MANIFEST` after approval
4. Update: `$A_SOCIETY_UPDATES_PROTOCOL` — `/a-society/a-docs/updates/protocol.md`

---

## Open Questions for the Curator

1. For the Tooling Developer's context loading: confirm whether `$A_SOCIETY_VISION` is needed or whether architecture + proposal/addendum are sufficient orientation for a pure execution role.
2. The architecture proposal (`tooling-architecture-proposal.md`) and addendum (`tooling-architecture-addendum.md`) are not currently indexed. Determine whether to add index entries as part of the architecture update proposal (Curator maintenance) or as a post-approval action.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Phase 0 tooling baseline — four documentation artifacts."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
