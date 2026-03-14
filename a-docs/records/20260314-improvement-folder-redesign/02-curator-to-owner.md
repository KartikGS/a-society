**Subject:** Improvement folder redesign — backward-pass algorithm, synthesis path, file collapse, mandatory status, and generalizable findings
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-14

---

## Trigger

Owner brief `01-owner-to-curator-brief.md` in record `20260314-improvement-folder-redesign`. Six design decisions identified in the briefing address accumulated problems with the improvement instruction and templates: imprecise traversal description, incorrect synthesis path, unnecessary two-file structure, incorrect deferrable status, and no mechanism for surfacing project-agnostic findings.

---

## What and Why

Six changes are proposed to `general/` and one index update:

**Decision 1 (traversal algorithm):** Replace the vague backward-pass traversal description with the precise five-step algorithm: deduplicate by first occurrence, reverse, Owner second-to-last, synthesis role last, parallel forks are concurrent. Applies to `$INSTRUCTION_IMPROVEMENT` and `$GENERAL_IMPROVEMENT`.

**Decision 2 (synthesis path):** Replace "proposes through the standard workflow" with the two-path model: Curator-authority items → implement directly; Owner-judgment items → submit to Owner for approval, then implement. a-docs improvement is a separate lightweight path, not a main-workflow trigger. Applies to `$INSTRUCTION_IMPROVEMENT` and `$GENERAL_IMPROVEMENT`.

**Decision 3 (file collapse):** Merge philosophy (`main.md`) and protocol (`protocol.md`) into a single `main.md`. The split was not warranted — both cover improvement, and splitting adds navigation overhead without benefit. Applies to `$INSTRUCTION_IMPROVEMENT` (component description update) and `$GENERAL_IMPROVEMENT` (merge; retire `$GENERAL_IMPROVEMENT_PROTOCOL`).

**Decision 4 (mandatory):** Remove deferrable language. The improvement folder is a required initialization artifact alongside `thinking/`. The backward pass is the mechanism for collecting friction — without it in place from cycle one, early signal is lost. Applies to `$INSTRUCTION_IMPROVEMENT` "When to Create This Folder" and `$INSTRUCTION_WORKFLOW` Section 6 header.

**Decision 5 (generalizable findings):** Add guidance to flag project-agnostic findings explicitly in the findings artifact as potential framework contributions. Applies to `$GENERAL_IMPROVEMENT` (new "Generalizable Findings" subsection in the backward pass protocol).

**Decision 6 (workflow backward pass mandatory):** `$INSTRUCTION_WORKFLOW` Section 6 header changes from "(recommended)" to "(mandatory)". Traversal ordering removed from Section 6 and Step 7 — both now reference `$INSTRUCTION_IMPROVEMENT` as authoritative. "Findings re-enter the workflow as proposals for the next iteration" removed (superseded by Decision 2). Step 7 updated to match.

**Additional fix:** "agent-docs" → "a-docs" in the opening sentence of `$INSTRUCTION_IMPROVEMENT`.

**Additional scope item (flagged, Owner confirmation requested):** The "Backward pass ordering" paragraph in `$INSTRUCTION_WORKFLOW`'s "The Owner as Workflow Entry and Terminal Node" section contains the same locally-specified ordering language that Decision 6 removes from Section 6 and Step 7: "The backward pass starts with the role closest to implementation and moves back toward the Owner — each role reflects on its own phase in sequence. The Owner produces findings last." This contradicts the new algorithm (Owner is second-to-last; synthesis role is last). The paragraph was not explicitly named in the brief's scope, but it falls under the same direction: "update traversal ordering to reference `$INSTRUCTION_IMPROVEMENT` rather than specifying ordering locally." A proposed fix is included in the draft below. Owner should confirm whether to include it or narrow scope.

**Generalizability:** All six decisions apply equally to software, writing, research, and any other project type. The traversal algorithm is a graph property. The synthesis path is a maintenance governance pattern. The file collapse is a documentation structure decision. The mandatory status is a bootstrapping principle. The generalizable-findings flag is an ecosystem contribution mechanism. None are domain-specific.

---

## Where Observed

