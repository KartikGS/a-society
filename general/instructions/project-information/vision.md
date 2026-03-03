# How to Create a Vision Document

## What Is a Vision Document?

A vision document answers three questions for any collaborator — human or agent — before they begin work:

> "What is this project? Why does it matter? What direction do we move in?"

It is not a requirements list. It is not a feature roadmap. It is the stable anchor that every other document in the project is implicitly oriented toward. When an agent finishes a task and asks "was that right?" — the vision document is what they check against.

A vision document is read once per session, at orientation. It is short enough to be absorbed fully in a single read, and stable enough that it rarely needs updating.

---

## Why Every Project Needs One

Without a vision document, agents optimize locally. They complete the task in front of them correctly, efficiently, and in isolation — with no reliable way to know if that task was moving the project in the right direction.

The consequences accumulate silently:
- An agent implements a feature that is technically correct but misaligned with the project's purpose
- Agents across different sessions make contradictory decisions because they each inferred direction differently
- Scope creep goes undetected because no one has an explicit filter for "does this belong here?"
- Every new session requires the human to re-establish context that should already be documented

A vision document is the fix for all of these at once. It gives every agent — regardless of which session they joined, which task they were given, or how much prior context they have — a shared orientation. One document, loaded once, makes every subsequent decision better calibrated.

**Without a vision, agents navigate by inference. With one, they navigate by intent.**

---

## What Belongs in a Vision Document

A vision document has three mandatory components and one optional one.

### 1. The Problem (mandatory)
What situation exists that this project is responding to? State it plainly. This is not a sales pitch — it is a diagnosis. A well-written problem statement makes it immediately clear why the project exists and what would be worse if it did not.

### 2. The Core Bet (mandatory)
What is the fundamental claim or hypothesis the project is built on? This is usually one or two sentences. It should be specific enough to be falsifiable — if the bet is wrong, the project is wrong. Vague bets ("we believe in quality") are not bets; they are filler.

The core bet is the most important sentence in the document. An agent that has only read this sentence should be able to make better decisions than an agent that has read nothing.

### 3. Direction for Agents (mandatory)
What should an agent do when they encounter a decision that is not covered by any other document? The vision document is the final filter. This section tells agents explicitly how to apply the vision — not as a rule, but as a compass.

Include:
- What kinds of additions belong here vs. what should be rejected
- What "aligned with the vision" looks like in practice
- What to do when uncertain (ask? defer? apply the core bet and proceed?)

### 4. What Already Exists (optional, recommended for early-stage projects)
A brief inventory of the artifacts that already exist, so an agent reading the vision can immediately orient to the current state of the project. This section becomes less necessary as the project matures and other index documents take over this function.

---

## What Does NOT Belong

- **Requirements** — what the project will build belongs in a requirements document
- **Process** — how work gets done belongs in a workflow document
- **Tool declarations** — what tools are used belongs in a tooling document
- **Role definitions** — who does what belongs in role documents
- **Detailed plans** — what comes next belongs in a plan or backlog

If a vision document starts growing sections that describe *how* work is done rather than *why* the project exists, those sections belong elsewhere. Extract them.

---

## How to Write One

**Step 1 — Write the problem in one paragraph.**
Resist the urge to soften or qualify it. A clear problem statement is one where a reader who has never heard of the project immediately understands what is wrong with the world without it.

**Step 2 — Write the core bet in one or two sentences.**
Ask: "If this project succeeds completely, what was the claim that turned out to be true?" That claim, stated up front as a bet, is the core bet.

**Step 3 — Write the direction for agents.**
Think about the decisions that are most likely to be ambiguous — additions that seem reasonable but might not belong, trade-offs between quality and scope, choices about what to defer. The direction section pre-answers the most common versions of these.

**Step 4 — Add the optional inventory if the project is new.**
List what already exists. Keep it as a table: artifact name and one-line purpose. This section should be updated or removed as the project matures and other indexes take over.

**Step 5 — Cut everything that is not one of the above.**
A vision document that is three pages long is not a vision document. It is an encyclopaedia that agents will skim. Ruthless cutting is part of writing a good one.

---

## Format Rules

- **Short over complete.** The goal is retention, not comprehensiveness. If an agent can recall the core bet after closing the document, the vision document succeeded.
- **Declarative, not aspirational.** "We believe that..." is weaker than "The bottleneck is not capability — it is context." State things as true, not as hoped-for.
- **Stable by design.** A vision document that changes every month is not a vision document. It is a status update. Write it to last. If the core bet changes, the project has changed direction — which is a significant event, not a routine update.
- **First person is permitted.** Vision documents are often the most human voice in a project's documentation. That is intentional.

---

## Examples Across Project Types

### Software project
- **Problem:** Developers spend more time configuring AI agents than the agents save.
- **Core bet:** If the project structure is right, even a basic agent produces reliable output. The investment is in setup, not in agent capability.
- **Direction:** Add to this project only what makes the next agent session faster to orient. Reject additions that are interesting but do not serve that goal.

### Book or editorial project
- **Problem:** First-time readers of [topic] have no reliable entry point — existing resources assume too much prior knowledge or too little.
- **Core bet:** A reader who finishes this book will be able to [specific outcome], which they could not do before.
- **Direction:** Every chapter, section, and example should advance the reader toward that outcome. Cut anything that does not.

### Research project
- **Problem:** [Phenomenon X] is not understood well enough to make reliable predictions about [Y].
- **Core bet:** If we can establish [specific relationship or mechanism], it will resolve the current ambiguity and enable [practical application].
- **Direction:** Prioritize evidence that directly addresses the core bet. Secondary findings are documented but not allowed to redirect the primary inquiry.

### Design project
- **Problem:** Users of [product] cannot accomplish [task] without [frustrating workaround].
- **Core bet:** A redesigned [surface] that prioritizes [specific quality] will reduce the workaround to zero for the majority of users.
- **Direction:** Every design decision is evaluated against whether it makes the primary task easier. Aesthetic improvements that do not serve this are deferred.

---

## What Makes a Vision Document Fail

**Too long.** Agents will not re-read a long document mid-session. The vision is only useful if it is in active memory.

**No core bet.** A vision document without a falsifiable claim gives agents nothing to align to. "We want to build something great" is not a bet.

**Too specific.** If the vision document describes implementation details, it will become stale within weeks. Stay at the level of direction, not prescription.

**Updated too frequently.** Each update implies the previous version was wrong. Frequent updates erode trust in the document as a stable anchor. Distinguish between refining the wording (acceptable) and changing the direction (significant, requires deliberate decision).
