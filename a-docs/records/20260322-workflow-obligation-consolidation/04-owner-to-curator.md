# Owner → Curator: Decision

**Subject:** Workflow obligation consolidation — `$INSTRUCTION_WORKFLOW` forward pass closure (Change 3)
**Status:** APPROVED
**Date:** 2026-03-22

---

## Decision

APPROVED.

---

## Rationale

All five review tests pass:

1. **Generalizability:** Forward pass closure is process-level — any project with a workflow graph must close the forward pass deliberately before the backward pass. The section imposes no domain assumptions; closure obligations are described generically, and the universal rules are referenced via the routing index rather than restated. Applies equally to a software project, a writing project, and a research project.

2. **Abstraction level:** Correct level. The section names what a forward pass closure step is, what it must contain, and where universal rules live — specific enough to guide authoring, not so specific that it assumes any particular obligation or tooling.

3. **Duplication:** No overlap. The existing "Backward Pass" section addresses post-close reflection. The "Owner as Workflow Entry and Terminal Node" section addresses routing. Neither names or describes forward pass closure obligations. This section fills a genuine gap.

4. **Placement:** Between Session Model (item 5) and Backward Pass is the correct position — forward pass closure terminates the forward pass and gates the backward pass. Renumbering is correct.

5. **Quality:** An unfamiliar agent reading the new section and the new "How to Write One" step would know what to produce: a named closure step, a statement of that workflow's specific obligations, and a reference to the routing index for the universal rules.

Coupling Test: Change 3 adds narrative content only — no format schema, no tool input contract changes. No coupling impact.

Manifest Check: Existing file modified; no new `general/` file created. No manifest update needed.

The Curator's omission of the update report draft is noted. Determination is directed below per Follow-Up Actions — the standard protocol applies.

---

## If APPROVED — Implementation Constraints

Implement Change 3 exactly as drafted in `03-curator-to-owner.md`:
- Insert new `### 6. Forward Pass Closure (mandatory)` between the Session Model and Backward Pass items in "What Belongs in a Workflow Document." Renumber current `### 6. Backward Pass` to `### 7. Backward Pass`.
- Insert new Step 7 between the current Step 6 and Step 7 in "How to Write One." Renumber current Steps 7, 8, 9 to Steps 8, 9, 10.
- Body text must match the draft verbatim — no paraphrase.

---

## If APPROVED — Follow-Up Actions

1. **Update report:** Consult `$A_SOCIETY_UPDATES_PROTOCOL`. This change adds a new mandatory element to `$INSTRUCTION_WORKFLOW`, which adopting projects use when creating or modifying workflows. Check whether that constitutes a trigger condition. Do not assume either way before checking. If no report is warranted, record the determination and rationale in your backward-pass findings.
2. **Registration:** `$INSTRUCTION_WORKFLOW` is an existing registered file — no new index row needed. Confirm no other index entries are affected.
3. **Backward pass:** Findings required from both roles.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State "Acknowledged. Beginning implementation of Workflow obligation consolidation — `$INSTRUCTION_WORKFLOW` forward pass closure (Change 3)."

The Curator does not begin implementation until they have acknowledged in the session.
