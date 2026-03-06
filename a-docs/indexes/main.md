# A-Society — File Path Index

This is the single source of truth for key file locations in `a-society/`.

When a file moves, update **only this table**. All docs reference the variable name (`$VAR`), so a single row change here propagates the correct path to every consumer.

To relocate a file: update the **Path** cell below, then grep for the variable name to confirm no hardcoded path remnants exist in active docs.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| `$A_SOCIETY_PUBLIC_INDEX` | `/a-society/index.md` | Public-facing index — all `general/` and `agents/` paths; used by external agents and project owners |
| `$A_SOCIETY_VISION` | `/a-society/a-docs/project-information/vision.md` | A-Society project vision — the core bet, what the framework is, and direction for agents |
| `$A_SOCIETY_STRUCTURE` | `/a-society/a-docs/project-information/structure.md` | A-Society folder structure — governing principle and placement rules for each folder |
| `$A_SOCIETY_ARCHITECTURE` | `/a-society/a-docs/project-information/architecture.md` | A-Society architecture — system overview and non-negotiable structural invariants |
| `$A_SOCIETY_INDEX` | `/a-society/a-docs/indexes/main.md` | This file — the A-Society file path index |
| `$INSTRUCTION_TOOLING` | `/a-society/general/instructions/tooling.md` | How to create a tooling document for any project |
| `$INSTRUCTION_VISION` | `/a-society/general/instructions/project-information/vision.md` | How to create a vision document for any project |
| `$INSTRUCTION_STRUCTURE` | `/a-society/general/instructions/project-information/structure.md` | How to create a structure document for any project |
| `$INSTRUCTION_INDEX` | `/a-society/general/instructions/indexes/main.md` | How to create a file path index for any project |
| `$A_SOCIETY_AGENTS` | `/a-society/a-docs/agents.md` | A-Society agent orientation — entry point for all agents working on this project |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | `/a-society/a-docs/agent-docs-guide.md` | Why each file in A-Society's agent-docs exists — required reading for the Curator |
| `$A_SOCIETY_OWNER_ROLE` | `/a-society/a-docs/roles/owner.md` | A-Society Owner Agent role — authority, responsibilities, and context loading |
| `$A_SOCIETY_CURATOR_ROLE` | `/a-society/a-docs/roles/curator.md` | A-Society Curator Agent role — maintenance, migration, and pattern distillation |
| `$GENERAL_OWNER_ROLE` | `/a-society/general/roles/owner.md` | Ready-made Owner role template for any project |
| `$GENERAL_CURATOR_ROLE` | `/a-society/general/roles/curator.md` | Ready-made Curator role template for any project |
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
| `$INSTRUCTION_COMMUNICATION_CONVERSATION` | `/a-society/general/instructions/communication/conversation/main.md` | How to create a conversation layer — artifact formats, templates, and lifecycle |
| `$INSTRUCTION_COMMUNICATION_COORDINATION` | `/a-society/general/instructions/communication/coordination/main.md` | How to create coordination protocols — status models, handoff rules, feedback, and conflict resolution |
| `$INSTRUCTION_THINKING` | `/a-society/general/instructions/thinking/main.md` | How to create a thinking/ folder for any project |
| `$INSTRUCTION_IMPROVEMENT` | `/a-society/general/instructions/improvement/main.md` | How to create an improvement/ folder for any project |
| `$GENERAL_THINKING` | `/a-society/general/thinking/main.md` | Ready-made general principles template — cross-role operational rules |
| `$GENERAL_THINKING_REASONING` | `/a-society/general/thinking/reasoning.md` | Ready-made reasoning framework template — cognitive heuristics for agents |
| `$GENERAL_THINKING_KEEP_IN_MIND` | `/a-society/general/thinking/keep-in-mind.md` | Ready-made keep-in-mind template — operational reminders and hard stops |
| `$GENERAL_IMPROVEMENT` | `/a-society/general/improvement/main.md` | Ready-made improvement philosophy template — principles for doc improvement decisions |
| `$GENERAL_IMPROVEMENT_PROTOCOL` | `/a-society/general/improvement/protocol.md` | Ready-made improvement protocol template — meta-analysis phases and guardrails |
| `$GENERAL_IMPROVEMENT_REPORTS` | `/a-society/general/improvement/reports/main.md` | Ready-made improvement reports index template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT` | `/a-society/general/improvement/reports/template-lightweight.md` | Lightweight synthesis report template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` | `/a-society/general/improvement/reports/template-findings.md` | Per-agent findings report template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_SYNTHESIS` | `/a-society/general/improvement/reports/template-synthesis.md` | Synthesis report template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_BACKLOG` | `/a-society/general/improvement/reports/template-backlog.md` | Alignment backlog template |
| `$A_SOCIETY_INITIALIZER_ROLE` | `/a-society/agents/initializer.md` | A-Society Initializer Agent role — bootstraps a new project's a-docs/ |
| `$A_SOCIETY_WORKFLOW` | `/a-society/a-docs/workflow/main.md` | A-Society workflow — phases, handoffs, invariants, and escalation rules for framework work |
| `$A_SOCIETY_IMPROVEMENT` | `/a-society/a-docs/improvement/main.md` | A-Society improvement philosophy — principles governing documentation improvement decisions |
| `$A_SOCIETY_IMPROVEMENT_PROTOCOL` | `/a-society/a-docs/improvement/protocol.md` | A-Society meta improvement protocol — phases, roles, and guardrails for improvement cycles |
| `$A_SOCIETY_IMPROVEMENT_REPORTS` | `/a-society/a-docs/improvement/reports/main.md` | A-Society improvement reports index — naming conventions and template references |
| `$A_SOCIETY_UPDATES_PROTOCOL` | `/a-society/a-docs/updates/protocol.md` | Framework update report protocol — when to publish, impact classification, who produces and reviews |
| `$A_SOCIETY_UPDATES_TEMPLATE` | `/a-society/a-docs/updates/template.md` | Framework update report template — structure for outbound change notifications to adopting projects |
| `$A_SOCIETY_COMM` | `/a-society/a-docs/communication/main.md` | A-Society communication — entry point for conversation and coordination layers |
| `$A_SOCIETY_COMM_CONVERSATION` | `/a-society/a-docs/communication/conversation/main.md` | A-Society conversation artifacts — live handoffs, templates, and lifecycle |
| `$A_SOCIETY_COMM_BRIEF` | `/a-society/a-docs/communication/conversation/owner-to-curator-brief.md` | Live: current Owner → Curator briefing |
| `$A_SOCIETY_COMM_TEMPLATE_BRIEF` | `/a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md` | Template: Owner → Curator briefing format |
| `$A_SOCIETY_COMM_CURATOR_TO_OWNER` | `/a-society/a-docs/communication/conversation/curator-to-owner.md` | Live: current Curator → Owner proposal or submission |
| `$A_SOCIETY_COMM_OWNER_TO_CURATOR` | `/a-society/a-docs/communication/conversation/owner-to-curator.md` | Live: current Owner → Curator decision |
| `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` | `/a-society/a-docs/communication/conversation/TEMPLATE-curator-to-owner.md` | Template: Curator → Owner proposal / submission format |
| `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` | `/a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator.md` | Template: Owner → Curator decision format |
| `$A_SOCIETY_COMM_COORDINATION` | `/a-society/a-docs/communication/coordination/main.md` | A-Society coordination protocols — entry point |
| `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` | `/a-society/a-docs/communication/coordination/handoff-protocol.md` | Status vocabulary, handoff requirements, clarification rules, pre-replacement checks |
| `$A_SOCIETY_COMM_FEEDBACK_PROTOCOL` | `/a-society/a-docs/communication/coordination/feedback-protocol.md` | What to do when a discrepancy or blocker is discovered in prior work |
| `$A_SOCIETY_COMM_CONFLICT_RESOLUTION` | `/a-society/a-docs/communication/coordination/conflict-resolution.md` | Authority matrix, escalation path, human escalation threshold |
