# Owner → Curator: Briefing

**Subject:** Initializer output hardening — absolute path checks, onboarding report quality, and Phase 5 duplicate statement
**Status:** BRIEFED
**Date:** 2026-03-12

---

## Agreed Change

Three gaps surfaced from the second promo-agency test run. All three affect `$A_SOCIETY_INITIALIZER_ROLE`. They are batched because they share a source event and are each small, targeted fixes with no inter-dependencies.

**Gap 1 — Absolute paths not caught by Phase 4 self-review**
The existing Phase 4 self-review check ("Are all cross-references using `$VARIABLE_NAME`?") does not catch two categories of absolute/hardcoded path that are not cross-references in the conventional sense:
- Role file paths in the agents.md roles table — these appeared as filesystem-absolute paths in the test run output instead of `$VAR` references.
- The agents.md pointer in the Phase 5 onboarding prompt — the Initializer used a machine-specific absolute path instead of a relative one.

The Phase 4 self-review needs two additional explicit checks covering these categories. Phase 5 also needs a reminder that the agents.md pointer must be a relative path, not machine-specific.

**Gap 2 — Onboarding signal report quality gaps**
Two weaknesses in how the Initializer produces the onboarding signal report:
- Phase 4 invented design decisions are not prompted as adversity log entries. When Phase 4 surfaces an invented design decision for human confirmation, that decision and its outcome (confirmed, modified, or rejected) belong in the report's adversity log. The Initializer correctly surfaces them in Phase 4 but does not carry them forward.
- The patterns section has no guard against self-contradictory entries: "None observed" followed immediately by an observation. Either the report template or Phase 5 guidance should make this contradiction structurally impossible or explicitly prohibited.

**Gap 3 — Duplicate completion statement in Phase 5**
"Initialization complete. This project's `a-docs/` is live." appears at the start of Phase 5 (step 1) and again in the Handoff Criteria. Both are currently specified in the protocol. The two instances serve different purposes — step 1 is orientation, Handoff Criteria is formal close — but they stack as a confusing repeat for real users. The step-1 instance should be removed or replaced with a brief orientation statement that does not duplicate the formal close. The fuller Handoff Criteria statement stays where it is.

---

## Scope

**In scope:**
- `$A_SOCIETY_INITIALIZER_ROLE` Phase 4 self-review: Add two explicit checks — (a) role table paths in agents.md output must use `$VAR` references, not filesystem-absolute paths; (b) agents.md pointer in Phase 5 onboarding prompt must be a relative path, not machine-specific.
- `$A_SOCIETY_INITIALIZER_ROLE` Phase 5: Add a reminder that the agents.md pointer must be a relative path. Also add guidance to carry Phase 4 invented design decision flags (and their confirmed outcomes) into the adversity log section of the onboarding signal report.
- `$A_SOCIETY_INITIALIZER_ROLE` Phase 5 or onboarding signal report template (Curator to advise): Add a guard against self-contradictory "None observed" entries in the patterns section.
- `$A_SOCIETY_INITIALIZER_ROLE` Phase 5 step 1: Remove or replace the duplicate "Initialization complete" opening statement. The Handoff Criteria statement is the canonical close and must not be pre-empted.

**Out of scope:**
- Changes to the promo-agency artifacts produced during the test run — the human may correct these directly.
- Any other Phase 4 or Phase 5 content not identified above.
- Changes to `$INSTRUCTION_AGENTS` or any `general/` file.

---

> **Responsibility transfer note:** None. `$A_SOCIETY_INITIALIZER_ROLE` remains under current ownership. If the patterns-section guard is placed in the onboarding signal report template rather than Phase 5 guidance, that template's ownership is unchanged.

---

## Likely Target

- `$A_SOCIETY_INITIALIZER_ROLE` — Phase 4 and Phase 5 sections
- Possibly the onboarding signal report template (for Gap 2 item b — Curator to propose)

---

## Open Questions for the Curator

1. **Gap 2b placement** — Should the "None observed" contradiction guard go in the onboarding signal report template itself (so it is always present regardless of which agent produces the report) or in the Phase 5 filing guidance (keeping the fix co-located with the other Phase 5 changes)? Propose whichever avoids splitting the fix across files unnecessarily.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Initializer output hardening — absolute path checks, onboarding report quality, and Phase 5 duplicate statement."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
