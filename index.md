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
| **Onboarding Signal** | | |
| `$ONBOARDING_SIGNAL_TEMPLATE` | `/a-society/onboarding_signal/_template.md` | Template for Initializer signal reports — one report per initialization run |
| **Framework Updates** | | |
| `$A_SOCIETY_UPDATES_DIR` | `/a-society/updates/` | Published framework update reports — outbound notifications to adopting projects when `general/` or `agents/` changes require a-docs review |
| **Instructions** | | |
| `$INSTRUCTION_TOOLING` | `/a-society/general/instructions/tooling.md` | How to create a tooling document for any project |
| `$INSTRUCTION_VISION` | `/a-society/general/instructions/project-information/vision.md` | How to create a vision document for any project |
| `$INSTRUCTION_STRUCTURE` | `/a-society/general/instructions/project-information/structure.md` | How to create a structure document for any project |
| `$INSTRUCTION_INDEX` | `/a-society/general/instructions/indexes/main.md` | How to create a file path index for any project |
| `$INSTRUCTION_AGENT_DOCS_GUIDE` | `/a-society/general/instructions/agent-docs-guide.md` | How to create an agent-docs guide for any project |
| `$INSTRUCTION_AGENTS` | `/a-society/general/instructions/agents.md` | How to create an agents.md for any project |
| `$INSTRUCTION_ROLES` | `/a-society/general/instructions/roles/main.md` | How to create role documents — archetypes and templates |
| `$INSTRUCTION_ARCHITECTURE` | `/a-society/general/instructions/project-information/architecture.md` | How to create an architecture document for any project |
| `$INSTRUCTION_LOG` | `/a-society/general/instructions/project-information/log.md` | How to create a project log for any project |
| `$INSTRUCTION_PRINCIPLES` | `/a-society/general/instructions/project-information/principles.md` | How to create a project principles document for any project |
| `$INSTRUCTION_WORKFLOW` | `/a-society/general/instructions/workflow/main.md` | How to create a workflow document for any project |
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
| **Role Templates** | | |
| `$GENERAL_OWNER_ROLE` | `/a-society/general/roles/owner.md` | Ready-made Owner role template for any project |
| `$GENERAL_CURATOR_ROLE` | `/a-society/general/roles/curator.md` | Ready-made Curator role template for any project |
| **Thinking Templates** | | |
| `$GENERAL_THINKING` | `/a-society/general/thinking/main.md` | Ready-made general principles template |
| `$GENERAL_THINKING_REASONING` | `/a-society/general/thinking/reasoning.md` | Ready-made reasoning framework template |
| `$GENERAL_THINKING_KEEP_IN_MIND` | `/a-society/general/thinking/keep-in-mind.md` | Ready-made keep-in-mind template |
| **Improvement Templates** | | |
| `$GENERAL_IMPROVEMENT` | `/a-society/general/improvement/main.md` | Ready-made improvement philosophy template |
| `$GENERAL_IMPROVEMENT_PROTOCOL` | `/a-society/general/improvement/protocol.md` | Ready-made improvement protocol template |
| `$GENERAL_IMPROVEMENT_REPORTS` | `/a-society/general/improvement/reports/main.md` | Ready-made improvement reports index template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT` | `/a-society/general/improvement/reports/template-lightweight.md` | Lightweight synthesis report template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` | `/a-society/general/improvement/reports/template-findings.md` | Per-agent findings report template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_SYNTHESIS` | `/a-society/general/improvement/reports/template-synthesis.md` | Synthesis report template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_BACKLOG` | `/a-society/general/improvement/reports/template-backlog.md` | Alignment backlog template |
