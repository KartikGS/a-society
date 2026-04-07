# Runtime Developer Implementation Discipline

## Implementation Discipline

**Provider adapters must preserve already-classified gateway errors.** If a provider-level catch block receives an `LLMGatewayError` produced earlier in the call path, re-throw it unchanged before applying SDK-specific remapping. Do not re-wrap a classified gateway error into `UNKNOWN` or another provider-specific code.

**One-shot diagnostic scripts do not belong at the runtime root.** Temporary diagnostics created to probe implementation behavior must live in a dedicated diagnostics subdirectory under the runtime layer, not alongside the layer's durable entry points. Remove them before phase completion unless the approved design promotes them into standing test infrastructure.

**History arrays passed by the orchestrator must be mutated directly, not copied.** When `orient.ts` or any session function receives a `providedHistory` array from the orchestrator, treat it as an out-parameter: push new entries directly to `providedHistory` rather than spreading it into a local copy. The orchestrator depends on mutations to `providedHistory` being reflected in its own reference for session persistence — spreading into a local copy severs this reference and causes history loss on abort or session close. This contract is not inferable from type signatures alone; it is an out-parameter requirement imposed by the persistence architecture.
