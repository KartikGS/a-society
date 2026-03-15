# Draft: Architecture Document Update

**Target:** `$A_SOCIETY_ARCHITECTURE` — `/a-society/a-docs/project-information/architecture.md`
**Type:** Specific changes — not a full rewrite. Changes listed by section.

---

## Change 1 — System Overview: three → four top-level folders

**Location:** System Overview section, opening sentence and folder list.

**Old:**
```
A-Society has three top-level folders, each with a distinct role:

- **`general/`** — the library. Distributable instructions, templates, and patterns that any adopting project can use without modification.
- **`agents/`** — the active agents. A-Society's deployed products that run on other projects (e.g., the Initializer). These are A-Society's work product, not internal tooling.
- **`a-docs/`** — the documentation layer. Agent documentation for agents working on A-Society itself. Sits alongside the work product, just as `a-docs/` sits alongside project work in any other project using this framework.

A programmatic tooling layer is planned. Its scope, components, and placement within the repository structure are not yet defined — the Technical Architect role is responsible for producing that design before implementation begins. No structural detail is recorded here until the design is approved.
```

**New:**
```
A-Society has four top-level folders, each with a distinct role:

- **`general/`** — the library. Distributable instructions, templates, and patterns that any adopting project can use without modification.
- **`agents/`** — the active agents. A-Society's deployed products that run on other projects (e.g., the Initializer). These are A-Society's work product, not internal tooling.
- **`tooling/`** — the programmatic tooling layer. Executable utilities that agents invoke to perform deterministic, rule-derived framework operations. These tools are A-Society's work product: adopting project agents invoke them via paths registered in the public index. Implemented in Node.js; invocation model is agent-invoked (agents call tools and interpret results in natural language — humans do not call tools directly).
- **`a-docs/`** — the documentation layer. Agent documentation for agents working on A-Society itself. Sits alongside the work product, just as `a-docs/` sits alongside project work in any other project using this framework.

The tooling layer comprises six components, each covering a distinct deterministic operation:

| Component | What it does |
|---|---|
| Path Validator (5) | Checks that every path registered in an index table resolves to an existing file |
| Version Comparator (6) | Identifies which framework update reports an adopting project has not yet applied |
| Consent Utility (2) | Creates consent files from template and checks consent status |
| Workflow Graph Schema Validator (3) | Validates that a workflow graph document matches the approved YAML frontmatter format |
| Backward Pass Orderer (4) | Computes correct backward pass traversal order from a workflow graph |
| Scaffolding System (1) | Creates the folder structure and stub files for a new project's `a-docs/` |

Component numbers reflect the implementation phase order (phases 1–5 in the approved proposal). Full component specifications are in `$A_SOCIETY_TOOLING_PROPOSAL`. Workflow, role definitions, and phase sequencing are in `$A_SOCIETY_TOOLING_ADDENDUM`.

**Node.js project initialization:** The `tooling/` directory is initialized with Node.js project scaffolding (`package.json`, directory structure) by the Tooling Developer after the Owner approves this architecture document update. This is a Developer responsibility — the Curator does not write to `tooling/`.
```

---

## Change 2 — Index coverage: include tooling/ in public index description

**Location:** System Overview section, the two-index paragraph.

**Old:**
```
Two indexes govern path resolution:

- **`a-society/index.md`** — the public index. Covers all paths in `general/` and `agents/`. External agents and project owners resolve paths here.
- **`a-society/a-docs/indexes/main.md`** — the internal index. Covers paths within `a-docs/`. Internal agents (Owner, Curator) resolve paths here.
```

**New:**
```
Two indexes govern path resolution:

- **`a-society/index.md`** — the public index. Covers all paths in `general/`, `agents/`, and `tooling/`. External agents and project owners resolve paths here.
- **`a-society/a-docs/indexes/main.md`** — the internal index. Covers paths within `a-docs/`. Internal agents (Owner, Curator, Tooling Developer) resolve paths here.
```

---

## Change 3 — Layer Isolation invariant: add tooling/

**Location:** Architectural Invariants — Layer Isolation section.

The Layer Isolation invariant currently names `a-docs/`, `general/`, and `agents/`. With `tooling/` now a fourth layer, the invariant's test statement and violation example need updating.

**Old:**
```
### Layer Isolation

`a-docs/` is documentation about A-Society. `general/` and `agents/` are A-Society's work product. These are categorically different things and must not be mixed.

- Content that is part of A-Society's deliverable (instructions, templates, active agents) belongs in `general/` or `agents/`, never in `a-docs/`
- Documentation for agents working on A-Society belongs in `a-docs/`, never in `general/` or `agents/`
- The test: "Is this describing A-Society, or is this something A-Society produces?" Descriptions → `a-docs/`. Products → `general/` or `agents/`

Violation: Placing an A-Society agent role file in `a-docs/roles/` when the agent works for other projects, not on A-Society.
```

**New:**
```
### Layer Isolation

`a-docs/` is documentation about A-Society. `general/`, `agents/`, and `tooling/` are A-Society's work product. These are categorically different things and must not be mixed.

- Content that is part of A-Society's deliverable (instructions, templates, active agents, executable utilities) belongs in `general/`, `agents/`, or `tooling/`, never in `a-docs/`
- Documentation for agents working on A-Society belongs in `a-docs/`, never in `general/`, `agents/`, or `tooling/`
- The test: "Is this describing A-Society, or is this something A-Society produces?" Descriptions → `a-docs/`. Products → `general/`, `agents/`, or `tooling/`
- The secondary test for work product placement: instructions and templates → `general/`; deployed agents that run on other projects → `agents/`; deterministic executable utilities → `tooling/`

Violation: Placing an A-Society agent role file in `a-docs/roles/` when the agent works for other projects, not on A-Society.
Violation: Placing tooling implementation code in `a-docs/` or `general/`.
```

---

## Index entries to add (Curator maintenance — no Owner approval required)

After the Owner approves this architecture update, the Curator will add the following entries to `$A_SOCIETY_INDEX` as a maintenance action:

| Variable | Path | Description |
|---|---|---|
| `$A_SOCIETY_TOOLING_PROPOSAL` | `/a-society/a-docs/tooling-architecture-proposal.md` | Technical Architect's component designs and automation boundary evaluation — binding specification for all six tooling components |
| `$A_SOCIETY_TOOLING_ADDENDUM` | `/a-society/a-docs/tooling-architecture-addendum.md` | Tooling implementation workflow, roles, and phase sequencing — companion to the proposal |
| `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` | `/a-society/a-docs/roles/tooling-developer.md` | A-Society Tooling Developer Agent role — implementation scope, hard rules, and escalation triggers |

These three entries are needed before the Tooling Developer role is functional (the Developer's context loading references the proposal and addendum by variable name).

---

## No changes to other sections

The Feedback Signal Architecture, Boundary Respect, Portability Hard Constraint, Information Ownership, Context Loading Scope, and Consent Before Signal invariants require no changes from this update.
