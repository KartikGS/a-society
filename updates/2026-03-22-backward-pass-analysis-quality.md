# A-Society Framework Update — 2026-03-22

**Framework Version:** v17.6
**Previous Version:** v17.5

## Summary

A new "Analysis Quality" subsection has been added to the Backward Pass Protocol section of `$GENERAL_IMPROVEMENT`. It introduces two principles: that externally-caught errors demand deeper root-cause analysis than self-caught errors, and that genuine backward-pass findings must trace a specific root cause rather than describe what went wrong. Projects that have instantiated `$GENERAL_IMPROVEMENT` as their improvement document are missing this guidance.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 1 | Adds quality guidance to your backward pass protocol — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Analysis Quality subsection added to Backward Pass Protocol

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/improvement/main.md`]
**What changed:** A new `### Analysis Quality` subsection was inserted into the Backward Pass Protocol, immediately after the "What to Reflect On" / "Reflection Categories" section (after its closing line) and before "Generalizable Findings". The subsection contains two principles:

1. **Externally-caught errors are higher priority, not lower** — when an error was caught by another role or the human rather than the agent themselves, the backward pass must ask why, tracing through placement gaps, surfacing gaps, or structural gaps.
2. **Artifact production vs. genuine analysis** — reflection categories are a starting point, not a checklist; a genuine finding names a specific root cause, not just a description of what went wrong.

**Why:** Backward pass analyses were observed stopping at the first layer of explanation ("the rule is documented") without asking why the rule wasn't followed — particularly when errors were caught externally. The new subsection establishes the deeper analysis obligation explicitly.

**Migration guidance:** Locate your project's instantiation of the improvement document (typically `$[PROJECT]_IMPROVEMENT` → `a-docs/improvement/main.md`). In the Backward Pass Protocol section, find the "What to Reflect On" or "Reflection Categories" subsection and its closing line (the line beginning "Ground every finding in a specific moment…"). If no `### Analysis Quality` subsection follows that line, insert it with the following content verbatim, before the "Generalizable Findings" subsection:

---

### Analysis Quality

**Externally-caught errors are higher priority, not lower.** When an error was caught by another role or the human rather than surfaced by the agent themselves, this is a signal that something failed to prevent the error. The backward pass must ask: "Why wasn't this caught by me?" The answer "the rule was documented" is the start of the analysis, not the end. The next question — "why wasn't the documented rule followed?" — leads to placement gaps, surfacing gaps, or structural gaps, all of which are actionable.

**Artifact production vs. genuine analysis.** The reflection categories are a starting point, not a checklist to fill. If a finding could have been written without tracing the error, the analysis has not been done. A genuine finding names a specific root cause, not just a description of what went wrong.

---

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
