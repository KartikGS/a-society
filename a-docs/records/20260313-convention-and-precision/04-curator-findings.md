**Subject:** Convention and precision fixes — 2 changes
**Status:** COMPLETE (pending update report review)
**Date:** 2026-03-14

---

## Implementation Summary

Three edits implemented per `03-owner-to-curator.md`:

**Change 1 — No-update-report convention (`$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`)**
Added one sentence to Follow-Up Actions item 1: "If the assessment concludes no report is needed, record the determination and rationale in the Curator's backward-pass findings. No separate submission artifact is required." Sentence appended directly to the existing item, no structural change to the template.

**Change 2 Part A — Output-format flag (`$A_SOCIETY_OWNER_ROLE`)**
Added one paragraph under the label **"Output-format changes are not mechanical."** Placed immediately before the existing "Do not pre-specify update report classification" paragraph — both are named guidance items within the Brief-Writing Quality section, and this placement preserves the existing order while adding the new flag as a peer item.

**Change 2 Part B — Brief-Writing Quality section (`$GENERAL_OWNER_ROLE`)**
Added new `## Brief-Writing Quality` section after `## Post-Confirmation Protocol`, per the Owner's placement constraint. Section consists of two paragraphs: core principle and output-format exception. Followed by a `---` separator consistent with the file's existing style.

---

## Registration

No new files created. All three modified files are already registered in `$A_SOCIETY_INDEX`. No index update required.

---

## Update Report Assessment

**Determination: Update report required.**

**Trigger:** Change 2 Part B adds a new section to `$GENERAL_OWNER_ROLE`. Per `$A_SOCIETY_UPDATES_PROTOCOL`: "A new mandatory section has been added to any general template or instruction" is a publish trigger.

**Classification: Breaking.** The protocol states: "additive changes that make existing instantiations incomplete — for example, a new mandatory step added to a role template creates a gap in any project that instantiated the template before the addition." Any project that instantiated `$GENERAL_OWNER_ROLE` before this change now has an Owner role document without a Brief-Writing Quality section.

Changes 1 and 2 Part A are `a-docs/`-only — they do not affect adopting projects and do not contribute trigger conditions.

The update report draft will be submitted as `05-curator-to-owner.md` in this record.

---

## Cross-Layer Check

**`$A_SOCIETY_OWNER_ROLE` and `$GENERAL_OWNER_ROLE`:** Both now carry Brief-Writing Quality guidance. The A-Society version (Part A) retains A-Society-specific content (classification prohibition, update report protocol references); the general version (Part B) is project-agnostic. Structural parity confirmed — the two layers are complementary, not duplicates. No drift.

**`$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` and `$GENERAL_OWNER_ROLE`:** Change 1 adds a convention about negative update report determinations. The general Owner role template has no corresponding mechanism (no update report system in the general pattern). No cross-layer action required — the convention is A-Society-internal.

---

## Backward Pass

**What went well:** All three edits were targeted and non-disruptive. The two-paragraph structure for the `$GENERAL_OWNER_ROLE` section matches the brief's specification precisely. The placement constraint from the Owner (after Post-Confirmation Protocol, not Context Loading) was correctly applied.

**Findings — no action needed:**

1. The `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality section now has two named guidance items ("Output-format changes are not mechanical" and "Do not pre-specify update report classification") plus introductory prose. The section reads coherently. No structural issue.

2. The brief specified the output-format paragraph should be "a discrete paragraph or bullet following the existing guidance in the section." Implemented as a named paragraph (bold label, then prose), consistent with the "Do not pre-specify" paragraph immediately below it. Style is consistent.

**Findings — flagged for future consideration (out of scope for this flow):**

1. The `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` Follow-Up Actions item 1 now contains both the forward-pass instruction (check trigger conditions) and the negative-case convention (record in findings) in a single sentence-extended item. As the template grows, this item may benefit from a sub-structure (e.g., two sub-bullets). Not a gap now — flagging as a candidate for a future maint flow if the item grows further.

2. The `$GENERAL_OWNER_ROLE` has no update report concept (that is A-Society-specific infrastructure). If a future general feedback or reporting mechanism is ever added to the general pattern, the Brief-Writing Quality section's output-format guidance may be worth cross-referencing. Not a gap now.
