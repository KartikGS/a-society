# Backward Pass Findings: Owner — 20260311-protocol-and-template-improvements

**Date:** 2026-03-11
**Task Reference:** 20260311-protocol-and-template-improvements
**Role:** Owner
**Depth:** Lightweight

---

## Findings

### Seconded from Curator

Both Curator findings are valid and seconded:

1. **"Update report required" language implies certainty the Owner doesn't have.** The Curator makes the update report determination by checking trigger conditions against the actual files changed. When the Owner writes "Update report required" in follow-up actions before that check has happened, it asserts an outcome that belongs to the Curator. The correct phrasing is "Assess whether an update report is required." The fix belongs in the decision template (`$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) — the follow-up actions placeholder should reflect this responsibility boundary.

2. **Fully-specified brief pattern confirmed.** Two flows now observed. The pattern holds: no open questions → mechanical proposal round → no revisions. Worth codifying in brief-writing guidance as a deliberate technique, not just an observed side effect.

---

### New Findings

**1. The decision template follow-up actions placeholder is the right fix target — but it is also an opportunity.**

The follow-up actions section in `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` currently has no structured guidance — it is a free-form field. The update report determination language is one fix, but the section more broadly could benefit from a short checklist of standing questions: Does this change require an update report? Does this flow require backward pass findings? Is a version increment pending? These are recurring questions after every decision. A light prompt in the template would prevent the language issue from recurring and reduce the chance of missing standard follow-up steps.

This is a candidate for a future small batch flow — not urgent enough for its own record.

---

## Top Findings (Ranked)

1. Decision template follow-up actions: "assess whether an update report is required" not "update report required" — actionable, fix in `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`
2. Decision template follow-up actions: opportunity for a standing checklist (update report assessment, backward pass, version increment) — small improvement, batch-eligible
3. Fully-specified brief pattern confirmed — two instances observed, ready to codify
