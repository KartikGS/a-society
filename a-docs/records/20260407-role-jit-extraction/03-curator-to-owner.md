---
type: curator-to-owner
date: "2026-04-07"
---

**Subject:** role-jit-extraction — apply JIT role-doc extraction across Owner, Technical Architect, Curator, Tooling Developer, and Runtime Developer
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-04-07

---

## Trigger

Human-directed framework change surfaced through this flow's Owner brief: apply `$A_SOCIETY_ADOCS_DESIGN` consistently across the remaining A-Society role documents, remove residual Owner-role redundancy, and convert role-specific execution guidance into just-in-time support documents.

---

## Pre-Proposal Verification

### 1. TA decomposition recommendation: one extracted standards document

I re-read the full `## Advisory Standards` and `## a-docs/ Format Dependencies` surfaces in `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`.

Recommendation: extract them into **one** JIT document, not two:
- `a-docs/roles/technical-architect/advisory-standards.md`
- proposed variable: `$A_SOCIETY_TA_ADVISORY_STANDARDS`

Rationale:
- The current standards surface is one cohesive advisory-quality surface.
- Only one rule in the section is explicitly integration-review-specific; creating a second file would produce a one-rule document.
- One-file extraction preserves the brief's "move content verbatim" constraint cleanly. A two-file split would require redistributing or re-framing rules rather than moving the section as written.
- This still resolves the startup-context violation: the TA no longer loads the standards at every session start, only when entering advisory or integration-review work.

`## a-docs/ Format Dependencies` should move with the standards document rather than remain inline. It is advisory-execution guidance, not role identity.

### 2. Curator Standing Checks should move into the extracted practices document

The `## Standing Checks` section in `$A_SOCIETY_CURATOR_ROLE` is not a universal session-start invariant:
- `Cross-layer consistency` applies when the Curator is drafting or implementing documentation changes.
- `Cross-item consistency within target files` is explicitly implementation-phase guidance.

Recommendation:
- Extract `## Standing Checks` together with `## Implementation Practices` into the new Curator support document.
- Keep the Owner-proposed filename and variable:
  - `a-docs/roles/curator/implementation-practices.md`
  - `$A_SOCIETY_CURATOR_IMPL_PRACTICES`

The role doc should then point to this file when the Curator is preparing a proposal or implementing approved changes.

### 3. Developer Escalation Triggers should remain inline

Recommendation: keep `## Escalation Triggers` inline in both `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` and `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`.

Rationale:
- These are role-level routing rules, not phase-specific execution detail.
- They match the same inline pattern already used by `$A_SOCIETY_CURATOR_ROLE` (`## Escalate to Owner When`) and `$A_SOCIETY_OWNER_ROLE` (`## Escalate to Human When`).
- Every Developer session is an implementation session, so these triggers remain universally relevant whenever the role is active.

### 4. `a-docs-guide` propagation needs both additive entries and accuracy edits

The brief correctly scopes new-file entries in `$A_SOCIETY_AGENT_DOCS_GUIDE`, but re-reading the current guide shows that at least three existing entries also become stale if this flow lands:

- `$A_SOCIETY_OWNER_ROLE` currently says the role file owns review criteria and standing review-artifact guidance; those move to a new JIT doc in this flow.
- The existing `roles/owner/` folder entry currently names only three Owner support documents; after this flow it will hold five.
- `$A_SOCIETY_CURATOR_ROLE` currently says the role file owns `current active work`; that section is removed in this flow.

Recommendation: treat these as in-scope accuracy updates to `$A_SOCIETY_AGENT_DOCS_GUIDE` in addition to the new-file entries.

---

## What and Why

This proposal completes the just-in-time role-document model established in the prior flow.

The current state is uneven:
- `$A_SOCIETY_OWNER_ROLE` still carries review and log-management execution detail that belongs in support docs.
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` loads the full advisory standards surface at every session start even though it is needed only during advisory and review work.
- `$A_SOCIETY_CURATOR_ROLE` still carries proposal/implementation guidance and stale project-state content inline.
- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` and `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` still carry implementation-execution detail inline.
- `$A_SOCIETY_REQUIRED_READINGS` still forces the Tooling Developer to load two heavy design documents at every session start, even though the Developer only needs them when a scope-boundary or original-spec question arises.

The proposed change makes each role file a cleaner routing surface:
- role identity, authority, hard rules, and escalation remain inline
- phase-specific or execution-specific instructions move to role-local support docs
- startup required readings stay minimal
- the new support docs are registered and documented so the pattern is maintainable rather than implicit

This is an A-Society-internal maintenance change. No `general/` content changes and no update report are involved.

