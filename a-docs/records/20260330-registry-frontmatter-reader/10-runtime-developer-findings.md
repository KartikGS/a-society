# Backward Pass Findings: Runtime Developer — registry-frontmatter-reader

**Date:** 2026-03-30
**Task Reference:** registry-frontmatter-reader
**Role:** Runtime Developer
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **None.** The transition from static registry to dynamic loading was well-specified in the TA advisory.

### Missing Information
- **None.** However, the exact benchmark for `projectRoot` in `paths.ts` and `registry.ts` (e.g., "must be the directory containing `a-society/`") was discovered via friction rather than stated rule. This is a minor surfacing gap.

### Unclear Instructions
- **None.**

### Redundant Information
- **Role Doc Context Loading (YAML vs Prose):** Every role document (e.g., `runtime-developer.md`, `curator.md`) now contains identical required-reading lists in two locations: the YAML frontmatter (for the runtime) and the `Context Loading` prose section (for the human/agent orientation). This duplication creates a long-term synchronization risk where the runtime may load a different context than the agent believes they have been assigned.

### Scope Concerns
- **None.**

### Workflow Friction
- **Latent Utility Fragility (The `paths.ts` Regex Bug):** The transition to dynamic context resolution exposed a critical bug in `resolveVariableFromIndex()` (discovery 05). The regex `[\$A_Z_0-9]` was missing a hyphen, preventing matching of most variables (e.g., `$A_SOCIETY_AGENTS`). 
    * **Why wasn't this caught earlier?** In the static registry model, the runtime did not rely on `resolveVariableFromIndex()` to find the core orientation docs at session start—those paths were effectively hardcoded or resolved once. When the runtime became dependent on the index for *all* session-mandatory loads, the latent utility bug became a hard blocker.
    * **Root Cause:** Moving from "de-risked" static data to dynamic resolution requires treating the underlying utilities as high-priority failure points.

---

## Top Findings (Ranked)

1. **Latent Utility Fragility** — Switching to dynamic state exposed a critical regex bug in `paths.ts` that was previously masked by static hardcoding. Dynamic transitions mandate a "utility-first" validation sweep.
2. **Role Doc Redundancy** — Prose `Context Loading` sections and YAML `required_reading` blocks are redundant and prone to drift. A single machine-readable source that the prose references is preferred.
3. **Implicit Frontmatter Purpose** — As noted by the Curator, the lack of prose labels for the frontmatter blocks in `agents.md` makes them vulnerable to accidental deletion or corruption during manual a-docs maintenance.

---

Next action: Meta-analysis (backward pass step 3 of 5)
Read: [10-runtime-developer-findings.md](file:///home/kartik/Metamorphosis/a-society/a-docs/records/20260330-registry-frontmatter-reader/10-runtime-developer-findings.md), then [### Meta-Analysis Phase](file:///home/kartik/Metamorphosis/a-society/general/improvement/main.md#L140) in $GENERAL_IMPROVEMENT
Expected response: Findings artifact (11-owner-findings.md)
