# Backward Pass Findings: Owner — 20260328-runtime-provider-agnostic

**Date:** 2026-03-28
**Task Reference:** 20260328-runtime-provider-agnostic
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information
- none

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- **Runtime Dev workflow registration language overstates Curator scope.** `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` (Registration Phase) states: "Registers all `runtime/` paths in `$A_SOCIETY_PUBLIC_INDEX`." The actual convention established across runtime flows is narrower: only `runtime/INVOCATION.md` is indexed in the public index; `runtime/src/` files are implementation details not individually registered. In this flow, the gap was bridged by explicit Owner clarification in `07-owner-to-curator.md`. The Curator found the workflow text insufficiently specific and required the per-flow clarification to proceed confidently. The workflow should be updated to describe what is actually registered rather than implying exhaustive path coverage. Affected: `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` — Registration Phase. MAINT fix, Curator authority.

### Workflow Friction
- **Sequence collision from backward pass filing without folder-state verification.** This record folder contains two artifacts both numbered `06`: `06-ta-integration-assessment.md` (forward pass, filed correctly) and `06-runtime-developer-findings.md` (backward pass, filed during the backward pass without checking the folder's actual contents at that moment). The TA identified the root cause clearly: the improvement protocol specifies the naming format `NN-<role>-findings.md` but does not instruct participants to verify the folder's current contents before selecting `NN`. The implicit assumption is that backward pass findings follow immediately after forward pass artifacts — but any flow where the registration phase adds multiple artifacts before the backward pass begins will produce a collision. In this flow, `07-owner-to-curator.md` and `08-curator-to-owner.md` were filed during registration before the backward pass started, shifting the actual next available number to 09. The Developer filed at 06 based on forward-pass position, not folder state. The fix is one sentence in `$A_SOCIETY_RECORDS` (and the corresponding `$GENERAL_IMPROVEMENT` Meta-Analysis Phase section): before filing an artifact to a record folder, read the folder contents to identify the actual next available sequence number. This is a generalizable finding — any adopting project using records faces the same collision risk in any flow where mid-flow phase output precedes the backward pass.

  Merge assessment for Next Priorities: the "Merge assessment: third criterion missing from Synthesis Phase" item targets `$GENERAL_IMPROVEMENT` Synthesis Phase — a different section. No merge. New item.

  Affected: `$A_SOCIETY_RECORDS`, `$GENERAL_IMPROVEMENT` — Meta-Analysis Phase output location section. `[S][LIB][MAINT]`.

- **Advisory Standard extension-before-bypass not applied at SDK/library selection level.** The TA correctly applied the extension-before-bypass standard to the `LLMGateway` class architecture — enumerating four obstacles and selecting the delegating model. But the standard was not applied at the level above: when designing the per-provider implementations, the initial proposal assumed native SDKs per provider (`@anthropic-ai/sdk`, `@google/generative-ai`, `@huggingface/inference`) without asking whether a common SDK interface existed. The user's single question revealed that HuggingFace and Gemini both expose OpenAI-compatible APIs, collapsing three provider classes to two. The initial design was discarded and replaced mid-TA session. Root cause: the Advisory Standard's framing ("before proposing new infrastructure") is implicitly scoped to code/class/component architecture, and the TA did not recognize SDK/library selection as an analogous case. The fix is a clause extension to the existing Advisory Standard in `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`: "This standard applies to dependency selection as well as code architecture — before proposing per-case library implementations (separate SDKs per provider, per-format parser, per-service client), ask whether a common library interface covers multiple cases." The TA also correctly flagged this as generalizable: any project with design roles making dependency selections faces the same structural gap. The `general/` dimension merges into the existing Next Priorities item "Generalizable advisory standards: §8 completeness and extension-before-bypass" (same design area, same role target, Framework Dev flow). Affected: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — Advisory Standards. `[S][MAINT]` for the `a-docs/` component; merge generalizable contribution into existing `[S][LIB]` item.

- **TA issued scope deferral recommendation based on uncertain API knowledge rather than surfacing a clarification question.** The initial TA design recommended deferring HuggingFace citing "SDK availability and API compatibility" concerns — specifically streaming support and model naming — concerns that dissolved immediately when the user clarified. The TA had the option to surface uncertainty as a targeted clarification question ("HuggingFace's inference API: does it support streaming, and is there a default model to recommend?") but instead issued a deferral recommendation as if the uncertainty were resolved. The current TA role contains an open questions guidance ("recommend a scope with rationale, and explicitly defer any that cannot be delivered") that reinforces recommendation-first behavior even when the basis for the recommendation is uncertain. The role should be extended: when a scope recommendation (include/defer) turns on factual knowledge about an external API or library surface, and the TA's knowledge may be stale or incomplete, surface the gap as a clarification question before issuing the recommendation. Issuing a recommendation under uncertainty and then withdrawing it on clarification introduces a revision cycle that a targeted question would eliminate. Affected: `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — open question handling guidance. `[S][MAINT]`.

  Merge assessment: "Role guidance quality" targets `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` — different roles. "Generalizable advisory standards" targets `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` Advisory Standards — adjacent but different behavioral area (scope recommendation under uncertainty vs. §8 completeness and extension-before-bypass). No merge. New item.

---

## Top Findings (Ranked)

1. Backward pass sequence collision from filing without verifying folder state — will recur in any registration-before-backward-pass flow — `$A_SOCIETY_RECORDS`, `$GENERAL_IMPROVEMENT` Meta-Analysis Phase
2. Runtime Dev workflow registration phase overstates Curator indexing scope — required per-flow Owner clarification to resolve — `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`
3. Advisory Standard extension-before-bypass not applied to SDK/library selection — caused mid-TA-session full design revision — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` Advisory Standards
4. Scope deferral recommendation issued under uncertain API knowledge rather than surfaced as clarification question — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` open question handling