---

## Where Observed

A-Society — internal.

Observed directly in:
- `$A_SOCIETY_OWNER_ROLE`
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`
- `$A_SOCIETY_CURATOR_ROLE`
- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`
- `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`
- `$A_SOCIETY_REQUIRED_READINGS`

Specific operational gaps observed:
- role files still carry execution detail that should be loaded on demand
- the Tooling Developer startup bundle is heavier than necessary
- the Curator role file still contains project-state content (`## Current Active Work`) rather than routing guidance
- the existing guide entries for Owner and Curator role surfaces will become inaccurate if only new-file entries are added

---

## Target Location

### Existing files to modify

- `$A_SOCIETY_OWNER_ROLE`
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`
- `$A_SOCIETY_CURATOR_ROLE`
- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`
- `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`
- `$A_SOCIETY_REQUIRED_READINGS`
- `$A_SOCIETY_INDEX`
- `$A_SOCIETY_AGENT_DOCS_GUIDE`

### New files to add

- `a-society/a-docs/roles/owner/log-management.md`
  - proposed variable: `$A_SOCIETY_OWNER_LOG_MANAGEMENT`
- `a-society/a-docs/roles/owner/review-behavior.md`
  - proposed variable: `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`
- `a-society/a-docs/roles/technical-architect/advisory-standards.md`
  - proposed variable: `$A_SOCIETY_TA_ADVISORY_STANDARDS`
- `a-society/a-docs/roles/curator/implementation-practices.md`
  - proposed variable: `$A_SOCIETY_CURATOR_IMPL_PRACTICES`
- `a-society/a-docs/roles/runtime-developer/implementation-discipline.md`
  - proposed variable: `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`
- `a-society/a-docs/roles/tooling-developer/invocation-discipline.md`
  - proposed variable: `$A_SOCIETY_TOOLING_DEV_INVOCATION`

### Folder pattern used

Per the brief's Owner decision, use the established `a-docs/roles/[role]/` support-doc pattern for all extracted role-local JIT files.

---

## Draft Content

### 1. Open-question resolutions

#### 1A. OQ-1 — Technical Architect decomposition

**Verdict:** one extracted JIT document.

**Resulting role-doc trigger text:**

Add a new `## Just-in-Time Reads` section to `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`:

```markdown
## Just-in-Time Reads

When producing a technical advisory, component design, or integration review, read `$A_SOCIETY_TA_ADVISORY_STANDARDS`.
```

Remove the inline sections:
- `## Advisory Standards`
- `## a-docs/ Format Dependencies`

Add new support file:
- `$A_SOCIETY_TA_ADVISORY_STANDARDS`

#### 1B. OQ-2 — Curator Standing Checks

**Verdict:** extract `## Standing Checks` into the new Curator support document alongside `## Implementation Practices`.

**Resulting role-doc trigger text:**

Add a new `## Just-in-Time Reads` section to `$A_SOCIETY_CURATOR_ROLE`:

```markdown
## Just-in-Time Reads

When preparing a proposal, implementing approved changes, or completing registration work, read `$A_SOCIETY_CURATOR_IMPL_PRACTICES`.
```

Remove the inline sections:
- `## Standing Checks`
- `## Implementation Practices`
- `## Current Active Work`

Retain inline:
- hard rules
- pattern distillation
- version-aware migration
- escalation section

#### 1C. OQ-3 — Developer Escalation Triggers

**Verdict:** keep `## Escalation Triggers` inline for both Developer roles.

**Resulting role-doc trigger texts:**

Add a new `## Just-in-Time Reads` section to `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`:

```markdown
## Just-in-Time Reads

When implementing or validating runtime changes, read `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`.
```

Add a new `## Just-in-Time Reads` section to `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`:

```markdown
## Just-in-Time Reads

When completing a phase, preparing a completion report, or handing off implementation status, read `$A_SOCIETY_TOOLING_DEV_INVOCATION`.

When you need to understand automation scope boundaries or original component specifications, consult `$A_SOCIETY_TOOLING_PROPOSAL` and `$A_SOCIETY_TOOLING_ADDENDUM`.
```

Remove inline:
- `## Implementation Discipline` from `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`
- `## Tooling Invocation Discipline` from `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`

Keep inline:
- `## Escalation Triggers` in both files

---

### 2. Proposed new support documents

#### 2A. `$A_SOCIETY_OWNER_LOG_MANAGEMENT`

**Proposed file:** `a-society/a-docs/roles/owner/log-management.md`

