# Curator → Owner: Proposal / Submission

**Subject:** Multi-domain flow documentation + framework update report (Track C)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-29

---

## Trigger

`02b-owner-to-curator-brief.md` (Track C, parallel to TA advisory and implementation). The brief requires a **proposal** for Owner review before any `general/` implementation; update report publication follows Phase 2 approval.

---

## What and Why

**What:** (1) Document the **multi-domain parallel-track flow** pattern at the general workflow-instruction layer so any project can model one unit of work that spans independent domains without splitting into separate workflows. (2) Add **A-Society-specific** guidance so Owner, TA, Tooling Developer, Runtime Developer, and Curator agents know how this pattern maps to A-Society’s roles and routing. (3) Publish a **framework update report** covering the **already-implemented** change to `$GENERAL_OWNER_ROLE` (replacement of the “separate flows per workflow type” rule with single-flow parallel-track guidance), plus the bundled workflow-instruction addition.

**Why:** Projects and A-Society now route cross-domain feature work as **one flow with parallel tracks**; without pattern documentation, agents designing or executing workflows lack a shared reference. Adopting projects that instantiated the previous Owner template text need explicit migration guidance for the Owner role change.

**Generalizability:** The general subsection describes graphs (fork/join, checkpoints), not A-Society role names. Software (e.g., API + docs + infra), writing (e.g., research + draft + legal), and research (e.g., fieldwork + analysis + publication) can all use one coordinated flow with parallel branches when branches are independent until a join.

---

## Where Observed

A-Society — internal: session changes to `$A_SOCIETY_OWNER_ROLE` and `$GENERAL_OWNER_ROLE`, and the “Multi-domain flows” bullet in `$A_SOCIETY_WORKFLOW` (`a-docs/workflow/main.md`), described in the brief.

---

## Target Location

| Target | Variable |
|--------|----------|
| General workflow instruction — new subsection | `$INSTRUCTION_WORKFLOW` |
| A-Society workflow routing index — link + short pointer | `$A_SOCIETY_WORKFLOW` |
| New A-Society workflow pattern document | **Proposed:** `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` → `a-society/a-docs/workflow/multi-domain-development.md` (register in `$A_SOCIETY_INDEX` on implementation) |
| Framework update report (on approval) | `$A_SOCIETY_UPDATES_DIR` — new file, name TBD (see below) |
| Version record (registration phase) | `$A_SOCIETY_VERSION` |
| Curator maintenance | `$A_SOCIETY_AGENT_DOCS_GUIDE` — add rationale entry for the new file when created |

---

## Draft Content

### 1) Insertion point — `$INSTRUCTION_WORKFLOW`

**Section:** `## Extended Workflow Patterns`

**Position:** Insert a **new `###` subsection** **after** the entire `### Multiple distinct workflows` block (including `#### Index-based routing` and its sub-bullets) and **before** `### Cross-workflow handoffs`.

**Rationale:** “Multiple distinct workflows” defines **separate named graphs** with index-based routing. The multi-domain pattern is **one graph**, **one unit of work**, with **parallel tracks** across domains — orthogonal to splitting into multiple workflow files. Placing the new subsection here avoids conflating it with index-based multi-workflow routing. It also follows parallel fork/join (already in `### Branching`) with a use-case that combines planning, parallel execution, and joins — without duplicating the fork/join definition.

**Draft subsection — to insert verbatim (subject to Owner edit):**

