# A-Society Framework Update — 2026-03-11

**Framework Version:** v4.0 *(A-Society's version after this update is applied)*
**Previous Version:** v3.0 *(A-Society's version before this update)*

## Summary

The `thinking/` folder is now a required initialization artifact. Every project initialized with A-Society must have a `thinking/` folder containing three files: general principles (`main.md`), a reasoning framework (`reasoning.md`), and operational reminders (`keep-in-mind.md`). Projects initialized before this update do not have these files and have a gap in their foundational agent documentation.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### thinking/ folder required at initialization

**Impact:** Breaking
**Affected artifacts:** [`general/instructions/thinking/main.md`], [`agents/initializer.md`]
**What changed:** The `thinking/` folder is now a required initialization artifact. `$INSTRUCTION_THINKING`'s "When to Create This Folder" section previously presented the folder as conditional (deferred for minimal or single-role projects). That condition has been removed. The Initializer now creates `thinking/` as step 5 in Phase 3, before `agents.md`, for every project. The Handoff Criteria for the Initializer has been updated to include `thinking/` in the list of required foundational documents.
**Why:** The thinking folder's documents — principles, reasoning framework, and hard stops — are explicitly designed to be read by every agent regardless of role. The prior deferral condition waited for reasoning errors to appear before adding structure to prevent them, which reverses the framework's core bet: structure prevents problems before they occur. The three general templates require minimal project-specific knowledge to populate, so the initialization cost is low.
**Migration guidance:** Check whether your project's `a-docs/` contains a `thinking/` folder. If it does not, create it now using the three general templates:

1. Create `a-docs/thinking/main.md` from `$GENERAL_THINKING`. Customize by adding project-specific principles at the bottom; remove any that do not apply.
2. Create `a-docs/thinking/reasoning.md` from `$GENERAL_THINKING_REASONING`. Update role name references (e.g., "BA", "Tech Lead") to match your project's actual role names. Update any cross-reference variables to match your project's index.
3. Create `a-docs/thinking/keep-in-mind.md` from `$GENERAL_THINKING_KEEP_IN_MIND`. Add project-specific hard stops in each section as needed.

After creating all three files:
- Register them in your project's `indexes/main.md`:
  | Variable | Path | Description |
  |---|---|---|
  | `$[PROJECT]_THINKING` | `/[project]/a-docs/thinking/main.md` | General principles — cross-role operational rules |
  | `$[PROJECT]_THINKING_REASONING` | `/[project]/a-docs/thinking/reasoning.md` | Reasoning framework — how to think through problems |
  | `$[PROJECT]_THINKING_KEEP_IN_MIND` | `/[project]/a-docs/thinking/keep-in-mind.md` | Operational reminders — hard stops and common failure modes |
- Add a Universal Standards section to your project's `agents.md` referencing the three files, if one does not already exist:
  ```
  ### Universal Standards (ALL agents)
  - **General Principles:** `$[PROJECT]_THINKING`
  - **Reasoning Framework:** `$[PROJECT]_THINKING_REASONING`
  - **Keep in Mind:** `$[PROJECT]_THINKING_KEEP_IN_MIND`
  ```
- Add a `thinking/` rationale entry to your project's `a-docs-guide.md`.
- Update your project's `a-docs/a-society-version.md` Applied Updates log to record this report.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
