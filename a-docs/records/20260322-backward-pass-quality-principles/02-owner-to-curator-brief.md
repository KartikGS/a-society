---
**Subject:** Backward pass quality — externally-caught errors and artifact vs. genuine analysis (2 additions)
**Status:** BRIEFED
**Date:** 2026-03-22

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$GENERAL_IMPROVEMENT` | additive — new subsection inserted after "What to Reflect On" |
| `$A_SOCIETY_IMPROVEMENT` | additive — echo subsection inserted after "Reflection Categories" |

**Item 1 — Add "Analysis Quality" subsection to `$GENERAL_IMPROVEMENT` Backward Pass Protocol** `[Requires Owner approval]` `[additive — insert after "What to Reflect On" section]`

Insert a new subsection titled **"Analysis Quality"** immediately after the "What to Reflect On" section in the Backward Pass Protocol. The subsection contains exactly two principles:

---

**Analysis Quality**

**Externally-caught errors are higher priority, not lower.** When an error was caught by another role or the human rather than surfaced by the agent themselves, this is a signal that something failed to prevent the error. The backward pass must ask: "Why wasn't this caught by me?" The answer "the rule was documented" is the start of the analysis, not the end. The next question — "why wasn't the documented rule followed?" — leads to placement gaps, surfacing gaps, or structural gaps, all of which are actionable.

**Artifact production vs. genuine analysis.** The reflection categories are a starting point, not a checklist to fill. If a finding could have been written without tracing the error, the analysis has not been done. A genuine finding names a specific root cause, not just a description of what went wrong.

---

**Why:** The backward pass on `20260322-general-lib-sync-bundle` initially dismissed two execution errors as "execution errors only, no documentation gap" — stopping at the first layer ("the rule is documented") rather than asking why the rule wasn't followed. Both errors were caught externally. The `$GENERAL_IMPROVEMENT` document currently has no language that establishes this deeper analysis obligation, or that flags externally-caught errors as a signal demanding extra scrutiny. These two additions close that gap for all projects using this framework.

**Item 2 — Echo "Analysis Quality" subsection to `$A_SOCIETY_IMPROVEMENT`** `[Curator authority — implement directly]` `[additive — insert after "Reflection Categories" section]`

Insert the same subsection content (title and both principles, verbatim) immediately after the "Reflection Categories" section in `$A_SOCIETY_IMPROVEMENT`. No adaptation required — these principles apply to A-Society's backward pass without modification.

---

## Scope

**In scope:**
- Adding the "Analysis Quality" subsection in the specified positions in both files
- Both principles must be present in both files; neither is optional

**Out of scope:**
- Modifications to the "What to Reflect On" / "Reflection Categories" sections themselves — those sections are unchanged
- Changes to the Guardrails sections
- Any other improvement documentation
- Framework update report assessment — Curator determines this post-implementation by consulting `$A_SOCIETY_UPDATES_PROTOCOL`

---

## Likely Target

- `$GENERAL_IMPROVEMENT` — `a-society/general/improvement/main.md`
- `$A_SOCIETY_IMPROVEMENT` — `a-society/a-docs/improvement/main.md`

Insertion point in both files: immediately after the "What to Reflect On" / "Reflection Categories" section and its closing line ("Ground every finding in a specific moment from your execution..."), before "Generalizable Findings".

---

## Open Questions for the Curator

None. Content and placement are fully specified. The proposal round is mechanical — draft the additions at the specified locations and return to Owner for review.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Backward pass quality — externally-caught errors and artifact vs. genuine analysis."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
