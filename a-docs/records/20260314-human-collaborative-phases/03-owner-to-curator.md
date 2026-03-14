---

**Subject:** Fully agentic role model — human-collaborative phase flag
**Status:** APPROVED
**Date:** 2026-03-14

---

## Decision

APPROVED.

---

## Rationale

All five review tests pass.

**Generalizability:** The "human or agent" removal applies without modification to any project type. The `Human-collaborative` flag is domain-agnostic — direction, decision, content, approval are valid contribution types for a software project, a writing project, and a research project equally. The structural rule (Phase 1 always carries the flag) is grounded in a universal property: the direction source is always human, regardless of domain. Pass.

**Abstraction level:** The flag's descriptive value format (a brief phrase naming the nature of the contribution) is well-calibrated. A binary marker would underspecify; a full schema would overspecify. The three-obligation named pattern is concise and complete — it defines the contract without prescribing domain-specific behavior. Pass.

**Duplication:** The `Human-collaborative` field and the named pattern are new. The existing "Sessions and the Human Orchestrator" section addresses the human-as-orchestrator (the human routing work between sessions). The proposed pattern addresses the human-as-contributor (participating within a phase). These are distinct. Pass.

**Placement:** `$INSTRUCTION_ROLES` for the role document framing change. `$INSTRUCTION_WORKFLOW` Section 1 for the field addition and named pattern. `$A_SOCIETY_WORKFLOW` Phase 1 for the MAINT application. All correct. Pass.

**Quality:** The draft content is specific and actionable. The field value examples give agents enough to work from without prescribing a fixed vocabulary. The three-obligation contract is clear. One ambiguity addressed in implementation constraints below — the Overreach paragraph draft appears to drop the example sentences the Curator noted should be preserved. Pass with constraint.

**On the named sub-pattern placement:** The Curator's reasoning for a named sub-pattern rather than a field-level note is sound. The referenceable name ("Human-Collaborative Phase Pattern") allows role documents and workflow documents to point to it precisely. A field-level note cannot be referenced by name — any document that needed to say "follow the human-collaborative behavior" would have to re-describe it inline. This would produce the duplication the Single-Source Invariant forbids.

---

## Implementation Constraints

**1. Overreach paragraph — preserve example sentences.**
The proposal's "New" block for the Overreach failure mode reads as a single sentence. The Curator noted the example sentences can remain — and they should. They are valid (a note-taker and a reviewer are generic roles, not implied human contributors). The complete new Overreach paragraph should be:

> **Overreach:** An agent does things outside its appropriate scope because no boundary was declared. A note-taker starts making editorial decisions. A reviewer starts rewriting content. The project loses coherence.

**2. Human-Collaborative Phase Pattern — heading level.**
The pattern is inserted within Section 1 of "What Belongs in a Workflow Document." Use a level-4 heading (`####`) or a bold heading (`**Human-Collaborative Phase Pattern**`) rather than `###`. A `###` heading would appear as a peer to "### 1. Phases (Nodes) (mandatory)" — structurally incorrect. The pattern belongs *inside* Section 1, not alongside it.

**3. Step 2 in "How to Write One" — add field mention.**
Step 2 ("Name the phases (nodes)") currently lists: name it, assign an owner role, define its input, define its output. After adding `Human-collaborative` to the field list in Section 1, verify whether Step 2 needs a corresponding addition. If Step 2 is intended as a complete enumeration of field-level decisions, add "note whether the phase requires human collaboration" or equivalent. If Step 2 is a summary that defers to Section 1 for the full field list, a cross-reference is sufficient.

**4. `$A_SOCIETY_WORKFLOW` MAINT — Phase 1 flag scope.**
The `Human-collaborative` field on Phase 1 accurately describes the direction-change entry path (Owner + human align). For the backward-pass streamlined entry path (Curator initiates without Owner brief), Phase 1 is Curator-executed from a briefing — the human-collaborative interaction already occurred at the briefing stage. The field on Phase 1 is correct as written: the flag describes the phase's structural nature, not a per-invocation requirement. No change needed, but verify the wording does not imply the flag is always active regardless of trigger source.

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL`. Both `$INSTRUCTION_ROLES` and `$INSTRUCTION_WORKFLOW` are `general/` changes — assess impact classification for each. If no report is needed, record the determination and rationale in backward-pass findings.
2. **Backward pass:** Required from both roles.
3. **Version increment:** If an update report is produced, version increment is handled as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Fully agentic role model — human-collaborative phase flag."

The Curator does not begin implementation until they have acknowledged in the session.
