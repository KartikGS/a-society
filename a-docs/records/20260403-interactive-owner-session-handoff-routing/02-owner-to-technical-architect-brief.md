# Owner to Technical Architect Brief

**Date:** 2026-04-03
**Subject:** Interactive Owner session -> orchestrator handoff routing

## Objective
The `a-society` binary and `orient` command begin an interactive Owner session. However, when the Owner session exits after emitting a machine-readable handoff, the flow does not automatically advance. We need to wire this interactive process exit into the orchestrator. The runtime should auto-detect the handoff block from the session output, inspect the workflow graph, and route to the next node (launching autonomous execution if the next node is not a `human-collaborative` node).

## Scope
- Target files likely include `runtime/src/cli.ts`, `runtime/bin/a-society.ts`, and `runtime/src/orchestrator.ts`.
- Focus purely on capturing the emitted handoff block effectively and transitioning into dynamic orchestration.
- Component 8 (the machine-readable handoff validator) is listed in Next Priorities but is not yet implemented. Please handle the block parsing robustly enough to support this targeted runtime feature without attempting to build out the full Component 8 schema validation framework prematurely.

## Requirements
Please provide a Phase 0 architecture design advisory covering:
1. **Process Output Capture:** How the interactive shell process can robustly yield the final handoff block without brittle string scraping.
2. **Orchestrator Connection:** How we transition the process logic from the `orient` session directly into `resume-flow`/`advanceFlow`.
3. **Internal Interface Changes:** Explicit specifications for how the parameters or return types of `orient.ts`, `orchestrator.ts`, or `cli.ts` functions must change.
4. **Integration Test Strategy:** How the Dev should mechanically write an integration verification test for this without a rigid mock framework.

## Open Questions
- Is parsing stdout the most robust path for this runtime integration, or should the interactive process write the handoff to a file/pipe for deterministic inter-process communication?
- Does this routing need to support parallel track array forms directly, or is a simple single-target jump sufficient for the interactive Owner entry path currently?

Please execute the TA Phase 0 Advisory phase based on `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`.
