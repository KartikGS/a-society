# Curator → Owner: Proposal

**Subject:** Executable layer unification — structural setup
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-04-09

---

## Trigger

Owner-identified structural setup flow. Briefed via `a-society/a-docs/records/20260409-executable-layer-unification-setup/02-owner-to-curator-brief.md`.

---

## What and Why

This proposal replaces A-Society's standing split between a public/operator-facing tooling layer and a separate runtime layer with a single executable-layer model.

The core decisions are:

1. Keep `runtime/` as the surviving umbrella executable root and operator surface.
2. Reclassify `tooling/` as a temporary legacy implementation location during migration, not a standing peer layer.
3. Replace `Tooling Developer` and `Runtime Developer` with a responsibility split that supports real parallel execution:
   - **Framework Services Developer** — deterministic framework services and validators
   - **Orchestration Developer** — session lifecycle, providers, CLI, observability, and orchestration
4. Replace the two standing executable workflows with one permanent executable-development workflow that can fork into one or both developer tracks and rejoin at a single integration gate.
5. Retire the standalone tooling-invocation/public-component-path story. Runtime remains the only standing operator-facing executable surface.

This resolves the current structural contradiction where:
- vision, structure, and architecture describe tooling and runtime as two permanent executable layers,
- the upcoming implementation direction assumes one merged executable system,
- the public index still exposes standalone tooling source paths as if they were stable operator surfaces,
- several general instructions still tell adopters to invoke tooling components directly,
- and the runtime Phase 0 design still lives only in a record artifact with no standing executable-design home.

---

## Where Observed

A-Society — internal.

Concrete drift verified in the current standing surfaces:

- `$A_SOCIETY_VISION`, `$A_SOCIETY_STRUCTURE`, and `$A_SOCIETY_ARCHITECTURE` still present tooling and runtime as peer work-product layers.
- `$A_SOCIETY_WORKFLOW` routes to separate `$A_SOCIETY_WORKFLOW_TOOLING_DEV` and `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` permanent loops.
- `$A_SOCIETY_PUBLIC_INDEX` still exposes `$A_SOCIETY_TOOLING_INVOCATION` and per-component tooling source paths as public-facing surfaces.
- `$INSTRUCTION_CONSENT`, `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`, and `$INSTRUCTION_INDEX` still direct agents to run standalone tooling components directly.
- `$INSTRUCTION_MACHINE_READABLE_HANDOFF` and `$INSTRUCTION_REQUIRED_READINGS` still use the old Tooling Developer / Runtime Developer vocabulary in worked examples.
- `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` still depends on a Phase 0 runtime design that exists only in a record artifact (`a-society/a-docs/records/20260327-runtime-orchestrator-mvp/03-ta-to-owner.md`).

---

## Open Question Resolutions

### OQ1 — Umbrella name and repo-root rename

**Decision:** Keep `runtime/` as the surviving umbrella executable root. Do not rename the repo-root folder in this flow.

**Rationale:** The agreed direction requires replacing the standing tooling/runtime split, but a repo-root rename would expand this setup flow into the out-of-scope code-migration work: package merge, source relocation, import rewrites, `dist/` handling, and test harness movement. Keeping `runtime/` as the surviving umbrella root achieves the structural goal now without pre-committing the implementation flow to path churn beyond what is already required.

**Structural consequence:** Standing docs describe **one executable layer**. `runtime/` is that layer's surviving executable root and operator surface. `tooling/` is described only as a temporary legacy implementation location pending the follow-on migration flow.

### OQ2 — Permanent workflow topology

**Decision:** Create a new permanent workflow, `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV`, and retire both `$A_SOCIETY_WORKFLOW_TOOLING_DEV` and `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` after their durable content is absorbed.

**Rationale:** Rewriting either old workflow in place would keep the old layer name in the permanent variable surface (`...TOOLING...` or `...RUNTIME...`) and would preserve the split in the routing vocabulary the flow is meant to retire. A new executable workflow gives the merged model one clean entry point.

### OQ3 — Standing design/reference folder

**Decision:** Retire `a-society/a-docs/tooling/` as the standing design/reference home and replace it with `a-society/a-docs/executable/`.

**Rationale:** Keeping the folder name `tooling/` would preserve the old layer boundary in the internal docs even after the architecture says the layer is unified. The new folder is warranted immediately: it will hold at least four standing artifacts (`main.md`, proposal/spec, addendum/governance, coupling map), with a fifth legacy deviation record retained for traceability.

