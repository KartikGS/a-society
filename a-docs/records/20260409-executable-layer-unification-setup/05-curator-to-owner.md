# Curator → Owner: Proposal

**Subject:** Executable layer unification — structural setup
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-04-09

---

## Trigger

Owner revision request from `a-society/a-docs/records/20260409-executable-layer-unification-setup/04-owner-to-curator.md`.

This resubmission supersedes `03-curator-to-owner.md`. It corrects the source-verification claim about `$INSTRUCTION_WORKFLOW_MODIFY` and `$INSTRUCTION_WORKFLOW_COMPLEXITY`, adds the omitted support docs, and makes the surviving operator-surface ownership explicit.

---

## What and Why

This proposal keeps the approved structural direction:

1. one executable-layer story,
2. `runtime/` as the surviving umbrella executable root,
3. `tooling/` retired as a standing peer layer,
4. `Framework Services Developer` and `Orchestration Developer` as the new executable implementation split,
5. one permanent executable-development workflow.

The revision is about scope precision, not direction change.

The standing contradictions to resolve are now fully scoped:

- the workflow instructions still explicitly name `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`,
- TA advisory guidance still uses tooling-component / tooling-coupling framing,
- Curator role authority still names `tooling/INVOCATION.md` as a standing executable operator surface,
- Owner support docs still frame executable verification and closure against the retired Tooling Developer / Runtime Developer split,
- and the update-report protocol still treats the Version Comparator as a standalone tooling-layer contract.

---

## Where Observed

Source verification for the revision points:

- `$INSTRUCTION_WORKFLOW_MODIFY` still says: "run `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` if available".
- `$INSTRUCTION_WORKFLOW_COMPLEXITY` still says the backward pass artifact sequence is input for `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`.
- `$A_SOCIETY_TA_ADVISORY_STANDARDS` still requires coupling-map consultation "when an advisory ... modifies or redesigns a tooling component" and still frames open gaps as invocation gaps.
- `$A_SOCIETY_CURATOR_ROLE` still defines registration scope using `tooling/INVOCATION.md` and `runtime/INVOCATION.md` as the standing executable examples.
- `$A_SOCIETY_OWNER_BRIEF_WRITING` still names "Tooling Developer or Runtime Developer" directly in executable verification guidance and still has a tooling-development-specific Curator-scope rule.
- `$A_SOCIETY_OWNER_CLOSURE` still frames executable API-removal verification as a "tooling or runtime flow" concern across `tooling/` and `runtime/`.
- `$A_SOCIETY_UPDATES_PROTOCOL` still says the parsing contract depends on "programmatic tooling" and explicitly requires concurrent Version Comparator implementation updates.

---

## Open Question Resolutions

### OQ1 — Umbrella name and repo-root rename

**Decision:** Keep `runtime/` as the surviving umbrella executable root. Do not rename the repo-root folder in this setup flow.

### OQ2 — Permanent workflow topology

**Decision:** Create `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV` and retire `$A_SOCIETY_WORKFLOW_TOOLING_DEV` plus `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` after durable content is absorbed.

### OQ3 — Standing design/reference folder

**Decision:** Replace `a-society/a-docs/tooling/` with `a-society/a-docs/executable/` as the standing executable design/reference home.

### OQ4 — Variable retirement vs preservation

**Decision:** Retire standalone tooling public variables and tooling-doc variables; preserve and expand `$A_SOCIETY_RUNTIME_INVOCATION` as the sole standing operator-facing executable reference.

### OQ5 — Next Priorities handling

**Decision:** Absorb the runtime-design-promotion item, reroute blocked implementation items into the executable workflow, and close the tooling-invocation note as obsolete.

### OQ6 — New developer-role names

**Decision:** Keep `Framework Services Developer` and `Orchestration Developer`.

---

## Expanded In-Scope Set

In addition to the brief's named files, the revised proposal explicitly includes these load-bearing standing surfaces:

1. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — still routes coupling follow-through to the retired tooling workflow.
2. `$A_SOCIETY_REQUIRED_READINGS` — still contains `tooling-developer` and `runtime-developer`.
3. `$A_SOCIETY_TOOLING_COUPLING_MAP` — still encodes tooling-specific invocation-gap logic.
4. `$A_SOCIETY_TA_ADVISORY_STANDARDS` — still uses tooling-component coupling language.
5. `$A_SOCIETY_CURATOR_ROLE` — still treats `tooling/INVOCATION.md` as a standing executable operator surface.
6. `$A_SOCIETY_OWNER_BRIEF_WRITING` — still encodes the retired executable role split in verification guidance.
7. `$A_SOCIETY_OWNER_CLOSURE` — still encodes the retired executable boundary in closure verification guidance.
8. `$A_SOCIETY_UPDATES_PROTOCOL` — still names the Version Comparator as a tooling-layer parsing contract.

And two already-listed instruction files move from "verify only" to actual wording changes:

9. `$INSTRUCTION_WORKFLOW_MODIFY`
10. `$INSTRUCTION_WORKFLOW_COMPLEXITY`

---

## Target Location

### Standing A-Society surfaces

| Target | Action | Intended outcome |
|---|---|---|
| `$A_SOCIETY_VISION` | Modify | Replace tooling/runtime peer-layer story with one executable-layer story |
| `$A_SOCIETY_STRUCTURE` | Modify | Define `runtime/` as standing executable root and `tooling/` as transitional legacy implementation location |
| `$A_SOCIETY_ARCHITECTURE` | Modify | Unify executable-layer model; retire public/operator-facing tooling-layer framing |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | Modify | Change scope from tooling-layer design to executable-layer design |
| `$A_SOCIETY_TA_ADVISORY_STANDARDS` | Modify | Change tooling-component coupling guidance to executable-capability / executable-coupling guidance |
| `$A_SOCIETY_CURATOR_ROLE` | Modify | Remove standing `tooling/INVOCATION.md` framing; make surviving operator-surface ownership explicit |
| `$A_SOCIETY_OWNER_BRIEF_WRITING` | Modify | Rewrite executable verification guidance against the new developer split and surviving executable boundaries |
| `$A_SOCIETY_OWNER_CLOSURE` | Modify | Rewrite closure verification against executable-development flows and surviving executable boundaries |
| `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` | Retire | Replaced by `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE` |
| `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` | Retire | Replaced by `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE` |
| `a-society/a-docs/roles/framework-services-developer.md` | Create | `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE` |
| `a-society/a-docs/roles/framework-services-developer/implementation-discipline.md` | Create | `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE` |
| `a-society/a-docs/roles/orchestration-developer.md` | Create | `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE` |
| `a-society/a-docs/roles/orchestration-developer/implementation-discipline.md` | Create | `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE` |
| `$A_SOCIETY_REQUIRED_READINGS` | Modify | Replace old executable role keys with the new executable role keys |
| `$A_SOCIETY_WORKFLOW` | Modify | Route only to Framework Development and Executable Development as permanent workflows |
| `a-society/a-docs/workflow/executable-development.md` | Create | `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV` |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | Retire | Durable workflow content absorbed into executable workflow/docs |
| `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` | Retire | Durable workflow content absorbed into executable workflow/docs |
| `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` | Modify | Rewrite around framework + executable tracks |
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
| `$A_SOCIETY_RUNTIME_INVOCATION` | Modify | Survives as the sole operator-facing executable reference, authored by Orchestration Developer |
| `$A_SOCIETY_INDEX` | Modify | Register new executable docs/roles; retire old tooling/runtime developer and tooling-doc variables |
| `$A_SOCIETY_PUBLIC_INDEX` | Modify | Retire standalone tooling rows; add executable workflow row; update runtime entry |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | Modify | Replace retired tooling/runtime rationale entries with executable equivalents |
| `$A_SOCIETY_LOG` | Modify | Reframe overlapping executable-layer Next Priorities |
| `$A_SOCIETY_UPDATES_PROTOCOL` | Modify | Reconcile parsing-contract wording with the retired standalone tooling layer |

