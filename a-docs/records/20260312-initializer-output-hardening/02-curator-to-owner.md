# Curator → Owner: Proposal / Submission

**Subject:** Initializer output hardening — absolute path checks, onboarding report quality, and Phase 5 duplicate statement
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-12

---

## Trigger

Human identified three gaps from the second promo-agency test run. All affect `$A_SOCIETY_INITIALIZER_ROLE`. Batched by the Owner in `01-owner-to-curator-brief.md` as three targeted fixes with no inter-dependencies.

---

## What and Why

Three targeted fixes to the Initializer protocol:

**Gap 1 — Phase 4 self-review does not catch two categories of hardcoded path.** The existing check ("Are all cross-references using `$VARIABLE_NAME`?") covers document-to-document references but misses: (a) role file paths in the `agents.md` roles table, which are file paths but not conventionally called cross-references; and (b) the agents.md pointer in the Phase 5 onboarding prompt, which is generated dynamically at Phase 5 time and can silently become a machine-specific absolute path. Adding two explicit bullets eliminates both failure modes.

**Gap 2 — Onboarding signal report quality gaps.** (a) Phase 4 prompts the Initializer to surface invented design decisions and get human confirmation, but no guidance connects that outcome to the report's Adversity Log — the signal is lost. A single filing instruction closes the loop. (b) The report template's Patterns Observed section permits "None observed" with no guard against appending an observation to that sentence — a contradiction that appeared in the promo-agency report. A template-level guard prevents this at the point of writing, regardless of which agent produces the report.

**Gap 3 — Duplicate completion statement.** Phase 5 step 1 states "Initialization complete. This project's `a-docs/` is live." This same statement (expanded) appears in Handoff Criteria. The two instances serve different purposes but stack as a confusing repeat. Step 1 is replaced with a brief transition statement; the Handoff Criteria statement is unchanged.

---

## Where Observed

A-Society — internal. Gaps surfaced from the promo-agency initialization test run (second run, 2026-03-11). The promo-agency report at `$A_SOCIETY_FEEDBACK_ONBOARDING/promo-agency-2026-03-11.md` contains the concrete instance of the Gap 2b contradiction: "None observed initially. The Analyst/Post-Launch Review cycle maps well to a general Verification loop."

---

## Target Location

- `$A_SOCIETY_INITIALIZER_ROLE` — Phase 4 (self-review bullets) and Phase 5 (step 1, step 2, and onboarding signal filing guidance)
- `$ONBOARDING_SIGNAL_TEMPLATE` — Patterns Observed section

---

## Open Question Resolution: Gap 2b Placement

**Recommendation: template, not Phase 5 guidance.**

The contradiction appeared because the Initializer wrote the report without catching it during self-review. Phase 5 guidance is read during process execution, at a distance from the actual report-writing step. A guard in the template is encountered at the point of writing — exactly when the contradiction can be prevented. It also applies to any future agent producing a report from this template, not only the Initializer. Phase 5 guidance already directs the Initializer to use `$ONBOARDING_SIGNAL_TEMPLATE`; the inline guard there is the reliable stop.

---

## Draft Content

### Change 1 — `$A_SOCIETY_INITIALIZER_ROLE` Phase 4: two additional self-review bullets

Add after the existing bullet "Are all cross-references using `$VARIABLE_NAME` rather than hardcoded paths?":

> - Do any role file paths in the `agents.md` roles table appear as filesystem-absolute paths rather than `$VARIABLE_NAME` references? Role table entries are not cross-references in the conventional sense but are equally forbidden as hardcoded paths. Fix before presenting.
> - Does the `agents.md` pointer you will use in the Phase 5 onboarding message resolve to a relative path (e.g., `my-project/a-docs/agents.md`) rather than a machine-specific absolute path (e.g., `/home/user/...` or `/Users/...`)? Confirm the correct relative path now so it is ready for Phase 5 step 2.

**Resulting Phase 4 self-review block (full, for Owner review):**

