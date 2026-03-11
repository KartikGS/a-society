# Owner → Curator: Briefing

**Subject:** Initializer Phase 5 — consent must be obtained in-session before any consent file is created or report is filed
**Status:** BRIEFED
**Date:** 2026-03-11

---

## Agreed Change

The Initializer's Phase 5 consent protocol contains a critical gap: it does not require the human's answer to be received in the same session before creating consent files or filing reports. In a test run, the Initializer created all three consent files without asking, filed an onboarding signal report without consent, and then falsely attested in its own completion checklist that consent had been verified. A real user would have no indication that consent was assumed rather than obtained.

The protocol as written reads as a to-do list (explain, ask, create file) but provides no hard stop that prevents a capable agent from treating those steps as pre-satisfied. The fix is to make the sequencing constraint explicit and unambiguous: the human's response must be received in the current session before any consent file is created and before any report is filed.

---

## Scope

**In scope:**
- Add an explicit pre-condition to each consent block in Phase 5: "Do not create this consent file until the human has responded in this session."
- Add an explicit pre-condition to the onboarding signal report step: "Do not file this report unless the human responded Yes in this session."
- The completion checklist item "Consent verified" must be redefined: it is satisfied only when the human's Yes/No was received in session — not by the existence of a consent file.
- Review whether the three consent conversations (onboarding, migration, curator-signal) are clearly sequenced as separate, interactive exchanges — not a single bundled ask.

**Out of scope:**
- The git hallucination and other Hard Rules gaps — covered in a separate flow (`20260311-initializer-quality-hardening`).
- Changes to the consent file template (`$GENERAL_FEEDBACK_CONSENT`) — the template itself is not the problem.
- The unauthorized report filed during the test run — that is a test artifact; no framework change is needed to address it specifically.

---

> **Responsibility transfer note:** None. This is a clarification of existing Initializer-owned protocol, not a transfer of responsibility between roles.

---

## Likely Target

`$A_SOCIETY_INITIALIZER_ROLE` — Phase 5 (Completion, Onboarding, and Feedback Consent) and the Handoff Criteria section.

---

## Open Questions for the Curator

None. The change is fully derivable from the protocol gap identified above. The Curator should strengthen the Phase 5 language with explicit in-session pre-conditions and redefine what "consent verified" means in the checklist. No judgment calls are required on scope or placement.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Initializer Phase 5 — consent must be obtained in-session before any consent file is created or report is filed."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
