# How to Create a File Path Index

## What Is a File Path Index?

A file path index is a single table that maps variable names to the current locations of key files in a project. It is the only place in the project where file paths are declared as facts. Everywhere else, files are referenced by their variable name.

```
| Variable           | Current Path                  | Description          |
|--------------------|-------------------------------|----------------------|
| $TOOLING_STANDARD  | docs/tooling/standard.md       | Canonical tool rules   |
```

Paths are **project-relative** — relative to the project root (the folder that contains `a-docs/`), not the workspace. Write `docs/tooling/standard.md`, not `<project>/docs/tooling/standard.md`. The runtime resolves each path under the project namespace, so the index stays correct even when the project lives in a different folder (for example, a git worktree). Add a one-line note at the top of the index telling agents the paths are project-relative.

When a file moves, one cell in this table changes. Every reference throughout the project — in every document, in every agent session — resolves correctly through the variable. Nothing else needs updating.

---

## Why Every Project Needs One

In any project with more than a handful of documents, files get reorganized. A folder structure that made sense at the start rarely survives intact. Documents move as the project matures, as new categories emerge, or as structural improvements are made.

Without an index, every move triggers a documentation sweep: find every reference to the old path, update it, hope nothing was missed. This is tedious, error-prone, and discourages necessary reorganization — projects keep files in suboptimal locations because moving them is too costly.

With an index, a file move is a one-row change. The sweep becomes a grep for the variable name, which takes seconds and produces a definitive list. Reorganization becomes cheap, so it actually happens.

**The index does not just fix broken links. It removes the reason links break in the first place.**

---

## Variable Naming Convention

Variables use `$SCREAMING_SNAKE_CASE` — all uppercase, words separated by underscores, prefixed with `$`.

**Naming rules:**
- Name the variable after what the file *is*, not where it currently *lives*. A file at `docs/tooling/standard.md` is `$TOOLING_STANDARD`, not `$DOCS_TOOLING_STANDARD`. When the file moves, the name still makes sense.
- Keep names short enough to be readable inline: `$TOOLING_STANDARD` is better than `$PROJECT_CANONICAL_TOOLING_REQUIREMENTS_STANDARD`.

---

## How to Write One

**Step 1 — Identify the files that are commonly cross-referenced.**
Read through your active documents and note which files appear as links more than once. These are your candidates. Also include any file that is part of a required reading list, even if not yet widely referenced.

**Step 2 — Assign a variable name to each.**
Follow the naming convention above. Name for what the file is, not where it lives.

**Step 3 — Build the table.**
Three columns: Variable, Current Path, Description. The description should be one clause — enough for an agent to confirm they have found the right file without opening it.

**Step 4 — Replace hardcoded paths in active documents.**
For each registered file, find all references to its path in active documents and replace them with the variable name. Historical artifacts (closed reports, archived docs) are exempt — do not edit immutable records.

**Step 5 — Register the index itself.**
Add the index file as an entry in its own table. An agent looking for the index should be able to find it through the same mechanism as everything else.

**Step 6 — Register it in the appropriate required readings.**
The index is surfaced to agents via required readings. Add it to the required readings list for any role that needs to resolve file paths.

---

## Maintenance Rules

Copy these rules into the project's index at initialization. They govern how the index is used and updated over its lifetime.

**Registration:**
- **Register before referencing.** Never use a `$VARIABLE_NAME` in a document unless it is registered in the index. An unregistered variable resolves to nothing.
- **Register a file when:** it is referenced by more than one document, it is a canonical source agents need to find, it is likely to move as the project evolves, or it is part of a required reading sequence.
- **Do not register:** files referenced only once (update that document directly), implementation artifacts unlikely to be linked by name, or every file in the project. The index is a registry of key files, not a directory listing.
- **Keep the index short enough to scan in one read.** Cross-reference frequency, not file count, determines registration.

**Table format:**
- **Three columns only:** Variable, Current Path, Description. Do not add columns.
- **One row per file.** Flat registry — no grouping or nesting.
- **Description is one clause.** Enough to identify the file's purpose without opening it.
- **Paths must be project-relative and must not begin with `/`.** Write `a-docs/agents.md` (relative to the project root that holds `a-docs/`), not `<project>/a-docs/agents.md`, not `/a-docs/agents.md`, and not a machine-specific absolute path. Strip any machine-specific or project-folder prefix from file operation outputs before writing.
- **Variable names must reflect what the file is, not where it lives.** A name tied to a path breaks when the file moves.

**Usage:**
- **Always reference by variable name, never by path.** Write `$TOOLING_STANDARD`, not `docs/tooling/standard.md`. The path lives in one place: the index.
- **Always resolve through the index.** Do not assume a path from a prior session is still correct — look it up.
- **For files not in the index,** use the project-relative path directly. Do not invent an unregistered `$VARIABLE_NAME` — an invented variable resolves to nothing and gives the appearance of indirection without the benefit.

**Moving a file:**
- Update only the **Path** cell. Variable names must not change — a renamed variable breaks every document that references it.
- Grep for the variable name across all active documents to confirm no hardcoded paths remain.

**Retiring a variable:**
1. Grep all active documents for the `$VARIABLE_NAME` before touching anything.
2. For each consumer: replace with the new variable name if relocated, or remove the reference if the file is gone.
3. Remove the variable row from the index only after all consumer references are resolved.
4. Post-removal scan: grep for both the `$VARIABLE` form and the prose concept name — stale prose references survive row deletion.