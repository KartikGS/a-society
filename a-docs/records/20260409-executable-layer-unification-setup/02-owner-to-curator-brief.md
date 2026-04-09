---

**Subject:** Executable layer unification — structural setup
**Status:** BRIEFED
**Date:** 2026-04-09

> **Pre-send check (Variables):** Verified. All `$VAR` references used below are already registered.

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$A_SOCIETY_VISION` | modify |
| `$A_SOCIETY_STRUCTURE` | modify |
| `$A_SOCIETY_ARCHITECTURE` | modify |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | modify |
| `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` | modify or retire |
| `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` | modify or retire |
| `a-society/a-docs/roles/[new executable developer role docs]` | additive |
| `$A_SOCIETY_WORKFLOW` | modify |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | modify or retire |
| `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` | modify or retire |
| `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` | modify |
| `$A_SOCIETY_TOOLING` | modify or retire |
| `$A_SOCIETY_TOOLING_PROPOSAL` | modify or retire |
| `$A_SOCIETY_TOOLING_ADDENDUM` | modify or retire |
| `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2` | modify or retire |
| `$A_SOCIETY_INDEX` | modify |
| `$A_SOCIETY_PUBLIC_INDEX` | modify |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | modify |
| `$A_SOCIETY_LOG` | modify |
| `$INSTRUCTION_CONSENT` | modify |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | modify |
| `$INSTRUCTION_INDEX` | modify |
| `$INSTRUCTION_REQUIRED_READINGS` | modify |
| `$INSTRUCTION_MACHINE_READABLE_HANDOFF` | modify |
| `$INSTRUCTION_WORKFLOW_GRAPH` | modify |
| `$INSTRUCTION_WORKFLOW_MODIFY` | modify |
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | modify |
| `$INSTRUCTION_RECORDS` | modify |

The agreed direction is:

1. **[Requires Owner approval][replace]** Replace the standing "tooling layer + runtime layer" architecture story with a single **executable layer** story for A-Society. Former tooling components are no longer presented as an adopter-run/operator-run layer; they become runtime-owned framework services or equivalent internal executable capabilities.

2. **[Requires Owner approval][replace]** Replace the current executable implementation role split (`Tooling Developer`, `Runtime Developer`) with a responsibility split designed for real parallel execution. The default target split is:
   - **Framework-Services Developer** — deterministic framework services such as validation, scaffolding, versioning, workflow parsing, backward-pass planning, and similar.
   - **Orchestration Developer** — session lifecycle, context injection, handoff routing, providers, CLI, observability, improvement orchestration, and similar.

   If you find materially better names for this same split, you may propose them. What is not open is the need to replace the current tooling/runtime-developer split with a responsibility-based split.

3. **[Requires Owner approval][replace]** Replace the current tooling/runtime workflow story with a single executable-development workflow model that supports parallel developer tracks and a single integration/convergence gate. The proposal must state clearly what happens to `$A_SOCIETY_WORKFLOW_TOOLING_DEV`, `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`, and `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`.

4. **[Requires Owner approval][replace]** Remove the standing operator-facing tooling-invocation story. Default direction: no standalone `$A_SOCIETY_TOOLING_INVOCATION`-style operator surface survives if the executable functions are helper/framework-service code used automatically by the runtime. Do not preserve a separate tooling invocation reference unless you can make a positive structural case that adopters still directly invoke a non-runtime executable surface.

5. **[Requires Owner approval][replace]** Propose the standing executable-layer documentation set after unification: which role docs exist, which workflow docs exist, whether `a-docs/tooling/` survives or is replaced, how the Technical Architect's scope text changes, how public/internal variables change, and how standing instructions stop telling adopters to run tooling directly.

6. **[Requires Owner approval][replace]** Include a named section in the proposal that remaps the overlapping executable-layer Next Priorities currently in `$A_SOCIETY_LOG` into one of four buckets:
   - absorbed by this setup flow,
   - follow-on executable implementation work,
   - obsolete after setup,
   - unchanged.

7. **[Requires Owner approval][additive]** Include the framework update report draft as a named section in the proposal submission. Do not pre-classify it in this brief; classification remains Curator-determined at the appropriate point via `$A_SOCIETY_UPDATES_PROTOCOL`.

**Direction constraints:**
- Do not propose keeping the current tooling/runtime layer split in standing architecture or structure documents.
- Do not propose a follow-on implementation flow that still depends on the old Tooling Developer / Runtime Developer authority model.
- Do not modify historical record artifacts or archived log entries. Historical artifacts remain immutable.
- This setup flow is for standing structure only. The actual package merge, folder moves, `dist/` decision, `.gitignore` update, code relocation, and test migration belong to the follow-on executable implementation flow, not this one.

---

## Scope

**In scope:** The standing A-Society framework surfaces that define, describe, route, index, and instruct the executable layer. This includes:
- architecture/structure/vision wording,
- executable role replacement,
- executable workflow replacement,
- retirement or remapping of tooling-specific standing docs and variables,
- public/internal index changes,
- agent-docs-guide rationale updates,
- general instruction updates that currently tell adopters to invoke tooling directly,
- log updates needed to reframe overlapping executable-layer Next Priorities,
- the update report draft.

**Out of scope:** The actual executable implementation migration. Specifically out of scope for this flow:
- merging `a-society/tooling/package.json` and `a-society/runtime/package.json`,
- moving source files between `a-society/tooling/` and `a-society/runtime/`,
- restructuring `runtime/src/`,
- deleting or preserving `dist/`,
- updating `.gitignore`,
- changing import paths,
- test refactors or harness implementation,
- any edit to historical record artifacts or archived log entries.

---

> **Responsibility transfer note:** This brief moves executable implementation responsibility away from the current tooling/runtime split. The main standing surfaces that currently name the prior ownership model and therefore require explicit reassessment are: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`, `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`, `$A_SOCIETY_WORKFLOW_TOOLING_DEV`, `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`, `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`, `$A_SOCIETY_TOOLING`, `$A_SOCIETY_TOOLING_PROPOSAL`, `$A_SOCIETY_TOOLING_ADDENDUM`, `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2`, `$A_SOCIETY_INDEX`, `$A_SOCIETY_PUBLIC_INDEX`, and the general instruction surfaces listed in Files Changed that currently refer to `$A_SOCIETY_TOOLING_*` or direct tooling invocation.

