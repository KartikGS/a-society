# How to Create an Architecture Document

## What Is an Architecture Document?

An architecture document answers two questions for any agent before they touch the codebase or design:

> "What does this system look like? What must never change?"

It is not a tutorial. It is not a feature specification. It is the shared mental model of the system's structure and the non-negotiable constraints that govern all technical decisions within it. When an agent asks "can I change this?" or "does this fit?" — the architecture document is what they check.

An architecture document is read at orientation and re-read when a task touches a sensitive area (security, observability, data flow, component boundaries). It is stable by design: it changes when the system changes, not when individual features do.

---

## Why Every Project Needs One

Without an architecture document, agents reason about structure from code alone. They may correctly implement a feature while unknowingly violating a constraint that exists for good reason — a security boundary, an observability contract, a rendering strategy that depends on SEO requirements.

The consequences:
- Constraints that exist as unwritten team knowledge are violated by agents that lack that history
- Each new session re-derives the same system model from first principles
- Agents touch security-sensitive or observability-critical areas without recognizing them as such
- Inconsistent component decisions accumulate across CRs

An architecture document makes implicit constraints explicit. One document, loaded once, prevents an entire class of structural mistakes.

**Without an architecture document, agents optimize locally. With one, they operate within a shared model.**

---

## What Belongs in an Architecture Document

An architecture document has two mandatory sections and two optional ones.

### 1. System Overview (mandatory)
A short description of what the system is and how it is structured at the highest level. Name the major components and what each one is responsible for. This section should be short enough to read in thirty seconds and specific enough to orient someone who has never seen the codebase.

### 2. Architectural Invariants (mandatory)
The constraints that must never be violated, regardless of what feature is being built. For each invariant:
- State the rule clearly
- Explain why it exists (the consequence of violation)
- Name the domain it governs (security, observability, rendering, data flow, etc.)

These are not preferences. They are load-bearing constraints. An agent that violates one has made a mistake, even if the feature works.

### 3. High-Level Components (optional, recommended)
A more detailed description of each major component — what it owns, what it depends on, and what boundaries it must not cross. Useful when the system has more than three or four significant components.

### 4. Data Flow (optional, recommended)
A description of how data moves through the system for the one or two flows that are most likely to be touched by agents. Not a comprehensive map — just enough to orient an agent who is about to touch a route, a hook, or a pipeline.

---

## What Does NOT Belong

- **Feature requirements** — what the system will do next belongs in requirement documents
- **Implementation details** — how a specific feature was built belongs in ADRs or code comments
- **Tooling declarations** — what tools are used belongs in a tooling document
- **Role definitions** — who owns what belongs in role documents
- **Historical decisions** — why something was built a certain way belongs in ADRs

If the architecture document starts accumulating sections that explain individual features or historical decisions, those sections belong elsewhere. The architecture document describes what is true now, not how it got there.

---

## How to Write One

**Step 1 — Write the system overview in one paragraph.**
Name the technology stack and the major structural divisions (frontend, backend, inference engine, observability pipeline, etc.). Be specific about technology choices — "React 19 with Next.js App Router" is better than "a web frontend."

**Step 2 — Identify the load-bearing constraints.**
Ask: "What could an agent unknowingly break that would have serious consequences?" These are your invariants. Write one invariant per domain. Common domains: security, observability/telemetry, rendering strategy, data flow, API contracts.

**Step 3 — Write each invariant as a rule, not a preference.**
"Telemetry must never block user-facing functionality" is an invariant. "We prefer non-blocking telemetry" is not. State each constraint as an absolute.

**Step 4 — Add components and data flow if the system is complex enough to need them.**
The threshold: if an agent reading only the overview could not confidently predict where a given feature lives in the codebase, add a components section. If the data flow is non-obvious (e.g., involves proxies, workers, or external pipelines), document it.

**Step 5 — Cross-reference to deeper documents.**
When a constraint has a dedicated deeper document (an observability principles doc, an ADR, a security model), add a cross-reference. The architecture document names the constraint; the deeper document explains it.

---

## Format Rules

- **Invariants are absolute.** Do not soften them with "generally" or "where possible." If the constraint has exceptions, state the exceptions explicitly — or it is not an invariant.
- **Stable by design.** An architecture document that changes every sprint is a living design document, not an architecture document. If the invariants are changing frequently, question whether they are truly invariants.
- **Short over comprehensive.** A long architecture document will be skimmed. Agents need to hold the invariants in active memory while working. If the document is too long to absorb, the invariants are not being remembered.
- **Named domains.** Group invariants by domain (Security, Observability, Rendering, etc.) so agents can quickly locate the constraints relevant to their task.

---

## Examples Across Project Types

### Software project (web application)
- **Overview:** A Next.js application with client-side inference (ONNX Runtime) and server-side orchestration via API routes.
- **Invariant (Observability):** Telemetry failures must never crash or degrade user-facing functionality. All metric calls are wrapped in safe wrappers that swallow errors.
- **Invariant (Security):** All external inputs are untrusted. Request payload sizes are explicitly constrained at the middleware layer.

### Research data pipeline
- **Overview:** A Python pipeline that ingests raw datasets, processes them through a sequence of transformation stages, and writes outputs to a versioned artifact store.
- **Invariant (Data Integrity):** Raw inputs are never modified. All transformations produce new artifacts; source data is read-only.
- **Invariant (Reproducibility):** Every pipeline run must be reproducible from its inputs and configuration alone. Non-deterministic operations are prohibited in transformation stages.

### Content management system
- **Overview:** A headless CMS with a REST API backend and a React frontend. Content is authored in the CMS and rendered server-side for SEO-critical pages.
- **Invariant (SEO):** Pages with organic traffic targets must be server-rendered. No SEO-critical page may be converted to a client-rendered component without explicit review.
- **Invariant (Content Safety):** All user-submitted content is sanitized before storage and before rendering. No raw HTML from external sources reaches the frontend.

---

## What Makes an Architecture Document Fail

**Too implementation-specific.** If the document reads like a code walkthrough, it will become stale within weeks. Describe structure and constraints, not implementation.

**Invariants without consequences.** "Do not hardcode API keys" is not an invariant — it is a best practice. An invariant names what breaks if the rule is violated: "API keys must never appear in client-side code, as they would be exposed to any browser user."

**No cross-references.** When an invariant depends on a deeper document (an observability principle, a threat model, an ADR), not cross-referencing it means agents will apply the invariant without the context needed to apply it correctly.

**Updated too frequently.** Architecture documents that change with every feature are not architecture documents. They are design notes. Structural constraints change when the system changes in a fundamental way — not when a new route is added.
