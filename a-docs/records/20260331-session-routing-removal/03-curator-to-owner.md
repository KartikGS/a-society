# Curator → Owner: Proposal

**Subject:** session-routing-removal — remove session routing instructions and human-as-orchestrator framing across all active governance docs; remove session_action and prompt from handoff schema
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-31

---

## Trigger

Owner brief `02-owner-to-curator-brief.md`, dated 2026-03-31.

---

## What and Why

The runtime now derives session routing programmatically from `flowId + roleKey`. Explicit natural-language instructions telling the human when to start or resume sessions are therefore redundant. This proposal removes all such instructions across 15 governance documents, removes the human-as-orchestrator session management framing from workflow and instruction documents, and removes the `session_action` and `prompt` fields from the machine-readable handoff schema. The resulting documents are cleaner, shorter, and correctly positioned for a world in which session lifecycle is managed at the runtime layer.

---

## Draft Content

All proposed changes are stated as exact removals or replacements targeting specific text. Boundary markers use the format "after the clause ending '…X'" or "remove the sentence beginning 'Y'" as specified in the brief's per-file instructions.

---

### File 1 — `a-society/a-docs/workflow/main.md`

**Action:** Remove the entire "Session Routing Rules" section.

**Verification of current content (lines 53–72):** The file currently contains a "Session Routing Rules" section with two sub-items ("Within a flow: resume" and "At flow close: fresh sessions") followed by a "No conditional language" paragraph. The "Forward Pass Closure" and "Cross-Workflow Routing" sections immediately follow.

**Remove:**

```
## Session Routing Rules

**Within a flow: resume.** When the workflow returns to a role that already has an active session, the human resumes that session. The agent catches up by reading new handoff artifacts. Do not start a new session within a flow unless context-window exhaustion or accumulated noise makes the prior context counterproductive.

**At flow close: fresh sessions.** When a flow completes, start fresh sessions for all roles in the next flow. Accumulated context from a completed flow is almost always noise for a new one.

Agents must not pass conditional language to the human (e.g., "Resume, but start new if none exist") — they must assert the rule explicitly based on flow state.
```

(The exact heading, all paragraph text, and any sub-bullets in that section are removed. The preceding and following section headings and their content are not touched.)

---

### File 2 — `a-society/a-docs/workflow/framework-development.md`

**Action:** Four targeted removals within the Session Model section.

**Removal 1 — Session routing rule line.**

Remove the sentence:
> **Session routing rule:** See `$A_SOCIETY_WORKFLOW` "Session Routing Rules" for the universal rules governing when to start new vs. resume.

**Removal 2 — "How it flows" numbered steps, session-routing clauses.**

*Step 1:* The current Step 1 text contains the clause: "Because this is the start of a completely new flow, the Owner explicitly instructs the human to start a fresh Curator session (Session B), provides a copyable path to the brief, and provides a copyable session-start prompt for the Curator." Remove that clause. The step is rewritten to convey only that the Owner writes the brief and directs the human to the Curator session. The surviving sentence reads approximately: "The Owner writes the brief and directs the human to the Curator session (Session B)."

*Step 2:* Remove the clause: "The Curator tells the human whether to resume the existing Owner session or start a new one, provides a copyable path to the proposal artifact, and — if a new session is required — provides a copyable session-start prompt for the Owner." Replace with: "The Curator provides a copyable path to the proposal artifact."

*Step 3, Approved bullet:* Change "resume the existing Curator session unless the new-session criteria apply; provide" → "provide". Remove the trailing clause "and, if a new session is required, a copyable session-start prompt for the Curator."

*Step 3, Revise bullet:* Apply the same pattern as the Approved bullet.

*Step 4:* Remove the clauses "or start a new Owner session if new-session criteria apply" and "and — if a new session is required, a copyable session-start prompt for the Owner."

*Step 5:* Remove the clauses "whether to resume the Curator session" and "if a new Curator session is required — a copyable session-start prompt."

