---
artifact: 05-developer-findings
flow: 20260315-phase7-tooling-completion
from: Tooling Developer
to: Curator (synthesis)
---

# Developer Findings — Programmatic Tooling Layer Implementation

**Flow:** 20260315-phase7-tooling-completion
**Scope:** Backward pass reflection on all implementation phases — Phase 1 (Path Validator, Version Comparator), Phase 2 (Consent Utility), Phase 4 (Workflow Graph Validator, Backward Pass Orderer), Phase 5 (Scaffolding System), Phase 6 (Integration Validation, INVOCATION.md).

---

## 1. What worked

### The phased sequencing held up under real implementation pressure

The TA's sequencing — primitives first (Components 5, 6), then writing tools (Component 2), then the graph layer (Components 3, 4), then the integrating component (Component 1) — was not just a project management choice. It meant that when the Scaffolding System was implemented, the Consent Utility was already complete and tested, so routing consent files through it was a one-line call rather than an inline implementation. Dependency order as implementation order is worth preserving in future multi-component tooling phases.

### Test-against-live-framework as a forcing function

Running each component against live A-Society files immediately — rather than deferring to a final validation pass — caught two categories of real problems:

- **Tool bugs** (the backtick-wrapped path issue in the Path Validator — paths in the index are formatted as `` `/path/to/file` ``; the initial implementation read them verbatim and reported every path as missing)
- **Framework state gaps** (index drift for `$A_SOCIETY_FEEDBACK_MIGRATION`, `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL`, `$GENERAL_IMPROVEMENT_PROTOCOL`; missing TEMPLATE source files in `general/communication/conversation/`)

If the live tests had been deferred to Phase 6, the backtick bug might have been diagnosed as framework drift rather than a tool bug, and fixing it would have required re-validating all downstream work. Running live as part of each phase's test suite made the distinction between "tool error" and "framework state gap" clear, and forced that distinction to be encoded into the test design (framework state failures as informational `[info]` output, not hard failures).

### The algorithm correctness was verifiable from prose

The backward pass orderer is the component with the most algorithmic content. The correctness criterion — does the output match what `$A_SOCIETY_IMPROVEMENT` describes? — was checkable by reading the improvement document and tracing through the live workflow's node structure by hand, then asserting that the test output matched. This produced the live workflow test case, which became the integration anchor for the backward pass algorithm. Having a human-readable specification (the improvement document) alongside the machine-readable graph (the workflow frontmatter) meant there was a ground truth to check against that didn't require trusting the tool to verify itself.

### Informational vs. failing test distinction preserved suite usability

The decision to make framework state failures informational (printed as `[info]`, not fail-the-process) preserved the utility of `npm test` as a routine development signal. If index drift caused test failures, a developer running the suite in a normal session would be blocked by failures outside their control. The current design means `npm test` passing cleanly means "the tools work" — not "the framework has no drift." The distinction is documented in INVOCATION.md and embedded in the test output format. Worth preserving across future tooling phases.

---

## 2. Decisions made by inference that should have been escalated

### The `repoRoot` parameter in Path Validator

The spec said "accepts: path to an index file." Index paths in A-Society are absolute from repo root (`/a-society/...`), not relative to the index file itself. The implementation added a required `repoRoot` parameter without TA input. The addition is correct — there is no other way to resolve the paths — but it changed the component interface unilaterally. The TA recorded this as a spec gap. Correct outcome, wrong process: this should have been surfaced to the TA before implementation, not inferred during it.

**Generalizable rule:** When the spec's parameter list omits something that is clearly required to implement the stated behavior, stop and escalate before implementing. "Clearly necessary addition" is not sufficient authorization to change the interface.

### The `node_ids: string[]` output shape in Backward Pass Orderer

The spec described the output as tuples of `(position, role, node-id)` — singular node ID. The graph schema explicitly allows a role to appear in multiple nodes. The implementation returns `node_ids: string[]` to handle this correctly. The TA affirmed this as the correct shape. But the decision was made during implementation without TA input. A role having multiple nodes is not an edge case — it is the default state of A-Society's own workflow (Curator fires twice: once for findings, once for synthesis). Implementing for only the simple case would have produced a tool that breaks on the first real use.

**Generalizable rule:** When a spec output format is specified for a simple case but the schema it operates on allows richer structures, model the output format against all valid inputs before starting implementation. If the simple case format doesn't hold, escalate before implementing.

### Hardcoded consent file rendering

The Consent Utility spec described instantiating the template file at `$GENERAL_FEEDBACK_CONSENT`. In implementation, the template turned out to be a prose document with the consent format embedded in a markdown code fence, surrounded by agent instructions. It is not a substitution template. The implementation resolved this by hardcoding `renderConsentFile()` with inline string interpolation.

