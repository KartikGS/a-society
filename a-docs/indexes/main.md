# A-Society — File Path Index

This is the single source of truth for key file locations in `a-society/`.

When a file moves, update **only this table**. All docs reference the variable name (`$VAR`), so a single row change here propagates the correct path to every consumer.

To relocate a file: update the **Path** cell below, then grep for the variable name to confirm no hardcoded path remnants exist in active docs.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| `$A_SOCIETY_PUBLIC_INDEX` | `a-society/index.md` | Public-facing index — all `general/` and `runtime/` public paths; used by project owners and public runtime surfaces |
| `$A_SOCIETY_VISION` | `a-society/a-docs/project-information/vision.md` | A-Society project vision — the core bet, what the framework is, and direction for agents |
| `$A_SOCIETY_STRUCTURE` | `a-society/a-docs/project-information/structure.md` | A-Society folder structure — governing principle and placement rules for each folder |
| `$A_SOCIETY_ARCHITECTURE` | `a-society/a-docs/project-information/architecture.md` | A-Society architecture — system overview and non-negotiable structural invariants |
| `$A_SOCIETY_LOG` | `a-society/a-docs/project-information/log.md` | A-Society project log — current state and next priorities for agents orienting at session start |
| `$A_SOCIETY_INDEX` | `a-society/a-docs/indexes/main.md` | This file — the A-Society file path index |
| `$GENERAL_FEEDBACK_TEMPLATE` | `a-society/general/feedback/template-feedback.md` | Single upstream feedback report template — reference format for the runtime-managed final feedback step |
| `$GENERAL_FEEDBACK_CONSENT` | `a-society/general/feedback/consent.md` | Legacy compatibility note for the retired consent-file model |
| `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` | `a-society/general/feedback/template-migration.md` | Legacy migration-focused feedback outline retained for historical references |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | `a-society/general/instructions/a-society-version-record.md` | How to create and maintain an A-Society version record in any initialized project |
| `$INSTRUCTION_CONSENT` | `a-society/general/instructions/consent.md` | How runtime-managed projects ask for upstream feedback consent per flow |
| `$INSTRUCTION_TOOLING` | `a-society/general/instructions/tooling.md` | How to create a tooling document for any project |
| `$INSTRUCTION_VISION` | `a-society/general/instructions/project-information/vision.md` | How to create a vision document for any project |
| `$INSTRUCTION_STRUCTURE` | `a-society/general/instructions/project-information/structure.md` | How to create a structure document for any project |
| `$INSTRUCTION_INDEX` | `a-society/general/instructions/indexes/main.md` | How to create a file path index for any project |
| `$A_SOCIETY_AGENTS` | `a-society/a-docs/agents.md` | A-Society agent orientation — entry point for all agents working on this project |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | `a-society/a-docs/a-docs-guide.md` | Why each file in A-Society's internal docs and Curator-tracked operator references exists — required reading for the Curator |
| `$A_SOCIETY_ADOCS_DESIGN` | `a-society/a-docs/a-docs-design.md` | A-Society a-docs design principles — structural rules for authoring and maintaining the a-docs layer |
| `$A_SOCIETY_OWNER_ROLE` | `a-society/a-docs/roles/owner/main.md` | A-Society Owner Agent role — authority, boundaries, and workflow-linked support-doc routing |
| `$A_SOCIETY_OWNER_REQUIRED_READINGS` | `a-society/a-docs/roles/owner/required-readings.yaml` | A-Society Owner startup-context authority — machine-readable required readings for the Owner role |
| `$A_SOCIETY_OWNER_OWNERSHIP` | `a-society/a-docs/roles/owner/ownership.yaml` | A-Society Owner ownership file — surfaces the Owner is accountable for |
| `$A_SOCIETY_OWNER_BRIEF_WRITING` | `a-society/a-docs/roles/owner/brief-writing.md` | A-Society Owner brief-writing and constraint-writing guidance — loaded when the Owner drafts briefs or review constraints |
| `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR` | `a-society/a-docs/roles/owner/review-behavior.md` | A-Society Owner review-behavior guidance — loaded when the Owner reviews a proposed addition |
| `$A_SOCIETY_OWNER_LOG_MANAGEMENT` | `a-society/a-docs/roles/owner/log-management.md` | A-Society Owner log-management guidance — loaded when the Owner manages the project log or files Next Priorities |
| `$A_SOCIETY_OWNER_TA_REVIEW` | `a-society/a-docs/roles/owner/ta-advisory-review.md` | A-Society Owner TA advisory and integration-gate review guidance — loaded when the Owner reviews Technical Architect advisories or TA-reviewed integration results |
| `$A_SOCIETY_OWNER_CLOSURE` | `a-society/a-docs/roles/owner/forward-pass-closure.md` | A-Society Owner forward-pass closure guidance — loaded when the Owner closes a forward pass |
| `$A_SOCIETY_CURATOR_ROLE` | `a-society/a-docs/roles/curator/main.md` | A-Society Curator Agent role — maintenance, migration, and pattern distillation |
| `$A_SOCIETY_CURATOR_REQUIRED_READINGS` | `a-society/a-docs/roles/curator/required-readings.yaml` | A-Society Curator startup-context authority — machine-readable required readings for the Curator role |
| `$A_SOCIETY_CURATOR_OWNERSHIP` | `a-society/a-docs/roles/curator/ownership.yaml` | A-Society Curator ownership file — surfaces the Curator is accountable for |
| `$A_SOCIETY_CURATOR_IMPL_PRACTICES` | `a-society/a-docs/roles/curator/implementation-practices.md` | A-Society Curator proposal and implementation practices — loaded when the Curator prepares a proposal or implements approved changes |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | `a-society/a-docs/roles/technical-architect/main.md` | A-Society Technical Architect role — scoping and planning the executable layer |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_REQUIRED_READINGS` | `a-society/a-docs/roles/technical-architect/required-readings.yaml` | A-Society Technical Architect startup-context authority — machine-readable required readings for the Technical Architect role |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_OWNERSHIP` | `a-society/a-docs/roles/technical-architect/ownership.yaml` | A-Society Technical Architect ownership file — surfaces the Technical Architect is accountable for |
| `$A_SOCIETY_TA_ADVISORY_STANDARDS` | `a-society/a-docs/roles/technical-architect/advisory-standards.md` | A-Society Technical Architect advisory standards — loaded when the TA produces an advisory or integration review |
| `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE` | `a-society/a-docs/roles/framework-services-developer/main.md` | A-Society Framework Services Developer role — deterministic executable framework-service implementation scope and escalation |
| `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_REQUIRED_READINGS` | `a-society/a-docs/roles/framework-services-developer/required-readings.yaml` | A-Society Framework Services Developer startup-context authority — machine-readable required readings for the Framework Services Developer role |
| `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_OWNERSHIP` | `a-society/a-docs/roles/framework-services-developer/ownership.yaml` | A-Society Framework Services Developer ownership file — surfaces the Framework Services Developer is accountable for |
| `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE` | `a-society/a-docs/roles/framework-services-developer/implementation-discipline.md` | A-Society Framework Services Developer implementation discipline — completion-report and co-maintenance guidance |
| `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE` | `a-society/a-docs/roles/orchestration-developer/main.md` | A-Society Orchestration Developer role — runtime orchestration, operator-surface ownership, and escalation |
| `$A_SOCIETY_ORCHESTRATION_DEVELOPER_REQUIRED_READINGS` | `a-society/a-docs/roles/orchestration-developer/required-readings.yaml` | A-Society Orchestration Developer startup-context authority — machine-readable required readings for the Orchestration Developer role |
| `$A_SOCIETY_ORCHESTRATION_DEVELOPER_OWNERSHIP` | `a-society/a-docs/roles/orchestration-developer/ownership.yaml` | A-Society Orchestration Developer ownership file — surfaces the Orchestration Developer is accountable for |
| `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE` | `a-society/a-docs/roles/orchestration-developer/implementation-discipline.md` | A-Society Orchestration Developer implementation discipline — runtime implementation and operator-surface co-maintenance guidance |
| `$A_SOCIETY_UI_DEVELOPER_ROLE` | `a-society/a-docs/roles/ui-developer/main.md` | A-Society UI Developer role — operator-facing browser UI implementation scope and escalation |
| `$A_SOCIETY_UI_DEVELOPER_REQUIRED_READINGS` | `a-society/a-docs/roles/ui-developer/required-readings.yaml` | A-Society UI Developer startup-context authority — machine-readable required readings for the UI Developer role |
| `$A_SOCIETY_UI_DEVELOPER_OWNERSHIP` | `a-society/a-docs/roles/ui-developer/ownership.yaml` | A-Society UI Developer ownership file — surfaces the UI Developer is accountable for |
| `$A_SOCIETY_UI_DEV_IMPL_DISCIPLINE` | `a-society/a-docs/roles/ui-developer/implementation-discipline.md` | A-Society UI Developer implementation discipline — UI implementation and server-contract boundary guidance |
| `$A_SOCIETY_UI_DEV_STYLE_GUIDE` | `a-society/a-docs/roles/ui-developer/style-guide.md` | A-Society UI Developer style guide — TypeScript, component, state, CSS, and ReactFlow conventions for runtime/ui/ |
| `$A_SOCIETY_EXECUTABLE` | `a-society/a-docs/executable/main.md` | A-Society executable documentation entry point — orientation to the standing executable-layer doc set |
| `$A_SOCIETY_EXECUTABLE_OVERVIEW` | `a-society/a-docs/executable/overview.md` | Executable-domain startup overview — runtime-root model, capability inventory, and ownership boundary |
| `$A_SOCIETY_EXECUTABLE_PROPOSAL` | `a-society/a-docs/executable/architecture-proposal.md` | Standing executable design reference — runtime-root model, role split, capability inventory, and co-maintenance surfaces |
| `$A_SOCIETY_EXECUTABLE_COUPLING_MAP` | `a-society/a-docs/executable/general-coupling-map.md` | Standing reference for executable/general coupling — format dependencies per capability and maintained-guidance status |
| `$A_SOCIETY_EXECUTABLE_ADDENDUM` | `a-society/a-docs/executable/architecture-addendum.md` | Executable governance and maintenance rules — placement constraints, ownership boundaries, and extension rules |
| `$A_SOCIETY_EXECUTABLE_LEGACY_TA_ASSESSMENT_PHASE1_2` | `a-society/a-docs/executable/legacy-ta-assessment-phase1-2.md` | Historical TA deviation rulings preserved for legacy framework-service designs carried into the unified executable layer |
| `$A_SOCIETY_RUNTIME_INVOCATION` | `a-society/runtime/INVOCATION.md` | Sole default operator-facing executable reference — runtime commands, runtime signals, operator output model, state location, and telemetry configuration |
| `$A_SOCIETY_RUNTIME_HANDOFF_CONTRACT` | `a-society/runtime/contracts/handoff.md` | Runtime-owned machine-readable handoff contract — injected by the runtime into every managed session |
| `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT` | `a-society/runtime/contracts/workflow.md` | Runtime-owned workflow YAML contract — schema, role-instance behavior, node-entry injection, and active-path routing semantics |
| `$A_SOCIETY_RUNTIME_FEEDBACK` | `a-society/runtime/contracts/feedback.md` | Runtime-owned final backward-pass feedback contract — used by the runtime's A-Society feedback phase |
| `$GENERAL_MANIFEST` | `a-society/general/manifest.yaml` | Minimum necessary files manifest — machine-readable source of truth for what a complete a-docs/ contains; primary input to the Scaffolding System |
| `$GENERAL_ADOCS_DESIGN` | `a-society/general/a-docs-design.md` | Ready-made a-docs design principles template — adopt in any project to govern how the a-docs layer is authored |
| `$GENERAL_OWNER_ROLE` | `a-society/general/roles/owner/main.md` | Ready-made Owner role template for any project |
| `$GENERAL_OWNER_BRIEF_WRITING` | `a-society/general/roles/owner/brief-writing.md` | Ready-made Owner brief-writing and constraint-writing support doc template |
| `$GENERAL_OWNER_REVIEW_BEHAVIOR` | `a-society/general/roles/owner/review-behavior.md` | Ready-made Owner contribution-review support doc template |
| `$GENERAL_OWNER_LOG_MANAGEMENT` | `a-society/general/roles/owner/log-management.md` | Ready-made Owner intake and log-management support doc template |
| `$GENERAL_OWNER_TA_REVIEW` | `a-society/general/roles/owner/ta-advisory-review.md` | Ready-made Owner advisory and integration-gate review support doc template |
| `$GENERAL_OWNER_CLOSURE` | `a-society/general/roles/owner/forward-pass-closure.md` | Ready-made Owner forward-pass closure support doc template |
| `$GENERAL_CURATOR_ROLE` | `a-society/general/roles/curator/main.md` | Ready-made Curator role template for any project |
| `$GENERAL_CURATOR_IMPL_PRACTICES` | `a-society/general/roles/curator/implementation-practices.md` | Ready-made Curator proposal, implementation, and registration-practices support doc template |
| `$GENERAL_TA_ROLE` | `a-society/general/project-types/executable/roles/technical-architect/main.md` | Ready-made Technical Architect (advisory-producing) role template for projects with an executable layer — authority, boundaries, and workflow-linked support-doc routing |
| `$GENERAL_TA_ADVISORY_STANDARDS` | `a-society/general/project-types/executable/roles/technical-architect/advisory-standards.md` | Ready-made Technical Architect advisory-standards support doc template for projects with an executable layer |
| `$INSTRUCTION_AGENT_DOCS_GUIDE` | `a-society/general/instructions/a-docs-guide.md` | How to create an agent-docs guide for any project |
| `$INSTRUCTION_ADOCS_DESIGN` | `a-society/general/instructions/a-docs-design.md` | How to create and maintain an a-docs design-principles file for any project |
| `$INSTRUCTION_AGENTS` | `a-society/general/instructions/agents.md` | How to create an agents.md for any project |
| `$INSTRUCTION_ROLES` | `a-society/general/instructions/roles/main.md` | How to create role documents — archetypes and templates |
| `$INSTRUCTION_REQUIRED_READINGS` | `a-society/general/instructions/roles/required-readings.md` | How to maintain per-role `required-readings.yaml` files — startup-context authority |
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
| `$INSTRUCTION_COMMUNICATION_CONVERSATION` | `a-society/general/instructions/communication/conversation/main.md` | How to create a conversation layer — artifact formats, templates, and lifecycle |
| `$INSTRUCTION_COMMUNICATION_COORDINATION` | `a-society/general/instructions/communication/coordination/main.md` | How to create coordination protocols — status models, handoff rules, feedback, and conflict resolution |
| `$INSTRUCTION_THINKING` | `a-society/general/instructions/thinking/main.md` | How to create a thinking/ folder for any project |
| `$INSTRUCTION_IMPROVEMENT` | `a-society/general/instructions/improvement/main.md` | How to create an improvement/ folder for any project |
| `$INSTRUCTION_RECORDS` | `a-society/general/instructions/records/main.md` | How to create a records structure for any project |
| `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` | `a-society/general/communication/conversation/TEMPLATE-owner-workflow-plan.md` | Ready-made workflow plan template — instantiated at intake as `01-owner-workflow-plan.md` in the record folder; five complexity axes, tier, path, known unknowns |
| `$GENERAL_THINKING` | `a-society/general/thinking/main.md` | Ready-made general principles template — cross-role operational rules |
| `$GENERAL_THINKING_REASONING` | `a-society/general/thinking/reasoning.md` | Ready-made reasoning framework template — cognitive heuristics for agents |
| `$GENERAL_THINKING_KEEP_IN_MIND` | `a-society/general/thinking/keep-in-mind.md` | Ready-made keep-in-mind template — operational reminders and hard stops |
| `$GENERAL_IMPROVEMENT` | `a-society/general/improvement/main.md` | Ready-made improvement philosophy template |
| `$GENERAL_IMPROVEMENT_META_ANALYSIS` | `a-society/general/improvement/meta-analysis.md` | Meta-analysis phase instructions — injected into backward pass agent sessions by the runtime; contains reflection categories, analysis quality guidance, and `meta-analysis-complete` signal schema |
| `$GENERAL_IMPROVEMENT_FEEDBACK` | `a-society/general/improvement/feedback.md` | Feedback phase instructions — injected into the Owner's final backward-pass feedback session by the runtime; contains scope rules, guardrails, and closure behavior |
| `$GENERAL_IMPROVEMENT_REPORTS` | `a-society/general/improvement/reports/main.md` | Ready-made improvement reports index template |
| `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` | `a-society/general/improvement/reports/template-findings.md` | Backward pass findings report template |
| `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` | `a-society/a-docs/improvement/meta-analysis.md` | A-Society project-specific meta-analysis phase instructions — runtime injection target for backward pass findings sessions in this project |
| `$A_SOCIETY_IMPROVEMENT_FEEDBACK` | `a-society/a-docs/improvement/feedback.md` | A-Society project-specific feedback phase instructions — runtime injection target for the Owner's final backward-pass feedback session in this project |
| `$A_SOCIETY_PRINCIPLES` | `a-society/a-docs/project-information/principles.md` | A-Society design principles — context efficiency, consent, feedback, and structure rules |
| `$A_SOCIETY_RUNTIME_INITIALIZATION` | `a-society/runtime/contracts/initialization.md` | Runtime-owned initialization contract — used when the browser runtime initializes a project through a single-node Owner flow |
| `$A_SOCIETY_WORKFLOW` | `a-society/a-docs/workflow/main.yaml` | A-Society canonical workflow definition — the single permanent graph for framework, executable, and coordinated multi-role work |
| `$A_SOCIETY_WORKFLOW_COMPLEXITY` | `a-society/a-docs/workflow/complexity.md` | A-Society workflow complexity guidance — internal intake sizing rules, tier-selection boundaries, and project-specific routing constraints |
| `$A_SOCIETY_IMPROVEMENT` | `a-society/a-docs/improvement/main.md` | A-Society improvement philosophy and backward pass protocol — principles and process for documentation improvement |
| `$A_SOCIETY_RECORDS` | `a-society/a-docs/records/main.md` | A-Society records convention — record ID and metadata model, artifact sequence, and placement rules for flow-level artifact tracking |
| `$A_SOCIETY_FEEDBACK_DIR` | `a-society/feedback/` | All inbound feedback signal from adopting projects — new runtime-generated reports land directly here |
| `$A_SOCIETY_FEEDBACK_ONBOARDING` | `a-society/feedback/onboarding/` | Legacy initialization-feedback collection retained for historical artifacts |
| `$A_SOCIETY_FEEDBACK_MIGRATION` | `a-society/feedback/migration/` | Legacy migration-feedback collection retained for historical artifacts |
| `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL` | `a-society/feedback/curator-signal/` | Legacy project-feedback collection retained for historical artifacts |
| `$A_SOCIETY_VERSION` | `a-society/VERSION.md` | A-Society's current framework version — single source of truth for the vMAJOR.MINOR version stamp |
| `$A_SOCIETY_UPDATES_DIR` | `a-society/updates/` | Published framework update reports — outbound notifications to adopting projects when framework changes require a-docs review |
| `$A_SOCIETY_UPDATES_PROTOCOL` | `a-society/a-docs/updates/protocol.md` | Framework update report protocol — when to publish, impact classification, who produces and reviews |
| `$A_SOCIETY_UPDATES_TEMPLATE` | `a-society/a-docs/updates/template.md` | Framework update report template — structure for outbound change notifications to adopting projects |
| `$A_SOCIETY_COMM_CONVERSATION` | `a-society/a-docs/communication/conversation/main.md` | A-Society conversation templates — permanent format references for all inter-agent handoff artifacts |
| `$A_SOCIETY_COMM_TEMPLATE_BRIEF` | `a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md` | Template: Owner → Curator briefing format |
| `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` | `a-society/a-docs/communication/conversation/TEMPLATE-curator-to-owner.md` | Template: Curator → Owner proposal / submission format |
| `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` | `a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator.md` | Template: Owner → Curator decision format |
| `$A_SOCIETY_COMM_TEMPLATE_PLAN` | `a-society/a-docs/communication/conversation/TEMPLATE-owner-workflow-plan.md` | Template: Owner workflow plan — Phase 0 artifact; produced at intake for every flow, before any brief is written |
| `$A_SOCIETY_COMM_COORDINATION` | `a-society/a-docs/communication/coordination/main.md` | A-Society coordination protocols — entry point |
| `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` | `a-society/a-docs/communication/coordination/handoff-protocol.md` | Status vocabulary, handoff requirements, clarification rules, pre-replacement checks |
| `$A_SOCIETY_COMM_FEEDBACK_PROTOCOL` | `a-society/a-docs/communication/coordination/feedback-protocol.md` | What to do when a discrepancy or blocker is discovered in prior work |
| `$A_SOCIETY_COMM_CONFLICT_RESOLUTION` | `a-society/a-docs/communication/coordination/conflict-resolution.md` | Authority matrix, escalation path, human escalation threshold |
