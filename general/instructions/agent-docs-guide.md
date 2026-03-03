# How to Create an Agent-Docs Guide

## What Is an Agent-Docs Guide?

An agent-docs guide is a rationale document that explains why each file and folder in a project's agent-docs exists — its purpose, what it is responsible for, what would break if it were removed, and what must not be consolidated with it.

It is not a directory listing. It is not a folder structure guide. It is written for the Curator: the agent responsible for maintaining the project's documentation. Without it, a Curator maintaining files must guess at their purpose — and guessing leads to consolidation that should not happen, deletion of things that matter, and drift from original intent.

---

## Why Projects Need This Document

Two failure modes emerge when a Curator lacks rationale context:

**Consolidation errors:** The Curator merges two files that look similar but serve distinct purposes — for example, combining a vision document with a structure document because both describe the project. The result is a document that does neither job well and whose scope is unclear.

**Purpose drift:** The Curator adds content to a file based on topic adjacency rather than ownership. Over time, files accumulate content that was never theirs to hold, and the original design intent is lost.

The agent-docs guide prevents both by making the "why" explicit before any maintenance begins.

---

## Who Reads It

The agent-docs guide is Curator context — it is not required reading for all agents. Add it to the Curator role's required reading list, not to `agents.md`.

Other agents (owners, analysts, implementers) do not need this level of file-by-file rationale. They need to know where things are (that is the index's job) and what the project is (that is `agents.md` and the vision's job).

---

## What to Include

### One entry per significant file or folder

Cover every file and folder that a Curator might touch, modify, or make a placement decision about. Do not cover every file mechanically — use judgment. A temporary working file does not need a rationale entry. A core structural document does.

### For each entry, answer four questions:

1. **Why it exists** — what problem does this file solve? What would an agent not know without it?
2. **What it owns** — what is this file responsible for? What content belongs here and nowhere else?
3. **What breaks without it** — if this file were removed or absorbed into another, what specifically fails?
4. **What not to consolidate it with** — name the adjacent files that look similar but must remain separate, and explain why.

Not every entry needs all four. Short files with obvious purpose can be brief. Files at risk of being misunderstood or consolidated need more.

---

## Format

Use a flat structure: one section per file or folder, grouped by their location in the project. Group project-level files first, then go folder by folder.

Use the file's `$VARIABLE_NAME` from the project index when referencing it — never hardcode the path.

Example entry:

```markdown
### `roles/owner.md` — `$[PROJECT]_OWNER_ROLE`

**Why it exists:** [One sentence — the specific gap this file fills.]

**What it owns:** [What content belongs here.]

**What breaks without it:** [The specific failure mode if this file disappears.]

**Do not consolidate with:** `[adjacent file]` — [one sentence explaining why they must stay separate].
```

---

## What Not to Include

- **Directory listings** — the index (`indexes/main.md`) is the file registry. The agent-docs guide explains purpose, not location.
- **Content from the files themselves** — summarize purpose; do not reproduce content. If the rationale requires quoting the file at length, the file itself should be clearer.
- **Hypothetical future files** — document what exists. Do not write rationale entries for files that have not been created yet.
- **Folder structure rules** — placement rules belong in the structure document (`project-information/structure.md`). The agent-docs guide answers "why does this file exist?" not "where should new content go?"

---

## Where It Lives

Place this file at the root of the project folder, as a peer of `project-information/`, `roles/`, and `indexes/`. It is not a subfolder — it is a single document.

Name it `agent-docs-guide.md`.

Register it in the project index as `$[PROJECT]_AGENT_DOCS_GUIDE`.

Add it to the Curator role's required reading — not to `agents.md`.

---

## Keeping It Current

The agent-docs guide must be updated whenever:
- A new file is added to the project's agent-docs
- A file is removed or relocated
- A file's purpose changes materially

This is the Curator's responsibility. An outdated agent-docs guide is worse than none — it gives the Curator false confidence about a file's purpose.
