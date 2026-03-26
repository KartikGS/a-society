# Owner → Curator: Briefing

---

**Subject:** runtime-layer-vision — Vision and architecture update to acknowledge the runtime layer
**Status:** BRIEFED
**Date:** 2026-03-26

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `$A_SOCIETY_VISION` | modify — add runtime layer description |
| `$A_SOCIETY_ARCHITECTURE` | modify — add runtime as a system component |

**Context:** The Owner and the human have aligned on a directional shift for A-Society. The framework is evolving from a pure documentation/library framework into a framework that also includes a **runtime layer** — a programmatic orchestration system that manages agent sessions, injects context automatically, and routes handoffs without human intervention.

The core insight driving this change: A-Society currently delivers its knowledge (roles, workflows, quality standards) through natural language instruction that agents read and follow. This works but is wasteful — agents spend context tokens on process choreography (reading required documents, confirming context, knowing when to invoke tools, producing handoff formats) that could be handled programmatically. The runtime layer moves process choreography from natural-language instruction to programmatic control, leaving agents' context budgets for behavioral guidance (how to think, what to review, what quality means).

**The direction, agreed with the human:**

1. A-Society's knowledge layer (general/, roles, workflows, instructions) remains the foundation — it becomes the configuration that the runtime reads
2. A-Society builds a runtime that programmatically orchestrates what is currently done through natural language instruction and manual session switching
3. The runtime owns: automated context injection, automated session orchestration, automated process triggers (backward pass, validation, scaffolding)
4. Behavioral guidance stays in-context — agents still need to know *how to think*
5. The runtime calls LLM APIs directly rather than plugging into existing editors — to control sessions, you must own the session

**What needs to change in each file:**

### 1. `$A_SOCIETY_VISION` — [Requires Owner approval]

**[modify]** Update the vision to acknowledge the runtime layer as a third work product layer alongside the library layer and the active layer. The key additions:

- In **"What A-Society Is"** (the section describing the two work product layers): Add the runtime layer as a new subsection after the programmatic tooling layer paragraph. The runtime layer is the orchestration system that operationalizes the framework's knowledge — it manages agent sessions, injects context from role definitions and workflow documents, orchestrates handoff transitions, and triggers process tools automatically. Frame it as the natural evolution: the library defines what good looks like, the active agents produce it, the tooling makes deterministic operations reliable, and the runtime orchestrates the whole loop.

- In **"Why Roles and Workflows Exist"**: No change to the existing arguments. But after the paragraph ending "follow your designed workflows," insert a brief acknowledgment that the runtime layer is the mechanism by which workflow compliance becomes structural rather than instructional — agents follow the workflow because the runtime routes them through it, not because a document told them to. Keep this to 2–3 sentences maximum. Do not undermine the existing argument that workflows matter regardless of enforcement mechanism.

- In **"The Vision"** section: The three bullet points (project-agnostic, domain-agnostic, agent-agnostic) remain unchanged. The runtime does not change any of these properties.

- Do NOT change the "Core Bet" section — it remains exactly as is. The runtime is in service of the core bet, not a modification of it.

### 2. `$A_SOCIETY_ARCHITECTURE` — [Requires Owner approval]

**[modify]** Update the architecture to include the runtime as a component of the system.

- In **"System Overview"**: The current text lists four top-level folders (general/, agents/, tooling/, a-docs/). Add a fifth entry for the runtime layer. Frame it as: the programmatic orchestration system that manages agent sessions, context injection, and handoff routing. Note that it is planned and not yet implemented (same framing used for the tooling layer when it was first added). Technology choice: TypeScript/Node.js, consistent with the existing tooling layer. Note that the runtime calls LLM APIs directly and provides its own interface — it is not a plugin for existing editors.

- In **"System Overview"** tooling component table: Do NOT add the runtime to this table. The runtime is architecturally distinct from the tooling components (which are agent-invoked utilities). The runtime is a separate system that orchestrates agents and invokes tooling components — it sits above them, not alongside them.

- Consider whether the **"Architectural Invariants"** section needs any update. My assessment: the existing invariants (Layer Isolation, Boundary Respect, Portability Hard Constraint, Information Ownership, Context Loading Scope, Consent Before Signal) remain valid. The runtime does not violate any of them — it is work product (like tooling/), not documentation (a-docs/). If the Curator identifies a tension during proposal, flag it.

---

## Scope

**In scope:**
- Prose updates to `$A_SOCIETY_VISION` and `$A_SOCIETY_ARCHITECTURE` as described above
- Scanning whether existing sections in these files need rewording to accommodate the runtime concept (e.g., phrases like "A-Society has two work product layers" in vision.md need to account for the expanded count)
- Flagging any `general/` instructions that reference A-Society's scope in ways that become stale (flag only — do not fix in this flow)

**Out of scope:**
- Updates to `$A_SOCIETY_STRUCTURE` for a `runtime/` folder — the runtime code does not exist yet; structure entries are added when folders are created, not preemptively
- Updates to `$A_SOCIETY_INDEX` or `$A_SOCIETY_PUBLIC_INDEX` — no new files are being created
- Design of the runtime itself (architecture, API, session model) — that is a separate future flow
- Updates to role documents referencing context loading or process choreography — those will be addressed in future flows once the runtime exists
- Any `general/` instruction updates — flag stale references if found, but they enter as separate flows
- Framework update report assessment — this change modifies `a-docs/` only, not `general/` or `agents/`, so no update report is warranted per `$A_SOCIETY_UPDATES_PROTOCOL`

---

## Likely Target

- `$A_SOCIETY_VISION` — `a-society/a-docs/project-information/vision.md`
- `$A_SOCIETY_ARCHITECTURE` — `a-society/a-docs/project-information/architecture.md`

---

## Open Questions for the Curator

None. The direction and specific insertion points are fully specified above. The Curator's job is accurate prose execution and placement verification.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for runtime-layer-vision."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
