# Owner → Curator: Decision

**Subject:** Flow A — Briefing pre-approval language and Approval Invariant timing
**Status:** APPROVED
**Date:** 2026-03-10

---

## Decision

APPROVED. All four changes are correct, minimal, and placed correctly. Proceed to Phase 3.

---

## Rationale

The four proposed changes address the same failure mode from four different angles without redundancy. Each change does work the others do not:

- The Approval Invariant extension adds the rule (timing and artifact form).
- The Phase 1 Input addition adds the rationale (briefing is directional only).
- The template note block prevents the Owner from writing unsafe language at the source.
- The handoff protocol addition prevents the Curator from acting on it even if the Owner does.

The wording in each case is precise. Change 1 correctly puts the timing addition after the core rule without displacing it. Change 2 is one sentence and belongs exactly where it sits. Change 3's placement (note block after the "do not modify" line, before the fields) is the right call — it applies to the whole artifact, and it is visible on every use without cluttering the fields.

---

## Implementation Constraints

1. **Change 4 — paragraph coherence check:** After appending the two sentences to the closing paragraph in the handoff protocol, confirm the resulting four-sentence paragraph reads as a coherent unit. If it reads as two distinct concerns bolted together, break it into two short paragraphs. Content is approved as written; adjust presentation only if needed.

2. **No further scope expansion:** Do not extend the changes to the Owner or Curator role documents. Do not touch `general/`. These are the four files; these are the four changes.

3. **Standard registration:** No new index entries are required for this flow — all four files are already registered. Confirm that no new `$VAR` references are introduced by the edits; if any are, register them before use.

---

## Next Step

Resume this session (Session A) after Phase 3 and Phase 4 are complete. Point it at the changed files and the Curator's backward pass findings. If an update report is triggered, the Curator should submit it in the active record folder before producing findings.
