# A-Society Framework Update — 2026-04-09

**Framework Version:** v33.0
**Previous Version:** v32.1

## Summary

A-Society's standing executable model has been unified. The framework no longer presents a separate public tooling layer alongside the runtime; instead, deterministic helper operations are treated as executable capabilities inside one executable layer, with `runtime/INVOCATION.md` as the sole default operator-facing executable reference.

Projects that copied A-Society's public tooling variables, old executable role names, or direct tooling-invocation guidance should review those surfaces and update them where needed.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 3 | Gaps or contradictions in your current `a-docs/` or A-Society-facing references — Curator must review |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### 1. Public A-Society executable references now resolve through one executable surface

**Impact:** Breaking
**Affected artifacts:** `a-society/index.md`, `a-society/a-docs/indexes/main.md`, `a-society/a-docs/workflow/main.md`, `a-society/a-docs/workflow/executable-development.md`, `a-society/runtime/INVOCATION.md`, `a-society/tooling/INVOCATION.md`
**What changed:** A-Society retired the standing public tooling/runtime split. The public tooling workflow row was removed, the runtime invocation document was rewritten as the sole default operator-facing executable reference, and the permanent workflow surface now routes executable implementation through `workflow/executable-development.md`.
**Why:** The prior public surface kept two overlapping executable stories alive. That created contradictory operator guidance and preserved a tooling/runtime split that the framework no longer considers a standing boundary.
**Migration guidance:** If your project copied A-Society's public executable references into local orientation docs, indexes, or workflow routing, review whether you still expose both a tooling surface and a runtime surface by default. If one of those surfaces is only an internal implementation detail, retire the extra public rows and route agents to a single default operator-facing executable reference instead. Update any workflow-routing text that still assumes separate tooling-development and runtime-development permanent workflows.

---

### 2. A-Society executable role examples now use Framework Services Developer and Orchestration Developer

**Impact:** Breaking
**Affected artifacts:** `a-society/a-docs/roles/required-readings.yaml`, `a-society/general/instructions/roles/required-readings.md`, `a-society/general/instructions/communication/coordination/machine-readable-handoff.md`
**What changed:** A-Society replaced the standing `Tooling Developer` / `Runtime Developer` split with `Framework Services Developer` / `Orchestration Developer`. The role-key examples in the required-readings instruction and the fork-point handoff example were updated to match.
**Why:** The old names encoded the retired executable split and no longer matched the framework's standing execution model.
**Migration guidance:** Review your project's `agents.md`, `roles/required-readings.yaml`, workflow docs, and any worked handoff examples only if you copied A-Society's executable role names or key examples directly. If your project already uses different role names, no rename is required; just make sure your examples and required-reading keys do not preserve the retired A-Society naming model by accident.

---

### 3. Shared instructions now describe executable capabilities with manual fallbacks instead of A-Society-specific tooling invocations

**Impact:** Breaking
**Affected artifacts:** `a-society/general/instructions/consent.md`, `a-society/general/instructions/a-society-version-record.md`, `a-society/general/instructions/indexes/main.md`, `a-society/general/instructions/workflow/graph.md`, `a-society/general/instructions/workflow/modify.md`, `a-society/general/instructions/workflow/complexity.md`, `a-society/general/instructions/records/main.md`, `a-society/agents/initializer.md`, `a-society/a-docs/updates/protocol.md`
**What changed:** These instructions no longer tell agents to invoke standalone A-Society tooling helpers by public variable name for consent creation, update comparison, index validation, workflow ordering, or scaffolding. They now describe project-owned executable capabilities generically and keep the manual fallback path explicit. The update-report protocol still preserves the concrete rule that the code implementing the executable update-comparison capability must be updated concurrently when its stable contract changes.
**Why:** The old wording leaked A-Society implementation details into reusable instructions and implied that every helper capability should remain a separate operator-facing tool. That contradicted the unified executable model and made adopting-project guidance less portable.
**Migration guidance:** Review any local instructions, onboarding notes, or role files that were instantiated from older A-Society guidance for direct `$A_SOCIETY_TOOLING_*` references or prose telling agents to run standalone helper executables solely because A-Society did. Replace those with your own project-specific executable capability wording, and keep the manual fallback path explicit wherever the capability may be unavailable. If your project copied A-Society's update-report contract wording, confirm that its co-maintenance rule still points concretely to the code implementing your update-comparison capability.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
