# A-Society: Folder Structure

This document explains why each folder in `a-society/` exists — the principle behind it, what belongs there, and what does not. It is not a directory listing. It is a placement guide for agents adding new content.

---

## The Two-Layer Structure

A-Society is organized around a single separation:

- **`project-information/`** — documents about this project (A-Society itself)
- **`general/`** — patterns, instructions, and standards that apply to any project

Everything in `project-information/` is specific to A-Society. Everything in `general/` is reusable across any project that adopts this framework. When you are unsure where something belongs, ask: "Is this true only of A-Society, or would it be true of a legal project, a writing project, and a software project equally?" If the latter — it belongs in `general/`.

---

## Folder Reference

### `project-information/`

**Purpose:** The identity layer of A-Society. Documents here describe what A-Society is, why it exists, and how it is organized.

**What belongs here:**
- The project vision (`vision.md`)
- This file — the folder structure explanation (`structure.md`)
- Any other document that describes A-Society as a project in its own right

**What does not belong here:**
- General instructions that apply to any project
- Content specific to a project using the framework (e.g., LLM Journey) — that belongs in its own project folder

**Principle:** Documents here are about A-Society, not produced by it.

---

### `general/`

**Purpose:** The framework layer. Everything here is project-agnostic — applicable to any project, in any domain, regardless of technical context.

**What belongs here:**
- Instruction documents (how to create specific project artifacts)
- Standards that any project can adopt verbatim
- Patterns extracted from real project experience that proved reusable

**What does not belong here:**
- Anything that assumes a specific technology, domain, or team structure
- Project-specific decisions from LLM Journey or any other project

**Principle:** If it would need to be rewritten for a different kind of project, it does not belong here. If it can be handed to any project owner and applied immediately, it does.

---

### `general/instructions/`

**Purpose:** The instruction library. Each file answers the question: "How do you create [X] for a new project?"

**What belongs here:**
- One instruction document per artifact type (tooling document, vision document, structure document, etc.)
- Instructions that are flat (not part of a sub-category) live directly in this folder

**What does not belong here:**
- The artifacts themselves (those belong in the project's own folder)
- Instructions that are specific to one project

**Principle:** Instructions describe *how to build* something. They do not contain the thing itself.

---

### `general/instructions/project-information/`

**Purpose:** Instructions specifically for creating `project-information/` artifacts — the documents that describe a project's identity, structure, and orientation.

**What belongs here:**
- `vision.md` — how to write a project vision
- `structure.md` — how to write a folder structure document
- Any future instruction for a `project-information/`-type artifact

**Why a sub-folder?**
Project-information documents form a coherent category: they are all read at orientation, they are all about the project rather than the work, and they are all stable by design. Grouping their instructions together mirrors that coherence and makes the instruction library navigable as it grows.

**Principle:** The sub-folder exists because the category is real — not because the files needed a home.

---

## How This Structure Grows

New instruction types are added to `general/instructions/` (or a sub-folder if they form a coherent category with existing instructions).

New A-Society project documents are added to `project-information/`.

Content from other projects never lives inside `a-society/`. Each project using this framework maintains its own folder at the same level as `a-society/` (e.g., `llm-journey/`, `[next-project]/`).

When a sub-folder becomes warranted inside `general/instructions/`, the signal is: three or more instruction files that share a coherent category and are more useful grouped than flat. Do not create sub-folders preemptively.

### Namespace Parity Exception

Default behavior is still flat placement in `general/instructions/`. However, a single-file sub-folder is allowed when it preserves namespace parity with project-level artifact structure.

Use this exception only when all conditions are true:
- The namespace represents a real, reusable artifact category (not a one-off naming preference).
- The sub-folder improves one-to-one mapping between instruction paths and project artifact paths across adopters.
- The folder starts with `main.md` and uses that as the canonical entry point.

This exception does not remove the three-file rule for ordinary categorization. It is a deliberate portability rule for structural symmetry, not a general invitation to pre-create folders.
