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

A record artifact carries a handoff or report for one unit of work and lives in that unit's record folder (see `$A_SOCIETY_RUNTIME_RECORDS_CONTRACT`). It is:
- Created at a defined trigger point in the workflow
- Named clearly for its sender, receiver, and purpose within the record folder
- Never replaced — each unit of work produces a distinct set of artifacts in a distinct folder

**Example:** `domain-lead-to-owner.md` in the active record folder — carries a domain lead's proposal for this flow.


### 2. Permanent Templates

A template defines the required structure for a conversation type. It is never replaced — it is the authoritative format reference. Agents create a new artifact from the template into the active record folder; the template itself remains unchanged.

Template header notes should say: *"Create from this template inside the active record folder as [descriptive-name].md."*

**Example:** `TEMPLATE-domain-lead-to-owner.md` — the canonical format for a project's domain-lead proposal handoffs.

---

## How to Create the Conversation Layer

**Step 1 — List the handoffs.**
For every role-pair transition in the workflow, name the handoff. Identify the trigger.

**Step 2 — Write a template for each handoff type.**
For each handoff, write a template with every required field. Mark fields that are mandatory (must be present for the receiver to act) versus advisory (useful context, but work can proceed without them). Annotate field semantics — what "scope" means in this project, what constitutes a valid "verification mapping," etc.

**Step 3 — Place templates in the conversation folder.**
Templates belong in `conversation/`. Artifacts are created in record folders — only templates live in `conversation/`. The `TEMPLATE-` prefix distinguishes templates from other files.

**Step 4 — Write the folder index (`main.md`).**
List every template, with its trigger and its purpose. Templates are surfaced to agents through the workflow — `main.md` serves as the canonical reference for what exists and when each template applies.

---

## Maintenance Rules

Copy these rules into the project's `conversation/main.md` at initialization. They govern how the conversation layer is updated over its lifetime.

- **Add a template when a new handoff type is introduced.** A handoff without a template is a contract that exists only in the sender's head. Create the template before the handoff type is used in a flow.
- **Never modify a template per-task.** Templates are format contracts, not working documents. Edits to a template affect every future use of that handoff type — treat changes deliberately.
- **Update a template when its format no longer matches what the receiver needs to act.** If receivers are consistently adding fields or working around missing ones, the template is wrong. Fix the template, not each artifact.
- **Remove templates for handoff types that no longer exist.** Stale templates create confusion about what handoffs are still active. Retire them when the corresponding role pair or workflow transition is removed.
- **Artifacts belong in the record folder, not in the conversation folder.** If an artifact has been created at a stable path in `conversation/`, it is in the wrong place. Only templates live in `conversation/`.
- **Clarification rounds must be documented in the artifact.** If decisions were exchanged in session but not recorded, the artifact is incomplete. Future agents cannot reconstruct reasoning from the final state alone.

**Every handoff artifact must contain:**
1. **Subject / identifier** — which unit of work this artifact belongs to
2. **Status** — the canonical status token from the project's status vocabulary
3. **Trigger** — what event caused this artifact to be produced
4. **Content** — the role-specific payload (objective, scope, criteria, evidence, etc.)
5. **Receiver confirmation requirement** — what the receiving role must do before acting

Projects add fields as their workflow requires. Do not remove these five — they are the minimum for traceable handoffs.

**Artifact lifecycle:**
```
Trigger fires → Sender creates artifact in record folder from template
→ Receiver reads and acknowledges
→ [Optional: clarification rounds — both agents update the same artifact]
→ Artifact reaches terminal status
→ No replacement — artifact is permanent in its record folder
```
Terminal statuses are defined by the project's coordination layer.

**Naming conventions:**
- **Record artifacts:** descriptive filenames within the record folder (e.g., `proposal.md`, `decision.md`). Make sender, receiver, and purpose clear.
- **Templates:** `TEMPLATE-[sender-role]-to-[receiver-role].md`
- **Clarification artifacts (if separate):** `TEMPLATE-[role-a]-[role-b]-clarification.md`
- Use role names exactly as they appear in role documents. Inconsistent abbreviation creates lookup friction.