```
Before presenting to the human, self-review each document produced:
- Does any statement contradict what you know about this project from reconnaissance and clarification?
- Is any section a template adaptation that was carried forward without being grounded in this project's actual reality? (Placeholder language, generic naming conventions, or principles that reference a structure this project doesn't have are signs of insufficient adaptation.)
- Are all cross-references using `$VARIABLE_NAME` rather than hardcoded paths?
- Do any role file paths in the `agents.md` roles table appear as filesystem-absolute paths rather than `$VARIABLE_NAME` references? Role table entries are not cross-references in the conventional sense but are equally forbidden as hardcoded paths. Fix before presenting.
- Does the `agents.md` pointer you will use in the Phase 5 onboarding message resolve to a relative path (e.g., `my-project/a-docs/agents.md`) rather than a machine-specific absolute path (e.g., `/home/user/...` or `/Users/...`)? Confirm the correct relative path now so it is ready for Phase 5 step 2.
- Did you make any design decisions in the absence of explicit user direction (e.g., invented naming conventions, file structures, workflow steps, process models not present in the project's files or the human's answers)? If yes, list each decision explicitly in the presentation and ask the human to confirm or correct before proceeding to Phase 5. Presenting invented decisions as established fact is a critical self-review failure.
```

---

### Change 2 — `$A_SOCIETY_INITIALIZER_ROLE` Phase 5 step 1: remove duplicate completion statement

**Current step 1:**
```
1. State completion clearly:
   *"Initialization complete. This project's `a-docs/` is live."*
```

**Proposed step 1:**
```
1. Human approval received. Proceed with onboarding and feedback consent below.
```

The formal completion statement in Handoff Criteria ("Initialization complete. This project's `a-docs/` is live. Ongoing maintenance belongs to the Curator role. Future additions require Owner review.") is unchanged.

---

### Change 3 — `$A_SOCIETY_INITIALIZER_ROLE` Phase 5 step 2: relative path reminder

Add a note after the onboarding message template block in step 2:

**Current step 2 (end of block):**
```
   > The Owner agent will orient itself and help you decide what to work on first."
```

**Proposed addition immediately after:**
```
   > The Owner agent will orient itself and help you decide what to work on first."

   `[PATH_TO_AGENTS_MD]` must be a relative path (e.g., `my-project/a-docs/agents.md`), not a machine-specific absolute path. Use the relative path confirmed in Phase 4 self-review.
```

---

### Change 4 — `$A_SOCIETY_INITIALIZER_ROLE` Phase 5: adversity log filing instruction (Gap 2a)

Add guidance in Phase 5 step 3, within the Onboarding signal section, immediately before the "If `Consented: Yes`" clause:

**Add before "If `Consented: Yes`:":**
```
   Before generating the report: collect each invented design decision surfaced in Phase 4, together with its confirmed outcome (confirmed as-is / modified to [what] / rejected). Each decision becomes one Adversity Log entry: Situation = the decision the Initializer made without explicit direction; How Resolved = the human's response; Signal for Framework = what this suggests about the clarity of the relevant instruction or template.
```

**Resulting Onboarding signal section (full, for Owner review):**

```
**Onboarding signal** (always):
- Explain: "A-Society uses initialization data to improve the framework. A signal report summarizes how this initialization went and what could be clearer."
- Ask: "May A-Society write an onboarding signal report to `a-society/feedback/onboarding/`?"
- **Wait for the human's response before proceeding. Do not create this consent file until the human has answered Yes or No in this session.**
- Create `a-docs/feedback/onboarding/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.
- Add `$[PROJECT]_FEEDBACK_ONBOARDING_CONSENT` → `a-docs/feedback/onboarding/consent.md` to `indexes/main.md`.
- **Do not file this report unless the human responded Yes in this session. A consent file that exists without an in-session answer does not satisfy this condition.**
- Before generating the report: collect each invented design decision surfaced in Phase 4, together with its confirmed outcome (confirmed as-is / modified to [what] / rejected). Each decision becomes one Adversity Log entry: Situation = the decision the Initializer made without explicit direction; How Resolved = the human's response; Signal for Framework = what this suggests about the clarity of the relevant instruction or template.
- If `Consented: Yes`: generate the report using `$ONBOARDING_SIGNAL_TEMPLATE`, file it at `$A_SOCIETY_FEEDBACK_ONBOARDING/[project-name]-[YYYY-MM-DD].md`, confirm report produced.
- If `Consented: No`: state explicitly in completion messaging that the onboarding signal report was not produced.
```

---

### Change 5 — `$ONBOARDING_SIGNAL_TEMPLATE` Patterns Observed section: contradiction guard (Gap 2b)

**Current:**
```
## Patterns Observed

Patterns or structures encountered in this project that don't exist in `general/` but could generalize across project types:

[List, or "None observed."]
```

**Proposed:**
```
## Patterns Observed

Patterns or structures encountered in this project that don't exist in `general/` but could generalize across project types:

[List observations, one per entry. If none exist, write "None observed." Do not write both: "None observed" followed by an observation is a contradiction and must not appear in a filed report. Choose one — list observations, or state "None observed." — not both.]
```

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