```markdown
# Owner Log Management

## Log Management and Merge Assessment

The project log `$A_SOCIETY_LOG` — all sections (Current State, Recent Focus, Previous, and Next Priorities). Archived flows are in `$A_SOCIETY_LOG_ARCHIVE`. The log entry recording a closed flow is written by the Owner at Forward Pass Closure. When adding any Next Priorities item (at intake or when receiving synthesis findings), apply the **merge assessment** before filing: scan existing items for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path, or routable as parallel tracks in a single multi-domain flow. Items that would route through different workflow types (e.g., one Framework Dev, one Tooling Dev) may still merge if they share a design area and are cohesive enough to run as independent parallel tracks in a single flow without sequencing conflict. When a merge is identified, replace the existing item(s) with a merged item retaining all source citations. Items are removed when their flows close.
```

#### 2B. `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`

**Proposed file:** `a-society/a-docs/roles/owner/review-behavior.md`

```markdown
# Owner Review Behavior

## How the Owner Reviews an Addition

When a new artifact is proposed for `general/`:

1. **Generalizability test:** Does this apply to a software project, a writing project, and a research project equally? If not, it belongs in a project-specific folder, not in `general/`.

2. **Abstraction level test:** Is this the right level of abstraction? Too specific (assumes a technology or domain) and it does not belong in `general/`. Too vague (says nothing actionable) and it is not useful.

3. **Duplication test:** Does this overlap with something that already exists? If so, should the existing artifact be extended, or is a new artifact genuinely warranted?

4. **Placement test:** Is this in the right folder? Does the folder's governing principle (per `$A_SOCIETY_STRUCTURE`) include this artifact?

5. **Quality test:** Is this written well enough that an agent unfamiliar with the project could read it and produce a correct artifact? If not, it needs more work before entering the library.

## Review Artifact Quality

When a decision artifact (e.g., an Owner-to-Curator approval) makes a specific claim about current file state — for example, "this paragraph is already standalone" or "this field is not present" — verify that claim by re-reading the relevant passage at review time, not from session-start context. Session-start context may reflect the file as it was when the session opened, not as it exists after prior edits in the same session or in prior sessions. A wrong state claim is wasted instruction that the Curator must detect and override; re-reading the relevant passage before issuing the claim eliminates the correction round.

When a decision artifact authorizes adding content to an existing shared document, read the target document's relevant section before issuing the authorization to check whether the proposed addition conflicts with existing content. Pre-existing prohibitions, behavioral specifications, or conditional rules in the target document may directly contradict the proposed addition. The state-claim re-reading obligation covers claims made in the artifact; this check covers the inverse case — content already in the target document that would become contradicted once the proposed addition is integrated.
```

#### 2C. `$A_SOCIETY_TA_ADVISORY_STANDARDS`

**Proposed file:** `a-society/a-docs/roles/technical-architect/advisory-standards.md`

