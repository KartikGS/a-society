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
