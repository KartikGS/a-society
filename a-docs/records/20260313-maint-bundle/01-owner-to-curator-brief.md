**Subject:** Internal maintenance bundle — Priorities 4, 5, 6, 7
**Status:** BRIEFED
**Date:** 2026-03-13

---

## Agreed Change

Four `[S][MAINT]` items from the Next Priorities list. All are a-docs-only changes within Curator authority. No LIB components. No direction decisions.

Because all four items are `[MAINT]`, the Curator may proceed directly to implementation after acknowledgment — a Phase 2 Owner decision artifact is not required. The Curator should address all four changes in a single session, then produce backward-pass findings at `04-curator-findings.md`. The Owner will produce findings at `05-owner-findings.md`.

---

### Change 1 — Initializer clarification question quality (Priority 4)

**Problem:** Phase 2 of `$A_SOCIETY_INITIALIZER_ROLE` has three question-design gaps identified in the promo-agency test run:
1. The folder structure question asks the user to describe files the Initializer already read — this is redundant. Replace with a confirmation question: present what was inferred and ask the user to correct or confirm.
2. A tooling question is missing entirely. Phase 2 should ask what tools the project uses (e.g., task management, version control, communication) so the Curator can reference canonical tools rather than guessing.
3. All questions are too open-ended — they invite prose answers. Questions should offer options where applicable and confirm observations rather than invite free-form description from scratch.

**Fix:** Revise the three affected questions in Phase 2 to be observation-confirming rather than open-ended. Add a tooling question. Ensure each question either presents inferred content for confirmation or offers concrete options to choose from.

---

### Change 2 — `$A_SOCIETY_WORKFLOW` drift — three gaps (Priority 5)

**Problem:** Three items in `$A_SOCIETY_WORKFLOW` have not been updated to match conventions established in v6.0:

1. The "When to start a new session" section covers only within-flow criteria (context exhaustion, staleness, expiry). It does not state the at-flow-close rule: start a fresh session for a new flow by default. This rule is now standard in `$INSTRUCTION_WORKFLOW` and role documents but is absent here.

2. The transition description in "How it flows" does not use the copyable artifact path / session-start prompt framing now standard across the framework (established in v5.0). Transitions should state: always provide a copyable artifact path; additionally provide a copyable session-start prompt when a new session is required.

3. The Owner-as-terminal principle is not explicitly stated. The workflow ends at the Owner in practice (Step 5 of "How it flows"), but the document does not name this as a structural property.

**Fix:**
1. Add the at-flow-close rule to "When to start a new session."
2. Update transition language in "How it flows" steps 1–6 (and the human's role section) to use copyable artifact path / session-start prompt framing.
3. Add a named statement that the Owner is the terminal node for each flow — receives completion, acknowledges, and directs the backward pass.

---

### Change 3 — Records convention — extra-slot naming and submissions-resolved rule (Priority 6)

**Problem:** Two gaps in `$A_SOCIETY_RECORDS`:

1. The artifact sequence table names standard positions 01–05 but gives no naming pattern for non-standard artifacts (e.g., update report submissions that occur after the main decision at position 03). Curators currently invent names. A derivable pattern would eliminate invented names.

2. The "confirm all submissions resolved before filing findings" rule is buried mid-paragraph in the Artifact Sequence section. This is an execution-critical sequencing rule that is easy to miss.

**Fix:**
1. Add a sentence to the Artifact Sequence section naming the pattern for non-standard artifacts. The existing text already describes the behavior (extra Curator → Owner submission takes the next available slot before backward-pass findings); add an explicit naming convention for it (e.g., non-standard slots use the same `NN-[role]-[descriptor].md` pattern, where `[descriptor]` names the artifact type, such as `update-report` or `submission`).
2. Pull the submissions-resolved rule out of mid-paragraph prose and present it as a named, visible step — either a callout or a named prerequisite — in the Artifact Sequence section.

---

### Change 4 — Curator role cross-layer check framing + brief template count-verify (Priority 7)

**Problem:** Two small framing gaps:

1. The Standing Checks section in `$A_SOCIETY_CURATOR_ROLE` says to "apply both layers in the same flow" when cross-layer drift is found, but does not distinguish between: (a) drift that falls within the current brief's scope — apply now; and (b) drift that falls outside the current brief's scope — flag for a future flow. Without this distinction, the Curator either over-applies (expands scope) or under-applies (flags nothing).

2. `$A_SOCIETY_COMM_TEMPLATE_BRIEF` has no prompt asking the Owner to verify that the subject line change count matches the numbered list in the Agreed Change section. A single count-verification line would catch drafting errors at authoring time.

**Fix:**
1. Revise the Standing Checks section in `$A_SOCIETY_CURATOR_ROLE` to explicitly name both cases: within-scope drift (apply now) and out-of-scope drift (flag for future flow, do not act).
2. Add a count-verification line to `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — either in the Agreed Change section or as a brief self-check note — prompting the Owner to confirm the subject line count matches the numbered items.

---

## Scope

**In scope:** The four changes described above. Each is a targeted edit to an existing document — no new files, no new variables, no LIB content.

**Out of scope:** Anything beyond the named gaps. Do not refactor surrounding sections unless a direct dependency requires it.

---

## Likely Targets

- Change 1: `$A_SOCIETY_INITIALIZER_ROLE` (Phase 2)
- Change 2: `$A_SOCIETY_WORKFLOW` ("When to start a new session" section and "How it flows" steps)
- Change 3: `$A_SOCIETY_RECORDS` (Artifact Sequence section)
- Change 4: `$A_SOCIETY_CURATOR_ROLE` (Standing Checks section) and `$A_SOCIETY_COMM_TEMPLATE_BRIEF`

---

## Open Questions for the Curator

None. All four changes are fully specified. The proposal round is mechanical — draft the edits and submit.

---

## Curator Confirmation Required

Before beginning, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning implementation for Internal maintenance bundle — Priorities 4, 5, 6, 7."
