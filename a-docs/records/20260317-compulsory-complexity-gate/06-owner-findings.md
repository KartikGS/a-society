**Subject:** Compulsory complexity gate — Owner backward-pass findings
**Flow:** 20260317-compulsory-complexity-gate
**Date:** 2026-03-17

---

## Findings

### 1. The general Owner role template needs the same gate — route as next trigger

The Curator correctly identified that `$GENERAL_OWNER_ROLE` is now out of sync. This is the distributable template any adopting project uses to instantiate their Owner role. It references complexity analysis as prose guidance but has no artifact requirement and no gate. This is exactly the structural gap this flow was designed to close — it now exists in the distributable version.

This warrants a `general/` update. The pattern generalises fully: any project using the framework and the complexity instruction needs the same Phase 0 gate in their Owner role. This is not A-Society-specific. The update should introduce a `$[PROJECT]_COMM_TEMPLATE_PLAN` reference in the general template's workflow routing section and post-confirmation protocol.

**Route as next trigger.** The Curator assessed this as requiring the standard proposal → review path. It is low-complexity — targeted edits to one `general/` file, no open questions about what changes.

### 2. `$INSTRUCTION_WORKFLOW_COMPLEXITY` template reference — route as next trigger

The complexity instruction describes the plan artifact in prose but does not point to the template. Now that `$A_SOCIETY_COMM_TEMPLATE_PLAN` exists, the instruction should reference it. An Owner reading the instruction cold will understand what to produce but will have to discover the template separately.

**Route as next trigger.** The Curator assessed it correctly: small, clean, no judgment calls. Straightforward Tier 2 flow — Curator proposes, Owner reviews.

### 3. `agents.md` roles table still says "Node.js" for the Tooling Developer

The `20260316-tooling-ts-migration` flow updated `tooling-developer.md`, `architecture.md`, `tooling-architecture-addendum.md`, and `INVOCATION.md`. It did not update `agents.md` line 28, which still reads:

> Implementing approved tooling components in Node.js — spec-faithful execution within `tooling/`

This is drift — the summary description in the roles table entry is now stale. A small fix: "in Node.js" → "in TypeScript". This was missed in the prior flow's backward pass.

**Route as next trigger.** Tier 1 — Owner executes directly, no Curator brief needed. One line in one file, no shared artifact impact, easily reversible.

### 4. The TA track is still open

The APPROVED decision for this flow noted a subsequent TA track: after Phase 4 registration is complete, the Owner directs the TA to scope the tooling enforcement mechanism. The approved plan artifact format and the validator requirements from OQ1 are the TA's inputs.

This is not a backward pass finding — it is a pending action from the decision artifact. Naming it here so it surfaces explicitly at synthesis and is not silently deferred.

### 5. This flow validated the gate it introduced

The flow that introduced the Phase 0 requirement was itself run with a Phase 0 plan artifact (`01-owner-workflow-plan.md`) — the mechanism was demonstrated in the act of building it. The plan was complete, all five axes assessed, tier correctly derived as Tier 3, path correctly specified. The constraint caught by Phase 2 review (`$A_SOCIETY_RECORDS` reference) was small. The Curator's proposal required no revision cycle. The gate worked.

---

## Pending Actions Summary

| Action | Owner | Priority |
|---|---|---|
| Update `$GENERAL_OWNER_ROLE` to include Phase 0 gate | Curator (propose) → Owner (review) | High — same gap in distributable template |
| Update `$INSTRUCTION_WORKFLOW_COMPLEXITY` to reference plan template | Curator (propose) → Owner (review) | Low — discoverability improvement |
| Fix `agents.md` Tooling Developer summary (Node.js → TypeScript) | Owner (Tier 1, direct) | Low — one-line drift fix |
| Direct TA to scope tooling enforcement mechanism | Owner → TA | Medium — closes the programmatic enforcement track |
