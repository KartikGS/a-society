---
a_society_version: "0.2.0"
---

<!-- On release, bump a_society_version above to match the newest released section below; the runtime reads it as the canonical current version. -->

# Changelog

All notable changes to A-Society will be documented here.

---

## [Unreleased]

### Library

- File path indexes are now **project-relative**: index path cells are relative to the project root (the folder containing `a-docs/`), not the workspace. Projects must rewrite their `a-docs/indexes/main.md` (and any general index) path cells to drop the project-folder prefix — e.g. `my-project/a-docs/agents.md` becomes `a-docs/agents.md` — and add a note that paths are project-relative. The runtime resolves paths under the project namespace, which keeps indexes correct across git worktrees and renamed project folders.
- Workflow node schema reduced to what the runtime acts on. Removed the authored node keys `invariants`, `escalation`, `inputs`, and `outputs`. Added two optional boolean flags: `human-colab` (the human stays in the decision — the node's forward handoff is staged for operator approval) and `await-all-inputs` (strict AND-join — the runtime holds the node until every inbound edge's handoff completes). Unknown node keys fails validation, so projects must strip the dropped keys from `a-docs/workflow/main.yaml`.

### Runtime

- Framework version tracking: the canonical version is declared in this changelog's `a_society_version` frontmatter, and each initialized project records the version it conforms to in `a-docs/a-society-version.md` frontmatter (stamped at initialization, validated by health checks).
- Update flow: `GET /api/projects` now reports per-project `updateAvailable`; the project selector shows an Update button when a project is behind, launching an Owner-only update flow that migrates the `a-docs/` to the current version. The optional feedback step runs with an `update` feedback context.

---

## [0.2.0] — 2026-06-14

### Runtime

- `prompt-human` resume support: inbound handoffs and targeted human replies can now resume suspended human-prompt nodes.
- Role Configuration: role instances can now be configured with model, skill, and MCP selections before execution.
- Skills management: Settings now supports importing, listing, and deleting local skills from `.a-society/skills/`.
- MCP integration: Settings can register stdio or HTTP MCP servers, and role instances can expose selected MCP tools through normal permission prompts.
- Automatic Role Configuration: optional per-dimension auto-selection lets agents choose models, skills, and MCP servers when enabled, with manual fallback.

---

## [0.1.0] — 2026-06-08

Initial release.

### Runtime

- Local web server with browser UI at `http://localhost:3000`
- Project selector with three paths: initialized projects, uninitialized projects, and create new
- Settings panel for model configuration — provider, API key, model ID, and optional base URL; stays open until a model is active
- Owner chat mode for project initialization — scaffolds `a-docs/` and runs an interactive Owner-led flow that fills it with real project truth
- Graph mode for active flows — React Flow visualization of the workflow with color-coded node states (ready, running, awaiting human, completed)
- Role-based workflow execution with session continuity across server restarts
- Same-node resume — paused role sessions are preserved and resumed with the exact transcript intact
- Per-flow tool permission modes: No Access, Partial Access, and Full Access
- Improvement protocol — backward-pass meta-analysis on flow completion with optional upstream feedback
- OpenTelemetry support for traces, metrics, and logs via OTLP/HTTP

### Library

- Instruction library in `general/instructions/` covering vision, structure, agents, indexes, workflow, records, roles, improvement, communication, and governance
- Universal role templates: Owner (full support doc set including brief-writing, review behavior, log management, closure, and TA advisory review)
- Technical Architect role template under `general/project-types/executable/`
- Improvement philosophy and meta-analysis templates
- Communication templates for inter-agent handoffs and coordination protocols
