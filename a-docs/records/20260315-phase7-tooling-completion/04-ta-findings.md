---
artifact: 04-ta-findings
flow: 20260315-phase7-tooling-completion
from: Technical Architect
to: Curator (synthesis)
---

# TA Findings — Programmatic Tooling Layer Implementation

**Flow:** 20260315-phase7-tooling-completion
**Scope:** Full review of the implemented tooling layer — six components, INVOCATION.md — compared against the architecture proposal, addendum, and Phase 1–2 deviation rulings.

---

## 1. Overall assessment

The implementation is sound. The automation boundary held across all six components — none overstep into judgment or agent territory. The error model is consistent and correctly separates tool errors from framework state gaps. Two structural patterns emerged from implementation that improve on the spec and should be carried forward as defaults for all future tooling work.

Two previously assessed deviations (Component 6 VERSION.md history source; Component 2 hardcoded rendering) were resolved at the spec layer and are not revisited here. What follows is a fresh-eyes review of the full layer.

---

## 2. What worked

### The automation boundary held

Every component does exactly what was defined: compute, validate, create, or check — and return structured results for agents to interpret. No component makes a judgment call. No component modifies files it wasn't designed to modify. The scaffolding system doesn't decide which files a project needs; the backward pass orderer doesn't evaluate whether work at each node was good; the consent utility doesn't make the consent decision. These boundaries held throughout implementation without erosion.

### The error model is consistent and architecturally correct

The implemented error convention — documented in INVOCATION.md's "Error conventions" section — distinguishes between two failure categories:

- **Tool misuse** (missing required parameter, unknown feedback type): throws synchronously. The agent receives a clear exception before any file I/O occurs.
- **Framework state gaps** (index drift, missing source templates, missing consent files): returns a `status: 'missing'` or `{ status: 'failed' }` entry. The agent receives structured output it can report on without the tool crashing.

This distinction matters operationally. An agent running path validation against a live repo expects to receive `missing` entries for drifted paths — that's the tool working correctly. A throw would indicate the agent called the tool wrong. Getting this wrong would make the tools unreliable in the cases they're most needed (diagnosing framework state problems). The implementation got it right.

The spec did not specify this convention explicitly — it emerged from implementation. It should be made explicit in the spec as a standard for all future components.

### The two-tier entry point pattern

Two components independently arrived at the same structural pattern:

- **Scaffolding System:** `scaffold(entries[])` (lower-level) + `scaffoldFromManifestFile(manifestPath)` (high-level wrapper)
- **Backward Pass Orderer:** `orderFromGraph(parsedDoc)` (lower-level) + `orderFromFile(filePath)` (high-level wrapper)

The lower-level function takes in-memory data and has no filesystem dependencies beyond what the caller provides. The high-level function loads from disk and delegates to the lower-level function. This pattern is excellent for two reasons: (1) it makes components independently testable at the unit level without requiring real files; (2) it gives agents a simple primary invocation while keeping the lower-level function available for composition or partial workflows. This should be the standard pattern for all future tooling components.

### Workflow graph validator's referential integrity checks

The Component 3 implementation validates more than the schema requires. In addition to field types and required fields, it checks:

- Edge `from` and `to` fields reference real node IDs (not just any string)
- Node `phase` fields reference real phase IDs
- Node IDs are unique within the graph
- Phase IDs are unique within the graph
- Exactly one node has `is_synthesis_role: true`

These referential integrity checks are not enumerated in the spec's schema draft. They are justified: the backward pass orderer's algorithm depends on the synthesis node constraint, and edge validity depends on node ID correctness. Validating structural preconditions at schema time — before the consuming tool runs — is the right design principle. Future schema validators should include referential integrity checks by default, not as optional enhancements.

### Consent file routing in the Scaffolding System

