**Subject:** Improvement docs restructure — separate meta-analysis phase from synthesis phase (2 changes)
**Status:** BRIEFED
**Date:** 2026-03-22

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$GENERAL_IMPROVEMENT` | modify — structural reorganization of Backward Pass Protocol section |
| `$A_SOCIETY_IMPROVEMENT` | modify — same restructuring, adapted for A-Society context |

---

### Change 1 — `$GENERAL_IMPROVEMENT` [Requires Owner approval] [modify]

**What is changing.** The Backward Pass Protocol section currently combines instructions for two distinct operations in a single flat sequence of subsections: producing findings (meta-analysis, done by each participating role) and synthesizing findings (synthesis, done by the synthesis role only). These are distinct operations performed by different agents at different points. Currently they are interleaved — `### How It Works` contains steps for both, followed by reflection-guidance subsections that apply only to meta-analysis.

The change dissolves `### How It Works` and reorganizes its content under two new phase headings:
- `### Meta-Analysis Phase` — instructions for roles producing backward pass findings
- `### Synthesis Phase` — instructions for the synthesis role

**Why it is worth doing.** This is the prerequisite for Component 4 embedding role-specific instructions in its generated prompts (a separate future tooling flow). Component 4 currently generates prompts that identify the role and step type but contain no backward pass instructions. To embed the right instructions per role, there must be a clean separation between what findings-role agents need and what the synthesis role needs. This restructuring creates that separation. It is also independently valuable: agents reading only their phase can load a well-scoped section rather than scanning the full protocol to identify what applies to them.

**Expected output form — new structure of `## Backward Pass Protocol` in `$GENERAL_IMPROVEMENT`:**

The existing `### Purpose`, `### When to Run`, `### Backward Pass Traversal`, and `### Guardrails` sections are unchanged. Only the sections between `### Backward Pass Traversal` and `### Guardrails` are affected.

Replace the current `### How It Works` → `### Useful Lenses` block (six subsections) with the following:

```
### Meta-Analysis Phase

[One-sentence orientation: "Instructions for roles producing backward pass findings."]

**Step 1.** [content of current How It Works step 1 — each agent produces a findings artifact]
**Step 2.** [content of current How It Works step 2 — output location]
**Step 3.** [content of current How It Works step 3 — template reference]

#### What to Reflect On
[content unchanged — moved from ### to ####]

#### Analysis Quality
[content unchanged — moved from ### to ####]

#### Generalizable Findings
[content unchanged — moved from ### to ####]

#### Useful Lenses
[content unchanged — moved from ### to ####]

### Synthesis Phase

[One-sentence orientation: "Instructions for the synthesis role."]

**Step 1.** [content of current How It Works step 4 — synthesis role reviews all findings]
**Step 2.** [content of current How It Works step 5 — actionable items are routed]
```

Step numbering within each phase section restarts from 1. The Synthesis Phase step numbers derive from renumbering current steps 4–5 as 1–2.

**Obsolete section:** `### How It Works` as a standalone heading is removed. Its content is fully redistributed between the two phase sections; nothing is dropped.

---

### Change 2 — `$A_SOCIETY_IMPROVEMENT` [Requires Owner approval] [modify]

**What is changing.** The same restructuring, adapted for `$A_SOCIETY_IMPROVEMENT`'s A-Society-specific content.

`$A_SOCIETY_IMPROVEMENT`'s `### How It Works` has five steps:
- Steps 1–4: findings production (Curator first, Owner second, output location, template reference) — these belong in the Meta-Analysis Phase
- Step 5: Curator synthesizes, routes items by structural scope — this belongs in the Synthesis Phase

The reflection-guidance subsections (`### Reflection Categories`, `### Analysis Quality`, `### Generalizable Findings`, `### Useful Lenses`) move to the Meta-Analysis Phase as `####` subsections, identical to the `$GENERAL_IMPROVEMENT` change.

**Expected output form — new structure of `## Backward Pass Protocol` in `$A_SOCIETY_IMPROVEMENT`:**

The existing `### Purpose`, `### When to Run`, `### Backward Pass Traversal` (with its `####` subsections), and `### Guardrails` sections are unchanged.

Replace the current `### How It Works` → `### Useful Lenses` block (five subsections) with:

```
### Meta-Analysis Phase

[One-sentence orientation: "Instructions for roles producing backward pass findings."]

**Step 1.** [content of current How It Works step 1 — Curator produces findings first]
**Step 2.** [content of current How It Works step 2 — Owner produces findings second]
**Step 3.** [content of current How It Works step 3 — output location]
**Step 4.** [content of current How It Works step 4 — template reference]

#### Reflection Categories
[content unchanged — moved from ### to ####]

#### Analysis Quality
[content unchanged — moved from ### to ####]

#### Generalizable Findings
[content unchanged — moved from ### to ####]

#### Useful Lenses
[content unchanged — moved from ### to ####]

### Synthesis Phase

[One-sentence orientation: "Instructions for the synthesis role."]

**Step 1.** [content of current How It Works step 5 — Curator synthesizes, routes items]
```

Step numbering within each phase section restarts from 1. Synthesis Phase has one step (current step 5, renumbered to 1).

**Obsolete section:** `### How It Works` as a standalone heading is removed. Its content is fully redistributed.

---

## Scope

**In scope:**
- Restructuring the Backward Pass Protocol section in `$GENERAL_IMPROVEMENT` per the output form above
- Echoing the same restructuring in `$A_SOCIETY_IMPROVEMENT`
- Framework update report (consult `$A_SOCIETY_UPDATES_PROTOCOL` post-implementation to determine classification; do not pre-classify in the proposal)

**Out of scope:**
- Removing backward pass instructions from required reading (Parts 1 and 4 of the source Next Priorities item) — deferred; requires Component 4 to embed the instructions first
- Updating Component 4 to carry instruction sets in generated prompts (Part 3) — deferred; requires TA scoping
- Any changes to role required reading lists
- Any changes to `$GENERAL_IMPROVEMENT`'s Core Philosophy section or non-Backward-Pass-Protocol content

---

## Likely Target

- `$GENERAL_IMPROVEMENT` → `a-society/general/improvement/main.md`
- `$A_SOCIETY_IMPROVEMENT` → `a-society/a-docs/improvement/main.md`

---

## Open Questions for the Curator

None. The output form is fully specified above. The proposal round is mechanical: verify placement against the spec, produce draft content for Owner review.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for improvement docs restructure — separate meta-analysis phase from synthesis phase."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
