# Backward Pass Findings: Owner — 20260328-runtime-tool-calling

**Date:** 2026-03-28
**Task Reference:** `20260328-runtime-tool-calling`
**Role:** Owner (Meta-Analysis)
**Depth:** Full

---

## Finding 1 — Phase 0 Review Did Not Catch Two Spec Gaps

Both items in the integration gate remediation cycle (`07-owner-to-developer.md`) were spec gaps in the TA's Phase 0 design, not implementation errors. The Developer implemented what the type system permitted. My Phase 0 gate review (`04-owner-to-developer.md`) approved the design without identifying either gap.

**Gap A:** `ToolCall` had no field to represent a parse failure. The spec required the provider to produce a specific error tool result when `function.arguments` was invalid JSON, but `ProviderTurnResult.calls: ToolCall[]` had no mechanism to carry "this specific call failed to parse." The Developer resolved it with a sentinel (`_parseError` in `input`), I caught it via TA integration assessment, a remediation cycle followed.

**Gap B:** The no-tool path in §4/§5 described only `return result.text`. The case where a provider returns `{ type: 'tool_calls' }` when no tools were configured was unspecified. The Developer added a defensive `return ''`, I caught it via TA integration assessment, a remediation cycle followed.

**Root cause:** My Phase 0 review applied the TA Advisory Review criteria from my role document: design correctness and §4 completeness (threading paths). Both criteria are necessary. Neither is sufficient to catch data-extraction type coverage gaps or non-happy-path behavior gaps on internal paths. I reviewed `ToolCall`'s fields against what the design described, not against what states the implementation would need to represent. I reviewed the no-tool path as a passthrough, not as a branch with its own error cases.

**Actionable:** Add a third criterion to the Owner role's TA Advisory Review section:

> **Data-extraction type coverage check.** For every type that represents data parsed from model output (tool calls, handoff blocks, YAML frontmatter, JSON responses), verify that the type includes a mechanism to represent parse failure. A type that specifies only the happy-path fields is structurally incomplete. Also verify that every internal execution path — including no-tool, no-op, and fallback paths — has its non-happy-path behavior explicitly specified in §5, not left as an implied passthrough.

---

## Finding 2 — Component 4 Synthesis Role Bug Is Invocation Error, Not Component Defect

The TA's Finding 3 concluded that Component 4 has a live defect causing the synthesis step to emit `undefined` as the role. After investigation: **the component is correct**. The defect was in my invocation.

`orderWithPromptsFromFile` takes two required parameters: `recordFolderPath: string` and `synthesisRole: string`. The INVOCATION.md documents this explicitly with an example: `orderWithPromptsFromFile('/path/to/record', 'Curator')  // synthesisRole is required`.

My Forward Pass Closure invocation was:
```
orderWithPromptsFromFile('../a-docs/records/20260328-runtime-tool-calling')
```
I omitted `synthesisRole`. TypeScript's type system would have caught this at compile time, but the inline `tsx -e` invocation bypassed that check. `synthesisRole` received `undefined` at runtime, which propagated to the synthesis step's `role` field.

**Root cause:** I generated the Component 4 invocation from memory rather than consulting `$A_SOCIETY_TOOLING_INVOCATION` first. The correct call was documented; I did not look it up.

**Actionable:** Add to the Owner role's Forward Pass Closure section: "When invoking Component 4, use the invocation documented in `$A_SOCIETY_TOOLING_INVOCATION` — do not reconstruct the call from memory. `synthesisRole` is a required second argument; omitting it silently produces `undefined` as the synthesis step role."

**Correction for the TA's findings:** TA Finding 3 should not route to a corrective Component 4 advisory. The Curator synthesis should note this resolution and not file a corrective flow for Component 4.

---

## Finding 3 — `LLMGatewayError` Re-Wrapping in Provider Catch Blocks