```markdown
# Technical Architect Advisory Standards

## Advisory Standards

These rules apply whenever the Technical Architect produces an advisory or component design.

**Textual output fields must be specified or explicitly delegated.** When an advisory or component design introduces a type or interface that includes a field whose value is a string presented to or parsed by agents (e.g., a `prompt` field, a message template, a generated label), the advisory must either:
- Specify the content format or template for that field, OR
- Explicitly delegate content authorship to the Developer with a concrete reference implementation (e.g., "follow the existing `generateX` function's language pattern")

Implicit delegation — leaving the field underspecified and expecting the Developer to determine content — is a spec gap. It produces approval-stage corrections that should have been in the advisory.

**Data-extraction types must represent parse failure explicitly.** When an advisory defines a type that represents data parsed from model output or other structured external text (tool calls, JSON blocks, YAML frontmatter, handoff blocks), include a typed mechanism for the unparseable state. Do not rely on sentinel keys embedded inside the happy-path payload map (for example `_error` inside `input`). Parse failure is a first-class state of the type system, not an ad-hoc payload convention.

**Record-folder requirements must note the bootstrapping exemption.** When an advisory establishes a new requirement for record folders (e.g., a new required file, a new schema requirement), the advisory must explicitly note that the current flow's record folder is exempt-by-origin from that requirement. State why the current folder cannot conform and what consequence follows (e.g., Component 4 cannot be invoked for this flow). Future agents encountering the folder need this context to distinguish an expected non-conformance from an error.

**Coupling map consultation for component change advisories.** Before completing an advisory that modifies or redesigns a tooling component, check `$A_SOCIETY_TOOLING_COUPLING_MAP` for that component's entry. If there is an open invocation gap (the component exists but no `general/` instruction directs agents to invoke it), surface it in the advisory output. This consultation is a standing advisory obligation — it does not require the Owner to include it in the brief.

**File-existence claims must be verified with a directory-scoped search.** When an advisory or review states that a file exists, does not exist, or must be created, confirm that claim against the target directory directly before asserting it. Do not classify work as "create" versus "modify" from an indirect or mismatched search scope.

**Declared-operational dependencies must be verified for correctness, not just existence.** When a brief or prior artifact says a utility, helper, or other dependency is "already working" and the advisory depends on that behavior, read the implementation enough to verify the claimed behavior before relying on it. If you have verified only existence, describe it only as existing — not as operational. A declared-operational dependency that is load-bearing for the design must be checked with the same care as a file-existence claim.

**Role-sequence algorithms must define per-role pinning semantics and include a worked trace.** When an advisory reduces a node graph to a role order or otherwise deduplicates repeated-role nodes, specify which node occurrence determines each role's position and include a short worked trace using the relevant repeated-role case. A graph algorithm that seems correct on single-occurrence roles can invert traversal order once Owner bookends, joins, or revision loops are present.

**Format-parser claims must be verified against the governing format instruction.** When an advisory says an existing parser, regex, or parse strategy already supports a format, verify that claim against the authoritative format instruction and its worked example — not only against the current implementation's accepted inputs. Distinguish "the implementation currently accepts this" from "this is the documented contract."

**New imports required by the design must be named explicitly.** When specified behavior in an advisory requires adding an import in an existing file, name that import in the advisory rather than leaving it implicit in the described logic. If the import is required for one file's implementation, include it in the relevant prose and in the §8 row for that file. Do not assume the Developer will infer import additions from behavior alone.

**Parameter threading belongs in Interface Changes (§4), not Files Changed (§5).** When a new parameter on a public function must be threaded through to an internal call, specify the full threading path in §4 — not only in the §5 Files Changed table. The Developer reads §4 as the implementation specification; a threading requirement found only in §5 requires the Developer to infer a step that should be explicit. The §5 table is a coverage reference, not a substitute for interface specification.

**"Binding" implementation requirements must specify execution, not just declaration.** When an advisory uses "binding" to describe a trigger rule, invocation requirement, or similar implementation constraint, the advisory must also state explicitly: "real in-process function calls, not stubs or comment placeholders." If "binding" means only that the trigger point is architecturally declared — not that the code must execute it — state that distinction explicitly. Ambiguity between "the rule is declared in the design" and "the rule must execute as a real function call" is a spec gap. It produces stub implementations correctly filed as "no deviation from the spec" — because the spec did not unambiguously require execution.

**Every behavioral requirement in prose must be named in the §8 row for the file it applies to.** The §8 Files Changed table is what a Developer implements against. A behavioral requirement — guard condition, error output with a spec-defined message, required exit behavior, or any non-happy-path condition — that appears only in §1–§7 prose is not structurally present in the Developer's checklist. The Developer who reads §8 and implements exactly what is described there has not deviated from the spec; the spec has an incomplete §8. Before completing an advisory, verify: for every behavioral requirement named in prose (§1–§7), does the corresponding §8 row name it explicitly — not just describe the happy path? If the §8 row describes only the success case, add the non-happy-path behavior as a named requirement in that row.

**Type import sources must be specified when a type crosses module boundaries.** When an interface design names a type that `orient.ts` (or any module) will use, and that type is not currently exported from the module where the Developer would naturally import it, the advisory must either specify the import path explicitly or note that a re-export from the relevant module will be needed. Leaving the import source unspecified when the type is not currently exported from the expected location is a spec gap: it produces an unspecified file change (the re-export addition) that causes a discrepancy between the spec's Files Changed table and the actual implementation.

**Load-bearing identifier mappings must be explicit.** When a design depends on transforming one identifier form into another (for example, a runtime role key into an index variable name), state the mapping rule explicitly, include at least one worked example, and name the failure mode if the mapping does not resolve. Do not leave a naming contract implicit in existing implementation.

**Runtime-injected project documentation must be project-scoped and derived from project context.** When an advisory specifies a file the runtime injects into an agent session, point to the adopting project's instantiated `a-docs/` artifact — not a `general/` template. If the runtime hosts multiple projects, specify the derivation from project context (for example `flowRun.projectRoot`) rather than a hardcoded project path. When the injected behavior depends on a project-specific protocol already documented in `a-docs/`, read that project artifact before designing a new derivation rule.

**Advisory file references must use exact repo-relative paths.** When citing files in advisory prose or the Files Changed table, use the exact repo-relative path as it exists or will exist on disk. Do not abbreviate a directory name or rely on approximate path memory; imprecise paths shift verification cost downstream to the Developer, Curator, and Owner.

**Before proposing new infrastructure or a bypass, enumerate explicitly why the existing path cannot be extended.** When designing a component that touches existing infrastructure, evaluate the extension path before proposing a bypass or parallel implementation. Produce an explicit enumeration: "The existing path cannot be extended because [specific obstacle]." If the enumeration yields a single resolvable obstacle (a hardcoded value, a missing parameter, a configuration gap), the conclusion is "extend the existing path" — not "bypass it." Skipping this enumeration and defaulting to new infrastructure produces unnecessary revision cycles when the extension path was available and was not evaluated.

**This standard applies to dependency selection as well as code architecture.** Before proposing per-case library implementations (separate SDKs per provider, per-format parser, per-service client), enumerate whether a common library interface covers multiple cases: "Library X serves providers A, B, and C via [shared interface]; only provider D requires a separate client." Defaulting to one SDK per target without asking whether a common interface exists is the dependency-selection analogue of the infrastructure bypass — it produces a revision cycle when the common interface is surfaced by the user.

**When a scope recommendation turns on uncertain knowledge of an external API or library, surface the uncertainty as a targeted clarification question before issuing the recommendation.** A scope deferral issued on the basis of uncertain capability knowledge (streaming support, API compatibility, model availability) and then withdrawn on clarification introduces a revision cycle that a targeted question would eliminate. State specifically what you cannot confirm — which API surface, capability, or behavior is uncertain — and what the answer changes about the scope. If the answer is "it works," the scope expands; if it does not, the deferral stands. A question is cheaper than a draft.

**Shared error-propagation paths must assign operator-facing log ownership explicitly.** When an advisory spans multiple layers that may catch, log, and propagate the same error, specify which layer owns the actionable operator-facing log line and which layers remain silent, rethrow, or return status only. Do not assign logging independently to each layer without an ownership rule; that produces compliant-but-duplicative implementations such as double-logging the same failure path.

**Integration review must verify operator-facing reference accuracy when such documentation is in scope.** When a flow modifies an invocation reference or equivalent operator-facing document, compare the documented commands, parameters, and environment-variable names against the implementation during integration review. Treat any mismatch as an integration finding, not as Curator-only cleanup.

**Multi-path modal-symmetry check for design decisions.** When a design change targets a component that has distinct execution paths (for example, interactive and autonomous modes, synchronous and asynchronous paths, TTY and non-TTY paths), verify explicitly that the decision applies symmetrically across all modes — or, if scope is intentionally restricted to a subset of paths, state that restriction and its justification in the advisory. Do not leave mode scope implicit from the brief's framing. A design scoped interactively by example that silently omits the autonomous path requires a full re-draft when the omission is caught; a single sentence of scope declaration prevents the correction.

**Out-parameter mutation contracts must be declared explicitly.** When a behavior requirement is satisfied by mutating a caller-provided argument (out-parameter semantics), the advisory must name it as such: specify that the function is expected to mutate the caller's variable directly, not operate on a local copy. This is distinct from specifying observable external behavior. If the contract is "push to `providedHistory` directly so the orchestrator's copy receives the mutation," that is an out-parameter contract — it must appear explicitly in the advisory. If left implicit, the Developer correctly implements the local-copy default, and the defect is surfaced only at the caller boundary after implementation is complete.

**Brief constraint evaluation must distinguish hard constraints from design preferences.** When a brief contains design constraints, classify each constraint before anchoring to it. Hard constraints are derived from external dependencies, framework invariants, explicit user direction, or immovable prior decisions — they close design space justifiably. Design preferences are the Owner's current thinking about the right approach — they close design space without requiring it. For each constraint that appears to be a design preference, evaluate whether an alternative approach produces a better outcome and surface the comparison explicitly before proceeding. Do not accept a preference as a hard requirement without flagging it. The test: "Is this constraint derived from an invariant or prior decision, or is it describing what the Owner thinks the solution should look like?" If the latter, surface the alternative and ask for explicit confirmation before designing to the constraint.

## a-docs/ Format Dependencies

The coupling map change taxonomy (Types A–F) covers `general/` format dependencies. When a component design requires reading from `a-docs/` content, the taxonomy does not apply — but the co-maintenance obligation does.

For each `a-docs/` format dependency in a component design:

1. **Identify the dependency explicitly.** State which `a-docs/` file the component reads, which fields or sections it parses, and what format it expects.
2. **Document it in the component design.** Add a co-maintenance dependency declaration: "This component reads `$[FILE]` and parses [field names]. If those fields change, this component must be updated."
3. **Recommend handling.** Evaluate whether the component should read the `a-docs/` file directly (appropriate when the format is stable and the parse is simple) or whether a more stable interface is available — such as a `general/` format that encodes the same information. If reading `a-docs/` directly, state in the design that the dependency is not tracked by the coupling map taxonomy and requires manual co-maintenance discipline.
4. **Flag to Owner.** An `a-docs/` format dependency creates a co-maintenance obligation that may not be visible to future Curators maintaining the referenced file. Flag it explicitly in the proposal so the Owner can decide whether the coupling map taxonomy should be extended to cover `a-docs/` dependencies, or whether the manual co-maintenance declaration in the design is sufficient.
```

