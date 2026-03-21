---

**Subject:** Update report draft — guardrail ordering, records delimiter, owner brief-writing quality (v17.2)
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-21

---

## Trigger

Flow `20260321-next-priorities-bundle` modified three `general/` files in ways that affect guidance adopting projects received at initialization. Per `$A_SOCIETY_UPDATES_PROTOCOL`, an update report is warranted.

---

## What and Why

Three changes to the distributed general library qualify:

1. **`$GENERAL_IMPROVEMENT`** — the two backward-pass guardrails were reordered: forward pass closure boundary now precedes backward pass handoff completeness. This is a change to existing content, not an addition.
2. **`$INSTRUCTION_RECORDS`** — the `workflow.md` schema section now documents the `---` frontmatter delimiter requirement, including the parse-failure consequence for missing delimiters. This is a new mandatory constraint added to existing guidance.
3. **`$GENERAL_OWNER_ROLE`** — two additive entries in the Brief-Writing Quality section: the ordered-list insertion position requirement (Item B) and the classification pre-specification prohibition with scope note (Item E).

All three are Recommended (no Breaking changes). Version increment: v17.1 → v17.2.

---

## Where Observed

A-Society — internal. Synthesis of flow `20260321-index-paths-and-bp-handoffs`, items A, B, C, E.

---

## Target Location

`$A_SOCIETY_UPDATES_DIR` — publish as `2026-03-21-next-priorities-bundle.md` upon Owner approval.
`$A_SOCIETY_VERSION` — update to v17.2 at the same time.

---

## Draft Content

```
# A-Society Framework Update — 2026-03-21

**Framework Version:** v17.2
**Previous Version:** v17.1

## Summary

This update corrects the order of two backward-pass guardrails in the improvement protocol, adds a required delimiter specification to the records instruction's `workflow.md` schema, and adds two brief-writing quality rules to the general Owner role template. All changes are Recommended.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 3 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Guardrail order corrected in improvement protocol

**Impact:** Recommended
**Affected artifacts:** [`general/improvement/main.md`]
**What changed:** The two backward-pass guardrails in the `### Guardrails` section were reordered. The **Forward pass closure boundary** guardrail now precedes the **Every backward pass handoff must include all three fields** guardrail.
**Why:** The previous order was inverted relative to logical sequence. An agent must close the forward pass before executing the backward pass — the closure boundary guardrail should come first because it governs whether the backward pass may begin at all. The handoff completeness guardrail governs what happens within the backward pass once it has legitimately started.
**Migration guidance:** Adopting projects with an instantiated `improvement/main.md` (typically at `$[PROJECT]_IMPROVEMENT`) should inspect the `### Guardrails` section. If the file has the **Every backward pass handoff must include all three fields** guardrail before the **Forward pass closure boundary** guardrail, swap their order. No content changes are needed — only the sequence of these two bullet points.

---

### `workflow.md` delimiter requirement added to records instruction

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/records/main.md`]
**What changed:** The `workflow.md` schema section in the records instruction now documents that the YAML content must be wrapped in `---` frontmatter delimiters: an opening `---` on line 1 and a closing `---` after the final field. The consequence of missing either delimiter — a Component 4 parse failure — is explicitly stated.
**Why:** The delimiter requirement is enforced by the Backward Pass Orderer parser. The instruction previously showed the schema without delimiters, leaving implementers to discover the requirement through parse failures rather than documentation.
**Migration guidance:** Adopting projects using the records system with a Backward Pass Orderer tool should verify that all `workflow.md` files in their record folders begin with `---` on line 1 and end with a closing `---` after the final field. If any `workflow.md` files are missing either delimiter, add them. Projects without a Backward Pass Orderer tool are unaffected. Also update the project's instantiated records instruction (`$[PROJECT]_RECORDS` or equivalent) if it contains its own copy of the `workflow.md` schema — add the delimiter requirement to that copy.

---

### Brief-Writing Quality additions to general Owner role template

**Impact:** Recommended
**Affected artifacts:** [`general/roles/owner.md`]
**What changed:** Two additions to the Brief-Writing Quality section:
1. **Ordered-list insertions** (new paragraph after Multi-file scopes): When a brief directs the downstream role to add an item to a numbered or ordered list, the Owner must specify the insertion position — not just the section name. Acceptable forms: "after item N," "before item N," or "as the new item N."
2. **Classification prohibition + scope note** (new paragraphs at end of section): Owners must not pre-specify update report classification in briefs or main approval rationale. This prohibition is scoped to those two contexts only — classification guidance in update report phase handoffs is permitted and is a positive practice.
**Why:** Both address imprecise briefs that require correction rounds. For ordered lists, position must be stated because the receiving role cannot safely infer it. For classification, pre-specification in briefs creates framing the implementing role must override; the scope note clarifies that post-implementation guidance at the update-report phase does not carry this risk.
**Migration guidance:** Adopting projects that have instantiated the general Owner role template as their own Owner role document should add both additions to their Brief-Writing Quality section. The ordered-list insertions note is a general quality rule applicable in any project. The classification prohibition and scope note apply to projects where the Owner role directs a downstream role to assess and produce framework update reports — adapt the language to reference the project's own update report protocol if applicable.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
```

---

## Implementation Status

**Implementation complete:** Yes — all five items from `02-owner-to-curator-brief.md` are implemented.
**Files changed:**
- `$GENERAL_IMPROVEMENT` — guardrail order swapped (Item A)
- `$A_SOCIETY_IMPROVEMENT` — guardrail order swapped (Item A)
- `$INSTRUCTION_RECORDS` — `---` delimiter requirement added (Item C)
- `$A_SOCIETY_INDEX` — all 84 path rows updated to repo-relative format (Priority 2)
- `$GENERAL_OWNER_ROLE` — ordered-list insertions paragraph added (Item B); classification prohibition + scope note added (Item E)
- `$A_SOCIETY_OWNER_ROLE` — classification scope note appended to existing prohibition (Item E)
**Publication condition outstanding:** Yes — Owner approval required before publishing to `$A_SOCIETY_UPDATES_DIR` and incrementing `$A_SOCIETY_VERSION`.

---

## Owner Confirmation Required

The Owner must respond in `07-owner-to-curator.md` with one of:
- **APPROVED** — Curator publishes the report to `$A_SOCIETY_UPDATES_DIR` as `2026-03-21-next-priorities-bundle.md` and updates `$A_SOCIETY_VERSION` to v17.2
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale
