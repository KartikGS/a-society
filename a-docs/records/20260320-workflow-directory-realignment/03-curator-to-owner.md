# Curator → Owner: Proposal

**Subject:** Workflow Directory and Index Realignment
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-20

---

## Trigger

Human-directed change, briefed by the Owner in `02-owner-to-curator-brief.md`. The brief identifies that A-Society's tooling implementation workflow has become a permanent ongoing cadence — structurally warranting placement in `workflow/` rather than as an addendum to the tooling architecture documents. The brief also identifies an open question about variable mapping that requires a Curator decision before implementation.

---

## What and Why

This proposal extracts A-Society's two existing execution workflows into distinct permanent files, converts `workflow/main.md` into a routing index, and updates the framework library to formalize the multi-file pattern.

The generalizability case for the library update (`$INSTRUCTION_WORKFLOW`): the index-based multi-workflow structure applies whenever a project maintains two or more permanent, distinct execution loops. This is not software-specific or A-Society-specific — a legal firm with separate intake and matter-execution workflows, a writing project with separate commissioning and production workflows, or a research team with separate study-design and analysis workflows would all encounter this pattern. The pattern is about structural routing, not domain content.

---

## Where Observed

A-Society — internal. A-Society now maintains two permanent execution cadences: the framework development loop (proposals → review → implementation → registration) and the tooling implementation loop (phase-gated implementation with Developer, TA, and Curator). The tooling loop has proven itself permanent through the Phase 1–2 implementation cycle (`utils-bp-trigger-tool`), making it a standing workflow, not a one-off.

---

## Target Location

- `$A_SOCIETY_WORKFLOW` (currently `/a-society/a-docs/workflow/main.md`) — replace with routing index
- `/a-society/a-docs/workflow/framework-development.md` — new file (extraction)
- `/a-society/a-docs/workflow/tooling-development.md` — new file (extraction + new YAML graph)
- `$A_SOCIETY_TOOLING_ADDENDUM` (`/a-society/a-docs/tooling/architecture-addendum.md`) — replace (excerpting)
- `$A_SOCIETY_INDEX` (`/a-society/a-docs/indexes/main.md`) — replace (new variable rows)
- `$INSTRUCTION_WORKFLOW` (`/a-society/general/instructions/workflow/main.md`) — replace (new section)

---

## Open Question Resolution

**Question from the brief:** Does `$A_SOCIETY_WORKFLOW` point to the new index `main.md` or the `framework-development.md` file, and what new variable names should be registered for the extracted graphs?

**Recommendation: `$A_SOCIETY_WORKFLOW` → `workflow/main.md` (the routing index). New variables for each extracted file.**

**Rationale:**

Four role files (Owner, Curator, Tooling Developer, Technical Architect) all contain the cross-reference: `See $A_SOCIETY_WORKFLOW "When to start a new session" for exceptions.` These references were written when `$A_SOCIETY_WORKFLOW` was the single workflow document containing session routing rules. If `$A_SOCIETY_WORKFLOW` is reassigned to `framework-development.md`, three of those role files would contain a stale reference — the Tooling Developer and Technical Architect roles live in the tooling workflow, and they would be pointing at the framework development workflow for session routing guidance.

The cleanest resolution is to keep `$A_SOCIETY_WORKFLOW` pointing to `main.md` (the routing index) **and to place the universal session routing rules ("When to start a new session") in the index itself.** These rules — "resume within an active flow; start fresh at each new flow; start new when context limits or elapsed time warrant" — are genuinely universal across both A-Society workflows. The index is the correct home for cross-workflow rules. Placing them there means all four role files remain correct without modification: their reference to `$A_SOCIETY_WORKFLOW` "When to start a new session" resolves to the index, where the section exists.

Additionally, `$A_SOCIETY_IMPROVEMENT` passes `$A_SOCIETY_WORKFLOW` to Component 4 (Backward Pass Orderer). After this change, `$A_SOCIETY_WORKFLOW` (the index) will contain no YAML graph — the graphs will live in the specific workflow files. This reference in `$A_SOCIETY_IMPROVEMENT` will need updating. **See Out-of-Scope Drift below.**

**Proposed new variables:**

| Variable | Path | Description |
|---|---|---|
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | `/a-society/a-docs/workflow/framework-development.md` | A-Society framework development workflow — phases, handoffs, invariants, session model, and YAML graph for the documentation loop |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | `/a-society/a-docs/workflow/tooling-development.md` | A-Society tooling development workflow — phases, roles, session model, and YAML graph for the programmatic tooling implementation loop |