The `detectFeedbackConsentType` function routes all paths matching `feedback/*/consent.md` through the Consent Utility, regardless of whether the manifest entry specifies `scaffold: 'stub'` or `scaffold: 'copy'`. This is a correct and safe override: it ensures consent-specific rendering is always applied to consent files, even if a manifest author inadvertently assigns the wrong scaffold type. The routing is structural (path pattern match) rather than relying on the manifest author to use the right scaffold type. This is a defensive implementation choice that prevents a class of subtle bugs.

### The `**Project:**` field in consent files

The Consent Utility adds a `**Project:**` field (project name) to rendered consent files. This field is not in the template. The `checkConsent` function parses only `**Consented:**`, so the addition doesn't break the check operation. More importantly: it's genuinely useful. A consent file in a project's `a-docs/` without the project name is harder to audit and reason about. The field is within Developer implementation authority. Accept and leave as-is.

---

## 3. What needs attention

### The `_updatesDir` dead parameter (Component 6)

As noted in the Phase 1–2 assessment ruling: the `_updatesDir` parameter is accepted by `compareVersions` but never used. INVOCATION.md documents it as `null` in the example invocation and notes it is "accepted but unused." The spec has been updated to reflect this. The parameter remains as dead code in the implementation.

Two paths forward for v2: (1) remove the parameter and simplify the interface; (2) retain it and use it for a sanity check — confirm the updates directory exists and is readable, even though reports are identified from VERSION.md. Option 2 adds a low-cost operational guard. Either is acceptable. **This is a decision for the next tooling iteration; it does not block the current layer.**

### Stub files have no content guidance beyond a path comment

`renderStub` produces:
```
# Vision

<!-- Stub — fill in per general/instructions/project-information/vision.md -->
```

