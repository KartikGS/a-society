# A-Society Runtime Invocation

The A-Society runtime architecture executes all behavior dynamically utilizing emergent execution models exclusively. There are no longer CLI node overrides or specific resume commands.

## Initiating a Session

An Owner bootstraps an execution session exclusively utilizing the singular CLI command:

```bash
a-society
```
*(Optionally you can run `npm run a-society` inside the runtime folder or install globally.)*

When invoked:
1. The orchestrator scans the filesystem to identify initialized A-Society projects.
2. The user selects the active project interactive workspace.
3. The orchestrator accesses the existing `.state/flow.json` to resume where the project left off. If no active flow is present, it initiates the **Owner** bootstrapping session via `runInteractiveSession`.
4. The user outlines expectations and tracks state directly via logs and interactive chatting.

## Progression and Automation

When an active conversational node emits a formalized `handoff` YAML block, the runtime identifies it via `HandoffInterpreter.parse`, persisting tracking markers into `.state/flow.json`. The orchestrator terminates the conversational loop immediately natively, processing workflow transitions against `workflow.md`, evaluating dependencies, and recursively launching the target successors automatically.

The system treats interactive sessions and automated background executions symmetrically as nodes seamlessly passing the orchestration token linearly securely.
