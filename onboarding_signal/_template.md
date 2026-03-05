# Onboarding Signal Report

**Project:** [project name]
**Date:** [YYYY-MM-DD]
**Project path:** [relative path from a-society/]

---

## Project Profile

- **Type:** [software / writing / research / legal / other]
- **Domain:** [one sentence description]
- **Existing a-docs at start:** [none / partial — list what existed]

---

## Reconnaissance Findings

### What was inferable from existing files

[List what the Initializer could determine without asking the human. Be specific — cite which files provided which signals.]

### What required human clarification

[List each question asked and why the existing files didn't answer it. This is a direct signal of gaps in `general/` instructions or in the project's own documentation.]

| Question asked | Why files didn't answer it |
|---|---|
| [question] | [reason] |

---

## Instruction Quality Assessment

For each instruction used from `general/instructions/`:

| Instruction ($VAR) | Outcome | Notes |
|---|---|---|
| [instruction name] | Sufficient / Insufficient / Missing | [what was unclear, what was missing, what needed adaptation] |

---

## Adversity Log

Situations where the Initializer hit friction, ambiguity, or had to make a judgment call:

| Situation | How resolved | Signal for framework |
|---|---|---|
| [description] | [how handled] | [what this suggests should change in general/] |

[Or: "None encountered."]

---

## Human Review Corrections

Changes the human requested during Phase 4 review. High-signal: these are places the Initializer got something wrong or produced something the human didn't want.

| Document | What changed | Likely cause |
|---|---|---|
| [doc name] | [what was corrected] | [why Initializer got it wrong] |

[Or: "No corrections — human approved as drafted."]

---

## Patterns Observed

Patterns or structures encountered in this project that don't exist in `general/` but could generalize across project types:

[List, or "None observed."]

---

## Recommendations

Proposed changes to `general/` or `agents/` based on this initialization run:

| Target file or folder | Change type | Description |
|---|---|---|
| [path] | Add / Update / Remove | [what and why] |

[Or: "No recommendations at this time."]

---

## Completion Checklist

- [ ] All foundational documents created and populated
- [ ] Human approval received
- [ ] Signal report written and filed at `a-society/onboarding_signal/[project]-[date].md`