### OQ4 — Variable retirement vs preservation

**Decision:** Retire the standalone tooling public variables and replace the internal tooling-doc variables with executable-doc variables. Preserve `$A_SOCIETY_RUNTIME_INVOCATION` as the surviving operator-facing executable reference.

**Rationale:** The standalone tooling component paths are no longer the public contract once framework services become runtime-owned internals. The operator-facing surface that remains standing is the runtime invocation reference.

### OQ5 — Next Priorities handling

**Decision:** Absorb the runtime-design promotion item in this setup flow, reroute the blocked implementation items into the new executable workflow, and close the tooling-invocation note as obsolete.

Detailed remap is in the dedicated section below.

### OQ6 — New developer-role names

**Decision:** Keep the Owner's proposed names: **Framework Services Developer** and **Orchestration Developer**.

**Rationale:** They communicate the intended boundary directly:
- one role owns deterministic framework services regardless of whether they are exposed as public commands,
- the other owns orchestration and operator-facing runtime behavior.

This preserves the required responsibility split without inventing broader or less precise labels.

---

## Discovered In-Scope Additions

The brief's primary file list needs three additions based on source verification:

1. **`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`** — its Phase 2 Coupling Test and follow-on routing still point to `$A_SOCIETY_TOOLING_COUPLING_MAP` and `$A_SOCIETY_WORKFLOW_TOOLING_DEV`.
2. **`$A_SOCIETY_REQUIRED_READINGS`** — the role map currently contains `tooling-developer` and `runtime-developer`; new executable roles cannot be introduced cleanly without updating the required-readings authority.
3. **`$A_SOCIETY_TOOLING_COUPLING_MAP`** — not named in the brief, but still a load-bearing active document that encodes the old tooling-specific invocation model. It must be replaced, not left behind.

These are in scope for the same reason the listed surfaces are: they are active standing references that would otherwise preserve the retired model.

---

## Target Location

### Standing A-Society surfaces

| Target | Action | Variable / Result |
|---|---|---|
| `$A_SOCIETY_VISION` | Modify | Replace tooling/runtime peer-layer story with one executable-layer story |
| `$A_SOCIETY_STRUCTURE` | Modify | Define `runtime/` as standing executable root; define `tooling/` as transitional legacy folder |
| `$A_SOCIETY_ARCHITECTURE` | Modify | Unify executable-layer model; remove public/operator-facing tooling-layer framing |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | Modify | Scope changes from tooling-layer design to executable-layer design |
| `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` | Retire | Replaced by `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE` |
| `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` | Retire | Replaced by `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE` |
| `a-society/a-docs/roles/framework-services-developer.md` | Create | `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE` |
| `a-society/a-docs/roles/framework-services-developer/implementation-discipline.md` | Create | `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE` |
| `a-society/a-docs/roles/orchestration-developer.md` | Create | `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE` |
| `a-society/a-docs/roles/orchestration-developer/implementation-discipline.md` | Create | `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE` |
| `$A_SOCIETY_REQUIRED_READINGS` | Modify | Retire old role keys; add new executable role keys |
| `$A_SOCIETY_WORKFLOW` | Modify | Route to Framework Development + Executable Development only |
| `a-society/a-docs/workflow/executable-development.md` | Create | `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV` |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | Retire | Durable content absorbed into executable workflow/docs |
| `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` | Retire | Durable content absorbed into executable workflow/docs |
| `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` | Modify | Rewrite around framework + executable parallel tracks |
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | Modify | Coupling/routing references updated to executable equivalents |
| `a-society/a-docs/executable/main.md` | Create | `$A_SOCIETY_EXECUTABLE` |
| `a-society/a-docs/executable/architecture-proposal.md` | Create | `$A_SOCIETY_EXECUTABLE_PROPOSAL` |
| `a-society/a-docs/executable/architecture-addendum.md` | Create | `$A_SOCIETY_EXECUTABLE_ADDENDUM` |
| `a-society/a-docs/executable/general-coupling-map.md` | Create | `$A_SOCIETY_EXECUTABLE_COUPLING_MAP` |
| `a-society/a-docs/executable/legacy-ta-assessment-phase1-2.md` | Create | `$A_SOCIETY_EXECUTABLE_LEGACY_TA_ASSESSMENT_PHASE1_2` |
| `$A_SOCIETY_TOOLING` | Retire | Replaced by `$A_SOCIETY_EXECUTABLE` |
| `$A_SOCIETY_TOOLING_PROPOSAL` | Retire | Replaced by `$A_SOCIETY_EXECUTABLE_PROPOSAL` |
| `$A_SOCIETY_TOOLING_ADDENDUM` | Retire | Replaced by `$A_SOCIETY_EXECUTABLE_ADDENDUM` |
| `$A_SOCIETY_TOOLING_COUPLING_MAP` | Retire | Replaced by `$A_SOCIETY_EXECUTABLE_COUPLING_MAP` |
| `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2` | Retire | Replaced by `$A_SOCIETY_EXECUTABLE_LEGACY_TA_ASSESSMENT_PHASE1_2` |
| `a-society/tooling/INVOCATION.md` | Retire | No separate tooling operator surface survives |
| `$A_SOCIETY_RUNTIME_INVOCATION` | Modify | Survives as the sole operator-facing executable reference |
| `$A_SOCIETY_INDEX` | Modify | Register new executable docs/roles; retire old tooling/runtime developer and tooling-doc variables |
| `$A_SOCIETY_PUBLIC_INDEX` | Modify | Retire standalone tooling rows; add executable workflow row; update runtime entry |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | Modify | Replace tooling/runtime-developer/tooling-folder rationale with executable equivalents |
| `$A_SOCIETY_LOG` | Modify | Reframe overlapping executable-layer Next Priorities |

