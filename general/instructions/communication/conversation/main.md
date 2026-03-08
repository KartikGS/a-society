# How to Create a Conversation Structure

## What Is the Conversation Layer?

The conversation layer is the set of artifacts that agents exchange when passing work between roles. Each artifact is a structured document with a defined format, a defined lifecycle, and a defined owner. Together they make inter-agent communication explicit, traceable, and repeatable.

"Conversation" here does not mean a chat transcript. It means a purpose-built handoff or report document: an artifact that carries work from one role to the next, records its status, and is preserved as the unit of work progresses.

---

## Why Templates Are Non-Negotiable

Without templates, each agent writes handoffs in whatever format seems natural. The receiving agent must parse intent from structure. Fields are missing, named differently, or present in different orders depending on who wrote the document. Verification becomes interpretation.

Templates convert handoffs into contracts. When both the sender and receiver know exactly what fields must be present and in what form, the receiver can act immediately — and can flag a malformed handoff rather than guessing around it.

---

## The Two Types of Conversation Artifacts

### 1. Record Artifacts

A record artifact carries a handoff or report for one unit of work and lives in that unit's record folder (see `$INSTRUCTION_RECORDS`). It is:
- Created at a defined trigger point in the workflow
- Named with a sequenced prefix within the record folder (e.g., `02-proposal.md`)
- Never replaced — each unit of work produces a distinct set of artifacts in a distinct folder

**Example:** `02-curator-to-owner.md` in the active record folder — carries the Curator's proposal for this flow.

Projects that use a records structure create all conversation artifacts as record artifacts. Projects without a records structure may use the live artifact pattern: a stable file path replaced between units of work after a pre-replacement check confirms the prior unit is closed.

### 2. Permanent Templates

A template defines the required structure for a conversation type. It is never replaced — it is the authoritative format reference. Agents create a new artifact from the template into the active record folder; the template itself remains unchanged.

Template header notes should say: *"Create from this template into the active record folder as NN-[type].md."*

**Example:** `TEMPLATE-curator-to-owner.md` — the canonical format for all Curator → Owner handoffs.

---

## What Every Conversation Artifact Must Contain

Regardless of project type, every handoff artifact should include:

1. **Subject / identifier** — which unit of work this artifact belongs to
2. **Status** — the canonical status token from the project's status vocabulary (see `coordination/main.md`)
3. **Trigger** — what event caused this artifact to be produced
4. **Content** — the role-specific payload (objective, scope, criteria, evidence, etc.)
5. **Receiver confirmation requirement** — what the receiving role must do before acting (acknowledge, verify, query)

Projects add fields as their workflow requires. Projects do not remove the five above — they are the minimum for traceable, auditable handoffs.

---

## Lifecycle of a Record Artifact

```
Trigger fires
    ↓
Sender creates artifact in active record folder from template (as NN-[type].md)
    ↓
Receiver reads and acknowledges
    ↓
[Optional: clarification rounds — both agents update the same artifact]
    ↓
Artifact reaches terminal status
    ↓
No replacement — artifact is permanent in its record folder
```

**Terminal statuses** are defined by the project's coordination layer.

There is no pre-replacement check for record artifacts. Nothing is overwritten.

---

## Lifecycle of a Live Artifact (for projects without records)

```
Trigger fires
    ↓
Sender creates artifact from template
    ↓
Receiver reads and acknowledges
    ↓
[Optional: clarification rounds — both agents update the same file]
    ↓
Artifact reaches terminal status
    ↓
Pre-replacement check (prior unit closed, evidence present)
    ↓
Artifact replaced for next unit of work
```

**Pre-replacement checks** are mandatory for any artifact that is replaced rather than archived. The check must confirm that the prior unit of work is closed before the artifact is overwritten.

---

## Naming Conventions

Consistent naming makes it possible to locate conversation artifacts without reading every file:

- **Record artifacts:** `NN-[type].md` within the record folder (e.g., `02-proposal.md`, `03-decision.md`). The `NN-` prefix is zero-padded and two-digit. See `$INSTRUCTION_RECORDS` for the sequencing convention.
- **Templates:** `TEMPLATE-[sender-role]-to-[receiver-role].md`
- **Live artifacts (for projects without records):** `[sender-role]-to-[receiver-role].md` (e.g., `tech-lead-to-backend.md`)
- **Clarification artifacts (if separate):** `TEMPLATE-[role-a]-[role-b]-clarification.md`

Use role names as they appear in the project's role documents. Do not abbreviate differently from the role document names — inconsistent abbreviation creates lookup friction.

---

## How to Create the Conversation Layer

**Step 1 — List the handoffs.**
For every role-pair transition in the workflow, name the handoff. Identify the trigger.

**Step 2 — Write a template for each handoff type.**
For each handoff, write a template with every required field. Mark fields that are mandatory (must be present for the receiver to act) versus advisory (useful context, but work can proceed without them). Annotate field semantics — what "scope" means in this project, what constitutes a valid "verification mapping," etc.

**Step 3 — Place templates in the conversation folder.**
Templates belong in `conversation/`. If the project uses records, artifacts are created in record folders — only templates live in `conversation/`. Naming convention (the `TEMPLATE-` prefix) distinguishes templates from other files.

**Step 4 — Write the folder index (`main.md`).**
List every template, with its trigger and its purpose. An agent that reads `main.md` should be able to find any template in the folder without scanning filenames.

*For projects not using records:* also list every live artifact file in `main.md`, and define the pre-replacement check procedure for each.

---

## What Makes a Conversation Layer Fail

**Formats are implied, not specified.** Each handoff looks different. Receivers spend time parsing rather than acting.

**Artifacts created in the wrong location.** Artifacts created at stable overwriting paths when the project uses records (or vice versa). The model chosen should be consistent across all artifact types in the project.

**Templates are modified per-task.** Once a template is treated as editable, it stops being a template. Each instance diverges. The format contract dissolves.

**Clarification rounds are undocumented.** Agents exchange decisions verbally or in session but do not record them in the artifact. The final handoff reflects resolved intent, but the reasoning is invisible. Future agents cannot reconstruct why scope was narrowed or a risk was accepted.