A-Society — internal. All six problems were identified from the current state of `$INSTRUCTION_IMPROVEMENT`, `$INSTRUCTION_WORKFLOW`, and the `$GENERAL_IMPROVEMENT` / `$GENERAL_IMPROVEMENT_PROTOCOL` templates, as described in the Owner brief.

---

## Target Location

- `$INSTRUCTION_IMPROVEMENT` — `/a-society/general/instructions/improvement/main.md` — full rewrite
- `$INSTRUCTION_WORKFLOW` — `/a-society/general/instructions/workflow/main.md` — targeted edits to three locations
- `$GENERAL_IMPROVEMENT` — `/a-society/general/improvement/main.md` — merge with protocol, full rewrite
- `$GENERAL_IMPROVEMENT_PROTOCOL` — `/a-society/general/improvement/protocol.md` — retire after merge
- `$A_SOCIETY_INDEX` — `/a-society/a-docs/indexes/main.md` — remove `$GENERAL_IMPROVEMENT_PROTOCOL` row; update `$GENERAL_IMPROVEMENT` description

---

## Draft Content

---

### File 1: `$INSTRUCTION_IMPROVEMENT` — full rewrite

```markdown
# Instruction: How to Create an `improvement/` Folder

This document explains how to create an `improvement/` folder for a project's a-docs. An improvement folder gives the project a structured, repeatable system for evolving its own documentation — capturing agent friction during execution and feeding it back through a lightweight improvement path.

---

## The Forward Pass and the Backward Pass

Every execution cycle in a project has two directions.

**The forward pass** is agents executing their roles: receiving work, producing artifacts, handing off to the next stage. This is the project's normal workflow.

**The backward pass** is agents reflecting on that execution: each agent who participated in the forward pass produces a structured analysis of their experience — what was clear, what was ambiguous, what was missing from their role or context documents, what they had to infer that they shouldn't have had to. The synthesis role (typically the Curator) receives all findings, identifies actionable items, and routes them through the appropriate path.

**The backward pass is not periodic — it is coupled to every forward pass.** The Curator does not independently observe friction and "notice" things to fix. The backward pass is what generates the raw material the Curator synthesizes. Without it, the improvement system has nothing to work from.

---

## Backward Pass Traversal

In a graph-based workflow, the backward pass is ordered as follows:

1. **Identify first occurrences.** Take each role's *first occurrence* in the forward pass. Subsequent appearances of the same role are not counted separately — that role's backward-pass findings cover all their forward-pass phases.
2. **Reverse the sequence.** Reverse the first-occurrence sequence to get the backward order.
3. **Owner is always second-to-last.** Because Owner is the entry point for every workflow, Owner's first occurrence is always first in the forward pass — placing Owner second-to-last in the backward sequence.
4. **Synthesis role is always last.** The synthesis role (typically the Curator) synthesizes all findings and produces the final backward-pass output. It is always the final node in the backward pass.
5. **Parallel forks produce concurrent backward-pass nodes.** Roles whose first occurrences are at the same forward-pass position (parallel fork) produce findings concurrently, not sequentially.

**Example:** Forward pass `Owner → A → B + C (parallel) → A (reviews) → Owner (confirms)`. First occurrences in order: Owner, A, then B and C together. Backward sequence: B and C simultaneously → A → Owner → Curator synthesizes. A's second appearance (reviews) is absorbed into A's single backward-pass node.

Only the nodes and edges that fired during the instance under review are included. Dead branches are excluded.

---

## Synthesis Path

After the synthesis role collects all findings and identifies actionable items:

- **Changes within Curator authority** — doc corrections, clarifications, maintenance items the Curator owns: implement directly to a-docs without a formal proposal.
- **Changes requiring Owner judgment** — structural decisions, additions to `general/`, direction changes: submit to the Owner for approval; implement after approval.

a-docs improvement is a separate, lightweight path. It does not re-enter the project's main execution workflow — it runs on a shorter approval loop than the project's normal work product.

---

## What Is an `improvement/` Folder?

An `improvement/` folder contains one required component and one optional:

1. **Philosophy and protocol** (`main.md`) — required: the principles that govern how improvement decisions are made, combined with the backward pass protocol
2. **Reports** (`reports/`) — optional: the storage location for backward pass findings, for projects that do not use a records structure

Together they answer: "How does this project's a-docs stay aligned with how the project actually works?"

---

## Why a Dedicated Folder?

Without a dedicated improvement folder:
- Improvement philosophy gets buried in role files or lost in conversation history
- Backward pass findings scatter across the project without a clear home
- Each improvement cycle reinvents how to run it

A dedicated folder separates improvement infrastructure from normal execution infrastructure. The process of improving the docs does not pollute the docs used for execution.

---

## The Components

### `main.md` — Improvement Philosophy and Backward Pass Protocol

**What it is:** A single file combining the principles that govern how the project evaluates and decides on documentation changes with the step-by-step backward pass protocol.

**What belongs here:**
- Principles for when to split files vs. consolidate
- Principles for when to create a new protocol vs. using the user consultation path
- Principles for keeping documentation single-purpose and cross-referenced
- The project's stance on doc improvement scope
- How to run a backward pass: who produces findings, traversal order, output format, synthesis path
- Reflection categories to guide agents
- Guardrails

**What does not belong here:**
- Historical improvement decisions (those go in `reports/`)
- Feature or product improvement ideas (those go in the project's change request system)
- Workflow documents for the project's main execution (those go in `workflow/`)

**Starting point:** Use `$GENERAL_IMPROVEMENT` as the template. The principles and backward pass protocol are project-agnostic and can be adopted largely verbatim. Customize:
- Replace `[PROJECT_*]` placeholders with `$VARIABLE_NAME` values from your index
- Update role names to match your project's roles
- Specify who produces findings first (the role closest to implementation friction)

---

### `reports/` — Reports Folder (Optional)

**What it is:** The storage location for backward pass findings in projects that do not use a records structure.

If the project uses a records structure (see `$INSTRUCTION_RECORDS`), backward pass findings are sequenced artifacts within the record folder — not files in `reports/`. In that case, this folder may be omitted or repurposed for non-flow-specific improvement artifacts (e.g., a periodic synthesis that spans multiple flows).

If the project does not use records, `reports/` is the required storage location for all backward pass findings.

**What belongs here (when used):**
- `main.md` — index of the reports folder with naming conventions and template references
- One file per backward pass findings report, following the naming convention from the protocol

**What does not belong here:**
- Protocol or philosophy documents (those go in `main.md`)
- Plans, requirements, or feature artifacts (those go in `workflow/`)
- Non-improvement artifacts of any kind

**Starting point for `reports/main.md`:** Use `$GENERAL_IMPROVEMENT_REPORTS` as the template.

**Starting point for template files:**
- Backward pass findings: `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`

---

## Integration with the Index

Add all key files to the project's file path index. At minimum:

| Variable | Path | Description | Required? |
|---|---|---|---|
| `$[PROJECT]_IMPROVEMENT` | `/[project]/a-docs/improvement/main.md` | Improvement philosophy and backward pass protocol | Required |
| `$[PROJECT]_IMPROVEMENT_REPORTS` | `/[project]/a-docs/improvement/reports/main.md` | Improvement reports index — naming conventions and template links | Optional: include only if the project uses `reports/` rather than a records structure for findings |

---

## Integration with the Workflow

The backward pass must be declared as a mandatory phase in the project's workflow document.

The workflow should specify:
- When the backward pass runs (after which phase)
- Who produces findings and where findings go

For traversal order, reference `$INSTRUCTION_IMPROVEMENT` — do not specify ordering locally. The improvement file is the authoritative source for the backward pass algorithm; the workflow declares the backward pass as part of the project's execution cycle.

---

## When to Create This Folder

The `improvement/` folder is a required initialization artifact. Create it alongside `thinking/` when the project's a-docs are first set up.

**Why:** The backward pass is the mechanism for collecting friction observations. Without it in place from the first execution cycle, friction goes untracked and cannot be analyzed. A project that defers the improvement folder loses signal from its earliest — often most instructive — cycles.
```

