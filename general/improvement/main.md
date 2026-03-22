# Improvement Principles and Backward Pass Protocol

> [CUSTOMIZE] Replace all `[PROJECT_*]` placeholders with the appropriate `$VARIABLE_NAME` values from your project's index. Update role names to match your project's structure. Declare which output location applies (records or reports/) in the "Meta-Analysis Phase" section.

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

Run the backward pass after every substantive forward pass — any work that involved multiple phases or touched structural decisions. For trivial edits with no friction, the backward pass can be minimal — a single sentence noting that no friction was observed is sufficient. The backward pass is always done; depth varies.

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

**Tooling:** If the project has a Backward Pass Orderer tool (a programmatic component that computes traversal order from a workflow graph), invoke it for every flow regardless of role count. When a Backward Pass Orderer tool is available, manual traversal computation is not permitted. Manual ordering is reserved for projects where no such tool exists or for bootstrapping cases where the tool cannot be invoked. When the tool is available, use it — do not apply the manual traversal rules above as an alternative. The orderer reads `workflow.md` from the active record folder; invoke it using `orderWithPromptsFromFile` with the record folder path. The orderer returns a structured backward pass plan: an ordered list of entries, each containing a role, step type (`meta-analysis` | `synthesis`), session instruction (`existing-session` | `new-session`), and prompt. The synthesis entry is always the final entry in the list and is produced by the algorithm — do not append it manually. Consult the project's tooling documentation for the specific invocation path. When no such tool is available, apply the traversal rules above manually.

---

### Meta-Analysis Phase

Instructions for roles producing backward pass findings.

**Step 1.** **Each agent who participated in the forward pass** produces a findings artifact reflecting on their experience — what was clear, what was ambiguous, what was missing, what conflicted. Follow the traversal order above.

**Step 2.** **Output location:**
   - *If the project uses records:* `[PROJECT_RECORDS]/[identifier]/NN-<role>-findings.md` — findings are sequenced artifacts in the active record folder
   - *If the project does not use records:* `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md`

   The project's `improvement/main.md` declares which path applies.

**Step 3.** **Template:** `[PROJECT_IMPROVEMENT_TEMPLATE_FINDINGS]`

#### What to Reflect On

Use these categories to guide your reflection (not all will apply to every task):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear

Ground every finding in a specific moment from your execution. Vague findings ("the docs could be better") are not useful.

---

#### Analysis Quality

**Externally-caught errors are higher priority, not lower.** When an error was caught by another role or the human rather than surfaced by the agent themselves, this is a signal that something failed to prevent the error. The backward pass must ask: "Why wasn't this caught by me?" The answer "the rule was documented" is the start of the analysis, not the end. The next question — "why wasn't the documented rule followed?" — leads to placement gaps, surfacing gaps, or structural gaps, all of which are actionable.

**Artifact production vs. genuine analysis.** The reflection categories are a starting point, not a checklist to fill. If a finding could have been written without tracing the error, the analysis has not been done. A genuine finding names a specific root cause, not just a description of what went wrong.

---

#### Generalizable Findings

When a finding appears project-agnostic — meaning it would apply equally to a software project, a writing project, and a research project — flag it explicitly as a potential framework contribution. Note it in the findings artifact so it is not lost.

The submission mechanism is defined separately — flag the finding explicitly in your findings artifact so it is not silently lost when the mechanism becomes available.

---

#### Useful Lenses

When evaluating whether a finding warrants action, consider:

- **Portability:** Is the fix specific to this project, or should it propagate to the general library?
- **Evolvability:** Does the fix reduce future edit cost (e.g., canonical source + cross-reference instead of duplication)?
- **Proportionality:** Is the fix worth the disruption? Small friction in a rare edge case may not warrant a doc change.

These are judgment aids, not mandatory per-finding assessments.

---

### Synthesis Phase

Instructions for the synthesis role.

**Step 1.** **The synthesis role** reviews all findings and identifies which warrant action.

**Step 2.** **Actionable items are routed based on structural scope:**
   - Changes within `a-docs/`: implement directly without a formal proposal. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets. If the change is within `a-docs/`, make it now — never queue it.
   - Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create an entry for a future flow using the project's tracking mechanism. **Before filing**, apply the merge assessment: scan existing Next Priorities items for same target files/design area and compatible authority level; when a merge is identified, replace the existing item(s) with a merged item retaining all source citations. Do not initiate an Owner approval loop from within the backward pass.

   Do not re-route improvement items through the project's main execution workflow.

   The synthesis role completing synthesis closes the backward pass. No further handoff is required — the flow is complete when synthesis is done.

---

### Guardrails

- Do not silently mutate role authority boundaries during improvement implementation.
- Do not rewrite historical reports to match newer conventions. Reports are immutable once produced.
- If two documents conflict, resolve by updating one source-of-truth and adding a cross-reference — never duplicate.
- The backward pass is not an execution session. Agents reflecting should not produce plans, implementations, or new artifacts beyond their findings file.
- **Forward pass closure boundary:** Do not begin the backward pass before the forward pass is explicitly closed by the intake role as a distinct step. The intake role is the terminal node of every forward pass. Issuing a single instruction that collapses "complete registration" and "proceed to backward pass" into one step removes the boundary. The correct sequence is: (1) the final forward-pass role completes its work and returns to the intake role; (2) the intake role reviews the completed work, confirms that the forward pass is closed, and issues a separate backward-pass initiation. Findings produced before the forward pass is confirmed closed may be based on incomplete work. **Approval is not completion:** The intake role confirming forward pass closure while downstream tasks remain pending (e.g., a step approved but not yet executed) is a forward pass closure boundary violation. "Complete" means executed; the intake role must verify execution, not merely that approval was issued.
- **Every backward pass handoff must include all three fields.** Each role passing to the next backward pass role must include: `Next action:`, `Read:`, and `Expected response:`. Dropping a field is not permitted even when the receiving role could infer it from context. Inference is not a substitute for an explicit handoff. Each role is responsible for producing all three fields before passing.
