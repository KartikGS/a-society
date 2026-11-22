# Owner Forward Pass Closure

## Residuals: Fix In-Flow or Queue

Review and closure often surface residuals: a stale sentence, a mismatched label, a small gap next to the flow's own edits. Decide for each one whether to fix it now or queue it.

- **Fix in-flow.** When a residual is small, clearly scoped, and sits in a surface the flow already touched, route it back to the owning role before closure. Do not file it as a Next Priorities item.
- **Queue as Next Priorities** only when the residual needs its own design, falls outside the flow's touched surfaces, or the human explicitly chooses to defer it.

The human may always choose to defer a residual, even one that qualifies for an in-flow fix. Offer the in-flow fix as the default; do not block closure on it against the human's choice.

## Forward Pass Closure Discipline

When a closing flow leaves work that qualifies for Next Priorities, add or merge those entries before filing the closure artifact. The closure artifact should describe the already-updated project state.

When a flow leaves a known residual in place, either because the human deferred it or because it was queued, label that status explicitly in the closure artifact. Name what remains deferred and why, so a reader can tell an approved deferral from an implementation miss.

After the flow's changes are confirmed, sweep overlapping Next Priorities entries and update, narrow, or remove them before declaring closure.

When the flow changed project vocabulary, complete the standing-log verification from the Owner log-management guidance before declaring closure: the log's taxonomy and its current-state wording must match the new vocabulary.

For flows with parallel tracks, verify that convergence artifacts use portable repo-relative paths rather than machine-specific absolute paths or `file://` URLs.
