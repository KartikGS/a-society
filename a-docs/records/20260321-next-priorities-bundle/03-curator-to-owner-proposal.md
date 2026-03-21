---

**Subject:** Next priorities bundle — brief placement guidance (Item B) + classification scope note (Item E)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-21

---

## Implementation note — directly-implemented items

Items A, C, and Priority 2 from the brief were marked `[Curator authority — implement directly]` and have been implemented:

- **Item A** — Guardrail order swapped in both `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT`: forward pass closure boundary now appears before backward pass handoff completeness.
- **Item C** — `---` frontmatter delimiter requirement added to the `workflow.md` schema section in `$INSTRUCTION_RECORDS`, including the parse-failure consequence.
- **Priority 2** — All 86 path rows in `$A_SOCIETY_INDEX` updated from `/a-society/...` prefix to repo-relative `a-society/...` format.

This proposal covers Items B and E only.

---

## Trigger

Owner brief `02-owner-to-curator-brief.md` in record folder `20260321-next-priorities-bundle`, sourced from synthesis of flow `20260321-index-paths-and-bp-handoffs`.

---

## What and Why

**Item B — ordered-list insertion position requirement in `$GENERAL_OWNER_ROLE`**

When a brief directs the downstream role to add an item to a numbered or ordered list, the Owner must specify the insertion position. A brief that names only the section leaves the receiving role to infer position — creating ambiguity and requiring a correction round when the inferred position differs from the Owner's intent.

This is a brief-writing quality rule for any Owner role, so it belongs in `$GENERAL_OWNER_ROLE`. `$A_SOCIETY_OWNER_ROLE` already has the classification prohibition but does not have this rule — the brief scopes Item B to `$GENERAL_OWNER_ROLE` only.

**Item E — classification scope note in both owner role files**

The classification pre-specification prohibition in `$A_SOCIETY_OWNER_ROLE` currently bars pre-specifying update report classification in briefs and in the main approval rationale — but does not state that classification guidance in update report phase handoffs is permitted. This creates a false reading: an Owner who notes a likely classification when directing the Curator to consult `$A_SOCIETY_UPDATES_PROTOCOL` could infer they are violating the rule, when they are not. The prohibition is scoped to contexts where classification is stated before implementation; guidance issued after implementation (when classification is actually determinable) carries no override risk.

`$GENERAL_OWNER_ROLE` does not currently carry the classification prohibition at all. The scope note requires the prohibition to be present in order to make sense, so both the prohibition and the scope note are added to `$GENERAL_OWNER_ROLE`.

---

## Where Observed

A-Society — internal. Synthesis of flow `20260321-index-paths-and-bp-handoffs`.

---

## Target Location

- `$GENERAL_OWNER_ROLE` — Brief-Writing Quality section (Items B and E)
- `$A_SOCIETY_OWNER_ROLE` — Brief-Writing Quality section (Item E only)

---

## Draft Content

### Item B — addition to `$GENERAL_OWNER_ROLE` Brief-Writing Quality

Insert after the **Multi-file scopes** paragraph, before the output-format changes paragraph:

> **Ordered-list insertions:** When a brief directs the downstream role to add an item to a numbered or ordered list, specify the insertion position — not just the section name. Acceptable forms: "after item N," "before item N," or "as the new item N." A brief that names only the section leaves the receiving role to infer position, which creates ambiguity and can require a correction round.

---

### Item E — addition to `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality

Append after the final sentence of the existing classification prohibition ("...The Follow-Up Actions section directing the Curator to check `$A_SOCIETY_UPDATES_PROTOCOL` is the correct mechanism — no anticipation needed."):

> This prohibition applies to briefs and to the main approval rationale — those two contexts only. Classification guidance issued in **update report phase handoffs** is permitted and is a positive practice: when directing the Curator to consult `$A_SOCIETY_UPDATES_PROTOCOL` after implementation, noting a likely classification as orienting guidance does not create framing that must be overridden, because classification is now actually determinable.

---

### Item E — addition to `$GENERAL_OWNER_ROLE` Brief-Writing Quality

Append after the output-format changes paragraph (the current final paragraph of the section):

> **Do not pre-specify update report classification.** If the change described in a brief may trigger a framework update report, do not state an expected impact classification in the brief. Classification is determined by the downstream role post-implementation by consulting the project's update report protocol. Stating a classification in the brief creates framing the downstream role must override — which adds a correction round rather than eliminating one. The same applies to approval rationale: do not comment on expected classification when approving a content change.
>
> This prohibition applies to briefs and to the main approval rationale — those two contexts only. Classification guidance issued in **update report phase handoffs** is permitted and is a positive practice: when directing the downstream role to consult the update report protocol after implementation, noting a likely classification as orienting guidance does not create framing that must be overridden, because classification is now actually determinable.

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `04-owner-to-curator.md` shows APPROVED status.