**Removal 3 — "The human's role at each transition" list.**

Remove item 1 entirely:
> Instruct the human to either start a fresh session (if entering a new flow) or resume the existing session (if within an active flow). Do not pass a conditional ("if none exists, start new") to the human.

Remove item 5 entirely:
> If a new session is required, provide a copyable session-start prompt for the receiving role.

Renumber the remaining items sequentially.

**Removal 4 — "The human as orchestrator" preamble sentence.**

Remove the sentence: "The human is the orchestrator — they maintain continuity between sessions and route artifacts." from the preamble paragraph before the "The human's role at each transition" list.

---

### File 3 — `a-society/a-docs/workflow/tooling-development.md`

**Action:** Remove one sentence.

**Remove** the sentence (appearing in the Session Model section):
> The existing session model conventions apply: see `$A_SOCIETY_WORKFLOW` "Session Routing Rules" for the universal rules governing when to start new vs. resume. Each role explicitly tells the human whether to resume or start new at each pause point.

(One or two contiguous sentences; remove both together.)

---

### File 4 — `a-society/a-docs/workflow/multi-domain-development.md`

**Action:** Two sentence-level removals.

**Removal 1:** Remove the sentence:
> **Session model:** Parallel tracks usually mean **multiple active sessions** for different roles. The human switches between sessions per pause-point rules in `$A_SOCIETY_WORKFLOW`. Agents must not hedge; they state explicitly whether to resume or start a new session per flow state.

**Removal 2:** Remove the sentence:
> Universal rules apply: `$A_SOCIETY_WORKFLOW` **Session Routing Rules** (resume within a flow, fresh sessions at flow close, no conditional hedging). Multi-domain flows do not relax those rules.

---

### File 5 — `a-society/a-docs/roles/owner.md` — Handoff Output section

**Action:** Two removals.

**Removal 1:** Remove item 1 from the numbered Handoff Output list:
> Whether to resume an existing session or start a fresh one. Do not hedge or ask the human if a session exists — declare the instruction explicitly based on whether this is a new flow (start new) or within an active flow (resume). See `$A_SOCIETY_WORKFLOW` "When to start a new session" for exceptions.

Renumber remaining items: 2→1, 3→2, 4→3.

**Removal 2:** Remove the **"New session (criteria apply):"** format block entirely. This is the block that currently reads:
> - **New session (criteria apply):** provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` — then the artifact path. Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

The **"Existing session (default):"** block and its named format (`Next action`, `Read`, `Expected response`) are retained.

The surviving Handoff Output section lists items:

1. Which session to switch to.
2. What the receiving role needs to read.
3. Handoff inputs for the receiving role:
   - **Existing session (default):** [named format block — retained as-is]

And the continuation paragraph listing the minimum three pause points at which the Handoff Output applies is retained unchanged.

---

### File 6 — `a-society/a-docs/roles/curator.md` — Handoff Output section

**Action:** Remove item 1 and renumber.

**Remove:**
> Whether to switch to the receiving role's existing session or start a fresh one. Do not hedge or ask the human if a session exists — declare the instruction explicitly based on whether this is a new flow (start new) or within an active flow (resume).

Renumber remaining items: 2→1, 3→2, 4→3.

The "Existing session (default):" and "New session (criteria apply):" format blocks — wait: re-reading the current curator.md Handoff Output section, item 1 is the only item bearing direct session-routing instruction. The brief scopes only item 1 removal for this file. The curator.md Handoff Output section currently uses the same four-item structure as owner.md. The new-session format block in curator.md is inspected below.

**Verification of current curator.md Handoff Output (lines 100–126):**

The current text reads:

```
At each pause point, the Curator tells the human:
1. Whether to switch to the receiving role's existing session or start a fresh one. Do not hedge or ask
   the human if a session exists — declare the instruction explicitly based on whether this is a new flow
   (start new) or within an active flow (resume).