#### 2D. `$A_SOCIETY_CURATOR_IMPL_PRACTICES`

**Proposed file:** `a-society/a-docs/roles/curator/implementation-practices.md`

```markdown
# Curator Implementation Practices

## Standing Checks

**Cross-layer consistency.** When working on a file in `a-society/general/instructions/`, verify that the corresponding A-Society `a-docs/` artifact aligns with any change made — and vice versa. When cross-layer drift is found, apply the following rule based on scope:
- **Within current brief's scope:** Apply both layers in the same flow. Do not close the flow with known in-scope drift.
- **Outside current brief's scope:** Flag the drift explicitly — in backward-pass findings or a note to the Owner — as a candidate for a future flow. Do not act on out-of-scope drift in the current flow.

Do not expand the current flow's scope to address out-of-scope drift, and do not silently skip flagging it.

**Cross-item consistency within target files.** When implementing a multi-item brief, after completing each item's edits to a target file, scan that file for content made stale by earlier items in the same brief. If edits from one item render other content in the same file inconsistent, address that staleness in the same implementation pass — do not leave a target file in a known-inconsistent state at the end of any item's implementation.

## Implementation Practices

**Proposal stage — behavioral property consistency.** Before submitting any proposal, verify that proposed output language does not contain contradictory behavioral properties (ordering, mutability, timing constraints). Structural placement checks are necessary but not sufficient — semantic consistency between properties must also be verified. A proposal that seeds contradictory terms will have those contradictions reproduced downstream.

**Proposal stage — rendered-content matching.** When proposing content that includes code fences, tables, list structures, or other formatted blocks to be inserted into an existing document, re-read adjacent exemplars in the target file and match their rendering pattern exactly. Do not rely on the brief's presentation format when the target document renders the same kind of content differently.

**Proposal stage — source-claim verification.** When a brief makes a specific claim about the current state of a source document — for example, that an item already exists in another role file or that a precedent has already been implemented — re-read the cited document during proposal preparation and confirm the claim before drafting from it. If the claim cannot be verified, note the discrepancy explicitly in the proposal rather than silently treating the brief's claim as authoritative.

**Implementation stage — terminology sweep for schema changes.** When implementing a schema migration or any change that renames fields, nodes, or other structural terms, sweep adjacent prose in the target files for deprecated vocabulary and update it in the same pass. Treat the schema block and the explanatory prose as one consistency surface.

**Implementation stage — re-read before editing.** Before constructing the `old_string` for any Edit call, re-read the relevant section of the target file to obtain verbatim source text. Brief descriptions describe semantic intent, not verbatim source; relying on them for `old_string` construction causes match failures.

**Implementation stage — verbatim retrieval for technical summaries.** When summarizing technical implementations in registration artifacts or other maintenance documentation, use the exact type names, method signatures, and methodology terms from the approved design or implementation artifacts. Do not substitute generic industry terms for project-specific names.

**Implementation stage — operator-facing references require direct source comparison.** When registration or maintenance touches an operator-facing reference for an executable layer (for example an `INVOCATION.md` file), compare the documented commands, parameters, exposed entry points, and environment-variable names directly against the live implementation or CLI surface. Do not rely on advisory summaries, approval artifacts, or completion-report prose as substitutes for source comparison.

**Implementation stage — public/internal index changes require direct comparison.** When a change adds, retires, or revises a variable that appears in `$A_SOCIETY_PUBLIC_INDEX`, compare the affected rows in both `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` before closing the implementation pass. Do not assume that updating one index propagates to the other automatically.

**Implementation stage — Write vs. Edit for large removals.** When a modification removes a large section (roughly more than ten lines of formatted content), prefer the Write tool over the Edit tool. Constructing an `old_string` for a large removal is error-prone; a full rewrite is more reliable.
```

