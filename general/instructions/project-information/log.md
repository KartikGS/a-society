# How to Create a Project Log

## What Is a Project Log?

A project log answers two questions for any agent at the start of a session:

> "What is the current state of this project? What should I work on next?"

It is not a changelog. It is not a requirements document. It is the rolling, current-state anchor that every agent reads to orient themselves before beginning work. When an agent asks "where did we leave off?" or "what's the next priority?" — the project log is what they consult.

A project log is read at orientation, every session. It is updated at the end of each unit of work. It is not an archive — it is a window onto the present with a clear list of what comes next.

---

## Why Every Project Needs One

Without a project log, agents reconstruct current state from scattered artifacts — completed requirement documents, past conversation files, code diffs. This reconstruction is error-prone, slow, and inconsistent across sessions.

The consequences:
- Agents start work without knowing what was just completed, leading to redundant checks or contradictory assumptions
- Next priorities are buried in completed work artifacts and easy to miss
- Pre-existing known issues are re-discovered and re-reported as new findings
- Each session requires the human to re-establish context that should already be recorded

A project log is the fix for all of these. It surfaces the current state in one place, in one read, every time.

**Without a project log, every session starts from scratch. With one, every session starts from context.**

---

## What Belongs in a Project Log

A project log has three sections.

### 1. Current State
A brief summary of where the project stands right now. Include:
- A status label (e.g., "Vision & Roadmap Finalized", "In Active Development", "Stabilization Phase")
- The most recently completed unit of work, labeled `Recent Focus` — one entry only

When a new unit of work completes, its entry replaces the previous `Recent Focus`. Historical flow records live in the project's records folder, not in the log.

### 2. Next Priorities
A flat, ordered list of pending work items. Each item includes:
- A scope tag (see below) indicating expected effort
- A short title and description
- A status note if the item is blocked, deferred, or context-dependent

Next priorities are not a backlog — they are the concrete next steps. Items that are long-deferred or require a future policy decision should be marked clearly so agents can skip them without asking.

---

## Scope Tags

Each entry should include a lightweight scope tag to help agents understand expected complexity and coordination cost before reading the full entry.

Define your project's allowed tags and their meanings in the log. A common starting set:

- `[S]` — Small, single-session change
- `[M]` — Multi-step, single-phase change
- `[L]` — Multi-phase or long-running change
- `[ADR]` — Architectural decision involved
- `[DOC]` — Documentation-only change
- `[TEST]` — Testing-only or test-driven change

Tags may be combined. Define only the tags your project uses — do not copy a tag set from another project unless those tags are meaningful in your context.

---

## What Does NOT Belong

- **Detailed requirement specifications** — what a change request will do belongs in a requirements document
- **Implementation notes** — how something was built belongs in a plan artifact or ADR
- **Conversation transcripts** — historical traceability belongs in CR artifacts, not in the log
- **Aspirational state** — the log describes what is actually true now, not what you hope to achieve

If the log starts growing sections that describe planned features in detail, it has become a backlog — not a log. Keep it trimmed.

---

## How to Write One

**Step 1 — Write the current state from reality, not aspiration.**
What is actually true about this project right now? What was the last completed unit of work? If nothing has been completed yet, say so. Do not project forward.

**Step 2 — Define your scope tags.**
Choose 4–6 tags that reflect the kinds of changes your project makes. Document them in the log itself so any agent reading it can interpret the entries without external reference.

**Step 3 — List next priorities in order.**
Write the most important items first. For each item, include enough context that an agent could start work on it without needing to ask what it means. If an item is blocked or deferred, say why — briefly.

---

## Examples Across Project Types

### Software project
A log tracking change requests (CRs). Each CR completion becomes a `Recent Focus` entry with a scope tag, a one-line summary of what was done, and a completion status. Next priorities list the approved backlog items in priority order, each with a scope tag and enough context to act.

### Writing or editorial project
A log tracking chapter drafts, editorial rounds, and structural decisions. `Recent Focus` is the last completed draft or review cycle. Next priorities list the next chapter to draft, the next editorial pass to run, and any structural decisions pending the author's review.

### Research project
A log tracking experimental runs, analysis phases, and findings reviews. `Recent Focus` is the last completed analysis. Next priorities list the next experimental configuration to run, the next dataset to process, and any open questions that must be resolved before the next phase.

---

## Maintenance Rules

Copy these rules into the project's log at initialization. They govern how the log is updated over its lifetime.

- **Update at the close of every unit of work — no exceptions.** The Owner is responsible for this update. A log that lags behind is worse than no log: it misdirects agents confidently.
- **Write only what is actually true.** No aspirational state, no in-progress items that have not started.
- **One `Recent Focus` entry only.** When a flow closes, replace the previous entry. History belongs in flow records, not in the log.
- **Keep Next Priorities short.** If the list cannot be attempted in the next few sessions, it has become a backlog. Trim it.
**Validity sweeps — run at every flow:**
- **Intake sweep:** Before producing the workflow plan, check existing Next Priorities for invalidation (Addressed, Contradicted, Restructured, or Partially Addressed). Where an overlapping entry is a natural complement to the current request rather than fully invalidated, propose including it in the same flow — pending user approval.
- **Closure sweep:** At forward pass closure, check again. Resolve any entries the completed flow has addressed or made obsolete before marking the flow closed.

**Merge assessment — run before adding any Next Priorities item:**
- **Pattern A (deep merge):** Combine into one task when all three are true: same target files or design area; same implementing role or approval path; same workflow type and role sequence.
- **Pattern B (bundled flow):** Bundle as parallel tracks when all three are true: adjacent but distinct areas belonging to a cohesive initiative; same implementing role or approval path; no sequencing conflict between tracks.
- When a Pattern A merge is identified, replace the existing item(s) with one merged item retaining source citations.
- When a Pattern B merge is identified, replace the existing items with one bundled item naming both tracks and retaining source citations.
