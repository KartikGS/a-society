# A-Society Framework Update — 2026-03-22

**Framework Version:** v18.0
**Previous Version:** v17.6

## Summary

`$INSTRUCTION_WORKFLOW` now requires every workflow document to name a **forward pass closure** step and to reference the project’s workflow routing index for the two universal closure rules (current-flow scoping; synthesis-is-terminal). A new mandatory subsection appears in “What Belongs in a Workflow Document,” and a new step appears in “How to Write One.” Projects that instantiated their workflow `main.md` before this addition are missing required structure unless they already documented an equivalent closure step.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Your workflow document may be incomplete — Curator must review |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### Forward Pass Closure required in workflow instruction

**Impact:** Breaking
**Affected artifacts:** [`a-society/general/instructions/workflow/main.md`]
**What changed:** (1) New **### 6. Forward Pass Closure (mandatory)** in “What Belongs in a Workflow Document,” between Session Model and Backward Pass; former **### 6. Backward Pass** renumbered to **### 7. Backward Pass.** (2) New **Step 7 — Define the forward pass closure step** in “How to Write One,” between the session model step and the backward-pass step; former Steps 7–9 renumbered to Steps 8–10.

**Why:** Closure obligations (log, tooling, execution verification) must be visible at the terminal forward-pass node; universal lifecycle rules live in the routing index so they are not duplicated per workflow. Adopting projects need the instruction to require authoring alignment with that model.

**Migration guidance:** Open your project’s workflow document (typically `workflow/main.md` or the path registered as `$[PROJECT]_WORKFLOW` or per-workflow variables in `$[PROJECT]_*` index).

1. **“What Belongs” checklist:** If the document has no subsection that names forward pass closure as the terminal forward-pass node and that points to the routing index for universal rules, add **### 6. Forward Pass Closure (mandatory)** (or renumber surrounding sections to match your document’s structure) using the verbatim text from the current `$INSTRUCTION_WORKFLOW` **### 6. Forward Pass Closure (mandatory)** block. Ensure **Backward Pass** remains the section that immediately follows it, renumbered if needed.

2. **Authoring procedure:** If your internal “how to write a workflow” notes or templates list steps without “Define the forward pass closure step,” add **Step 7 — Define the forward pass closure step** per the current `$INSTRUCTION_WORKFLOW` wording, and renumber subsequent steps.

3. **Routing index:** Confirm the project’s workflow routing index (often `workflow/main.md` when using index-based routing) contains a **Forward Pass Closure** section stating the two universal rules. If your project uses A-Society’s routing pattern, compare to `$A_SOCIETY_WORKFLOW` “Forward Pass Closure.” If the section is absent, add it there first; the workflow-specific file then references it without restating those rules.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
