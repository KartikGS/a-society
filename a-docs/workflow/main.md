---
workflow:
  name: A-Society Framework Development
  phases:
    - id: phase-1
      name: Proposal
    - id: phase-2
      name: Review
    - id: phase-3
      name: Implementation
    - id: phase-4
      name: Registration
    - id: phase-5
      name: Backward Pass
  nodes:
    - id: owner-phase-1-briefing
      role: Owner
      phase: phase-1
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: curator-phase-1-proposal
      role: Curator
      phase: phase-1
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: owner-phase-2-review
      role: Owner
      phase: phase-2
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: curator-phase-3-implementation
      role: Curator
      phase: phase-3
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: curator-phase-4-registration
      role: Curator
      phase: phase-4
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: curator-phase-5-findings
      role: Curator
      phase: phase-5
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: owner-phase-5-findings
      role: Owner
      phase: phase-5
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: curator-phase-5-synthesis
      role: Curator
      phase: phase-5
      first_occurrence_position: 2
      is_synthesis_role: true
  edges:
    - from: owner-phase-1-briefing
      to: curator-phase-1-proposal
      artifact: owner-to-curator-brief
    - from: curator-phase-1-proposal
      to: owner-phase-2-review
      artifact: curator-to-owner
    - from: owner-phase-2-review
      to: curator-phase-3-implementation
      artifact: owner-to-curator
    - from: owner-phase-2-review
      to: curator-phase-1-proposal
      artifact: owner-to-curator
    - from: curator-phase-3-implementation
      to: curator-phase-4-registration
    - from: curator-phase-4-registration
      to: curator-phase-5-findings
    - from: curator-phase-5-findings
      to: owner-phase-5-findings
    - from: owner-phase-5-findings
      to: curator-phase-5-synthesis
---

# A-Society: Workflow

This document describes how work moves through the A-Society project — from a need being surfaced to content existing in the right place, registered, and ready for adopters. Read this when you need to know what happens next, who owns a step, or when to escalate.

**Summary:** Growing, maintaining, and quality-gating the reusable instruction library.

**Graph:** A-Society Framework Development. Single-instance — one unit of work at a time.

---

## What A-Society Work Is

A-Society's work is framework development: growing, maintaining, and quality-gating a reusable library of agent-documentation patterns. Unlike software projects, there is no user-facing deliverable to ship per change request — the deliverables are improvements to `general/` and `agents/`, which adopting projects consume directly.

---

## Trigger Sources

Work enters the graph when any of the following surfaces a specific need:

1. **Human direction** — the human identifies a need, direction change, or new requirement
2. **Backward pass findings** — actionable items from Phase 5 re-enter as new trigger inputs
3. **Feedback signal** — an inbound feedback stream (onboarding, migration, curator signal) surfaces a gap

These are not workflow phases. They are what creates the input for Phase 1.

---

## Phases

### Phase 1 — Proposal

The entry node. A proposed change is formulated with rationale.

