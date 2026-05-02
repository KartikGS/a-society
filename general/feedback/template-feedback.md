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

Classify each candidate by generality so A-Society's intake can route it correctly:

- **Universal** — applies without modification to every project type
- **Category-shaped (`<category>`)** — applies across a recognizable category of projects but not universally; name the category. If the named category does not exist under `a-society/general/project-types/`, the contribution implies a category-creation request that requires Owner approval before any category folder is created
- **Project-specific** — only applies to your project; included for context, not for inclusion in `general/`

A row whose Generality cell is missing or unclassified is malformed.

| Target | Generality | Problem | Recommended change |
|---|---|---|---|
| [general / runtime / workflow / docs] | [universal / category-shaped (`<category>`) / project-specific] | [what hurt] | [what to change] |

## Share-Upstream Notes

- Review the report for project-specific or sensitive details before sharing it upstream.
- If shared, use a manual GitHub PR rather than assuming automatic submission.

## Suggested PR Metadata

**Suggested PR title:** [short title]

**Suggested PR body:**

```markdown
[One short paragraph the human can reuse or adapt when opening a PR.]
```