### Reusable / public instruction surfaces

| Target | Action | Intended outcome |
|---|---|---|
| `$INSTRUCTION_CONSENT` | Modify | Replace direct tooling invocation with executable-capability wording |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | Modify | Replace direct Version Comparator invocation with executable-capability wording |
| `$INSTRUCTION_INDEX` | Modify | Replace direct Path Validator invocation with executable-capability wording |
| `$INSTRUCTION_REQUIRED_READINGS` | Modify | Update worked examples to the new executable role vocabulary |
| `$INSTRUCTION_MACHINE_READABLE_HANDOFF` | Modify | Update fork-point example to the new executable role names |
| `$INSTRUCTION_WORKFLOW_GRAPH` | Modify | Replace standalone-tool assumptions with executable-capability wording |
| `$INSTRUCTION_WORKFLOW_MODIFY` | Modify | Replace explicit `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` wording with executable-capability wording |
| `$INSTRUCTION_WORKFLOW_COMPLEXITY` | Modify | Replace explicit `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` wording with executable-capability wording |
| `$INSTRUCTION_RECORDS` | Modify | Replace standalone Backward Pass Orderer wording with executable-capability wording |

---

## Draft Content

### 1. Standing executable-layer model

#### `$A_SOCIETY_VISION`

- Replace the current tooling-layer and runtime-layer peer paragraphs with one executable-layer paragraph.
- Change the work-product layer count from four to three: library, active, executable.
- State that deterministic helper capabilities are framework services inside the executable layer, not a separate standing tooling layer.

#### `$A_SOCIETY_ARCHITECTURE`

- Replace the two executable peer bullets with:
  - `runtime/` as the standing executable root and operator surface,
  - `tooling/` as a temporary legacy implementation location during migration.
- Reframe the six named deterministic components as executable framework services rather than public/operator-run tooling components.
- Update layer-isolation and placement tests so new permanent executable implementation targets `runtime/`, not `tooling/`.

#### `$A_SOCIETY_STRUCTURE`

- Rewrite the placement test so:
  - standing executable implementation or operator-facing executable docs go to `runtime/`,
  - `tooling/` is only for approved transitional migration state,
  - new permanent placements must not target `tooling/`.

### 2. Developer-role replacement and surviving operator-surface ownership

#### Retire

- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`
- `$A_SOCIETY_TOOLING_DEV_INVOCATION`
- `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`
- `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`

#### Create

##### `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE`

Owns deterministic framework services such as validation, update comparison, consent creation/checking, backward-pass ordering, handoff validation, and scaffolding support.

Standing boundary:

- no architecture decisions,
- no orchestration/session-model decisions,
- no standing public/operator-facing executable reference by default.

Support doc:

- `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE`

##### `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE`

Owns:

- session lifecycle,
- context injection,
- handoff routing,
- provider integration,
- CLI/operator behavior,
- observability,
- improvement orchestration,
- and `runtime/INVOCATION.md` as the standing operator-facing executable reference.

Support doc:

- `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE`

#### Explicit surviving operator-surface ownership rule

The revised standing rule is:

- **`runtime/INVOCATION.md` is authored and updated by the Orchestration Developer as an implementation deliverable.**
- **The Curator registers and verifies that existing document against the implemented executable surface.**
- **No separate tooling invocation reference survives by default.**
- **Framework Services Developer does not own a standing operator-facing reference unless a future Owner-approved design explicitly creates one.**

This rule must appear consistently in:

- `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE`,
- `$A_SOCIETY_CURATOR_ROLE`,
- `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV`,
- and the rationale replacement in `$A_SOCIETY_AGENT_DOCS_GUIDE`.

#### `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

Update the TA from "programmatic tooling layer" design to executable-layer design:

1. executable boundary evaluation,
2. framework-services vs orchestration decomposition,
3. executable-development workflow design,
4. executable design/reference ownership and open questions.

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

