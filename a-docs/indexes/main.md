# A-Society — File Path Index

This is the single source of truth for key file locations in `a-society/`.

**Paths in this table are project-relative** — relative to this project's root (the folder that contains `a-docs/`), not the workspace. For A-Society that root is `a-society/`, so `a-docs/agents.md` resolves to `a-society/a-docs/agents.md`. Write paths without the project-folder prefix; the runtime resolves them under the project namespace, which keeps the index correct even when the project lives in a different folder (e.g. a git worktree).

When a file moves, update **only this table**. All docs reference the variable name (`$VAR`), so a single row change here propagates the correct path to every consumer.

To relocate a file: update the **Path** cell below, then grep for the variable name to confirm no hardcoded path remnants exist in active docs.

---

## Index Table

| Variable | Current Path | Description |
|---|---|---|
| `$A_SOCIETY_GENERAL_INDEX` | `index.md` | General library index — reusable `general/` instructions and templates injected during runtime initialization |
| `$A_SOCIETY_VISION` | `a-docs/project-information/vision.md` | A-Society project vision — the core bet, what the framework is, and direction for agents |
| `$A_SOCIETY_STRUCTURE` | `a-docs/project-information/structure.md` | A-Society folder structure — governing principle and placement rules for each folder |
| `$A_SOCIETY_ARCHITECTURE` | `a-docs/project-information/architecture.md` | A-Society architecture — system overview and non-negotiable structural invariants |
| `$A_SOCIETY_LOG` | `a-docs/project-information/log.md` | A-Society project log — current state and next priorities for agents orienting at session start |
| `$A_SOCIETY_INDEX` | `a-docs/indexes/main.md` | This file — the A-Society file path index |
| `$INSTRUCTION_TOOLING` | `general/instructions/tooling.md` | How to create a tooling document for any project |
| `$INSTRUCTION_VISION` | `general/instructions/project-information/vision.md` | How to create a vision document for any project |
| `$INSTRUCTION_STRUCTURE` | `general/instructions/project-information/structure.md` | How to create a structure document for any project |
| `$INSTRUCTION_INDEX` | `general/instructions/indexes/main.md` | How to create a file path index for any project |
| `$A_SOCIETY_AGENTS` | `a-docs/agents.md` | A-Society agent orientation — entry point for all agents working on this project |
| `$A_SOCIETY_ADOCS_DESIGN` | `a-docs/a-docs-design.md` | A-Society a-docs design principles — structural rules for authoring and maintaining the a-docs layer |
| `$A_SOCIETY_VERSION_RECORD` | `a-docs/a-society-version.md` | A-Society's own initialized-project version record — records the framework baseline for A-Society's `a-docs/` runtime-health surface |
| `$A_SOCIETY_OWNER_ROLE` | `a-docs/roles/owner/main.md` | A-Society Owner Agent role — authority, boundaries, and workflow-linked support-doc routing |
| `$A_SOCIETY_OWNER_REQUIRED_READINGS` | `a-docs/roles/owner/required-readings.yaml` | A-Society Owner startup-context authority — machine-readable required readings for the Owner role |
| `$A_SOCIETY_OWNER_OWNERSHIP` | `a-docs/roles/owner/ownership.yaml` | A-Society Owner ownership file — surfaces the Owner is accountable for |
| `$A_SOCIETY_OWNER_BRIEF_WRITING` | `a-docs/roles/owner/brief-writing.md` | A-Society Owner brief-writing and constraint-writing guidance — loaded when the Owner drafts briefs or review constraints |
| `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR` | `a-docs/roles/owner/review-behavior.md` | A-Society Owner review-behavior guidance — loaded when the Owner reviews a proposed addition |
| `$A_SOCIETY_OWNER_LOG_MANAGEMENT` | `a-docs/roles/owner/log-management.md` | A-Society Owner log-management guidance — loaded when the Owner manages the project log or files Next Priorities |
| `$A_SOCIETY_OWNER_TA_REVIEW` | `a-docs/roles/owner/ta-advisory-review.md` | A-Society Owner TA advisory and integration-gate review guidance — loaded when the Owner reviews Technical Architect advisories or TA-reviewed integration results |
| `$A_SOCIETY_OWNER_CLOSURE` | `a-docs/roles/owner/forward-pass-closure.md` | A-Society Owner forward-pass closure guidance — loaded when the Owner closes a forward pass |
| `$A_SOCIETY_CURATOR_ROLE` | `a-docs/roles/curator/main.md` | A-Society Curator Agent role — maintenance, migration, and pattern distillation |
| `$A_SOCIETY_CURATOR_REQUIRED_READINGS` | `a-docs/roles/curator/required-readings.yaml` | A-Society Curator startup-context authority — machine-readable required readings for the Curator role |
| `$A_SOCIETY_CURATOR_OWNERSHIP` | `a-docs/roles/curator/ownership.yaml` | A-Society Curator ownership file — surfaces the Curator is accountable for |
| `$A_SOCIETY_CURATOR_IMPL_PRACTICES` | `a-docs/roles/curator/implementation-practices.md` | A-Society Curator proposal and implementation practices — loaded when the Curator prepares a proposal or implements approved changes |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | `a-docs/roles/technical-architect/main.md` | A-Society Technical Architect role — scoping and planning the executable layer |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_REQUIRED_READINGS` | `a-docs/roles/technical-architect/required-readings.yaml` | A-Society Technical Architect startup-context authority — machine-readable required readings for the Technical Architect role |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_OWNERSHIP` | `a-docs/roles/technical-architect/ownership.yaml` | A-Society Technical Architect ownership file — surfaces the Technical Architect is accountable for |
| `$A_SOCIETY_TA_ADVISORY_STANDARDS` | `a-docs/roles/technical-architect/advisory-standards.md` | A-Society Technical Architect advisory standards — loaded when the TA produces an advisory or integration review |
| `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE` | `a-docs/roles/framework-services-developer/main.md` | A-Society Framework Services Developer role — deterministic executable framework-service implementation scope and escalation |
| `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_REQUIRED_READINGS` | `a-docs/roles/framework-services-developer/required-readings.yaml` | A-Society Framework Services Developer startup-context authority — machine-readable required readings for the Framework Services Developer role |
| `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_OWNERSHIP` | `a-docs/roles/framework-services-developer/ownership.yaml` | A-Society Framework Services Developer ownership file — surfaces the Framework Services Developer is accountable for |
| `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE` | `a-docs/roles/framework-services-developer/implementation-discipline.md` | A-Society Framework Services Developer implementation discipline — completion-report and co-maintenance guidance |
| `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE` | `a-docs/roles/orchestration-developer/main.md` | A-Society Orchestration Developer role — runtime orchestration, operator-surface ownership, and escalation |
| `$A_SOCIETY_ORCHESTRATION_DEVELOPER_REQUIRED_READINGS` | `a-docs/roles/orchestration-developer/required-readings.yaml` | A-Society Orchestration Developer startup-context authority — machine-readable required readings for the Orchestration Developer role |
| `$A_SOCIETY_ORCHESTRATION_DEVELOPER_OWNERSHIP` | `a-docs/roles/orchestration-developer/ownership.yaml` | A-Society Orchestration Developer ownership file — surfaces the Orchestration Developer is accountable for |
| `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE` | `a-docs/roles/orchestration-developer/implementation-discipline.md` | A-Society Orchestration Developer implementation discipline — runtime implementation and operator-surface co-maintenance guidance |
| `$A_SOCIETY_UI_DEVELOPER_ROLE` | `a-docs/roles/ui-developer/main.md` | A-Society UI Developer role — operator-facing browser UI implementation scope and escalation |
| `$A_SOCIETY_UI_DEVELOPER_REQUIRED_READINGS` | `a-docs/roles/ui-developer/required-readings.yaml` | A-Society UI Developer startup-context authority — machine-readable required readings for the UI Developer role |
| `$A_SOCIETY_UI_DEVELOPER_OWNERSHIP` | `a-docs/roles/ui-developer/ownership.yaml` | A-Society UI Developer ownership file — surfaces the UI Developer is accountable for |
| `$A_SOCIETY_UI_DEV_IMPL_DISCIPLINE` | `a-docs/roles/ui-developer/implementation-discipline.md` | A-Society UI Developer implementation discipline — UI implementation and server-contract boundary guidance |
| `$A_SOCIETY_UI_DEV_STYLE_GUIDE` | `a-docs/roles/ui-developer/style-guide.md` | A-Society UI Developer style guide — TypeScript, component, state, CSS, and ReactFlow conventions for runtime/ui/ |
| `$A_SOCIETY_EXECUTABLE_ARCHITECTURE` | `a-docs/executable/architecture.md` | Single standing executable architecture reference — runtime topology, TypeScript surfaces, capability inventory, governance, and role boundaries |
| `$A_SOCIETY_EXECUTABLE_COUPLING_MAP` | `a-docs/executable/general-coupling-map.md` | Standing reference for executable/general coupling — format dependencies per capability and maintained-guidance status |
| `$A_SOCIETY_EXECUTABLE_LEGACY_TA_ASSESSMENT_PHASE1_2` | `a-docs/executable/legacy-ta-assessment-phase1-2.md` | Historical TA deviation rulings preserved for legacy framework-service designs carried into the unified executable layer |
| `$A_SOCIETY_RUNTIME_INVOCATION` | `runtime/INVOCATION.md` | Sole default operator-facing executable reference — runtime commands, runtime signals, operator output model, state location, and telemetry configuration |
| `$A_SOCIETY_RUNTIME_HANDOFF_CONTRACT` | `runtime/contracts/handoff.md` | Runtime-owned machine-readable handoff contract — injected by the runtime into every managed session |
| `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT` | `runtime/contracts/workflow.md` | Runtime-owned workflow YAML contract — schema, role-instance behavior, node-entry injection, and active-path routing semantics |
| `$A_SOCIETY_RUNTIME_RECORDS_CONTRACT` | `runtime/contracts/records.md` | Runtime-owned flow records contract — injected by the runtime into every managed session; governs active record placement, writable scope, and runtime-managed metadata |
| `$A_SOCIETY_RUNTIME_FEEDBACK` | `runtime/contracts/feedback.md` | Runtime-owned final backward-pass feedback contract — used by the runtime's A-Society feedback phase |
| `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST` | `runtime/contracts/a-docs-manifest.yaml` | Runtime-owned a-docs manifest — machine-readable scaffold and health-check contract for default project `a-docs/` surfaces |
| `$GENERAL_ADOCS_DESIGN` | `general/a-docs-design.md` | Ready-made a-docs design principles template — adopt in any project to govern how the a-docs layer is authored |
| `$GENERAL_OWNER_ROLE` | `general/roles/owner/main.md` | Ready-made Owner role template for any project |
| `$GENERAL_OWNER_BRIEF_WRITING` | `general/roles/owner/brief-writing.md` | Ready-made Owner brief-writing and constraint-writing support doc template |
| `$GENERAL_OWNER_REVIEW_BEHAVIOR` | `general/roles/owner/review-behavior.md` | Ready-made Owner contribution-review support doc template |
| `$GENERAL_OWNER_LOG_MANAGEMENT` | `general/roles/owner/log-management.md` | Ready-made Owner intake and log-management support doc template |
| `$GENERAL_OWNER_CLOSURE` | `general/roles/owner/forward-pass-closure.md` | Ready-made Owner forward-pass closure support doc template |
| `$GENERAL_TA_ROLE` | `general/project-types/executable/roles/technical-architect/main.md` | Ready-made Technical Architect (advisory-producing) role template for projects with an executable layer — authority, boundaries, and workflow-linked support-doc routing |
| `$INSTRUCTION_ADOCS_DESIGN` | `general/instructions/a-docs-design.md` | How to create and maintain an a-docs design-principles file for any project |
| `$INSTRUCTION_AGENTS` | `general/instructions/agents.md` | How to create an agents.md for any project |
| `$INSTRUCTION_ROLES` | `general/instructions/roles/main.md` | How to create role documents — archetypes and templates |
| `$INSTRUCTION_REQUIRED_READINGS` | `general/instructions/roles/required-readings.md` | How to maintain per-role `required-readings.yaml` files — startup-context authority |
| `$INSTRUCTION_OWNERSHIP` | `general/instructions/roles/ownership.md` | How to maintain per-role `ownership.yaml` files — distributed surface accountability |
| `$INSTRUCTION_ARCHITECTURE` | `general/project-types/executable/instructions/project-information/architecture.md` | How to create an architecture document for projects with an executable layer |
| `$INSTRUCTION_LOG` | `general/instructions/project-information/log.md` | How to create a project log for any project |
| `$INSTRUCTION_PRINCIPLES` | `general/instructions/project-information/principles.md` | How to create a project principles document for any project |
| `$INSTRUCTION_WORKFLOW` | `general/instructions/workflow/main.md` | How to create a workflow document for any project |
| `$INSTRUCTION_WORKFLOW_GRAPH` | `general/instructions/workflow/graph.md` | How to create and maintain a machine-readable workflow graph representation (YAML frontmatter) — enables programmatic backward pass ordering |
| `$INSTRUCTION_WORKFLOW_MODIFY` | `general/instructions/workflow/modify.md` | How to modify an existing workflow — single-graph model, evaluative principles, hard rules, and six-step modification procedure |
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | `general/instructions/workflow/complexity.md` | How to construct a complexity-proportional workflow — five complexity axes, three tiers, and workflow plan as approval gate |
| `$INSTRUCTION_DEVELOPMENT` | `general/project-types/executable/instructions/development/main.md` | How to create a development folder for projects with an executable layer |
| `$INSTRUCTION_GOVERNANCE` | `general/project-types/executable/instructions/governance/main.md` | How to create a governance folder for projects with an executable layer |
| `$INSTRUCTION_COMMUNICATION` | `general/instructions/communication/main.md` | How to create a communication folder for any project |
| `$INSTRUCTION_COMMUNICATION_CONVERSATION` | `general/instructions/communication/conversation/main.md` | How to create a conversation layer — artifact formats, templates, and lifecycle |
| `$INSTRUCTION_COMMUNICATION_COORDINATION` | `general/instructions/communication/coordination/main.md` | How to create coordination protocols — status models, handoff rules, feedback, and conflict resolution |
| `$INSTRUCTION_IMPROVEMENT` | `general/instructions/improvement/main.md` | How to create an improvement/ folder for any project |
| `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` | `general/communication/conversation/TEMPLATE-owner-workflow-plan.md` | Ready-made workflow plan template — instantiated at intake as `owner-workflow-plan.md` in the record folder; five complexity axes, tier, path, known unknowns |
| `$GENERAL_IMPROVEMENT` | `general/improvement/main.md` | Ready-made improvement philosophy template |
| `$GENERAL_IMPROVEMENT_META_ANALYSIS` | `general/improvement/meta-analysis.md` | Meta-analysis phase instructions — injected into backward pass agent sessions by the runtime; contains reflection categories, analysis quality guidance, and `meta-analysis-complete` signal schema |
| `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` | `a-docs/improvement/meta-analysis.md` | A-Society project-specific meta-analysis phase instructions — runtime injection target for backward pass findings sessions in this project |
| `$A_SOCIETY_IMPROVEMENT_FEEDBACK` | `a-docs/improvement/feedback.md` | A-Society legacy/project-owned feedback phase instructions; runtime-managed feedback now uses `$A_SOCIETY_RUNTIME_FEEDBACK` |
| `$A_SOCIETY_PRINCIPLES` | `a-docs/project-information/principles.md` | A-Society design principles — context efficiency, consent, feedback, and structure rules |
| `$A_SOCIETY_RUNTIME_INITIALIZATION` | `runtime/contracts/initialization.md` | Runtime-owned initialization contract — used when the browser runtime initializes a project through a single-node Owner flow |
| `$A_SOCIETY_WORKFLOW` | `a-docs/workflow/main.yaml` | A-Society canonical workflow definition — the single permanent graph for framework, executable, and coordinated multi-role work |
| `$A_SOCIETY_WORKFLOW_COMPLEXITY` | `a-docs/workflow/complexity.md` | A-Society workflow complexity guidance — internal intake sizing rules, tier-selection boundaries, and project-specific routing constraints |
| `$A_SOCIETY_IMPROVEMENT` | `a-docs/improvement/main.md` | A-Society improvement philosophy and backward pass protocol — principles and process for documentation improvement |
| `$A_SOCIETY_FEEDBACK_DIR` | `feedback/` | All inbound feedback signal from adopting projects — new runtime-generated reports land directly here |
| `$A_SOCIETY_COMM_CONVERSATION` | `a-docs/communication/conversation/main.md` | A-Society conversation templates — permanent format references for all inter-agent handoff artifacts |
| `$A_SOCIETY_COMM_TEMPLATE_BRIEF` | `a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md` | Template: Owner → Curator briefing format |
| `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` | `a-docs/communication/conversation/TEMPLATE-curator-to-owner.md` | Template: Curator → Owner proposal / submission format |
| `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` | `a-docs/communication/conversation/TEMPLATE-owner-to-curator.md` | Template: Owner → Curator decision format |
| `$A_SOCIETY_COMM_TEMPLATE_PLAN` | `a-docs/communication/conversation/TEMPLATE-owner-workflow-plan.md` | Template: Owner workflow plan — Phase 0 artifact; produced at intake for every flow, before any brief is written |
| `$A_SOCIETY_COMM_COORDINATION` | `a-docs/communication/coordination/main.md` | A-Society coordination protocols — entry point |
| `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` | `a-docs/communication/coordination/handoff-protocol.md` | Status vocabulary, handoff requirements, clarification rules, pre-replacement checks |
| `$A_SOCIETY_COMM_FEEDBACK_PROTOCOL` | `a-docs/communication/coordination/feedback-protocol.md` | What to do when a discrepancy or blocker is discovered in prior work |
| `$A_SOCIETY_COMM_CONFLICT_RESOLUTION` | `a-docs/communication/coordination/conflict-resolution.md` | Authority matrix, escalation path, human escalation threshold |