### Reusable / public instruction surfaces

| Target | Action | Result |
|---|---|---|
| `$INSTRUCTION_CONSENT` | Modify | Replace direct tooling invocation with executable-capability wording |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | Modify | Replace direct Version Comparator invocation with executable-capability wording |
| `$INSTRUCTION_INDEX` | Modify | Replace direct Path Validator invocation with capability-based guidance |
| `$INSTRUCTION_REQUIRED_READINGS` | Modify | Worked examples updated to new executable role vocabulary |
| `$INSTRUCTION_MACHINE_READABLE_HANDOFF` | Modify | Fork-point example updated to new executable role names |
| `$INSTRUCTION_WORKFLOW_GRAPH` | Modify | Replace standalone-tool assumptions with executable-capability wording |
| `$INSTRUCTION_WORKFLOW_MODIFY` | Verify + touch only if needed | No executable-specific rewrite verified at proposal time; update only if cross-references require it |
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | Verify + touch only if needed | Same source-verification note as above |
| `$INSTRUCTION_RECORDS` | Modify | Replace standalone Backward Pass Orderer wording with executable-capability wording |

---

## Draft Content

### 1. Standing executable-layer model

#### `$A_SOCIETY_VISION`

Replace the current "tooling layer" + "runtime layer" peer paragraphs with a single executable-layer paragraph and update the work-product layer count accordingly:

- Change the count from **four work product layers** to **three work product layers**: library, active, executable.
- Replace the current tooling/runtime pair with one paragraph stating that the executable layer combines:
  - runtime-owned framework services for deterministic framework operations,
  - orchestration/runtime behavior for sessions, context, routing, providers, and CLI/operator behavior.
- State explicitly that the runtime is the operator-facing executable shell, while framework services are internal capabilities unless a future design makes a specific surface public on purpose.

This preserves the Owner's direction that tooling no longer survives as a separate standing layer.

#### `$A_SOCIETY_ARCHITECTURE`

Rewrite the System Overview around:

- **Three standing work-product layers**: `general/`, `agents/`, `runtime/`
- **One internal documentation layer**: `a-docs/`
- **One transitional legacy implementation folder**: `tooling/`, retained only until the follow-on executable migration lands

Key architectural changes:

1. Replace "executable tooling utilities and a runtime" with **one executable layer**.
2. Change the `tooling/` bullet from "programmatic tooling layer" to a transitional description:
   - existing legacy framework-service implementations live here temporarily,
   - it is not a standing public/operator surface,
   - new standing documentation must not describe it as a peer executable layer.
3. Expand the `runtime/` bullet so it is the standing executable root:
   - orchestration,
   - provider and CLI surface,
   - runtime-owned framework services and validators.
