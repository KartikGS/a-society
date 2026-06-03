# How to Create a Vision Document

## What Is a Vision Document?

A vision document answers three questions for any agent before they begin work:

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

A vision document has four mandatory components and one optional one.

### 1. The Problem (mandatory)
What situation exists that this project is responding to? State it plainly. This is not a sales pitch — it is a diagnosis. A well-written problem statement makes it immediately clear why the project exists and what would be worse if it did not.

### 2. The Core Bet (mandatory)
What is the fundamental claim or hypothesis the project is built on? This is usually one or two sentences. It should be specific enough to be falsifiable — if the bet is wrong, the project is wrong. Vague bets ("we believe in quality") are not bets; they are filler.

The core bet is the most important sentence in the document. An agent that has only read this sentence should be able to make better decisions than an agent that has read nothing.

### 3. Who This Is For and How They Use It (mandatory)
Who is the primary user of this project, and what does a typical interaction look like? This section gives every agent a mental model of the human they are ultimately serving — their context, their goals, and their usage pattern.

Include:
- Who the user is (not a demographic, but a context: "a researcher who needs to..." or "a solo developer who...")
- What a typical session looks like — how they engage with the project day to day
- Any critical insight about their context that shapes what agents should prioritize

This is distinct from the problem statement (which diagnoses a situation) and the core bet (which states a hypothesis). This section answers: *who shows up, and what are they trying to do?*

An agent who has read this section can ask, before making any decision: "Does this serve the person I just read about, in the way they actually use this project?" That question catches a large class of mistakes that no amount of technical correctness prevents.

### 4. Direction for Agents (mandatory)
What should an agent do when they encounter a decision that is not covered by any other document? The vision document is the final filter. This section tells agents explicitly how to apply the vision — not as a rule, but as a compass.

Include:
- What kinds of additions belong here vs. what should be rejected
- What "aligned with the vision" looks like in practice
- What to do when uncertain (ask? defer? apply the core bet and proceed?)

### 5. What Already Exists (optional, recommended for early-stage projects)
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

**Step 3 — Write who this is for and how they use it.**
Name the primary user specifically — not a persona, but a context. Then describe what a typical session or interaction looks like. Ask: "What does this person do with this project on a normal day, and what does success look like for them in that moment?" Keep it short — two to four sentences is enough. The goal is a vivid enough picture that an agent can check any decision against it.

**Step 4 — Write the direction for agents.**
Think about the decisions that are most likely to be ambiguous — additions that seem reasonable but might not belong, trade-offs between quality and scope, choices about what to defer. The direction section pre-answers the most common versions of these.

**Step 5 — Add the optional inventory if the project is new.**
List what already exists. Keep it as a table: artifact name and one-line purpose. This section should be updated or removed as the project matures and other indexes take over.

**Step 6 — Cut everything that is not one of the above.**
A vision document that is three pages long is not a vision document. It is an encyclopaedia that agents will skim. Ruthless cutting is part of writing a good one. First person is permitted — vision documents are often the most human voice in a project's documentation.

---

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

## Maintenance Rules

Copy these rules into the project's vision document at initialization. They govern how the document is updated over its lifetime.

- **Update only when direction changes.** Wording refinements are acceptable. If the core bet needs to change, the project has changed direction — treat it as a significant event requiring deliberate decision, not a routine edit.
- **Resist adding length.** If a new section seems necessary, the content likely belongs in the structure document, a workflow document, or requirements. The vision document's value is proportional to how quickly it can be absorbed in one read.
- **Stay declarative.** Rewrite any "we believe that..." phrasing as a statement of fact.
- **No implementation detail.** Anything that could become stale as features change does not belong here.
- **Check for a core bet.** If the core bet has become vague or been removed, the document has lost its primary function. Every agent decision should be checkable against a specific, falsifiable claim.
