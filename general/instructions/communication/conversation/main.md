# How to Create a Conversation Structure

## What Is the Conversation Layer?

The conversation layer is the set of artifacts that agents exchange when passing work between roles. Each artifact is a structured document with a defined format, a defined lifecycle, and a defined owner. Together they make inter-agent communication explicit, traceable, and repeatable.

"Conversation" here does not mean a chat transcript. It means a purpose-built handoff or report document: an artifact that carries work from one role to the next, records its status, and is preserved (or deliberately replaced) as the unit of work progresses.

---

## Why Templates Are Non-Negotiable

Without templates, each agent writes handoffs in whatever format seems natural. The receiving agent must parse intent from structure. Fields are missing, named differently, or present in different orders depending on who wrote the document. Verification becomes interpretation.

Templates convert handoffs into contracts. When both the sender and receiver know exactly what fields must be present and in what form, the receiver can act immediately — and can flag a malformed handoff rather than guessing around it.

---

## The Two Types of Conversation Artifacts

### 1. Live Working Artifacts

A live artifact carries the active handoff or report for the current unit of work (a task, a CR, a sprint, a round). It is:
- Created at a defined trigger point in the workflow
- Held in a stable location (the same file path every time)
- Replaced when the next unit of work begins — after a pre-replacement check confirms the prior unit is closed

**Example:** `ba-to-tech-lead.md` — holds the current BA→Tech Lead handoff. Replaced at the start of each new CR.

### 2. Permanent Templates

A template defines the required structure for a conversation type. It is never replaced — it is the authoritative format reference. Agents fill in a copy of the template; the template itself remains unchanged.

**Example:** `TEMPLATE-ba-to-tech-lead.md` — the canonical format for all BA→Tech Lead handoffs.

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

## Lifecycle of a Live Artifact

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

**Terminal statuses** are defined by the project's coordination layer. An artifact that has not reached a terminal status must not be replaced.

**Pre-replacement checks** are mandatory for any artifact that is replaced rather than archived. The check must confirm that the prior unit of work is closed before the artifact is overwritten.

---

## Naming Conventions

Consistent naming makes it possible to locate conversation artifacts without reading every file:

- **Live artifacts:** `[sender-role]-to-[receiver-role].md` (e.g., `tech-lead-to-backend.md`)
- **Templates:** `TEMPLATE-[sender-role]-to-[receiver-role].md`
- **Clarification artifacts (if separate):** `TEMPLATE-[role-a]-[role-b]-clarification.md`

Use role names as they appear in the project's role documents. Do not abbreviate differently from the role document names — inconsistent abbreviation creates lookup friction.

---

## How to Create the Conversation Layer

**Step 1 — List the handoffs.**
For every role-pair transition in the workflow, name the handoff. Assign a canonical file path. Identify the trigger.

**Step 2 — Write a template for each handoff type.**
For each handoff, write a template with every required field. Mark fields that are mandatory (must be present for the receiver to act) versus advisory (useful context, but work can proceed without them). Annotate field semantics — what "scope" means in this project, what constitutes a valid "verification mapping," etc.

**Step 3 — Place templates and live artifacts in the same folder.**
Both belong in `conversation/`. Separation by folder creates unnecessary navigation. Naming convention (the `TEMPLATE-` prefix) provides sufficient distinction.

**Step 4 — Write a pre-replacement check procedure.**
For every live artifact, define the check that must pass before the file is replaced. At minimum: confirm the prior unit of work is at a terminal status and that the prior artifact's key evidence exists.

**Step 5 — Write the folder index (`main.md`).**
List every live artifact and every template, with their trigger and their purpose. An agent that reads `main.md` should be able to find any artifact in the folder without scanning filenames.

---

## What Makes a Conversation Layer Fail

**Formats are implied, not specified.** Each handoff looks different. Receivers spend time parsing rather than acting.

**No pre-replacement check.** A live artifact is overwritten before the prior unit of work is closed. Traceability is lost. If something goes wrong, there is no record of what was handed off.

**Templates are modified per-task.** Once a template is treated as editable, it stops being a template. Each instance diverges. The format contract dissolves.

**Clarification rounds are undocumented.** Agents exchange decisions verbally or in session but do not record them in the artifact. The final handoff reflects resolved intent, but the reasoning is invisible. Future agents cannot reconstruct why scope was narrowed or a risk was accepted.
