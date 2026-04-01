# Owner → Curator: Briefing

**Subject:** session-routing-removal — remove session routing instructions and human-as-orchestrator framing across all active governance docs; remove session_action and prompt from handoff schema
**Status:** BRIEFED
**Date:** 2026-03-31

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `a-society/a-docs/workflow/main.md` | modify — remove "Session Routing Rules" section |
| `a-society/a-docs/workflow/framework-development.md` | modify — remove session routing instructions throughout Session Model |
| `a-society/a-docs/workflow/tooling-development.md` | modify — remove session routing cross-reference |
| `a-society/a-docs/workflow/multi-domain-development.md` | modify — remove session routing paragraphs |
| `a-society/a-docs/roles/owner.md` | modify — remove Handoff Output item 1; remove new-session format block |
| `a-society/a-docs/roles/curator.md` | modify — remove Handoff Output item 1 |
| `a-society/a-docs/roles/tooling-developer.md` | modify — remove Handoff Output item 1 |
| `a-society/a-docs/roles/runtime-developer.md` | modify — remove Handoff Output item 1 |
| `a-society/a-docs/roles/technical-architect.md` | modify — remove session routing delegation paragraph |
| `a-society/a-docs/communication/coordination/handoff-protocol.md` | modify — remove `session_action` valid values note; update cross-reference |
| `a-society/general/roles/owner.md` | modify — remove Handoff Output item 1 |
| `a-society/general/roles/curator.md` | modify — remove Handoff Output item 1 |
| `a-society/general/instructions/roles/main.md` | modify — remove session routing content from section 7 and all archetype templates |
| `a-society/general/instructions/workflow/main.md` | modify — remove human-as-orchestrator and session reuse content |
| `a-society/general/instructions/communication/coordination/machine-readable-handoff.md` | modify — remove session_action and prompt fields from schema |

All items `[Requires Owner approval]`.

**Direction:** The runtime determines session routing programmatically — `flowId + roleKey` session identity means within-flow = resume, new-flow = fresh session, automatically. Explicit instructions telling the human when to start or resume sessions are therefore redundant and should be removed. The human-as-orchestrator framing (where the human is described as "the runtime that executes the graph") is also removed; humans can understand session continuity without being told the rule. The `session_action` and `prompt` fields in the handoff block schema are removed because the runtime derives session routing from flow state, not from agent output.

---

## Per-File Implementation Instructions

**[Requires Owner approval]**

### `a-docs/workflow/main.md`
Remove the entire "Session Routing Rules" section: heading through the end of the section, which closes after the paragraph beginning "Agents must not pass conditional language to the human." The "Forward Pass Closure" and "Cross-Workflow Routing" sections that follow are unaffected. Also remove the "When to start a new session" phrase in all cross-references from other workflow files that point to this section.

### `a-docs/workflow/framework-development.md`
Four targeted removals:

1. **Session routing rule line** — in the Session Model subsection, remove the sentence beginning "**Session routing rule:** See `$A_SOCIETY_WORKFLOW` "Session Routing Rules" for the universal rules governing when to start new vs. resume."

2. **"How it flows" steps** — remove session routing language from each numbered step:
   - Step 1: remove the clause beginning "Because this is the start of a completely new flow, the Owner explicitly instructs the human to start a fresh Curator session (Session B), provides a copyable path to the brief, and provides a copyable session-start prompt for the Curator." The sentence containing this clause should be shortened to simply convey that the Owner writes the brief and directs the human to the Curator session.
   - Step 2: remove "The Curator tells the human whether to resume the existing Owner session or start a new one, provides a copyable path to the proposal artifact, and — if a new session is required — provides a copyable session-start prompt for the Owner." Replace with: "The Curator provides a copyable path to the proposal artifact."
   - Step 3 Approved bullet: remove "resume the existing Curator session unless the new-session criteria apply; provide" → replace with "provide". Remove the trailing clause "and, if a new session is required, a copyable session-start prompt for the Curator."
   - Step 3 Revise bullet: same pattern as Approved.
   - Step 4: remove "or start a new Owner session if new-session criteria apply" and the clause "and — if a new session is required, a copyable session-start prompt for the Owner."
   - Step 5: remove "whether to resume the Curator session" and "if a new Curator session is required — a copyable session-start prompt."

3. **"The human's role at each transition" list** — remove item 1 entirely ("Instruct the human to either start a fresh session (if entering a new flow) or resume the existing session (if within an active flow). Do not pass a conditional ("if none exists, start new") to the human.") and item 5 entirely ("If a new session is required, provide a copyable session-start prompt for the receiving role"). Renumber remaining items.

