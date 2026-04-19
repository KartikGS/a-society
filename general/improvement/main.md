# Improvement Principles

This document defines the improvement philosophy for a project's agent documentation system. It guides how future process gaps are evaluated and resolved, and standardizes how agents reflect on completed work and turn that reflection into documentation improvements.

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

## Principle 3: Surfaced Authority Over Transitive Reference Chasing

**A cross-reference does not automatically become required reading. Load what the role or workflow explicitly surfaces as authority for the task.**

Cross-references are useful pointers to authoritative homes, but recursively loading every referenced document bloats context and makes it harder for agents to distinguish "nice to know" from "must act on now."

**Rule for agents:** Use standing documents and workflow-delivered context as task authority. Follow a cross-reference when the current task specifically requires that topic, not merely because the reference exists.

**Rule for doc authors:** If a role or workflow node truly needs a document every time, surface it explicitly through `required-readings.yaml` or node-specific workflow injection. Do not rely on passive reference chains to deliver required context.

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

## How to Apply These Principles in Improvement Work

When evaluating a proposed fix during backward-pass work:

1. **Before deciding "add to X"** — ask whether X is the right home. Would a new dedicated file serve the atomic change site principle better?
2. **Before deciding "add a new protocol"** — ask whether user consultation adequately handles the edge case. Reject the protocol if the informal path is sufficient.
3. **Before deciding "add a cross-reference"** — ensure the cross-reference uses a `$VARIABLE_NAME`. The implementing agent must be able to follow it without interpretation.
4. **When creating new content** — decide first whether it is project-specific or cross-project. Place it accordingly.

---

## Backward Pass Protocol

The improvement process runs in two phases, each with its own instruction file:
- **Meta-analysis:** `$GENERAL_IMPROVEMENT_META_ANALYSIS` — instructions for roles producing backward pass findings.
- **Feedback:** `$GENERAL_IMPROVEMENT_FEEDBACK` — instructions for the coordinating Owner's final framework-feedback step.

The backward pass is only for the project's framework layer:
- local `a-docs/`
- local workflow and coordination surfaces
- local agent-facing tooling/runtime guidance

It is not for the project's domain work product. Product bugs, feature requests, or editorial/content changes belong to the project's normal execution system, not the improvement loop.

When using the A-Society runtime, these files are injected into the appropriate agent sessions automatically. For projects without the runtime, follow the traversal ordering rules in your project's `a-docs/improvement/` instantiation of this framework.
