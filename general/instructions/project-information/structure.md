# How to Create a Structure Document

## What Is a Structure Document?

A structure document explains why each folder in a project exists — the principle behind it, what belongs there, and what does not.

It is not a README. A README describes what is currently in a folder. A structure document describes the rule that governs what should ever be in that folder. The difference matters for agents: when adding something new, a README tells them what already exists, but a structure document tells them where the new thing belongs.

A structure document is consulted whenever an agent or collaborator needs to place a new artifact and is not certain which folder is correct. It is the authoritative answer to "where does this go?"

---

## Why Every Project Needs One

Without a structure document, placement decisions are made by inference. An agent looks at what is already in each folder and guesses the pattern. This works until it does not — until a new artifact type arrives that does not obviously fit, or until two agents independently infer different patterns and place similar artifacts in different locations.

The consequences:
- Related artifacts end up scattered, making them hard to find
- Agents spend time on placement decisions that should already be resolved
- Folder structure drifts over time as each collaborator follows their own inferred logic
- Onboarding a new agent to an existing project requires explaining the structure verbally, every time

A structure document resolves all of these by making the placement rules explicit. It converts an inferred pattern into a declared one — and declared rules are easier to follow, easier to enforce, and easier to update when they need to change.

---

## What Belongs in a Structure Document

### 1. The governing principle (mandatory)
Before listing individual folders, state the organizing logic of the entire structure in one or two sentences. What is the primary axis of separation? (e.g., "project-specific vs. general," "by phase," "by role," "by artifact type.") An agent who understands the governing principle can often infer where a new artifact belongs without consulting the rest of the document.

### 2. A folder reference (mandatory)
For each folder, provide:
- **Purpose** — one sentence: what this folder is for
- **What belongs here** — a short list of the kinds of artifacts that go in this folder
- **What does not belong here** — at least one example of something that might seem to fit but does not, and where it actually goes
- **Principle** — a single sentence that captures the rule governing this folder, stated in a way that applies to cases not yet encountered

### 3. How the structure grows (mandatory)
What is the signal that a new folder is warranted? What is the signal that an existing folder should be split? What should never happen (e.g., "do not create sub-folders preemptively")? This section prevents structural drift as the project evolves.

---

## What Does NOT Belong

- **File listings** — which specific files currently exist belongs in an index or README, not here
- **Content descriptions** — what a specific file says belongs in that file's own header or in a reading guide
- **Process instructions** — how work gets done belongs in a workflow document
- **Historical rationale** — why a folder used to be organized differently is not relevant unless it explains a current exception

If a structure document starts describing specific files or past decisions, it has drifted. Trim back to principles.

---

## How to Write One

**Step 1 — State the governing principle.**
Before listing folders, answer: "What is the primary logic that separates content in this project?" One or two sentences. If you cannot state it clearly, the structure may not have a coherent organizing logic — and that is worth resolving before writing the document.

**Step 2 — List every top-level folder.**
For each one, write: purpose, what belongs, what does not, and the principle. Do not skip folders that seem obvious. Obvious-seeming folders are often where the most placement errors occur.

**Step 3 — Add sub-folders only if their principle differs from the parent.**
If a sub-folder follows the same rule as its parent, it does not need its own entry. Only document sub-folders that have a distinct placement rule.

**Step 4 — Write the growth section.**
State the rule for when new folders should be created and when they should not. This is the most forward-looking part of the document and the part most often omitted — do not skip it.

**Step 5 — Remove anything that describes current state rather than governing rule.**
Structure documents age well when they describe rules. They age poorly when they describe facts. Every sentence that says "currently contains X" will be wrong eventually. Replace it with "the kind of content that belongs here is X."

---

## Format Rules

- **Principle over inventory.** Every folder entry should end with a principle statement — a rule applicable to cases not yet encountered, not just a description of current contents.
- **"What does not belong" is mandatory.** The inclusion/exclusion boundary is where placement errors happen. Leaving it implicit is a documentation failure.
- **Short entries.** Each folder entry should be readable in under thirty seconds. If an entry requires more, the folder's purpose may be unclear.
- **Stable by design.** Folder structure should change rarely. A structure document that requires frequent updates signals that the structure itself is unstable — which is the real problem to address.

---

## Examples Across Project Types

### Software project
**Governing principle:** Separated by layer — infrastructure, business logic, and presentation never share a folder.

| Folder | Purpose | Belongs | Does not belong |
|---|---|---|---|
| `lib/` | Shared utilities with no UI dependency | Pure functions, data transformers, API clients | React components, route handlers |
| `app/` | Next.js route handlers and page components | Pages, layouts, route-level logic | Business logic that can be tested without a browser |
| `__tests__/` | All test files | Unit, integration, and E2E specs | Test fixtures that are also used at runtime |

Growth rule: add a new top-level folder only when a category of code has no dependency relationship with any existing folder. Otherwise, add a sub-folder within the closest existing category.

### Editorial / writing project
**Governing principle:** Separated by stage — drafts, reviewed content, and published content are never mixed.

| Folder | Purpose | Belongs | Does not belong |
|---|---|---|---|
| `drafts/` | Work in progress | All unreviewed writing | Anything that has been approved |
| `reviewed/` | Approved but unpublished | Content that has passed editorial review | Drafts, published versions |
| `published/` | Final, published versions | Immutable published copies | Anything subject to further revision |

Growth rule: do not create topic-based sub-folders until a single stage folder exceeds thirty files. Topic organization within a stage is a navigation aid, not a structural principle.

### Research project
**Governing principle:** Separated by certainty — raw data, analysis, and conclusions are never in the same folder.

| Folder | Purpose | Belongs | Does not belong |
|---|---|---|---|
| `data/raw/` | Unmodified source data | Original datasets, transcripts, observations | Cleaned or transformed versions |
| `data/processed/` | Transformed data | Cleaned datasets, normalized outputs | Raw source files |
| `analysis/` | Analytical work | Scripts, notebooks, intermediate findings | Raw data, final written conclusions |
| `findings/` | Conclusions | Reports, papers, summaries | Anything subject to further analysis |

Growth rule: add a new top-level folder only when a new stage of certainty is introduced. Sub-folders within a stage are acceptable for topic organization.

---

## What Makes a Structure Document Fail

**Describes current state instead of governing rules.** A document full of "this folder currently contains X" becomes wrong as soon as the first file moves. Write rules, not inventories.

**Missing the "what does not belong" section.** The boundary between folders is where confusion lives. Leaving it undocumented guarantees that agents will cross it.

**No growth rule.** A structure document without a growth rule gets ignored the first time a new artifact type does not fit neatly. The growth rule is what makes the document useful beyond the initial structure.

**Too granular.** Documenting every sub-folder and every file type produces a document no one reads. Document the levels at which placement decisions are actually made — usually the top one or two levels.