This was a judgment call: the spec was not implementable as written, and the options were (a) parse the code fence (fragile), (b) require a documentation layer change to make the template machine-parseable (outside Developer authority), or (c) hardcode the format and document the co-maintenance dependency. Option (c) was chosen. The TA accepted the deviation. But the decision should have been escalated as a blocker before implementation, documented as "spec says X, template format makes X not straightforwardly implementable, requesting guidance" — not resolved unilaterally and disclosed post-implementation.

**Generalizable rule:** "Spec is not implementable as written" is an escalation trigger, not a license to choose the most pragmatic resolution. The TA needs to know about this before code is written, not after.

### The `_updatesDir` parameter as dead code

The Version Comparator accepts three parameters; the third (`updatesDir`) is silently unused (prefixed `_updatesDir`). The decision to accept but not use it was made by the Developer to satisfy the spec's interface while implementing via a different mechanism (VERSION.md history table). This should have been an explicit decision point: "the spec says to read the updates directory, but I found a better source — here is the alternative, here is the tradeoff, requesting ruling." Instead it was implemented as a silent dead parameter and disclosed during review.

The TA's assessment (accept, with option to use for sanity-check validation in a future iteration) was reasonable. But the process of implementing dead interface parameters without escalation creates maintainability risk: future callers may assume the parameter does something, or future implementers may not realize it's intentionally unused.

---

## 3. The backward pass algorithm case

The backward pass orderer required the most iteration of any component, and the iteration was caused by a fixable spec gap.

### What happened

The initial implementation was correct for the two-role case. When writing the test fixture for a four-role graph (Owner, Developer, TA, Curator), the fixture included both a non-synthesis Curator node (`curator-1`) and the synthesis Curator node (`curator-synthesis`). This was based on a reading of the spec addendum's four-role scenario. The test expected four output entries: `[TA, Developer, Owner, Curator(synthesis)]`. The implementation produced five: `[TA, Developer, Curator(findings), Owner, Curator(synthesis)]` — Curator appeared twice.

This required re-examining the addendum carefully. The addendum's four-role scenario describes a tooling flow where Curator participates only as synthesis (no separate findings position). The fixture was wrong — it included a non-synthesis Curator node that the addendum's scenario doesn't have. Removing `curator-1` fixed the test. The algorithm was always correct; the fixture embodied a misread of the spec.

### What the spec should have provided

A worked example with two distinct cases:
1. A graph where the synthesis role also has non-synthesis nodes (Curator fires at phase 2 findings AND phase 5 synthesis) — expected output shows the role twice
2. A graph where the synthesis role only has the synthesis node (Curator fires only at synthesis) — expected output shows the role once

Without this, the expected output for any fixture involving both a non-synthesis and synthesis node for the same role is ambiguous until the Developer traces through the algorithm manually and cross-checks against the prose. The live A-Society workflow test was what ultimately confirmed the algorithm was correct: its output exactly matched the backward pass order described in `$A_SOCIETY_IMPROVEMENT`.

**Generalizable rule:** Algorithm components need worked examples in the spec, not just algorithm statements. "Worked example" means: here is an input graph, here is the expected output, here is which spec rule produces each output entry.

---

## 4. Test design choices

### What worked

**Isolated temp directories per test group** — each test that writes files creates its own `fs.mkdtempSync` directory and cleans up after. This made tests fully independent and prevented test pollution between runs. Worth standardizing as the default pattern for any tooling component that writes files.

**Deterministic fixtures for path validator** — the `index-sample.md` fixture hardcodes three entries: one that resolves to a real file in the tooling directory, one that resolves to another real file, one that definitively does not exist. This made path status assertions deterministic across machines. The alternative (testing against live indexes) would have made fixture-based tests sensitive to framework drift. Good separation.

**Fixture for "invalid" workflow** — the `workflow-invalid.md` fixture was designed to trigger multiple validation errors simultaneously (duplicate node id, bad phase ref, negative position, two synthesis nodes, bad edge ref). This validated that the validator accumulates all errors in a single pass rather than short-circuiting after the first. Worth doing for any future validator component: design an "invalid" fixture that exercises every error path in a single file.

### What I would do differently

**Earlier live test pass, even before unit tests are complete** — the backtick bug was found because the path validator's framework state test ran early. But the pattern of "write unit tests, then add live framework test" means the live test is added after the implementation is already complete. For path-manipulation code that parses format-specific input, running the live input first (even before writing formal tests) would catch format surprises immediately. Write a quick smoke test against real data before writing the fixture suite.