4. Replace the six-component "tooling layer comprises..." framing with executable-capability framing:
   - the named deterministic components survive as **framework services** inside the executable layer,
   - not as a separate adopter-run/operator-run tooling layer.
5. Update Layer Isolation and placement tests so the secondary work-product test becomes:
   - instructions/templates → `general/`
   - deployed agents → `agents/`
   - executable orchestration or runtime-owned framework services → `runtime/`
   - legacy `tooling/` content exists only until migrated and is not a new-placement target.

#### `$A_SOCIETY_STRUCTURE`

Replace the current two-layer executable placement model with a standing-vs-transitional distinction:

- `runtime/` becomes the **standing executable folder**.
- `tooling/` becomes the **legacy executable migration folder**.

Proposed new placement logic:

- **Standing executable implementation or operator-facing executable docs** → `runtime/`
- **Legacy framework-service code awaiting migration under an approved unification plan** → `tooling/`
- **New permanent placements** must not target `tooling/`

This keeps the structure honest about the current repo while still retiring the old layer split.

### 2. Developer-role replacement

#### Retire

- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`
- `$A_SOCIETY_TOOLING_DEV_INVOCATION`
- `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`
- `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`

#### Create

##### `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE`

Owns deterministic framework services such as:

- consent creation/checking
- update comparison
- index/path validation
- workflow graph validation
- backward-pass ordering / handoff validation
- scaffolding and related helper services

Standing boundary:

- no architecture decisions,
- no orchestration/session-model decisions,
- no standalone public invocation contract by default,
- no writes outside executable implementation scope plus record artifacts.

Support doc:

- `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE` for implementation-phase and completion-artifact discipline.

##### `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE`

Owns:

- session lifecycle
- context injection
- handoff routing
- provider/LLM integration
- CLI/operator behavior
- observability
- improvement orchestration
- integration harnesses for end-to-end executable behavior

Support doc:

- `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE`

#### `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

Update from "programmatic tooling layer" to **executable layer**.

Primary work output becomes:

1. executable boundary evaluation,
2. framework-services vs orchestration decomposition,
3. executable-development workflow shape,
4. open executable design questions and dependencies.

The TA no longer proposes a separate tooling-layer workflow or peer runtime-vs-tooling architecture story.

#### `$A_SOCIETY_REQUIRED_READINGS`

Replace:

```yaml
tooling-developer:
  - $A_SOCIETY_TOOLING_DEVELOPER_ROLE
  - $A_SOCIETY_ARCHITECTURE
runtime-developer:
  - $A_SOCIETY_RUNTIME_DEVELOPER_ROLE
  - $A_SOCIETY_ARCHITECTURE
```

with:

```yaml
framework-services-developer:
  - $A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE
  - $A_SOCIETY_ARCHITECTURE
orchestration-developer:
  - $A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE
  - $A_SOCIETY_ARCHITECTURE
```

### 3. Single executable-development workflow

Create `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV` with one permanent topology:

- `owner-intake`
- `ta-phase0-design`
- `owner-phase0-gate`
- `framework-services-implementation`
- `orchestration-implementation`
- `ta-integration-review`
- `owner-integration-gate`
- `curator-registration`
- `owner-forward-pass-closure`

Key properties:

1. The two developer nodes are **parallel-capable siblings**, not separate permanent workflows.
2. A given flow may traverse one track or both; the record-folder `workflow.md` captures the actual subgraph.
3. There is **one TA integration review** and **one Owner integration gate** after developer-track convergence.
4. Curator registration remains one node after integration approval.

#### Retire old workflows

- `$A_SOCIETY_WORKFLOW_TOOLING_DEV` retires after:
  - its durable gating logic,
  - developer-boundary rules,
  - and useful phase constraints
  are absorbed into the new executable workflow and executable addendum.
- `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` retires after:
  - its Phase 0 TA design gate,
  - runtime invocation verification rule,
  - and registration guardrails
  are absorbed into the new executable workflow and addendum.

#### `$A_SOCIETY_WORKFLOW`

Rewrite the directory entry list to:

- Framework Development
- Executable Development
- Multi-domain pattern

and remove the old separate tooling/runtime entries.

#### `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`

Rewrite the pattern around:

- Curator / framework-doc track when `general/` or `a-docs/` is in scope
- Framework Services Developer track
- Orchestration Developer track
- TA design before fork and TA integration after join

