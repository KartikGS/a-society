# How to Create a Tooling Document

## What Is a Tooling Document?

A tooling document declares the canonical tools, formats, and standards for a project. It answers one question for every collaborator — human or agent — before they start work:

> "What do we use here, and what do we never use?"

It is not a tutorial. It is not a list of features. It is a set of explicit, enforceable declarations that make the project's tool choices unambiguous.

---

## Why Every Project Needs One

Collaborators — including AI agents — make tool choices constantly. Without a declared standard, each one independently decides which tool to use, which format to produce, or which version to target. The result is:

- Inconsistent outputs that don't integrate cleanly
- Rework when someone used the "wrong" tool
- Agents guessing based on context clues rather than explicit rules
- Onboarding friction every time a new collaborator joins

A tooling document eliminates this. It is loaded once, at the start of any session, and every subsequent tool choice is already resolved.

**The cost of not having one is paid on every task, by every collaborator, forever.**

---

## What Belongs in a Tooling Document

Include anything a collaborator must know to produce work that integrates with the project. Structure it around four questions:

### 1. What is used?
Name the canonical tool for each category that matters to the project. Be specific — not "a spreadsheet tool" but "Google Sheets."

### 2. What is forbidden?
If a plausible alternative exists, say explicitly that it is not permitted. Agents and humans default to familiar tools when no constraint is stated. Forbidden alternatives prevent silent drift.

### 3. What are the constraints?
Version requirements, required formats, mandatory configuration. The constraint is what an agent can check — "Node ≥ 20.x" is checkable; "a recent version" is not.

### 4. How do you verify compliance?
For each critical tool, include at least one step a collaborator can take to confirm they are operating correctly before they produce work. This turns a declaration into a gate.

---

## What Does NOT Belong

- **What you are building** — that belongs in requirements or a project brief
- **How to use a tool** — that belongs in a tutorial or onboarding guide
- **Role-specific procedures** — those belong in role documents
- **Business logic** — that belongs in design or specification documents

If a section starts describing *why* a feature works or *what* output to produce, it has drifted out of scope. Move it.

---

## How to Write One

**Step 1 — List your tool categories.**
Start with the categories where confusion is most likely. For most projects: primary document format, collaboration platform, file naming, version control. Add categories specific to your domain.

**Step 2 — Fill in the canonical choice for each.**
One tool per category. If there is genuinely a choice (e.g., two approved editors), say so explicitly — but keep it rare. Optionality is friction.

**Step 3 — Add forbidden alternatives where confusion is likely.**
Only list what needs to be excluded. If there is no plausible alternative to reach for, skip it.

**Step 4 — Add verification steps for critical tools.**
A verification step is something a collaborator can do in under a minute to confirm compliance. For a technical tool: a version check command. For a non-technical tool: a named file or template location to confirm access.

**Step 5 — Register it in the project index.**
Once the document exists, add it to the project's file index with a variable name (e.g., `$TOOLING_STANDARD`). References throughout the project use the variable, not the path. If the file ever moves, only the index changes.

---

## Format Rules

- **Declarations, not explanations.** State the rule first. Brief rationale is permitted in parentheses — not a paragraph.
- **Explicit over implicit.** "NEVER use X" is better than "prefer Y."
- **Short over complete.** A short document that is actually read beats a comprehensive one that is skipped. If a section grows long, extract it into its own file and cross-reference.
- **Checkable constraints only.** If a constraint cannot be verified by the collaborator, it is not a constraint — it is a preference. Either make it checkable or remove it.

---

## Examples Across Project Types

These examples show the same structure applied to different domains. The format is the same; only the content changes.

### Technical project (software)
| Category | Canonical | Forbidden |
|---|---|---|
| Package manager | `pnpm` | `npm`, `yarn` |
| Runtime | Node.js ≥ 20.x | — |
| Type checking | TypeScript strict mode | — |

Verification: run `node -v` before any verification commands; `pnpm -v` to confirm package manager.

### Writing project (documentation, editorial)
| Category | Canonical | Forbidden |
|---|---|---|
| Document format | Google Docs | Word attachments (use Drive links instead) |
| Style guide | Chicago Manual of Style, 18th ed. | House style from prior client projects |
| File naming | `YYYY-MM-DD-title-vN.docx` | Spaces in filenames |

Verification: confirm access to the shared Drive folder before starting; confirm style guide edition before copyediting.

### Design project
| Category | Canonical | Forbidden |
|---|---|---|
| Design tool | Figma | Sketch, Adobe XD |
| Color source of truth | Figma design tokens file | CSS files or local swatches |
| Export format | SVG for icons, WebP for photos | PNG (unless client requires it) |

Verification: open the Figma project and confirm the design tokens file is visible and up to date before exporting assets.

### Research project
| Category | Canonical | Forbidden |
|---|---|---|
| Citation manager | Zotero | Manual bibliography |
| Citation format | APA 7th edition | — |
| Note format | Markdown in `/notes/` | Word documents, email |

Verification: confirm Zotero library is synced and the project collection exists before adding sources.

---

## Relationship to the File Path Index

Once your tooling document exists, it should be registered in the project's index file with a variable name. This is what allows every other document in the project to reference the tooling document by name (`$TOOLING_STANDARD`) rather than by path.

The benefit: if the tooling document is ever relocated, only the index needs updating. All references resolve correctly through the variable.

See your project's index file for the registration format.
