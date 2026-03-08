# Curator → Owner: Proposal

**Subject:** Rename `agent-docs-guide.md` to `a-docs-guide.md`
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-08

---

## Trigger

Owner briefing in `01-owner-to-curator-brief.md` (2026-03-08): rename the live artifact filename `agent-docs-guide.md` to `a-docs-guide.md` in both A-Society's own `a-docs/` and the public instruction library, while keeping `$A_SOCIETY_AGENT_DOCS_GUIDE` and `$INSTRUCTION_AGENT_DOCS_GUIDE` unchanged.

---

## What and Why

This is a maintenance rename, not a new framework feature.

The framework's live terminology has shifted from "agent-docs" to "a-docs", but two active filenames still use the older form:
- `$A_SOCIETY_AGENT_DOCS_GUIDE`
- `$INSTRUCTION_AGENT_DOCS_GUIDE`

That mismatch creates avoidable drift in three places:
- A-Society's own internal documentation still points Curators at an old-style filename
- Public guidance still tells adopters and the Initializer to create or expect `agent-docs-guide.md`
- The index abstraction is underused: the variables are designed to absorb path changes, but the live files and hardcoded filename references have not yet been aligned

The proposed change keeps scope narrow:
- Rename the two live files only
- Update live references that mention the filename directly
- Update index rows so the existing variables resolve to the new paths
- Leave variable names unchanged
- Leave historical artifacts unchanged
- Leave the document type itself unchanged; this is not a proposal to rename the concept or rewrite the artifact's content beyond filename references

---

## Open Question Resolution

### Does this warrant a framework update report?

**Recommendation: Yes. Draft a framework update report in Phase 4 with `Recommended` impact.**

Rationale:
- The change touches `$INSTRUCTION_AGENT_DOCS_GUIDE`, `$GENERAL_CURATOR_ROLE`, and `$A_SOCIETY_INITIALIZER`, so it changes public guidance and the Initializer's expected filename for a foundational artifact
- Per `$A_SOCIETY_UPDATES_PROTOCOL`, a report is warranted when an existing `general/` instruction or template changes in a way that affects guidance adopters received at initialization, or when the Initializer protocol changes what a correct `a-docs/` contains
- This does **not** rise to `Breaking`: projects that rely on index variables rather than hardcoded paths remain functionally correct without immediate migration
- `Recommended` is the right classification because adopters benefit from aligning their filename and any hardcoded references, but absence does not create a framework contradiction by itself

Proposed migration guidance for the later report:
- Review the project for hardcoded references to `agent-docs-guide.md`
- If present, rename the project artifact to `a-docs-guide.md`
- Update the project's index row for `$[PROJECT]_AGENT_DOCS_GUIDE`
- Update any role or workflow text that mentions the old filename directly

---

## Where Observed

A-Society — internal.

Observed in the active framework files listed in the briefing scope. A verification search also found the old filename in `updates/`, `feedback/`, and prior `records/`, but those are historical artifacts and remain untouched per the briefing and project invariants.

---

## Target Location

1. `$A_SOCIETY_AGENT_DOCS_GUIDE` — rename file to the same directory with filename `a-docs-guide.md`; update the internal file-heading line that names the artifact
2. `$INSTRUCTION_AGENT_DOCS_GUIDE` — rename file to the same directory with filename `a-docs-guide.md`; update the "Name it ..." line
3. `$A_SOCIETY_INDEX` — update the Current Path rows for `$A_SOCIETY_AGENT_DOCS_GUIDE` and `$INSTRUCTION_AGENT_DOCS_GUIDE`
4. `$A_SOCIETY_PUBLIC_INDEX` — update the Current Path row for `$INSTRUCTION_AGENT_DOCS_GUIDE`
5. `$A_SOCIETY_CURATOR_ROLE` — update the context confirmation string to use `a-docs-guide`
6. `$GENERAL_CURATOR_ROLE` — update the filename reference to `a-docs-guide.md`
7. `$A_SOCIETY_INITIALIZER` — update the three filename references to `a-docs-guide.md`
8. `$A_SOCIETY_WORKFLOW` — update the Phase 4 reference from "agent-docs-guide entry" to "a-docs-guide entry"