The illustrative fork-point graph should use the new developer roles, not Tooling Developer / Runtime Developer.

#### `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`

Update the Phase 2 Coupling Test to consult `$A_SOCIETY_EXECUTABLE_COUPLING_MAP` and route follow-on implementation through `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV`, not the retired tooling workflow.

### 4. Executable design/reference set

Retire `a-society/a-docs/tooling/` as the standing design home and replace it with `a-society/a-docs/executable/`.

#### `$A_SOCIETY_EXECUTABLE`

Purpose: entry point to the executable design/reference set.

#### `$A_SOCIETY_EXECUTABLE_PROPOSAL`

Purpose: the living executable architecture/spec.

It should absorb two kinds of enduring content:

1. the current tooling proposal's framework-service/component definitions,
2. the runtime Phase 0 architecture design that currently exists only at `a-society/a-docs/records/20260327-runtime-orchestrator-mvp/03-ta-to-owner.md`.

This directly resolves the standing "runtime architecture design registration and record-artifact promotion rule" gap instead of carrying it forward.

#### `$A_SOCIETY_EXECUTABLE_ADDENDUM`

Purpose: governance and maintenance constraints for the executable layer:

- developer-role boundary rules,
- post-launch service/addition protocol,
- integration/convergence requirements,
- when a framework-service addition requires TA design before implementation.

#### `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`

Purpose: preserve the format-dependency table, but replace tooling-specific invocation-gap framing with executable exposure/ownership framing.

Proposed second table shape:

| Framework element | Executable capability | Standing exposure status |
|---|---|---|
| `$INSTRUCTION_CONSENT` | Consent creation/checking | Runtime-owned internal service |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | Update comparison | Runtime-owned internal service |
| `$INSTRUCTION_INDEX` | Path/index validation | Runtime-owned internal service |
| `$INSTRUCTION_WORKFLOW_GRAPH` | Workflow graph validation | Runtime-owned internal service |
| `$GENERAL_IMPROVEMENT` / record-folder `workflow.md` | Backward-pass ordering | Runtime-owned internal service |

This keeps the Coupling Test load-bearing while removing the obsolete assumption that every capability must be surfaced as a standalone tool command.

#### `$A_SOCIETY_EXECUTABLE_LEGACY_TA_ASSESSMENT_PHASE1_2`

Retain the existing tooling Phase 1-2 deviation rulings as a **legacy executable traceability record**, not as the primary entry point. This preserves the deviation → ruling → spec-update chain while clearly labeling it as pre-unification history.

### 5. Public/internal index and operator-surface remap

#### `$A_SOCIETY_PUBLIC_INDEX`

Retire these standalone tooling rows:

- `$A_SOCIETY_TOOLING_INVOCATION`
- `$A_SOCIETY_TOOLING_SCAFFOLDING_SYSTEM`
- `$A_SOCIETY_TOOLING_CONSENT_UTILITY`
- `$A_SOCIETY_TOOLING_WORKFLOW_GRAPH_VALIDATOR`
- `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`
- `$A_SOCIETY_TOOLING_PATH_VALIDATOR`
- `$A_SOCIETY_TOOLING_VERSION_COMPARATOR`

Add or revise:

- add `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV`
- revise `$A_SOCIETY_RUNTIME_INVOCATION` description so it is the sole operator-facing executable reference
- revise `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` description to say framework + executable tracks rather than tooling + runtime

#### `$A_SOCIETY_INDEX`

Register:

- new developer role/support-doc variables,
- new executable-doc variables,
- new executable workflow variable

Retire:

- old tooling/runtime-developer role/support-doc variables,
- old tooling-doc variables,
- old tooling/runtime workflow variables,
- old standalone tooling component path variable(s) that remain in active internal indexes

#### Operator-facing reference outcome

- `runtime/INVOCATION.md` survives and expands as needed.
- `tooling/INVOCATION.md` does not survive as a standing surface.

### 6. Reusable instruction updates

The general/public instruction updates should be specific, not blanket:

#### `$INSTRUCTION_CONSENT`

Replace:

> Run `$A_SOCIETY_TOOLING_CONSENT_UTILITY` ...

with capability-based wording:

> If the framework provides an executable consent-creation capability, use that surface to generate the file. If no such capability is available, copy `$GENERAL_FEEDBACK_CONSENT` manually.

