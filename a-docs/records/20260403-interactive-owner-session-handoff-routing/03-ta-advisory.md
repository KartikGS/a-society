# Phase 0 Architecture Design Advisory
**Subject:** Unified Interactive & Orchestration Layer
**Role:** Technical Architect

## 1. Unified Execution Paradigm
The artificial boundaries between "initial orientation chats," "autonomous orchestration," and "human-collaborative pauses" are completely eliminated. There is only one execution model: **the conversational loop**.

You are absolutely right: the runtime should not enforce an arbitrary check for a `human-collaborative` flag to decide if a user is allowed to intervene. 
- **Every node executes as an interactive session by default.** 
- If an agent has all the context it needs, it will generate its reasoning, execute its instructions, and emit a structured handoff block on turn 1. The loop detects the handoff instantly, closes the session, and the orchestrator seamlessly routes to the next node. (This manifests as "autonomous" execution).
- If an agent encounters an edge case, has doubts, or specifically requires human review, it generates a conversational reply instead of a handoff. The orchestrator detects there was no handoff and simply leaves the input prompt open. The user reads the question, types a reply, and the cycle continues until the agent is satisfied and yields the handoff block. (This manifests as "human-collaborative" execution).
- Autonomy is no longer an orchestration-level hardcoded rule; it is emergent behavior dictated dynamically by the agent's confidence.

*Note: The `human-collaborative: "yes"` tag in `workflow.md` will remain as a useful informational planning marker for owners reading the graph, but the runtime orchestrator will safely ignore it, treating every node equally.*

## 2. Process Output and Loop Control
Because node execution occurs within the same active process, the runtime relies on asynchronous promise resolution rather than inter-process communication:
- The existing `orient.ts` module is refactored into a general-purpose `runInteractiveSession` function.
- It manages the standard `readline` CLI chat loop but adds a critical hook: after every LLM `executeTurn`, it silently applies `HandoffInterpreter.parse(streamResponse)`.
- Overcoming a caught `HandoffParseError` simply means the response was standard conversational text, and the interactive loop awaits user input.
- A functional parse triggers automatic loop termination, outputs `"Handoff detected. Transitioning node..."`, terminates the IO interface, and resolves the `HandoffTarget[]`.

## 3. Orchestrator Connection
The `FlowOrchestrator` abstracts away fragmentation by defining graph traversal purely around returned handoffs:
1. **The Universal Node Runner:** The orchestrator iterates through active nodes. It opens `runInteractiveSession()`. 
2. **Bootstrapping (`owner-intake`):** When the initial Owner session concludes, there is no `.state/flow.json`. The orchestrator inspects the returned handoff, automatically traces `handoffs[0].artifact_path` upward to locate the newly created `workflow.md`, initializes the formal programmatic track, marks the initial state complete, and automatically continues standard traversal.
3. **Continuous Traversal:** When a node resolves its interactive Promise array by yielding handoffs, the abstracted `applyHandoffAndAdvance(flowRun, nodeId, handoffs)` safely plots the fork/join state. The orchestrator loops, launching `runInteractiveSession` for the newly activated target node immediately.

## 4. Internal Interface Changes
The following strict signatures represent the required implementation boundaries:
- `export async function runInteractiveSession(workspaceRoot: string, roleKey: string, systemPrompt?: string, history?: RuntimeMessageParam[], inputStream: NodeJS.ReadableStream = process.stdin, outputStream: NodeJS.WritableStream = process.stdout): Promise<HandoffTarget[] | null>` (in `orient.ts` – renamed `runOrientSession`).
- `public async applyHandoffAndAdvance(flowRun: FlowRun, nodeId: string, handoffs: HandoffTarget[]): Promise<void>` (in `orchestrator.ts`).
- `public async startUnifiedOrchestration(workspaceRoot: string, roleKey: string): Promise<void>` (in `orchestrator.ts` — replaces isolated arbitrary CLI routes and cascades continuously).

## 5. Integration Test Strategy
The Runtime Developer will write a focused deterministic integration module avoiding rigid framework assumptions (e.g. `tests/integration/unified-routing.test.ts`):
1. Circumvent actual LLM latency by pointing `process.env.LLM_BASE_URL` deterministically toward a local `node:http` mock instance.
2. Provide a pre-constructed `workflow.md` graph with two identical nodes.
3. Replace user CLI IO via threaded `PassThrough` streams across `inputStream`.
4. Mock the LLM to reply with a question on Turn 1 (testing conversational suspension), receive mocked stream input, and reply with a valid YAML handoff on Turn 2 (testing graph cascade). Validate `.state/flow.json` accurately transitions exactly one node forward.

## 6. Dependencies and Constraints
- Formatting dependencies are bound firmly to explicit `HandoffParseError` tracking.
- The `workflow.yaml` specification regarding `human-collaborative` states requires no schema deprecation, as it transitions cleanly to an informational visual tag.

## 7. Files Changed Table

| File | Change Description |
|---|---|
| `runtime/src/orient.ts` | Rename `runOrientSession` to `runInteractiveSession`. Adapt signature parameters absorbing optional pre-compiled `systemPrompt` and `history` tracking payload injections to support cross-node execution natively. Modify `readline` cycle behavior substituting baseline process termination for graceful Promise resolution upon detecting valid `HandoffTarget[]` structures. Thread IO dynamically for functional tests. |
| `runtime/src/orchestrator.ts` | Extricate `applyHandoffAndAdvance(flowRun, nodeId, handoffs)` logic safely encapsulating graph trajectory validation. Substantially modify `advanceFlow()` stripping away LLM specific execution calls entirely; re-routing it to initialize `runInteractiveSession()` directly as the exclusive executor for ALL nodes. Incorporate native `startUnifiedOrchestration()` managing unmapped origin states (`owner-intake`), recursively looping target evaluations until all dependencies conclude successfully cleanly in terminal output. |
| `runtime/src/cli.ts` | Remove segregated standalone node triggering. Subsume invocation chains strictly mapping toward `startUnifiedOrchestration` simplifying execution predictably. |
| `runtime/bin/a-society.ts` | Adjust execution initialization relying exclusively upon `orchestrator.startUnifiedOrchestration(workspaceRoot, roleKey)` handling native session discovery and unbounded chat teardown structurally automatically. |
