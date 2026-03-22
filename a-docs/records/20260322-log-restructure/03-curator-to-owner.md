---
**Subject:** Log restructure — archive split and Next Priorities merge assessment
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-22

---

## Trigger

Owner-initiated via brief `02-owner-to-curator-brief.md` (2026-03-22). `$A_SOCIETY_LOG` is exceeding agent read limits due to accumulated archive entries, and Next Priorities items are filed discretely without a merge check, producing multiple small flows for cohesive work.

---

## What and Why

Two problems, addressed together:

**1. Log archive growth.** The current `$A_SOCIETY_LOG` contains the Archive section inline. As flows accumulate, this section grows without bound, eventually exceeding agent read limits. The archive is historical — agents do not need it at orientation. Moving it to a companion `log-archive.md` keeps the main log within read limits while preserving traceability.

This generalizes to any project: any log following the rolling window model will face the same growth problem. The two-file model is the correct structural fix for any project type. `$INSTRUCTION_LOG` must describe this model for future adopters.

**2. Next Priorities merge gap.** Neither the project log instruction, the improvement synthesis protocol, nor the Owner role contains a rule requiring that new Next Priorities items be assessed for merge opportunities with existing items before filing. The result is item proliferation — separate flows for work that could be done cohesively. The merge rule is domain-agnostic: same-target-file / compatible-authority is a meaningful merge criterion for software, writing, and research projects equally.

---

## Where Observed

A-Society — internal. `$A_SOCIETY_LOG` archive size is the triggering observation. The Next Priorities merge gap was identified by the Owner at intake.

---

## Target Location

**LIB items (requiring Owner approval):**
- `$INSTRUCTION_LOG` — `a-society/general/instructions/project-information/log.md`
- `$GENERAL_IMPROVEMENT` — `a-society/general/improvement/main.md`
- `$GENERAL_OWNER_ROLE` — `a-society/general/roles/owner.md`

**MAINT items (Curator-authority — implement directly):**
- `$A_SOCIETY_LOG` — `a-society/a-docs/project-information/log.md`
- `$A_SOCIETY_LOG_ARCHIVE` (new) — `a-society/a-docs/project-information/log-archive.md`
- `$A_SOCIETY_INDEX` — `a-society/a-docs/indexes/main.md`
- `$A_SOCIETY_IMPROVEMENT` — `a-society/a-docs/improvement/main.md`
- `$A_SOCIETY_OWNER_ROLE` — `a-society/a-docs/roles/owner.md`
- `$A_SOCIETY_AGENT_DOCS_GUIDE` — `a-society/a-docs/a-docs-guide.md` *(see Open Question resolution below)*

---

## Open Question Resolution

**"Check whether `$A_SOCIETY_AGENT_DOCS_GUIDE` mentions the archive section by name and requires an update."**

**Answer: Yes.** The `log.md` entry in `$A_SOCIETY_AGENT_DOCS_GUIDE` states under "What it owns":

> Current project status label, the rolling window of completed flows (one Recent Focus, up to three Previous), the ordered next priorities list with scope tags and source references, and **the archive of older completed entries**.

After the archive split, the log no longer owns the archive entries — it owns a pointer to `log-archive.md`. The guide entry requires two updates:
1. Replace "and the archive of older completed entries" with "and a pointer to the companion archive file"
2. Add a new entry for `$A_SOCIETY_LOG_ARCHIVE`

Both are within `a-docs/` — adding as **Change J** (Curator-authority MAINT).

---

## Draft Content

### Change A — `$A_SOCIETY_LOG` `[Curator authority — implement directly]`

Remove the `## Archive` section and all entries within it. Replace with a single line at the bottom of the file:

> Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow, append-only.

---

### Change B — `$A_SOCIETY_LOG_ARCHIVE` (new file) `[Curator authority — implement directly]`

Create `a-society/a-docs/project-information/log-archive.md`. Full content below. Entries are condensed from the current `$A_SOCIETY_LOG` Archive section; compound entries (multiple record folders in one archive bullet) are split into individual entries per flow. Order: most recent at top.