#### 2E. `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`

**Proposed file:** `a-society/a-docs/roles/runtime-developer/implementation-discipline.md`

```markdown
# Runtime Developer Implementation Discipline

## Implementation Discipline

**Provider adapters must preserve already-classified gateway errors.** If a provider-level catch block receives an `LLMGatewayError` produced earlier in the call path, re-throw it unchanged before applying SDK-specific remapping. Do not re-wrap a classified gateway error into `UNKNOWN` or another provider-specific code.

**One-shot diagnostic scripts do not belong at the runtime root.** Temporary diagnostics created to probe implementation behavior must live in a dedicated diagnostics subdirectory under the runtime layer, not alongside the layer's durable entry points. Remove them before phase completion unless the approved design promotes them into standing test infrastructure.

**History arrays passed by the orchestrator must be mutated directly, not copied.** When `orient.ts` or any session function receives a `providedHistory` array from the orchestrator, treat it as an out-parameter: push new entries directly to `providedHistory` rather than spreading it into a local copy. The orchestrator depends on mutations to `providedHistory` being reflected in its own reference for session persistence — spreading into a local copy severs this reference and causes history loss on abort or session close. This contract is not inferable from type signatures alone; it is an out-parameter requirement imposed by the persistence architecture.
```

#### 2F. `$A_SOCIETY_TOOLING_DEV_INVOCATION`