```markdown
### Multi-domain parallel-track flows (single workflow)

When **one unit of work** spans **multiple domains or role types** (e.g., documentation, implementation track A, implementation track B) that can proceed **in parallel until a synchronization point**, model it as **a single workflow graph** with **parallel forks and at least one join** — not as separate workflows chosen because the work “touches more than one area.”

**What this is:** One instance, one workflow name, one record of the work. Branches run concurrently where edges are independent; a join node waits for all required inputs before the workflow continues toward closure.

**What this is not:** It is not the same as **multiple distinct workflows** (separate named graphs with separate entry/terminal behavior). If the work is truly one feature or one decision thread, splitting it into multiple workflows fragments accountability and obscures handoffs. Use multiple workflows only when the project maintains **permanent, distinct execution loops** that meet the criteria in the “Multiple distinct workflows” section above.

**When to use:** Independent implementation or review tracks exist; a single planning or architecture phase can feed all tracks; convergence is required before verification, acceptance, or publication.

**Graph pattern (abstract):** Planning or architecture node → **parallel fork** to two or more domain tracks → **join** → downstream verification or closure nodes. Role names are project-specific; the structure is generic.

**Checkpoints and approvals:** When a parallel track includes work that **must not proceed without a governance or approval step** (e.g., a shared library change that requires Owner or steward approval before implementation continues), model that step explicitly in the graph: either a **node** whose output is approval, or a **bidirectional edge** for clarification/approval, so the track does not silently bypass the approval obligation. The exact mechanics follow the same edge and bidirectional-edge rules defined earlier in this document.

**Owner routing:** The Owner still routes the unit of work **into** this workflow once and receives **terminal** handoff once; parallel tracks do not remove Owner-as-terminal unless the workflow document declares a delegated-authority exception that explicitly covers the work class.

**Session model:** Parallel tracks imply multiple active sessions may run concurrently for different roles; the human orchestrator switches between sessions per pause-point rules. The workflow document should state which tracks may run in parallel and where joins force ordering.

---

**Framework update assessment for this subsection alone:** Per `$A_SOCIETY_UPDATES_PROTOCOL`, this is **additive guidance** to an existing general instruction. It does not, by itself, make every adopting project’s **instantiated** workflow file incomplete (projects do not wholesale-copy `main.md` as their only workflow). Treat as **Recommended** when bundled: Curators may align project workflow docs with the new pattern where relevant.

---

### 2) A-Society-specific documentation — `$A_SOCIETY_WORKFLOW` + new file

**`$A_SOCIETY_WORKFLOW` (routing index):** After `## Available Workflows` (or as the first subsection under a new `## Patterns` heading — **recommendation:** add **`## Multi-domain pattern`** immediately after `## Available Workflows` containing):

- One-line summary: coordinated single flow across framework/tooling/runtime/docs with parallel tracks when independent.
- Link: “Full pattern: `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`.”

Keep the existing **Multi-domain flows** bullet under **Session Routing Rules**; add a **cross-reference** in that bullet: “See `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` for the full pattern.”

**New file — `a-society/a-docs/workflow/multi-domain-development.md` (draft outline):**

- YAML frontmatter `workflow:` optional: illustrative **subgraph** for a typical multi-domain A-Society change (Owner intake → TA → parallel Tooling Dev + Runtime Dev → TA integration → Owner gate → Curator track with optional Owner approval loop for `general/` → Owner closure) — aligned with the brief’s ASCII diagrams.
- Sections: **When to use**, **How this relates to** Framework Development / Tooling / Runtime workflows (composition, not a replacement), **Role map** (Owner, TA, Tooling Developer, Runtime Developer, Curator), **Parallel tracks**, **Curator / `general/` checkpoint** (proposal → Owner approval → implement), **Session routing** (pointer to `$A_SOCIETY_WORKFLOW` rules), **Record folder** (reference to `workflow.md` in records per current convention).

---

### 3) Update report — classification, bundling, version

**`$GENERAL_OWNER_ROLE` change**

- **Classification: Breaking.** Rationale: Adopting projects that instantiated the template hold the prior rule (“when work requires two or more separate workflow types, route them as separate flows”). Replacing it with single-flow parallel-track guidance removes that rule and replaces routing expectations. Curators must review project `a-docs/roles/owner.md` (or equivalent) for the old language and align with the new template language.

**`$INSTRUCTION_WORKFLOW` addition (multi-domain subsection)**

- **Classification: Recommended.** Rationale: Additive pattern documentation; no mandatory new section imposed on every project’s customized workflow file. Projects benefit from adopting the pattern when maintaining parity with `general/`.

**Bundling:** **Single update report** containing both entries. The Breaking Owner-role item drives the version increment; the workflow instruction is a second change block in the same report.

**Version (publication after approval):**

- **Previous Version:** `v24.1` (current `$A_SOCIETY_VERSION`)
- **Framework Version:** `v25.0` — **MAJOR** increment because the report includes a **Breaking** change.

**Filename (proposal):** `a-society/updates/2026-03-29-owner-routing-multi-domain.md` (descriptor distinguishes from `2026-03-29-workflow-schema-unification.md` already at v24.1).

---

