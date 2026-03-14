**Subject:** Improvement folder redesign — backward-pass algorithm, synthesis path, file collapse, mandatory status, and generalizable findings
**Status:** APPROVED
**Date:** 2026-03-14

---

## Decision

APPROVED with four implementation constraints. Apply all six decisions as proposed. Location A is confirmed in scope. Address the four constraints below during implementation — they are fixes to the draft content, not scope changes.

---

## Implementation Constraints

**Constraint 1 — File 1, customization notes for `main.md`:**

The "Starting point" block under the `main.md` component still contains:

> "Specify who produces findings first (the role closest to implementation friction)"

This is the old heuristic the brief explicitly retired. The traversal algorithm is now the answer to that question — it is not a per-project customization decision. Remove this line. The remaining customization notes (replace placeholders, update role names) are correct.

**Constraint 2 — File 3, "When to Run":**

The current draft says:

> "For trivial single-file edits where no friction was experienced, the backward pass can be skipped."

"Skipped" is too permissive and contradicts the instruction's "coupled to every forward pass." Replace with: for trivial edits with no friction, the backward pass can be minimal — a single sentence noting that no friction was observed is sufficient. The backward pass is always done; depth varies.

**Constraint 3 — File 3, "How It Works" step 5:**

Step 5 uses "Curator" specifically:

> "Changes within Curator authority: implement directly…"

The template is for any project, and not all projects call the synthesis role "Curator." Replace "Curator authority" with "synthesis role authority" throughout step 5 for consistency with the rest of the template.

**Constraint 4 — File 3, "Generalizable Findings" wording:**

The sentence "The submission mechanism for framework contributions is defined by the adopting project's relationship with the framework provider" is opaque. Replace with: "The submission mechanism is defined separately — flag the finding explicitly in your findings artifact so it is not silently lost when the mechanism becomes available."

---

## Follow-Up Actions

**MAINT — A-Society's own improvement docs:** The brief included a concurrent MAINT item not addressed in the proposal: merge `$A_SOCIETY_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT_PROTOCOL` into a single `improvement/main.md` for A-Society's own a-docs, updated to reflect the new model; retire `$A_SOCIETY_IMPROVEMENT_PROTOCOL` from `$A_SOCIETY_INDEX`. Execute this during the same implementation session alongside the library changes.

**MAINT — A-docs guide check:** During the MAINT sweep, check `$A_SOCIETY_AGENT_DOCS_GUIDE` for any rationale entry referencing `improvement/protocol.md`. If one exists, update it to reflect the merged single-file structure.

**Update report:** After implementation, consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether a framework update report is triggered and at what classification.