#### `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`

Replace:

> Run `$A_SOCIETY_TOOLING_VERSION_COMPARATOR` ...

with:

> If the framework provides an executable update-comparison capability, use it to determine pending reports. Otherwise inspect `a-society/updates/` manually in version order.

#### `$INSTRUCTION_INDEX`

Replace:

> Run `$A_SOCIETY_TOOLING_PATH_VALIDATOR` ...

with:

> If the framework provides an index/path validation capability, run it after any index update. Otherwise validate rows manually.

#### `$INSTRUCTION_REQUIRED_READINGS`

Update the multi-word-role examples and worked example map from:

- `tooling-developer`
- `runtime-developer`

to:

- `framework-services-developer`
- `orchestration-developer`

#### `$INSTRUCTION_MACHINE_READABLE_HANDOFF`

Update the fork-point worked example from Tooling Developer / Runtime Developer to Framework Services Developer / Orchestration Developer.

#### `$INSTRUCTION_WORKFLOW_GRAPH`

Keep the schema unchanged, but replace standalone-tool wording with executable-capability wording:

- "If your project has a workflow graph validator..."
- "If your project has a backward-pass ordering capability..."

No schema change is proposed in this flow.

#### `$INSTRUCTION_RECORDS`

Likewise replace "Backward Pass Orderer tool" wording with neutral executable-capability wording. The `workflow.md` convention itself remains unchanged.

#### `$INSTRUCTION_WORKFLOW_MODIFY` and `$INSTRUCTION_WORKFLOW_COMPLEXITY`

Source verification result: neither document currently contains direct tooling/runtime split language or direct standalone-tool invocation instructions.

Proposal consequence:

- keep both files in scope for cross-reference cleanup during implementation,
- do **not** force an artificial prose rewrite if no stale executable reference is introduced by the approved implementation.

This is a deliberate source-claim correction to the brief's blanket file list, not a refusal to check them.

### 7. `$A_SOCIETY_AGENT_DOCS_GUIDE`

Replace the rationale set for:

- `roles/tooling-developer.md`
- `roles/tooling-developer/invocation-discipline.md`
- `roles/runtime-developer.md`
- `roles/runtime-developer/implementation-discipline.md`
- `workflow/tooling-development.md`
- `workflow/runtime-development.md`
- `tooling/main.md`
- `tooling/general-coupling-map.md`
- `tooling/architecture-proposal.md`
- `tooling/architecture-addendum.md`
- `tooling/ta-assessment-phase1-2.md`
- `tooling/INVOCATION.md`

with new rationale entries for:

- framework-services developer role and support doc,
- orchestration developer role and support doc,
- executable workflow,
- executable doc folder and its four standing docs,
- legacy executable TA assessment record,
- runtime invocation as the sole operator-facing executable reference.

### 8. Named Next Priorities remap

#### Absorbed by this setup flow

| Current item | Proposed handling |
|---|---|
| **Runtime architecture design registration and record-artifact promotion rule** | Absorb. Promote the enduring runtime design into `$A_SOCIETY_EXECUTABLE_PROPOSAL` and define the standing promotion rule in the new executable design/reference model. |

#### Follow-on executable implementation work

| Current item | Proposed post-setup routing |
|---|---|
| **Tooling version-comparator hermeticity** | Refile under the executable workflow, Framework Services Developer track. |
| **Machine-readable handoff validator (Component 8)** | Refile under the executable workflow, Framework Services Developer track, with classification as a runtime-owned framework service unless the TA/Owner later choose a different exposure status. |
| **Runtime integration test infrastructure** | Refile under the executable workflow, Orchestration Developer track. |
| **Runtime observability contract completion** | Refile under the executable workflow, Orchestration Developer track. |

#### Obsolete after setup

| Current item | Why obsolete |
|---|---|
| **Tooling invocation repo-root execution note** | Obsolete if `$A_SOCIETY_TOOLING_INVOCATION` is retired. The note should not be migrated into the new standing model. |

#### Unchanged

None of the Next Priorities that explicitly reference this setup flow's blocked executable split remain unchanged after the remap. Executable-adjacent items that do **not** depend on the retired tooling/runtime split stay outside this remap and continue on their existing paths.

---

## Update Report Draft

### Submission Status

