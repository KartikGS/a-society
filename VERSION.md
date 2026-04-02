# A-Society: Current Version

**Version:** v27.1

---

This file is the single source of truth for A-Society's current framework version.

## Version Scheme

`vMAJOR.MINOR`

- **MAJOR** increments when a Breaking update report is published
- **MINOR** increments when a Recommended or Optional update report is published

This scheme aligns directly with the impact classification on framework update reports. No patch level.

## For Agents

- To determine A-Society's current version: read this file
- This file is updated as part of Phase 4 (Registration) after each approved change cycle that produces an update report
- The Curator updates this file; the Owner reviews it as part of update report approval

## History

| Version | Date | Update Report |
|---|---|---|
| v27.1 | 2026-04-02 | 2026-04-02-parallel-handoff-array-form.md — Machine-readable handoff instruction adds fork-point array form while preserving single-target form (Recommended) |
| v27.0 | 2026-03-31 | 2026-03-31-session-routing-removal.md — Session routing removed from all governance docs and handoff schema; `session_action`/`prompt` removed from runtime (Breaking × 3 + Recommended × 1) |
| v26.0 | 2026-03-29 | 2026-03-29-owner-protocol-and-role-guidance-bundle.md — Owner role: log validity sweeps (Breaking); multi-domain merge criteria (Breaking); brief-writing & constraint precision (Recommended) |
| v25.0 | 2026-03-29 | 2026-03-29-owner-routing-multi-domain.md — Owner role: single flow with parallel tracks (Breaking); workflow instruction: multi-domain parallel-track pattern (Recommended) |
| v24.1 | 2026-03-29 | 2026-03-29-workflow-schema-unification.md — Workflow schema unification — record-folder workflow.md adopts nodes/edges format (Recommended) |
| v24.0 | 2026-03-29 | 2026-03-29-agent-context-frontmatter.md — YAML frontmatter for agent context injection (Breaking) |
| v1.0 | 2026-03-09 | Baseline — versioning system introduced; all pre-versioning update reports incorporated |
| v1.1 | 2026-03-09 | 2026-03-09-versioning-model.md — Versioning system introduced |
| v2.0 | 2026-03-11 | 2026-03-11-feedback-consent-infrastructure.md — Feedback consent infrastructure wired |
| v2.1 | 2026-03-11 | 2026-03-11-initializer-consent-registration.md — Initializer Phase 5 consent file index registration |
| v3.0 | 2026-03-11 | 2026-03-11-agents-md-reading-order.md — agents.md reading order corrected (index second) and authority hierarchy specified |
| v4.0 | 2026-03-11 | 2026-03-11-thinking-folder-required.md — thinking/ folder required at initialization |
| v4.1 | 2026-03-11 | 2026-03-11-variable-retirement-protocol.md — Variable retirement protocol added to index instruction |
| v5.0 | 2026-03-12 | 2026-03-12-handoff-copyable-inputs.md — Handoff Output item 4 (copyable session inputs) added to all role templates |
| v6.0 | 2026-03-14 | 2026-03-14-workflow-instruction-improvements.md — Workflow instruction updated: session model mandatory for two or more roles; Owner as entry and terminal node; session reuse rules; backward pass section; parallel fork/join patterns |
| v7.0 | 2026-03-14 | 2026-03-14-brief-writing-quality.md — Brief-Writing Quality section added to general Owner role template; output-format changes flagged as non-mechanical |
| v8.0 | 2026-03-14 | 2026-03-14-improvement-folder-redesign.md — Improvement folder redesigned: synthesis path corrected, protocol.md retired into single main.md, improvement/ folder mandatory, traversal algorithm added, generalizable findings guidance added |
| v9.0 | 2026-03-14 | 2026-03-14-fully-agentic-role-model.md — Fully agentic role model: Human-collaborative phase field added to workflow instruction; Phase 1 structural rule; role document framing updated to agents-only |
| v10.0 | 2026-03-15 | 2026-03-15-communication-templates-and-workflow-graph.md — Communication templates added to general/ (Breaking); workflow graph instruction added (Recommended) |
| v11.0 | 2026-03-15 | 2026-03-15-agent-reliability-gaps.md — Handoff Output path portability required (Breaking); Curator deep-link prohibition added (Breaking); context confirmation completeness required (Recommended) |
| v11.1 | 2026-03-16 | 2026-03-16-complexity-analysis-references.md — Complexity analysis at intake added to Owner role template; intake routing section added to workflow instruction (both Recommended) |
| v12.0 | 2026-03-17 | 2026-03-17-owner-phase0-gate.md — Phase 0 gate added to Owner role template; workflow plan template added to general library (both Breaking) |
| v13.0 | 2026-03-18 | 2026-03-18-process-gap-bundle.md — Records structure Phase 0 gate artifact declared as first required position (Breaking); confirmation step framing removed from Owner role template (Recommended); existing-session handoff format added to Handoff Output sections (Recommended); improvement tooling note generalized (Optional) |
| v14.0 | 2026-03-19 | 2026-03-19-graph-schema-simplification.md — Workflow graph schema simplified to nodes-and-edges only; backward pass removed from workflow graph model (Breaking) |
| v14.1 | 2026-03-20 | 2026-03-20-briefing-records-refinements.md — Added multi-file scope guidance to Owner template; functional referencing for trailing artifacts required in Records instruction (Recommended) |
| v15.0 | 2026-03-20 | 2026-03-20-synthesis-backlog-fix.md — Synthesis role expressly prohibited from generating maintenance backlogs (Breaking) |
| v15.1 | 2026-03-20 | 2026-03-20-session-startup-logic.md — Session startup hedging removed from workflow and role templates (Recommended) |
| v16.0 | 2026-03-20 | 2026-03-20-backward-pass-orderer-interface.md — Backward Pass Orderer invocation model changed: reads workflow.md from record folder, always-invoke, BackwardPassPlan output (Breaking); workflow.md documented in records instruction (Recommended) |
| v17.0 | 2026-03-21 | 2026-03-21-records-ordering-guardrails.md — workflow.md completeness rule added to records instruction (Breaking); parallel-track sub-labeling added to records instruction (Optional); workflow.md pre-convention and bootstrapping exemptions added (Recommended); forward pass closure boundary added to improvement guardrails (Recommended) |
| v17.1 | 2026-03-21 | 2026-03-21-index-paths-bp-handoffs.md — Index path format rule replaced with explicit repo-relative requirement; unregistered-file guidance added (Recommended); backward pass handoff completeness guardrail added to improvement guardrails (Recommended) |
| v17.2 | 2026-03-21 | 2026-03-21-next-priorities-bundle.md — Guardrail order corrected in improvement protocol; `workflow.md` delimiter requirement added to records instruction; ordered-list insertion position and classification scope note added to general Owner role template (all Recommended) |
| v17.3 | 2026-03-21 | 2026-03-21-workflow-mechanics-corrections.md — Synthesis routing simplified to structural rule in general improvement protocol; backward pass tool mandate strengthened to prohibit manual ordering when tool is available (both Recommended) |
| v17.4 | 2026-03-22 | 2026-03-22-general-lib-sync-bundle.md — human-collaborative field documented in workflow graph instruction; approval-not-completion clarification and synthesis-closes-backward-pass statement added to improvement protocol; obsoletes check added to Owner role template (all Recommended) |
| v17.5 | 2026-03-22 | 2026-03-22-log-restructure.md — two-file log model (archive split); merge assessment for Next Priorities in log instruction, improvement protocol, and Owner role template (all Recommended) |
| v17.6 | 2026-03-22 | 2026-03-22-backward-pass-analysis-quality.md — Analysis Quality subsection added to backward pass protocol in general improvement template (Recommended) |
| v18.0 | 2026-03-22 | 2026-03-22-workflow-forward-pass-closure-instruction.md — Forward Pass Closure mandatory section and authoring step added to workflow instruction (Breaking) |
| v18.1 | 2026-03-22 | 2026-03-22-improvement-bp-phase-separation.md — Backward pass protocol phase headings separated: Meta-Analysis Phase and Synthesis Phase replace How It Works (Recommended) |
| v19.0 | 2026-03-22 | 2026-03-22-backward-pass-orderer-signature.md — Component 4 orderWithPromptsFromFile signature changed to two required parameters; embedded phase-instruction references documented in general improvement template (Breaking + Recommended) |
| v19.1 | 2026-03-22 | 2026-03-22-brief-writing-quality.md — Authority designation, topology-based obligation, and behavioral property consistency added to general Owner role template; Approval Invariant topology check and Implementation Practices section added to general Curator role template (all Recommended) |
| v20.0 | 2026-03-22 | 2026-03-22-workflow-path-completeness.md — workflow.md Phase 0 creation obligation and path-completeness obligation for predictable post-implementation steps added to general Owner role template (both Breaking) |
| v21.0 | 2026-03-23 | 2026-03-23-structural-readiness-assessment.md — Structural Readiness Assessment (feasibility, routability, Structural Gap Protocol) added as mandatory intake gate before complexity analysis; Owner role template Workflow Routing bullet updated (Breaking) |
| v22.0 | 2026-03-25 | 2026-03-25-doc-maintenance-bundle.md — Pre-handoff workflow.md verification step added to Curator role template (Breaking); concurrent-workflow routing rule added to Owner role template (Breaking); third merge assessment criterion added to log instruction (Breaking); prose insertions guidance added to Owner role template (Recommended); mandate sentences removed from general improvement template Tooling paragraph (Recommended) |
| v22.1 | 2026-03-25 | 2026-03-25-machine-readable-handoff.md — Machine-readable handoff block instruction added to general library; four-field YAML schema (`role`, `session_action`, `artifact_path`, `prompt`) for agent pause-point output (Recommended) |
| v23.0 | 2026-03-28 | 2026-03-28-improvement-synthesis-third-criterion.md — Third merge criterion added to Synthesis Phase merge assessment in general improvement template (Breaking) |
| v23.1 | 2026-03-28 | 2026-03-28-general-doc-bundle.md — Role template quality bundle: backward pass sequence filing, Owner/Curator guidance quality (9 changes), records naming distinction, machine-readable handoff phase-closure semantics, TA role template added, Developer completion/integration-test requirements (all Recommended/Optional) |