**Input:** A stated need from a trigger source. For Curator-led proposals, the Owner creates a record folder (see `$A_SOCIETY_RECORDS`) and writes `01-owner-to-curator-brief.md` from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`. For human-directed changes, the human provides the direction directly. The briefing establishes scope and direction alignment only — a Phase 2 decision artifact is a separate, subsequent step and may not be substituted by the briefing.

**Owner:** Curator (for `general/` additions and maintenance); Owner (for direction changes).
**Human-collaborative:** direction — the human provides the need, direction change, or feedback signal that initiates the flow.

**Work:** Formulate a proposed change. For `general/` additions, the proposal must include:
1. What the artifact is and what problem it solves
2. Which project(s) the pattern was observed in
3. Why it generalizes — the case that it applies equally to a software project, a writing project, and a research project

**Output:** Draft content and written rationale, submitted to the Owner as the next sequenced artifact in the active record folder (e.g., `02-curator-to-owner.md`), using `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`.

#### Backward-Pass Streamlined Entry

A Curator may initiate directly at `01-curator-to-owner.md` (without a preceding Owner brief) when ALL of the following are true:

1. The trigger is a backward pass finding from a completed flow
2. The Owner's findings artifact in that flow explicitly names: the target file(s) AND the fix type (not just the problem)
3. The Curator's findings are aligned — same or consistent root cause and direction
4. No direction decision is involved — the change is clearly within Curator execution scope

When all four conditions are met, the findings artifacts from the prior flow serve as the shared direction record. The Curator creates the record folder and initiates at `01-curator-to-owner.md`. The sequence from that point is unchanged.

If any condition is not met, the standard path applies: Owner creates the record folder and writes `01-owner-to-curator-brief.md` first.

---

### Phase 2 — Review

The Owner evaluates the proposal against the five review tests.

**Input:** Draft content + rationale from Phase 1.

**Owner:** Owner.

**Work:** Apply the review tests:
1. **Generalizability test** — Does this apply equally to software, writing, and research projects?
2. **Abstraction level test** — Is this the right level? Not so specific it assumes a domain; not so vague it is unactionable?
3. **Duplication test** — Does this overlap with existing content? If so, extend rather than create.
4. **Placement test** — Does the target folder's governing principle (per `$A_SOCIETY_STRUCTURE`) include this?
5. **Quality test** — Is this written so an unfamiliar agent can read it and produce a correct artifact?
6. **Coupling Test** — Consult `$A_SOCIETY_TOOLING_COUPLING_MAP`. If the proposed `general/` element appears in the format dependency table, the proposal is not approvable until a tooling update is scoped. The Owner documents the required tooling update scope in the Phase 2 decision artifact. The tooling update follows the TA advisory → Developer path per `$A_SOCIETY_TOOLING_ADDENDUM`.
7. **Manifest Check** — If the proposal adds, removes, or renames any file in `general/`, verify whether `$GENERAL_MANIFEST` needs updating. If it does, note this in the Phase 2 decision artifact as a required co-implementation step for the Curator.

**Output:** An explicit decision written as the next sequenced artifact in the active record folder (e.g., `03-owner-to-curator.md`), using `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`:
- **Approved** → proceeds to Phase 3
- **Revise** → returns to Phase 1 with required changes (branching edge)
- **Rejected** → terminal; item closed

---

### Phase 3 — Implementation

Approved content is created or modified at the correct location.

**Input:** Owner approval from Phase 2.

**Owner:** Curator.

**Work:** Write the content at the correct location per `$A_SOCIETY_STRUCTURE`.

**Output:** File(s) created or updated at correct locations.

---

### Phase 4 — Registration

New or updated files are registered in the appropriate index.

**Input:** Implementation complete from Phase 3.

**Owner:** Curator.

**Work:**
- Content in `general/` or `agents/` → register in `$A_SOCIETY_PUBLIC_INDEX`
- Content in `a-docs/` → register in `$A_SOCIETY_INDEX`
- New `a-docs/` files → add a rationale entry to `$A_SOCIETY_AGENT_DOCS_GUIDE`
- If the registered changes qualify for a framework update report (see `$A_SOCIETY_UPDATES_PROTOCOL`), the Curator drafts the report and submits it to the Owner for review before publishing to `$A_SOCIETY_UPDATES_DIR`

**Output:** Updated index row(s); updated a-docs-guide entry if applicable; framework update report published if triggered. The session is not complete until registration is done.

---

### Phase 5 — Backward Pass

Each agent who participated in the forward pass (Phases 1–4) reflects on their experience.

**Input:** Phase 4 complete.

**Owner:** Curator (findings first), Owner (findings second), Curator (synthesis).

**Work:** Produce findings per `$A_SOCIETY_IMPROVEMENT_PROTOCOL`. Actionable findings re-enter the workflow as new trigger inputs.

**Output:** Findings artifacts in the active record folder at the next sequenced positions (e.g., `04-curator-findings.md`, `05-owner-findings.md`). See `$A_SOCIETY_RECORDS` for the naming convention. Actionable items surface as triggers for future graph traversals.

**Depth:** Proportional to the work. For routine single-file changes with no friction, 1–3 top findings is sufficient. For substantive changes (new artifacts, structural modifications, authority boundary decisions), produce full structured findings per `$A_SOCIETY_IMPROVEMENT_PROTOCOL`.

The backward pass is not optional. Skipping it means the a-docs drift from how the project actually works.

---

## Handoffs

For detailed artifact formats, status vocabulary, and coordination rules, see `$A_SOCIETY_COMM_COORDINATION`.

| Edge | Transition Condition | What Carries It | Receiver Checks |
|---|---|---|---|
| Trigger → Phase 1 | Owner briefing written (Curator-led) or human direction given | `01-owner-to-curator-brief.md` in the active record folder, or conversation | Briefing contains Agreed Change and Scope; Curator acknowledges |
| Phase 1 → Phase 2 | Draft + rationale submitted | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`) | All three proposal elements present |
| Phase 2 → Phase 3 | Decision = Approved | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) | Approval stated explicitly |
| Phase 2 → Phase 1 | Decision = Revise | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) | Curator acknowledges; revises and resubmits |
| Phase 2 → ∅ | Decision = Rejected | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) | Curator acknowledges; item closed |
| Phase 3 → Phase 4 | Files exist at correct paths | File existence verification | Correct index identified |
| Phase 4 → Phase 5 | Index updated; update report published if triggered | Registration confirmation | All forward-pass participants identified |

---

## Session Model

The workflow runs across two concurrent sessions, with the human switching between them.

| Session | Role | Phases |
|---|---|---|
| **Session A** | Owner | Trigger input (briefing) → *pause* → Phase 2 (review) → *pause* → Phase 5 (findings) |
| **Session B** | Curator | Phase 1 (proposal) → *pause* → Phase 3 + Phase 4 (implement, register) → Phase 5 (findings, synthesis) |

**Default routing rule:** Resume the existing session by default. Start a new session only when the criteria in "When to start a new session" below apply. The active role must say this explicitly at each pause point; the human does not infer it.

### How it flows