1. the two developer tracks are parallel-capable siblings,
2. a flow may traverse one or both tracks,
3. there is one TA integration review and one Owner integration gate,
4. Curator registration follows the shared integration gate.

Retire:

- `$A_SOCIETY_WORKFLOW_TOOLING_DEV`
- `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`

after their durable gating and boundary rules are absorbed into the executable workflow and executable addendum.

#### `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`

Update the Coupling Test so it consults `$A_SOCIETY_EXECUTABLE_COUPLING_MAP` and routes follow-on implementation through `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV`, not the retired tooling workflow.

#### `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`

Rewrite the pattern around:

- Curator / framework-doc track,
- Framework Services Developer track,
- Orchestration Developer track,
- TA design before fork,
- TA integration after join.

### 4. Executable design/reference set

Retire `a-society/a-docs/tooling/` as the standing design home and replace it with `a-society/a-docs/executable/`.

#### `$A_SOCIETY_EXECUTABLE_PROPOSAL`

This becomes the living executable architecture/spec and absorbs:

1. the enduring framework-services content from the current tooling proposal,
2. the enduring runtime Phase 0 architecture design currently stranded in `a-society/a-docs/records/20260327-runtime-orchestrator-mvp/03-ta-to-owner.md`.

That directly closes the standing runtime-design promotion gap rather than carrying it as a follow-on item.

#### `$A_SOCIETY_EXECUTABLE_ADDENDUM`

Owns:

- executable governance and phase constraints,
- role-boundary rules,
- post-launch service/addition protocol,
- convergence/integration requirements,
- the explicit rule that `runtime/INVOCATION.md` is the only default operator-facing executable reference.

#### `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`

Preserve the format-dependency table, but replace tooling-specific invocation-gap framing with executable exposure/ownership framing.

Proposed second table:

| Framework element | Executable capability | Standing exposure status |
|---|---|---|
| `$INSTRUCTION_CONSENT` | Consent creation/checking | Runtime-owned internal service |
| `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` | Update comparison | Runtime-owned internal service |
| `$INSTRUCTION_INDEX` | Index/path validation | Runtime-owned internal service |
| `$INSTRUCTION_WORKFLOW_GRAPH` | Workflow graph validation | Runtime-owned internal service |
| `$GENERAL_IMPROVEMENT` / record-folder `workflow.md` | Backward-pass ordering | Runtime-owned internal service |

This keeps the Coupling Test load-bearing without preserving the obsolete assumption that each executable capability needs a standalone tool-invocation gap entry.

### 5. Support-doc outcomes required by the revision

#### `$A_SOCIETY_TA_ADVISORY_STANDARDS`

Intended outcome:

- replace "tooling component" language with **executable capability** language,
- replace `$A_SOCIETY_TOOLING_COUPLING_MAP` with `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`,
- replace "open invocation gap" with **standing exposure-status / executable-coupling gap** language,
- preserve the requirement that TA advisories surface unresolved executable-coupling consequences.

#### `$A_SOCIETY_CURATOR_ROLE`

Intended outcome:

- registration-scope wording no longer names `tooling/INVOCATION.md` as a standing executable deliverable,
- role text states explicitly that `runtime/INVOCATION.md` is authored by the Orchestration Developer and registered/verified by the Curator,
- role text states that no separate tooling invocation surface survives by default.

#### `$A_SOCIETY_OWNER_BRIEF_WRITING`

Intended outcome:

- replace "Tooling Developer or Runtime Developer" references with **Framework Services Developer or Orchestration Developer**,
- rewrite executable verification-boundary guidance so it refers to the new responsibility split and to `runtime/` plus any remaining legacy executable locations,
- replace the tooling-development-specific Curator-scope rule with an executable-development equivalent that cross-checks registration, update-report, and surviving operator-surface obligations.

#### `$A_SOCIETY_OWNER_CLOSURE`

Intended outcome:

- replace "tooling or runtime flow" wording with **executable-development flow** wording,
- replace cross-consumer verification across `tooling/` and `runtime/` with verification across `runtime/` and any remaining legacy executable implementation locations,
- replace "ignored by the Version Comparator" wording with **ignored by the executable update-comparison capability** wording.