During integration gate verification (reading source before closing the gate), I observed that in `openai-compatible.ts`, `throw new LLMGatewayError('PROVIDER_MALFORMED', ...)` at line 70 (empty choices guard) is inside the outer `try/catch` block. The catch block checks for `OpenAI.AuthenticationError`, `OpenAI.RateLimitError`, `OpenAI.APIConnectionError`, `OpenAI.APIError` — none of which match `LLMGatewayError`. The fallthrough throws a new `LLMGatewayError('UNKNOWN', 'Unexpected provider error: <original message>')`. Result: a `PROVIDER_MALFORMED` error is reclassified as `UNKNOWN` with a prefixed message.

The `AnthropicProvider` has the same structure and is susceptible to the same issue for any `LLMGatewayError` thrown inside its `executeTurn` try block.

I did not block the integration gate on this finding because it was pre-existing (predates this flow) and was assessed as conformant by the TA. But the error model's accuracy is affected: operators seeing `UNKNOWN: "Unexpected provider error: OpenAI-compatible provider returned empty choices."` cannot distinguish this from a genuine unknown error.

**Actionable:** File as a Next Priorities item: add a guard to both provider catch blocks — `if (err instanceof LLMGatewayError) throw err;` — before the OpenAI/Anthropic-specific checks. This re-throws already-classified errors without reclassification. Small change, targeted to `anthropic.ts` and `openai-compatible.ts`. Follows Runtime Dev workflow.

---

## Finding 4 — Curator Log Entry Scope Overstep: Two Fix Targets

The Curator wrote the project log "Recent Focus" entry during registration. This required correction (wrong type names, wrong loop characterization). The Curator's own Finding 1 correctly identifies `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` Registration Phase as one fix target. I agree with that target.

There is a second fix target: `$A_SOCIETY_CURATOR_ROLE`. The Curator's authority section defines "Maintenance of all content under `a-society/a-docs/`" — the project log is `a-docs/` content. The restriction needs to be explicit, not inferred by absence. Add a scoped exclusion to the Curator role: "The project log's 'Recent Focus' entry for a closing flow is written by the Owner at Forward Pass Closure, not by the Curator during registration."

Both targets should be addressed in a single scoped fix.

---

## Top Findings (Ranked)

1. **Phase 0 review gap — data-extraction type coverage and no-tool error path** — actionable addition to Owner role TA Advisory Review section; would have prevented the remediation cycle
2. **Component 4 invocation error — `synthesisRole` omitted** — actionable addition to Owner role Forward Pass Closure section; TA Finding 3 does not represent a component defect
3. **`LLMGatewayError` re-wrapping** — pre-existing; new Next Priorities item for both providers
4. **Curator log scope overstep** — two fix targets (`$A_SOCIETY_WORKFLOW_RUNTIME_DEV` and `$A_SOCIETY_CURATOR_ROLE`)

---

## Generalizable Findings

**Finding 1 (data-extraction type coverage)** is project-agnostic and reinforces the Developer/TA finding on the same topic from different perspectives: the gap was in the *review* of the spec, not just in the spec itself. Any project with an Owner reviewing a TA or architect design document faces the same review gap risk. Candidate for `$GENERAL_OWNER_ROLE` TA Advisory Review section.

**Finding 2 (tooling invocation from memory)** is project-agnostic: any project with programmatic tooling components and an Owner responsible for invoking them faces this risk. Candidate for `$GENERAL_OWNER_ROLE` or a general tooling invocation advisory.

---

## Handoff

**Next action:** Perform backward pass synthesis (step 5 of 5 — final step)
**Read:** all findings artifacts in `a-society/a-docs/records/20260328-runtime-tool-calling/` (`12-curator-findings.md`, `13-runtime-developer-findings.md`, `14-ta-findings.md`, `15-owner-findings.md`), then `### Synthesis Phase` in `a-society/general/improvement/main.md`
**Expected response:** Synthesis artifact at the next available sequence position in the record folder, produced in a new Curator session
