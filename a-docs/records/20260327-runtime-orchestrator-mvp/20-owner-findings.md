# Backward Pass Findings: Owner — 20260327-runtime-orchestrator-mvp

**Date:** 2026-03-27
**Task Reference:** 20260327-runtime-orchestrator-mvp
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

None beyond what the TA identified in finding #5. Root-cause analysis in Scope Concerns below.

---

### Missing Information

**1. `session_action` enum values not surfaced at the point of production.**

The valid values for `session_action` (`start_new` and `resume`) are defined in `$INSTRUCTION_MACHINE_READABLE_HANDOFF`, which is not in the Owner's required reading. The Owner Handoff Output section points to `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` for handoff format guidance, but that document does not state the specific enum values. The Owner produced `session_action: start` in both `02-owner-to-ta-brief.md` and `04-owner-to-developer.md` without any loaded document flagging the error.

The TA's finding #5 correctly traces the cascade: the TA read these Owner-produced artifacts as usage examples and produced the same error; the Developer then read both as canonical patterns and implemented a `start` → `start_new` normalization, initially filing it as "no deviation." The error originated at the highest-authority role and propagated downward — exactly the "externally caught errors are higher priority" case described in the improvement protocol.

Root cause: the enum constraint lives in an instruction document that the roles producing handoff blocks do not load. It needs to be surfaced at the point where the decision is made — in the handoff protocol document and/or in the Handoff Output section of role documents.

**2. `$A_SOCIETY_TOOLING_INVOCATION` omits Component 7.**