#### `$A_SOCIETY_UPDATES_PROTOCOL`

Intended outcome:

- replace "programmatic tooling may depend" with wording that the stable contract is depended on by A-Society's **executable update-comparison capability**,
- replace explicit "Version Comparator implementation" maintenance references with executable-capability wording,
- preserve the contract and concurrent-maintenance rule while removing the retired standalone-tooling-layer framing.

### 6. Public/internal index and operator-surface remap

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
- revise `$A_SOCIETY_RUNTIME_INVOCATION` as the sole operator-facing executable reference
- revise `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` to say framework + executable tracks

#### `$A_SOCIETY_INDEX`

Register:

- new developer role/support-doc variables,
- new executable-doc variables,
- new executable workflow variable

Retire:

- old tooling/runtime-developer role/support-doc variables,
- old tooling-doc variables,
- old tooling/runtime workflow variables,
- old standalone tooling component-path variables.

### 7. Reusable instruction updates

#### `$INSTRUCTION_CONSENT`

Replace direct `$A_SOCIETY_TOOLING_CONSENT_UTILITY` invocation wording with executable-capability wording plus the existing manual fallback.

#### `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`

Replace direct `$A_SOCIETY_TOOLING_VERSION_COMPARATOR` invocation wording with executable update-comparison capability wording plus the existing manual fallback.

#### `$INSTRUCTION_INDEX`

Replace direct `$A_SOCIETY_TOOLING_PATH_VALIDATOR` invocation wording with executable validation-capability wording.

#### `$INSTRUCTION_REQUIRED_READINGS`

Update the multi-word-role examples and worked example map from:

- `tooling-developer`
- `runtime-developer`

to:

- `framework-services-developer`
- `orchestration-developer`

#### `$INSTRUCTION_MACHINE_READABLE_HANDOFF`

Update the fork-point example from Tooling Developer / Runtime Developer to Framework Services Developer / Orchestration Developer.

#### `$INSTRUCTION_WORKFLOW_GRAPH`

Keep the schema unchanged, but replace standalone-tool framing with executable-capability wording.

#### `$INSTRUCTION_WORKFLOW_MODIFY`

Correct the source-verification issue directly:

- replace "run `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` if available" with capability wording aligned to the unified executable model.

#### `$INSTRUCTION_WORKFLOW_COMPLEXITY`

Correct the source-verification issue directly:

- replace "This is the input for `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` if available" with capability wording aligned to the unified executable model.

#### `$INSTRUCTION_RECORDS`

Replace standalone Backward Pass Orderer wording with executable-capability wording; the `workflow.md` convention itself is unchanged.

### 8. `$A_SOCIETY_AGENT_DOCS_GUIDE`

Replace the rationale set for the retired tooling/runtime developer, workflow, tooling-folder, and tooling-invocation entries with new rationale entries for:

- framework-services developer role and support doc,
- orchestration developer role and support doc,
- executable workflow,
- executable doc folder and its standing docs,
- legacy executable TA assessment record,
- runtime invocation as the sole operator-facing executable reference.

### 9. Named Next Priorities remap

#### Absorbed by this setup flow

| Current item | Proposed handling |
|---|---|
| **Runtime architecture design registration and record-artifact promotion rule** | Absorb by promoting the enduring runtime design into `$A_SOCIETY_EXECUTABLE_PROPOSAL` and defining the standing promotion rule in the executable design/reference model. |

#### Follow-on executable implementation work

| Current item | Proposed post-setup routing |
|---|---|
| **Tooling version-comparator hermeticity** | Refile under the executable workflow, Framework Services Developer track. |
| **Machine-readable handoff validator (Component 8)** | Refile under the executable workflow, Framework Services Developer track, as a runtime-owned framework service unless a later design explicitly exposes it differently. |
| **Runtime integration test infrastructure** | Refile under the executable workflow, Orchestration Developer track. |
| **Runtime observability contract completion** | Refile under the executable workflow, Orchestration Developer track. |