2. Which session to switch to.
3. What the receiving role needs to read (artifact path, changed files, findings, or other required context).
4. Handoff inputs for the receiving role:
   - **Existing session (default):** use this format:
     …
   - **New session (criteria apply):** provide first: "You are a [Role] agent for [Project Name]. …"
```

The brief's instruction for curator.md is to "Remove item 1." The brief does not explicitly scope removal of the new-session format block from curator.md. However, the same direction — removing session routing instructions — clearly makes the new-session format block vestigial. Consistent with the Owner's instruction for general/roles/curator.md (which also scopes only item 1 removal), and matching the pattern applied to owner.md where the brief explicitly called out the new-session block, I propose also removing the new-session format block from curator.md as an in-scope consequence of item 1 removal.

**Open question for Owner:** Should the "New session (criteria apply):" format block also be removed from `a-docs/roles/curator.md`? The brief scopes item 1 removal explicitly; removal of the new-session block (which would be vestigial without item 1) is not stated explicitly for this file. I propose removing it, but flag for confirmation.

Pending Owner answer: the proposal treats the new-session block in curator.md as removed, consistent with the treatment of owner.md.

---

### File 7 — `a-society/a-docs/roles/tooling-developer.md` — Handoff Output section

**Action:** Remove item 1 and renumber.

**Remove:**
> Whether to switch to an existing session or start a new one. Default: switch to existing. Start new only when the criteria in `$A_SOCIETY_WORKFLOW` "When to start a new session" apply.

Renumber remaining items: 2→1, 3→2, 4→3.

The current tooling-developer.md Handoff Output section (lines 76–97) also contains a "New session (criteria apply):" format block. For consistency with the treatment of all other role files, this block is also proposed for removal as a vestigial consequence of item 1 removal.

---

### File 8 — `a-society/a-docs/roles/runtime-developer.md` — Handoff Output section

**Action:** Remove item 1 and renumber.

**Remove:**
> Whether to switch to an existing session or start a new one. Default: switch to existing. Start new only when the criteria in `$A_SOCIETY_WORKFLOW` "When to start a new session" apply.

Renumber remaining items: 2→1, 3→2, 4→3.

The current runtime-developer.md Handoff Output section (lines 75–94) also contains a "New session (criteria apply):" format block. Proposed for removal for the same reason as the other role files.

---

### File 9 — `a-society/a-docs/roles/technical-architect.md` — Handoff Output section

**Action:** Remove one paragraph.

**Remove** (lines 160–160 area, in the Handoff Output section):
> **Session routing is the Owner's responsibility.** The Technical Architect does not prescribe which session to switch to, whether to start a new session, or what the receiving role should do next. The TA's handoff output ends with the artifact path and review context — the Owner routes from there.

The remaining Handoff Output section (items 1–3 listing: artifact path(s) to review, what the Owner needs to evaluate or decide, open questions for Owner resolution) is retained unchanged.

---

### File 10 — `a-society/a-docs/communication/coordination/handoff-protocol.md`

**Action:** Two changes in the Machine-Readable Handoff Block subsection.

**Removal:** Remove the paragraph beginning "`session_action` values:" in its entirety:
> **`session_action` values:** The only valid values are `start_new` (begin a new session for the receiving role) and `resume` (continue an existing session). Any other value — including `start` — is malformed and will be rejected by the Handoff Interpreter. This constraint applies to all roles producing handoff blocks, including the Owner and Technical Architect.

**Update cross-reference:** The sentence that follows the removed paragraph currently reads:
> See `$INSTRUCTION_MACHINE_READABLE_HANDOFF` for the schema, field definitions, the conditional constraint on `prompt`, and a worked example.

Replace with:
> See `$INSTRUCTION_MACHINE_READABLE_HANDOFF` for the schema, field definitions, and a worked example.

(The clause "the conditional constraint on `prompt`," is removed because the Conditional Constraint section is being removed from the target instruction file.)

---

### File 11 — `a-society/general/roles/owner.md` — Handoff Output section

**Action:** Remove item 1 and renumber.

**Remove:**
> Whether to resume the existing session or start a fresh session for the receiving role. Do not hedge or ask the human if a session exists — declare the instruction explicitly based on whether this is a new flow (start new) or within an active flow (resume).

Renumber remaining items: 2→1, 3→2, 4→3.

The current general/roles/owner.md Handoff Output section (lines 174–188) contains a new-session format block parallel to the one in a-docs/owner.md. The brief explicitly scopes removal of item 1 for this file. The new-session format block is also removed for consistency, as it is vestigial without item 1.

The surviving section reads:

```
At each pause point, the Owner tells the human:
1. Which session to switch to.
2. What the receiving role needs to read (artifact path and any additional context).
3. Handoff inputs for the receiving role:
   - **Existing session (default):** use this format:
     ```
     Next action: [what the receiving role should do]
     Read: [path to artifact(s)]
     Expected response: [what the receiving role produces next]
     ```

