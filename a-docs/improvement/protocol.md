# A-Society: Meta Improvement Protocol

## Purpose

Standardize how agents capture, synthesize, and implement documentation and process improvement feedback for A-Society — through a hybrid model of task-linked meta analysis and recurring alignment cycles.

This protocol is adapted from `$GENERAL_IMPROVEMENT_PROTOCOL` for A-Society's two-role structure (Owner, Curator). A-Society does not have a dedicated Improvement Agent; the Owner serves as synthesis owner.

---

## When to Use

Use this protocol when the human asks for:
- Feedback on agent docs after a completed framework change or addition
- Instruction-conflict audits
- Maintenance pattern reviews
- Role-doc or template consistency cleanup

**"Completed task" definition for meta timing:**
- **Curator meta pass:** can run after a framework addition or maintenance change is registered.
- **Owner meta pass (synthesis):** can run as soon as Curator findings are present in `$A_SOCIETY_IMPROVEMENT_REPORTS`.

---

## Operating Model (Hybrid)

### Mode A — Task-Linked Meta (Default)

Use this after normal task execution to capture concrete friction from real implementation.

**Cadence:**
- **Lightweight pass (default for every completed task):** Owner produces one synthesis note recording top findings.
- **Full three-phase chain (conditional):** run only when at least one trigger is true:
  - A blocking contradiction or authority-boundary ambiguity was observed
  - A proposed addition failed the generalizability test in a non-obvious way
  - 3+ distinct findings are captured in the lightweight pass
  - Periodic checkpoint reached (recommended: every 3 completed framework additions)
  - A role health threshold is crossed (see Role Health Indicators below)

This prevents the full meta chain from serializing every change while preserving deep analysis when needed.

### Mode B — Agent Docs Alignment Cycle (Recurring, Standalone)

Use this for structural evolution that should not wait for a specific task.

**Execution pattern:**
1. Build/update alignment backlog from recent Mode A findings.
2. Prioritize into small independent chunks.
3. Execute each chunk and close it fully before the next chunk.
4. Feed outcomes back into role and workflow docs.

**Chunk-size constraints (mandatory):**
- One chunk should target one concern and remain reviewable in one pass.
- Recommended upper bound: 1–3 files changed, wording/structure only; no authority-boundary changes without explicit human approval.
- Each chunk must include rollback-safe wording (minimal reversible edits).

---

## Mandatory Evolution Lenses

Every Mode A and Mode B finding must be assessed through these three lenses:

1. **Portability Boundary Lens**: Is the instruction reusable across projects, or A-Society-specific?
   - Reusable rules belong in `general/` as general policy.
   - A-Society-specific details remain in `a-docs/`.

2. **Collaboration Throughput Lens**: Does this rule force unnecessary serialization?
   - Flag steps that block the Owner-Curator loop without safety value.
   - Prefer conditional gates over always-on ceremony when safety is unchanged.

3. **Evolvability Lens**: Does this change reduce future edit cost?
   - Prefer canonical-source + cross-reference over duplicated policy text.
   - Prefer modular sections that can be updated independently.

---

## Mode A — Task-Linked Meta Flow (Three Phases)

### Lightweight Pass (Default Per Task)

When full three-phase analysis is not triggered, produce a lightweight synthesis note:
- **Owner:** Synthesis owner produces the note.
- **Output:** `$A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-lightweight.md`
- **Template:** `$GENERAL_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT`
- **Required contents:**
  - Top 1–5 findings
  - Lens impact summary (portability/collaboration/evolvability)
  - Recommendation: `no-full-chain-needed` or `escalate-to-full-chain` with trigger rationale

If lightweight output recommends escalation, proceed with full Phase 1 → Phase 2 → Phase 3 flow.

---

### Phase 1 — Per-Agent Findings

**Execution order: downstream-first.**
Curator runs first (closest to implementation friction), then Owner.

**Session type:** The same session that executed the task, or a resumed session with full task context.

**Carry-forward rule (mandatory):** The Owner's Phase 1 session must include the Curator's findings file as context. The Owner:
- Validates, refutes, or extends Curator findings from a strategic perspective
- Adds findings specific to the Owner role's experience

**Standard session prompts:**