**Proposed file:** `a-society/a-docs/roles/tooling-developer/invocation-discipline.md`

```markdown
# Tooling Developer Invocation Discipline

## Tooling Invocation Discipline

Pause points for this role:
- After completing a phase and before beginning the next phase — handoff status to the human for orchestration
- When a deviation is identified — immediately escalate to TA; include the specific deviation, the component affected, and what decision is needed
- After integration testing passes — handoff to Owner for Phase 6 approval gate; include the integration test record and the TA assessment

**Completion report:** Upon completing a phase's implementation work, the Developer produces `NN-developer-completion.md` in the active record folder at the next available sequence position. The completion report must use explicit labeled sections so parallel Developer tracks remain comparable at convergence. At minimum include: (1) modified files inventory; (2) implemented behavior in this phase, mapped to the approved spec or advisory section where applicable; (3) verification summary (tests, commands, or other checks, with pass/fail status); (4) any deviations from the approved spec and their resolution status (escalated to TA / resolved / pending); (5) whether the spec requires an update as a result of accepted deviations. This creates a first-party implementation record that the Owner and Curator can cite without normalizing ad hoc artifact shapes.

**Exact-path discipline.** In completion reports and backward-pass findings, use the exact repo-relative path for every cited file as it exists on disk. Do not abbreviate parent directories, use absolute paths, or use `file://` URLs; TA and Curator verification depend on path-faithful, repo-relative artifacts.
```

---

### 3. Proposed role-file modifications

#### 3A. `$A_SOCIETY_OWNER_ROLE`

**Workflow routing bullet**

Replace the current workflow-routing bullet with exactly:

```markdown
- **Workflow routing** — routing work into the appropriate workflow by default. When the user makes a request, read `$A_SOCIETY_WORKFLOW` to route it.
```

**Project-log responsibility bullet**

Replace the current project-log bullet with:

```markdown
- The project log `$A_SOCIETY_LOG` — all sections (Current State, Recent Focus, Previous, and Next Priorities). Archived flows are in `$A_SOCIETY_LOG_ARCHIVE`. The log entry recording a closed flow is written by the Owner at Forward Pass Closure. When managing the log or filing Next Priorities items, read `$A_SOCIETY_OWNER_LOG_MANAGEMENT`.
```

**Remove inline sections**
- `## How the Owner Reviews an Addition`
- `## Review Artifact Quality`

**Expand `## Just-in-Time Reads` to:**

```markdown
## Just-in-Time Reads

When writing a brief or review constraint, read `$A_SOCIETY_OWNER_BRIEF_WRITING`.

When reviewing an addition, read `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`.

When managing `$A_SOCIETY_LOG` or `$A_SOCIETY_LOG_ARCHIVE`, read `$A_SOCIETY_OWNER_LOG_MANAGEMENT`.

When reviewing a TA advisory or TA integration report, read `$A_SOCIETY_OWNER_TA_REVIEW`.

When closing a forward pass, read `$A_SOCIETY_OWNER_CLOSURE`.
```

#### 3B. `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

Insert:

```markdown
## Just-in-Time Reads

When producing a technical advisory, component design, or integration review, read `$A_SOCIETY_TA_ADVISORY_STANDARDS`.
```

Remove inline:
- `## Advisory Standards`
- `## a-docs/ Format Dependencies`

Keep inline:
- identity, authority, hard rules, primary work output, escalation

#### 3C. `$A_SOCIETY_CURATOR_ROLE`

