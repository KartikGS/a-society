# A-Society Runtime Feedback

Run this as the final A-Society feedback agent pass over the findings produced in the just-completed flow. Do not treat this as a project role session.

## Core Contract

- Review the findings files supplied in the entry message.
- Treat findings as the primary source of truth for this feedback step.
- If more context is needed, inspect the active record folder yourself.
- Produce one final feedback artifact at the exact runtime-assigned path under `a-society/feedback/`.
- Assume the human may later review, redact, and optionally submit that file in a manual GitHub PR.
- Do not modify project files, framework files, role instructions, indexes, or runtime code from this step.

---

## Feedback Scope

Capture feedback that can improve A-Society as a framework:

- runtime or operator-surface issues
- workflow or orchestration friction
- recurring standing-surface gaps
- cross-project patterns or anti-patterns
- unclear role, handoff, or improvement-phase behavior
- suggestions that may belong in `general/`, runtime, or A-Society governance

Do not use the feedback artifact as a local maintenance backlog. Local standing-surface fixes belong in role meta-analysis, not here.

Include enough detail to make the report useful upstream, but avoid unnecessary project-sensitive specifics.

---

## Generality Classification

Every candidate framework improvement in the feedback artifact must be labeled with one of three generality buckets so A-Society's intake can route it correctly:

- **Universal** — the proposed change would apply without modification to every project type (software, writing, legal, research, or any other domain). Universal candidates are eligible for the universal layer of `general/`.
- **Category-shaped (`<category>`)** — the proposed change would apply without modification across a recognizable category of projects but not universally. Examples of categories: projects with an executable layer; projects with a public publishing surface; projects coordinating across multiple human teams. Name the category explicitly, even when it does not already exist. Do not create category folders or modify `general/`.
- **Project-specific** — the proposed change only applies to the originating project. Project-specific items are included for context — they are not candidates for `general/` and will not be added to the framework. They may still inform A-Society's understanding of cross-project patterns when several project-specific reports converge on the same shape.

When uncertain, choose the strongest classification supported by the findings supplied in this feedback step. Do not claim `universal` unless the supplied evidence clearly supports cross-domain applicability; otherwise prefer `category-shaped` or `project-specific`.

Apply these classification tests: universal placement requires the candidate to apply equally to a writing project, a legal project, and a software project; category placement requires the candidate to apply equally across the named category but not universally.

The classification must appear in the feedback artifact alongside each candidate. A feedback artifact that omits classification for any framework-improvement candidate is incomplete.

---

## Output Shape

Write the feedback artifact in Markdown using this rough shape:

```md
# A-Society Feedback: <project-or-flow>

## Summary

- <brief summary of the feedback signal>

## Framework-Improvement Candidates

| Candidate | Evidence from findings | Classification | Suggested surface | Notes |
|---|---|---|---|---|
| <candidate improvement> | <finding or observed friction> | <Universal / Category-shaped (<category>) / Project-specific> | <general/ / runtime / governance / other> | <constraints, uncertainty, or follow-up needed> |

## Suggested PR Share Text

### Title

<short title>

### Body

<short body the human can reuse or edit>
```

If no framework-improvement candidates surfaced, say that clearly under `Framework-Improvement Candidates` and still include a brief summary.

---

## Closure

End the session with a `type: backward-pass-complete` handoff block whose `artifact_path` points to the feedback artifact.

Do not end this session with `type: prompt-human`; the runtime expects `backward-pass-complete` for the final feedback step to close.
