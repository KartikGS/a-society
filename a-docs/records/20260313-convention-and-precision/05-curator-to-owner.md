**Subject:** Convention and precision fixes — update report
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-14

---

## Trigger

Change 2 Part B added a new `## Brief-Writing Quality` section to `$GENERAL_OWNER_ROLE`. Per `$A_SOCIETY_UPDATES_PROTOCOL`, a new mandatory section added to a general template is a publish trigger. Impact is Breaking: any project that instantiated `$GENERAL_OWNER_ROLE` before this change has an Owner role document without this section.

---

## What and Why

The general Owner role template (`$GENERAL_OWNER_ROLE`) received a new `## Brief-Writing Quality` section. This section did not exist in any prior version of the template. Adopting projects that instantiated the Owner role before this change now have a gap: their Owner agent has no guidance on brief-writing quality or the output-format exception.

---

## Where Observed

A-Society — internal. See `04-curator-findings.md` for the update report determination rationale.

---

## Target Location

Publication target (pending approval): `$A_SOCIETY_UPDATES_DIR`/2026-03-14-brief-writing-quality.md

Version increment: `$A_SOCIETY_VERSION` from v6.0 → v7.0 (Breaking).

---

## Draft Content

```
# A-Society Framework Update — 2026-03-14

**Framework Version:** v7.0
**Previous Version:** v6.0

## Summary

A new `## Brief-Writing Quality` section has been added to the general Owner role template. Projects that initialized before this date have Owner role documents without this section. The section establishes guidance on writing fully-specified briefs and handling output-format changes — both of which affect how downstream roles receive and act on briefs from the Owner.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap in your current Owner role document — Curator must review |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### Brief-Writing Quality section added to Owner role template

**Impact:** Breaking
**Affected artifacts:** [`general/roles/owner.md`]
**What changed:** A new `## Brief-Writing Quality` section was added to the general Owner role template after `## Post-Confirmation Protocol`. The section contains two paragraphs: (1) when a change is fully derivable — no ambiguity about scope, target, or implementation approach — write a fully-specified brief and state "Open Questions: None" explicitly; this signals to the downstream role that no judgment calls are required; (2) output-format changes are an exception — any change introducing a new required field, template section, or required structural element in the output is not mechanical; the brief must explicitly specify the expected output form; "Open Questions: None" is only correct when the output form is also fully derivable from the brief.
**Why:** Without this section, Owner agents in adopting projects have no guidance on brief-writing quality or the output-format exception. Briefs that introduced new output formats have been declared "mechanical" with "Open Questions: None," leaving downstream roles to make unacknowledged design decisions and producing revision cycles that a well-specified brief would have prevented.
**Migration guidance:** Check your project's Owner role document (`$[PROJECT]_OWNER_ROLE`). If it does not contain a `## Brief-Writing Quality` section, add one after `## Post-Confirmation Protocol`. If your project does not use an update report or impact classification system, the general two-paragraph form applies verbatim. If your project's Owner role has project-specific brief-writing guidance already present, assess whether the output-format exception (paragraph 2) is already covered; add it if not.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
```

---

## Implementation Status

**Implementation complete:** Yes
**Files changed:** `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`, `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`
**Publication condition outstanding:** Yes — version increment (`$A_SOCIETY_VERSION` v6.0 → v7.0) and file publication to `$A_SOCIETY_UPDATES_DIR` pending Owner approval.

---

## Owner Confirmation Required

The Owner must respond in `06-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not publish or increment the version until `06-owner-to-curator.md` shows APPROVED status.