---

### File 2: `$INSTRUCTION_WORKFLOW` — targeted edits

Three locations change. Each shown as Current / Proposed.

---

**Location A — "Backward pass ordering" paragraph in "The Owner as Workflow Entry and Terminal Node"**

*(Flagged item — Owner confirmation requested before implementing)*

Current:
```
**Backward pass ordering:** the Owner, having received terminal confirmation, directs the backward pass. The backward pass starts with the role closest to implementation and moves back toward the Owner — each role reflects on its own phase in sequence. The Owner produces findings last, informed by the full arc from trigger to completion.
```

Proposed:
```
**Backward pass ordering:** the Owner, having received terminal confirmation, directs the backward pass. For traversal order, see `$INSTRUCTION_IMPROVEMENT` — ordering is defined there and is not restated here.
```

---

**Location B — Section 6**

Current:
```
### 6. Backward Pass (recommended)

What is the improvement loop after a flow closes? A backward pass is a structured reflection run after a flow completes — each participating role reviews its own phase for what worked, what failed, and what should change. Findings re-enter the workflow as proposals for the next iteration.

Include a backward pass description when:
- The workflow runs repeatedly and accumulated learning should improve it.
- Roles benefit from structured reflection on their phase before session context is cleared.

A backward pass entry in the workflow document names the roles involved, the ordering (start closest to implementation, end with Owner), and where findings go. Reference `$INSTRUCTION_IMPROVEMENT` for the backward pass protocol.
```