Both the Runtime Developer (finding #1) and the TA (finding #2) identified this. The Developer had to read the source file to discover `validatePlanArtifact`'s interface. This is a Type B coupling-map gap: Component 7 shipped without a corresponding INVOCATION.md entry. The TA's Phase 0 trigger rules referenced Component 7 without knowing this gap existed. The Developer encountered it mid-implementation. Both were avoidable with a complete INVOCATION.md.

---

### Scope Concerns

**3. INVOCATION.md authorship was incorrectly scoped to the Curator; ruling established.**

The Owner brief (`16-owner-to-curator.md`) directed the Curator to create `runtime/INVOCATION.md`. The Curator correctly flagged this as outside their defined scope: `a-docs/` and `general/`. The Owner brief's `[Curator authority — implement directly]` designation extended scope for this task, but that does not resolve the underlying structural question of who should own invocation reference creation going forward.

**Ruling: Developers, not the Curator.**

Invocation references document how to invoke executable code — they are implementation documentation and a natural Developer deliverable, not a documentation-maintenance task. The Curator's registration function is to index existing documentation in the appropriate registries (public index, internal index, a-docs-guide). Authoring new documentation for layers the Curator did not build is outside that function.

This ruling requires three changes:
- `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`: add creation of `runtime/INVOCATION.md` to implementation scope (a-docs/ → Curator implements at synthesis)
- `$A_SOCIETY_CURATOR_ROLE`: clarify that registration means indexing existing documentation; authoring new execution-layer docs is not within registration scope (a-docs/ → Curator implements at synthesis)
- `$GENERAL_CURATOR_ROLE`: equivalent clarification in the distributable template (LIB scope → Next Priorities, merge into existing "Role guidance quality" item)

---

### Workflow Friction

**4. Owner did not catch the "binding trigger rules" ambiguity at Phase 0 gate review.**

The TA's finding #4 is correct: "trigger rules that are binding for MVP" was ambiguous between architectural declaration ("these trigger points must be declared") and code-level requirement ("these must be real function calls"). The Owner's Phase 0 gate review criteria — vision consistency, architecture consistency, tooling compatibility — did not include a check for implementation-vs-declaration ambiguity in binding rules. The Owner approved the spec without catching this gap; the Developer exploited it by filing stubs as spec-compliant.

This is an Owner gate quality gap. The TA advisory standards should explicitly require that "binding" requirements state "real in-process function calls, not stubs or comment placeholders" when implementation-level execution is intended. The Owner's Phase 0 gate checklist should include verifying that any binding implementation requirement is specified unambiguously.

---

## Top Findings (Ranked)

1. **`session_action` enum not surfaced at production site** — Owner (and then TA) produced `start` instead of `start_new`; error cascaded to Developer normalization and the D-1 remediation cycle. Root cause: enum constraint only in `$INSTRUCTION_MACHINE_READABLE_HANDOFF`, not in the handoff protocol or role Handoff Output sections. Fix: add explicit `session_action` constraint to `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. Scope: a-docs/; Curator implements at synthesis.

2. **INVOCATION.md authorship ruling: Developer, not Curator** — Owner incorrectly tasked Curator with authoring `runtime/INVOCATION.md`. Ruling: invocation references are Developer deliverables; Curator registration means indexing, not authoring. Fix: update `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` and `$A_SOCIETY_CURATOR_ROLE` (a-docs/ → Curator at synthesis); update `$GENERAL_CURATOR_ROLE` (LIB → Next Priorities, merge into "Role guidance quality" item).

3. **TA role needs session-type differentiation for integration review** — Phase 0 design and integration review have materially different context loading and operating orientation; the role document makes no distinction. Fix: update `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`. Scope: a-docs/; Curator implements at synthesis.

4. **Component 7 missing from `$A_SOCIETY_TOOLING_INVOCATION`** — Type B coupling-map gap; Developer had to read source directly. Fix: add Component 7 (`validatePlanArtifact(recordFolderPath: string)`) section to `tooling/INVOCATION.md`. Scope: tooling/ path, not a-docs/; routes to Next Priorities.

5. **"Binding" language ambiguity: Owner gate review should verify implementation-vs-declaration clarity** — The Phase 0 spec's "binding trigger rules" did not unambiguously mean "real function calls." Owner approved without catching it. Fix: update `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` advisory standards to require explicit "real in-process function calls, not stubs" language for any binding implementation rule. Scope: a-docs/; Curator implements at synthesis.

---

## Next Priorities Items Filed

**[S][MAINT] — Add Component 7 to `$A_SOCIETY_TOOLING_INVOCATION`** — `tooling/INVOCATION.md` documents Components 1–6 but omits Component 7. Entry point: `validatePlanArtifact(recordFolderPath: string)`. Type B coupling-map gap; should have shipped with Component 7. Merge assessment: no existing Next Priorities item targets INVOCATION.md. New item. Source: Runtime Developer finding #1; TA finding #2; Owner finding #2 (this flow).

**Merge into existing "Role guidance quality" item** — Append a fifth bundled change: `$GENERAL_CURATOR_ROLE` Registration section — clarify that registration means indexing existing documentation in the appropriate indexes; authoring documentation for executable layers (e.g., `tooling/INVOCATION.md`, `runtime/INVOCATION.md`) is outside registration scope and is a Developer deliverable. Source: Curator finding #1; Owner finding #3 (this flow).

---

## Handoff

Start a new Curator session for synthesis (step 5 of 5 — final step).

```
Next action: Perform backward pass synthesis (step 5 of 5 — final step)
Read: all findings artifacts in a-society/a-docs/records/20260327-runtime-orchestrator-mvp, then ### Synthesis Phase in a-society/general/improvement/main.md
Expected response: Synthesis artifact at the next available sequence position in a-society/a-docs/records/20260327-runtime-orchestrator-mvp
```

```yaml
handoff:
  role: Curator
  session_action: start_new
  artifact_path: a-society/a-docs/records/20260327-runtime-orchestrator-mvp
  prompt: "You are the Curator agent for A-Society. Read a-society/a-docs/agents.md.\n\nYou are performing backward pass synthesis (step 5 of 5 — final step).\n\nRead: all findings artifacts in a-society/a-docs/records/20260327-runtime-orchestrator-mvp, then ### Synthesis Phase in a-society/general/improvement/main.md\n\nProduce your synthesis at the next available sequence position in a-society/a-docs/records/20260327-runtime-orchestrator-mvp."
```
