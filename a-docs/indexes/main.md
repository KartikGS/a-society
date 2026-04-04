# A-Society — File Path Index

This is the single source of truth for key file locations in `a-society/`.

When a file moves, update **only this table**. All docs reference the variable name (`$VAR`), so a single row change here propagates the correct path to every consumer.

To relocate a file: update the **Path** cell below, then grep for the variable name to confirm no hardcoded path remnants exist in active docs.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| `$A_SOCIETY_PUBLIC_INDEX` | `a-society/index.md` | Public-facing index — all `general/` and `agents/` paths; used by external agents and project owners |
| `$A_SOCIETY_VISION` | `a-society/a-docs/project-information/vision.md` | A-Society project vision — the core bet, what the framework is, and direction for agents |
| `$A_SOCIETY_STRUCTURE` | `a-society/a-docs/project-information/structure.md` | A-Society folder structure — governing principle and placement rules for each folder |
| `$A_SOCIETY_ARCHITECTURE` | `a-society/a-docs/project-information/architecture.md` | A-Society architecture — system overview and non-negotiable structural invariants |
| `$A_SOCIETY_LOG` | `a-society/a-docs/project-information/log.md` | A-Society project log — current state and next priorities for agents orienting at session start |
| `$A_SOCIETY_LOG_ARCHIVE` | `a-society/a-docs/project-information/log-archive.md` | A-Society archived flow log — one-liner per closed flow; entries are immutable once written |
| `$A_SOCIETY_INDEX` | `a-society/a-docs/indexes/main.md` | This file — the A-Society file path index |
| `$GENERAL_FEEDBACK_CONSENT` | `a-society/general/feedback/consent.md` | Ready-made consent file template — instantiated per feedback type in a project's a-docs/feedback/[type]/ |
| `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` | `a-society/general/feedback/template-migration.md` | Migration feedback report template — used by Curators after implementing framework update reports |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | `a-society/general/instructions/a-society-version-record.md` | How to create and maintain an A-Society version record in any initialized project |
| `$INSTRUCTION_CONSENT` | `a-society/general/instructions/consent.md` | How to establish the feedback consent system in a project during initialization |
| `$INSTRUCTION_TOOLING` | `a-society/general/instructions/tooling.md` | How to create a tooling document for any project |
| `$INSTRUCTION_VISION` | `a-society/general/instructions/project-information/vision.md` | How to create a vision document for any project |
| `$INSTRUCTION_STRUCTURE` | `a-society/general/instructions/project-information/structure.md` | How to create a structure document for any project |
| `$INSTRUCTION_INDEX` | `a-society/general/instructions/indexes/main.md` | How to create a file path index for any project |
| `$A_SOCIETY_AGENTS` | `a-society/a-docs/agents.md` | A-Society agent orientation — entry point for all agents working on this project |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | `a-society/a-docs/a-docs-guide.md` | Why each file in A-Society's agent-docs exists — required reading for the Curator |
| `$A_SOCIETY_OWNER_ROLE` | `a-society/a-docs/roles/owner.md` | A-Society Owner Agent role — authority, responsibilities, and context loading |
| `$A_SOCIETY_CURATOR_ROLE` | `a-society/a-docs/roles/curator.md` | A-Society Curator Agent role — maintenance, migration, and pattern distillation |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | `a-society/a-docs/roles/technical-architect.md` | A-Society Technical Architect role — scoping and planning the programmatic tooling layer |
| `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` | `a-society/a-docs/roles/tooling-developer.md` | A-Society Tooling Developer Agent role — implementation scope, hard rules, and escalation triggers |
| `$A_SOCIETY_TOOLING` | `a-society/a-docs/tooling/main.md` | A-Society tooling documentation entry point — orientation to the tooling subfolder: what each document is and when an agent reads it |
| `$A_SOCIETY_TOOLING_PROPOSAL` | `a-society/a-docs/tooling/architecture-proposal.md` | Technical Architect's component designs and automation boundary evaluation — binding specification for all six tooling components |
| `$A_SOCIETY_TOOLING_COUPLING_MAP` | `a-society/a-docs/tooling/general-coupling-map.md` | Standing reference for tooling/general coupling — format dependencies per component and invocation gap status; updated at Phase 7 after any Type A–F change |
| `$A_SOCIETY_TOOLING_ADDENDUM` | `a-society/a-docs/tooling/architecture-addendum.md` | Tooling implementation workflow, roles, and phase sequencing — companion to the proposal |
| `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2` | `a-society/a-docs/tooling/ta-assessment-phase1-2.md` | Technical Architect's Phase 1-2 deviation assessment — formal ruling on two implementation deviations and required spec updates |
| `$A_SOCIETY_TOOLING_INVOCATION` | `a-society/tooling/INVOCATION.md` | Invocation reference for all tooling components — quick start, entry points, and error conventions |
| `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` | `a-society/tooling/src/backward-pass-orderer.ts` | Component 4: Backward Pass Orderer — computes backward pass role traversal order from a workflow graph |
| `$A_SOCIETY_RUNTIME_INVOCATION` | `a-society/runtime/INVOCATION.md` | Invocation reference for the A-Society runtime — entry points, CLI commands, error conventions |
| `$GENERAL_MANIFEST` | `a-society/general/manifest.yaml` | Minimum necessary files manifest — machine-readable source of truth for what a complete a-docs/ contains; primary input to the Scaffolding System |
| `$GENERAL_OWNER_ROLE` | `a-society/general/roles/owner.md` | Ready-made Owner role template for any project |
| `$GENERAL_CURATOR_ROLE` | `a-society/general/roles/curator.md` | Ready-made Curator role template for any project |
| `$GENERAL_TA_ROLE` | `a-society/general/roles/technical-architect.md` | Ready-made Technical Architect (advisory-producing) role template — advisory standards, extension-before-bypass, explicit failure states for external input |
| `$INSTRUCTION_AGENT_DOCS_GUIDE` | `a-society/general/instructions/a-docs-guide.md` | How to create an agent-docs guide for any project |
| `$INSTRUCTION_AGENTS` | `a-society/general/instructions/agents.md` | How to create an agents.md for any project |
| `$INSTRUCTION_ROLES` | `a-society/general/instructions/roles/main.md` | How to create role documents — archetypes and templates |
| `$INSTRUCTION_REQUIRED_READINGS` | `a-society/general/instructions/roles/required-readings.md` | How to maintain required-readings.yaml — authority maintenance protocol |
| `$A_SOCIETY_REQUIRED_READINGS` | `a-society/a-docs/roles/required-readings.yaml` | A-Society project required readings authority — single machine-readable source of truth |
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
| `$INSTRUCTION_COMMUNICATION_CONVERSATION` | `a-society/general/instructions/communication/conversation/main.md` | How to create a conversation layer — artifact formats, templates, and lifecycle |
| `$INSTRUCTION_COMMUNICATION_COORDINATION` | `a-society/general/instructions/communication/coordination/main.md` | How to create coordination protocols — status models, handoff rules, feedback, and conflict resolution |
| `$INSTRUCTION_MACHINE_READABLE_HANDOFF` | `a-society/general/instructions/communication/coordination/machine-readable-handoff.md` | How to define and emit a machine-readable handoff block — YAML schema for agent pause-point output, enabling programmatic session routing |
| `$INSTRUCTION_THINKING` | `a-society/general/instructions/thinking/main.md` | How to create a thinking/ folder for any project |
| `$INSTRUCTION_IMPROVEMENT` | `a-society/general/instructions/improvement/main.md` | How to create an improvement/ folder for any project |
| `$INSTRUCTION_RECORDS` | `a-society/general/instructions/records/main.md` | How to create a records structure for any project |
| `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` | `a-society/general/communication/conversation/TEMPLATE-owner-workflow-plan.md` | Ready-made workflow plan template — instantiated at intake as `01-owner-workflow-plan.md` in the record folder; five complexity axes, tier, path, known unknowns |
| `$GENERAL_THINKING` | `a-society/general/thinking/main.md` | Ready-made general principles template — cross-role operational rules |
| `$GENERAL_THINKING_REASONING` | `a-society/general/thinking/reasoning.md` | Ready-made reasoning framework template — cognitive heuristics for agents |
| `$GENERAL_THINKING_KEEP_IN_MIND` | `a-society/general/thinking/keep-in-mind.md` | Ready-made keep-in-mind template — operational reminders and hard stops |
| `$GENERAL_IMPROVEMENT` | `a-society/general/improvement/main.md` | Ready-made improvement philosophy template |
| `$GENERAL_IMPROVEMENT_META_ANALYSIS` | `a-society/general/improvement/meta-analysis.md` | Meta-analysis phase instructions — injected into backward pass agent sessions by the runtime; contains reflection categories, analysis quality guidance, and `meta-analysis-complete` signal schema |
| `$GENERAL_IMPROVEMENT_SYNTHESIS` | `a-society/general/improvement/synthesis.md` | Synthesis phase instructions — injected into the synthesis (Curator) session by the runtime; contains routing rules, merge assessment, and synthesis closure behavior |
| `$GENERAL_IMPROVEMENT_REPORTS` | `a-society/general/improvement/reports/main.md` | Ready-made improvement reports index template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` | `a-society/general/improvement/reports/template-findings.md` | Backward pass findings report template |
| `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` | `a-society/a-docs/improvement/meta-analysis.md` | A-Society project-specific meta-analysis phase instructions — runtime injection target for backward pass findings sessions in this project |
| `$A_SOCIETY_IMPROVEMENT_SYNTHESIS` | `a-society/a-docs/improvement/synthesis.md` | A-Society project-specific synthesis phase instructions — runtime injection target for Curator synthesis sessions in this project |
| `$A_SOCIETY_PRINCIPLES` | `a-society/a-docs/project-information/principles.md` | A-Society design principles — context efficiency, consent, feedback, and structure rules |
| `$A_SOCIETY_INITIALIZER_ROLE` | `a-society/agents/initializer.md` | A-Society Initializer Agent role — bootstraps a new project's a-docs/ |
| `$A_SOCIETY_WORKFLOW` | `a-society/a-docs/workflow/main.md` | A-Society workflow directory — routing index for all permanent A-Society workflows; universal session routing rules |
| `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` | `a-society/a-docs/workflow/multi-domain-development.md` | A-Society multi-domain development pattern — single flow with parallel tracks across framework, tooling, runtime, and related roles |
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | `a-society/a-docs/workflow/framework-development.md` | A-Society framework development workflow — phases, handoffs, invariants, session model, and YAML graph for the documentation and library maintenance loop |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | `a-society/a-docs/workflow/tooling-development.md` | A-Society tooling development workflow — phases, roles, session model, constraints, and YAML graph for the programmatic tooling implementation loop |
| `$A_SOCIETY_IMPROVEMENT` | `a-society/a-docs/improvement/main.md` | A-Society improvement philosophy and backward pass protocol — principles and process for documentation improvement |
| `$A_SOCIETY_RECORDS` | `a-society/a-docs/records/main.md` | A-Society records convention — identifier format, artifact sequence, and placement rules for flow-level artifact tracking |
| `$A_SOCIETY_FEEDBACK_DIR` | `a-society/feedback/` | All inbound feedback signal from adopting projects — organized by signal type |
| `$A_SOCIETY_FEEDBACK_ONBOARDING` | `a-society/feedback/onboarding/` | Initializer signal reports — filed after initialization runs with project consent |
| `$A_SOCIETY_FEEDBACK_MIGRATION` | `a-society/feedback/migration/` | Migration feedback reports — filed by Curators after implementing framework update reports |
| `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL` | `a-society/feedback/curator-signal/` | Curator signals from adopting projects — mechanism TBD |
| `$A_SOCIETY_VERSION` | `a-society/VERSION.md` | A-Society's current framework version — single source of truth for the vMAJOR.MINOR version stamp |
| `$A_SOCIETY_UPDATES_DIR` | `a-society/updates/` | Published framework update reports — outbound notifications to adopting projects when framework changes require a-docs review |
| `$A_SOCIETY_UPDATES_PROTOCOL` | `a-society/a-docs/updates/protocol.md` | Framework update report protocol — when to publish, impact classification, who produces and reviews |
| `$A_SOCIETY_UPDATES_TEMPLATE` | `a-society/a-docs/updates/template.md` | Framework update report template — structure for outbound change notifications to adopting projects |
| `$A_SOCIETY_COMM` | `a-society/a-docs/communication/main.md` | A-Society communication — entry point for conversation and coordination layers |
| `$A_SOCIETY_COMM_CONVERSATION` | `a-society/a-docs/communication/conversation/main.md` | A-Society conversation templates — permanent format references for all inter-agent handoff artifacts |
| `$A_SOCIETY_COMM_TEMPLATE_BRIEF` | `a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md` | Template: Owner → Curator briefing format |
| `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` | `a-society/a-docs/communication/conversation/TEMPLATE-curator-to-owner.md` | Template: Curator → Owner proposal / submission format |
| `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` | `a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator.md` | Template: Owner → Curator decision format |
| `$A_SOCIETY_COMM_TEMPLATE_PLAN` | `a-society/a-docs/communication/conversation/TEMPLATE-owner-workflow-plan.md` | Template: Owner workflow plan — Phase 0 artifact; produced at intake for every flow, before any brief is written |
| `$A_SOCIETY_COMM_COORDINATION` | `a-society/a-docs/communication/coordination/main.md` | A-Society coordination protocols — entry point |
| `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` | `a-society/a-docs/communication/coordination/handoff-protocol.md` | Status vocabulary, handoff requirements, clarification rules, pre-replacement checks |
| `$A_SOCIETY_COMM_FEEDBACK_PROTOCOL` | `a-society/a-docs/communication/coordination/feedback-protocol.md` | What to do when a discrepancy or blocker is discovered in prior work |
| `$A_SOCIETY_COMM_CONFLICT_RESOLUTION` | `a-society/a-docs/communication/coordination/conflict-resolution.md` | Authority matrix, escalation path, human escalation threshold |
| `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` | `a-society/a-docs/roles/runtime-developer.md` | A-Society Runtime Developer Agent role — implementation scope, rules, and escalation |
| `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` | `a-society/a-docs/workflow/runtime-development.md` | A-Society runtime development workflow — Phase 0 architecture design gate, placeholder implementation phases, session model, and YAML graph for the programmatic runtime implementation loop |