```markdown
# A-Society: Flow Archive

One entry per closed flow. Append-only — entries are never edited after writing. Most recent at top.

Format: `[scope-tags] — **slug** (YYYY-MM-DD): one sentence.`

---

- `[S][MAINT]` — **workflow-terminal-node-fix** (2026-03-21): Added terminal nodes to Framework Dev and Tooling Dev YAML graphs; forward-pass closure sections added to both workflows.
- `[S][LIB][MAINT]` — **index-paths-and-bp-handoffs** (2026-03-21): Required repo-relative paths in `$INSTRUCTION_INDEX`; backward pass handoff completeness guardrail added to `$GENERAL_IMPROVEMENT`; framework update report v17.1.
- `[M][LIB][MAINT]` — **parallel-track-records-fix** (2026-03-21): Added parallel-track sub-labeling convention and forward-pass closure boundary guardrail to records and improvement docs; framework update report v17.0.
- `[L][LIB][MAINT]` — **backward-pass-orderer-redesign** (2026-03-20): Component 4 redesigned with record-folder input model and enriched `BackwardPassPlan` output; records and improvement docs updated; framework update report v16.0.
- `[S][LIB][MAINT]` — **session-startup-logic** (2026-03-20): Fixed structural contradiction causing hedged session-startup directives across workflow, instructions, and role templates; framework update report v15.1.
- `[S][LIB]` — **curator-synthesis-enforcement** (2026-03-20): Added prohibition on synthesis role queueing maintenance items when they have direct authority to fix them; framework update report v15.0.
- `[M][LIB][MAINT]` — **next-priorities-bundle** (2026-03-20): Five items closed — version field parsing, variable integrity check, multi-file scope guidance, sequence tail reference stability, Component 4 documentation alignment; framework update report v14.1.
- `[L][LIB][MAINT]` — **graph-schema-simplification** (2026-03-19): Simplified workflow graph schema to nodes-and-edges only; backward pass removed as workflow phase and redirected to improvement docs; framework update report v14.0.
- `[L]` — **utils-bp-trigger-tool** (2026-03-18): Created shared `utils.ts`; added `generateTriggerPrompts` and `orderWithPromptsFromFile` to Component 4; invocation and coupling map docs updated.
- `[L][LIB][MAINT]` — **process-gap-bundle** (2026-03-18): Nine priorities closed — Approval Invariant, MAINT exemption, existing-session handoff format, records Phase 0 alignment, tooling governance; framework update report v13.0.
- `[M][LIB][MAINT]` — **general-phase0-gate** (2026-03-17): Plan-before-brief gate added to Owner routing; `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` created and registered; framework update report v12.0.
- `[L][MAINT]` — **compulsory-complexity-gate** (2026-03-17): Phase 0 formalized in A-Society workflow graph with new node and template; Owner role updated with plan-before-brief protocol.
- `[L][LIB][MAINT]` — **human-collaborative-phases** (2026-03-14): Role documents and workflow phases updated to fully agentic model; `Human-collaborative` field added to workflow phase definition; framework update report v9.0.
- `[L][LIB][MAINT]` — **improvement-folder-redesign** (2026-03-14): Six design decisions — traversal algorithm, synthesis path, file collapse, mandatory inclusion, generalizable findings, mandatory backward pass; framework update report v8.0.
- `[L][LIB]` — **workflow-instruction-improvements** (2026-03-14): Nine improvements to `$INSTRUCTION_WORKFLOW` — session model mandatory, Owner entry/terminal node, session reuse rules, backward pass section; framework update report v6.0.
- `[S][MAINT]` — **maint-bundle** (2026-03-13): Four targeted MAINT changes — Initializer question quality, workflow session rules, records slot naming, Curator cross-layer framing.
- `[M][LIB][MAINT]` — **handoff-copyable-prompt** (2026-03-12): Two-case copyable session input model added to all Handoff Output sections across six role documents; framework update report v5.0.
- `[S][ADR]` — **workflow-entry-and-log-ownership** (2026-03-12): Backward-pass streamlined entry gate added to A-Society workflow; project log write authority formalized between Owner and Curator.
- `[S]` — **initializer-output-hardening** (2026-03-12): Initializer Phase 4 self-review extended with absolute-path checks; Phase 5 adversity log filing instruction added.
- `[M][LIB]` — **variable-retirement-protocol** (2026-03-11): Variable Retirement five-step protocol added to `$INSTRUCTION_INDEX`; Invariant 4 updated; framework update report v4.1.
- `[S][MAINT]` — **curator-maint-template-and-crosslayer** (2026-03-11): Conversation template "omit header" instructions and Curator Standing Checks section added.
- `[M][LIB]` — **thinking-folder-required** (2026-03-11): thinking/ folder required at initialization; framework update report v4.0.
- `[S][MAINT]` — **classification-prespec-prohibition** (2026-03-11): Update report classification pre-specification prohibition added to Owner role and brief template.
- `[S][MAINT]` — **initializer-phase5-consent** (2026-03-11): Consent bypass vulnerability closed — sequencing header, per-block wait pre-conditions, and report filing gate added to Initializer Phase 5.
- `[M][LIB]` — **initializer-quality-hardening** (2026-03-11): Four Initializer gaps fixed — Shell/VCS prohibition, Phase 2 scope boundary, Phase 4 design-decision check, `$INSTRUCTION_AGENTS` corrections; framework update report v3.0.
- `[L][LIB][MAINT]` — **feedback-consent-infrastructure** (2026-03-11): Feedback consent infrastructure wired end-to-end — curator-signal template added, public index consolidated, Initializer Phase 5 restructured; framework update reports v2.0 and v2.1.
- `[S][LIB][MAINT]` — **initializer-consent-registration** (2026-03-11): Initializer consent registration consolidated; related index and template cleanup.
- `[M][LIB][MAINT]` — **protocol-and-template-improvements** (2026-03-11): Five backward-pass learnings codified, Breaking classification extended, brief template hardened.
- `[S][LIB][MAINT]` — **decision-template-improvements** (2026-03-11): Follow-Up Actions section and Brief-Writing Quality section added to decision template and Owner role.
- `[S][MAINT]` — **retire-todo-folder** (2026-03-10): `a-docs/todo/` removed; associated index variables and guide entries retired.
- `[M][MAINT]` — **briefing-preapproval** (2026-03-10): Implementation-authorization gap in briefing closed — Approval Invariant extended, Phase 1 input clarification, brief template and handoff protocol hardened.
- `[S][MAINT]` — **curator-maint-bundle** (2026-03-10): Three Curator-authority items closed — update report submission requirements, implementation status section, within-flow sequencing rule.
- `[L][LIB]` — **handoff-protocol** (2026-03-08): Workflow routing made the default Owner entry path; mandatory Handoff Output guidance added to role standard; framework update report v1.0.
- `[S]` — **a-docs-guide-rename** (2026-03-08): Renamed `agent-docs-guide.md` → `a-docs-guide.md`; all references and index variable updated.
- `[M]` — **records-infrastructure** (2026-03-08): Flow-level artifact tracking established under `a-docs/records/`; identifier format, artifact sequence, and placement rules defined; `improvement/reports/` folder retired.
- `[M][LIB]` — **owner-universal-entry** (2026-03-08): Workflow routing responsibility and post-confirmation protocol added to Owner role; framework update report: Recommended.
- `[L][LIB]` — **graph-based-workflow-model** (2026-03-07): Extended workflow framework to full graph model supporting nodes, edges, instances, branching, and multi-graph projects; framework update report: Recommended.
```