This is correct per spec ("empty or minimally templated"). However, agents invoking the scaffold will receive a file that exists but carries no content — only a pointer to the instruction document. Agents will then load the instruction document separately before drafting content. This is by design (the scaffold's job is structure, not content), but it means the Initializer agent's workflow is: scaffold → load each instruction document → draft each file. The stub comment is functional but terse. Whether the instruction path alone is sufficient guidance, or whether stubs should carry more forward-reference context, is a usability question for the Initializer agent's owners to assess after the first real initialization run.

### Missing-filter edge case in backward pass orderer

If `firedNodeIds` is provided but contains no IDs that match any non-synthesis node in the graph, and the synthesis node ID is also absent, the orderer returns an empty array. This is mathematically correct: no nodes fired, no backward pass. However, agents receiving an empty array may not immediately distinguish "empty backward pass (trivial instance)" from "all IDs mismatched (bug in the caller)." INVOCATION.md is silent on this case. Worth documenting in a future INVOCATION.md update.

### `required: true` filter relies on explicit field presence

`scaffoldFromManifestFile` filters manifest entries with `f.required === true`. If a manifest entry omits the `required` field entirely, it is excluded from the default (required-only) scaffold run. This is a correct and conservative default — manifests should be explicit. But manifest authors need to understand that omitting `required` is not the same as setting `required: false`; both produce the same behavior (excluded from default run), but the intent differs. The manifest schema documentation should state this explicitly to prevent authoring errors.

---

## 4. Gaps between spec and implementation worth recording

These are not deviations requiring correction — they are spec deficiencies the Developer resolved correctly. They are recorded here so future TA work starts from better specs.

**Component 5 (Path Validator) — missing `repoRoot` parameter in spec.** The spec said "accepts: path to an index file." Index paths in A-Society resolve relative to the repo root, not relative to the index file. The implementation correctly adds `repoRoot` as a required parameter. The spec should have specified this. Future component specs must enumerate all parameters, including those that seem implicit from the framework's path conventions.

**Component 4 (Backward Pass Orderer) — `node-id: string` vs `node_ids: string[]`.** The spec described the output as "tuples of `(position, role, node-id)`" — singular node ID. The implementation correctly returns `node_ids: string[]` to handle roles that fire multiple times. The spec failed to anticipate this case because the schema allows a role to appear in multiple nodes. Correct output: the array form. Future TA specs should model output formats against all valid schema inputs, not just the simple case.

**Component 6 (Version Comparator) — parsed version objects vs strings.** The spec implied string version stamps in the output. The implementation returns `{ major: number, minor: number }` objects for both `projectVersion` and `currentVersion`, and the same structure per report in `unappliedReports`. This is strictly better for an agent-consumed interface: direct numeric comparison, no reparsing. Correct implementation. Future specs should specify output types as structured objects when the data has internal structure.

---

## 5. Generalizable findings for future tooling work

These findings apply beyond this layer — to any future A-Society tooling component.

**1. The automation boundary must be stated in the spec, not just implied.**
The design principle — automate the rule-bound, leave the judgment-bound to agents — held in this layer because the TA proposal articulated it explicitly as a governing question for every component. Future TA proposals should state the automation boundary for each component in the same terms: what is this component explicitly not allowed to decide? Without that explicit statement, implementation drift toward adding judgment is a real risk.

**2. Specify the error model as a first-class output.**
The error convention (throw vs. status) emerged from implementation rather than being specified. It should be a standard section in every component spec: under what conditions does the component throw, and under what conditions does it return structured failure output? These are different enough to warrant explicit specification — they have different implications for the calling agent's error handling.

**3. Two-tier entry points are the correct default pattern.**
Every component that reads from disk should have a lower-level function that accepts in-memory data and a high-level wrapper that reads from disk and delegates. The lower-level function is for unit testing and composition; the high-level function is the primary agent invocation. Spec this pattern explicitly for each component rather than leaving it to the Developer's discretion.

**4. Referential integrity validation belongs in schema validators by default.**
The workflow graph validator's edge-to-node and node-to-phase referential integrity checks prevent downstream components from operating on inconsistent data. Any future schema validator should enumerate its referential integrity checks in the spec, alongside the field-type constraints.

**5. Co-maintenance dependencies must appear in INVOCATION.md, not just in specs.**
Both co-maintenance dependencies identified in Phase 1–2 (consent utility + template; version comparator + VERSION.md history) appear correctly in INVOCATION.md. This is the right location: it's where maintainers look when they're about to invoke a tool, not when they're reading the original design proposal. Future specs should explicitly require co-maintenance dependencies to be documented in INVOCATION.md, not just in the component design.

**6. The manifest `required` field pattern is portable.**
The distinction between required and optional entries in a machine-readable manifest, with a `required: boolean` field, is a useful pattern wherever A-Society needs to enumerate a set of artifacts with different inclusion rules. It is simple, human-readable, and directly filterable. If future tooling components need similar enumeration (e.g., a set of roles, a set of feedback types, a set of instruction documents), the manifest pattern is worth adopting.

---

## 6. Items for the Curator's synthesis

The following items from this assessment warrant attention in the Curator's synthesis:

1. **Error model convention** — should be formalized in `general/instructions/` as a standard for tooling component design, so it doesn't have to be re-derived in future implementation phases.

2. **Two-tier entry point pattern** — should be added to the tooling specification conventions, either in the TA role document or in a tooling design instruction.

3. **INVOCATION.md gap: missing-filter edge case** — a future update to INVOCATION.md should document what an empty backward pass order result means and when agents should treat it as a signal of an unexpected state.

4. **Manifest `required` field authoring guidance** — the manifest schema documentation (wherever `general/manifest.yaml` is documented) should explicitly state that omitting `required` is not the same as `required: false`, and that all entries should be explicit.

5. **Phase 1–2 deviation rulings are now superseded** — the `$A_SOCIETY_TOOLING_PROPOSAL` spec has been updated with the correct descriptions for Component 2 and Component 6. The assessment document (`tooling-ta-assessment-phase1-2.md`) is now a historical record of the ruling and the reasoning, not an action item.

---

*Assessment complete. No implementation changes recommended.*