Insert:

```markdown
## Just-in-Time Reads

When preparing a proposal, implementing approved changes, or completing registration work, read `$A_SOCIETY_CURATOR_IMPL_PRACTICES`.
```

Remove inline:
- `## Standing Checks`
- `## Implementation Practices`
- `## Current Active Work`

Keep inline:
- role identity and scope
- hard rules
- pattern distillation
- version-aware migration
- escalation

#### 3D. `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`

Insert:

```markdown
## Just-in-Time Reads

When implementing or validating runtime changes, read `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`.
```

Remove inline:
- `## Implementation Discipline`

Keep inline:
- `## Escalation Triggers`

#### 3E. `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`

Insert:

```markdown
## Just-in-Time Reads

When completing a phase, preparing a completion report, or handing off implementation status, read `$A_SOCIETY_TOOLING_DEV_INVOCATION`.

When you need to understand automation scope boundaries or original component specifications, consult `$A_SOCIETY_TOOLING_PROPOSAL` and `$A_SOCIETY_TOOLING_ADDENDUM`.
```

Remove inline:
- `## Tooling Invocation Discipline`

Keep inline:
- `## Escalation Triggers`

---

### 4. Proposed required-readings change

#### `$A_SOCIETY_REQUIRED_READINGS`

Replace the `tooling-developer` list with:

```yaml
  tooling-developer:
    - $A_SOCIETY_TOOLING_DEVELOPER_ROLE
    - $A_SOCIETY_ARCHITECTURE
```

No other role list changes are proposed in this flow.

---

### 5. Proposed index additions

Add these rows to `$A_SOCIETY_INDEX`:

| Variable | Current Path | Description |
|---|---|---|
| `$A_SOCIETY_OWNER_LOG_MANAGEMENT` | `a-society/a-docs/roles/owner/log-management.md` | A-Society Owner log-management guidance — loaded when the Owner manages the project log or files Next Priorities |
| `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR` | `a-society/a-docs/roles/owner/review-behavior.md` | A-Society Owner review-behavior guidance — loaded when the Owner reviews a proposed addition |
| `$A_SOCIETY_TA_ADVISORY_STANDARDS` | `a-society/a-docs/roles/technical-architect/advisory-standards.md` | A-Society Technical Architect advisory standards — loaded when the TA produces an advisory or integration review |
| `$A_SOCIETY_CURATOR_IMPL_PRACTICES` | `a-society/a-docs/roles/curator/implementation-practices.md` | A-Society Curator proposal and implementation practices — loaded when the Curator prepares a proposal or implements approved changes |
| `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE` | `a-society/a-docs/roles/runtime-developer/implementation-discipline.md` | A-Society Runtime Developer implementation discipline — loaded when the Runtime Developer implements or validates runtime changes |
| `$A_SOCIETY_TOOLING_DEV_INVOCATION` | `a-society/a-docs/roles/tooling-developer/invocation-discipline.md` | A-Society Tooling Developer invocation discipline — loaded at phase handoff and completion-report moments |

---

### 6. Proposed `a-docs-guide` updates

#### 6A. New-file entries to add

Add new guide entries for:
- `$A_SOCIETY_OWNER_LOG_MANAGEMENT`
- `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`
- `$A_SOCIETY_TA_ADVISORY_STANDARDS`
- `$A_SOCIETY_CURATOR_IMPL_PRACTICES`
- `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`
- `$A_SOCIETY_TOOLING_DEV_INVOCATION`

Each should follow the existing support-doc pattern:
- why it exists
- what it owns
- what breaks without it
- do-not-consolidate guidance back to the parent role file and sibling support docs where applicable

#### 6B. Existing guide entries to correct

**`roles/owner.md` — `$A_SOCIETY_OWNER_ROLE`**

Update `What it owns` to remove inline review-behavior ownership and instead describe the role file as:
- authority and responsibilities
- pushback posture
- routing pointers to Owner support documents

**`roles/owner/` — folder**

Update `What it owns` from three support documents to five:
- `brief-writing.md`
- `review-behavior.md`
- `log-management.md`
- `ta-advisory-review.md`
- `forward-pass-closure.md`

**`roles/curator.md` — `$A_SOCIETY_CURATOR_ROLE`**

Update `What it owns` to remove `current active work` and describe the role file as:
- maintenance scope
- hard rules
- pattern distillation and migration obligations
- routing pointer to the Curator practices document

**`roles/technical-architect.md` — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`**

Recommended accuracy refinement: add the routing pointer to the TA standards doc to the `What it owns` description, since the role file will no longer own the standards inline.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
