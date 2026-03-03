# Meta Improvement Protocol

> [CUSTOMIZE] Replace all `[PROJECT_*]` placeholders with the appropriate `$VARIABLE_NAME` values from your project's index. Update role names, file paths, and output locations to match your project's structure.

## Purpose
Standardize how agents capture, synthesize, and implement documentation/process improvement feedback through a hybrid model:
- Task-linked meta analysis for execution friction,
- recurring alignment cycles for structural agent-doc evolution.

## When To Use
Use this protocol when the user asks for:
- feedback on agent docs after a completed task or change request,
- instruction-conflict audits,
- process clarity or governance improvements,
- template/role-doc consistency cleanup.

**"Completed task" definition for meta timing:**
- **Planning role meta pass:** can run after verification is recorded. Does not require prior requirements role closure.
- **Requirements role meta pass:** can run once verification is recorded.
- **Improvement Agent (Phase 2):** can run as soon as all required per-agent findings files are present in `[PROJECT_IMPROVEMENT_REPORTS]`. Task closure state is not a prerequisite.

---

## Operating Model (Hybrid)

### Mode A — Task-Linked Meta (Default)
Use this after normal task execution to capture concrete friction from real implementation.

Cadence:
- **Lightweight pass (default for every completed task):** one synthesis-owner pass that records top findings and lens impact.
- **Full three-phase chain (conditional):** run only when at least one trigger is true:
  - blocking contradiction or authority-boundary ambiguity was observed,
  - security/contract drift risk is identified,
  - 3+ distinct findings are captured in the lightweight pass,
  - periodic checkpoint reached (recommended: every 3 completed tasks),
  - a role health threshold is crossed (see Role Health Indicators below).

This prevents the full meta chain from serializing every task while preserving deep analysis when needed.

### Mode B — Agent Docs Alignment Cycle (Recurring, Standalone)
Use this for structural evolution that should not wait for a specific task.

Execution pattern:
1. Build/update alignment backlog from recent Mode A findings.
2. Prioritize into small independent chunks.
3. Execute each chunk and close it fully before the next chunk.
4. Feed outcomes back into role/workflow docs and future Mode A prompts.

Chunk-size constraints (mandatory):
- One chunk should target one concern and remain reviewable in one pass.
- Recommended upper bound: 1-3 files changed, wording/structure only, no authority-boundary changes without explicit user approval.
- Each chunk must include rollback-safe wording (minimal reversible edits).

---

## Mandatory Evolution Lenses

Every Mode A and Mode B finding must be assessed through these three lenses:

1. **Portability Boundary Lens**: Is the instruction reusable across projects, or project-specific?
   - Reusable rules belong in role/coordination docs as general policy.
   - Project-specific details (paths, names, environment quirks) should remain in project-scoped docs.
2. **Collaboration Throughput Lens**: Does this rule force unnecessary serialization?
   - Flag steps that block parallel work without safety value.
   - Prefer conditional gates over always-on ceremony when safety is unchanged.
3. **Evolvability Lens**: Does this change reduce future edit cost?
   - Prefer canonical-source + cross-reference over duplicated policy text.
   - Prefer modular sections that can be updated independently.

---

## Mode A — Task-Linked Meta Flow (Three Phases)

### Lightweight Pass (Default Per Task)

When full three-phase analysis is not triggered, produce a lightweight synthesis note:
- **Owner:** Planning role (default) or requirements role when template clarity is primary.
- **Output:** `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-lightweight.md`
- **Template:** `[PROJECT_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT]`
- **Required contents:**
  - top 1-5 findings,
  - lens impact summary (portability/collaboration/evolvability),
  - recommendation: `no-full-chain-needed` or `escalate-to-full-chain` with trigger rationale.

If lightweight output recommends escalation, proceed with full Phase 1 → Phase 2 → Phase 3 flow below.

### Phase 1 — Per-Agent Findings

**Execution order: downstream-first.**
Execution roles run first (closest to implementation friction), then planning roles, then requirements roles.

**Session type:** The same session that executed the task, or a resumed session with full task context.

**Carry-forward rule (mandatory):** Each subsequent agent's session prompt must include all prior agents' findings files as context. Each agent:
- Validates, refutes, or extends prior findings from their own role's perspective.
- Adds findings specific to their own role experience.

**Standard session prompt (use verbatim when starting each Phase 1 agent session):**

