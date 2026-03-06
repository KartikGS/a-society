# A-Society: Agent-Docs Guide

This document explains why each file and folder in `a-society/`'s agent-docs exists — its purpose, what it is responsible for, and what would break if it were removed or consolidated with something else. It is written for the Curator: the agent responsible for maintaining these files.

This is not a directory listing. It is a rationale document. Read it before maintaining any file in this project.

---

## Project-Level Files

### `agents.md` — `$A_SOCIETY_AGENTS`

**Why it exists:** Every agent working on A-Society reads this first. It is the single entry point that orients any agent to the project — what the project is, what roles exist, what documents to read and in what order, and what invariants govern all work here.

**What it owns:** Role registration (the roles table), required reading sequence, context confirmation protocol, authority hierarchy for conflict resolution, and project-wide invariants.

**What breaks without it:** Agents have no reliable starting point. Role existence is undiscoverable. Reading order is undefined.

**Do not consolidate with:** The vision (which explains what the project is, not how to operate within it), or any role file (which governs a specific role, not all agents).

---

### `agent-docs-guide.md` — `$A_SOCIETY_AGENT_DOCS_GUIDE`

**Why it exists:** The Curator cannot maintain files it does not understand. This document ensures the Curator knows not just where files are (that is the index's job) but *why each file exists* — so it can maintain them correctly, avoid consolidating things that must stay separate, and recognize when a file's purpose has drifted.

**What it owns:** Rationale for every significant file and folder in this project's agent-docs.

**Do not consolidate with:** `project-information/structure.md` (structure explains folder placement rules; this explains file purpose) or `agents.md` (agents.md is the entry point for all agents; this is deep context for the Curator specifically).

---

## `indexes/`

### `indexes/main.md` — `$A_SOCIETY_INDEX`

**Why it exists:** File paths change. When they do, every document that hardcodes a path breaks. The index is the single source of truth for file locations — all references to key files use `$VARIABLE_NAME` which resolves here. To move a file, update one row.

**What it owns:** The variable-to-path mapping for every key file in the project. Any file referenced by other documents should be registered here.

**What breaks without it:** `$VAR` references in other documents become unresolvable. File moves require hunting down every reference across the entire project.

**Do not consolidate with:** `agents.md` — the index is a lookup table; agents.md is an orientation document. Merging them would make agents.md too long and the index harder to scan.

---

## `project-information/`

### `project-information/vision.md` — `$A_SOCIETY_VISION`

**Why it exists:** Every scope and direction dispute traces back to the vision. It is the reference document for "does this addition belong in A-Society?" and "is this general enough for `general/`?" The core bet lives here.

**What it owns:** What A-Society is, the problem it solves, the core bet, what "agentic-friendly" means, and direction for agents extending the framework.

**What breaks without it:** Scope disputes cannot be resolved by reference. Agents must guess at the boundaries of the framework. Additions accumulate without a shared standard for what belongs.

**Do not consolidate with:** `structure.md` — vision answers "what is this and why?" and structure answers "where does content go?" These are distinct questions with distinct answers.

---

### `project-information/structure.md` — `$A_SOCIETY_STRUCTURE`

**Why it exists:** Every time new content is created, someone must decide which folder it belongs in. This document makes that decision explicit and principled — not a matter of preference or guesswork.

**What it owns:** The purpose and governing principle of each folder in `a-society/`, what belongs in each folder, what does not, and how the structure grows.

**What breaks without it:** Agents place content based on instinct or analogy. The folder structure drifts from its intended design. Related content ends up scattered.

**Do not consolidate with:** `vision.md` — structure is operational (governs placement decisions); vision is strategic (governs scope decisions).

---

## `roles/`

### `roles/owner.md` — `$A_SOCIETY_OWNER_ROLE`

**Why it exists:** The Owner role has authority boundaries, review criteria, and escalation triggers specific to A-Society — in particular the generalizability test, abstraction level test, and duplication test that govern what enters `general/`. A generic template would not capture these.

**What it owns:** The A-Society Owner's authority, what they own and do not own, how they review contributions to the framework, and when they escalate.

**What breaks without it:** An Owner agent has no specific behavioral contract. They either over-reach (making framework changes beyond their authority) or under-reach (asking the human for every small decision).

**Do not consolidate with:** `general/roles/owner.md` — the general template is for any project; this file is A-Society's specific instantiation with A-Society-specific review tests.

---

### `roles/curator.md` — `$A_SOCIETY_CURATOR_ROLE`

**Why it exists:** The Curator role has hard rules and escalation triggers specific to A-Society's maintenance needs — in particular the prohibition on writing to `general/` without Owner approval, the requirement to use `$VAR` references, and the distillation protocol for proposing patterns from observed projects.

**What it owns:** The A-Society Curator's maintenance scope, hard rules, pattern distillation process, current active work, and escalation triggers.

**What breaks without it:** A Curator agent has no specific behavioral contract. They may write directly to `general/` without approval, hardcode paths, or perform migration work without understanding the framework's boundaries.

**Do not consolidate with:** `general/roles/curator.md` — same reasoning as above. The general template is the pattern; this is the A-Society-specific instantiation.

---

## `workflow/`

### `workflow/main.md` — `$A_SOCIETY_WORKFLOW`

**Why it exists:** A-Society has a non-obvious workflow constraint: the Curator cannot write to `general/` without Owner approval. Without a workflow document, agents must infer this constraint from role files — and may miss it. The workflow document is the single place where all phases, handoffs, invariants, and escalation rules are declared explicitly for any agent operating in this project.

**What it owns:** The five-phase workflow (Observation → Proposal → Owner Review → Implementation → Registration), all handoff protocols, the four framework invariants (Portability, Approval, Single-Source, Index-Before-Reference), and escalation triggers.

**What breaks without it:** Agents improvise process. The Approval Invariant is discoverable only by reading the Curator role file — which not all agents load. Cross-role work has no shared playbook.

**Do not consolidate with:** `roles/owner.md` or `roles/curator.md` — role documents describe what each role owns; the workflow document describes what happens to work as it moves through phases, regardless of which role is involved.

---

## `improvement/`

### `improvement/main.md` — `$A_SOCIETY_IMPROVEMENT`

**Why it exists:** Improvement decisions — when to split a file, when to add a protocol, when to cross-reference rather than duplicate — require principled reasoning not captured in any role document. Without an improvement philosophy document, improvement sessions default to intuition rather than consistent principles.

**What it owns:** The five improvement principles and the decision framework for applying them during meta-synthesis.

**What breaks without it:** Improvement sessions reinvent principles each time. Agents making doc maintenance decisions have no principled baseline, leading to inconsistent results.

**Do not consolidate with:** `improvement/protocol.md` — the philosophy governs *what* decisions to make; the protocol governs *how* the improvement process runs. These are categorically different.

---

### `improvement/protocol.md` — `$A_SOCIETY_IMPROVEMENT_PROTOCOL`

**Why it exists:** Without a protocol, improvement cycles are ad-hoc — findings are lost, synthesis is inconsistent, and implementation may happen without human approval. The protocol standardizes the three-phase meta cycle so every improvement session runs the same way.

**What it owns:** The hybrid operating model (Mode A task-linked, Mode B alignment), three-phase meta flow with role assignments (Curator findings, Owner synthesis), decision ownership table, role health indicators, and guardrails.

**What breaks without it:** Improvement cycles lack a standard structure. The Owner may synthesize without Curator findings, or implement without human approval. Role health degradation goes undetected.

**Do not consolidate with:** `improvement/main.md` — the protocol is the process; the philosophy is the reasoning behind decisions within that process.

---

### `improvement/reports/` — `$A_SOCIETY_IMPROVEMENT_REPORTS`

**Why it exists:** Improvement artifacts (lightweight summaries, per-agent findings, synthesis documents, alignment backlogs) need a dedicated, stable location. Without it, reports scatter and the improvement protocol's output paths are unresolvable.

**What it owns:** All improvement output artifacts and the reports index (`main.md`) with naming conventions and template references.

**What breaks without it:** The protocol's output paths point nowhere. Historical improvement findings are lost. The alignment backlog has no home.

**Do not consolidate with:** `workflow/` — improvement artifacts are meta-level (about the docs); workflow artifacts are execution-level (about framework work).

---

## `communication/`

### `communication/main.md` — `$A_SOCIETY_COMM`

**Why it exists:** Roles and workflow phases define what happens and who owns it. The communication folder defines how agents interact — what artifacts they exchange, in what format, under what rules. Without it, agents invent their own handoff formats and apply inconsistent coordination rules across sessions.

**What it owns:** Entry point orienting the Curator and Owner to the two sub-layers (conversation and coordination) and explaining which layer to consult for which question.

**What breaks without it:** The communication folder has no navigable entry point. Agents must scan the sub-folders to understand the structure.

**Do not consolidate with:** `workflow/main.md` — the workflow document describes phase sequencing; this folder describes the communication rules within and between those phases.

---

### `communication/conversation/` — `$A_SOCIETY_COMM_CONVERSATION`

**Why it exists:** Every proposal the Curator submits and every decision the Owner issues must pass through a structured artifact. Without templates, handoff formats vary by session. Without live files at stable paths, artifacts are not findable.

**What it owns:** The live `curator-to-owner.md` and `owner-to-curator.md` files (current active handoffs), the permanent templates for each, and the artifact lifecycle documentation.

**What breaks without it:** Proposals and decisions are made informally in conversation. There is no auditable record of what was submitted, what decision was issued, or what constraints were placed on implementation.

**Do not consolidate with:** `communication/coordination/` — conversation is about the artifacts; coordination is about the rules governing those artifacts. They are separate layers for the same reason role documents and workflow documents are separate.

---

### `communication/coordination/` — `$A_SOCIETY_COMM_COORDINATION`

**Why it exists:** The standing rules of inter-agent communication must be declared and stable. Without a coordination layer, each session re-negotiates what counts as an approved handoff, what to do when something goes wrong, and who has authority to resolve disagreements.

**What it owns:** The status vocabulary (shared across all artifacts), the handoff protocol, the feedback protocol (what to do when a discrepancy is discovered), and the conflict-resolution procedure.

**What breaks without it:** Agents apply different status tokens, have no shared procedure for reporting blockers, and escalate conflicts inconsistently. The coordination failures that emerge look like execution failures but are actually structural gaps.

**Do not consolidate the three sub-documents:** Each answers a distinct question — handoff format, discrepancy response, and dispute resolution. Merging them makes the relevant rule harder to find under pressure.

---

## `updates/`

### `updates/protocol.md` — `$A_SOCIETY_UPDATES_PROTOCOL`

**Why it exists:** When A-Society changes `general/` or `agents/` in ways that affect adopting projects, those projects need to know what changed, why, and what to do. Without a protocol, the decision of when to publish and what to include is made ad-hoc each time — producing inconsistent reports that adopting project Curators cannot reliably act on.

**What it owns:** The trigger conditions for publishing a framework update report, the impact classification model (Breaking / Recommended / Optional), the production and approval process, the naming convention for report files, and the delivery problem statement.

**What breaks without it:** The Curator has no principled basis for deciding when to publish. Reports vary in structure and completeness. Adopting project Curators cannot triage changes reliably.

**Do not consolidate with:** `improvement/protocol.md` — the improvement protocol governs internal A-Society reflection; the update report protocol governs outbound communication to the ecosystem. Different audiences, different purposes.

---

### `updates/template.md` — `$A_SOCIETY_UPDATES_TEMPLATE`

**Why it exists:** Adopting project Curators read update reports to decide what to change in their own `a-docs/`. A consistent template ensures every report contains what a Curator needs: a summary, an impact classification table, per-change entries with migration guidance, and a delivery note.

**What it owns:** The canonical structure for a framework update report — sections, fields, and format expectations.

**What breaks without it:** Reports are written free-form. Consuming Curators must infer structure. Migration guidance is inconsistently provided. The impact classification model is applied inconsistently.

**Do not consolidate with:** `updates/protocol.md` — the protocol governs when and how to produce reports; the template is the artifact the report fills. Process document vs. format document.

---

## `general/`

### `general/instructions/` — folder

**Why it exists:** This is the instruction library. Each file answers "how do you create [X] for a new project?" Instructions are separated from the artifacts they describe. A project that uses A-Society inherits the instructions but creates its own artifacts.

**What it owns:** Reusable, project-agnostic guidance for standing up new agent-docs artifacts. Every instruction here must work equally for a software project, a writing project, and a research project.

**What breaks without it:** Each new project figures out how to create these artifacts from scratch. Hard-won patterns from one project are not available to the next.

---

### `general/roles/` — folder

**Why it exists:** Ready-made role documents with `[CUSTOMIZE]` markers. A project adopting the framework takes a template, fills in the marked sections, and has a working role — without starting from a blank page.

**What it owns:** Starting-point role documents that encode the correct structure and most of the content for common archetypes.

**What breaks without it:** Each project re-invents role documents from scratch. The instruction for roles exists, but the gap between instruction and a working role document is larger without a template.

**Do not consolidate `general/roles/` with `general/instructions/roles/`:** Instructions describe *how* to create a role document. Templates *are* role documents, ready to use. They serve different purposes and must remain separate.
