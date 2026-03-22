# Backward Pass Findings: Owner — 20260322-log-restructure

**Date:** 2026-03-22
**Task Reference:** 20260322-log-restructure
**Role:** Owner
**Depth:** Full

---

## Assessment of Curator Findings

**Finding 1 (append-only vs. most recent at top — caught at Owner review): Endorsed with correction to root cause.**

The Curator attributes the inconsistency to a failure of proposal-stage semantic checking. That is accurate as far as it goes — but the inconsistency originated in the brief itself. The brief's Change A pointer line read: "Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow, append-only." The brief's Change B spec said: "Order: most recent at top." Both properties were present in the brief before the Curator drafted the proposal. The Curator faithfully reproduced the brief's language without checking for contradiction.

This means the fix belongs in two places, not one:
1. **Curator discipline (per Finding 1):** Check that proposed output language does not contain contradictory behavioral properties before submitting.
2. **Owner/brief discipline:** The same check applies at brief-drafting time. A brief that seeds ambiguous terminology transfers that ambiguity to every downstream artifact. Brief-Writing Quality should include: when specifying behavioral properties (ordering, mutability, timing), self-check for consistency before sending.

Route to synthesis: the upgrade to Brief-Writing Quality in `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` is a LIB+MAINT item.

**Finding 2 (brief paraphrase vs. verbatim source): Endorsed.**

Accurate and correctly classified as a Curator discipline rule. Low friction, no process change needed.

**Finding 3 (cross-layer consistency check caught stale reference): Endorsed.**

Positive confirmation that the standing check is working. No action required.

**Finding 4 (Write vs. Edit for large section removal): Endorsed.**

Valid practical observation. Routing to synthesis for a Curator-authority note.

---

## Owner Findings

### 1. First application of the merge assessment rule — confirmed effective

At forward pass closure, the five existing Next Priorities items were assessed for merge opportunities under the rule implemented by this flow. Items 2 and 5 (both `$INSTRUCTION_WORKFLOW` + `$A_SOCIETY_WORKFLOW*`, same authority level) were merged into a single item. The merge criteria were clear and the judgment was unambiguous. The Next Priorities list moved from five items to four.

This is a positive confirmation: the rule works for a straightforward case. No action required.

---

### 2. Brief-Writing Quality gap: behavioral property consistency check missing

As noted in the root-cause correction above, the brief introduced "append-only" alongside "most recent at top" without checking that the two properties were consistent. Brief-Writing Quality in `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` does not currently include a check for semantic consistency of proposed behavioral properties.

**Proposed addition:** After the output-format change requirements in Brief-Writing Quality, add: when a brief specifies behavioral properties (ordering, mutability, timing constraints), verify they are internally consistent before sending. A brief that seeds contradictory properties will have those contradictions reproduced in the proposal.

This is a `[S][LIB][MAINT]` item, combinable with Finding 1's Curator-side fix if the Curator's proposal quality guidance is similarly updated.

---

### 3. Forward pass closure scope violation — externally caught

At forward pass closure, the Owner's handoff statement listed backward passes pending for five flows: `workflow-mechanics-corrections`, `next-priorities-bundle`, `graph-validator-human-collaborative`, `general-lib-sync-bundle`, and `log-restructure`. The human correctly flagged this: at forward pass closure, the scope is the current flow only. Mentioning other flows' pending backward passes is out of scope and wrong.

Root cause: no rule in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` or `$A_SOCIETY_OWNER_ROLE` explicitly scopes the backward pass initiation statement at forward pass closure to the current flow. The Owner had visibility into the log's backward-pass-pending list and surfaced it without a rule preventing it.

This was caught externally, not by the Owner's own review — which makes it higher priority than a self-caught error.

**Proposed fix:** Add an explicit rule at the forward pass closure step in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` and `$INSTRUCTION_WORKFLOW`: at forward pass closure, the backward pass initiation is scoped to the current flow only. Other flows' backward pass status is not referenced. This is a `[S][LIB][MAINT]` item, combinable with the existing "workflow obligation consolidation" Next Priority (which already targets both `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` and `$INSTRUCTION_WORKFLOW`).

---

## Routing

| Finding | Disposition |
|---|---|
| Curator Finding 1 (root cause correction + Owner brief fix) | Route to synthesis — LIB+MAINT, two files |
| Curator Finding 2 (brief paraphrase → re-read discipline) | Route to synthesis — Curator-authority note |
| Curator Finding 3 (standing check positive confirmation) | No action |
| Curator Finding 4 (Write vs. Edit for large removal) | Route to synthesis — Curator-authority note |
| Owner Finding 2 (Brief-Writing Quality behavioral property check) | Route to synthesis — LIB+MAINT, bundleable with Finding 1 |
| Owner Finding 3 (forward pass closure scope violation — externally caught) | Route to synthesis — LIB+MAINT, bundleable with "workflow obligation consolidation" Next Priority |
