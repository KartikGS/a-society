# Owner → Curator: Briefing

**Subject:** Initializer quality hardening — shell prohibition, Phase 2 scope, Phase 4 disclosure, and agents.md instruction fixes
**Status:** BRIEFED
**Date:** 2026-03-11

---

## Agreed Change

A test run of the Initializer against a seed-file project surfaced four quality gaps across two files (`$A_SOCIETY_INITIALIZER_ROLE` and `$INSTRUCTION_AGENTS`). These are addressed together because they share a common theme: the Initializer made decisions it was not authorized to make, and agents.md was produced with structural errors because the instruction that governs it is underspecified.

**Gap 1 — Shell/version control hallucination (Hard Rules)**
The Initializer attempted git operations during Phase 5 with no basis in the protocol. The Hard Rules currently prohibit modifying files outside `a-docs/` but do not explicitly prohibit shell commands or version control operations. An explicit prohibition is needed.

**Gap 2 — Phase 2 scope creep (Clarification phase)**
The Initializer offered to design project structure ("should I establish a standard structure for you?") when it should have asked about the human's intent. Phase 2 questions are for understanding what exists or is intended — not for offering to make design decisions. The protocol should clarify this distinction.

**Gap 3 — Phase 4 design decision disclosure (Self-review)**
The Initializer invented a file-based artifact naming convention (`[client]-01-brief.md` etc.) as a PM-tool substitute and presented it as established fact in the review summary. Phase 4 self-review requires checking for template carryover but does not require the Initializer to flag design decisions made in the absence of user direction. This gap should be closed: invented design decisions must be surfaced for explicit human confirmation before approval.

**Gap 4 — agents.md instruction: wrong reading order and unspecified authority hierarchy**
`$INSTRUCTION_AGENTS` Step 4 specifies the required reading order as: agents.md → vision → structure → index → role. The index must come second — before vision and structure — because those documents are referenced by `$VAR` names that cannot be resolved until the index is loaded. The instruction specifies the wrong order; the Initializer followed it and produced agents.md files with the wrong loading sequence.

Additionally, Step 6 instructs Curators to "state the resolution order explicitly" but provides no guidance on what that order should be. In the test run, the Initializer put the role document above the project vision in conflict resolution — inverting the intended authority hierarchy. The instruction should specify that vision takes precedence over structure, which takes precedence over role documents.

---

## Scope

**In scope:**
- `$A_SOCIETY_INITIALIZER_ROLE` Hard Rules: Add an explicit prohibition on shell commands, version control operations, and any action outside writing files to `a-docs/` and `a-society/feedback/`.
- `$A_SOCIETY_INITIALIZER_ROLE` Phase 2: Add a clarification that questions are for understanding the human's existing intent or practice — not for offering design decisions. The Initializer may document what the human intends; it does not design what the human has not decided.
- `$A_SOCIETY_INITIALIZER_ROLE` Phase 4: Add a self-review check requiring the Initializer to identify and flag any design decisions made in the absence of user direction, and confirm these with the human before proceeding to Phase 5.
- `$INSTRUCTION_AGENTS` Step 4: Correct the reading order — index must come second (after agents.md itself), before vision and structure, so `$VAR` references can be resolved throughout.
- `$INSTRUCTION_AGENTS` Step 6: Specify the expected authority hierarchy: project vision takes highest precedence, followed by structure, then the role document, then agents.md. The instruction should not leave this to the implementer's judgment.

**Out of scope:**
- Phase 5 consent protocol — covered in a separate flow (`20260311-initializer-phase5-consent`).
- The promo-agency agents.md produced during the test run — the human may correct it directly; no framework change is needed to address the specific artifact.

---

> **Responsibility transfer note:** None. Both target files remain under their current ownership. `$A_SOCIETY_INITIALIZER_ROLE` is an A-Society agent file; `$INSTRUCTION_AGENTS` is a general library instruction.

---

## Likely Target

- `$A_SOCIETY_INITIALIZER_ROLE` — Hard Rules, Phase 2, and Phase 4 sections
- `$INSTRUCTION_AGENTS` — Step 4 and Step 6

---

## Open Questions for the Curator

None. All four gaps are clearly identified with specific target sections and required changes. The Curator should propose concrete language for each. No judgment calls are required on scope or placement.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Initializer quality hardening — shell prohibition, Phase 2 scope, Phase 4 disclosure, and agents.md instruction fixes."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