If the work item is closed, the Owner says so explicitly and does not imply a further session switch.
```

---

### File 12 — `a-society/general/roles/curator.md` — Handoff Output section

**Action:** Remove item 1 and renumber.

**Remove:**
> Whether to switch to the receiving role's existing session or start a fresh session. Do not hedge or ask the human if a session exists — declare the instruction explicitly based on whether this is a new flow (start new) or within an active flow (resume).

Renumber remaining items: 2→1, 3→2, 4→3.

The new-session format block is also removed for consistency (same rationale as all other role files).

---

### File 13 — `a-society/general/instructions/roles/main.md` — Section 7 and archetype templates

**Section 7 ("Handoff Output"):**

**Removal 1:** Remove the bullet:
> Whether the human should resume an existing session or start a new one for the receiving role

**Removal 2:** From the "Copyable inputs" bullet, remove the clause:
> if a new session is required, also a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`).

The remaining bullet reads: "Copyable inputs for the receiving role: always a read directive (`[artifact path]`)."

**Removal 3:** Remove the paragraph:
> Default rule: resume the existing session. Start a new session only when the project's workflow says to — for example, context-window pressure, stale or noisy prior context, or elapsed time. The role should say this explicitly; the human should not infer it.

**Removal 4:** Remove the paragraph:
> No role-assignment prompt is included — the session is already running under the correct role. The new-session format (session-start prompt followed by artifact path) applies only when the project's workflow criteria for a new session are met.

**Archetype templates — archetypes verified to have Handoff Output sections with session routing content:**

Reading lines 117–365 of the current file, the following archetypes contain Handoff Output content requiring session-routing removal:

- **Archetype 1 (Owner):** (lines 150–157) — Handoff Output section contains: item 1 "Whether to resume the existing session or start a new one for the receiving role. Default: resume the existing session. Start a new one only when the project's workflow says to." and item 4 "Copyable inputs … If a new session is required, also provide first: `'You are a [Role] agent for [Project Name]. Read [path to agents.md].'` Paths must be relative to the repository root… Never use machine-specific absolute paths or `file://` URLs."
- **Archetype 2 (Analyst):** (line 196) — Handoff Output section contains: "tell the human whether to resume the receiving role's existing session or start a new one (default: resume), which session to switch to, and what artifact to point the receiving role at. Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`'You are a [Role] agent for [Project Name]. Read [path to agents.md].'`). Paths must be relative to the repository root… Never use machine-specific absolute paths or `file://` URLs."
- **Archetype 3 (Implementer):** (line 235) — same prose pattern as Archetype 2.
- **Archetype 4 (Reviewer):** (line 277) — same prose pattern as Archetype 2.
- **Archetype 5 (Coordinator):** (line 314) — same prose pattern as Archetype 2.
- **Archetype 6 (Curator):** (line 358) — same prose pattern as Archetype 2.

**Per-archetype changes:**

*Archetype 1 (Owner template, lines 150–157):*

