# Owner Forward Pass Closure

## Forward Pass Closure Discipline

When a closing flow surfaces new Next Priorities items, add or merge those log entries in `$A_SOCIETY_LOG` before filing the forward pass closure artifact. The closure artifact should reflect the already-updated project state; it is not the step that leaves log maintenance for later.

**Accepted residual exceptions must be labeled at closure.** When a flow intentionally leaves a known document or section non-conformant to a newly adopted or clarified standard by approved deferral, state that status explicitly in the closure artifact as an accepted residual exception. Name the affected document/section and what remains deferred. Do not rely only on the corresponding Next Priorities entry; a reader of the closure artifact must be able to distinguish an approved exception from an implementation miss without reopening the decision history.

At forward pass closure, after the flow's changes are confirmed, the Owner sweeps Next Priorities entries whose target files or design areas overlap with the scope of the completed flow. The same four-case taxonomy applies (addressed, contradicted, restructured, partially addressed). Relevant entries are updated, narrowed, or removed before the closure artifact is filed.

**Structural rewrites require a standing-log taxonomy sweep.** When a flow renames or retires a standing role family, workflow, layer, executable surface, or other framework vocabulary, closure verification must include `$A_SOCIETY_LOG`'s own standing text, not just overlapping Next Priorities items. Verify `## Scope Tags`, `## Entry Lifecycle`, and `## Current State` for stale terminology before declaring the forward pass closed.

**Executable-layer API removals require cross-consumer verification.** When an executable-development flow removes, renames, or deprecates a public function, exported type, CLI entry point, or other consumed executable-layer interface, closure verification must include a sweep of in-repo consumers across `runtime/` and any still-live legacy executable implementation paths (including `tooling/` when present) before the forward pass is declared closed. Do not treat the edited file or local test target as sufficient verification when another executable consumer may still import or invoke the retired surface.

**Closure artifact numbering uses sequence slots, not raw file count.** Before naming a forward-pass closure artifact, read the active record folder and identify the next available numeric slot from the actual sequence positions. Sub-labeled artifacts such as `02a` / `02b` share slot `02`; they do not consume additional whole-number positions. Do not derive the closure artifact number by counting filenames.

**Multi-track path portability.** For flows with multiple parallel tracks, verify at closure that all track convergence artifacts (e.g., completion artifacts filed by non-Curator roles) do not contain machine-specific absolute paths or `file://` URLs. Confirming functional completeness is not sufficient — handoff artifact format portability must also be confirmed. A `file://` path in a terminal track artifact violates the path portability rule even if the path was not used for routing.

**Update-report path naming.** When a forward pass closure artifact instructs the Curator to publish a framework update report, specify the filename using the `$A_SOCIETY_UPDATES_PROTOCOL` contract: `[YYYY-MM-DD]-[brief-descriptor].md` within `$A_SOCIETY_UPDATES_DIR`. A date-only filename is non-compliant with the programmatic parsing contract and will be ignored by the executable update-comparison capability.
