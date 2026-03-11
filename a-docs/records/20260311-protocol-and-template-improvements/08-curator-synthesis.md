# Curator Synthesis — 20260311-protocol-and-template-improvements

**Date:** 2026-03-11
**Produced by:** Curator
**Source:** `06-curator-findings.md` + `07-owner-findings.md`

---

## Summary

Three findings across both backward passes. All three are actionable and naturally batch together — they all touch communication templates and brief-writing guidance. One new flow recommended.

---

## Findings Assessed

| # | Finding | Source | Actionable? | Proposed path |
|---|---|---|---|---|
| 1 | Decision template follow-up: "assess" not "required" for update reports | Curator + Owner (seconded) | Yes | New flow — fix `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` |
| 2 | Decision template follow-up: standing checklist opportunity | Owner (new) | Yes | Same flow — batch with Finding 1 |
| 3 | Fully-specified brief pattern: ready to codify | Curator + Owner (seconded) | Yes | Same flow — brief-writing guidance |

---

## Detail

**Finding 1 — Decision template language:**
`$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` likely has a free-form follow-up actions field. The Owner-facing language there (or in the role file) should make clear that "update report required" is not a determination the Owner makes — the Curator checks trigger conditions and decides. Replacing any "required" language with "assess whether an update report is required" is a one-sentence fix.

**Finding 2 — Standing checklist:**
The Owner identified an opportunity: a short prompt in the follow-up actions section covering the three recurring questions after every decision — (1) update report needed?, (2) backward pass findings needed?, (3) version increment pending? A light checklist prevents omissions without inflating the template. This is a natural companion to Finding 1's fix in the same template.

**Finding 3 — Fully-specified brief codification:**
Two flows in this session demonstrated the pattern. The brief template now has the "None" note for Open Questions, but the technique itself — that fully-specified briefs with no open questions enable mechanical proposal rounds — is not stated as a deliberate technique anywhere. A note in the brief template or the A-Society Owner role file about aiming for fully-specified briefs where the change is derivable from existing instructions would codify this as intentional practice.

---

## Proposed New Flow

**One flow covering all three findings.** All touch communication templates or brief-writing guidance for the Owner role. Batching them is efficient and appropriate — none is urgent individually.

Suggested slug: `20260311-decision-template-improvements`

Suggested scope for Owner brief:
1. `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` — fix "update report required" language and add standing follow-up checklist
2. `$A_SOCIETY_OWNER_ROLE` or `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — add note codifying fully-specified briefs as a deliberate technique (Owner should verify the better placement)

---

This record is complete. The Curator has no further actions here.
