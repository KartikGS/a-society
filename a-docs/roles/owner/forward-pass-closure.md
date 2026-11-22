# Owner Forward Pass Closure

## Forward Pass Closure Discipline

When a closing flow surfaces new Next Priorities items, add or merge those log entries in `$A_SOCIETY_LOG` before filing the forward pass closure artifact. The closure artifact should reflect the already-updated project state; it is not the step that leaves log maintenance for later.

**Fix small residuals in-flow; do not file them.** When review or closure surfaces a small, clearly scoped residual in a surface this flow already touched, such as a stale sentence or a mismatched label, route a backward correction to the owning role before closing instead of filing a Next Priorities item. File Next Priorities only for work that needs its own design, falls outside the flow's touched surfaces, or that the human chooses to defer. The human may always defer a residual; honor that choice, and do not hold closure on an in-flow fix the human declined.

**Accepted residual exceptions must be labeled at closure.** When a flow intentionally leaves a known document or section non-conformant to a newly adopted or clarified standard by approved deferral, state that status explicitly in the closure artifact as an accepted residual exception. Name the affected document/section and what remains deferred. Do not rely only on the corresponding Next Priorities entry; a reader of the closure artifact must be able to distinguish an approved exception from an implementation miss without reopening the decision history.

At forward pass closure, after the flow's changes are confirmed, the Owner sweeps Next Priorities entries whose target files or design areas overlap with the scope of the completed flow. The same four-case taxonomy applies (addressed, contradicted, restructured, partially addressed). Relevant entries are updated, narrowed, or removed before the closure artifact is filed.

**Vocabulary changes require a standing-log sweep.** When a flow adds, renames, or retires a role family, workflow, layer, executable surface, or other project vocabulary, or changes a count or version scheme the log states, closure verification must include `$A_SOCIETY_LOG`'s own standing text, not just overlapping Next Priorities items. Run the Standing-Log Sweep in `$A_SOCIETY_OWNER_LOG_MANAGEMENT` before declaring the forward pass closed.

**Executable-layer API removals require cross-consumer verification.** When an executable-development flow removes, renames, or deprecates a public function, exported type, CLI entry point, or other consumed executable-layer interface, closure verification must include a sweep of in-repo consumers across `runtime/` and any still-live legacy executable implementation paths (including `tooling/` when present) before the forward pass is declared closed. Do not treat the edited file or local test target as sufficient verification when another executable consumer may still import or invoke the retired surface.

**Closure artifacts use descriptive names.** Name the closure artifact for the closed flow or closure purpose, and cite its exact repo-relative path when the flow is closed. Name it in the `forward-pass-closed` signal's optional `artifact_path` so the operator can open it from the closure approval prompt.

**Multi-track path portability.** For flows with multiple parallel tracks, verify at closure that all track convergence artifacts (e.g., completion artifacts filed by non-Curator roles) do not contain machine-specific absolute paths or `file://` URLs. Confirming functional completeness is not sufficient — handoff artifact format portability must also be confirmed. A `file://` path in a terminal track artifact violates the path portability rule even if the path was not used for routing.
