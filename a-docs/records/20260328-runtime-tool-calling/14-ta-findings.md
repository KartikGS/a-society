# Backward Pass Findings: Technical Architect — 20260328-runtime-tool-calling

**Date:** 2026-03-28
**Task Reference:** `20260328-runtime-tool-calling`
**Role:** Technical Architect (Meta-Analysis)
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information

**Finding 1 — `ToolCall` lacked a typed parse-error field**

The `ToolCall` interface defined in §2 of the Phase 0 design (`03-ta-to-owner.md`) was:

```typescript
export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}
```

The spec separately required (in §4 and §5) that the OpenAI provider return a `"Error: could not parse tool arguments: <raw string>"` result when `function.arguments` is not valid JSON. But `ProviderTurnResult.tool_calls` carries only `calls: ToolCall[]` — there is no field on `ToolCall` or on `ProviderTurnResult` to represent "this specific call's arguments were unparseable." The type system could not express the specified behavior.

The Developer resolved this by writing `input = { _parseError: rawArgs }` — a sentinel that worked but was invisible to the type system and created a false-positive collision risk. I caught it in integration assessment (`06-ta-to-owner.md`, item 1), the Owner chose Option B (add `parseError?: string`), and a remediation cycle followed.

Root cause: I applied the "Textual output fields must be specified or explicitly delegated" Advisory Standard to user-visible strings but did not apply an equivalent discipline to data-extraction types. The `ToolCall` interface represents data parsed from model output. Parse failures are a first-class possibility for any such type, and a typed error field belongs in the initial design, not in remediation.

**Finding 2 — No-tool path non-text result case unspecified**

The no-tool path in §4 (LLMGateway section) read: "No-tool path: single `provider.executeTurn` call; returns `result.text` directly." This described only the happy path. The error path — a provider returning `{ type: 'tool_calls' }` when no tools were configured — was not addressed.

The Developer added `return ''` as a defensive fallback (reasonable instinct, wrong call). I flagged it in integration assessment (`06-ta-to-owner.md`, item 2); the Owner chose the throw. This was a preventable remediation step: the spec should have specified "if result is not `{ type: 'text' }`, throw `LLMGatewayError('PROVIDER_MALFORMED', ...)`" in the §5 llm.ts row.

Root cause: The §5 row for `llm.ts` specified the tool-enabled path exhaustively but treated the no-tool path as a simple passthrough. The existing Advisory Standard — "Every behavioral requirement in prose must be named in the §8 row for the file it applies to" — applies to non-happy-path conditions. The no-tool path error case was not in the prose of §1–§4 either, so the §5 gap didn't register as a violation. The gap was upstream: the prose itself was silent on the case.

### Unclear Instructions
- None.

### Redundant Information
- None.

### Scope Concerns

**Finding 3 — Component 4 synthesis role bug**

The Owner's forward pass closure (`11-owner-forward-pass-closure.md`) noted: "Component 4 emitted `undefined` as the role for the synthesis step." The synthesis role name (`Curator`) is passed as a parameter to `orderWithPromptsFromFile`. The correct output would be a synthesis step with `role: 'Curator'`. The Owner had to override this manually and identified it as a Component 4 defect.

As Technical Architect, I designed Component 4 and own its specification. This is a live defect in a deployed component. Root cause requires reading the Component 4 source to determine whether the parameter is not threaded to the synthesis step's output, or whether the step is constructed before the parameter is applied. I cannot diagnose further without that read; I am flagging it here so it is not lost.

Actionable: Investigate `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` — verify how `orderWithPromptsFromFile`'s `synthesisRole` parameter populates the synthesis step's `role` field. File a corrective advisory if the defect is in the spec; file a corrective brief to the Tooling Developer if the defect is in the implementation.

### Workflow Friction

**Finding 4 — Integration assessment produced two preventable remediation items**

Both items surfaced in `06-ta-to-owner.md` were spec gaps, not implementation errors. The Developer implemented what the type system permitted. A spec that provided `parseError?: string` on `ToolCall` from the start and specified the no-tool error throw in §5 would have produced a conformant implementation on the first pass, with no integration gate remediation cycle.

The integration assessment process worked correctly — finding gaps is its purpose. But the higher-leverage fix is upstream: the Advisory Standards section of the Technical Architect role should require typed error fields on data-extraction types at design time, so future specs don't have the same gap.

---

## Top Findings (Ranked)

1. **`ToolCall` lacked `parseError?: string` — caused sentinel workaround and remediation cycle** — `03-ta-to-owner.md` §2 Type Changes; `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` Advisory Standards
2. **No-tool path error case unspecified — caused silent fallback** — `03-ta-to-owner.md` §4/§5 llm.ts; `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` Advisory Standards
3. **Component 4 emits `undefined` for synthesis role — live defect in deployed component** — `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`
4. **Advisory Standard gap: typed error fields on data-extraction types not mandated at design time** — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` Advisory Standards section
5. **Developer finding 4.1 (extraction error pattern) is independently generalizable** — confirmed from the TA side; any design that parses structured data from LLM output should specify a typed unparseable state; candidate for `$GENERAL_IMPROVEMENT` or framework design principles

---

## Generalizable Findings

**Finding 4 (typed extraction errors)** is project-agnostic. Any framework that involves parsing structured data from LLM output — tool calls, JSON blocks, YAML frontmatter, handoff blocks — faces the same risk: the happy-path type is specified, but the parse-failure case is not. This produces sentinel workarounds that create hidden coupling and type-safety gaps.

Candidate for addition to `$GENERAL_IMPROVEMENT` core philosophy or to a general TA advisory standard template in `general/`.

---

## Handoff

**Next action:** Perform your backward pass meta-analysis (step 4 of 5)
**Read:** all prior artifacts in `a-society/a-docs/records/20260328-runtime-tool-calling/`, then `### Meta-Analysis Phase` in `a-society/general/improvement/main.md`
**Expected response:** Your findings artifact at the next available sequence position in the record folder
