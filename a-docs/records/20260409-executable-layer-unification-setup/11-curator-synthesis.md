# Backward Pass Synthesis: 20260409-executable-layer-unification-setup

**Date:** 2026-04-09
**Task Reference:** `20260409-executable-layer-unification-setup`
**Role:** Curator (Synthesis)
**Depth:** Full

---

## Findings Review

### Curator Findings (`09-curator-findings.md`)

**Finding 1 — the first proposal required an avoidable revise loop.** Actionable. The direct A-Society fix belongs in `$A_SOCIETY_CURATOR_IMPL_PRACTICES`: structural rewrites now require a proposal-stage propagation sweep rather than a primary-surface-only scope assumption. The reusable counterpart was routed to a new `Structural-rewrite propagation and standing-log verification guidance` item in `$A_SOCIETY_LOG`.

**Finding 2 — no standing compiled-output policy exists for tracked `runtime/dist/` artifacts.** Actionable, but not a direct `a-docs/` maintenance fix. Choosing whether `runtime/dist/` stays tracked, is regenerated, or is removed remains an executable-layer policy decision. No duplicate synthesis item was created because the follow-up already exists in `$A_SOCIETY_LOG` as `Executable compiled-output policy (runtime/dist/)`.

**Finding 3 — Curator guidance lacked a mandatory stale-term sweep for structural renames.** Actionable. Implemented directly in `$A_SOCIETY_CURATOR_IMPL_PRACTICES`: structural rewrites now require a retired-term sweep across adjacent active guides, support docs, operator references, examples, and tests before implementation/registration closes. The reusable counterpart was routed to the same new framework-level log item.

### Owner Findings (`10-owner-findings.md`)

**Finding 1 — no standing compiled-output policy exists for tracked `runtime/dist/` artifacts.** Endorsed and already routed. No duplicate action was taken beyond confirming that `$A_SOCIETY_LOG` already carries the follow-up item created at forward-pass closure.

**Finding 2 — the project log's own standing taxonomy was easy to miss during the structural rewrite.** Actionable. Implemented directly in `$A_SOCIETY_OWNER_LOG_MANAGEMENT` and `$A_SOCIETY_OWNER_CLOSURE`: structural rewrites now require an explicit sweep of `$A_SOCIETY_LOG`'s standing taxonomy and current-state surfaces, not only overlapping Next Priorities entries. The reusable counterpart was routed to the new `Structural-rewrite propagation and standing-log verification guidance` item in `$A_SOCIETY_LOG`.

**Finding 3 — the first proposal's revise loop reflected missing propagation checks.** Endorsed and already covered by Curator Finding 1. No separate routing was created.

**Finding 4 — structural rename flows need a mandatory retired-term sweep across adjacent guide/example/test surfaces before closure.** Endorsed and already covered by Curator Finding 3 plus the new Owner closure/log sweep rules. No duplicate routing was created.

---

## Actions Taken

### Direct Implementation

**`$A_SOCIETY_CURATOR_IMPL_PRACTICES` — structural-rewrite proposal and implementation safeguards.** Added two standing rules: one requiring proposal-stage propagation mapping across still-live support docs, guides, operator references, examples, and tests before submitting a structural rewrite, and one requiring an implementation/registration retired-term sweep across those adjacent active surfaces before closing the pass.

**`$A_SOCIETY_OWNER_LOG_MANAGEMENT` — structural-rewrite log-surface sweep.** Added an explicit rule that when a flow renames or retires standing framework vocabulary, `$A_SOCIETY_LOG` must be treated as an affected standing surface. The Owner now checks `## Scope Tags`, `## Entry Lifecycle`, and `## Current State`, and is told to surface likely log-taxonomy edits as early as intake when visible.

**`$A_SOCIETY_OWNER_CLOSURE` — closure-time standing-log verification.** Added a closure discipline rule requiring the Owner to verify `$A_SOCIETY_LOG`'s standing taxonomy and current-state wording when a flow changes standing role, workflow, layer, or executable-surface terminology.

### Next Priorities

**Existing item retained: `Executable compiled-output policy (runtime/dist/)`.** No merge or duplicate item was needed. The compiled-output gap remains an executable policy decision outside direct synthesis authority, and the standing follow-up was already filed at forward-pass closure.

**New item added: `Structural-rewrite propagation and standing-log verification guidance`.** Routed the reusable follow-up for this backward pass to a future Framework Dev flow. The new item covers the reusable Curator-side propagation and retired-term-sweep rules plus the reusable Owner-side standing-log taxonomy verification rule.

---

## Flow Status

Backward pass complete. All actionable `a-docs/` findings from this flow were implemented directly during synthesis, and the reusable follow-up work was routed through `$A_SOCIETY_LOG` without duplicating the already-filed executable compiled-output policy item. No further handoff is required.
