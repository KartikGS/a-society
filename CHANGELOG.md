# Changelog

All notable changes to A-Society will be documented here.

---

## [Unreleased]

### Runtime

- Allow `prompt-human` nodes to resume from inbound handoffs and allow targeted human input for nodes suspended in `await-handoff`, with queued human replies taking priority for that turn.
- Per-role model selection: when more than one model is configured, each role instance prompts for a model in its feed at first activation — the node suspends as awaiting human input with reason `model-selection` — and the chosen model is persisted per flow in `roles/<roleKey>/model.json` and used for all of that role's turns, including improvement and compaction.

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
