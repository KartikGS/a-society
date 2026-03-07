# A-Society: Design Principles

These principles govern how A-Society itself is designed and extended. They apply to the framework's own architecture — not to the projects that adopt it. When designing a new feature, check each principle before proposing or implementing.

---

## 1. Context Is a Scarce Resource

An agent's context window is finite and shared. Required reading should contain the minimum necessary for the role to operate correctly — no more.

- Load documents at session start only if the role cannot do its job without them
- Documents needed by some agents but not all are not universal required reading — they are loaded on-demand by the specific role that needs them
- When designing a new artifact or feature, ask: "Which agent loads this, and when?" If the answer is "only when X happens," do not add it to required reading lists

**Consequence:** A feature that requires every agent to load a file it rarely uses is a poorly scoped feature. Redesign the scope before shipping.

---

## 2. Consent Precedes Signal

A-Society collects feedback signal from adopting projects to improve the framework. This collection requires explicit, recorded consent from the project's owner.

- Every feedback mechanism must have a corresponding consent file at `a-docs/feedback/[type]/consent.md` in the adopting project
- Agents check consent before writing. If the consent file is absent or Consented is No, the agent skips writing and notes it in session output — no exceptions
- Consent is recorded at the project level, not globally. Each project opts in independently
- Consent files are loaded on-demand by the feedback-producing agent, not at session start

**Consequence:** Any new feedback mechanism that ships without a corresponding consent model is incomplete. Define the consent type and the agent behavior before publishing the feature.

---

## 3. Feedback Is a Design Requirement

A-Society grows from signal collected during real-world use. Any feature that generates usable signal — initializations, migrations, maintenance cycles — should have a feedback mechanism considered at design time.

The questions to ask when designing a new feature:

1. Does this feature produce signal that could improve the framework?
2. If yes: where does the signal go, what format does it take, and which agent produces it?
3. What is the consent model?
4. What is the storage location under `a-society/feedback/`?

If the answer to question 1 is no, no feedback mechanism is needed. Do not add feedback for its own sake.

**Consequence:** A feature that silently discards useful signal is a missed improvement opportunity. A feature that forces feedback collection is a violation of Principle 2. Design the feedback scope to match the signal value.

---

## 4. Structure Reflects Scope

A-Society's folder structure is a deliberate expression of what the framework is. Adding a folder adds a category; adding a category implies a commitment to maintain it.

- Do not create a folder until three or more artifacts warrant it — or until namespace parity requires it (see `$A_SOCIETY_STRUCTURE`)
- Do not add to `general/` unless the artifact is genuinely domain-agnostic and reusable without modification across any project type
- Do not add to `a-docs/` unless the artifact is documentation for agents working on A-Society itself

**Consequence:** When in doubt about placement, apply the placement test from `$A_SOCIETY_STRUCTURE`: "Is this true only of A-Society, or would it be equally true of a legal project, a writing project, and a software project?"