No changes proposed to any file under `a-society/updates/`, `a-society/feedback/`, or existing `a-society/a-docs/records/`.

---

## Draft Content

### 1. `$A_SOCIETY_AGENT_DOCS_GUIDE`

Rename the file so the indexed path resolves to `/a-society/a-docs/a-docs-guide.md`.

Inside the file, make the filename reference consistent with the rename:

```markdown
### `a-docs-guide.md` — `$A_SOCIETY_AGENT_DOCS_GUIDE`
```

No other content changes proposed in this file.

### 2. `$INSTRUCTION_AGENT_DOCS_GUIDE`

Rename the file so the indexed path resolves to `/a-society/general/instructions/a-docs-guide.md`.

Update the explicit filename instruction:

```markdown
Name it `a-docs-guide.md`.
```

No other content changes proposed in this file.

### 3. `$A_SOCIETY_INDEX`

Update two Current Path cells:

```markdown
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | `/a-society/a-docs/a-docs-guide.md` | Why each file in A-Society's agent-docs exists — required reading for the Curator |
| `$INSTRUCTION_AGENT_DOCS_GUIDE` | `/a-society/general/instructions/a-docs-guide.md` | How to create an agent-docs guide for any project |
```

Descriptions remain unchanged; this proposal changes paths, not variable names or artifact semantics.

### 4. `$A_SOCIETY_PUBLIC_INDEX`

Update one Current Path cell:

```markdown
| `$INSTRUCTION_AGENT_DOCS_GUIDE` | `/a-society/general/instructions/a-docs-guide.md` | How to create an agent-docs guide for any project |
```

### 5. `$A_SOCIETY_CURATOR_ROLE`

Update the mandatory confirmation string:

```markdown
**Context confirmation (mandatory):** Your first output in any session must state: *"Context loaded: agents.md, vision, structure, principles, index, a-docs-guide. Ready as Curator."* If you cannot confirm all six, do not proceed.
```

### 6. `$GENERAL_CURATOR_ROLE`

Update the required-reading filename reference:

```markdown
5. `a-docs-guide.md` (`$[PROJECT]_AGENT_DOCS_GUIDE`) — why each file in this project's agent-docs exists; read before maintaining any file
```

### 7. `$A_SOCIETY_INITIALIZER`

Update the three filename mentions so the role now instructs creation and validation of `a-docs-guide.md`:

```markdown
6. `a-docs-guide.md` — rationale for each major file/folder in this project's `a-docs/`
```

```markdown
- All foundational documents exist and are populated with real content: vision, structure, log, index, role(s), agents.md, a-docs-guide.md, workflow/main.md, communication/ (if two or more roles), improvement/main.md, improvement/protocol.md, and improvement/reports/template-findings.md
```

```markdown
**Context confirmation:** *"Context loaded: index, a-docs-guide, initializer role. Target project: [project name/path]. Beginning reconnaissance."*
```

### 8. `$A_SOCIETY_WORKFLOW`

Update the Phase 4 sentence:

```markdown
**Output:** Updated index row(s); updated a-docs-guide entry if applicable; framework update report published if triggered. The session is not complete until registration is done.
```

### 9. Framework update report to draft in Phase 4 if approved

Draft a report under `$A_SOCIETY_UPDATES_DIR` after implementation and registration, with:
- Impact classification: `Recommended`
- Summary: filename alignment from `agent-docs-guide.md` to `a-docs-guide.md`
- Affected public artifacts: `$INSTRUCTION_AGENT_DOCS_GUIDE`, `$GENERAL_CURATOR_ROLE`, `$A_SOCIETY_INITIALIZER`
- Migration guidance: review hardcoded filename references and rename the project artifact if alignment is desired

---

## Owner Confirmation Required

The Owner must respond in the next sequenced artifact with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until the Owner artifact shows **APPROVED**.
