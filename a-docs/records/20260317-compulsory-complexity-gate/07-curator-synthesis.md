**Subject:** Compulsory complexity gate — Curator synthesis
**Flow:** 20260317-compulsory-complexity-gate
**Date:** 2026-03-17

---

## Synthesis

Both findings sets are aligned. No contradictions. Four actionable items to surface as triggers.

### What was built and whether it held up

The Phase 0 gate is now structural. The workflow graph has a new node (`owner-phase-0-plan`), a new edge to `owner-phase-1-briefing`, and a new Phase 0 section in the prose. The plan template has machine-readable YAML frontmatter that the TA can scope a validator against. The Owner role doc is updated so the gate is visible at the post-confirmation protocol — the point where an Owner session turns into active work.

The Owner's finding 5 is worth naming in synthesis: this flow ran under the gate it introduced. The plan artifact was produced, all five axes were assessed, the tier derived correctly as Tier 3, and the path correctly specified. The implementation constraint caught in Phase 2 review (`$A_SOCIETY_RECORDS` reference) was small and was applied correctly. The gate worked on first use.

### Actionable items — proposed as triggers for subsequent flows

**Trigger 1 — `$GENERAL_OWNER_ROLE`: add Phase 0 gate** `[S][LIB]`
The distributable Owner role template has the same gap this flow closed. It references complexity analysis in prose but has no artifact requirement and no gate. The pattern generalises: any project using the framework and `$INSTRUCTION_WORKFLOW_COMPLEXITY` needs the same gate in their Owner role. Curator proposes targeted edits to the workflow routing bullet and post-confirmation protocol; Owner reviews. Low-complexity — no open questions, targeted edits to one `general/` file.

**Trigger 2 — `$INSTRUCTION_WORKFLOW_COMPLEXITY`: reference plan template** `[S][LIB]`
The complexity instruction describes the plan artifact in prose but does not point to `$A_SOCIETY_COMM_TEMPLATE_PLAN` (or the general equivalent). An Owner reading it cold knows what to produce but must discover the template separately. Small discoverability improvement; no judgment calls. Curator proposes; Owner reviews.

**Trigger 3 — `agents.md`: fix Tooling Developer summary** `[S][MAINT]`
Line 28 of `$A_SOCIETY_AGENTS` reads "Implementing approved tooling components in Node.js". The `20260316-tooling-ts-migration` flow updated the role doc and other files but did not update the agents.md roles table. One-line drift. Owner-Tier-1 fix — no Curator brief needed.

**Trigger 4 — TA track: scope tooling enforcement mechanism** `[L]`
The approved decision for this flow named a subsequent TA track: after Phase 4 registration, the Owner directs the TA to scope the validator. The plan artifact YAML schema and the OQ1 validator requirements are the TA's inputs. This is a separate flow opened by the Owner directing a TA session.

---

## Flow Status

**Complete.** All four phases done; backward passes filed; no pending submissions.

**An Owner session is required next** for Triggers 3 and 4 — both require Owner action (Tier 1 execution and TA direction respectively). Triggers 1 and 2 require Owner briefs to the Curator; those briefs are written at the start of those flows.

---

## Handoff

Resume the existing Owner session (Session A).

Point it at: `a-society/a-docs/records/20260317-compulsory-complexity-gate/07-curator-synthesis.md`

The Owner needs to:
1. Execute the Tier 1 `agents.md` fix directly in Session A
2. Add Triggers 1–4 to the Next Priorities section of `$A_SOCIETY_LOG`
3. Direct the TA session for Trigger 4 when ready
