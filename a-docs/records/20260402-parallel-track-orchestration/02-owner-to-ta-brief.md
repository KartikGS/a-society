**Subject:** Parallel Track Orchestration — TA Design Advisory
**Type:** Owner → Technical Architect Brief
**Date:** 2026-04-02
**Flow:** `20260402-parallel-track-orchestration`

---

## Context

The A-Society runtime currently tracks a single `currentNode: string` on `FlowRun`, making it structurally incapable of executing workflows with parallel tracks. The orchestrator's `advanceFlow` method, the handoff schema, and Component 4's backward pass ordering all assume a linear, single-active-node model. This flow redesigns the runtime and tooling to support arbitrary fork/join parallelism in workflow execution.

**Decisions already made (Owner direction — not open for TA redesign):**

1. The graph schema is unchanged — parallelism is inferred from topology (multiple outgoing edges = fork, multiple incoming edges = join). No `parallel: true` annotation.
2. `FlowRun.currentNode: string` is replaced with a multi-node tracking model (at minimum `activeNodes: string[]` + `completedNodes: string[]`).
3. The handoff schema (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`) is extended to support an array of handoff targets at fork points. The parser accepts both single-object (backward-compatible) and array forms.
4. The orchestrator is graph-driven for fork/join choreography: it reads outgoing edges to determine fork targets and checks incoming-edge completion for join activation.
5. Component 4's backward pass ordering is derived from the workflow graph structure (not flat node-list first occurrence), producing concurrent groups for parallel tracks.
6. Artifact sequencing uses `NNa-`/`NNb-` sub-labeling for concurrent artifacts at the same sequence position (already formalized in `$A_SOCIETY_RECORDS`).

---

## What the Advisory Must Cover

The advisory serves two implementation tracks that run in parallel after Owner approval:

- **Track A — Tooling Developer:** Component 4 graph-aware backward pass with concurrent group output.
- **Track B — Runtime Developer:** Orchestrator parallel track support, handoff parser extension, Tier 1 visualization.

The advisory must produce a single design specification that both tracks can implement from independently.

### §1 — FlowRun Type Redesign

Specify the exact type changes to `runtime/src/types.ts`:

- Replace `currentNode: string` with the multi-node tracking model.
- Define the join-tracking mechanism: is `activeNodes` + `completedNodes` sufficient, or is an additional structure (e.g., `pendingJoins: Record<string, string[]>`) needed?
- Specify the initial state when a flow starts (the first node in `activeNodes`).
- Specify what `FlowStatus` values mean in the context of multiple active nodes (e.g., `'awaiting_human'` when one of several active nodes is human-collaborative).

### §2 — Fork/Join Detection Algorithm

Specify the algorithm the orchestrator uses to:

- **Detect a fork:** When an agent at node X completes, and node X has multiple outgoing edges, how does the orchestrator activate all targets? Does it auto-fan-out from the graph, or does it match handoff blocks to edges?
- **Detect a join:** When an agent at node Y completes and hands off to node Z, and node Z has multiple incoming edges, how does the orchestrator determine whether all dependencies are satisfied?
- **Handle nested forks:** Verify that the algorithm handles a fork within a fork (e.g., `A → B, A → C, B → D, B → E, D → F, E → F, C → F`).
- **Edge case: fork with shared artifact:** When all fork targets receive the same artifact_path, is the orchestrator's behavior different from when they receive different artifacts?

### §3 — Handoff Schema Extension

Specify the exact schema change to the machine-readable handoff format:

- The new array form: what does it look like in the fenced `handoff` block?
- Backward compatibility: how does the parser distinguish single-object from array form?
- Validation: how does the orchestrator validate that the handoff targets match the outgoing edges in the graph?
- What happens if the agent emits a single handoff at a fork point? (Error? Auto-fan-out with the same artifact?)
- What happens if the agent emits an array handoff at a non-fork point? (Error? Ignored?)

### §4 — Orchestrator `advanceFlow` Restructuring

Specify the changes to `runtime/src/orchestrator.ts`:

- The new control flow of `advanceFlow` for fork, join, and linear cases.
- How `advanceFlow` is called for each active node — does the caller invoke it once per active node, or does a single call advance the entire flow?
- How join-node artifact aggregation works: when a join node activates with multiple input artifacts from completed tracks, how are they presented to the LLM? (Multiple `activeArtifactPath` values? Concatenated? A new parameter?)
- Terminal node detection: how does the flow know it's completed when there could be multiple active paths? (All active nodes are terminal? The single terminal node in the graph is reached?)
- Human-collaborative pause at a fork or join: what happens when one branch of a fork reaches a human-collaborative node while another branch is still running?

### §5 — Component 4 Concurrent Group Output

Specify the changes to `tooling/src/backward-pass-orderer.ts`:

- The new algorithm: how does Component 4 derive traversal order from the graph structure (edges) rather than flat node-list order?
- The output format: how are concurrent groups represented? Nested arrays (`string[][]`)? A `ConcurrentGroup` type? Each group runs in parallel; groups are sequential.
- How synthesis interacts with concurrent groups (synthesis is always the final step, not concurrent).
- The prompt generation changes: how do prompts direct agents to inspect the record folder for the next available sequence number instead of predicting filenames?

### §6 — Tier 1 Text Visualization

Specify a simple text-based flow status display:

- What information is shown: active nodes, completed nodes, pending joins, flow status.
- Where it is rendered: stdout via a utility function, or integrated into the orchestrator's advance loop.
- The format (ASCII box-drawing, simple list, or other).

### §7 — Files Changed

Provide a summary table of all files modified per track, with expected action (additive, replace, insert).

---

## Constraints

- The advisory must be implementable by the Tooling Developer and Runtime Developer independently — no cross-track implementation dependencies after the advisory is approved.
- All type changes must be backward-compatible with the existing `SessionStore` persistence model, or the advisory must explicitly scope `store.ts` changes.
- The handoff schema change is a breaking change for `$INSTRUCTION_MACHINE_READABLE_HANDOFF`. The advisory must note the impact classification implications but not pre-specify the classification (Curator determines this post-implementation per `$A_SOCIETY_UPDATES_PROTOCOL`).
- Component 4's current algorithm description in `$A_SOCIETY_TOOLING_INVOCATION` states the edges array is "not used for ordering today." The advisory must specify how Component 4 transitions from node-list-based to graph-based ordering without breaking the existing linear-workflow case.

---

## Open Questions for TA Resolution

1. Does `advanceFlow` need a fundamentally different calling convention for parallel flows (e.g., the caller specifies which active node to advance), or can the orchestrator determine this internally?
2. Should the orchestrator maintain per-track session state (separate `RoleSession` per track), or reuse the existing single-session-per-role model?
3. Is there a need for a flow-level lock or concurrency control if two tracks could theoretically be advanced simultaneously?
4. Should the Tier 1 visualization be a standalone command (`flow-status`) or integrated into the `advanceFlow` output?

---

## Deliverable

A single TA advisory artifact filed as `03-ta-to-owner.md` in the record folder. The advisory must cover §1–§7 with enough specificity that both implementation tracks can proceed without further TA consultation.

No proposal artifact is required before this advisory — the workflow plan topology goes directly from Owner to TA.
