# Owner TA Advisory and Integration Review

## TA Advisory Review

When reviewing a Technical Architect advisory, apply two distinct criteria: design correctness and spec completeness. Design correctness is not sufficient — the advisory must also be complete enough that the Developer can implement from the Interface Changes section (§4) alone.

**§4 completeness check.** For every parameter change described in §4 (Interface Changes), verify that the full implementation path is specified. If a new parameter on a public function must be threaded through to an internal call, that threading path must appear in §4 — not only in the §5 Files Changed table. A parameter change that requires the Developer to independently infer threading is an incomplete spec.

**Data-extraction type coverage check.** For every type that represents data parsed from model output (tool calls, handoff blocks, YAML frontmatter, JSON responses), verify that the type includes a mechanism to represent parse failure. A type that specifies only the happy-path fields is structurally incomplete. Also verify that every internal execution path — including no-tool, no-op, and fallback paths — has its non-happy-path behavior explicitly specified in the advisory's per-file implementation requirements, not left as an implied passthrough.

## Integration-Gate Review

When reviewing a Technical Architect integration report or deciding whether an implementation clears the Owner integration gate, use a stricter evidence hierarchy than the report summary alone: the approved design comes first, direct source comparison against the live implementation and operator-facing reference comes second, and the TA recommendation comes third.

**Contract-name check.** If the implementation changes a schema field name, attribute name, event name, or other queryable contract term from the approved design, treat it as blocking unless the design artifact itself was revised and approved.

**Documented-deviation check.** A "documented deviation" is acceptable only when it preserves the approved operator-facing or query contract, or when the revised contract has itself been approved. "Telemetry exists" or "the behavior is materially close" is not enough if required names, fields, or semantics drift.

**Production-path evidence check.** When the gate concerns instrumentation or integration coverage, require evidence from the production call path. Synthetic construction of spans, events, or payloads does not satisfy an integration obligation unless the approved design explicitly scoped the test to schema shape only.

**Override rule.** TA approval recommendations are advisory, not binding. If direct source comparison shows blocking contract drift, missing production-path evidence, or operator-facing documentation mismatch, issue corrections rather than approving.
