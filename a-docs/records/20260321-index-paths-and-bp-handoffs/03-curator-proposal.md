---
**Subject:** Index path prohibition and backward pass handoff completeness — proposal
**Status:** PROPOSED
**Date:** 2026-03-21

---

## Summary

Two additive changes to two existing `general/` library files. Both are mechanical additions of explicit rules where the framework currently relies on implication. No structural changes, no new files.

---

## Change 1 — `$INSTRUCTION_INDEX`: Absolute path prohibition and repo-relative path guidance

**Target file:** `a-society/general/instructions/indexes/main.md`

### Diagnosis

The Format Rules section (line 86) currently reads:

> "Paths are absolute from the project root. Relative paths break when the index is read from a different directory. Use `/project-root/...` notation consistently."

This rule is the source of the Ink failure. Both repo-root-relative paths (`/a-society/...`) and machine-specific absolute paths (`/home/kartik/...`) begin with `/`. The current wording does not distinguish them. An agent producing an index from file operations naturally has machine-specific paths in hand — without an explicit prohibition, it uses them.

The secondary `$INK_ROOT` failure (an agent inventing an unregistered variable to anchor an unregistered file) is not covered anywhere in the instruction. The instruction explains what belongs in the index, but gives no guidance for the case where a file does not belong there and an agent feels compelled to invent a variable anchor.

### Proposed additions

**In the Format Rules section** — replace the current path format bullet with:

> **Paths must be repo-relative, not machine-specific.** Use paths relative to the repository root (e.g., `project-name/a-docs/agents.md`). Machine-specific absolute paths (e.g., `/home/user/...`, `/Users/...`) are prohibited — they break when the project moves to a different machine or account. When populating an index from file operations that return absolute paths, strip the machine-specific prefix and write only the repo-relative portion.

**In the "How to Use the Index" section** — add a new block after the existing "When validating the index" block:

> **When referencing a file not in the index:**
> For files that do not belong in the index — per-flow artifacts, active working files, or any file only referenced once — use the repo-relative path directly in handoffs and artifacts. Do not invent an unregistered `$VARIABLE_NAME` to anchor it. An invented variable that is not registered in the index resolves to nothing: it gives the appearance of indirection without the benefit. If an unregistered variable appears in a handoff, it is a signal that a plain repo-relative path should have been used instead.

### Why these placements

- The path format rule belongs in **Format Rules** because that section already owns the "Paths are absolute..." rule being replaced. Correcting it in place keeps format guidance in one location.
- The unregistered-file guidance belongs in **How to Use the Index** because that section addresses agent behavior when working with the index. The existing blocks cover "when referencing a file in a document" and "when following a reference" — the new block completes the set by covering the case where the file is not in the index at all.

### What the existing examples need

The three example tables (software, editorial, research) at lines 135–153 all show paths with a leading slash (e.g., `/docs/project/tooling/standard.md`). After this change, these examples would be inconsistent with the new rule — a leading slash is ambiguous.

**Proposal:** Update the example paths to use the repo-relative format without a leading slash (e.g., `project-name/docs/tooling/standard.md`). This aligns the examples with the rule.

The inline example in the What Is a File Path Index? section (line 10: `/project/docs/tooling/standard.md`) has the same issue and should be updated to match.

**Owner decision requested:** Should the example paths be updated as part of this change, or kept as-is? The rule correction is the primary fix; the example updates are cosmetic consistency. If approved, the Curator will update all affected examples during implementation.

---

## Change 2 — `$GENERAL_IMPROVEMENT`: Backward pass handoff completeness

**Target file:** `a-society/general/improvement/main.md`

### Diagnosis

The Backward Pass Protocol describes the traversal order and what each agent produces, but contains no explicit requirement about handoff format between backward pass roles. The three-field format (`Next action:`, `Read:`, `Expected response:`) exists as a general handoff convention but is not stated in the backward pass protocol itself.

The Ink failure showed what happens without the rule: the Editor's handoff to the Writer dropped `Read:` and omitted `Expected response:` entirely. The receiving role could theoretically infer what to read from context — and that is precisely why the field was dropped. The fix is to prohibit inference as a substitute for explicit fields.

### Proposed addition

**In the Guardrails section** — add as a new bullet at the end of the existing guardrails:

> - **Every backward pass handoff must include all three fields.** Each role passing to the next backward pass role must include: `Next action:`, `Read:`, and `Expected response:`. Dropping a field is not permitted even when the receiving role could infer it from context. Inference is not a substitute for an explicit handoff. Each role is responsible for producing all three fields before passing.

### Why this placement

The Guardrails section is where behavioral must-rules live — the other bullets use "Do not" and absolute-prohibition language. This addition belongs there because it is a hard rule about what each agent must include, not a process step or a suggestion. Placing it in "How It Works" would embed it among procedural steps, reducing its visibility as a hard requirement.

---

## Cross-layer check

Both changes are to `general/` files. The corresponding A-Society `a-docs/` artifacts are:

- `$A_SOCIETY_INDEX` (`a-society/a-docs/indexes/main.md`): Already uses `/a-society/...` style paths with a leading slash. If the example paths in `$INSTRUCTION_INDEX` are updated, the A-Society index paths may appear inconsistent with the updated instruction. **Note for Owner:** the A-Society index predates this change and uses the old convention. A-Society's own index would need a follow-on update to adopt repo-relative format — this is out of scope for the current change but worth flagging.
- `$A_SOCIETY_IMPROVEMENT` (`a-society/a-docs/improvement/main.md`): The backward pass handoff completeness rule applies equally to A-Society's own improvement protocol. **Note for Owner:** the same addition should be reflected in `$A_SOCIETY_IMPROVEMENT` if it does not already contain the rule — this is within scope as cross-layer consistency.

---

## Open Questions

1. **Example path updates in `$INSTRUCTION_INDEX`:** Approve example path updates (cosmetic consistency with the new rule) or defer?
2. **`$A_SOCIETY_IMPROVEMENT` cross-layer update:** Confirm whether adding the handoff completeness rule to `$A_SOCIETY_IMPROVEMENT` is in scope for this flow, or flagged for a separate change.

---

## Status

PROPOSED — awaiting Owner review and decision artifact before implementation begins.
