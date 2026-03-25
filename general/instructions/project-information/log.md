# How to Create a Project Log

## What Is a Project Log?

A project log answers two questions for any agent at the start of a session:

> "What is the current state of this project? What should I work on next?"

It is not a changelog. It is not a requirements document. It is the rolling, current-state anchor that every agent reads to orient themselves before beginning work. When an agent asks "where did we leave off?" or "what's the next priority?" — the project log is what they consult.

A project log is read at orientation, every session. It is updated at the end of each unit of work (a completed change request, a completed phase). It is not an archive — it is a window onto the present, with a bounded view into the recent past and a clear list of what comes next.

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

A project log has four sections.

### 1. Current State
A brief summary of where the project stands right now. Include:
- A status label (e.g., "Vision & Roadmap Finalized", "In Active Development", "Stabilization Phase")
- The most recent completed unit of work, labeled `Recent Focus` — one entry only
- Up to three prior completed entries, labeled `Previous`

### 2. Entry Lifecycle
Each entry follows a rolling window:
- When a new unit of work completes, it becomes `Recent Focus`
- The previous `Recent Focus` is demoted to `Previous`
- When there are already three `Previous` entries, the oldest is moved to the companion archive file (see Archive File below)
- Validation: exactly one `Recent Focus`, at most three `Previous`

### 3. Next Priorities
A flat, ordered list of pending work items. Each item includes:
- A scope tag (see below) indicating expected effort
- A short title and description
- A status note if the item is blocked, deferred, or context-dependent

Next priorities are not a backlog — they are the concrete next steps. Items that are long-deferred or require a future policy decision should be marked clearly so agents can skip them without asking.

**Merge Assessment**

Before adding any Next Priorities item — whether at intake or from a synthesis pass — scan existing Next Priorities items for merge opportunities. Two items are mergeable when all three conditions are true:

1. **Same target files or same design area** — they touch the same document(s) or the same conceptual area.
2. **Compatible authority level** — both are same-role authority (both the same implementing role, or both requiring the same approval path).
3. **Same workflow type and role path** — both items would run through the same workflow type with the same role sequence.

When a merge is identified, replace the existing item(s) with a single merged item covering all consolidated work. The merged item retains the source citations of all constituent items.

### 4. Archive File

The archive lives in a companion file: `[project]/a-docs/project-information/log-archive.md` — a separate file from the main log. The main log does not contain an `## Archive` section. Instead, it ends with a single pointer line:

> Archived flows are recorded in `$[VARIABLE_NAME]`. One entry per flow. Entries are immutable once written. Most recent at top.

The archive file uses this format for each entry:

```
[scope-tags] — **slug** (YYYY-MM-DD): one sentence describing what changed.
```

- **Date** — the close date of the flow.
- **Slug** — matches the record folder identifier (if the project uses records).
- **Sentence** — covers the primary change at the highest level; no sub-items, no artifact lists.
- **Order** — most recent at top. Entries are immutable once written.

The archive is not read at orientation. It exists for historical traceability when agents need to understand what predates the rolling window.

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

If the log starts growing sections that describe planned features in detail, or accumulates entries that are never archived, it has become a backlog — not a log. Keep it trimmed.

---

## How to Write One

**Step 1 — Write the current state from reality, not aspiration.**
What is actually true about this project right now? What was the last completed unit of work? If nothing has been completed yet, say so. Do not project forward.

**Step 2 — Define your scope tags.**
Choose 4–6 tags that reflect the kinds of changes your project makes. Document them in the log itself so any agent reading it can interpret the entries without external reference.

**Step 3 — Define your entry lifecycle.**
Write out the rolling window rules explicitly: how many `Previous` entries are shown, when entries move to archive. The rules need to be stated so any agent maintaining the log can apply them correctly without asking.

**Step 4 — List next priorities in order.**
Write the most important items first. For each item, include enough context that an agent could start work on it without needing to ask what it means. If an item is blocked or deferred, say why — briefly.

**Step 5 — Create the archive file.**
Create `log-archive.md` as a companion file in the same `project-information/` folder as the main log. Start it empty, or pre-populate it with completed flows that predate the log's creation, using the one-liner format above. Add the pointer line at the bottom of the main log referencing the archive file by `$VARIABLE_NAME` from the project's index.

---

## Format Rules

- **Current state is current.** The log must reflect the actual present state of the project. An outdated log is worse than no log — it misdirects agents confidently.
- **One `Recent Focus`.** Never allow two entries to claim `Recent Focus`. The discipline of the rolling window is what keeps the log useful.
- **Archive everything, delete nothing.** When an entry ages out of the rolling window, prepend it to `log-archive.md` in one-liner format. This preserves traceability while keeping the active log scannable.
- **Next priorities are actionable.** Each item should be specific enough that an agent could pick it up and start. Vague items like "improve performance" are not next priorities — they are topics for a planning session.
- **Maintained at the end of each unit of work.** The log is updated when work closes, not periodically. The agent responsible for closure (the BA, the owner, whoever closes work in your project) owns the update.

---

## Examples Across Project Types

### Software project
A log tracking change requests (CRs). Each CR completion becomes a `Recent Focus` entry with a scope tag, a one-line summary of what was done, and a completion status. Next priorities list the approved backlog items in priority order, each with a scope tag and enough context to act.

### Writing or editorial project
A log tracking chapter drafts, editorial rounds, and structural decisions. `Recent Focus` is the last completed draft or review cycle. Next priorities list the next chapter to draft, the next editorial pass to run, and any structural decisions pending the author's review.

### Research project
A log tracking experimental runs, analysis phases, and findings reviews. `Recent Focus` is the last completed analysis. Next priorities list the next experimental configuration to run, the next dataset to process, and any open questions that must be resolved before the next phase.

---

## What Makes a Project Log Fail

**Updated too infrequently.** A log that is three CRs behind is not a log — it is a stale artifact. The log must be updated at the close of every unit of work, without exception.

**Allowed to grow unbounded.** When `Previous` entries accumulate past the defined window, the log becomes a timeline — and agents must read all of it to find current state. The rolling window discipline is what keeps it scannable.

**Aspirational entries.** Writing "In Progress: feature X" when feature X has not actually started is aspirational, not descriptive. Agents who read this will act on incorrect state. Write only what is actually true.

**Next priorities that aren't priorities.** A list of fifty items is not a priorities list. It is a backlog. Keep the next priorities list to what would realistically be attempted in the next few sessions.