`$A_SOCIETY_WORKFLOW` description updates to: "A-Society workflow directory — routing index for all permanent A-Society workflows; universal session routing rules."

---

## Draft Content

### 1. `workflow/main.md` (new routing index — full draft)

```markdown
# A-Society: Workflow Directory

This directory contains A-Society's permanent execution workflows. Each workflow governs a distinct, ongoing operational cadence within the framework. This file is the entry point: load it to orient to the available workflows, then load the relevant workflow file for the work at hand.

---

## Available Workflows

### Framework Development

**Summary:** Growing, maintaining, and quality-gating the reusable instruction library — from intake through proposal, review, implementation, and registration.

**File:** `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`

---

### Tooling Development

**Summary:** Implementing and extending the programmatic tooling layer — from Phase 0 documentation gate through component implementation, integration validation, and registration.

**File:** `$A_SOCIETY_WORKFLOW_TOOLING_DEV`

---

## Session Routing Rules

These rules apply across all A-Society workflows. Each workflow's session model may add workflow-specific routing details; these rules govern the defaults.

**Within an active flow:** Resume the existing session for the receiving role by default. Do not start a new session unless one of the following conditions applies:
- The existing session's context window is full or approaching limits
- The accumulated context from earlier phases would be more noise than signal for the remaining work
- Significant time has passed and the session may have expired

**At flow close:** When a flow completes, start fresh sessions for each role involved in the next flow. The accumulated context from a completed flow is almost always noise for a new one.

**Agents must not pass conditional language to the human** (e.g., "Resume, but start new if none exists"). State the instruction explicitly based on flow state. If a new session is required, provide a copyable session-start prompt.

---

## Cross-Workflow Routing

The Owner is the cross-workflow routing layer. When a flow closes in one workflow, the Owner determines whether the result triggers a new flow in another, and routes accordingly. Workflows do not hand off directly to each other.
```

---

### 2. `workflow/framework-development.md` (extracted from current `main.md`)

**Full content:** Verbatim extraction of the current `$A_SOCIETY_WORKFLOW` (`workflow/main.md`). No content changes — the YAML frontmatter, all phases, handoffs, invariants, session model, and session routing details carry over unchanged. Only the file location changes.

**One adjustment:** The title `# A-Society: Workflow` updates to `# A-Society: Framework Development Workflow` to match the new file's scope. The graph name in the YAML frontmatter (`name: A-Society Framework Development`) already matches — no change needed there.

**The current "When to start a new session" section** in `main.md` moves to the index (as drafted above). The framework-development.md retains its workflow-specific session model detail (the "How it flows" section and session table) without the universal routing rules subsection, since those now live in the index. This eliminates any duplication.

---

### 3. `workflow/tooling-development.md` (new file — extraction + YAML graph)

**Content sources:**
- New: YAML frontmatter (graph representation — drafted below)
- Extracted verbatim: Section 1 (Roles) from `$A_SOCIETY_TOOLING_ADDENDUM`
- Extracted verbatim: Section 2 (Workflow) from `$A_SOCIETY_TOOLING_ADDENDUM`

**One adjustment during extraction:** Section 2, Phase 7 contains: *"If Component 4 (Backward Pass Orderer) is available and this flow had more than two participating roles, invoke Component 4 rather than computing the traversal order manually. Pass `$A_SOCIETY_WORKFLOW`."* After extraction, this reference should read `$A_SOCIETY_WORKFLOW_TOOLING_DEV` — the tooling workflow's graph is now in this file, not in `$A_SOCIETY_WORKFLOW`. This is a necessary correction during extraction, not a content change.

**YAML frontmatter (new content — full draft):**

```yaml
---
workflow:
  name: A-Society Tooling Development
  nodes:
    - id: owner-phase0-gate
      role: Owner
    - id: curator-phase0-docs
      role: Curator
    - id: developer-phases-1-2
      role: Tooling Developer
    - id: curator-phase3-docs
      role: Curator
    - id: owner-phase3-gate
      role: Owner
    - id: developer-phases-4-5-6
      role: Tooling Developer
    - id: ta-phase6-review
      role: Technical Architect
    - id: owner-phase6-gate
      role: Owner
    - id: curator-phase7
      role: Curator
  edges:
    - from: owner-phase0-gate
      to: curator-phase0-docs
      artifact: owner-approval
    - from: curator-phase0-docs
      to: developer-phases-1-2
      artifact: documentation-baseline
    - from: curator-phase0-docs
      to: curator-phase3-docs
    - from: curator-phase3-docs
      to: owner-phase3-gate
      artifact: curator-to-owner
    - from: owner-phase3-gate
      to: developer-phases-4-5-6
      artifact: owner-approval
    - from: developer-phases-1-2
      to: developer-phases-4-5-6
    - from: developer-phases-4-5-6
      to: ta-phase6-review
      artifact: integration-test-record
    - from: ta-phase6-review
      to: owner-phase6-gate
      artifact: ta-assessment
    - from: owner-phase6-gate
      to: curator-phase7
      artifact: owner-approval
---
```

