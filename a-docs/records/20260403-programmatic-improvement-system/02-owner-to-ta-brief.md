**From:** Owner
**To:** Technical Architect
**Artifact:** Owner → TA Brief
**Flow:** programmatic-improvement-system (2026-04-03)
**Date:** 2026-04-03

---

## Purpose

Design the programmatic improvement system: the mechanism by which the runtime takes over improvement execution after forward pass closure, including the forward-pass-closed signal schema, the Component 4 redesign to support runtime context injection, and the runtime improvement orchestration logic.

This brief covers three design areas. The advisory must specify all three completely enough for parallel implementation by the Tooling Developer (Component 4) and the Runtime Developer (orchestration) without further design consultation.

---

## Background

Currently, after forward pass closure, the Owner agent manually initiates the backward pass — invoking Component 4, distributing findings, and sequencing role sessions. This is being replaced by runtime-owned improvement orchestration.

After forward pass closure, the runtime will present the user with three options:

1. **Graph-based improvement** — backward pass agents run in topological reverse order; each receives the meta-analysis instruction file plus findings from their direct successors in the forward pass graph, subject to a role-appearance check (see §2).
2. **Parallel improvement** — all backward pass agents receive only the meta-analysis instruction file and run simultaneously.
3. **No improvement** — record closes; no backward pass is run.

In both improvement cases, synthesis is always performed by a fresh Curator session receiving the synthesis instruction file plus all findings from all roles.

The improvement instruction document (`$GENERAL_IMPROVEMENT`) will be split into two files by the Curator as part of this flow: a meta-analysis guidance file and a synthesis guidance file. The runtime injects the appropriate file per phase. The new index variables for these files will be established by the Curator; assume the TA spec can reference them as `$GENERAL_IMPROVEMENT_META_ANALYSIS` and `$GENERAL_IMPROVEMENT_SYNTHESIS` (Curator to register final paths).

---

## Design Area 1: Forward-Pass-Closed Signal

The runtime currently detects handoff transitions via the machine-readable handoff block schema (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`). The Owner's forward pass closure artifact needs to emit a signal that the runtime recognizes as "forward pass complete, present improvement options."

**Design requirements:**
- The signal must be machine-readable and consistent with the existing handoff block schema.
- It must be unambiguous — the runtime must distinguish "forward pass closed, improvement pending" from a standard role-to-role handoff.
- It must carry the record folder path so the runtime knows where to find `workflow.md` and findings files.
- It must not require the Owner to specify which improvement mode was selected — that selection happens interactively after the runtime detects the signal.

**Deliverable:** Specify the schema for this signal: field names, types, placement, and how it extends or departs from the existing handoff block schema. If it requires a new handoff block type, define it. If it reuses existing fields with a distinguished value, specify those values exactly.

---

## Design Area 2: Component 4 Redesign

Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) currently computes backward pass traversal order and generates per-role session prompts. Its role is expanding: it now also needs to return per-role context injection requirements for the runtime's graph-based improvement mode.

**Current interface:** `orderWithPromptsFromFile(recordFolderPath, synthesisRole)` → `BackwardPassEntry[][]`

**New requirements:**
- For graph-based improvement: for each role in backward pass order, return the list of findings files the runtime should inject into that role's session. The rule is: inject findings from the role's **direct successors** in the forward pass graph, **excluding** any role (by role name, not node ID) that appeared at any earlier position in the forward pass graph than the current role.
- For parallel improvement: all backward-pass roles run simultaneously; no per-role filtering is needed. Component 4 still needs to return the full role list (without ordering) for the runtime to know which sessions to launch.
- The synthesis role always receives all findings files; no filtering applies to synthesis.
- Findings files are in the record folder following the current naming convention (`NN-[role]-findings.md` pattern). Component 4 should locate them by scanning the record folder for files matching this pattern, keyed to the role names in `workflow.md`.

**Design requirements:**
- Redesign the return type to carry, per role: the role name, the ordered position (for graph-based), the list of findings file paths to inject, and the step type (meta-analysis vs. synthesis).
- Specify the new function signature(s). Component 4 is now a runtime helper; it is not required to remain a standalone CLI-invocable tool, but if the interface changes significantly, specify whether the INVOCATION.md contract changes or is retired.
- Specify the role-appearance check algorithm precisely: given the forward pass graph in `workflow.md`, how is "appeared earlier in the forward pass" computed for roles that appear at multiple nodes (e.g., Owner at node 1 and node 7)?
- Specify failure behavior when a findings file expected for a role is absent from the record folder (agent did not produce findings, or naming convention drift).

**Deliverable:** New function signature(s), return type definition, role-appearance check algorithm with a worked example covering a repeated-role case, and findings-file location behavior.

---

## Design Area 3: Runtime Improvement Orchestration

The runtime needs a new improvement orchestration module that activates on detecting the forward-pass-closed signal.

**Flow:**
1. Detect forward-pass-closed signal from Owner closure artifact.
2. Present three options to user (graph-based / parallel / no improvement).
3. Based on selection:
   - **Graph-based:** invoke Component 4 for ordered role list + per-role context injection requirements; for each role in order, start a session injecting: role context, meta-analysis instruction file (`$GENERAL_IMPROVEMENT_META_ANALYSIS`), and the specified findings files; await completion and findings output before proceeding to next role.
   - **Parallel:** invoke Component 4 for full role list; start all sessions simultaneously, each injecting: role context and meta-analysis instruction file only; await all completions.
   - **No improvement:** record closes; log selection; no further sessions.
4. **Synthesis (graph-based and parallel):** after all meta-analysis sessions complete, start a fresh Curator session injecting: Curator role context, synthesis instruction file (`$GENERAL_IMPROVEMENT_SYNTHESIS`), and all findings files from the record folder.

**Design requirements:**
- Specify where in the runtime codebase this orchestration lives (new module, extension of orchestrator, or other).
- Specify how the runtime collects findings output from each meta-analysis session: does it await a specific artifact written to the record folder, a handoff block, or another signal?
- Specify how the runtime handles a meta-analysis session that does not produce a findings file (timeout, error, or skip behavior).
- Specify the state additions to `FlowRun` (or equivalent) needed to track improvement mode selection and per-role completion. Explicitly assess how these additions interact with the open **runtime persisted-state versioning** item (`a-society/a-docs/records/20260402-parallel-track-orchestration/13b-runtime-developer-findings.md` Finding 2) — do not design the new state without resolving whether it requires a persistence version bump.
- The synthesis session is always a **fresh** Curator session (new session, not resumed). Specify how the runtime enforces this.

**Deliverable:** Module placement, session lifecycle spec (start, context injection, completion detection, error handling), `FlowRun` state additions with persistence versioning assessment, and synthesis session enforcement.

---

## Files Changed

| File | Action |
|---|---|
| `tooling/src/backward-pass-orderer.ts` | Replace — Component 4 redesign per §2 |
| `tooling/INVOCATION.md` | Replace or retire — per TA spec on CLI contract |
| `tooling/test/backward-pass-orderer.test.ts` | Replace — tests for new interface and role-appearance check |
| `runtime/src/` (new or modified module) | Additive — improvement orchestration per §3 |
| `runtime/src/types.ts` | Modify — FlowRun state additions per §3 |
| `runtime/INVOCATION.md` | Modify — document new improvement orchestration entry points |

---

## Open Questions

None. The design areas are fully specified. The TA resolves the four known unknowns identified in the workflow plan (signal schema, Component 4 interface, FlowRun integration, persistence versioning assessment) as part of the advisory.
