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

## Closure

End the session with a `type: backward-pass-complete` handoff block whose `artifact_path` points to the feedback artifact.

Do not end this session with `type: prompt-human`; the runtime expects `backward-pass-complete` for the final feedback step to close.
