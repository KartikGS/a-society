# A-Society Framework Update — 2026-03-12

**Framework Version:** v5.0
**Previous Version:** v4.1

## Summary

All Handoff Output sections in the general role instruction and templates have been updated to require a fourth item: copyable session inputs for the receiving role. Any project that instantiated the Owner or Curator role templates before this update is missing this item in their Handoff Output sections. Projects with additional workflow-participating roles (Analyst, Implementer, Reviewer, Coordinator, or Curator archetypes) should also review those role documents.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps in your current role documents — Curator must review and add item 4 to each Handoff Output section |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### Handoff Output: copyable session inputs (item 4)

**Impact:** Breaking
**Affected artifacts:** [`general/instructions/roles/main.md`], [`general/roles/owner.md`], [`general/roles/curator.md`]
**What changed:** A fourth item has been added to every Handoff Output section in the role instruction and general role templates. Item 4 requires the role to provide copyable session inputs for the receiving role at every pause point: always a copyable artifact path, and additionally a session-start prompt when a new session is required.

**Why:** Role handoffs require the human to load a handoff artifact into the receiving role. Before this change, no role template specified that this input should be provided in copyable form — the human had to compose it manually. For new sessions, the human additionally had to compose a session-start prompt. Both cases should be handled by the role, not improvised by the human.

**Migration guidance:** Inspect each role document in your project's `a-docs/roles/` that has a Handoff Output section. For each:

1. Check whether the Handoff Output section contains a fourth item specifying copyable session inputs.
2. If it does not, add the following as item 4:

For numbered-list format (Owner and Curator roles):
```
4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`
```

For prose-format roles (Analyst, Implementer, Reviewer, Coordinator, or custom archetypes):
Append to the existing Handoff Output sentence:
```
Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`)
```

3. Apply to every role document that has a Handoff Output section — not only Owner and Curator.
4. After updating, add a row to your project's `$[PROJECT]_VERSION_RECORD` Applied Updates log recording this report.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
