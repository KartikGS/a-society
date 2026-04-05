# Backward Pass Findings: Owner — 20260405-runtime-session-ux

**Date:** 2026-04-05
**Task Reference:** 20260405-runtime-session-ux
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information

- **No brief-writing directive for multi-mode scope declaration** — The Owner brief (§2, Abort / Interrupt Design) described abort behavior entirely in interactive terms: "return to the prompt," "not crash the process." `orient.ts` has two distinct execution paths — interactive and autonomous — and the requirement applied to both. The brief did not declare which modes were in scope. The TA correctly inferred "interactive only" from the framing and designed accordingly. This was caught at Phase 0 gate and required a full re-draft of §1–§4 and §8. The `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality section has extensive guidance on insertion boundaries, replacement scope, consumer enumeration, and behavioral consistency — but no directive for mode-scope declaration when a target component has multiple execution paths. The correction cost (full advisory re-draft before any implementation) was high relative to the cost of one line in the brief: "applies to both interactive and autonomous execution paths."

  The TA's finding 3 names this correctly. The root cause is not TA inference error — the framing was genuinely ambiguous. It is an Owner brief gap.

  **Potential framework contribution:** The directive "when a brief targets a component with distinct execution modes (interactive/autonomous, sync/async, TTY/non-TTY, etc.), explicitly declare which modes the requirement applies to — or state that all modes are in scope" is project-agnostic. It would apply equally to a brief about a web server with dev/prod modes, a CLI with interactive/batch paths, or a document processor with online/offline modes.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction

- **Verification obligations did not cover output richness or removal completeness** — The integration approval (`09-owner-integration-approval.md`) listed four verification obligations for the Runtime Developer. Two of the three TA integration findings were not covered by these obligations:
  - Finding 2 (`npm run a-society` retention) was not an explicit verification item. The scope statement said "Remove `npm run a-society` from operator docs" but the verification checklist did not include "confirm INVOCATION.md contains no `npm run a-society`." A Developer reading the verification list could pass all four checks with the line still present.
  - Finding 3 (`flow-status` underimplementation) was covered by "confirm `bin/a-society.ts flow-status` runs without error" — but this check passes even with minimal output. The spec required `renderFlowStatus` output including record folder path, role-labeled active/completed nodes, and pending joins. The verification obligation said only "runs without error," not "output matches spec richness."

  Both findings were caught by the TA in integration review rather than by the Developer pre-submission. The Owner's verification obligations are the developer's checklist — when they are imprecise, the TA becomes the de facto completeness gate for items the obligations should have covered.

  The `$A_SOCIETY_OWNER_ROLE` has guidance that "Executable-layer verification scope must name the boundary" and directs naming compile surfaces. This principle applies equally to documentation output richness and content removal: verification obligations should be specific enough that a Developer passing all of them cannot still produce non-conformant output.

### Role File Gaps
- none

---

## Top Findings (Ranked)

1. **Brief-writing quality gap: no multi-mode scope declaration directive** — `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality section; `$GENERAL_OWNER_ROLE`. Caused a full TA advisory re-draft. The TA's top finding 3 names the brief directly. Fix: add a directive that when a brief targets a component with distinct execution paths, the scope of the requirement across those paths must be explicitly stated. **Potential framework contribution — project-agnostic.**

2. **Verification obligations must cover output richness and removal completeness, not just functional execution** — `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality / Constraint-Writing Quality sections. Two of three TA integration findings were not surfaceable from the verification checklist as written. Fix: extend the "verification scope must name the boundary" principle to cover: (a) for documentation changes, listing specific content that must be absent or present; (b) for output-format changes, specifying that output must match named fields from the spec, not just execute without error.

3. **Partial-text discard design self-caught at Phase 0, not prevented by brief** — `$A_SOCIETY_OWNER_ROLE`. The TA's initial design in Q2 (pre-resolution) disposed of partial text on abort. The Owner caught this at Phase 0 gate. The correction was made before any implementation, so cost was low. However, the brief's §1 open question ("Abort produces a resumable session or terminates?") could have been more directive — it left the full disposition to the TA rather than stating the Owner's preference with rationale (preserving history is the correct default for an operator redirection tool). The "preferred option + rationale requirement" brief pattern (existing Next Priorities item) would have applied here: state the preferred answer and require documented rationale for deviation. This finding corroborates the existing Next Priorities entry rather than opening a new one.
