# How to Create an Agent-Docs Guide

## What Is an Agent-Docs Guide?

An agent-docs guide is a rationale document that explains why each file and folder in a project's agent-docs exists — its purpose, what it is responsible for, what would break if it were removed, and what must not be consolidated with it.

It is not a directory listing. It is not a folder structure guide. It is written for whichever role owns documentation stewardship for the project. Without it, the owning role must guess at each file's purpose — and guessing leads to consolidation that should not happen, deletion of things that matter, and drift from original intent.

---

## Why Projects Need This Document

Two failure modes emerge when the documentation owner lacks rationale context:

**Consolidation errors:** The documentation owner merges two files that look similar but serve distinct purposes — for example, combining a vision document with a structure document because both describe the project. The result is a document that does neither job well and whose scope is unclear.

**Purpose drift:** The documentation owner adds content to a file based on topic adjacency rather than ownership. Over time, files accumulate content that was never theirs to hold, and the original design intent is lost.

The agent-docs guide prevents both by making the "why" explicit before any maintenance begins.

---

## Who Reads It

The agent-docs guide is maintenance context — it is not required reading for all agents. Add it to the required reading lists of roles that own or maintain a-docs surfaces, not to `agents.md`.

---

## What to Include

### One entry per significant file or folder

Cover every file and folder that any a-docs-owning role might touch, modify, or make a placement decision about. Do not cover every file mechanically — use judgment. A temporary working file does not need a rationale entry. A core structural document does.

### For each entry, answer five questions:

1. **Why it exists** — what problem does this file solve? What would an agent not know without it?
2. **What it owns** — what is this file responsible for? What content belongs here and nowhere else?
3. **What breaks without it** — if this file were removed or absorbed into another, what specifically fails?
4. **What not to consolidate it with** — name the adjacent files that look similar but must remain separate, and explain why.
5. **Who reads it** — which role loads this file, and when? If no role reads it, the artifact's value is in question.

Not every entry needs all five. Short files with obvious purpose can be brief. Files at risk of being misunderstood or consolidated need more. But question 5 should always have an answer — if it does not, the artifact's value is in question.

---

## Format

Use a flat structure: one section per file or folder, grouped by their location in the project. Group project-level files first, then go folder by folder.

Use the file's `$VARIABLE_NAME` from the project index when referencing it — never hardcode the path.

Example entry:

```markdown
### `roles/owner/main.md` — `$[PROJECT]_OWNER_ROLE`

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

Name it `a-docs-guide.md`.

Register it in the project index as `$[PROJECT]_AGENT_DOCS_GUIDE`.

Add it to the required readings of any role that owns or maintains a-docs surfaces. Do not duplicate it in `agents.md`.

---

## Keeping It Current

The agent-docs guide must be updated whenever:
- A new file is added to the project's agent-docs
- A file is removed or relocated
- A file's purpose changes materially

When adding a new file, the owning role must verify that it is assigned to at least one role's required reading or on-demand loading. An artifact with a rationale entry but no assigned reader is an orphan — it is documented but functionally invisible to every agent in the project. Catching this at creation time is easier than discovering it later.

An outdated agent-docs guide is worse than none — it gives agents false confidence about a file's purpose.
