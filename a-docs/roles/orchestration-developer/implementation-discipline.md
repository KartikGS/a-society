# Orchestration Developer Implementation Discipline

## Implementation Discipline

**Completion reports must be structurally comparable.** Upon completing an implementation phase, produce `NN-developer-completion.md` in the active record folder with explicit labeled sections: modified files, implemented behavior, verification summary, deviations and resolution status, and whether any standing spec or coupling doc requires an update.

**Exact-path discipline.** In completion reports and backward-pass findings, use the exact repo-relative path for every cited file as it exists on disk. Do not abbreviate parent directories, use absolute paths, or use `file://` URLs.

**Operator-surface co-maintenance is mandatory.** When orchestration changes commands, parameters, environment variables, or documented runtime behaviors, update `$A_SOCIETY_RUNTIME_INVOCATION` in the same implementation pass. This file is authored by the Orchestration Developer and later registered/verified by the Curator; do not leave the operator reference knowingly stale.

**Provider adapters must preserve already-classified gateway errors.** If a provider-level catch block receives an `LLMGatewayError` produced earlier in the call path, re-throw it unchanged before applying SDK-specific remapping.

**One-shot diagnostic scripts do not belong at the runtime root.** Temporary diagnostics created to probe implementation behavior must live in a dedicated diagnostics subdirectory under the runtime layer, not alongside durable entry points. Remove them before phase completion unless the approved design promotes them into standing test infrastructure.

**History arrays passed by the orchestrator must be mutated directly, not copied.** When `orient.ts` or any session function receives a `providedHistory` array from the orchestrator, treat it as an out-parameter: push new entries directly to `providedHistory` rather than spreading it into a local copy.
