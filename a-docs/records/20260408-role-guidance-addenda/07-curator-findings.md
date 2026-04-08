# Backward Pass Findings: Curator — 20260408-role-guidance-addenda

**Date:** 2026-04-08
**Task Reference:** 20260408-role-guidance-addenda
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

- None.

### Missing Information

- None. The brief was fully specified; all 21 insertion points were verifiable against the live files.

### Unclear Instructions

- None. Impact classification required judgment but the protocol and precedent (v27.2) provided sufficient signal.

### Redundant Information

- None observed in the documents read or modified during this flow.

### Scope Concerns

- None. Authority boundaries were clear: three `general/` role templates, all requiring Owner approval; update report publication; version increment.

### Workflow Friction

- **Missed just-in-time read at two phase boundaries.** The A-Society Curator role document (`$A_SOCIETY_CURATOR_ROLE`) has a `## Just-in-Time Reads` section directing the Curator to read `$A_SOCIETY_CURATOR_IMPL_PRACTICES` before proposal preparation and again before implementation. I did not follow this pointer at either boundary. The work was approved without revisions, so no correction cycle resulted — but the step was skipped.

  **Root cause:** The just-in-time read directive is present and unambiguous in the role document. I read the role document at session start. The failure was execution discipline at phase transitions: when I received the brief, I focused on the brief's content and the target files, not on recalling the role document's pointer. When I received the approval, the same gap recurred. There is no external prompt at either phase boundary to activate the just-in-time read.

  **Design assessment:** The current design (just-in-time reads listed in the role document, not in required readings) is correct per the progressive context disclosure principle — loading implementation practices at session start would consume context for a document that may not be needed. The pointer mechanism is the right architecture. The gap is execution, not design.

  **What would help:** The directive could be positioned more prominently — for example, as a hard rule bullet ("Before preparing any proposal or beginning any implementation, read `$A_SOCIETY_CURATOR_IMPL_PRACTICES`") rather than a standalone `## Just-in-Time Reads` section that competes with the rest of the role document at session-start read time. Alternatively, the brief template could include a standard reminder line for just-in-time reads relevant to the receiving role. The current section heading "Just-in-Time Reads" is accurate but does not create a strong action signal at the moment it matters — which is not at session start but at phase entry.

  **Flagged as a potential framework contribution** — the pattern of just-in-time read non-execution likely applies to any role with phase-specific supplementary reads. Whether a structural fix belongs in the general Curator role template, the general brief template, or only the A-Society-specific role document is a design question for the Owner.

---

## Top Findings (Ranked)

1. **Just-in-time read not executed at proposal and implementation phase entries** — `$A_SOCIETY_CURATOR_ROLE` → `## Just-in-Time Reads`. Pointer was read at session start but not recalled at phase boundaries. No correction cycle resulted this flow; risk is higher in flows where implementation practices contain non-obvious constraints.

2. **No other friction.** The brief's insertion-point precision, the explicit source-claim verification request, and the clear impact-classification precedent made this an unusually smooth implementation flow. The 21 changes across 3 files all landed at correct positions without ambiguity.
