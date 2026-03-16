# A-Society — Public Index

This is the single source of truth for all public-facing file paths in `a-society/` — the `general/` library and the `agents/` layer.

External agents (e.g., the Initializer) and project owners resolve file paths from this index. Internal A-Society agents working on the framework itself use `a-society/a-docs/indexes/main.md` for internal paths.

When a file moves, update **only the relevant row here**. All docs referencing a variable name (`$VAR`) will resolve correctly from a single change.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| **Agents** | | |
| `$A_SOCIETY_INITIALIZER` | `/a-society/agents/initializer.md` | A-Society Initializer Agent — bootstraps a new project's `a-docs/` |
| **Tooling** | | |
| `$A_SOCIETY_TOOLING_INVOCATION` | `/a-society/tooling/INVOCATION.md` | Invocation reference for all six tooling components — quick start, entry points, and error conventions |
| `$A_SOCIETY_TOOLING_SCAFFOLDING_SYSTEM` | `/a-society/tooling/src/scaffolding-system.js` | Component 1: Scaffolding System — creates a-docs/ folder structure and stub files from the manifest |
| `$A_SOCIETY_TOOLING_CONSENT_UTILITY` | `/a-society/tooling/src/consent-utility.js` | Component 2: Consent Utility — creates and checks feedback consent files |
| `$A_SOCIETY_TOOLING_WORKFLOW_GRAPH_VALIDATOR` | `/a-society/tooling/src/workflow-graph-validator.js` | Component 3: Workflow Graph Validator — validates YAML frontmatter schema in workflow/main.md |
| `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` | `/a-society/tooling/src/backward-pass-orderer.js` | Component 4: Backward Pass Orderer — computes backward pass role traversal order from a workflow graph |
| `$A_SOCIETY_TOOLING_PATH_VALIDATOR` | `/a-society/tooling/src/path-validator.js` | Component 5: Path Validator — checks whether every path in an index table resolves to an existing file |
| `$A_SOCIETY_TOOLING_VERSION_COMPARATOR` | `/a-society/tooling/src/version-comparator.js` | Component 6: Version Comparator — identifies framework update reports an adopting project has not yet applied |
| **Feedback** | | |
| `$ONBOARDING_SIGNAL_TEMPLATE` | `/a-society/feedback/onboarding/_template.md` | Template for Initializer signal reports — one report per initialization run |
| `$INSTRUCTION_CONSENT` | `/a-society/general/instructions/consent.md` | How to establish the feedback consent system in a project during initialization |
| `$GENERAL_FEEDBACK_CONSENT` | `/a-society/general/feedback/consent.md` | Ready-made consent file template — instantiated per feedback type in a project's a-docs/feedback/[type]/ |
| `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` | `/a-society/general/feedback/template-migration.md` | Migration feedback report template — used by Curators after implementing framework update reports |
| `$GENERAL_FEEDBACK_CURATOR_SIGNAL_TEMPLATE` | `/a-society/general/feedback/template-curator-signal.md` | Curator-signal feedback report template — used by Curators after backward passes or ongoing observation |
| `$A_SOCIETY_FEEDBACK_ONBOARDING` | `/a-society/feedback/onboarding/` | Initializer signal reports — filed after initialization runs with project consent |
| `$A_SOCIETY_FEEDBACK_MIGRATION` | `/a-society/feedback/migration/` | Migration feedback reports — filed by Curators after implementing framework update reports |
| `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL` | `/a-society/feedback/curator-signal/` | Curator-signal reports from adopting projects — patterns and gaps filed after backward passes |
| **Framework Updates** | | |
| `$A_SOCIETY_VERSION` | `/a-society/VERSION.md` | A-Society's current framework version — single source of truth for the vMAJOR.MINOR version stamp |
| `$A_SOCIETY_UPDATES_DIR` | `/a-society/updates/` | Published framework update reports — outbound notifications to adopting projects when `general/` or `agents/` changes require a-docs review |
| **Instructions** | | |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | `/a-society/general/instructions/a-society-version-record.md` | How to create and maintain an A-Society version record in any initialized project |
| `$INSTRUCTION_TOOLING` | `/a-society/general/instructions/tooling.md` | How to create a tooling document for any project |
| `$INSTRUCTION_VISION` | `/a-society/general/instructions/project-information/vision.md` | How to create a vision document for any project |
| `$INSTRUCTION_STRUCTURE` | `/a-society/general/instructions/project-information/structure.md` | How to create a structure document for any project |
| `$INSTRUCTION_INDEX` | `/a-society/general/instructions/indexes/main.md` | How to create a file path index for any project |
| `$INSTRUCTION_AGENT_DOCS_GUIDE` | `/a-society/general/instructions/a-docs-guide.md` | How to create an agent-docs guide for any project |
| `$INSTRUCTION_AGENTS` | `/a-society/general/instructions/agents.md` | How to create an agents.md for any project |
| `$INSTRUCTION_ROLES` | `/a-society/general/instructions/roles/main.md` | How to create role documents — archetypes and templates |
| `$INSTRUCTION_ARCHITECTURE` | `/a-society/general/instructions/project-information/architecture.md` | How to create an architecture document for any project |
| `$INSTRUCTION_LOG` | `/a-society/general/instructions/project-information/log.md` | How to create a project log for any project |
| `$INSTRUCTION_PRINCIPLES` | `/a-society/general/instructions/project-information/principles.md` | How to create a project principles document for any project |
| `$INSTRUCTION_WORKFLOW` | `/a-society/general/instructions/workflow/main.md` | How to create a workflow document for any project |
| `$INSTRUCTION_WORKFLOW_GRAPH` | `/a-society/general/instructions/workflow/graph.md` | How to create and maintain a machine-readable workflow graph representation (YAML frontmatter) — enables programmatic backward pass ordering |
| `$INSTRUCTION_WORKFLOW_MODIFY` | `/a-society/general/instructions/workflow/modify.md` | How to modify an existing workflow — single-graph model, evaluative principles, hard rules, and six-step modification procedure |
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | `/a-society/general/instructions/workflow/complexity.md` | How to construct a complexity-proportional workflow — five complexity axes, three tiers, workflow plan as approval gate, and backward graph tracking |
| `$INSTRUCTION_WORKFLOW_PLANS` | `/a-society/general/instructions/workflow/plans/main.md` | How to create a plans structure for any project |
| `$INSTRUCTION_WORKFLOW_REPORTS` | `/a-society/general/instructions/workflow/reports/main.md` | How to create a reports structure for any project |
| `$INSTRUCTION_WORKFLOW_REQUIREMENTS` | `/a-society/general/instructions/workflow/requirements/main.md` | How to create a requirements structure for any project |
| `$INSTRUCTION_DEVELOPMENT` | `/a-society/general/instructions/development/main.md` | How to create a development folder for any project |
| `$INSTRUCTION_GOVERNANCE` | `/a-society/general/instructions/governance/main.md` | How to create a governance folder for any project |
| `$INSTRUCTION_COMMUNICATION` | `/a-society/general/instructions/communication/main.md` | How to create a communication folder for any project |
| `$INSTRUCTION_COMMUNICATION_CONVERSATION` | `/a-society/general/instructions/communication/conversation/main.md` | How to create a conversation layer |
| `$INSTRUCTION_COMMUNICATION_COORDINATION` | `/a-society/general/instructions/communication/coordination/main.md` | How to create coordination protocols |
| `$INSTRUCTION_THINKING` | `/a-society/general/instructions/thinking/main.md` | How to create a thinking/ folder for any project |
| `$INSTRUCTION_IMPROVEMENT` | `/a-society/general/instructions/improvement/main.md` | How to create an improvement/ folder for any project |
| `$INSTRUCTION_RECORDS` | `/a-society/general/instructions/records/main.md` | How to create a records structure for any project |
| **Manifests** | | |
| `$GENERAL_MANIFEST` | `/a-society/general/manifest.yaml` | Minimum necessary files manifest — machine-readable source of truth for what a complete a-docs/ contains; primary input to the Scaffolding System |
| **Role Templates** | | |
| `$GENERAL_OWNER_ROLE` | `/a-society/general/roles/owner.md` | Ready-made Owner role template for any project |
| `$GENERAL_CURATOR_ROLE` | `/a-society/general/roles/curator.md` | Ready-made Curator role template for any project |
| **Thinking Templates** | | |
| `$GENERAL_THINKING` | `/a-society/general/thinking/main.md` | Ready-made general principles template |
| `$GENERAL_THINKING_REASONING` | `/a-society/general/thinking/reasoning.md` | Ready-made reasoning framework template |
| `$GENERAL_THINKING_KEEP_IN_MIND` | `/a-society/general/thinking/keep-in-mind.md` | Ready-made keep-in-mind template |
| **Improvement Templates** | | |
| `$GENERAL_IMPROVEMENT` | `/a-society/general/improvement/main.md` | Ready-made improvement philosophy template |
| `$GENERAL_IMPROVEMENT_PROTOCOL` | `/a-society/general/improvement/protocol.md` | Ready-made backward pass protocol template |
| `$GENERAL_IMPROVEMENT_REPORTS` | `/a-society/general/improvement/reports/main.md` | Ready-made improvement reports index template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` | `/a-society/general/improvement/reports/template-findings.md` | Backward pass findings report template |
