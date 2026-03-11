# Onboarding Signal Report

**Project:** promo-agency (BrightLaunch Agency)
**Date:** 2026-03-11
**Project path:** `promo-agency/`

---

## Project Profile

- **Type:** other (promotional agency)
- **Domain:** Campaign strategy, content creation, and distribution.
- **Existing a-docs at start:** none

---

## Reconnaissance Findings

### What was inferable from existing files

The `README.md` defined the agency's primary function (campaign strategy, content creation, and distribution) and confirmed that the existing organization was ad hoc (shared documents, email threads).

### What required human clarification

| Question asked | Why files didn't answer it |
|---|---|
| Specific core team roles? | `README.md` just said "a core team." It did not specify who does what. |
| Existing workflow? | `README.md` stated campaigns happen but did not describe stages or triggers. |
| Folder structures and conventions? | `README.md` mentioned "ad hoc Google Drive." I needed to know what should be established vs. what to adapt. |

---

## Instruction Quality Assessment

For each instruction used from `general/instructions/`:

| Instruction ($VAR) | Outcome | Notes |
|---|---|---|
| `$INSTRUCTION_VISION` | Sufficient | N/A |
| `$INSTRUCTION_STRUCTURE` | Sufficient | N/A |
| `$INSTRUCTION_LOG` | Sufficient | N/A |
| `$INSTRUCTION_AGENTS` | Sufficient | N/A |
| `$INSTRUCTION_WORKFLOW` | Sufficient | N/A |
| `$INSTRUCTION_COMMUNICATION` | Sufficient | Provided clear separation between conversation (templates) and coordination (protocols). |
| `$INSTRUCTION_ROLES` | Sufficient | N/A |
| `$INSTRUCTION_INDEX` | Sufficient | N/A |

---

## Adversity Log

Situations where the Initializer hit friction, ambiguity, or had to make a judgment call:

| Situation | How resolved | Signal for framework |
|---|---|---|
| Needed to map agency workflow to software-centric terminology. | Kept workflow generic but tailored terms like "Brief" and "Post-Launch Review" instead of PR loops. | Standard templates could optionally provide non-software examples. |

---

## Human Review Corrections

Changes the human requested during Phase 4 review. High-signal: these are places the Initializer got something wrong or produced something the human didn't want.

No corrections — human approved as drafted.

---

## Patterns Observed

Patterns or structures encountered in this project that don't exist in `general/` but could generalize across project types:

None observed initially. The Analyst/Post-Launch Review cycle maps well to a general Verification loop.

---

## Recommendations

Proposed changes to `general/` or `agents/` based on this initialization run:

No recommendations at this time.

---

## Completion Checklist

- [x] All foundational documents created and populated
- [x] Human approval received
- [x] Consent verified at `a-docs/feedback/onboarding/consent.md` before filing this report
- [x] Report filed at `a-society/feedback/onboarding/promo-agency-2026-03-11.md`