4. **"The human as orchestrator" line** in the session model preamble — remove the sentence "The human is the orchestrator — they maintain continuity between sessions and route artifacts." (the preamble sentence before the numbered list in "The human's role at each transition").

### `a-docs/workflow/tooling-development.md`
Remove the sentence beginning "The existing session model conventions apply: see `$A_SOCIETY_WORKFLOW` "Session Routing Rules" for the universal rules governing when to start new vs. resume. Each role explicitly tells the human whether to resume or start new at each pause point."

### `a-docs/workflow/multi-domain-development.md`
Two removals:
1. Remove the sentence beginning "**Session model:** Parallel tracks usually mean **multiple active sessions** for different roles. The human switches between sessions per pause-point rules in `$A_SOCIETY_WORKFLOW`. Agents must not hedge; they state explicitly whether to resume or start a new session per flow state."
2. Remove the sentence beginning "Universal rules apply: `$A_SOCIETY_WORKFLOW` **Session Routing Rules** (resume within a flow, fresh sessions at flow close, no conditional hedging). Multi-domain flows do not relax those rules."

### `a-docs/roles/owner.md` — Handoff Output section
Two removals:
1. Remove item 1: "Whether to resume an existing session or start a fresh one. Do not hedge or ask the human if a session exists — declare the instruction explicitly based on whether this is a new flow (start new) or within an active flow (resume). See `$A_SOCIETY_WORKFLOW` "When to start a new session" for exceptions." Renumber remaining items (2→1, 3→2, 4→3).
2. Remove the "**New session (criteria apply):**" format block entirely, keeping only the "**Existing session (default):**" block.

### `a-docs/roles/curator.md` — Handoff Output section
Remove item 1: "Whether to switch to the receiving role's existing session or start a fresh one. Do not hedge or ask the human if a session exists — declare the instruction explicitly based on whether this is a new flow (start new) or within an active flow (resume). See `$A_SOCIETY_WORKFLOW` "When to start a new session" for exceptions." Renumber remaining items.

### `a-docs/roles/tooling-developer.md` — Handoff Output section
Remove item 1: "Whether to switch to an existing session or start a new one. Default: switch to existing. Start new only when the criteria in `$A_SOCIETY_WORKFLOW` "When to start a new session" apply." Renumber remaining items.

### `a-docs/roles/runtime-developer.md` — Handoff Output section
Remove item 1: "Whether to switch to an existing session or start a new one. Default: switch to existing. Start new only when the criteria in `$A_SOCIETY_WORKFLOW` "When to start a new session" apply." Renumber remaining items.

### `a-docs/roles/technical-architect.md`
Remove the paragraph beginning "**Session routing is the Owner's responsibility.** The Technical Architect does not prescribe which session to switch to, whether to start a new session, or what the receiving role should do next. The TA's handoff output ends with the artifact path and review context — the Owner routes from there."

### `a-docs/communication/coordination/handoff-protocol.md`
Remove the paragraph beginning "**`session_action` values:** The only valid values are `start_new` (begin a new session for the receiving role) and `resume` (continue an existing session)..." through the end of that paragraph. Update the cross-reference sentence that follows ("See `$INSTRUCTION_MACHINE_READABLE_HANDOFF` for the schema, field definitions, the conditional constraint on `prompt`, and a worked example.") to remove the clause "the conditional constraint on `prompt`," since that section will be removed from the target.

### `general/roles/owner.md` — Handoff Output section
Remove item 1: "Whether to resume the existing session or start a fresh session for the receiving role. Do not hedge or ask the human if a session exists — declare the instruction explicitly based on whether this is a new flow (start new) or within an active flow (resume)." Renumber remaining items.

### `general/roles/curator.md` — Handoff Output section
Remove item 1: "Whether to switch to the receiving role's existing session or start a fresh session. Do not hedge or ask the human if a session exists — declare the instruction explicitly based on whether this is a new flow (start new) or within an active flow (resume)." Renumber remaining items.

### `general/instructions/roles/main.md` — Section 7 and archetype templates
**Section 7 ("Handoff Output"):**
1. Remove bullet: "Whether the human should resume an existing session or start a new one for the receiving role"
2. In the "Copyable inputs" bullet, remove the clause beginning "if a new session is required, also a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`)."
3. Remove the paragraph beginning "Default rule: resume the existing session. Start a new session only when the project's workflow says to — for example, context-window pressure, stale or noisy prior context, or elapsed time. The role should say this explicitly; the human should not infer it."
4. Remove the paragraph beginning "No role-assignment prompt is included — the session is already running under the correct role. The new-session format (session-start prompt followed by artifact path) applies only when the project's workflow criteria for a new session are met."