**Parameterized fixture generation for version comparator** — the version comparator has three fixtures (`version-record-current.md`, `version-record-behind.md`, `version-record-no-updates.md`). These were written individually. A factory function that generates version record markdown programmatically would have made it easier to add edge cases (e.g. a project at v0.1 with many unapplied reports, or a project at a version not in the history table). For numeric comparison logic, the test coverage should cover the boundary cases more systematically. As implemented, the test suite covers the common cases but not the boundary.

---

## 5. Implementation patterns worth carrying forward

### Path manipulation: always resolve from repo root

Path cells in indexes are absolute-from-repo-root (`/a-society/...`). The Path Validator's `repoRoot` parameter resolves them by joining `path.join(repoRoot, registeredPath)`. Any future component that reads from an index or resolves A-Society paths should use the same pattern: accept `repoRoot` as a parameter, resolve all index paths relative to it, never assume the current working directory.

### Mutual validation before composition

The Backward Pass Orderer runs `validateWorkflowFile` before reading and parsing the graph in `orderFromFile`. This is the correct pattern: the validator is a separate component, and the orderer should not attempt to operate on a graph that failed validation. Any future component that depends on a schema-validated input format should run the validator first and throw if validation fails, rather than attempting to handle invalid inputs gracefully at the consumer level.

### The `required: boolean` manifest pattern

The manifest's `required` field distinguishes entries that are created on every initialization from entries that require explicit inclusion. The scaffolding system uses `f.required === true` as the default filter. This is clean and portable: any future manifest-like enumeration (a set of roles, a set of feedback types, a set of instruction documents) that has the same "always-include vs. on-request" distinction should use the same field name and the same filter logic.

### Consent routing by path pattern, not manifest field

The scaffolding system detects consent files by matching the path pattern `feedback/*/consent.md`, not by checking the manifest's `scaffold` field. This means consent routing cannot be bypassed by a manifest authoring error. Any future component that needs to apply special-case handling to a specific category of files should route by structural path pattern rather than by metadata field — path patterns are an invariant, metadata can drift.

---

## 6. What the Developer role boundary cost

The Developer role is pure execution: write to `tooling/` only, no documentation changes, escalate deviations to the TA. This boundary was correct and held throughout. But there were costs worth naming:

**The TA was in the loop retroactively on two deviations.** The Consent Utility template decision and the `_updatesDir` decision were both implemented before the TA reviewed them. The TA accepted both, but the review happened after the code was written rather than before. A Developer operating within the boundary should escalate these before writing code — but the boundary itself does not create a natural forcing function to do so, because the Developer can proceed with a pragmatic resolution and disclose later. The forcing function would need to be in the process: a "pre-implementation checklist" step that requires the Developer to enumerate any spec-vs-reality gaps before writing a line of code for each component.

**Some framework state gaps were flagged informally.** Index drift for the feedback directories and `$GENERAL_IMPROVEMENT_PROTOCOL` were reported via test output (`[info]` messages) rather than via a formal Curator-facing document. This is acceptable for Phase 1 — the tooling wasn't a formal communication channel yet. But now that the tooling is complete, future drift detection from `npm test` output should flow through a defined channel (e.g., a brief Curator-facing note after each tooling run that produces `[info]` outputs), rather than being embedded in test stdout.

---

## 7. Items for the Curator's synthesis

1. **Pre-implementation escalation protocol** — a step requiring the Developer to enumerate spec-vs-reality gaps before writing each component would have surfaced the consent template issue and the `_updatesDir` issue earlier. Consider whether the Developer role document or the workflow should include a "spec review" gate before each component's implementation begins.

2. **Algorithm components need worked examples in specs** — not just algorithm statements. The backward pass orderer spec should include the two worked examples described in Section 3 of this document. Future TA proposals for any component with non-trivial algorithmic logic should include worked examples as a required element.

3. **Drift detection output needs a defined flow channel** — currently, framework state gaps found by tooling appear as `[info]` lines in `npm test` stdout. This is readable by developers but not visible to agents or Curators in normal sessions. Define where these gaps go: a Curator-facing note, a drift log file, or a pattern for the agent running the tools to surface them in session output.

4. **`repoRoot` as a standard parameter** — any tooling component that resolves A-Society index paths should accept `repoRoot` as a parameter with a consistent name and position. Standardizing this in the tooling component spec template would prevent the spec omission that occurred with Component 5.

5. **The two deviations from Phase 1–2** — now closed and documented in `tooling-ta-assessment-phase1-2.md`. No action needed from Curator beyond confirming the spec (`$A_SOCIETY_TOOLING_PROPOSAL`) reflects the accepted resolutions. The TA confirmed both spec updates were applied.

---

*Findings complete. Implementation scope complete as of Phase 6.*
