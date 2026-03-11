# Curator → Owner: Proposal / Submission

**Subject:** Thinking folder — required initialization artifact
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-11

---

## Trigger

Owner briefing `01-owner-to-curator-brief.md` — scope, target files, and implementation approach fully specified.

---

## What and Why

`$INSTRUCTION_THINKING` currently presents the `thinking/` folder as conditional, with a deferral path for minimal projects. The brief makes the case — which I concur with — that this misrepresents a universal artifact as optional. The three thinking/ documents are the behavioral foundation layer for every agent regardless of role, and the general templates require minimal project-specific work to populate. Deferral is backwards from a framework whose core bet is that structure prevents problems rather than reacts to them.

The change repositions thinking/ as a default initialization artifact alongside vision, structure, and roles. Three files need updating, plus a framework update report assessment.

---

## Where Observed

A-Society — internal. Identified by the Owner as a gap in initialization scope.

---

## Target Location

- `$INSTRUCTION_THINKING` — update "When to Create This Folder" section
- `$A_SOCIETY_INITIALIZER_ROLE` — add thinking/ step to Phase 3; update Handoff Criteria
- `$A_SOCIETY_AGENT_DOCS_GUIDE` — add thinking/ rationale entry

---

## Draft Content

### Change 1 — `$INSTRUCTION_THINKING`: Replace "When to Create This Folder"

**Current:**
```
## When to Create This Folder

Create a `thinking/` folder when:
- The project has more than one agent role
- Agents have shown a tendency to repeat the same reasoning errors across sessions
- The project's `agents.md` has grown a long "universal standards" section that deserves dedicated homes

A project with a single agent role and minimal documented process can defer this folder. The need becomes clear when drift starts appearing.
```

**Proposed replacement:**
```
## When to Create This Folder

Create the `thinking/` folder for every project during initialization. It is a default
initialization artifact — not a conditional one.

The thinking folder's documents are the behavioral foundation layer, designed to be read by
every agent regardless of role. The three general templates (`$GENERAL_THINKING`,
`$GENERAL_THINKING_REASONING`, `$GENERAL_THINKING_KEEP_IN_MIND`) require minimal
project-specific knowledge to populate. The cost of creating them at initialization is low;
the cost of operating without them is reasoning drift and repeated errors across sessions.

Do not defer this folder. Create it with every initialization.
```

---

### Change 2 — `$A_SOCIETY_INITIALIZER_ROLE`: Add thinking/ step to Phase 3

**Insertion point:** Between the current step 4 (roles) and step 5 (agents.md). `agents.md` references thinking/ documents in its Universal Standards section, so thinking/ must exist first.

New step 5, with steps 5–12 renumbered to 6–13:

```
5. `thinking/` — the three files: `main.md` (general principles), `reasoning.md` (reasoning
   framework), and `keep-in-mind.md` (operational reminders). Use `$GENERAL_THINKING`,
   `$GENERAL_THINKING_REASONING`, and `$GENERAL_THINKING_KEEP_IN_MIND` as starting points.
   Read `$INSTRUCTION_THINKING` before drafting. Customize role name references and
   project-specific content; remove any template items that do not apply.
```

**Handoff Criteria update:** Add thinking/ to the foundational documents list.

Current:
```
All foundational documents exist and are populated with real content: vision, structure, log,
index, role(s), agents.md, a-docs-guide.md, workflow/main.md, communication/ (if two or more
roles), improvement/main.md, improvement/protocol.md, improvement/reports/template-findings.md,
and a-society-version.md
```

Proposed:
```
All foundational documents exist and are populated with real content: vision, structure, log,
role(s), thinking/ (main.md, reasoning.md, keep-in-mind.md), agents.md, a-docs-guide.md,
workflow/main.md, communication/ (if two or more roles), improvement/main.md,
improvement/protocol.md, improvement/reports/template-findings.md, and a-society-version.md
```

*(Index omitted from this list in the current text and the proposal preserves that — `indexes/main.md` is the last step in Phase 3 and is implicitly covered.)*

---

### Change 3 — `$A_SOCIETY_AGENT_DOCS_GUIDE`: Add thinking/ rationale entry

**Insertion point:** After the `roles/` section and before the `workflow/` section, consistent with initialization order.

```markdown
## `thinking/`

### `thinking/` — folder

**Why it exists:** Every agent working on a project needs a behavioral foundation layer —
principles, reasoning heuristics, and hard stops — that apply regardless of role or task.
Without a dedicated folder, these rules either bloat `agents.md`, scatter into role files
(where they are re-stated inconsistently), or are missing entirely. The thinking folder
gives each of the three documents a single, maintainable home.

**What it owns:** Three files: `main.md` (cross-role operational principles), `reasoning.md`
(cognitive framework for how agents reason through problems), and `keep-in-mind.md` (hard
stops and operational reminders every agent must carry). All three are universal — loaded by
every agent regardless of role.

**What breaks without it:** Agents fall back on instinct for reasoning and principles. Drift
appears across sessions. Reasoning errors repeat rather than being corrected by reference.
The Universal Standards section of `agents.md` either becomes unwieldy or is omitted.

**Do not consolidate with:** `agents.md` — that file is the orientation entry point; thinking/
is the substance of the universal standards it references. Do not consolidate with role files
— thinking/ documents apply to every agent; role files apply to one role. Do not consolidate
the three sub-documents: each answers a distinct question (principles, reasoning, reminders),
and merging them reduces individual clarity and maintainability.
```

---

### Update Report Assessment

**Recommendation:** Publish a framework update report.

Existing initialized projects do not have a `thinking/` folder. After this change, thinking/
is a standard foundational artifact that every project should have. A report allows adopting
project Curators to add it during their next maintenance pass.

**Expected classification:** Recommended (not Breaking — existing a-docs/ continue to function
without it; no existing path or variable reference breaks).

**Scope of report:** Single change entry covering the new initialization requirement and
migration guidance for existing projects (create thinking/ from the three general templates;
register the three variables in indexes/main.md; reference them in agents.md Universal
Standards).

The report draft is not included here — it is produced after Owner APPROVED status and
submitted as a separate artifact for Owner review per `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
