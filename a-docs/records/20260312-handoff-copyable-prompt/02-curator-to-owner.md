---

**Subject:** Handoff Output — copyable session inputs
**Status:** IMPLEMENTED
**Type:** Proposal
**Date:** 2026-03-12
**Revision:** `Read: @` notation removed from read directive format per Owner REVISE decision in `03-owner-to-curator.md`. Format is now tool-agnostic (`[artifact path]`). No other changes.

---

## Trigger

Human identified the gap via `01-owner-to-curator-brief.md` in this record. Evidence from a promo-agency test run: every session switch after initialization required the user to improvise the prompt format. The Initializer already produces copyable session inputs at handoff; all other role templates do not. The brief identifies this as a standard the framework should hold consistently.

---

## What and Why

Add a fourth item to every Handoff Output section in `$INSTRUCTION_ROLES`, `$GENERAL_OWNER_ROLE`, and `$GENERAL_CURATOR_ROLE` requiring the role to produce copyable inputs for the receiving role. The form depends on item 1's outcome:

- **Always:** a copyable artifact path
- **If a new session is required, also provide first:** a copyable session-start prompt — `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`

The artifact read directive is unconditional — the receiving role always needs to load the handoff artifact, whether the session is new or existing. The session-start prompt is additional, and only needed when a new session is being started.

**Why this generalizes:** Role handoffs occur in every project using the A-Society framework regardless of domain. In both the new-session and resume cases, the human needs a copyable input to load the handoff artifact into the receiving role — and in the new-session case they additionally need a copyable prompt to orient the agent. Neither should require improvisation. This change applies equally to every archetype in the instruction and every project that instantiates these templates.

**Why item 4, not a replacement:** Items 1–3 govern routing decisions (new session vs. existing, which session, what to read). Item 4 is the delivery artifact that makes the routing actionable — it equips the human to act on items 1–3 without having to compose the inputs themselves.

---

## Where Observed

Promo-agency test run (referenced in `01-owner-to-curator-brief.md`). The Initializer — `$A_SOCIETY_INITIALIZER_ROLE` — already meets this standard for new sessions; this proposal extends the pattern to all handoffs and both session types.

---

## Target Location

- `$INSTRUCTION_ROLES` — Section 7 canonical definition + all archetype Handoff Output sections
- `$GENERAL_OWNER_ROLE` — Handoff Output section
- `$GENERAL_CURATOR_ROLE` — Handoff Output section

(Post-approval MAINT to `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE` is Curator-authority and will be applied concurrently with implementation.)

---

## Draft Content

### 1. `$INSTRUCTION_ROLES` — Section 7 canonical definition

**Current:**
```
At each pause point, the role should state:
- Whether the human should resume an existing session or start a new one for the receiving role
- Which session to switch to
- What the receiving role needs to read (artifact path and any additional context)
```

**Proposed:**
```
At each pause point, the role should state:
- Whether the human should resume an existing session or start a new one for the receiving role
- Which session to switch to
- What the receiving role needs to read (artifact path and any additional context)
- Copyable inputs for the receiving role: always a read directive (`[artifact path]`); if a new session is required, also a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`)
```

---

### 2. `$INSTRUCTION_ROLES` — Owner archetype template (numbered list format)

**Current:**
```
## Handoff Output
At each pause point, tell the human:
1. Whether to resume the existing session or start a new one for the receiving role. Default: resume the existing session. Start a new one only when the project's workflow says to.
2. Which session to switch to.
3. What the receiving role needs to read (artifact path and any additional context).

If the work item is closed, say so explicitly and do not imply a further session switch.
```

**Proposed:**
```
## Handoff Output
At each pause point, tell the human:
1. Whether to resume the existing session or start a new one for the receiving role. Default: resume the existing session. Start a new one only when the project's workflow says to.
2. Which session to switch to.
3. What the receiving role needs to read (artifact path and any additional context).
4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`

If the work item is closed, say so explicitly and do not imply a further session switch.
```

---

### 3. `$INSTRUCTION_ROLES` — Prose-format archetypes (Analyst, Implementer, Reviewer, Coordinator, Curator)

Each of these archetypes has a Handoff Output written as prose rather than a numbered list. The change appends the copyable-inputs requirement to the existing sentence.

