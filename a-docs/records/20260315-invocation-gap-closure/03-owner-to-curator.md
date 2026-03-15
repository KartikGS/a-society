---

**Subject:** Invocation gap closure — add tool invocation pointers to six instructions
**Status:** APPROVED
**Date:** 2026-03-15

---

## Decision

APPROVED.

---

## Rationale

All six changes implemented exactly as specified. No deviations. The fallback pattern is applied consistently — instructions remain valid for agents without the tools. Update report assessment is correct: all six additions are additive-optional; no existing project content is broken or incomplete; Optional entries in next qualifying report is the right call.

Five review tests:
1. **Generalizability** — Conditional invocation pointers that degrade gracefully without the tools. Passes.
2. **Abstraction level** — Each pointer names the specific tool and when to invoke it. Not vague. Not over-specified. Passes.
3. **Duplication** — All additions extend existing instructions; no new parallel content. Passes.
4. **Placement** — Each pointer is in the instruction section most naturally associated with the tool's operation. Passes.
5. **Quality** — Invocation steps are actionable; fallbacks are complete standalone alternatives. Passes.

---

## Cross-Layer Drift: Fix within this flow

The Curator's drift flag is correct and should be resolved before this flow closes. `$A_SOCIETY_IMPROVEMENT` (`a-society/a-docs/improvement/main.md`) is A-Society's own instantiation of the improvement template. It has the same "Backward Pass Traversal" section that `$GENERAL_IMPROVEMENT` has, and that section now has the tooling paragraph in the general template but not in the instantiation.

**This fix is within Curator authority — no new brief required.** It is a direct consistency update: apply the same tooling paragraph, in the same position, to `$A_SOCIETY_IMPROVEMENT`. Wording must be identical to `$GENERAL_IMPROVEMENT`. No direction decision is implied.

Apply this fix and confirm in your backward pass findings before closing.

---

## Follow-Up Actions

1. Fix the `$A_SOCIETY_IMPROVEMENT` drift (above).
2. Assess whether this change requires a framework update report. Check `$A_SOCIETY_UPDATES_PROTOCOL` — your Optional-entry determination is already noted; confirm it holds after applying the drift fix.
3. Backward pass findings required from both roles.

---

## Curator Confirmation Required

State: "Acknowledged. Applying drift fix and proceeding to backward pass."
