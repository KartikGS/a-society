# A-Society — Public Index

This is the single source of truth for all public-facing file paths in `a-society/` — the `general/` library and the standing executable operator surface.

Project owners, runtime initialization flows, and other public-facing A-Society surfaces resolve file paths from this index. Internal A-Society agents working on the framework itself use `a-society/a-docs/indexes/main.md` for internal paths.

When a file moves, update **only the relevant row here**. All docs referencing a variable name (`$VAR`) will resolve correctly from a single change.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| **Runtime** | | |
| `$A_SOCIETY_RUNTIME_INVOCATION` | `a-society/runtime/INVOCATION.md` | Sole default operator-facing executable reference — runtime commands, runtime signals, operator output model, state location, and telemetry configuration |
| `$A_SOCIETY_RUNTIME_HANDOFF_CONTRACT` | `a-society/runtime/contracts/handoff.md` | Runtime-owned machine-readable handoff contract — injected by the runtime into every managed session |
| `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT` | `a-society/runtime/contracts/workflow.md` | Runtime-owned workflow YAML contract — schema, role-instance behavior, node-entry injection, and active-path routing semantics |
| `$A_SOCIETY_RUNTIME_RECORDS_CONTRACT` | `a-society/runtime/contracts/records.md` | Runtime-owned flow records contract — injected by the runtime into every managed session; governs active record placement, writable scope, and runtime-managed metadata |
| `$A_SOCIETY_RUNTIME_INITIALIZATION` | `a-society/runtime/contracts/initialization.md` | Runtime-owned initialization contract — used by the browser runtime when taking over an existing project without `a-docs/` or starting a greenfield project |
| `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST` | `a-society/runtime/contracts/a-docs-manifest.yaml` | Runtime-owned a-docs manifest — machine-readable scaffold and health-check contract for default project `a-docs/` surfaces |
| `$A_SOCIETY_RUNTIME_FEEDBACK` | `a-society/runtime/contracts/feedback.md` | Runtime-owned final backward-pass feedback contract — used by the runtime's A-Society feedback phase |
| **Feedback** | | |
| `$A_SOCIETY_FEEDBACK_DIR` | `a-society/feedback/` | All inbound feedback signal from adopting projects — new runtime-generated feedback lands directly here |
| `$ONBOARDING_SIGNAL_TEMPLATE` | `a-society/feedback/onboarding/_template.md` | Legacy initialization-feedback template retained for historical references |
| `$A_SOCIETY_FEEDBACK_ONBOARDING` | `a-society/feedback/onboarding/` | Legacy initialization-feedback collection retained for historical artifacts |
| `$A_SOCIETY_FEEDBACK_MIGRATION` | `a-society/feedback/migration/` | Legacy migration-feedback collection retained for historical artifacts |
| `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL` | `a-society/feedback/curator-signal/` | Legacy project-feedback collection retained for historical artifacts |
| **Framework Updates** | | |
| `$A_SOCIETY_VERSION` | `a-society/VERSION.md` | A-Society's current framework version — single source of truth for the vMAJOR.MINOR version stamp |
| `$A_SOCIETY_UPDATES_DIR` | `a-society/updates/` | Published framework update reports — outbound notifications to adopting projects when framework changes require a-docs review |
| **Workflows** | | |
| `$A_SOCIETY_WORKFLOW` | `a-society/a-docs/workflow/main.yaml` | A-Society canonical workflow definition — the single permanent graph for framework, executable, and coordinated multi-role work |
| **Instructions** | | |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | `a-society/general/instructions/a-society-version-record.md` | How to create and maintain an A-Society version record in any initialized project |
| `$INSTRUCTION_TOOLING` | `a-society/general/instructions/tooling.md` | How to create a tooling document for any project |
| `$INSTRUCTION_VISION` | `a-society/general/instructions/project-information/vision.md` | How to create a vision document for any project |
| `$INSTRUCTION_STRUCTURE` | `a-society/general/instructions/project-information/structure.md` | How to create a structure document for any project |
| `$INSTRUCTION_INDEX` | `a-society/general/instructions/indexes/main.md` | How to create a file path index for any project |
| `$INSTRUCTION_AGENT_DOCS_GUIDE` | `a-society/general/instructions/a-docs-guide.md` | How to create an agent-docs guide for any project |
| `$INSTRUCTION_ADOCS_DESIGN` | `a-society/general/instructions/a-docs-design.md` | How to create and maintain an a-docs design-principles file for any project |
| `$INSTRUCTION_AGENTS` | `a-society/general/instructions/agents.md` | How to create an agents.md for any project |
| `$INSTRUCTION_ROLES` | `a-society/general/instructions/roles/main.md` | How to create role documents — archetypes and templates |
| `$INSTRUCTION_REQUIRED_READINGS` | `a-society/general/instructions/roles/required-readings.md` | How to maintain per-role `required-readings.yaml` files — machine-readable startup-context authority |
| `$INSTRUCTION_OWNERSHIP` | `a-society/general/instructions/roles/ownership.md` | How to maintain per-role `ownership.yaml` files — distributed surface accountability |
| `$INSTRUCTION_ARCHITECTURE` | `a-society/general/instructions/project-information/architecture.md` | How to create an architecture document for any project |
| `$INSTRUCTION_LOG` | `a-society/general/instructions/project-information/log.md` | How to create a project log for any project |
| `$INSTRUCTION_PRINCIPLES` | `a-society/general/instructions/project-information/principles.md` | How to create a project principles document for any project |
| `$INSTRUCTION_WORKFLOW` | `a-society/general/instructions/workflow/main.md` | How to create a workflow document for any project |
| `$INSTRUCTION_WORKFLOW_GRAPH` | `a-society/general/instructions/workflow/graph.md` | How to create and maintain a machine-readable workflow graph representation (YAML frontmatter) — enables programmatic backward pass ordering |
| `$INSTRUCTION_WORKFLOW_MODIFY` | `a-society/general/instructions/workflow/modify.md` | How to modify an existing workflow — single-graph model, evaluative principles, hard rules, and six-step modification procedure |
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | `a-society/general/instructions/workflow/complexity.md` | How to construct a complexity-proportional workflow — five complexity axes, three tiers, workflow plan as approval gate, and backward graph tracking |
| `$INSTRUCTION_WORKFLOW_PLANS` | `a-society/general/instructions/workflow/plans/main.md` | How to create a plans structure for any project |
| `$INSTRUCTION_WORKFLOW_REPORTS` | `a-society/general/instructions/workflow/reports/main.md` | How to create a reports structure for any project |
| `$INSTRUCTION_WORKFLOW_REQUIREMENTS` | `a-society/general/instructions/workflow/requirements/main.md` | How to create a requirements structure for any project |
| `$INSTRUCTION_DEVELOPMENT` | `a-society/general/instructions/development/main.md` | How to create a development folder for any project |
| `$INSTRUCTION_GOVERNANCE` | `a-society/general/instructions/governance/main.md` | How to create a governance folder for any project |
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