```
You are a <Role> Agent operating in meta-improvement mode for [PROJECT_NAME].

This is a resumed session. You have full context of your <TASK-ID> execution.

Your task: produce your findings file at:
`[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md`

Follow Phase 1 of `[PROJECT_IMPROVEMENT_PROTOCOL]` for the required file format.
Create the reports directory if it does not yet exist.

[Include the following block for every agent except the first:]
Prior findings to review and assess (carry-forward — mandatory):
- @[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<prior-role>-findings.md
[Add one line per prior findings file in execution order]

Use these 8 categories to guide your analysis:
1. Conflicting Instructions
2. Redundant Information
3. Missing Information
4. Unclear Instructions
5. Responsibility / Scope Concerns
6. Engineering Philosophy Concerns
7. Redundant Workflow Steps
8. Other Observations

For each non-trivial finding, add lens tags:
- `portability`, `collaboration`, `evolvability`

Ground every finding in a specific moment from your task execution.
Finally, produce a `## Top 5 Findings (Ranked)` section at the bottom.
```

**Output per agent:**
`[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md`

Use template: `[PROJECT_IMPROVEMENT_TEMPLATE_FINDINGS]`

---

### Phase 2 — Synthesis

**Session type: New session — NOT the agent that executed the task.**

**Synthesis owner:** Improvement Agent. See `[PROJECT_IMPROVEMENT_ROLE]` for permitted change scope.

**Standard session prompt:**

```
You are an Improvement Agent for [PROJECT_NAME].

Read agents.md.

Attached are per-agent findings files from a <TASK-ID> meta-analysis:
- [list findings files with paths]

Follow Phase 2 of `[PROJECT_IMPROVEMENT_PROTOCOL]`.
Your synthesis responsibilities are defined in `[PROJECT_IMPROVEMENT_ROLE]`.
```

**Output:** `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-synthesis.md`

Use template: `[PROJECT_IMPROVEMENT_TEMPLATE_SYNTHESIS]`

> **Note:** No before/after wording in the synthesis. The implementing agent reads the target doc and writes the wording change during Phase 3 execution.

---

### Phase 3 — Human Approval + Implementation

1. Human User reviews the synthesis doc and marks each item: **approved** / **rejected** / **deferred**.
2. Approved changes are implemented in **small independent chunks**.
3. Requirements role validates closure if changes touch requirement templates, workflow phase definitions, or role authority boundaries.
4. Implemented changes are logged in the project log.
5. If approved items exceed one chunk, schedule remaining chunks in the project log's Next Priorities.

---

## Mode B — Agent Docs Alignment Flow (Standalone)

### Alignment Phase A — Backlog Curation
Inputs: recent Mode A synthesis files, unresolved deferred items, recurring friction from role sessions.

Output: `[PROJECT_IMPROVEMENT_REPORTS]/ALIGN-YYYYMMDD-backlog.md`
Template: `[PROJECT_IMPROVEMENT_TEMPLATE_BACKLOG]`

### Alignment Phase B — Chunk Planning
For each selected alignment item, define: target docs, expected impact, rollback note, owner.

### Alignment Phase C — Incremental Implementation
Execute chunk plans one at a time. Re-run lens check during closure. Record residual items in project log Next Priorities.

---

## Decision Ownership

| Finding Category | Synthesis Owner | Final Approver |
|---|---|---|
| Handoff template gaps, coordination protocol issues | Improvement Agent | User |
| Role boundary ambiguities, ownership matrix gaps | Improvement Agent | User |
| Task template gaps, requirement clarity | Improvement Agent | User |
| Workflow step redundancy, phase sequencing | Improvement Agent | User |
| Portable vs project-specific instruction boundary changes | Improvement Agent | User |
| Cross-cutting policy (affects multiple roles) | Improvement Agent | User |

---

## Role Health Indicators

| Signal | Threshold | Automatic Action |
|---|---|---|
| Role doc line count | > 350 lines | Flag in next lightweight pass; schedule Mode B review if confirmed in 2 consecutive tasks |
| Context saturation (same phase) | Reported in 2+ consecutive lightweight passes for the same role phase | Escalate to `role-scope-review` |
| Unfixed carry-forward finding | Same finding class appears across 3+ consecutive meta analyses | Force-promote to High in the next synthesis |
| Responsibility accumulation | A role doc section count exceeds 10 distinct H2 sections | Review whether sections should split |

---

## Guardrails

- Do not silently mutate role authority boundaries.
- Do not rewrite historical completed tasks to retrofit new policy wording.
- If two docs conflict, resolve by updating one source-of-truth section and adding a cross-reference — never duplicate policy text.
- Do not require full multi-agent meta chains for every task by default; use trigger-based escalation.
- Findings files are role-scoped artifacts. Keep them separate during Phase 1.
- A meta-analysis session is not a task execution session. Synthesis agents must not produce plans, handoffs, or code.
