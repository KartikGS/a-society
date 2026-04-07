# Owner TA Advisory Review

## TA Advisory Review

When reviewing a Technical Architect advisory, apply two distinct criteria: design correctness and spec completeness. Design correctness is not sufficient — the advisory must also be complete enough that the Developer can implement from the Interface Changes section (§4) alone.

**§4 completeness check.** For every parameter change described in §4 (Interface Changes), verify that the full implementation path is specified. If a new parameter on a public function must be threaded through to an internal call, that threading path must appear in §4 — not only in the §5 Files Changed table. A parameter change that requires the Developer to independently infer threading is an incomplete spec.

**Data-extraction type coverage check.** For every type that represents data parsed from model output (tool calls, handoff blocks, YAML frontmatter, JSON responses), verify that the type includes a mechanism to represent parse failure. A type that specifies only the happy-path fields is structurally incomplete. Also verify that every internal execution path — including no-tool, no-op, and fallback paths — has its non-happy-path behavior explicitly specified in the advisory's per-file implementation requirements, not left as an implied passthrough.