---

## Likely Target

Primary standing surfaces:
- `$A_SOCIETY_VISION`
- `$A_SOCIETY_STRUCTURE`
- `$A_SOCIETY_ARCHITECTURE`
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`
- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`
- `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`
- `$A_SOCIETY_WORKFLOW`
- `$A_SOCIETY_WORKFLOW_TOOLING_DEV`
- `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`
- `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`
- `$A_SOCIETY_TOOLING`
- `$A_SOCIETY_TOOLING_PROPOSAL`
- `$A_SOCIETY_TOOLING_ADDENDUM`
- `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2`
- `$A_SOCIETY_INDEX`
- `$A_SOCIETY_PUBLIC_INDEX`
- `$A_SOCIETY_AGENT_DOCS_GUIDE`
- `$A_SOCIETY_LOG`

Primary reusable/general instruction surfaces:
- `$INSTRUCTION_CONSENT`
- `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`
- `$INSTRUCTION_INDEX`
- `$INSTRUCTION_REQUIRED_READINGS`
- `$INSTRUCTION_MACHINE_READABLE_HANDOFF`
- `$INSTRUCTION_WORKFLOW_GRAPH`
- `$INSTRUCTION_WORKFLOW_MODIFY`
- `$INSTRUCTION_WORKFLOW_COMPLEXITY`
- `$INSTRUCTION_RECORDS`

New standing role files will likely live under `a-society/a-docs/roles/` with matching index registration changes in `$A_SOCIETY_INDEX`.

Additional standing files discovered during the reference sweep are in scope if they materially describe the old tooling/runtime split or direct tooling invocation model.

---

## Open Questions for the Curator

1. Should the umbrella folder and public narrative remain `runtime/`, or is a rename to a broader executable-layer term structurally better enough to justify the added migration surface? Evaluate, but do not assume rename by default.

2. What is the cleanest permanent workflow topology after unification?
   - one new executable-development workflow,
   - or one rewritten surviving workflow with the other retired,
   - and how should `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` describe parallel executable tracks afterward?

3. What is the best standing design/reference folder after unification?
   - keep `a-docs/tooling/` with rewritten purpose,
   - rename it,
   - split it,
   - or retire it in favor of different standing locations?

4. Which existing `$A_SOCIETY_TOOLING_*` public/internal variables should be retired outright, which should be remapped to new surviving surfaces, and which are still worth preserving because they name load-bearing executable capabilities rather than a standalone tooling layer?

5. Which overlapping Next Priorities should be absorbed by this setup flow immediately, and which should survive as follow-on executable implementation work after the new structure is approved?

6. For the proposed developer split, are `Framework-Services Developer` and `Orchestration Developer` the best names, or is there a clearer naming pair that preserves the same boundary and parallelism model?

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Executable layer unification — structural setup."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
