# A-Society Framework Update — 2026-03-11

**Framework Version:** v2.1
**Previous Version:** v2.0

## Summary

The Initializer's Phase 5 Feedback Consent block now registers each consent file in the project's `indexes/main.md` immediately after creation. This closes a gap introduced in v2.0 where consent files were created but not indexed. Existing initialized projects are not affected by the Initializer change, but any project that created consent files by following the v2.0 migration guidance should add index entries for those files.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 1 | If you created consent files per v2.0 guidance, register them in your project index |
| Optional | 0 | — |

---

## Changes

### 1. Initializer Phase 5 — Consent File Index Registration

**Impact:** Recommended
**Affected artifacts:** [`agents/initializer.md`]

**What changed:** Each consent-file creation block in Phase 5 now includes a registration sub-step. After creating each consent file (regardless of the consent answer), the Initializer adds the corresponding entry to the project's `indexes/main.md`:

- `$[PROJECT]_FEEDBACK_ONBOARDING_CONSENT` → `a-docs/feedback/onboarding/consent.md`
- `$[PROJECT]_FEEDBACK_MIGRATION_CONSENT` → `a-docs/feedback/migration/consent.md`
- `$[PROJECT]_FEEDBACK_CURATOR_SIGNAL_CONSENT` → `a-docs/feedback/curator-signal/consent.md`

Registration happens at creation time, before any conditional branch on the consent answer. The file exists regardless of the answer and must be findable regardless.

**Why:** Without index registration, any agent referencing a consent file must hardcode its path — violating the no-hardcode rule and creating index drift from the first initialization run after v2.0.

**Migration guidance:** This change only affects future initialization runs. However, if your project already created consent files by following the v2.0 migration guidance, those files are likely unregistered. Check your project's `indexes/main.md`:

1. If `$[PROJECT]_FEEDBACK_ONBOARDING_CONSENT` is absent and `a-docs/feedback/onboarding/consent.md` exists, add the entry.
2. If `$[PROJECT]_FEEDBACK_MIGRATION_CONSENT` is absent and `a-docs/feedback/migration/consent.md` exists, add the entry.
3. If `$[PROJECT]_FEEDBACK_CURATOR_SIGNAL_CONSENT` is absent and `a-docs/feedback/curator-signal/consent.md` exists, add the entry.

If the consent files were never created (the project skipped v2.0 guidance), no action is needed here — the Initializer handles registration automatically for new projects.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