#### Obsolete after setup

| Current item | Why obsolete |
|---|---|
| **Tooling invocation repo-root execution note** | Obsolete if `$A_SOCIETY_TOOLING_INVOCATION` is retired. Do not migrate the note into the new standing model. |

---

## Update Report Draft

### Submission Status

- **Implementation status:** Not yet complete. This draft is included at Phase 1 so the Owner can review it alongside the corrected structural proposal.
- **Files changed:** Planned adopter-facing changes are currently expected in `$INSTRUCTION_CONSENT`, `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`, `$INSTRUCTION_INDEX`, `$INSTRUCTION_REQUIRED_READINGS`, `$INSTRUCTION_MACHINE_READABLE_HANDOFF`, `$INSTRUCTION_WORKFLOW_GRAPH`, `$INSTRUCTION_WORKFLOW_MODIFY`, `$INSTRUCTION_WORKFLOW_COMPLEXITY`, `$INSTRUCTION_RECORDS`, and `$A_SOCIETY_PUBLIC_INDEX`.
- **Publication condition:** Publish only after Phase 2 approval of both the structural change and this report draft, followed by Phase 3-4 implementation. Expected version change if approved as drafted: `v32.1` → `v33.0`.

### Draft Report

```markdown
# A-Society Framework Update — 2026-04-09

**Framework Version:** v33.0
**Previous Version:** v32.1

## Summary

A-Society's standing executable model has been unified. The framework no longer presents a separate public/operator-facing tooling layer alongside the runtime; instead, deterministic helper operations are treated as executable capabilities inside one executable layer, with the runtime as the surviving operator-facing surface.

Projects that created standalone tooling invocation docs, public tooling component-path rows, or copied A-Society's direct-tool-invocation guidance should review those surfaces and update them where needed.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 1 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Standalone tooling-invocation guidance replaced by executable-capability guidance

**Impact:** Breaking
**Affected artifacts:** `general/instructions/consent.md`, `general/instructions/a-society-version-record.md`, `general/instructions/indexes/main.md`, `general/instructions/workflow/graph.md`, `general/instructions/workflow/modify.md`, `general/instructions/workflow/complexity.md`, `general/instructions/records/main.md`
**What changed:** These instructions no longer direct agents to invoke standalone A-Society tooling components by public variable name. They now describe executable capabilities generically and assume that, when a project automates these operations, the capability may be runtime-owned or otherwise internal rather than a standalone public tool surface.
**Why:** The old wording exposed implementation details as if they were stable operator contracts and preserved the retired tooling/runtime split even after the executable layer was unified.
**Migration guidance:** If your project created public index rows, operator docs, or role guidance that tell agents to run standalone helper executables for consent creation, update comparison, index/path validation, workflow ordering, or workflow validation solely because A-Society's instructions said to do so, review whether those helpers are actually meant to be public/operator-facing. If they are internal executable services, retire the public rows, update the relevant instructions to capability-based wording, and keep the manual fallback path available.

---

### Worked examples updated to the new executable-role vocabulary

**Impact:** Recommended
**Affected artifacts:** `general/instructions/roles/required-readings.md`, `general/instructions/communication/coordination/machine-readable-handoff.md`
**What changed:** Worked examples that previously used `Tooling Developer` and `Runtime Developer` now use `Framework Services Developer` and `Orchestration Developer`.
**Why:** The old example names preserved a standing split that the framework no longer uses.
**Migration guidance:** Review only if your project copied these example role names into its own `agents.md`, `required-readings.yaml`, or handoff examples. If your project already uses different role names, no change is required.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
```

---

## Owner Confirmation Required

The Owner should respond in `owner-to-curator.md` with one of:

- **APPROVED** — with any implementation constraints
- **REVISE** — with specific required changes
- **REJECTED** — with rationale

If approved, implementation should proceed with the corrected scope, including the support-doc rewrites and the explicit operator-surface ownership rule.
