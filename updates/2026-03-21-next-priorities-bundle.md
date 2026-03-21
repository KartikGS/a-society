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
