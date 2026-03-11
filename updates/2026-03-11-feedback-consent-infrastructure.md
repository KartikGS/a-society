# A-Society Framework Update — 2026-03-11

**Framework Version:** v2.0
**Previous Version:** v1.1

## Summary

The feedback consent infrastructure is now fully wired. The Curator role template has two new feedback-filing steps, the Initializer now manages all three consent conversations during Phase 5, and a curator-signal report template has been added to the library. Projects initialized before this update that have a Curator role are missing the new feedback steps in their Curator role file and may also be missing the feedback consent structure in their `a-docs/`.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap in your Curator role file — Curator must review and update |
| Recommended | 1 | Missing feedback consent structure — worth creating with human consent |
| Optional | 1 | Consent instruction clarification — informational, no `a-docs/` change required |

---

## Changes

### 1. Curator Role — Feedback Steps Added

**Impact:** Breaking
**Affected artifacts:** [`general/roles/curator.md`]

**What changed:** Two additions to the general Curator role template:

- **Version-Aware Migration** now has a step 6: after marking migration complete, the Curator checks `a-docs/feedback/migration/consent.md` and, if `Consented: Yes`, files a migration feedback report using `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` at `$A_SOCIETY_FEEDBACK_MIGRATION/[project]-[update-report-date].md`.
- **Pattern Distillation** now has a closing paragraph: after submitting a proposal to the Owner, independently of the approval outcome, the Curator checks `a-docs/feedback/curator-signal/consent.md` and, if `Consented: Yes`, files a curator-signal report using `$GENERAL_FEEDBACK_CURATOR_SIGNAL_TEMPLATE` at `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL/[project]-[YYYY-MM-DD].md`.

Both additions include an inline reference to `$INSTRUCTION_CONSENT` at the point of use.

**Why:** The feedback collection loop was incomplete. Curators performing migrations and pattern distillation had no steps to file feedback signal back to A-Society, even when consent had been granted.

**Migration guidance:** In your project's Curator role file (`a-docs/roles/curator.md`):

1. Locate the **Version-Aware Migration** section. After the current final step ("Do not mark migration complete until..."), add:
   > After marking migration complete, check `a-docs/feedback/migration/consent.md` (see `$INSTRUCTION_CONSENT` for the consent check procedure). If `Consented: Yes`, generate a migration feedback report using `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` and file it at `$[PROJECT]_FEEDBACK_MIGRATION/[project]-[update-report-date].md`. If consent is absent or `No`, note "Migration feedback skipped — consent not recorded" and continue.

2. Locate the **Pattern Distillation** section. After the line beginning "When a pattern passes all three:", add a new paragraph:
   > After submitting, independently of whether the Owner approves the proposal, check `a-docs/feedback/curator-signal/consent.md` (see `$INSTRUCTION_CONSENT`). If `Consented: Yes`, file a curator-signal report using `$GENERAL_FEEDBACK_CURATOR_SIGNAL_TEMPLATE` at `$[PROJECT]_FEEDBACK_CURATOR_SIGNAL/[project]-[YYYY-MM-DD].md`. The report captures observations regardless of approval outcome. If consent is absent or `No`, note "Curator-signal feedback skipped — consent not recorded" and continue.

Note: `$[PROJECT]_FEEDBACK_MIGRATION` and `$[PROJECT]_FEEDBACK_CURATOR_SIGNAL` are placeholders — map these to your project's index variables if they exist, or add them if they don't. The collection paths resolve to `a-society/feedback/migration/` and `a-society/feedback/curator-signal/` respectively.

---

### 2. Feedback Consent Structure — New Consent Files Needed

**Impact:** Recommended
**Affected artifacts:** [`agents/initializer.md`] (Initializer Phase 5 — what a correct `a-docs/` now contains)

**What changed:** The Initializer's Phase 5 now manages all three feedback consent conversations (onboarding signal, migration, curator-signal) instead of onboarding signal only. For migration and curator-signal, consent is asked only if a Curator role was created. Each consent is recorded in `a-docs/feedback/[type]/consent.md` using `$GENERAL_FEEDBACK_CONSENT`.

Projects initialized before this change do not have `a-docs/feedback/migration/consent.md` or `a-docs/feedback/curator-signal/consent.md`.

**Why:** Without consent files, the Curator's new feedback steps (Change 1 above) will always skip silently. Creating the consent files enables the feedback loop when the human agrees.

**Migration guidance:** If your project has a Curator role, ask the human whether they consent to each feedback type:

1. **Migration feedback:** "May A-Society write a migration feedback report to `a-society/feedback/migration/` after each update is applied? A migration report captures how clearly A-Society's update guidance worked, helping improve the framework."
   - Create `a-docs/feedback/migration/consent.md` using `$GENERAL_FEEDBACK_CONSENT`. Record the answer.

2. **Curator-signal feedback:** "May A-Society write a curator-signal report to `a-society/feedback/curator-signal/` after each backward pass? A curator-signal report captures patterns and gaps your Curator observed, as structured data for A-Society's library."
   - Create `a-docs/feedback/curator-signal/consent.md` using `$GENERAL_FEEDBACK_CONSENT`. Record the answer.

Register each created file in your project's index. If your project already has an `a-docs/feedback/onboarding/consent.md` (from initialization), the folder structure already exists — add the new sub-folders alongside it.

---

### 3. Consent Instruction — Initializer Now Owns All Three Consent Conversations

**Impact:** Optional
**Affected artifacts:** [`general/instructions/consent.md`]

**What changed:** The "When to Create Consent Files" table in `$INSTRUCTION_CONSENT` previously stated that `migration` and `curator-signal` consent files are created by the "Owner Agent". This has been corrected to "Initializer" for both types, with the condition "During initialization (Phase 5), if a Curator role was created."

**Why:** The Initializer now conducts all three consent conversations during Phase 5. The table was stale.

**Migration guidance:** No `a-docs/` change required. If your project's Owner role file or any documentation states that the Owner is responsible for creating migration or curator-signal consent files, update those references to reflect that this is now the Initializer's responsibility — but only at next relevant edit. No immediate action needed.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
