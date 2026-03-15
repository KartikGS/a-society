---

**Subject:** Archetype template Handoff Output drift — path portability missing from all six archetypes
**Status:** PENDING_REVIEW
**Type:** Brief
**Date:** 2026-03-15

---

## Background

The v11.0 update (2026-03-15-agent-reliability-gaps.md) added a path portability requirement to `$INSTRUCTION_ROLES` Section 7 (the canonical Handoff Output definition). Section 7 was the brief's explicit scope. The six archetype templates in the same document (Archetypes 1–6, each containing a Handoff Output section) were not in scope and were not updated. This creates a drift condition: an agent building a new role document from an archetype template copies the pre-v11.0 text, which does not include the path portability requirement.

Flagged in the Curator's backward pass findings (`a-society/a-docs/records/20260315-ink-test-run-findings/06-curator-findings.md`).

---

## What and Why

Each of the six archetype templates in `$INSTRUCTION_ROLES` includes a Handoff Output section with copyable-inputs language. None include the path portability sentence added in v11.0. The fix is mechanical: append the portability requirement to the copyable-inputs sentence in each archetype's Handoff Output section.

No direction decision is implied. This is consistency maintenance within a single document.

---

## Target Location

`$INSTRUCTION_ROLES` — Handoff Output section in each of the six archetype templates (Archetypes 1 through 6).

---

## Exact Changes Required

The portability addition to apply is identical across all six archetypes:

> Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

This sentence must be appended to the copyable-inputs sentence in each archetype's Handoff Output section. The exact current text and required replacement for each archetype follows.

---

### Archetype 1 — Owner

**Current item 4:**
> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`

**Replace with:**
> 4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

### Archetype 2 — Analyst

**Current copyable-inputs sentence:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`)

**Replace with:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`). Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

### Archetype 3 — Implementer

**Current copyable-inputs sentence:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`)

**Replace with:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`). Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

### Archetype 4 — Reviewer

**Current copyable-inputs sentence:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`)

**Replace with:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`). Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

### Archetype 5 — Coordinator

**Current copyable-inputs sentence:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`)

**Replace with:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`). Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

### Archetype 6 — Curator

**Current copyable-inputs sentence:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`)

**Replace with:**
> Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`). Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

---

## Scope Constraint

Only `$INSTRUCTION_ROLES` archetype templates. Do not modify Section 7 (already updated in v11.0), and do not modify any other document in this flow.

---

## Curator Confirmation Required

The Curator must acknowledge this brief before acting:
- State: "Acknowledged. Beginning implementation of Archetype template Handoff Output drift — path portability missing from all six archetypes."

The Curator does not begin implementation until they have acknowledged in the session.