---

### Change C — `$A_SOCIETY_INDEX` `[Curator authority — implement directly]`

Add the following row to the index table (after the `$A_SOCIETY_LOG` row):

| Variable | Current Path | Description |
|---|---|---|
| `$A_SOCIETY_LOG_ARCHIVE` | `a-society/a-docs/project-information/log-archive.md` | A-Society archived flow log — one-liner per closed flow; append-only |

---

### Change D — `$INSTRUCTION_LOG` `[Requires Owner approval]`

**Three targeted modifications:**

**D1 — Entry Lifecycle section:** Change the archival bullet from:

> - When a fourth `Previous` entry would be added, the oldest is moved to the `## Archive` section

To:

> - When a fourth `Previous` entry would be added, the oldest is moved to the companion archive file (see Archive File below)

**D2 — Replace `### 4. Archive` section** with:

> ### 4. Archive File
>
> The archive lives in a companion file: `[project]/a-docs/project-information/log-archive.md` — separate from the main log. The main log does not contain an `## Archive` section. Instead, it ends with a single pointer line:
>
> > Archived flows are recorded in `$[VARIABLE_NAME]`. One entry per flow, append-only.
>
> The archive file uses this format for each entry:
>
> ```
> [scope-tags] — **slug** (YYYY-MM-DD): one sentence describing what changed.
> ```
>
> - **Date** — the close date of the flow.
> - **Slug** — matches the record folder identifier (if the project uses records).
> - **Sentence** — covers the primary change at the highest level; no sub-items, no artifact lists.
> - **Order** — most recent at top; new entries are prepended, not appended.
> - **Append-only** — entries are never edited after writing.
>
> The archive is not read at orientation. It exists for historical traceability when agents need to understand what predates the rolling window.

**D3 — How to Write One, Step 5:** Change from:

> **Step 5 — Create the archive section.**
> Start it empty, or pre-populate it with any completed work that predates the log's creation. The archive is the log's memory; keep it present but out of the way.

To:

> **Step 5 — Create the archive file.**
> Create `log-archive.md` as a companion file in the same `project-information/` folder as the main log. Start it empty, or pre-populate it with completed flows that predate the log's creation, using the one-liner format above. Add the pointer line at the bottom of the main log referencing the archive file by `$VARIABLE_NAME` from the project's index.