**Archetype templates (Archetype 1 Owner and all other archetypes with Handoff Output sections):**
Apply the same removal to every Handoff Output section in the archetype template blocks:
- Remove the numbered item that says "Whether to resume the existing session or start a new one for the receiving role. Default: resume the existing session. Start a new one only when the project's workflow says to."
- Remove the clause from the "Copyable inputs" item: "If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` Paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs."
- Renumber remaining items.

### `general/instructions/workflow/main.md` — "Sessions and the Human Orchestrator" section
Six targeted removals within this section (the section opening after "A graph defines what work looks like. Sessions define how the work is executed."):

1. Remove the **"The human as orchestrator"** paragraph: "**The human as orchestrator** — the human decides when to start sessions, when to pause and resume them, which artifacts to point agents at, and maintains continuity between sessions that agents cannot. The human is not a passive approver at the end of a pipeline — they are the runtime that executes the graph."

2. Remove the **"In the current operational model"** paragraph: "In the current operational model, agents do not persist memory between sessions. This creates two realities: [within/between session bullets]." (The session definition paragraph above it — "**Session** — a continuous interaction between the human..." — is retained as it remains accurate.)

3. Remove the **"Session reuse — within a flow"** paragraph: "**Session reuse — within a flow:** resume existing sessions by default..."

4. Remove the **"Session reuse — at flow close"** paragraph: "**Session reuse — at flow close:** when a flow completes, start fresh sessions for the next flow..."

5. In the **"Transition behavior"** paragraph: remove the second bullet "A **copyable session-start prompt** — when a new session is required. Format: *'You are a [Role] agent for [Project Name]. Read [path to agents.md].'*"

6. Remove the **"Future automation"** paragraph: "**Future automation:** By explicitly modeling the human's orchestration role, the framework creates a specification for what automation would need to replace..."

The **"Bidirectional mid-phase exchanges"** paragraph is retained — it describes artifact routing during active phases, which remains a human-mediated action.

### `general/instructions/communication/coordination/machine-readable-handoff.md`
Five removals:

1. **Schema block** — remove `session_action` and `prompt` lines. The revised schema block should contain only `role` and `artifact_path`.

2. **Field Definitions** — remove the `session_action` definition block (heading + two enumerated values + explanation paragraph) and the `prompt` definition block (heading + two conditional bullets).

3. **Conditional Constraint section** — remove the entire "Conditional Constraint" section (heading + table + paragraph beginning "A block with `session_action: start_new`...").

4. **"What It Is" intro** — remove the clause "what session action is required," and remove the clause "and — when a new session is needed — the prompt to use" from the opening description.

5. **"Why It Exists" section** — remove the clause "whether to start a new session or resume one, which artifact to pass, or which prompt to use" from the sentence describing what a tool cannot extract from natural-language prose.

6. **Examples** — remove `session_action` and `prompt` lines from all three worked examples.

---

## Scope

**In scope:** All active governance documents in `a-docs/` and `general/` that contain session routing instructions, human-as-orchestrator session management framing, or `session_action`/`prompt` schema fields. This includes workflow files, role files, communication/coordination files, and general instructions.

**Out of scope:**
- Historical record artifacts — immutable, not touched.
- `a-docs/communication/conversation/TEMPLATE-owner-workflow-plan.md` and other templates — do not contain session routing instructions.
- The orchestrator source code — this brief governs documentation only. The runtime code change (removing session_action and prompt from handoff.ts) is covered by the parallel Track B brief to the Runtime Developer.
- `$A_SOCIETY_TOOLING_COUPLING_MAP` — no tooling format dependency is affected by this change; confirm at proposal time.

---

## Open Questions for the Curator

1. **`general/instructions/workflow/main.md` "Sessions and the Human Orchestrator" section** — after the six targeted removals, verify what remains in the section. If the section retains the `Session` definition and the `Bidirectional mid-phase exchanges` paragraph but little else, assess whether the section heading still accurately describes its content and propose a revised heading or section reorganization if warranted.

2. **`general/instructions/roles/main.md` archetype templates** — read all archetype templates in the file (Archetypes 1 through N) before drafting. Verify which ones have Handoff Output sections with session routing content and list them explicitly in the proposal. Apply the same removal pattern to each.

3. **Framework update report** — this flow removes `session_action` and `prompt` from the machine-readable handoff schema and removes session routing instructions from role and workflow templates that adopting projects currently instantiate. Assess impact classification by consulting `$A_SOCIETY_UPDATES_PROTOCOL` and include the update report draft as a named section in the proposal submission.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for session-routing-removal."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
