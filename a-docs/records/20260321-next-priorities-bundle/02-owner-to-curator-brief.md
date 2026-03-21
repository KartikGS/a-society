---

**Subject:** Next priorities bundle — guardrail ordering, records delimiter, index path adoption, brief placement guidance, classification scope
**Status:** BRIEFED
**Date:** 2026-03-21

> **Pre-send check (Variables):** `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_IMPROVEMENT`, `$INSTRUCTION_RECORDS`, `$A_SOCIETY_INDEX`, `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_UPDATES_PROTOCOL`, `$A_SOCIETY_RECORDS` — all registered in `$A_SOCIETY_INDEX`. ✓

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$GENERAL_IMPROVEMENT` | modify — swap guardrail order (Item A) |
| `$A_SOCIETY_IMPROVEMENT` | modify — swap guardrail order (Item A) |
| `$INSTRUCTION_RECORDS` | modify — add `---` delimiter requirement to workflow.md schema section (Item C) |
| `$A_SOCIETY_INDEX` | modify — update all 98 path rows to repo-relative format (Priority 2) |
| `$GENERAL_OWNER_ROLE` | modify — add placement requirement to Brief-Writing Quality section (Item B) + classification scope note (Item E) |
| `$A_SOCIETY_OWNER_ROLE` | modify — add classification scope note to Brief-Writing Quality section (Item E) |

---

**Item A** `[Curator authority — implement directly]` `[replace target: guardrail order]`

In both `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT`, swap the order of two guardrails so that the **forward pass closure boundary** guardrail appears before the **backward pass handoff completeness** guardrail. The current order is inverted relative to the logical sequence: an agent must close the forward pass before it can correctly execute the backward pass, so the forward pass closure guardrail should come first.

Source: synthesis of flow `20260321-index-paths-and-bp-handoffs`, item A.

---

**Item C** `[Curator authority — implement directly]` `[additive]`

In `$INSTRUCTION_RECORDS`, add the `---` YAML delimiter requirement to the workflow.md schema section. The requirement states that the YAML content must be wrapped in `---` frontmatter delimiters — opening `---` on line 1, closing `---` after the final field — and that a file missing either delimiter will cause a Component 4 parse failure.

This is the companion fix to the delimiter requirement already added to `$A_SOCIETY_RECORDS` in flow `20260321-index-paths-and-bp-handoffs`. `$INSTRUCTION_RECORDS` must carry the same requirement so that agents working in any project's `a-docs/` have the same constraint.

Source: synthesis of flow `20260321-index-paths-and-bp-handoffs`, item C.

---

**Priority 2** `[Curator authority — implement directly]` `[replace target: path format in all 98 rows]`

In `$A_SOCIETY_INDEX`, update all 98 path rows from the `/a-society/...` prefix form to the repo-relative form `a-society/...` — remove the leading `/` from every path in the Current Path column of the Index Table.

Flow `20260321-index-paths-and-bp-handoffs` established that repo-relative paths are required and machine-specific absolute paths are prohibited. `$A_SOCIETY_INDEX` still uses the `/a-society/...` style throughout, which now violates this rule. All 98 rows must be updated. No other changes to the index — existing variable names, descriptions, and row structure are unchanged.

Source: Next Priorities log, `$A_SOCIETY_INDEX` repo-relative path adoption item.

---

**Item B** `[Requires Owner approval — draft wording, return for review]` `[additive]`

Add an intra-section placement requirement to the Brief-Writing Quality section of `$GENERAL_OWNER_ROLE`:

When a brief directs the Curator to add an item to a numbered or ordered list, the Owner must specify the insertion position — not just the section name. Acceptable forms: "after item N", "before item N", or "as the new item N". A brief that names only the section leaves the Curator to infer position, which creates ambiguity and can require a correction round.

Draft wording that integrates cleanly into the existing Brief-Writing Quality section prose and return for Owner approval. The substance above is fixed; the Curator determines phrasing and paragraph placement.

Source: synthesis of flow `20260321-index-paths-and-bp-handoffs`, item B.

---

**Item E** `[Requires Owner approval — draft wording, return for review]` `[additive]`

Add a clarifying note to the Brief-Writing Quality section of both `$A_SOCIETY_OWNER_ROLE` and `$GENERAL_OWNER_ROLE`:

The classification pre-specification prohibition — which bars the Owner from stating an expected update report classification in a brief or in the main approval rationale — is scoped to those two specific contexts. Classification guidance in **update report phase handoffs** is permitted and is a positive practice. When the Owner directs the Curator to consult `$A_SOCIETY_UPDATES_PROTOCOL` and notes a likely classification as orienting guidance at that stage, that is not a violation. The prohibition exists to prevent the Curator from having to override framing locked in before implementation; guidance issued after implementation, when classification is actually determinable, does not carry that risk.

Draft wording that integrates cleanly into the existing Brief-Writing Quality section prose in both files and return for Owner approval in a single proposal.

Source: synthesis of flow `20260321-index-paths-and-bp-handoffs`, item E.

---

## Scope

**In scope:** Items A, C, Priority 2, B, and E as described above. No other changes to any of the six target files.

**Out of scope:** Priority 3 (workflow graph validator `human-collaborative` node field) — this routes through the Tooling Development workflow and is being handled in a separate concurrent flow.

---

## Likely Target

- `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` — guardrail section (Item A)
- `$INSTRUCTION_RECORDS` — workflow.md schema section (Item C)
- `$A_SOCIETY_INDEX` — Index Table, Current Path column (Priority 2)
- `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` — Brief-Writing Quality section (Items B and E)

---

## Open Questions for the Curator

None — substance is fully specified for all five items. For B and E, the Curator determines phrasing and paragraph placement that integrates cleanly with the existing Brief-Writing Quality text. No judgment calls are required on the substance.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Next priorities bundle — guardrail ordering, records delimiter, index path adoption, brief placement guidance, classification scope."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