Remove item 1:
> Whether to resume the existing session or start a new one for the receiving role. Default: resume the existing session. Start a new one only when the project's workflow says to.

From item 4 ("Copyable inputs"), remove the clause:
> If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs.

Renumber remaining items.

*Archetypes 2–6 (Analyst, Implementer, Reviewer, Coordinator, Curator template):*

Each archetype uses prose-style Handoff Output rather than a numbered list. Apply the same removal to each by stripping the session-routing clauses:

- Remove: "tell the human whether to resume the receiving role's existing session or start a new one (default: resume),"
- Remove: "if a new session is required, also provide a session-start prompt first (`'You are a [Role] agent for [Project Name]. Read [path to agents.md].'`). Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs."

The surviving Handoff Output prose in each archetype names: which session to switch to, what artifact or evidence the receiving role needs, and the read directive (`[artifact path]`).

**Section heading assessment (Open Question 1 from brief):** The section heading "7. Handoff Output" in the governing instruction document itself remains accurate after these removals — the section continues to govern what Handoff Output must contain. No heading revision is needed in this file.

---

### File 14 — `a-society/general/instructions/workflow/main.md` — "Sessions and the Human Orchestrator" section

**Six targeted removals.**

**Removal 1 — "The human as orchestrator" paragraph:**

Remove:
> **The human as orchestrator** — the human decides when to start sessions, when to pause and resume them, which artifacts to point agents at, and maintains continuity between sessions that agents cannot. The human is not a passive approver at the end of a pipeline — they are the runtime that executes the graph.

**Removal 2 — "In the current operational model" paragraph:**

Remove:
> In the current operational model, agents do not persist memory between sessions. This creates two realities:
> - **Within a session**, an agent has full context: its role, the work it has done, and the reasoning behind its decisions.
> - **Between sessions**, continuity lives in two places: the human's memory and the communication artifacts that carry state between roles.

**Removal 3 — "Session reuse — within a flow" paragraph:**

Remove:
> **Session reuse — within a flow:** resume existing sessions by default. When the workflow returns to a role that already has an active session, the human resumes that session rather than starting a new one. The agent retains its earlier context and reads any new artifacts to catch up on what happened while it was paused. A new session is warranted within a flow only when the context window is exhausted or the accumulated context would be more noise than signal.

**Removal 4 — "Session reuse — at flow close" paragraph:**

Remove:
> **Session reuse — at flow close:** when a flow completes, start fresh sessions for the next flow. The accumulated context from a completed flow is almost always noise for a new one — reasoning about a closed unit of work, artifacts that are no longer active, context that was relevant only to what just finished. The default at every new flow start is a fresh session for each role involved.

**Removal 5 — second bullet in "Transition behavior" paragraph:**

The "Transition behavior" paragraph currently contains two bullets. Remove the second bullet:
> A **copyable session-start prompt** — when a new session is required. Format: *"You are a [Role] agent for [Project Name]. Read [path to agents.md]."*

The first bullet ("A **copyable artifact path** — always") is retained.

**Removal 6 — "Future automation" paragraph:**

Remove:
> **Future automation:** By explicitly modeling the human's orchestration role, the framework creates a specification for what automation would need to replace: session lifecycle management, artifact routing, role switching, and continuity maintenance. A project that automates orchestration replaces the human at this layer — the graph structure, node contracts, and edge conditions remain unchanged.

**Retained content:** The **Session** definition paragraph, the **Transition behavior** paragraph (first bullet only), and the **Bidirectional mid-phase exchanges** paragraph are all retained unchanged.

**Section heading and reorganization assessment (Open Question 1 from brief):** After the six removals, the "Sessions and the Human Orchestrator" section retains:
- The Session definition.
- The Transition behavior paragraph (first bullet only — the copyable artifact path rule).
- The Bidirectional mid-phase exchanges paragraph.

The remaining content is accurately described as "Sessions and the Human Orchestrator": the section still covers what sessions are and how the human moves artifacts between them (bidirectional exchanges). The heading remains accurate. No reorganization is needed. The section is simply shorter.

