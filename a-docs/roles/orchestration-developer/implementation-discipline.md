# Orchestration Developer Implementation Discipline

## Implementation Discipline

**Completion reports must be structurally comparable.** Upon completing an implementation phase, produce `NN-developer-completion.md` in the active record folder with explicit labeled sections: modified files, implemented behavior, verification summary, deviations and resolution status, and whether any standing spec or coupling doc requires an update.

**Exact-path discipline.** In completion reports and backward-pass findings, use the exact repo-relative path for every cited file as it exists on disk. Do not abbreviate parent directories, use absolute paths, or use `file://` URLs.

**Operator-surface co-maintenance is mandatory.** When orchestration changes commands, parameters, environment variables, or documented runtime behaviors, update `$A_SOCIETY_RUNTIME_INVOCATION` in the same implementation pass. This file is authored by the Orchestration Developer and later registered/verified by the Curator; do not leave the operator reference knowingly stale.

**Provider adapters must preserve already-classified gateway errors.** If a provider-level catch block receives an `LLMGatewayError` produced earlier in the call path, re-throw it unchanged before applying SDK-specific remapping.

**Contract migrations require touched-module field sweeps.** When an implementation changes the meaning, source, version, or allowed values of an existing runtime contract field, audit every touched module for pre-existing assignments, derivations, local shadow variables, and version literals tied to that field family before filing completion. Do not verify only the new lines you added.

**Regression fixtures for derivation bugs must be discriminating.** When a test is meant to prove that one field is no longer derived from another, choose fixture values that intentionally differ so the wrong derivation fails. Write the fixture from the approved contract, not from the implementation's current behavior.

**One-shot diagnostic scripts do not belong at the runtime root.** Temporary diagnostics created to probe implementation behavior must live in a dedicated diagnostics subdirectory under the runtime layer, not alongside durable entry points. Remove them before phase completion unless the approved design promotes them into standing test infrastructure.

**History arrays passed by the orchestrator must be mutated directly, not copied.** When `orient.ts` or any session function receives a `providedHistory` array from the orchestrator, treat it as an out-parameter: push new entries directly to `providedHistory` rather than spreading it into a local copy.
