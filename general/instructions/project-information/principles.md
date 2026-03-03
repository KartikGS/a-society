# How to Create a Project Principles Document

## What Is a Project Principles Document?

A project principles document answers one question for any agent making a product or design decision:

> "What does this project value — and what does that mean for how I build it?"

It is not a style guide. It is not a requirements list. It is the set of domain-specific, project-specific values that should shape every decision an agent makes when building or modifying the product. When an agent asks "should this page include a disclaimer?" or "which approach better serves the user?" — the principles document is what they consult.

A principles document is read at orientation and re-consulted when making decisions where values are in tension. It is more stable than requirements (which change per feature) but less fundamental than vision (which rarely changes at all). It lives between them.

---

## Why Every Project Needs One

Without a principles document, agents apply generic best practices — which may not reflect what this project actually values. A project built for experts has different principles than one built for beginners. A product that prioritizes trust has different principles than one that prioritizes speed. Generic best practices cannot capture this.

The consequences:
- Agents make product decisions that are technically correct but wrong for this audience
- The same design question is resolved differently across sessions, producing inconsistent experiences
- Edge cases (disclaimers, error states, accessibility treatments) are handled ad hoc rather than systematically
- Principles that emerged from real experience are never recorded, and must be re-derived every session

A principles document captures hard-won domain knowledge in a persistent, readable form. It answers recurring questions once, permanently, so every agent session produces consistent output.

**Without a principles document, agents use their priors. With one, they use yours.**

---

## What Belongs in a Project Principles Document

A principles document is a numbered list of named principles. Each principle has:

### A Name (mandatory)
Short, memorable, and descriptive. An agent should be able to recall the principle by its name after a single read. "Educational Clarity First" is a good name. "Principle 3" is not.

### The Rule (mandatory)
A clear, actionable statement of what the principle requires. Bullet points work well when a principle has multiple facets. Write in imperative or declarative form, not aspirational: "Prefer explanations a learner can follow" rather than "We aspire to be clear."

### Policy Clarifications (optional, highly recommended)
When a principle has generated recurring ambiguity — a specific tension, an edge case, or a decision that keeps coming up — write the resolution directly in the principle. This turns recurring judgment calls into documented policy.

Example: A "Stage Continuity" principle might include an explicit policy on whether bridging callouts should duplicate footer navigation links — because that exact question arose repeatedly and the answer is non-obvious.

---

## What Does NOT Belong

- **Universal best practices** — "write clean code" or "follow accessibility standards" are not project principles; they are baseline professional expectations
- **Feature requirements** — what a specific feature does belongs in a requirements document
- **Process rules** — how work is handed off or reviewed belongs in a workflow document
- **Technical constraints** — what must not be broken belongs in an architecture document

A principle should be specific to this project and this domain. Ask: "Would this principle be equally true of any well-run project?" If yes, it is not a project principle — it is a generic best practice. Remove it.

---

## How to Write One

**Step 1 — List the recurring decisions where values matter.**
Think about the decisions that agents have gotten wrong (or made inconsistently) in the past. What values were unclear? What policy was absent? Each of these is a candidate principle.

**Step 2 — Name each principle.**
Give each one a short, specific name that captures its purpose. The name should make its domain clear: "Educational Clarity First" signals it is about learning. "Honest Model Framing" signals it is about representation.

**Step 3 — Write the rule.**
State what the principle requires. Be specific enough that an agent making a decision can apply it. Avoid vague language — "be clear" is not actionable; "do not introduce specialized terms without a short explanation or a direct reference link" is.

**Step 4 — Add policy clarifications for recurring tensions.**
If a principle has generated repeated ambiguity, resolve it inline. Write the resolution as a declared policy: "Rule: [specific resolution]." This prevents the same tension from recurring in every session.

**Step 5 — Cut principles that are not specific to this project.**
After writing, read each principle and ask: "Is this true only of this project, or of any project?" Cut any that are true of any project. What remains is the document.

---

## Format Rules

- **Named principles, not numbered ones.** Numbers suggest an ordering that usually does not exist. Names are memorable and searchable.
- **Actionable over aspirational.** Each principle should answer: "When facing decision X, what does this principle tell me to do?" If it does not, rewrite it.
- **Policy over vagueness.** When a principle is invoked often enough to generate recurring decisions, turn the recurring decision into a policy and write it into the principle. The goal is to reduce future judgment calls, not to describe the kinds of judgment calls that exist.
- **Short over comprehensive.** A principles document is read at orientation. If it is longer than what an agent can absorb in a single read, cut it. The most important principles are the ones that are remembered, not the longest list.

---

## Examples Across Project Types

### Educational software product
- **Educational Clarity First**: Prefer explanations a learner can follow. Do not introduce specialized terms without a short explanation or reference link.
- **Honest Model Framing**: Clearly distinguish demo behavior, base model behavior, and fine-tuned behavior. Fallback states must be explicit in text, not color-only hints.
- **Legal / Trust Signals**: Any surface that displays AI-generated content must include a visible disclaimer. Define the standard wording, placement, and accessibility treatment once, here.

### Legal research tool
- **Accuracy Over Completeness**: When uncertain, return nothing rather than returning a plausible-but-unverified result. The cost of a wrong answer is higher than the cost of an incomplete one.
- **Citation Integrity**: Every legal claim displayed to the user must be traceable to a specific source. Unsourced synthesis is not permitted in user-facing output.
- **Jurisdiction Transparency**: When a result applies only to specific jurisdictions, state the scope explicitly. Do not imply universal applicability.

### Content publishing platform
- **Author Voice Preservation**: Editing tools must not alter the author's words without explicit opt-in. Suggestions are separate from accepted changes.
- **Separation of Draft and Published**: Draft content and published content are treated as distinct artifacts with distinct access controls. A draft is never accessible via the public URL of the published version.

---

## What Makes a Principles Document Fail

**Too generic.** A principles document full of "write clean, maintainable code" and "follow accessibility guidelines" is not a principles document — it is a code of conduct. Remove anything that is true of any well-run project.

**No policy, only values.** A principle that states "prefer clarity" without defining what clarity means in practice provides no decision guidance. The value of a principle is in its policy implications — write those explicitly.

**Principles that contradict each other without resolution.** When two principles are in tension (e.g., "minimize page weight" and "resource-rich learning"), the document should either rank them or define when each takes precedence. Unresolved tension becomes recurring confusion.

**Updated too frequently.** Principles should evolve slowly, in response to real patterns observed across multiple sessions. A principle that changes every sprint was not a principle — it was a local decision that was over-promoted.