**Analyst — current:**
```
When the Analyst finishes a specification or reaches a pause point that hands work to another role, tell the human whether to resume the receiving role's existing session or start a new one (default: resume), which session to switch to, and what artifact to point the receiving role at.
```
**Proposed:**
```
When the Analyst finishes a specification or reaches a pause point that hands work to another role, tell the human whether to resume the receiving role's existing session or start a new one (default: resume), which session to switch to, and what artifact to point the receiving role at. Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`).
```

**Implementer — current:**
```
When the Implementer completes the deliverable or reaches a blocker that must move to another role, tell the human whether to resume the receiving role's existing session or start a new one (default: resume), which session to switch to, and what artifact or evidence the receiving role needs.
```
**Proposed:**
```
When the Implementer completes the deliverable or reaches a blocker that must move to another role, tell the human whether to resume the receiving role's existing session or start a new one (default: resume), which session to switch to, and what artifact or evidence the receiving role needs. Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`).
```

**Reviewer — current:**
```
When the Reviewer issues a verdict and another role must act, tell the human whether to resume the receiving role's existing session or start a new one (default: resume), which session to switch to, and what review artifact or evidence the receiving role needs.
```
**Proposed:**
```
When the Reviewer issues a verdict and another role must act, tell the human whether to resume the receiving role's existing session or start a new one (default: resume), which session to switch to, and what review artifact or evidence the receiving role needs. Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`).
```

**Coordinator — current:**
```
At each pause point, the Coordinator tells the human whether to resume the next role's existing session or start a new one (default: resume), which session to switch to, and what state artifact or handoff the next role needs to read.
```
**Proposed:**
```
At each pause point, the Coordinator tells the human whether to resume the next role's existing session or start a new one (default: resume), which session to switch to, and what state artifact or handoff the next role needs to read. Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`).
```

**Curator archetype — current:**
```
At each pause point, the Curator tells the human whether to resume the receiving role's existing session or start a new one (default: resume), which session to switch to, and what artifact, changed files, or findings the receiving role needs to read.
```
**Proposed:**
```
At each pause point, the Curator tells the human whether to resume the receiving role's existing session or start a new one (default: resume), which session to switch to, and what artifact, changed files, or findings the receiving role needs to read. Always provide a copyable read directive (`[artifact path]`); if a new session is required, also provide a session-start prompt first (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`).
```

---

### 4. `$GENERAL_OWNER_ROLE` — Handoff Output section

**Current:**
```
## Handoff Output

At each pause point, the Owner tells the human:
1. Whether to resume the existing session or start a new session for the receiving role. Default: resume the existing session. Start a new one only when the project's workflow says to.
2. Which session to switch to.
3. What the receiving role needs to read (artifact path and any additional context).

If the work item is closed, the Owner says so explicitly and does not imply a further handoff.
```

**Proposed:**
```
## Handoff Output

At each pause point, the Owner tells the human:
1. Whether to resume the existing session or start a new session for the receiving role. Default: resume the existing session. Start a new one only when the project's workflow says to.
2. Which session to switch to.
3. What the receiving role needs to read (artifact path and any additional context).
4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`

If the work item is closed, the Owner says so explicitly and does not imply a further handoff.
```

---

### 5. `$GENERAL_CURATOR_ROLE` — Handoff Output section

**Current:**
```
## Handoff Output

At each pause point, the Curator tells the human:
1. Whether to switch to the receiving role's existing session or start a new one. Default: switch to the receiving role's existing session. Start a new one only when the project's workflow says to.
2. Which session to switch to.
3. What the receiving role needs to read (artifact path, changed files, findings, or other required context).

Typical Curator pause points include:
- after submitting a proposal or update-report draft for Owner review
- after implementation and registration when another role owes review or findings
- after findings or synthesis when the next action belongs to another role or the item is complete

If the work item is complete or blocked on another role, the Curator states that explicitly.
```

**Proposed:**
```
## Handoff Output

At each pause point, the Curator tells the human:
1. Whether to switch to the receiving role's existing session or start a new one. Default: switch to the receiving role's existing session. Start a new one only when the project's workflow says to.
2. Which session to switch to.
3. What the receiving role needs to read (artifact path, changed files, findings, or other required context).
4. Copyable inputs for the receiving role. Always: `[artifact path]`. If a new session is required, also provide first: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`

Typical Curator pause points include:
- after submitting a proposal or update-report draft for Owner review
- after implementation and registration when another role owes review or findings
- after findings or synthesis when the next action belongs to another role or the item is complete

If the work item is complete or blocked on another role, the Curator states that explicitly.
```

---

## Owner Confirmation Required

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