For Curator:
```
You are the A-Society Curator operating in meta-improvement mode.

This is a resumed session. You have full context of your [task-id] execution.

Your task: produce your findings file at:
`$A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-curator-findings.md`

Follow Phase 1 of `$A_SOCIETY_IMPROVEMENT_PROTOCOL` for the required file format.
Create the reports directory if it does not yet exist.

Use these 8 categories to guide your analysis:
1. Conflicting Instructions
2. Redundant Information
3. Missing Information
4. Unclear Instructions
5. Responsibility / Scope Concerns
6. Framework Philosophy Concerns
7. Redundant Workflow Steps
8. Other Observations

For each non-trivial finding, add lens tags: portability, collaboration, evolvability.
Ground every finding in a specific moment from your task execution.
Produce a ## Top 5 Findings (Ranked) section at the bottom.
```

For Owner:
```
You are the A-Society Owner operating in meta-improvement mode.

This is a resumed session. You have full context of your [task-id] execution.

Your task: produce your findings file at:
`$A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-owner-findings.md`

Follow Phase 1 of `$A_SOCIETY_IMPROVEMENT_PROTOCOL`.

Prior findings to review and assess (carry-forward — mandatory):
- $A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-curator-findings.md

Use the same 8 categories. Add lens tags. Produce a ## Top 5 Findings (Ranked) section.
```

**Output per agent:**
`$A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-<role>-findings.md`

Template: `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`

---

### Phase 2 — Synthesis

**Session type: New session — NOT the agent that executed the task.**

**Synthesis owner:** Owner.

**Standard session prompt:**
```
You are the A-Society Owner operating in synthesis mode.

Read agents.md.

Attached are per-agent findings files from a [task-id] meta-analysis:
- $A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-curator-findings.md
- $A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-owner-findings.md

Follow Phase 2 of `$A_SOCIETY_IMPROVEMENT_PROTOCOL`.
```

**Output:** `$A_SOCIETY_IMPROVEMENT_REPORTS/META-YYYYMMDD-<task-id>-synthesis.md`

Template: `$GENERAL_IMPROVEMENT_TEMPLATE_SYNTHESIS`

> **Note:** No before/after wording in the synthesis. The Curator reads the target doc and writes the wording change during Phase 3 execution.

---

### Phase 3 — Human Approval + Implementation

1. Human reviews the synthesis doc and marks each item: **approved** / **rejected** / **deferred**.
2. Approved changes are implemented by the Curator in small independent chunks.
3. Owner validates closure if changes touch role authority boundaries or framework scope.
4. Implemented changes are registered in the relevant index.
5. If approved items exceed one chunk, schedule remaining chunks in a follow-up session.

---

## Mode B — Agent Docs Alignment Flow (Standalone)

### Alignment Phase A — Backlog Curation
Inputs: recent Mode A synthesis files, unresolved deferred items, recurring friction from Owner or Curator sessions.

Output: `$A_SOCIETY_IMPROVEMENT_REPORTS/ALIGN-YYYYMMDD-backlog.md`
Template: `$GENERAL_IMPROVEMENT_TEMPLATE_BACKLOG`

### Alignment Phase B — Chunk Planning
For each selected alignment item, define: target docs, expected impact, rollback note, owner.

### Alignment Phase C — Incremental Implementation
Execute chunk plans one at a time. Re-run lens check during closure. Record residual items for the next session.

---

## Decision Ownership

| Finding Category | Synthesis Owner | Final Approver |
|---|---|---|
| Instruction clarity or completeness gaps | Owner | Human |
| Role boundary ambiguities | Owner | Human |
| Placement or folder structure issues | Owner | Human |
| Workflow step redundancy or phase sequencing | Owner | Human |
| Portability boundary changes (general/ vs project-specific) | Owner | Human |
| Framework scope or direction | Owner | Human (mandatory) |

---

## Role Health Indicators

| Signal | Threshold | Automatic Action |
|---|---|---|
| Role doc line count | > 350 lines | Flag in next lightweight pass; schedule Mode B review if confirmed in 2 consecutive tasks |
| Same friction class appears in 3+ consecutive meta analyses | Recurring | Force-promote to High in next synthesis |
| A `general/` instruction produces incorrect output in 2+ projects | Recurring | Flag for Owner review and revision |

---

## Guardrails

- Do not silently mutate role authority boundaries.
- Do not rewrite historical improvement reports to retrofit new policy wording.
- If two docs conflict, resolve by updating one source-of-truth section and adding a cross-reference — never duplicate policy text.
- Do not require the full three-phase chain for every task; use trigger-based escalation.
- Findings files are role-scoped artifacts. Keep Curator findings and Owner findings separate during Phase 1.
- A meta-analysis session is not a task execution session. The Owner in synthesis mode must not produce framework additions, plans, or implementations.
