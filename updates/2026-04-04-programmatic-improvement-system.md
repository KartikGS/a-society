# Framework Update Report: Programmatic Improvement System

**Framework Version:** v28.0
**Previous Version:** v27.2
**Date:** 2026-04-04
**Classification:** Breaking

---

## Summary

This update marks the formal shift to the **Programmatic Improvement System**. Backward pass initiation, role traversal, and context injection are now handled by the A-Society runtime. Adopting projects must update their improvement protocol documentation to align with this change.

---

## Migration Guidance (Breaking)

Project Curators must assess their `[PROJECT_IMPROVEMENT]` instantiation (typically `$PROJECT_ROOT/a-docs/improvement/main.md` or equivalent) and apply the following changes:

1. **Remove Traversal Instructions:** Delete the section describing how to manually compute the backward pass order using Component 4 or manual rules. Initiation is now handled by the runtime.
2. **Remove Initiation Language:** Any instruction directing an agent to "initiate the backward pass" at forward-pass closure should be removed.
3. **Split or Update Instruction Site:**
   - **If using the A-Society runtime:** Replace the protocol section of your improvement doc with a note that meta-analysis and synthesis instructions are injected programmatically from `$GENERAL_IMPROVEMENT_META_ANALYSIS` and `$GENERAL_IMPROVEMENT_SYNTHESIS`.
   - **If NOT using the runtime:** Retain the traversal logic but consider splitting your local protocol into meta-analysis and synthesis files if your project manages distinct sessions for these phases.
4. **Target Meta-Analysis findings signal:** Update your meta-analysis instruction to require the `meta-analysis-complete` handoff block after the findings artifact is produced.

---

## Files Changed
- `$GENERAL_IMPROVEMENT` (split)
- `$GENERAL_IMPROVEMENT_META_ANALYSIS` (created)
- `$GENERAL_IMPROVEMENT_SYNTHESIS` (created)
- `$A_SOCIETY_PUBLIC_INDEX` (index updated)

---

## Delivery Note

Adopting projects must check `a-society/updates/` manually as part of their maintenance cycle until a distribution mechanism is defined.