**Graph design notes:**

- `curator-phase0-docs` has two outgoing edges — one to `developer-phases-1-2` (phases 1, 1A, 2 can begin after Phase 0 clears) and one to `curator-phase3-docs` (phase 3 runs concurrently). This models the parallel fork correctly.
- `developer-phases-4-5-6` has two incoming edges — from `owner-phase3-gate` (hard dependency: Phase 4 cannot begin until Phase 3 gate clears) and from `developer-phases-1-2` (Phase 5 needs Phase 2's Consent Utility). This is a join node: Developer does not begin phases 4–5–6 until both arrive.
- Same-role adjacent phases (1+1A+2, and 4+5+6) are each collapsed into single nodes per `$INSTRUCTION_WORKFLOW_GRAPH` convention.
- Backward pass order computed from first-occurrence-in-forward-pass: Owner (phase0-gate) first, Curator (phase0-docs) second, Tooling Developer (phases-1-2) third, Technical Architect (phase6-review) fourth. Reverse of first occurrences (excluding Curator as synthesis): TA → Developer → Owner → Curator. This matches the backward pass order declared in Section 2, Phase 7 of the addendum.

---

### 4. `architecture-addendum.md` (excerpted — sections removed)

**Sections to remove:** Section 1 (Roles) and Section 2 (Workflow), which move to `$A_SOCIETY_WORKFLOW_TOOLING_DEV`.

**Sections to retain:** Section 3 (Constraints and Dependencies) and Section 4 (Post-Phase-6 Component Additions).

**Replacement header** (to replace the current document header through end of Section 2):

```markdown
# A-Society: Programmatic Tooling Layer — Architecture Addendum

**Role:** Technical Architect
**Status:** Awaiting Owner review — not approved for implementation
**Companion document:** `a-society/a-docs/tooling-architecture-proposal.md`
**Context:** Produced after Owner approval of OQ-1 (tooling/ top-level), OQ-4 (Option B: YAML frontmatter embedded in existing workflow docs), OQ-8 (agent-invoked), and all remaining open questions resolved as documented in the session.

**Workflow:** The implementation workflow (phases, roles, session model) for this tooling layer has been extracted to `$A_SOCIETY_WORKFLOW_TOOLING_DEV`. Read that document for phase sequencing, session routing, and role responsibilities. This document retains the structural constraints, dependency rules, and post-Phase-6 addition protocol.

---
```

Sections 3 and 4 follow verbatim.

---

### 5. `indexes/main.md` — variable changes (diff description)

Three rows change:

**Row update — `$A_SOCIETY_WORKFLOW`:**
- Description changes from: *"A-Society workflow — phases, handoffs, invariants, and escalation rules for framework work"*
- To: *"A-Society workflow directory — routing index for all permanent A-Society workflows; universal session routing rules"*
- Path unchanged: `/a-society/a-docs/workflow/main.md`

**Two new rows (inserted after the `$A_SOCIETY_WORKFLOW` row):**

| Variable | Current Path | Description |
|---|---|---|
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | `/a-society/a-docs/workflow/framework-development.md` | A-Society framework development workflow — phases, handoffs, invariants, session model, and YAML graph for the documentation and library maintenance loop |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | `/a-society/a-docs/workflow/tooling-development.md` | A-Society tooling development workflow — phases, roles, session model, constraints, and YAML graph for the programmatic tooling implementation loop |

---

### 6. `general/instructions/workflow/main.md` — library addition

**Target section:** "Multiple distinct workflows" (currently the second sub-section under "Extended Workflow Patterns").

**Change:** Extend the existing section with an "Index-based routing" sub-section immediately after the current paragraph. The current paragraph reads:

> *When the project has more than one workflow — a setup workflow and an ongoing execution workflow, for example — define each as a separate named graph with its own entry node and terminal node. Each workflow surfaces back to the Owner on completion; the Owner is the cross-workflow routing layer, deciding what to trigger next. Workflows do not hand off directly to each other.*

**Content to add immediately after (full draft):**

```markdown
#### Index-based routing

When a project maintains two or more **permanent, distinct execution loops** — each with its own ongoing operational cadence, distinct phase sequence, and distinct role composition — organize them using an index-based structure:

1. Define each workflow as its own named file in `workflow/` (e.g., `workflow/[name].md`), each with its own YAML frontmatter graph.
2. Convert `workflow/main.md` into a **routing index**: a lightweight file that names each workflow, provides a one-line summary, and links to its file.
3. Register each workflow file in the project's file path index with its own variable name.
4. Place any rules that apply universally across all of the project's workflows — particularly session routing rules (when to start new vs. resume) — in the routing index, not duplicated in each workflow file.

**When to use this structure:**
- Two or more distinct workflow types exist simultaneously and are both active
- Each represents a permanent, ongoing cadence (not a one-off, setup, or temporary process)
- The workflows are structurally distinct enough that a single `main.md` would force agents to read irrelevant material to reach the workflow governing their current work

**When not to use this structure:**
- Only one workflow exists (a workflow with conditional branching is not "multiple workflows")
- The second workflow is transient — a one-time setup or initialization workflow does not warrant an index structure

**Routing index format:** The index is not a summary of each workflow — it gives the Owner exactly what they need to present the available workflows and route work: the workflow name, a one-line summary, a file reference, and any universal cross-workflow rules. It does not duplicate phase definitions, handoffs, or invariants from the workflow files.

**Variable naming:** When registering multiple workflows, use a naming convention that makes the role of each variable clear (e.g., `$PROJECT_WORKFLOW` for the index, `$PROJECT_WORKFLOW_[NAME]` for each workflow file).

**Cross-reference updates:** When splitting a single `workflow/main.md` into an index plus workflow files, audit all existing references to the original variable (e.g., `$PROJECT_WORKFLOW`) for section citations (e.g., *"See `$PROJECT_WORKFLOW` 'When to start a new session'"*). Determine whether the cited section moves to a specific workflow file or belongs in the index. Update references accordingly or ensure the index owns the cited content so existing references remain valid.
```

---

## Co-Implementation Notes

The following items are consequences of this change that must be completed during implementation (Phase 3–4), but are not in the explicit file list in the brief:

**1. `$A_SOCIETY_AGENT_DOCS_GUIDE` — required update (Phase 4, standard Curator registration)**
Two new `a-docs/` files require rationale entries:
- `workflow/framework-development.md` — entry should explain it is the extracted framework development workflow; previously the content of `workflow/main.md`; owns the phases, handoffs, invariants, and session model for the documentation loop
- `workflow/tooling-development.md` — entry should explain it holds the tooling implementation workflow (phases, roles, session routing, YAML graph), extracted from the architecture addendum, which now retains only structural constraints and the post-Phase-6 addition protocol

The existing `workflow/main.md` entry in the a-docs-guide should be updated to reflect its new purpose as a routing index.

**2. `$A_SOCIETY_AGENT_DOCS_GUIDE` — existing `$A_SOCIETY_TOOLING_ADDENDUM` entry update**
The a-docs-guide entry for `tooling/architecture-addendum.md` currently reads: *"The complete implementation workflow — phases (0 through 7), role responsibilities per phase, Phase 0 gate requirements..."* This description will no longer match after extraction. Update to reflect that the addendum retains structural constraints and post-Phase-6 protocol only.

---

## Out-of-Scope Drift

The following drift is outside the current brief's six-file scope. Flagged here as a candidate for a next-priority flow — do not act on it in this implementation.

**`$A_SOCIETY_IMPROVEMENT` — Component 4 invocation reference**

`improvement/main.md` contains: *"invoke Component 4 to generate the trigger prompts and order them. Use `generateTriggerPrompts` and `orderWithPromptsFromFile`, passing `$A_SOCIETY_WORKFLOW`."*

After this change, `$A_SOCIETY_WORKFLOW` (the routing index) contains no YAML graph. Passing it to Component 4 would fail — the Component 4 invocation needs the specific workflow file variable (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` or `$A_SOCIETY_WORKFLOW_TOOLING_DEV`) based on which workflow just closed. This reference needs updating in a subsequent flow. Recommend adding to Next Priorities in `$A_SOCIETY_LOG` after this flow closes.

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `04-owner-to-curator.md` shows APPROVED status.
