# A-Society: Improvement Principles and Backward Pass Protocol

This document combines the improvement philosophy and the backward pass protocol for A-Society's agent documentation system. It guides how framework improvement decisions are evaluated and resolved, and standardizes how Owner and Curator reflect on completed work and turn that reflection into documentation improvements.

All principles are drawn from the project-agnostic framework in `$GENERAL_IMPROVEMENT`. They apply here without modification; no A-Society-specific exceptions exist.

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
- Multiple unrelated agents load it for different reasons
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

Standardize how Owner and Curator reflect on completed framework work and turn that reflection into documentation improvements.

This protocol is A-Society's instantiation of `$GENERAL_IMPROVEMENT`. A-Society has two roles: Owner and Curator. The Curator is both a forward-pass participant (implementation) and the synthesis role (backward-pass last).

---

### When to Run

Run after every substantive forward pass — work that involved multiple phases or touched structural decisions. For trivial edits with no friction, the backward pass can be minimal — a single sentence noting that no friction was observed is sufficient. The backward pass is always done; depth varies.

**Depth:**
- **Lightweight:** 1–3 top findings, brief rationale. Use for routine work.
- **Full:** Structured findings using the template. Use when blocking friction, ambiguity, or contradictions were encountered.

The agent decides which depth is appropriate. If unsure, default to lightweight.

---

### Backward Pass Traversal

A-Society's forward pass: Owner enters first (Phase 1 briefing), Curator follows (Phases 2–3 proposal and implementation), Owner re-enters for review (Phase 4). First occurrences in order: Owner first, Curator second. Reversed: Curator first, Owner second. Curator also acts as synthesis role and is always last.

Backward pass order:
1. **Curator produces findings first** — as the role closest to implementation, Curator's first forward-pass occurrence reverses to first in the backward pass.
2. **Owner produces findings second** — Owner's first occurrence (entry point) reverses to second-to-last.
3. **Curator synthesizes last** — as the synthesis role, Curator produces synthesis after all finding artifacts are complete.

Only nodes that fired during this instance are included.

**Tooling:** `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` computes the traversal order programmatically from a workflow graph. Pass the path to `workflow/main.md`. The orderer returns roles in backward pass order, excluding roles that did not fire in this instance. When available, use the orderer rather than computing the order manually. When unavailable, apply the rules above.

---

### How It Works

1. **Curator produces findings first** (closest to implementation friction).
2. **Owner produces findings second**, reviewing Curator findings and adding strategic-level observations.
3. **Output:** The next sequenced artifact in the active record folder — e.g., `04-curator-findings.md`, `05-owner-findings.md`. See `$A_SOCIETY_RECORDS` for the naming convention.
4. **Template:** `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`
5. **Curator synthesizes** actionable items from both findings artifacts and routes them:
   - Changes within Curator authority (maintenance, corrections, clarifications Curator owns): implement directly to a-docs.
   - Changes requiring Owner judgment (structural decisions, additions to `general/`, direction changes): submit to Owner for approval; implement after approval.

---

### Reflection Categories

Use these to guide your reflection (not all will apply every time):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear

Ground every finding in a specific moment from your execution.

---

### Generalizable Findings

When a finding appears project-agnostic — meaning it would apply equally to a software project, a writing project, and a research project — flag it explicitly as a potential A-Society contribution. Note it in the findings artifact so it is not lost.

The submission mechanism is defined separately — flag the finding explicitly in your findings artifact so it is not silently lost when the mechanism becomes available.

---

### Useful Lenses

When evaluating whether a finding warrants action:

- **Portability:** Should the fix propagate to `general/`, or is it A-Society-specific?
- **Evolvability:** Does the fix reduce future edit cost?
- **Proportionality:** Is the fix worth the disruption?

These are judgment aids, not mandatory per-finding assessments.

---

### Guardrails

- Do not silently mutate role authority boundaries during improvement implementation.
- Do not rewrite historical reports. They are immutable once produced.
- If two documents conflict, resolve by updating one source-of-truth and adding a cross-reference — never duplicate.
- The backward pass is not an execution session. Agents reflecting should not produce plans, implementations, or new artifacts beyond their findings file.