Proposed:
```
### 6. Backward Pass (mandatory)

What is the improvement loop after a flow closes? A backward pass is a structured reflection run after a flow completes — each participating role reviews its own phase for what worked, what failed, and what should change.

A backward pass entry in the workflow document names the roles involved and where findings go. For traversal order, reference `$INSTRUCTION_IMPROVEMENT` — do not specify ordering locally. The improvement file is the authoritative source for the backward pass algorithm.
```

---

**Location C — Step 7 in "How to Write One"**

Current:
```
**Step 7 — Define the backward pass (if warranted).**
If the workflow runs repeatedly: describe the backward pass — which roles participate, in what order, and where findings go. Reference `$INSTRUCTION_IMPROVEMENT` if the project has an improvement folder. Skip for one-time or experimental workflows.
```

Proposed:
```
**Step 7 — Define the backward pass.**
Describe the backward pass — which roles participate and where findings go. For traversal order, reference `$INSTRUCTION_IMPROVEMENT`. Do not specify ordering locally.
```

---

### File 3: `$GENERAL_IMPROVEMENT` — merged, full new content

This file absorbs `$GENERAL_IMPROVEMENT_PROTOCOL`. The existing five principles are retained verbatim. Added: traversal algorithm (Decision 1), updated synthesis path (Decision 2), generalizable findings (Decision 5). The `[CUSTOMIZE]` note from the protocol template is promoted to the top of the merged file.