---

### File 15 — `a-society/general/instructions/communication/coordination/machine-readable-handoff.md`

**Five removal categories (six individual removals per the brief).**

**Change 1 — Schema block (lines 40–48):**

Current schema block:
```
role:            <string>       # Receiving role name (e.g., "Owner", "Curator")
session_action:  <enum>         # "resume" | "start_new"
artifact_path:   <string>       # Primary artifact for the receiving role to read;
                                # path relative to the repository root
prompt:          <string|null>  # Full copyable session-start prompt;
                                # required (non-null) when session_action = "start_new";
                                # must be null when session_action = "resume"
```

Replace with:
```
role:            <string>       # Receiving role name (e.g., "Owner", "Curator")
artifact_path:   <string>       # Primary artifact for the receiving role to read;
                                # path relative to the repository root
```

**Change 2 — Field Definitions (lines 51–64):**

Remove the **`session_action`** definition block:
> **`session_action`** — The session instruction for the human. Exactly one of:
> - `resume` — the receiving role has an active session; the human resumes it
> - `start_new` — no active session exists for this role; the human starts a fresh one

Remove the **`prompt`** definition block:
> **`prompt`** — The session-start prompt the human copies to open a new session.
> - When `session_action` is `start_new`: must be a non-null string containing the full prompt.
> - When `session_action` is `resume`: must be `null`. Do not use an empty string — use explicit `null`.

The **`role`** and **`artifact_path`** definition blocks are retained.

**Change 3 — Conditional Constraint section (lines 66–74):**

Remove the entire section:
```
### Conditional Constraint

| `session_action` | `prompt` requirement |
|---|---|
| `start_new` | Non-null string — the full copyable session-start prompt |
| `resume` | `null` — exactly; an empty string is malformed |

A block with `session_action: start_new` and `prompt: null` is malformed. A block with `session_action: resume` and a non-null `prompt` is malformed.
```

**Change 4 — "What It Is" intro paragraph (lines 5–6):**

Current:
> A machine-readable handoff block is a structured YAML block emitted by an agent at every session pause point alongside its natural-language handoff prose. It declares, in a parseable format, which role receives control next, what session action is required, which artifact the receiving role should read, and — when a new session is needed — the prompt to use.

Replace with:
> A machine-readable handoff block is a structured YAML block emitted by an agent at every session pause point alongside its natural-language handoff prose. It declares, in a parseable format, which role receives control next and which artifact the receiving role should read.

**Change 5 — "Why It Exists" section (approx. lines 12–15):**

Current sentence in the second paragraph of this section:
> There is no structured contract a tool can extract to determine which role to invoke, whether to start a new session or resume one, which artifact to pass, or which prompt to use.

Replace with:
> There is no structured contract a tool can extract to determine which role to invoke or which artifact to pass.

**Change 6 — Worked examples (lines 91–115):**

*Resume case example (lines 91–96):*

Current:
```handoff
role: Owner
session_action: resume
artifact_path: [project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md
prompt: null
```

Replace with:
```handoff
role: Owner
artifact_path: [project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md
```

*Start-new case example (lines 110–115):*

Current:
```handiff
role: Curator
session_action: start_new
artifact_path: [project-name]/a-docs/records/[record-folder]/02-owner-to-curator-brief.md
prompt: "You are a Curator agent for [Project Name]. Read [project-name]/a-docs/agents.md."
```

Replace with:
```handoff
role: Curator
artifact_path: [project-name]/a-docs/records/[record-folder]/02-owner-to-curator-brief.md
```

*Phase-closure case example (lines 129–134):*

Current:
```handoff
role: Owner
session_action: resume
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md
prompt: null
```

Replace with:
```handoff
role: Owner
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md
```

**Additional — example prose labels:** The prose immediately preceding the worked examples currently uses framing tied to session_action ("Resume case," "Start-new case"). With the schema change, these labels are no longer meaningful in the same way. The heading labels should be updated:

