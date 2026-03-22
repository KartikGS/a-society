---
**Subject:** Log restructure — archive split and Next Priorities merge assessment
**Status:** BRIEFED
**Date:** 2026-03-22

> **Pre-send check (Variables):** `$A_SOCIETY_LOG_ARCHIVE` is a new variable introduced by this flow — it does not yet exist in `$A_SOCIETY_INDEX`. All other referenced variables are registered. The Curator registers `$A_SOCIETY_LOG_ARCHIVE` as part of Item 1c.

> **Count verify:** Four change items confirmed below.

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$A_SOCIETY_LOG` | modify |
| `$A_SOCIETY_LOG_ARCHIVE` (new — `a-society/a-docs/project-information/log-archive.md`) | additive |
| `$A_SOCIETY_INDEX` | modify |
| `$INSTRUCTION_LOG` | modify |
| `$GENERAL_IMPROVEMENT` | modify |
| `$GENERAL_OWNER_ROLE` | modify |
| `$A_SOCIETY_IMPROVEMENT` | modify |
| `$A_SOCIETY_OWNER_ROLE` | modify |

---

### Item 1: Log two-file model — archive split `[S][LIB][MAINT]`

**Problem:** `$A_SOCIETY_LOG` is exceeding agent read limits due to accumulated archive entries. The archive is a historical index — its detail is redundant with record folders and does not need to live in the main log.

**Change A — `$A_SOCIETY_LOG`** `[Curator authority — implement directly]` `[modify]`

Remove the `## Archive` section entirely. Replace it with a single line at the bottom of the file:

> Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow, append-only.

**Change B — New `$A_SOCIETY_LOG_ARCHIVE`** `[Curator authority — implement directly]` `[additive]`

Create `a-society/a-docs/project-information/log-archive.md`. Populate it with all entries currently in `$A_SOCIETY_LOG`'s `## Archive` section, condensed to one-liners using this format:

```
[scope-tags] — **slug** (YYYY-MM-DD): one sentence describing what changed.
```

The date is the close date of the flow. The slug matches the record folder identifier. The sentence covers the primary change at the highest level — no sub-items, no artifact lists. Order: most recent at top (same order as the current archive).

**Change C — `$A_SOCIETY_INDEX`** `[Curator authority — implement directly]` `[modify]`

Register the new variable:

| Variable | Current Path | Description |
|---|---|---|
| `$A_SOCIETY_LOG_ARCHIVE` | `a-society/a-docs/project-information/log-archive.md` | A-Society archived flow log — one-liner per closed flow; append-only |

**Change D — `$INSTRUCTION_LOG`** `[Requires Owner approval]` `[modify]`

Update the instruction to describe the two-file log model. Add a section or extend the existing archive guidance to cover:

- The main log has no Archive section; archives are maintained in a companion `log-archive.md` at `[project]/a-docs/project-information/log-archive.md`
- One entry per closed flow, format: `[scope-tags] — **slug** (YYYY-MM-DD): one sentence`
- Log-archive is append-only — entries are never edited after writing
- The main log contains a one-line pointer to the archive file

---

### Item 2: Next Priorities merge assessment `[S][LIB][MAINT]`

**Problem:** New Next Priorities items are filed discretely without assessing whether they overlap with existing items. This produces multiple small flows for work that could be done more cohesively in a single pass.

**Merge rule:** When any Next Priorities item is being added — whether by the Owner at intake or by the Curator surfacing from synthesis — the adding role must first scan existing Next Priorities items for merge opportunities.

Two items are mergeable when both conditions are true:
1. Same target files or same design area
2. Compatible authority level (both Curator-authority, or both requiring Owner approval)

When a merge is identified, replace the existing item(s) with a single merged item covering all consolidated work. The merged item retains the source citations of all constituent items.

**Change E — `$INSTRUCTION_LOG`** `[Requires Owner approval]` `[modify]`

Add merge assessment to the Next Priorities protocol in the instruction. Combined with Change D above — a single `$INSTRUCTION_LOG` modification covers both.

**Change F — `$GENERAL_IMPROVEMENT`** `[Requires Owner approval]` `[modify]`

Add a merge assessment step to the synthesis output protocol: before filing a new Next Priorities item, the synthesizing role checks existing priorities against the merge criteria. If a merge is warranted, the merged item replaces the originals.

**Change G — `$GENERAL_OWNER_ROLE`** `[Requires Owner approval]` `[modify]`

Add merge assessment obligation to the Next Priorities section: when adding any Next Priorities item, the Owner applies the merge criteria before filing.

**Change H — `$A_SOCIETY_IMPROVEMENT`** `[Curator authority — implement directly]` `[modify]`

Echo Change F in A-Society's own improvement document.

**Change I — `$A_SOCIETY_OWNER_ROLE`** `[Curator authority — implement directly]` `[modify]`

Echo Change G in A-Society's Owner role.

---

## Scope

**In scope:** Log two-file split; archive condensation; `$INSTRUCTION_LOG` update; Next Priorities merge rule across improvement and owner role documents; index registration.

**Out of scope:** Any changes to how Current State, Recent Focus, or Previous sections are managed. Changes to the backward pass protocol beyond the synthesis step. Any changes to how record folders are structured.

---

> **Responsibility transfer note:** None — no responsibility is moving between roles.

---

## Likely Target

- `$A_SOCIETY_LOG` — `a-society/a-docs/project-information/log.md`
- `$A_SOCIETY_LOG_ARCHIVE` — `a-society/a-docs/project-information/log-archive.md` (new)
- `$A_SOCIETY_INDEX` — `a-society/a-docs/indexes/main.md`
- `$INSTRUCTION_LOG` — `a-society/general/instructions/project-information/log.md`
- `$GENERAL_IMPROVEMENT` — `a-society/general/improvement/main.md`
- `$GENERAL_OWNER_ROLE` — `a-society/general/roles/owner.md`
- `$A_SOCIETY_IMPROVEMENT` — `a-society/a-docs/improvement/main.md`
- `$A_SOCIETY_OWNER_ROLE` — `a-society/a-docs/roles/owner.md`

---

## Open Questions for the Curator

1. Check whether `$A_SOCIETY_AGENT_DOCS_GUIDE` mentions the archive section by name and requires an update. If yes, add it to the proposal as a Curator-authority MAINT item.

Otherwise: None — scope, format, and merge criteria are fully specified. Proposal round is mechanical for all items except the open question above.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for log restructure — archive split and Next Priorities merge assessment."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