## Update Report Draft *(full text for Owner review)*

```markdown
# Framework Update: Owner routing + multi-domain workflow pattern

**Framework Version:** v25.0
**Previous Version:** v24.1
**Date:** 2026-03-29

## Summary

This update documents the **multi-domain parallel-track** workflow pattern in the general workflow instruction and records a **Breaking** change to the general Owner role template: work that spans multiple role types or domains should be modeled as **one flow with parallel tracks**, not as separate flows based on workflow type alone. Adopting projects must align instantiated Owner roles with the new routing language. The workflow instruction addition is **Recommended** for projects updating their workflow documentation practices.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap if your Owner role still encodes the old “separate flows per workflow type” rule — Curator must review |
| Recommended | 1 | Improved workflow design guidance — adopt when maintaining parity with `general/` |

## Changes

### Owner role — single flow with parallel tracks

**Impact:** Breaking  
**Affected artifacts:** [`general/roles/owner.md`]  
**What changed:** The rule directing the Owner to route work that spans multiple workflow types as **separate flows** was removed. It was replaced with guidance to design **one flow** that routes through all required roles, using **parallel tracks** where steps are independent.  
**Why:** Fragmenting one feature across separate flows obscures handoffs and accountability; parallel tracks within one graph preserve structural verification while allowing concurrent work.  
**Migration guidance:** Open your project’s Owner role document (typically `$[PROJECT]_OWNER_ROLE` or the path registered in your index for the Owner role). Search for language that required **separate flows** when **multiple workflow types** or **domains** apply to the same unit of work. Replace that rule with the updated template language from the current `general/roles/owner.md` **Workflow routing** bullet — specifically the sentence that requires a **single flow** with **parallel tracks** where appropriate, and the prohibition on splitting **one feature** across separate flows **only** because it spans multiple role types. If your Owner role already matched the new intent, no edit is required.

### Workflow instruction — multi-domain parallel-track pattern

**Impact:** Recommended  
**Affected artifacts:** [`general/instructions/workflow/main.md`]  
**What changed:** A new subsection under **Extended Workflow Patterns** documents the **multi-domain parallel-track** pattern: one workflow, one unit of work, parallel forks and joins across domains, with explicit checkpoints when a track requires approval.  
**Why:** Without this pattern, project designers lack first-class guidance for coordinated cross-domain work in a single graph.  
**Migration guidance:** No mandatory edit. If your project maintains a local mirror or derivative of the workflow instruction, consider adding a cross-reference or adopting the same subsection for consistency. If you author project-specific workflow documents, use the pattern when one feature spans multiple domains and branches can run in parallel until a join.

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
```

---

## Files Changed *(upon Owner APPROVED — implementation list)*

| Action | File / variable |
|--------|-----------------|
| Edit | `$INSTRUCTION_WORKFLOW` — insert new subsection as specified |
| Edit | `$A_SOCIETY_WORKFLOW` — Multi-domain pattern section + cross-ref in Session Routing Rules |
| Create | `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` (new index row + `a-docs/workflow/multi-domain-development.md`) |
| Edit | `$A_SOCIETY_INDEX` — register `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` |
| Edit | `$A_SOCIETY_AGENT_DOCS_GUIDE` — rationale for new workflow doc |
| Create | `a-society/updates/2026-03-29-owner-routing-multi-domain.md` (final name per Owner) |
| Edit | `$A_SOCIETY_VERSION` — v25.0 + History row |

**Not in scope for Curator implementation:** Changes under `llm-journey/` or other adopting projects (flag only).

---

## Update report assessment — version bump combination

- **`$INSTRUCTION_WORKFLOW` alone:** Would warrant at most a **MINOR** (Recommended-only) bump if published alone.  
- **`$GENERAL_OWNER_ROLE` Breaking change alone:** Would warrant **MAJOR** (v24.1 → v25.0).  
- **Combined:** One report at **v25.0** with two change blocks; **do not** publish a separate MINOR-only report for the instruction addition unless the Owner prefers splitting (not recommended — duplicates Curator work and confuses sequence).

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:

- **APPROVED** — with any implementation constraints  
- **REVISE** — with specific changes required before resubmission  
- **REJECTED** — with rationale  

The Curator does not implement `general/`, publish the update report, or increment version until `owner-to-curator.md` shows **APPROVED** status.
