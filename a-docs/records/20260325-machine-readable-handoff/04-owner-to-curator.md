# Owner → Curator: Decision

**Subject:** Machine-readable handoff format — new structured schema for agent session handoffs
**Status:** APPROVED
**Date:** 2026-03-25

---

## Decision

APPROVED — including the update report draft.

---

## Rationale

All seven Phase 2 review tests applied:

1. **Generalizability test:** Pass. The four-field schema is domain-agnostic. Any multi-role project using A-Society produces handoffs at session pause points; the receiving role, session action, artifact path, and session-start prompt are universal handoff properties across software, writing, research, and any other domain.

2. **Abstraction level test:** Pass. Concrete enough to be actionable — field definitions, enum constraints, the conditional constraint table, and two worked examples give an unfamiliar agent everything needed to emit a correct block. Not so specific as to assume any domain, tooling stack, or team structure.

3. **Duplication test:** Pass. No existing content covers machine-readable handoff schemas. The back-reference in `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` is correctly minimal — a pointer to the instruction, not a duplication of it.

4. **Placement test:** Pass. `general/instructions/communication/coordination/` is correct. The coordination layer governs standing rules for inter-agent communication, including format requirements at handoff points. The machine-readable block is a format rule on handoff output, not an artifact template (which would belong in `conversation/`). Placement rationale in the proposal confirms this independently.

5. **Quality test:** Pass. The instruction is structured to answer all five agent questions: what it is, why it exists, when to emit, how to emit (with the `handoff` fence tag distinction well-justified), and how projects adopt it. The two worked examples (resume and start-new cases) are complete and correct. An unfamiliar agent could produce a conforming block from this document alone.

6. **Coupling test:** Pass. No existing tooling component parses `handoff` fenced blocks. This change does not appear in the format dependency table in `$A_SOCIETY_TOOLING_COUPLING_MAP`. The proposed Component 8 validator is correctly scoped to a separate Tooling Dev flow — it is not a blocker for this approval.

7. **Manifest check:** No manifest update required. The new file is a `general/instructions/` document; it is not a scaffolded `a-docs/` artifact.

**Update report draft:** The Curator's Recommended × 1 classification is correct. The change is purely additive — a new instruction available for adoption. No existing instructions are modified or made obsolete. No breaking changes. The v22.0 → v22.1 minor version bump is appropriate for a single Recommended change. Draft is approved as submitted.

---

## Implementation Constraints

1. **Registration sequence (Index-Before-Reference Invariant):** Register `$INSTRUCTION_MACHINE_READABLE_HANDOFF` in `$A_SOCIETY_INDEX` *before* writing the back-reference to `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. The proposal already identifies this constraint — confirm it is observed in execution.

2. **Public index registration:** Register the new instruction in `$A_SOCIETY_PUBLIC_INDEX` as well, per the Target Location table in the proposal.

3. **Next Priorities entry — scope tags:** The proposed `[TOOLING]` tag is not a defined scope tag in `$A_SOCIETY_LOG`. When filing the Component 8 Next Priorities entry, use defined tags. Assess the appropriate size and type tags (e.g., `[M]`) against the definitions in the log's Scope Tags table; do not introduce an undefined tag.

4. **Update report:** Publish to `$A_SOCIETY_UPDATES_DIR` as part of Phase 3 implementation, before registration. Increment `$A_SOCIETY_VERSION` to v22.1 as part of Phase 4 registration.

---

## Follow-Up Actions

1. **Update report:** The draft was approved as part of this Phase 2 decision. Publish it to `$A_SOCIETY_UPDATES_DIR` during Phase 3 — no separate assessment needed. Confirm publication before registration.
2. **Backward pass:** Backward pass findings required from both roles after forward-pass closure.
3. **Version increment:** Increment `$A_SOCIETY_VERSION` to v22.1 as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of machine-readable handoff format — new structured schema for agent session handoffs."

The Curator does not begin implementation until they have acknowledged in the session.
