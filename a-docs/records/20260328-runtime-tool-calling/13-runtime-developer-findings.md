# Backward Pass Findings: Runtime Developer — 20260328-runtime-tool-calling

**Date:** 2026-03-28
**Task Reference:** `20260328-runtime-tool-calling`
**Role:** Runtime Developer (Meta-Analysis)

---

## 1. Structural Gap: Parsing Errors vs. Execution Errors

**Finding:** The initial Phase 0 architecture (`03-ta-to-owner.md`) correctly identified the need to handle tool argument parsing failures (specifically for the OpenAI-compatible provider), but it did not provide a typed field in `ToolCall` for this error. This led to an ad-hoc implementation using a sentinel key (`_parseError`) in the `input` map, which then required a remediation cycle (`07-owner-to-developer.md`) to replace with a formal `parseError?: string` field.
**Root Cause:** Design oversight regarding the "extraction phase" of tool calling. The design focused heavily on the "execution phase" (handled by `FileToolExecutor`), assuming all errors would be tool-result-based.
**Actionable:** Update `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` (or the internal TA design checklist) to mandate that tool-call interfaces must explicitly distinguish between **parsing errors** (malformed arguments from the model) and **execution errors** (runtime failures during tool usage), with dedicated fields for each.

---

## 2. Incomplete State Guard in No-Tool Path

**Finding:** The initial implementation of the "no-tool path" in `LLMGateway.executeTurn` included a silent fallback (`return ''`) if a provider unexpectedly returned tool calls when no tools were configured. This was caught in the remediation phase and changed to an explicit `PROVIDER_MALFORMED` throw.
**Root Cause:** "Defensive programming" bias that favored graceful degradation (empty string) over strict contract enforcement. In a programmatic orchestration layer, silent failure is riskier than an immediate throw because it masks provider-level bugs.
**Actionable:** Add an Advisory Standard to `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`: "When implementing contract boundaries between the gateway and providers, favor explicit error throws over 'safe' fallbacks for state combinations that are logically impossible or indicate provider-side violations."

---

## 3. Implementation Friction: Constructor Threading

**Finding:** Threading the `workspaceRoot` through to the `LLMGateway` required modifying every class-level instantiation in `orchestrator.ts` and `orient.ts`. While the §4 "Interface Changes" in the design were clear, this pattern of "constructor injection for features" increases the cost of future feature additions.
**Root Cause:** Necessary structural change for sandboxing, but it highlights that `LLMGateway` is becoming a stateful orchestrator rather than a stateless utility.
**Actionable:** No immediate change required, but this finding serves as a signal for the Technical Architect to monitor the "constructor bloat" in `LLMGateway`. If more features are added, a `GatewayConfig` object might be preferable to positional arguments.

---

## 4. Generalizable Findings

### 4.1. The "Extraction Error" Pattern
Any system that parses structured data from LLMs (tool calls, JSON blocks, YAML frontmatter) should include a typed "unparseable" state in its shared intermediate representation. Relying on sentinel values inside the data map (e.g., `_error`) creates collision risks and discoverability issues for downstream processors.
**Target:** `$GENERAL_IMPROVEMENT` or Framework Design internal notes.

---

## Handoff

**Next action:** Perform your backward pass meta-analysis (step 3 of 5)
**Read:** all prior artifacts in `a-society/a-docs/records/20260328-runtime-tool-calling/`, then `### Meta-Analysis Phase` in `a-society/general/improvement/main.md`
**Expected response:** Your findings artifact at the next available sequence position in the record folder
