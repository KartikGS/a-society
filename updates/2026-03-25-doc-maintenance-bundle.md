# A-Society Framework Update — 2026-03-25

**Framework Version:** v22.0
**Previous Version:** v21.0

## Summary

Five changes across four `general/` files: three behavioral additions that create gaps in existing instantiations (Breaking), and two improvements to guidance clarity (Recommended). The Breaking changes affect the Curator role template (new required handoff verification step), the Owner role template (new concurrent-workflow routing rule), and the log instruction (third merge assessment criterion). Projects using the A-Society framework should review their instantiated role files and log instruction against this report.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 3 | Gaps in your current `a-docs/` — Curator must review and apply |
| Recommended | 2 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### 1. Curator Role Template — Pre-Handoff workflow.md Verification Step

**Impact:** Breaking
**Affected artifacts:** `general/roles/curator.md`
**What changed:** The Handoff Output section of the general Curator role template now opens with a required verification step: "Before issuing your handoff, verify the next step against the flow's `workflow.md`. Do not rely on memory of the workflow sequence." This step precedes the enumerated handoff instructions.
**Why:** Agents relying on memory of the workflow sequence have produced incorrect handoff targets — skipping planned workflow steps or routing to the wrong next role. Explicit pre-handoff verification against `workflow.md` eliminates this class of error.
**Migration guidance:** Open your project's Curator role document. In the `## Handoff Output` section, check whether the opening sentence directs the Curator to verify the next step against `workflow.md` before issuing a handoff. If absent, add the following sentence as the first line of the section, before any enumerated handoff instructions: "Before issuing your handoff, verify the next step against the flow's `$[PROJECT]_WORKFLOW` (or your project's equivalent). Do not rely on memory of the workflow sequence." Adapt the document reference to your project's variable for the active flow's `workflow.md`.

---

### 2. Owner Role Template — Concurrent Workflow Types Routing Rule

**Impact:** Breaking
**Affected artifacts:** `general/roles/owner.md`
**What changed:** The Workflow routing bullet in `## Authority & Responsibilities` now includes a constraint on concurrent workflow orchestration: "When the identified work requires two or more separate workflow types, the Owner routes them as separate flows for the user to execute independently. The Owner does not orchestrate concurrent flows within a single session."
**Why:** When a user's need spans multiple workflow types (e.g., a framework development flow and a tooling development flow), the Owner must not collapse them into a single orchestrated session. Doing so bypasses each workflow's designed role separation. The rule was distilled from an observed failure mode.
**Migration guidance:** Open your project's Owner role document. In the `## Authority & Responsibilities` section, find the Workflow routing bullet. Check whether it includes a rule prohibiting concurrent orchestration of multiple workflow types within a single session. If absent, append the rule to the end of the Workflow routing bullet: "When the identified work requires two or more separate workflow types, route them as separate flows for the user to execute independently. Do not orchestrate concurrent flows within a single session." Adapt phrasing to match your project's workflow nomenclature as needed.

---

### 3. Log Instruction — Third Merge Assessment Criterion

**Impact:** Breaking
**Affected artifacts:** `general/instructions/project-information/log.md`
**What changed:** The Merge Assessment in `## Next Priorities` now requires three conditions for mergeability, not two. The third criterion is: "Same workflow type and role path — both items would run through the same workflow type with the same role sequence." The introductory phrase was updated from "Two items are mergeable when both conditions are true:" to "Two items are mergeable when all three conditions are true:"
**Why:** The prior two criteria (same target files or design area; compatible authority level) were insufficient. Items that share the same files and authority level but require incompatible workflow types can be incorrectly merged, causing the bundled flow to violate one item's workflow requirements. The third criterion ensures only items that would run through the same role path can be merged.
**Migration guidance:** Open your project's log instruction (or the Merge Assessment section of your project's `improvement/main.md` or Owner role document if the merge assessment is declared there). Find the Merge Assessment block. Check whether it requires a third criterion: same workflow type and role path. If the criterion is absent, add it as item 3 in the conditions list and update the introductory phrase from "both conditions" to "all three conditions." Apply the same update wherever the merge assessment appears across your project's documents (e.g., in the Owner role file, improvement protocol, or synthesis phase instructions) to keep the criterion consistent.

---

### 4. Owner Role Template — Prose Insertions Guidance in Brief-Writing Quality

**Impact:** Recommended
**Affected artifacts:** `general/roles/owner.md`
**What changed:** A new `**Prose insertions:**` paragraph has been added to `## Brief-Writing Quality`, immediately after the existing `**Ordered-list insertions:**` paragraph. It directs the Owner to provide the exact target clause or phrase at the insertion boundary when a brief directs insertion into existing prose (not a list): acceptable forms are "after the clause ending '...X'," "before the sentence beginning 'Y'," or "replace the phrase 'Z' with."
**Why:** Existing guidance covered ordered-list insertions but not prose insertions. Briefs that named only the section for a prose insertion left the receiving role to infer the exact boundary — which produced ambiguity and correction rounds.
**Migration guidance:** Open your project's Owner role document. In `## Brief-Writing Quality`, check whether a prose insertions guidance paragraph follows the ordered-list insertions paragraph (if present). If absent, add the guidance: instruct the Owner to provide the exact target clause or phrase at the insertion boundary for any brief that directs prose insertion. The guidance should name acceptable boundary-specification forms.

---

### 5. General Improvement Template — Mandate Sentences Removed from Tooling Paragraph

**Impact:** Recommended
**Affected artifacts:** `general/improvement/main.md`
**What changed:** Two mandate sentences have been removed from the `**Tooling:**` block in `### Backward Pass Traversal`. Removed: "invoke it for every flow regardless of role count" and "When a Backward Pass Orderer tool is available, manual traversal computation is not permitted." Also removed: the preamble sentence "When the tool is available, use it — do not apply the manual traversal rules above as an alternative." The invocation reference, embedded instructions note, and bootstrapping exemption remain. The Tooling block now reads as an invocation reference rather than a mandate.
**Why:** The mandate for when to invoke the Backward Pass Orderer (and the prohibition on manual ordering when the tool is available) belongs at forward pass closure nodes — not in the improvement document, whose scope is the backward pass itself. Placing mandates in the improvement document duplicated them from the workflow's forward pass closure phase and gave them an incorrect home.
**Migration guidance:** Open your project's improvement document (typically `a-docs/improvement/main.md`). In the `### Backward Pass Traversal` section, find the `**Tooling:**` block. Check whether it contains mandate sentences ("invoke it for every flow," "manual traversal is not permitted," or "use it — do not apply the manual traversal rules"). If present, remove those mandate sentences, leaving only the invocation reference, embedded instructions note, and bootstrapping exemption. Verify that the mandate appears instead at your project's forward pass closure node(s) in the relevant workflow document(s) — if it is absent there, add it.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
