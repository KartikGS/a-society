**From:** Tooling Developer
**To:** Owner
**Artifact:** Tooling Developer Completion — Component 4 Redesign
**Flow:** programmatic-improvement-system (2026-04-03)
**Date:** 2026-04-04

---

## Completed Tasks

Per the Owner's release (`05-owner-parallel-release.md`), the following changes have been implemented in accordance with the TA Advisory (`03-ta-advisory.md` §2, §4.7, §8):

### 1. `tooling/src/backward-pass-orderer.ts` — API Redesign
- **Removed deprecated interface:** `orderWithPromptsFromFile`, `computeBackwardPassOrder`, and prompt-generation helpers have been removed.
- **Structural Plan API:** Implemented `computeBackwardPassPlan` and `buildBackwardPassPlan`.
  - `BackwardPassEntry` now contains `findingsRolesToInject: string[]` instead of `prompt`.
  - **Graph-based mode:** Implemented the Role-Appearance Check algorithm (§2.4). Direct successors are only injected if their causal first-occurrence was later in the forward pass than the current role's first-occurrence.
  - **Parallel mode:** Implemented single-group meta-analysis with no injection.
- **Findings Localization:** Implemented `locateFindingsFiles` and `locateAllFindingsFiles`.
  - Supports the `NN[a-z]?-[role-slug]-findings.md` naming convention.
  - Returns repo-relative paths for runtime consumption.
  - Handles case-insensitive role-slug matching.

### 2. `tooling/test/backward-pass-orderer.test.ts` — Redesign Verification
- The test suite has been replaced with 7 new test cases verifying the redesign:
  - `Graph-based, Linear`: Verified backward order and correct injection.
  - `Graph-based, Repeated Role`: Verified the §2.5 worked trace case (Technical Architect excluded Owner; Curator included TA; Owner included Curator).
  - `Parallel Mode`: Verified all roles in a single group with no injection.
  - `Synthesis Entry`: Verified correct fields and fresh-session instruction.
  - `Findings Localization`: Verified regex matching, normalization, and sub-label handling.
  - `Edge Cases`: Verified absent directory handling (returns `[]`, no throw).
- **Status:** 7 passed, 0 failed.

### 3. `tooling/INVOCATION.md` — Documentation Update
- Replaced the Component 4 section to reflect its new status as a runtime library.
- Documented the new plan-computation and findings-location APIs.
- Updated the algorithm notes to include the role-appearance check and findings location rules.

---

## Verification Trace — Repeated Role (§2.5)

The implementation was verified against the worked trace provided in the advisory:
- **Workflow:** `o1(Owner) -> c1(Curator) -> ta1(TA) -> o2(Owner) -> c2(Curator)`
- **Positions:** Owner(0), Curator(1), TA(2)
- **Results:**
  - `Technical Architect` (Pos 2): Successor `Owner` (Pos 0). 0 <= 2 -> **EXCLUDED**. `findingsRolesToInject: []`.
  - `Curator` (Pos 1): Successor `Technical Architect` (Pos 2). 2 > 1 -> **INCLUDED**. `findingsRolesToInject: ['Technical Architect']`.
  - `Owner` (Pos 0): Successor `Curator` (Pos 1). 1 > 0 -> **INCLUDED**. `findingsRolesToInject: ['Curator']`.
- **Match:** Implementation matches §2.5 trace exactly.

## Modified Files

- `tooling/src/backward-pass-orderer.ts`
- `tooling/test/backward-pass-orderer.test.ts`
- `tooling/INVOCATION.md`

---

Next action: Release to Runtime Developer for Component 4 integration
Read: `06a-tooling-developer-completion.md`
Expected response: Phase 6 closure signal from Owner or Runtime Developer completion.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260403-programmatic-improvement-system/06a-tooling-developer-completion.md
```
