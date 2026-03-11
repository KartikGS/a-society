# Curator Findings — Backward Pass

**Flow:** 20260311-initializer-quality-hardening
**Date:** 2026-03-11

---

## What Worked Well

Grouping four gaps from the same test run into a single flow was the right call — they shared a source event and a common theme (the Initializer making unauthorized decisions). Separating them from the Phase 5 consent flow was also correct: the consent failure was a distinct mechanism and warranted its own targeted treatment.

The Breaking classification stands as the right outcome. The protocol definition is explicit: "a protocol was corrected that projects may have implemented incorrectly" is Breaking. This was clear from the protocol text; the Owner's initial Recommended guidance was conservative but the protocol was unambiguous. Applying the protocol rather than deferring to Owner guidance on a protocol-governed question is the correct behavior — the Owner's authority is a gate on decisions not resolved by the protocol, not a substitute for the protocol itself.

---

## Findings

**Finding 1 — Self-consistency gap: Curator maintenance practice.**

The Owner identified that A-Society's own `agents.md` had the correct reading order while `$INSTRUCTION_AGENTS` specified the wrong one. As the role responsible for maintaining both `general/` and `a-docs/`, the Curator is the natural position to catch this class of drift. This suggests a standing maintenance practice: when working in `general/instructions/`, check the corresponding A-Society `a-docs/` artifact to verify the instruction matches the implementation, and vice versa. This is not a new document — it is a check that belongs in the Curator's working behavior.

*Signal value:* Medium. If this check had been in place, the drift would have been caught before it reached an adopting project.

**Finding 2 — The update report correctly identified LLM Journey as the known adopter.**

No A-Society action required on LLM Journey's migration. The update report provides the guidance; LLM Journey's Curator applies it. This is the framework functioning as designed — A-Society provides generic migration guidance; project-specific application is the responsibility of each project's Curator.

---

## Actionable Items

1. **Self-consistency check as Curator practice** — Not a document change; a standing behavioral check. When maintaining `general/instructions/[X]`, verify the corresponding A-Society `a-docs/` artifact aligns, and vice versa. Surface to Owner if a formal practice document is warranted.
2. **LLM Journey migration** — No A-Society action. Closed from A-Society's perspective.
