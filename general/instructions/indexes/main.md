# How to Create a File Path Index

## What Is a File Path Index?

A file path index is a single table that maps variable names to the current locations of key files in a project. It is the only place in the project where file paths are declared as facts. Everywhere else, files are referenced by their variable name.

```
| Variable           | Current Path                          | Description          |
|--------------------|---------------------------------------|----------------------|
| $TOOLING_STANDARD  | /project/docs/tooling/standard.md     | Canonical tool rules |
```

When a file moves, one cell in this table changes. Every reference throughout the project — in every document, in every agent session — resolves correctly through the variable. Nothing else needs updating.

---

## Why Every Project Needs One

In any project with more than a handful of documents, files get reorganized. A folder structure that made sense at the start rarely survives intact. Documents move as the project matures, as new categories emerge, or as structural improvements are made.

Without an index, every move triggers a documentation sweep: find every reference to the old path, update it, hope nothing was missed. This is tedious, error-prone, and discourages necessary reorganization — projects keep files in suboptimal locations because moving them is too costly.

With an index, a file move is a one-row change. The sweep becomes a grep for the variable name, which takes seconds and produces a definitive list. Reorganization becomes cheap, so it actually happens.

**The index does not just fix broken links. It removes the reason links break in the first place.**

---

## What Belongs in an Index

Not every file in a project belongs in the index. Register a file when:

- It is referenced by more than one other document
- It is a canonical source that many agents or collaborators need to find
- It is likely to move as the project evolves (e.g., it lives in a folder that may be reorganized)
- It is part of a required reading list or orientation sequence

Do not register:
- Files that are only ever referenced from one other document (update that one document directly)
- Files that are implementation artifacts unlikely to be linked to by name (e.g., individual data files, generated outputs)
- Every file in the project — the index is a registry of key files, not a directory listing

**The index should be short enough to scan in a single read. If it grows long, it has drifted from its purpose.**

---

## Variable Naming Convention

Variables use `$SCREAMING_SNAKE_CASE` — all uppercase, words separated by underscores, prefixed with `$`.

**Naming rules:**
- Name the variable after what the file *is*, not where it currently *lives*. A file at `docs/tooling/standard.md` is `$TOOLING_STANDARD`, not `$DOCS_TOOLING_STANDARD`. When the file moves, the name still makes sense.
- Use the project name as a prefix for project-level documents when the index covers multiple projects or layers: `$LLM_JOURNEY_VISION`, `$A_SOCIETY_STRUCTURE`.
- Use a category prefix for instruction-type documents: `$INSTRUCTION_TOOLING`, `$INSTRUCTION_VISION`.
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

**Step 6 — Point to it from the project's primary orientation document.**
Agents need to know the index exists. Add a one-line reference to it in the document agents read first (e.g., the project's AGENTS.md equivalent, or the project vision). The reference should state: where the index lives, and what the `$VAR` convention means.

---

## Format Rules

- **Three columns only:** Variable, Current Path, Description. Do not add columns for owner, status, or last-updated — those belong elsewhere.
- **One row per file.** Do not group or nest entries. The table is a flat registry.
- **Description is one clause.** Enough to identify the file's purpose without opening it. Not a full sentence, not a paragraph.
- **Paths are absolute from the project root.** Relative paths break when the index is read from a different directory. Use `/project-root/...` notation consistently.
- **The index is a declaration, not documentation.** It does not explain why files exist or how they relate to each other. Those explanations belong in the structure document or the files themselves.

---

## How to Use the Index

**When referencing a file in a document:**
Use the variable name inline: "See `$TOOLING_STANDARD` for package manager requirements." Do not write the path. The path lives in one place: the index.

**When following a reference as an agent:**
Look up the variable in the index to get the current path, then open the file. Do not assume a path you remember from a prior session is still correct — always resolve through the index.

**When moving a file:**
1. Update the **Path** cell in the index.
2. Grep for the variable name across all active documents to confirm no hardcoded paths remain.
3. No other updates are needed.

---

## Examples Across Project Types

### Software project
| Variable | Current Path | Description |
|---|---|---|
| `$TOOLING_STANDARD` | `/docs/project/tooling/standard.md` | Package manager, runtime version, lint and test commands |
| `$API_CONTRACTS` | `/docs/api/contracts.md` | Route definitions, request/response shapes, versioning policy |
| `$TESTING_STRATEGY` | `/docs/testing/strategy.md` | Test classification, coverage requirements, mock policy |

### Editorial / writing project
| Variable | Current Path | Description |
|---|---|---|
| `$STYLE_GUIDE` | `/project-docs/style/guide.md` | Voice, tone, formatting, and citation standards |
| `$EDITORIAL_WORKFLOW` | `/project-docs/process/workflow.md` | Stages from draft to publication, roles at each stage |
| `$GLOSSARY` | `/project-docs/reference/glossary.md` | Defined terms used consistently throughout the project |

### Research project
| Variable | Current Path | Description |
|---|---|---|
| `$RESEARCH_PROTOCOL` | `/docs/protocol.md` | Data collection method, inclusion criteria, analysis approach |
| `$DATA_DICTIONARY` | `/docs/reference/data-dictionary.md` | Variable definitions, units, and coding conventions |
| `$FINDINGS_SUMMARY` | `/docs/findings/summary.md` | Current state of conclusions — updated as analysis progresses |

---

## What Makes an Index Fail

**Registering too many files.** An index with fifty entries is not navigable. If everything is registered, nothing is prioritized. Register key files only.

**Naming variables after locations.** `$DOCS_TOOLING_STANDARD` breaks as a name the moment the file moves out of `docs/`. Name for what the file is.

**Not replacing hardcoded paths.** Creating the index but leaving direct paths scattered through documents gives the impression of indirection without the benefit. The index only works if it is the single place paths live.

**Not pointing to it from the orientation document.** An index no one knows about is not used. It must be surfaced in the document agents read first.
