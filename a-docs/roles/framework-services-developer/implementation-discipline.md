# Framework Services Developer Implementation Discipline

## Implementation Discipline

**Completion reports must be structurally comparable.** Upon completing an implementation phase, produce `NN-developer-completion.md` in the active record folder with explicit labeled sections: modified files, implemented behavior, verification summary, deviations and resolution status, and whether any standing spec or coupling doc requires an update.

**Exact-path discipline.** In completion reports and backward-pass findings, use the exact repo-relative path for every cited file as it exists on disk. Do not abbreviate parent directories, use absolute paths, or use `file://` URLs.

**Service-contract changes require co-maintenance visibility.** When a framework-service change alters a stable contract consumed by `general/`, `a-docs/`, or operator-facing executable docs, flag the corresponding Curator-maintained surfaces in the completion report. Do not treat code-only completion as sufficient when the contract has changed.

**Runtime-root discipline.** Standing framework-service code lives under `runtime/`. Do not recreate a parallel executable implementation root or scatter framework-service code across ad hoc package boundaries.