```markdown
# Improvement Principles and Backward Pass Protocol

> [CUSTOMIZE] Replace all `[PROJECT_*]` placeholders with the appropriate `$VARIABLE_NAME` values from your project's index. Update role names to match your project's structure. Declare which output location applies (records or reports/) in the "How It Works" section.

This document combines the improvement philosophy and the backward pass protocol for a project's agent documentation system. It guides how future process gaps are evaluated and resolved, and standardizes how agents reflect on completed work and turn that reflection into documentation improvements.

All principles below are project-agnostic and apply to any project that uses this agent-docs structure.

---

## Core Philosophy

When a meta-improvement is proposed, evaluate it against these principles before deciding how to implement it. The goal is not to add more process — it is to reduce future agent confusion at the lowest structural cost.

---

## Principle 1: Atomic Change Sites

**When a principle, invariant, or design decision may evolve, give it its own file.**

Avoid adding new principled content as a section inside an existing large file. Instead:
- Create a dedicated file for the principle or decision domain
- Have all consumers (role docs, architecture docs, tooling docs) cross-reference that file by path
- When the principle changes, only one file needs updating

**Why this matters for agents:** Agents that load a large reference file to find one relevant section are doing unnecessary work. A targeted file load is cheaper, clearer, and less error-prone than scanning a multi-topic document.

**Anti-pattern:** Adding a principles section to an architecture or process document when that document is already loaded for many other reasons. Any change to the principle requires finding which agents load the document and whether they will see the update in context.

**Preferred pattern:** Create a dedicated principles file. Cross-reference it from every document that needs it. The principle has one home; references have many.

---

## Principle 2: Project-Agnostic Folder Structure

**Separate project-specific content from cross-project agent infrastructure.**

Organize project agent documentation so that:
- Cross-project agent standards live in a dedicated framework directory (e.g., `a-society/`)
- Project-specific content lives under the project's own `a-docs/` folder
- Each project's `a-docs/` folder contains its own domain-scoped folders

**Why this matters:** As more projects are added, cross-project agent infrastructure remains reusable without modification. Project-specific principles do not bleed into the cross-project layer.

**Naming convention:** Use the project name as the subfolder key. Within each project folder, use domain-scoped subfolders (`thinking/`, `improvement/`, `project-principles/`, `governance/`).

---

## Principle 3: Follow References

**When a doc references another file, that file is required reading — not optional context.**

Agents load their required reading list from the project's agents.md and their role doc. But those docs will contain cross-references. These references are not decorative — they point to the authoritative source for a specific topic.

**Rule for agents:** If a loaded document contains a cross-reference to another file in agent-docs, treat that referenced file as required reading for any task that touches the referenced topic.

**Rule for doc authors:** Cross-references should use `$VARIABLE_NAME` from the index, not hardcoded paths. Avoid repeating content from the referenced file in the referencing doc — duplication creates drift.

---

## Principle 4: Simplicity Over Protocol

**Before creating a new process rule, ask: is the user consultation path adequate?**

Not every workflow gap needs a formal protocol. When an agent discovers a discrepancy, ambiguity, or unexpected state:
- If the decision is factual and low-risk, surface it to the user directly
- If the user considers it a fundamental problem, they will stop the flow
- If they consider it acceptable, they will approve and the agent proceeds

Creating a formal authority protocol adds ceremony and cognitive overhead for future agents. Prefer lightweight rules over structured decision matrices for infrequent edge cases.

**When a formal protocol IS warranted:** When the same class of decision recurs frequently enough that ad-hoc user consultation becomes a bottleneck, or when the decision has asymmetric risk. Even then, prefer the simplest rule that handles the common case correctly.

---

## Principle 5: Separation of Concerns in Documentation

**Each file should have one primary purpose. Cross-reference; do not consolidate.**

Signs that a file has drifted from single-purpose:
- Multiple unrelated teams or agents load it for different reasons
- Changes to one section risk confusing agents that only need another section
- The file's Required Reading justification covers multiple distinct topics

When this drift is identified, split the file — or extract the emergent concern into its own file — and cross-reference. The short-term cost of a file split is lower than the long-term cost of agents loading irrelevant context or missing targeted updates.

---

## How to Apply These Principles in Meta-Synthesis

When evaluating a proposed fix during meta-synthesis:

1. **Before deciding "add to X"** — ask whether X is the right home. Would a new dedicated file serve the atomic change site principle better?
2. **Before deciding "add a new protocol"** — ask whether user consultation adequately handles the edge case. Reject the protocol if the informal path is sufficient.
3. **Before deciding "add a cross-reference"** — ensure the cross-reference uses a `$VARIABLE_NAME`. The implementing agent must be able to follow it without interpretation.
4. **When creating new content** — decide first whether it is project-specific or cross-project. Place it accordingly.

---

## Backward Pass Protocol

### Purpose

Standardize how agents reflect on completed work and turn that reflection into documentation improvements. This is the backward pass — the structured counterpart to the forward pass of the project's workflow.

---

### When to Run

Run the backward pass after every substantive forward pass — any work that involved multiple phases or touched structural decisions. For trivial single-file edits where no friction was experienced, the backward pass can be skipped.

The depth of the backward pass should be proportional to the work:
- **Lightweight:** 1–3 top findings, brief rationale. Use for routine work.
- **Full:** Structured per-agent findings using the findings template. Use when blocking friction, ambiguity, or contradictions were encountered during the forward pass.

The agent decides which depth is appropriate. If unsure, default to lightweight.

---

### Backward Pass Traversal

Order the backward pass as follows:

1. **Identify first occurrences.** Take each role's *first occurrence* in the forward pass. Subsequent appearances of the same role are ignored — that role's backward-pass findings cover all their forward-pass phases.
2. **Reverse the sequence.** Reverse the first-occurrence sequence to get the backward order.
3. **Owner is always second-to-last.** Owner is the entry point for every workflow — its first occurrence is always first in the forward pass, placing it second-to-last in the backward sequence.
4. **Synthesis role is always last.** The synthesis role synthesizes all findings and produces the final backward-pass output. It is always the final node in the backward pass.
5. **Parallel forks produce concurrent backward-pass nodes.** Roles whose first occurrences are at the same forward-pass position (parallel fork) produce findings concurrently, not sequentially.

Only the nodes and edges that fired during this instance are included. Dead branches are excluded.

---

### How It Works

1. **Each agent who participated in the forward pass** produces a findings artifact reflecting on their experience — what was clear, what was ambiguous, what was missing, what conflicted. Follow the traversal order above.

2. **Output location:**
   - *If the project uses records:* `[PROJECT_RECORDS]/[identifier]/NN-<role>-findings.md` — findings are sequenced artifacts in the active record folder
   - *If the project does not use records:* `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md`

   The project's `improvement/main.md` declares which path applies.

3. **Template:** `[PROJECT_IMPROVEMENT_TEMPLATE_FINDINGS]`

4. **The synthesis role** reviews all findings and identifies which warrant action.

5. **Actionable items are routed based on scope:**
   - Changes within Curator authority: implement directly to a-docs without a formal proposal.
   - Changes requiring Owner judgment: submit to the Owner for approval; implement after approval.

   Do not re-route improvement items through the project's main execution workflow.

---

### What to Reflect On

Use these categories to guide your reflection (not all will apply to every task):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear

Ground every finding in a specific moment from your execution. Vague findings ("the docs could be better") are not useful.

---

### Generalizable Findings

When a finding appears project-agnostic — meaning it would apply equally to a software project, a writing project, and a research project — flag it explicitly as a potential framework contribution. Note it in the findings artifact so it is not lost.

The submission mechanism for framework contributions is defined by the adopting project's relationship with the framework provider. Flagging is the minimum; do not silently discard a universally-useful pattern as a local fix.

---

### Useful Lenses

When evaluating whether a finding warrants action, consider:

- **Portability:** Is the fix specific to this project, or should it propagate to the general library?
- **Evolvability:** Does the fix reduce future edit cost (e.g., canonical source + cross-reference instead of duplication)?
- **Proportionality:** Is the fix worth the disruption? Small friction in a rare edge case may not warrant a doc change.

These are judgment aids, not mandatory per-finding assessments.

---

### Guardrails

- Do not silently mutate role authority boundaries during improvement implementation.
- Do not rewrite historical reports to match newer conventions. Reports are immutable once produced.
- If two documents conflict, resolve by updating one source-of-truth and adding a cross-reference — never duplicate.
- The backward pass is not an execution session. Agents reflecting should not produce plans, implementations, or new artifacts beyond their findings file.
```

---

### File 4: `$A_SOCIETY_INDEX` — row changes

**Remove:** the `$GENERAL_IMPROVEMENT_PROTOCOL` row:
```
| `$GENERAL_IMPROVEMENT_PROTOCOL` | `/a-society/general/improvement/protocol.md` | Ready-made backward pass protocol template |
```

**Update:** the `$GENERAL_IMPROVEMENT` description:

Current:
```
| `$GENERAL_IMPROVEMENT` | `/a-society/general/improvement/main.md` | Ready-made improvement philosophy template — principles for doc improvement decisions |
```

Proposed:
```
| `$GENERAL_IMPROVEMENT` | `/a-society/general/improvement/main.md` | Ready-made improvement philosophy and backward pass protocol template |
```

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.

**Specific confirmation requested on flagged item:** Whether Location A in File 2 (updating the "Backward pass ordering" paragraph in "The Owner as Workflow Entry and Terminal Node") is in scope for this flow.