- **Implementation status:** Not yet complete. This draft is included at Phase 1 so the Owner can review the report content concurrently with the structural proposal, per `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`.
- **Files changed:** Planned changes affecting adopters are currently expected in `$INSTRUCTION_CONSENT`, `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`, `$INSTRUCTION_INDEX`, `$INSTRUCTION_REQUIRED_READINGS`, `$INSTRUCTION_MACHINE_READABLE_HANDOFF`, `$INSTRUCTION_WORKFLOW_GRAPH`, and `$INSTRUCTION_RECORDS`, plus the public executable-surface changes in `$A_SOCIETY_PUBLIC_INDEX`.
- **Publication condition:** Publish only after Phase 2 approval of both the structural change and this report draft, followed by Phase 3-4 implementation. Expected version change if approved as drafted: `v32.1` → `v33.0`.

### Draft Report

```markdown
# A-Society Framework Update — 2026-04-09

**Framework Version:** v33.0
**Previous Version:** v32.1

## Summary

A-Society's standing executable model has been unified. The framework no longer presents a separate public/operator-facing tooling layer alongside the runtime; instead, executable helper capabilities are treated as part of one executable layer, with the runtime as the surviving operator-facing surface and runtime-owned framework services handling deterministic operations internally.

Projects that created standalone tooling invocation docs, public component-path rows, or copied direct-tool-invocation guidance from A-Society's general instructions should review their executable-layer structure and update those references where needed.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 1 | Improvements worth adopting — Curator judgment call |
| Optional | 1 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Direct tooling invocation guidance replaced by executable-capability guidance

**Impact:** Breaking
**Affected artifacts:** `general/instructions/consent.md`, `general/instructions/a-society-version-record.md`, `general/instructions/indexes/main.md`
**What changed:** These instructions no longer direct agents to invoke standalone A-Society tooling components by public variable name. They now describe executable capabilities generically and assume that, when a project automates these operations, the capability may be runtime-owned or otherwise internal rather than a standalone public tool surface.
**Why:** The old guidance exposed implementation details as if they were stable operator contracts and preserved the retired tooling/runtime split even after the executable layer was unified.
**Migration guidance:** If your project created public index rows, operator docs, or role guidance that tell agents to run standalone helper executables for consent creation, update comparison, or index/path validation solely because A-Society's instructions said to do so, review whether those helpers are actually meant to be public/operator-facing. If they are internal executable services, retire the public rows, update the relevant instructions to capability-based wording, and keep the manual fallback path available.

---

### Workflow-graph and record-folder guidance now treat validation/orderer logic as executable capabilities

**Impact:** Recommended
**Affected artifacts:** `general/instructions/workflow/graph.md`, `general/instructions/records/main.md`
**What changed:** The worked guidance around workflow-graph validation and backward-pass ordering no longer assumes a standalone tool boundary. The schema and `workflow.md` convention are unchanged; only the executable-capability framing is updated.
**Why:** The ordering/validation logic remains valuable, but in the unified executable model it may be owned by the runtime or another internal executable surface rather than a standalone tool command.
**Migration guidance:** If your project uses `workflow.md` and an executable capability to validate graphs or compute backward-pass order, update your local wording so it does not depend on a standalone tooling layer unless that is a deliberate local choice. No schema migration is required if your current graph format is already current.

---

### Worked examples updated to the new executable-role vocabulary

**Impact:** Optional
**Affected artifacts:** `general/instructions/roles/required-readings.md`, `general/instructions/communication/coordination/machine-readable-handoff.md`
**What changed:** Worked examples that previously used `Tooling Developer` and `Runtime Developer` now use the new executable-role pair: `Framework Services Developer` and `Orchestration Developer`.
**Why:** The old example names preserved a standing split that the framework no longer uses.
**Migration guidance:** Review only if your project copied these example role names into its own `agents.md`, `required-readings.yaml`, or handoff examples. If your project uses different role names already, no change is required.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
```

---

## Owner Confirmation Required

The Owner should respond in `owner-to-curator.md` with one of:

- **APPROVED** — with any implementation constraints or naming adjustments
- **REVISE** — with specific required changes
- **REJECTED** — with rationale

If approved, implementation should proceed with the discovered in-scope additions (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`, `$A_SOCIETY_REQUIRED_READINGS`, `$A_SOCIETY_TOOLING_COUPLING_MAP`) included in the same pass.