1. **Session A starts.** The human and Owner align on a need. The Owner creates a record folder and writes `01-owner-to-curator-brief.md`. The Owner tells the human whether to resume the existing Curator session or start a new one, provides a copyable path to `01-owner-to-curator-brief.md`, and — if a new session is required — provides a copyable session-start prompt for the Curator. If no Curator session exists yet, the Owner says to start Session B; otherwise the default is resume. Session A pauses.

2. **Session B starts or resumes.** The human opens or returns to the Curator session and points it at the briefing. The Curator acknowledges, drafts the proposal, and writes the next sequenced artifact in the active record folder. The Curator tells the human whether to resume the existing Owner session or start a new one, provides a copyable path to the proposal artifact, and — if a new session is required — provides a copyable session-start prompt for the Owner. Session B pauses.

3. **Session A resumes.** The human returns to the Owner session and points it at the proposal. The Owner reviews it and writes a decision as the next sequenced artifact in the active record folder. The Owner tells the human what to do next:
   - **Approved:** resume the existing Curator session unless the new-session criteria apply; provide a copyable path to the approval artifact and, if a new session is required, a copyable session-start prompt for the Curator.
   - **Revise:** resume the existing Curator session unless the new-session criteria apply; provide a copyable path to the revision request and, if a new session is required, a copyable session-start prompt for the Curator.
   - **Rejected:** item closed; no further session switch needed.
   
   Session A pauses.

4. **Session B resumes.** The human returns to the Curator session and points it at the decision. The Curator implements, registers, and produces backward pass findings in the active record folder. If the next action belongs to the Owner, the Curator tells the human whether to resume Session A or start a new Owner session, provides a copyable path to the findings artifact and any update-report submission awaiting review, and — if a new session is required — provides a copyable session-start prompt for the Owner. Session B then pauses.

5. **Session A resumes.** The Owner reviews any pending update-report submission, produces backward pass findings in the active record folder, and tells the human whether to resume the Curator session for synthesis or publication follow-through. The Owner provides a copyable path to the findings artifact and — if a new Curator session is required — a copyable session-start prompt. If no Curator follow-up is needed, the Owner says the flow is complete. Session A ends or pauses accordingly.

6. **Session B resumes (if needed).** The Curator synthesizes both findings artifacts, publishes any approved follow-up artifacts, and proposes any actionable items as new trigger inputs. The Curator tells the human explicitly whether the flow is now complete or whether another Owner session is required. If another Owner session is needed, the Curator provides a copyable path to the relevant artifact and a copyable session-start prompt.

**Owner as terminal node.** The Owner is the structural endpoint of each flow. Every flow closes at Step 5 — the Owner receives the implementation output and any pending submissions, produces backward pass findings, and explicitly acknowledges whether the flow is complete or Curator follow-up remains. A flow that has not cleared the Owner has not closed.

### The human's role at each transition

The human is the orchestrator — they maintain continuity between sessions and route artifacts. At each pause point, the active agent should:
1. State whether the human should resume an existing session or start a new one
2. Provide a copyable path to the artifact it produced
3. Tell the human which session to switch to
4. State what the receiving agent needs to read
5. If a new session is required, provide a copyable session-start prompt for the receiving role

### When to start a new session

Resume the existing session by default. Start a new session only when:
- The existing session's context window is full or approaching limits
- The accumulated context from earlier phases would be more noise than signal
- Significant time has passed and the session may have expired
- A new flow is beginning — start a fresh session for each new flow by default

---

## Invariants

**1. Portability Invariant**
No content enters `general/` without the Owner confirming it passes the generalizability test. If the test cannot be confirmed, the content stays in a project-specific folder until it can be.

**2. Approval Invariant**
The Curator does not write to `general/` without Owner approval. Every addition to the general library is reviewed before creation. Drafting is permitted; creating is not. Approval is established by a Phase 2 decision artifact with `APPROVED` status — directional alignment in a briefing is not approval. The Curator does not begin implementation on briefing language alone.

**3. Single-Source Invariant**
Information lives in exactly one file. Cross-references use `$VARIABLE_NAME` from the relevant index. Hardcoded paths are not permitted in any document. When the same information would belong in two places, make one the source and the other a reference.

**4. Index-Before-Reference Invariant**
A file must be registered in the relevant index before any document references it by variable name. Register first, then write the reference. The inverse — retiring a variable — requires all consumer references to be resolved before the row is removed from the index; the Variable Retirement protocol in `$INSTRUCTION_INDEX` governs this sequence.

---

## Escalation

| Situation | Who escalates | To whom |
|---|---|---|
| A proposed addition would change the framework's scope or direction | Owner | Human |
| A structural change to `a-society/` would affect adopting projects | Owner | Human (with impact analysis) |
| Two reasonable interpretations of the vision lead to different decisions | Owner | Human |
| A conflict between two documents cannot be resolved by reference | Curator | Owner; Owner escalates to Human if unresolved |
| A Curator proposal is ready but Owner is unavailable or unclear | Curator | Ask Human directly |

Do not proceed past a blocked step. Escalate rather than resolve ambiguity unilaterally when the decision shapes framework direction.
