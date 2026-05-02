# A-Society Runtime Feedback

This file is runtime-owned guidance for the final backward-pass feedback step.

The runtime uses this guide after participating roles have produced their meta-analysis findings. This phase is not a project role session and is not the same as the forward-pass Owner. It is an A-Society-owned feedback pass over the findings produced in the just-completed flow.

---

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
- recurring documentation gaps
- cross-project patterns or anti-patterns
- unclear role, handoff, or improvement-phase behavior
- suggestions that may belong in `general/`, runtime, or A-Society governance

Do not use the feedback artifact as a local maintenance backlog. Local standing-surface fixes belong in role meta-analysis, not here.

Include enough detail to make the report useful upstream, but avoid unnecessary project-sensitive specifics.

Add a short suggested PR title/body section so the human has reusable share text if they decide to submit the report upstream.

---

## Generality Classification

Every candidate framework improvement in the feedback artifact must be labeled with one of three generality buckets so A-Society's intake can route it correctly:

- **Universal** — the proposed change would apply without modification to every project type (software, writing, legal, research, or any other domain). Universal candidates are eligible for the universal layer of `general/`.
- **Category-shaped (`<category>`)** — the proposed change would apply without modification across a recognizable category of projects but not universally. Examples of categories: projects with an executable layer; projects with a public publishing surface; projects coordinating across multiple human teams. Name the category explicitly. If the named category does not already exist under `a-society/general/project-types/`, the contribution implies a category-creation request that requires explicit Owner approval before any category folder is created.
- **Project-specific** — the proposed change only applies to the originating project. Project-specific items are included for context — they are not candidates for `general/` and will not be added to the framework. They may still inform A-Society's understanding of cross-project patterns when several project-specific reports converge on the same shape.

When uncertain, label the candidate with the strongest claim that holds with confidence — for example, prefer `category-shaped` over `universal` when only one category of project has produced the pattern. Do not over-claim universality. Reviewers can promote a candidate from category-shaped to universal once additional categories produce the same pattern; reviewers cannot easily walk back an unwarranted universal claim once it lands at the universal layer.

Apply the classification using the placement tests defined in A-Society's structure document — universal placement requires the candidate to apply equally to a writing project, a legal project, and a software project; category placement requires the candidate to apply equally across the named category but not universally.

The classification must appear in the feedback artifact alongside each candidate (the standard report template carries a dedicated column for this). A feedback artifact that omits classification for any framework-improvement candidate is malformed.

---

## Closure

End the session with a `type: backward-pass-complete` handoff block whose `artifact_path` points to the feedback artifact.

Do not end this session with `type: prompt-human`; the runtime expects `backward-pass-complete` for the final feedback step to close.
