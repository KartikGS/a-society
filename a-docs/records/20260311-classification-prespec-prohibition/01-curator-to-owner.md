# Curator → Owner: Proposal / Submission

**Subject:** Update report classification — prohibition on Owner pre-specification
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-11

---

## Trigger

Backward pass findings from `20260311-thinking-folder-required` — both Curator (`06-curator-findings.md`) and Owner (`07-owner-findings.md`) identified the same root cause: the Owner pre-specified update report classification in the brief ("expected classification: Recommended") and in approval rationale, creating framing that required a correction round. The Curator's top finding and the Owner's two findings fold into one structural fix: prohibit classification pre-specification at the points where it occurs.

---

## What and Why

Update report impact classification is a Curator determination, made post-implementation by consulting `$A_SOCIETY_UPDATES_PROTOCOL`. When the Owner pre-specifies it — either in the brief or in approval rationale — the Curator inherits a conclusion that may be wrong and must either defer to it or spend a round correcting it. In this flow, the Owner's "Recommended" framing persisted into the proposal until the Curator verified against the protocol post-implementation and reclassified as Breaking, triggering an extra submission round (`04-curator-to-owner.md` → `05-owner-to-curator.md`) that would not have been needed otherwise.

The fix is declarative: add a prohibition in `$A_SOCIETY_OWNER_ROLE` (the behavioral contract) and a reinforcing note in `$A_SOCIETY_COMM_TEMPLATE_BRIEF` (the point of action). These two files together cover both occurrence points: the brief and the approval rationale.

---

## Where Observed

A-Society — internal. Backward pass synthesis from `20260311-thinking-folder-required`.

---

## Target Location

- `$A_SOCIETY_OWNER_ROLE` → `/a-society/a-docs/roles/owner.md`
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF` → `/a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md`

---

## Draft Content

### Change 1 — `$A_SOCIETY_OWNER_ROLE`: Extend "Brief-Writing Quality" section

**Append to the end of the existing "Brief-Writing Quality" section:**

```
**Do not pre-specify update report classification.** If the change described in a brief
may trigger a framework update report, do not state an expected impact classification.
Classification is determined by the Curator post-implementation by consulting
`$A_SOCIETY_UPDATES_PROTOCOL`. Stating a classification in the brief creates framing the
Curator must override — which adds a correction round rather than eliminating one.

The same applies to approval rationale for main decisions: do not comment on expected
classification when approving a content change. The Follow-Up Actions section directing
the Curator to check `$A_SOCIETY_UPDATES_PROTOCOL` is the correct mechanism — no
anticipation needed.
```

---

### Change 2 — `$A_SOCIETY_COMM_TEMPLATE_BRIEF`: Add note after Authorization scope

**Insert after the existing Authorization scope blockquote and before the `---` separator:**

```
> **Update report classification:** If this change may trigger a framework update report,
> do not state an expected classification in this brief. Classification is Curator-determined
> post-implementation by consulting `$A_SOCIETY_UPDATES_PROTOCOL`. Pre-specifying it
> creates framing the Curator must override.
```

---

## Owner Confirmation Required

The Owner must respond in `02-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `02-owner-to-curator.md` shows APPROVED status.