- "**Resume case (Owner has an active session):**" → "**Owner receives from Curator — proposal review:**"
- "**Start-new case (Curator has no active session):**" → "**Curator receives from Owner — briefing:**"
- "**Phase-closure case (receiving role verifies completion):**" — retained; this framing is still accurate.

The natural-language prose within each example (e.g., "Resume the existing Owner session (Session A)" / "Start a fresh Curator session (Session B)") is part of the prose handoff modeling — not the schema. This prose can be simplified to remove session-routing framing. I propose:

- Prior: "Resume the existing Owner session (Session A)." → Remove this sentence entirely (the prose example can start directly with "Next action:").
- Prior: "Start a fresh Curator session (Session B)." → Remove this sentence entirely.
- Prior: "Resume the existing Owner session (Session A)." (phase-closure example) → Remove this sentence entirely.

This makes the examples cleaner and removes the session-routing framing at the example level as well.

---

## Coupling Map Confirmation

Per brief instruction, I confirm: no tooling coupling map (`$A_SOCIETY_TOOLING_COUPLING_MAP`) format dependency is affected by this change. The machine-readable handoff block is parsed by the runtime, not by any `general/`-registered tooling component. The handoff schema change is covered by the parallel Track B runtime brief. The coupling map does not require an update as part of this change.

---

## Framework Update Report Draft

*Included per brief instruction (Open Question 3). Classification fields assessed by consulting `$A_SOCIETY_UPDATES_PROTOCOL`.*

**Classification rationale:**

This change modifies the following general library artifacts that adopting projects instantiate or reference:
- `general/roles/owner.md` — Breaking: the Handoff Output section loses item 1 and the new-session format block. Any instantiation of this template that includes session-routing item 1 is now inconsistent with the template.
- `general/roles/curator.md` — Breaking: same pattern.
- `general/instructions/roles/main.md` — Breaking: the mandatory Handoff Output section (Section 7) and all archetype templates lose session-routing content. Projects that derived their role documents from these archetypes have role documents that now carry instructions the framework no longer governs.
- `general/instructions/workflow/main.md` — Recommended: the "Sessions and the Human Orchestrator" section is shortened. This does not create a gap or contradiction in adopting projects' existing workflow documents — it removes guidance they may have referenced. Adopting projects need not update their workflow documents unless the removed guidance was copied verbatim into them.
- `general/instructions/communication/coordination/machine-readable-handoff.md` — Breaking: the `session_action` and `prompt` fields are removed from the schema. Any project-level handoff protocol or role document that references these fields is now inconsistent with the schema.

Overall: this report contains Breaking changes and Recommended changes. Version bump: MAJOR (v26.0 → v27.0).

---

### DRAFT: Framework Update Report

