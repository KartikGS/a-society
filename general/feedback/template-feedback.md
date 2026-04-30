# Upstream Feedback Report — Template

Use this template for the single runtime-managed upstream feedback artifact that may be generated after a flow's backward-pass meta-analysis.

The runtime assigns the final filename and asks the operator for consent before this report is created.

---

**Project:** [project name]
**Flow ID:** [flow id]
**Flow kind:** [standard / initialization / update-application]
**Date:** [YYYY-MM-DD]
**Produced by:** [A-Society Feedback]

---

## Summary

[Short paragraph describing what this flow revealed about A-Society.]

## What Happened

- [Key observation]
- [Key observation]
- [Key observation]

## Framework Improvements

| Target | Problem | Recommended change |
|---|---|---|
| [general / runtime / workflow / docs] | [what hurt] | [what to change] |

## Share-Upstream Notes

- Review the report for project-specific or sensitive details before sharing it upstream.
- If shared, use a manual GitHub PR rather than assuming automatic submission.

## Suggested PR Metadata

**Suggested PR title:** [short title]

**Suggested PR body:**

```markdown
[One short paragraph the human can reuse or adapt when opening a PR.]
```
