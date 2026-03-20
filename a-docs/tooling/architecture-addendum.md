# A-Society: Programmatic Tooling Layer — Architecture Addendum

**Role:** Technical Architect
**Status:** Awaiting Owner review — not approved for implementation
**Companion document:** `a-society/a-docs/tooling-architecture-proposal.md`
**Context:** Produced after Owner approval of OQ-1 (tooling/ top-level), OQ-4 (Option B: YAML frontmatter embedded in existing workflow docs), OQ-8 (agent-invoked), and all remaining open questions resolved as documented in the session.

**Workflow:** The implementation workflow (phases, roles, session model) for this tooling layer has been extracted to `$A_SOCIETY_WORKFLOW_TOOLING_DEV`. Read that document for phase sequencing, session routing, and role responsibilities. This document retains the structural constraints, dependency rules, and post-Phase-6 addition protocol.

---

## 3. Constraints and Dependencies

### Structural constraints

**TA does not implement.** The TA's advisory function is review and escalation — not implementation choices, not code. Any session where the TA produces code has exceeded its role boundary and must escalate to Owner.

**Developer writes to `tooling/` only.** All changes to `a-docs/` or `general/` — including documentation of tooling behavior, frontmatter additions to workflow docs, new general/ instructions — belong to the Curator. The Developer does not have write authority over the documentation layer.

**Owner approval required before any code is written.** The Phase 0 gate is not optional. No Developer session opens before: (a) the Tooling Developer role document is approved and registered, (b) the architecture doc is approved, (c) the manifest is approved. A Developer session that opens before Phase 0 clears has violated the approval invariant.

**Phase 3 gate before Phase 4.** The Backward Pass Orderer (Component 4) must build against a live instance of the workflow graph format — not a draft or hypothetical. If Phase 4 begins before the frontmatter is in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, there is no ground truth to validate against.

**Deviation escalation is blocking.** If the Developer identifies a deviation from the approved component design, they stop implementation on that component and escalate to TA. They do not implement a workaround and report it afterward. Deviations that require design changes must clear Owner before any implementation of the affected component resumes.

### Workflow invariants (inherited from existing workflow)

**Portability Invariant** — The `general/` instruction for the workflow graph format (Phase 3) must pass the generalizability test before creation. The format must be domain-agnostic: applicable to a legal project's workflow, a writing project's workflow, and a software project's workflow equally. If the format assumes software-specific concepts, it does not belong in `general/`.

**Approval Invariant** — The Curator does not write to `general/` without an explicit Phase 2 approval artifact. Direction alignment in a briefing or in this addendum is not approval.

**Single-Source Invariant** — The minimum necessary files manifest (Phase 0) is the single source of truth for what the Scaffolding System creates. It must not be duplicated in `general/instructions/` prose as a second list. If the manifest and the prose diverge, the manifest governs.

**Index-Before-Reference Invariant** — New tooling paths must be registered in `$A_SOCIETY_PUBLIC_INDEX` before any agent documentation references them by variable name.

### Open dependency (carried forward)

The framework update report discovery problem — how Curators in adopting projects learn that new update reports exist — remains an open problem documented in `$A_SOCIETY_ARCHITECTURE`. The completion of the tooling layer may warrant a new update report. Curator checks the protocol at Phase 7; the discovery mechanism question is not resolved by this work and is not in scope for the Technical Architect.

---

## 4. Post-Phase-6 Component Additions

The phase structure above (Phases 0–7) was designed for the initial launch of six components. When a new component is added after the original launch, the following conditions apply.

**Phase 0 gate conditions for a new post-Phase-6 component:**

Before any Developer session opens for the new component:
- (a) The Tooling Developer role document is updated (or confirmed unchanged) to cover the new component's implementation scope — Owner approval required.
- (b) `$A_SOCIETY_ARCHITECTURE` is updated if the new component changes the system overview — Owner approval required.
- (c) `$GENERAL_MANIFEST` is updated if the new component creates or reads `a-docs/` files at scaffold time — Owner approval required.
- (d) The naming convention parsing contract is updated if the component reads a new path pattern not covered by existing contracts — Owner approval required. If unchanged, confirm explicitly.

All four conditions must be confirmed before the Developer session opens. A Developer session that opens before this gate clears has violated the Approval Invariant.

**Advisory mode:**

The Technical Architect reviews the new component's design and confirms its Phase 0 gate conditions before any Developer session begins. The TA operates in advisory mode during implementation, as defined in `$A_SOCIETY_WORKFLOW_TOOLING_DEV`.

**Phase numbering:**

Post-Phase-6 components use a phase label that extends the original sequence (e.g., "Phase 1A" for a Phase 1-class component added after launch, or a descriptive label for a new sequential phase). The Phase 0 gate for a new component is the same gate — a new numbered "Phase 0" is not created. Update the phase dependency diagram in `$A_SOCIETY_WORKFLOW_TOOLING_DEV` when a new component adds a dependency to the diagram.

---

*This addendum is ready for Owner review. No roles have been created and no implementation has begun.*