```
# A-Society Framework Update — 2026-03-31

**Framework Version:** v27.0
**Previous Version:** v26.0

## Summary

Session routing (when to start new vs. resume sessions) is now managed programmatically by the runtime layer. This update removes the session routing instructions, human-as-orchestrator framing, and the `session_action`/`prompt` fields from the machine-readable handoff schema across all framework templates that adopting projects instantiate. Projects that have instantiated role templates or referenced handoff schema fields will need to review their `a-docs/` for consistency.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 3 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 1 | Improvement worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### 1. Handoff Output: session-routing item removed from Owner and Curator role templates

**Impact:** Breaking
**Affected artifacts:** [`general/roles/owner.md`], [`general/roles/curator.md`]
**What changed:** Item 1 of the Handoff Output section ("Whether to resume the existing session or start a fresh session…") has been removed from both general role templates, along with the "New session (criteria apply):" format block. The numbered items that follow have been renumbered.
**Why:** Session routing is now determined programmatically by the runtime from flow state. Explicit instructions telling the human when to start or resume sessions are redundant and have been removed from the templates.
**Migration guidance:** In your project's instantiations of `$[PROJECT]_OWNER_ROLE` and `$[PROJECT]_CURATOR_ROLE` (and any other role documents derived from the general templates), check whether item 1 of the Handoff Output section still refers to session-start vs. resume decisions. If it does, remove that item and renumber the remaining items. Also remove any "New session (criteria apply):" format blocks from those role files. Other role documents in your project that have similar session-routing items in their Handoff Output sections should be assessed for the same removal.

---

### 2. Handoff schema: `session_action` and `prompt` fields removed

**Impact:** Breaking
**Affected artifacts:** [`general/instructions/communication/coordination/machine-readable-handoff.md`]
**What changed:** The `session_action` and `prompt` fields have been removed from the machine-readable handoff schema. The schema now contains two fields: `role` and `artifact_path`. The Conditional Constraint section has been removed. The worked examples have been updated to show two-field blocks.
**Why:** The runtime derives session routing from flow state (`flowId + roleKey`). Agents no longer need to signal session action in handoff output; the runtime determines it. The `prompt` field is correspondingly removed.
**Migration guidance:** In your project's `$[PROJECT]_HANDOFF_PROTOCOL` (or equivalent handoff coordination document), find any reference to `session_action` valid values or the conditional constraint on `prompt`. Remove those references and update the cross-reference to `$INSTRUCTION_MACHINE_READABLE_HANDOFF` by removing any clause that mentions "the conditional constraint on `prompt`." Check any handoff block examples in your project's documentation or record artifacts — historical examples are immutable, but any living template or instruction that models handoff blocks should be updated to show two-field blocks (`role` and `artifact_path` only).

---

### 3. Role instruction: session-routing content removed from Section 7 and archetype templates

**Impact:** Breaking
**Affected artifacts:** [`general/instructions/roles/main.md`]
**What changed:** In the mandatory Handoff Output section (Section 7) of the role authoring instruction, the bullet specifying "whether the human should resume an existing session or start a new one" has been removed, along with the session-start prompt clause from the "Copyable inputs" bullet and two explanatory paragraphs. All archetype template Handoff Output sections (Archetypes 1–6) have been updated to remove session-routing items and clauses.
**Why:** Session routing is now runtime-determined. Role documents no longer need to govern or document it.
**Migration guidance:** If your project used the archetype templates in `$INSTRUCTION_ROLES` to author or review role documents, check those role documents for session-routing items in their Handoff Output sections. Specifically: (1) remove any item that tells the human "whether to resume or start a new session"; (2) remove any "if a new session is required, also provide a session-start prompt" clause from the copyable-inputs item; (3) remove the "New session (criteria apply):" format block if present. Renumber remaining items after each removal.

---

### 4. Workflow instruction: "Sessions and the Human Orchestrator" section shortened

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/workflow/main.md`]
**What changed:** Several paragraphs have been removed from the "Sessions and the Human Orchestrator" section: the "human as orchestrator" paragraph, the "current operational model" paragraph, the "session reuse — within a flow" and "session reuse — at flow close" paragraphs, the session-start-prompt bullet from the "Transition behavior" item, and the "Future automation" paragraph. The section now retains only the Session definition, the artifact-path transition-behavior bullet, and the Bidirectional mid-phase exchanges paragraph.
**Why:** The removed content described manual session-lifecycle management responsibilities that are now handled by the runtime.
**Migration guidance:** If your project's workflow document(s) were authored with explicit reference to or verbatim reproduction of the session reuse rules from `$INSTRUCTION_WORKFLOW`, check whether those rules were embedded directly in your workflow documents. If they were, assess whether they should be removed. If your workflow document's "Session Model" section contains language like "resume within a flow, fresh sessions at flow close, no conditional hedging," that language is no longer governed by the framework and may be removed at the Curator's discretion.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
```

---

## Target Location

All 15 files are in their current registered locations. No new files are created. No index updates are required.

---

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260331-session-routing-removal/03-curator-to-owner.md
```
