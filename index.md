# A-Society — General Library Index

This is the single source of truth for reusable general-library file paths in `a-society/general/`.

Runtime initialization flows inject this index so the initialization Owner can resolve A-Society's reusable instructions and templates while creating a project's first `a-docs/` layer. Internal A-Society agents working on the framework itself use `a-society/a-docs/indexes/main.md` for internal paths, runtime contracts, feedback locations, and project-specific A-Society documentation.

When a file moves, update **only the relevant row here**. All docs referencing a variable name (`$VAR`) will resolve correctly from a single change.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| **Instructions** | | |
| `$INSTRUCTION_TOOLING` | `a-society/general/instructions/tooling.md` | How to create a tooling document for any project |
| `$INSTRUCTION_VISION` | `a-society/general/instructions/project-information/vision.md` | How to create a vision document for any project |
| `$INSTRUCTION_STRUCTURE` | `a-society/general/instructions/project-information/structure.md` | How to create a structure document for any project |
| `$INSTRUCTION_INDEX` | `a-society/general/instructions/indexes/main.md` | How to create a file path index for any project |
| `$INSTRUCTION_ADOCS_DESIGN` | `a-society/general/instructions/a-docs-design.md` | How to create and maintain an a-docs design-principles file for any project |
| `$INSTRUCTION_AGENTS` | `a-society/general/instructions/agents.md` | How to create an agents.md for any project |
| `$INSTRUCTION_ROLES` | `a-society/general/instructions/roles/main.md` | How to create role documents — archetypes and templates |
| `$INSTRUCTION_REQUIRED_READINGS` | `a-society/general/instructions/roles/required-readings.md` | How to maintain per-role `required-readings.yaml` files — machine-readable startup-context authority |
| `$INSTRUCTION_OWNERSHIP` | `a-society/general/instructions/roles/ownership.md` | How to maintain per-role `ownership.yaml` files — distributed surface accountability |
| `$INSTRUCTION_ARCHITECTURE` | `a-society/general/project-types/executable/instructions/project-information/architecture.md` | How to create an architecture document for projects with an executable layer |
| `$INSTRUCTION_LOG` | `a-society/general/instructions/project-information/log.md` | How to create a project log for any project |
| `$INSTRUCTION_PRINCIPLES` | `a-society/general/instructions/project-information/principles.md` | How to create a project principles document for any project |
| `$INSTRUCTION_WORKFLOW` | `a-society/general/instructions/workflow/main.md` | How to create a workflow document for any project |
| `$INSTRUCTION_WORKFLOW_GRAPH` | `a-society/general/instructions/workflow/graph.md` | How to create and maintain a machine-readable workflow graph representation (YAML frontmatter) — enables programmatic backward pass ordering |
| `$INSTRUCTION_WORKFLOW_MODIFY` | `a-society/general/instructions/workflow/modify.md` | How to modify an existing workflow — single-graph model, evaluative principles, hard rules, and six-step modification procedure |
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | `a-society/general/instructions/workflow/complexity.md` | How to construct a complexity-proportional workflow — five complexity axes, three tiers, workflow plan as approval gate, and backward graph tracking |
| `$INSTRUCTION_DEVELOPMENT` | `a-society/general/project-types/executable/instructions/development/main.md` | How to create a development folder for projects with an executable layer |
| `$INSTRUCTION_GOVERNANCE` | `a-society/general/project-types/executable/instructions/governance/main.md` | How to create a governance folder for projects with an executable layer |
| `$INSTRUCTION_COMMUNICATION` | `a-society/general/instructions/communication/main.md` | How to create a communication folder for any project |
| `$INSTRUCTION_COMMUNICATION_CONVERSATION` | `a-society/general/instructions/communication/conversation/main.md` | How to create a conversation layer |
| `$INSTRUCTION_COMMUNICATION_COORDINATION` | `a-society/general/instructions/communication/coordination/main.md` | How to create coordination protocols |
| `$INSTRUCTION_IMPROVEMENT` | `a-society/general/instructions/improvement/main.md` | How to create an improvement/ folder for any project |
| **a-docs Templates** | | |
| `$GENERAL_ADOCS_DESIGN` | `a-society/general/a-docs-design.md` | Ready-made a-docs design principles template — adopt in any project to govern how the a-docs layer is authored |
| **Role Templates** | | |
| `$GENERAL_OWNER_ROLE` | `a-society/general/roles/owner/main.md` | Ready-made Owner role template for any project |
| `$GENERAL_OWNER_BRIEF_WRITING` | `a-society/general/roles/owner/brief-writing.md` | Ready-made Owner brief-writing and constraint-writing support doc template |
| `$GENERAL_OWNER_REVIEW_BEHAVIOR` | `a-society/general/roles/owner/review-behavior.md` | Ready-made Owner contribution-review support doc template |
| `$GENERAL_OWNER_LOG_MANAGEMENT` | `a-society/general/roles/owner/log-management.md` | Ready-made Owner intake and log-management support doc template |
| `$GENERAL_OWNER_CLOSURE` | `a-society/general/roles/owner/forward-pass-closure.md` | Ready-made Owner forward-pass closure support doc template |
| `$GENERAL_TA_ROLE` | `a-society/general/project-types/executable/roles/technical-architect/main.md` | Ready-made Technical Architect (advisory-producing) role template for projects with an executable layer — authority, boundaries, and workflow-linked support-doc routing |
| **Communication Templates** | | |
| `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` | `a-society/general/communication/conversation/TEMPLATE-owner-workflow-plan.md` | Ready-made workflow plan template — instantiated at intake as `owner-workflow-plan.md` in the record folder; five complexity axes, tier, path, known unknowns |
| **Improvement Templates** | | |
| `$GENERAL_IMPROVEMENT` | `a-society/general/improvement/main.md` | Ready-made improvement philosophy template |
| `$GENERAL_IMPROVEMENT_META_ANALYSIS` | `a-society/general/improvement/meta-analysis.md` | Meta-analysis phase instructions — injected into backward pass agent sessions by the runtime; contains reflection categories, analysis quality guidance, and `meta-analysis-complete` signal schema |