**D4 — Format Rules:** Change the archive rule from:

> **Archive everything, delete nothing.** Moving entries to archive preserves traceability while keeping the active view clean.

To:

> **Archive everything, delete nothing.** When an entry ages out of the rolling window, prepend it to `log-archive.md` in one-liner format. This preserves traceability while keeping the active log scannable.

---

### Change E — `$INSTRUCTION_LOG` (Next Priorities section) `[Requires Owner approval]`

Combined with Change D — single modification to `$INSTRUCTION_LOG`.

Add the following subsection at the end of **`### 3. Next Priorities`**:

> **Merge Assessment**
>
> Before adding any Next Priorities item — whether at intake or from a synthesis pass — scan existing Next Priorities items for merge opportunities. Two items are mergeable when both conditions are true:
>
> 1. **Same target files or same design area** — they touch the same document(s) or the same conceptual area.
> 2. **Compatible authority level** — both are same-role authority (both the same implementing role, or both requiring the same approval path).
>
> When a merge is identified, replace the existing item(s) with a single merged item covering all consolidated work. The merged item retains the source citations of all constituent items.

---

### Change F — `$GENERAL_IMPROVEMENT` `[Requires Owner approval]`

In **`### How It Works`**, step 5, after the bullet for "Changes outside `a-docs/`", add a merge assessment note:

Current step 5 ending:

> - Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create an entry for a future flow using the project's tracking mechanism. Do not initiate an Owner approval loop from within the backward pass.

Replace that bullet with:

> - Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create an entry for a future flow using the project's tracking mechanism. **Before filing**, apply the merge assessment: scan existing Next Priorities items for same target files/design area and compatible authority level; when a merge is identified, replace the existing item(s) with a merged item retaining all source citations. Do not initiate an Owner approval loop from within the backward pass.

---

### Change G — `$GENERAL_OWNER_ROLE` `[Requires Owner approval]`

Add the following bullet to the **`The Owner owns:`** list in **`## Authority & Responsibilities`**:

> - The project log — all sections (Current State, Recent Focus, Previous, and Next Priorities). The log entry for a closed flow is written at Forward Pass Closure. When adding any Next Priorities item (at intake or when receiving synthesis findings), apply the **merge assessment** before filing: scan existing items for (1) same target files or same design area, and (2) compatible authority level. When a merge is identified, replace the existing item(s) with a merged item retaining all source citations.

---

### Change H — `$A_SOCIETY_IMPROVEMENT` `[Curator authority — implement directly]`

Echo Change F. In **`### How It Works`**, step 5, update the "Changes outside `a-docs/`" bullet identically to Change F, substituting `$A_SOCIETY_LOG` for "the project's tracking mechanism":

> - Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create a Next Priorities entry in `$A_SOCIETY_LOG`. **Before filing**, apply the merge assessment: scan existing Next Priorities items for same target files/design area and compatible authority level; when a merge is identified, replace the existing item(s) with a merged item retaining all source citations. Do not initiate an Owner approval loop from within the backward pass.

---

### Change I — `$A_SOCIETY_OWNER_ROLE` `[Curator authority — implement directly]`

Echo Change G. Update the project log bullet in **`## Authority & Responsibilities`** (currently line 29):

Current:

> - The project log `$A_SOCIETY_LOG` — all sections (Current State, Recent Focus, Previous, Archive, and Next Priorities). The log entry recording a closed flow is written by the Owner at Forward Pass Closure. Next Priorities items are added when surfaced from backward pass findings and removed when their flows close.

Replace with:

> - The project log `$A_SOCIETY_LOG` — all sections (Current State, Recent Focus, Previous, and Next Priorities). Archived flows are in `$A_SOCIETY_LOG_ARCHIVE`. The log entry recording a closed flow is written by the Owner at Forward Pass Closure. When adding any Next Priorities item (at intake or when receiving synthesis findings), apply the **merge assessment** before filing: scan existing items for (1) same target files or same design area, and (2) compatible authority level. When a merge is identified, replace the existing item(s) with a merged item retaining all source citations. Items are removed when their flows close.

---

### Change J — `$A_SOCIETY_AGENT_DOCS_GUIDE` `[Curator authority — implement directly]`

*(Added from open question resolution.)*

**J1 — Update the `log.md` entry.** In the "What it owns" line for `project-information/log.md`:

Change:

> Current project status label, the rolling window of completed flows (one Recent Focus, up to three Previous), the ordered next priorities list with scope tags and source references, and the archive of older completed entries.

To:

> Current project status label, the rolling window of completed flows (one Recent Focus, up to three Previous), the ordered next priorities list with scope tags and source references, and a pointer to the companion archive file.

**J2 — Add a new entry for `$A_SOCIETY_LOG_ARCHIVE`** immediately after the `log.md` entry:

> ### `project-information/log-archive.md` — `$A_SOCIETY_LOG_ARCHIVE`
>
> **Why it exists:** The main log is bounded — one Recent Focus, up to three Previous. As flows accumulate, older entries must have a permanent home that is not the main log. Without a companion archive file, the main log grows without bound and eventually exceeds agent read limits. The archive file is append-only and not loaded at orientation; it is consulted only when historical traceability is needed.
>
> **What it owns:** All closed flow entries older than the rolling window, in one-liner format: `[scope-tags] — **slug** (YYYY-MM-DD): one sentence`. Most recent at top.
>
> **What breaks without it:** Archived entries either accumulate in the main log (making it too long to read) or are discarded (losing historical traceability).
>
> **Do not consolidate with:** `project-information/log.md` — the main log is a current-state summary loaded at every session; the archive is historical storage not loaded at orientation.

---

## Update Report Draft

*(Changes D, E, F, G modify `general/` files. A framework update report is required per `$A_SOCIETY_UPDATES_PROTOCOL`.)*

---

**Report:** `[date]-log-restructure.md`
**Framework version:** [to be filled at implementation — current version at time of report]
**Summary:** Four changes to `general/` — two-file log model (archive split), and merge assessment rule for Next Priorities in three documents.

---

### Impact Summary

| Impact | Count |
|---|---|
| Breaking | 0 |
| Recommended | 4 |
| Optional | 0 |

---

### Change 1 — Two-file log model

**Files changed:** `$INSTRUCTION_LOG`
**Impact:** Recommended
**Description:** The project log instruction now describes a two-file model. The main log has no Archive section; archived entries live in a companion `log-archive.md` at `[project]/a-docs/project-information/log-archive.md`. The main log ends with a pointer line.

**Migration guidance for adopting projects:**
- Create `a-docs/project-information/log-archive.md`
- Move all entries from the main log's `## Archive` section to the new file, condensed to one-liners: `[scope-tags] — **slug** (YYYY-MM-DD): one sentence`
- Replace the `## Archive` section in the main log with the pointer line: `Archived flows are recorded in $[VARIABLE_NAME]. One entry per flow, append-only.`
- Register `$[VARIABLE_NAME]` in the project's index pointing to `log-archive.md`
- No behavioral change is required if the project's log Archive section is currently short; this migration is optional but recommended for projects whose Archive section has grown large.

---

### Change 2 — Merge assessment in Next Priorities (log instruction)

**Files changed:** `$INSTRUCTION_LOG`
**Impact:** Recommended
**Description:** The Next Priorities section of the log instruction now includes a merge assessment rule: before filing any new Next Priorities item, the adding role scans existing items for same target files/design area and compatible authority level. When mergeable, replace existing item(s) with a single merged item.

**Migration guidance for adopting projects:**
- Add the merge assessment rule to the project's Next Priorities protocol (log instruction or log itself, depending on where the project documents this rule).
- No retroactive merge of existing Next Priorities items is required unless the project owner chooses to do so.

---

### Change 3 — Merge assessment in synthesis output protocol

**Files changed:** `$GENERAL_IMPROVEMENT`
**Impact:** Recommended
**Description:** The backward pass synthesis output protocol now includes a merge assessment step before filing any new Next Priorities item. Same criteria as Change 2.

**Migration guidance for adopting projects:**
- Update `a-docs/improvement/main.md` (or equivalent) to add the merge assessment note to the synthesis routing step.
- Behavioral guidance only — no structural change to existing artifacts is required.

---

### Change 4 — Merge assessment in Owner role

**Files changed:** `$GENERAL_OWNER_ROLE`
**Impact:** Recommended
**Description:** The Owner role's Authority & Responsibilities section now includes project log ownership with an explicit merge assessment obligation for Next Priorities additions.

**Migration guidance for adopting projects:**
- Update `a-docs/roles/owner.md` to add the project log ownership bullet with merge assessment obligation.
- If the project's Owner role already has explicit Next Priorities management language, update it to include the merge criteria.

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `04-owner-to-curator.md` shows APPROVED status.

Upon approval, the Curator will implement in a single pass in this order:
1. MAINT items (A, B, C, H, I, J) — Curator authority, no further approval needed
2. LIB items (D+E, F, G) — per approved content above
3. Update report — publish to `$A_SOCIETY_UPDATES_DIR`
