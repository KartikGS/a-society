---
workflow:
  name: A-Society Framework Development
  nodes:
    - id: owner-intake-briefing
      role: Owner
      human-collaborative: direction
    - id: curator-proposal
      role: Curator
    - id: owner-review
      role: Owner
      human-collaborative: approval
    - id: curator-implementation-registration
      role: Curator
    - id: owner-closure-acknowledgment
      role: Owner
      human-collaborative: closure
  edges:
    - from: owner-intake-briefing
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: owner-intake-briefing
      to: owner-closure-acknowledgment
      artifact: owner-workflow-plan
    - from: curator-proposal
      to: owner-review
      artifact: curator-to-owner
    - from: owner-review
      to: curator-implementation-registration
      artifact: owner-to-curator
    - from: owner-review
      to: curator-proposal
      artifact: owner-to-curator
    - from: curator-implementation-registration
      to: owner-closure-acknowledgment
      artifact: curator-to-owner
---

# A-Society: Framework Development Workflow

This document describes how work moves through the A-Society project — from a need being surfaced to content existing in the right place, registered, and ready for adopters. Read this when you need to know what happens next, who owns a step, or when to escalate.

**Summary:** Growing, maintaining, and quality-gating the reusable instruction library.

**Graph:** A-Society Framework Development. Single-instance — one unit of work at a time.

---

## What A-Society Work Is

A-Society's work is framework development: growing, maintaining, and quality-gating a reusable library of agent-documentation patterns. Unlike software projects, there is no user-facing deliverable to ship per change request — the deliverables are improvements to `general/` and `agents/`, which adopting projects consume directly.

---

## Nodes

### `owner-intake-briefing`

**Owner:** Owner

**Required readings:**
- `$A_SOCIETY_WORKFLOW_COMPLEXITY`
- `$A_SOCIETY_RECORDS`
- `$A_SOCIETY_OWNER_LOG_MANAGEMENT` when intake decisions affect `$A_SOCIETY_LOG` or `$A_SOCIETY_LOG_ARCHIVE`
- `$A_SOCIETY_OWNER_BRIEF_WRITING` when the flow will issue a Tier 2/3 brief or other detailed downstream constraints

**Inputs:**
- Human direction
- Backward-pass findings requiring Owner judgment
- Feedback signal
- Any overlapping Next Priorities context in `$A_SOCIETY_LOG`

**Work:**
- assess the triggered work against the five axes from `$A_SOCIETY_WORKFLOW_COMPLEXITY`
- select the tier, define the known path, and surface known unknowns
- create the record folder per `$A_SOCIETY_RECORDS`
- produce `01-owner-workflow-plan.md` using `$A_SOCIETY_COMM_TEMPLATE_PLAN`
- create `workflow.md` for the active path
- for Tier 2/3 flows, write the Owner-to-Curator brief as the next sequenced artifact immediately after the plan

**Outputs:**
- `01-owner-workflow-plan.md`
- `workflow.md`
- Tier 2/3 only: next sequenced `owner-to-curator-brief`
- Tier 1 only: direct implementation at permanent file locations

**Transitions:**
- **Tier 1 direct path:** after the Owner completes the scoped work, move to `owner-closure-acknowledgment`; the workflow plan remains the approval gate artifact
- **Tier 2/3 path:** when the plan is complete and the brief is written, hand off to `curator-proposal`

**Notes:**
- `01-owner-workflow-plan.md` and `workflow.md` must exist before any later artifact in the record folder
- all five complexity fields, the tier field, and the path field must be non-null; otherwise the gate is incomplete
- Tier 1 does not produce brief, proposal, or decision artifacts

---

### `curator-proposal`

**Owner:** Curator

**Required readings:**
- `$A_SOCIETY_CURATOR_IMPL_PRACTICES`

**Inputs:**
- completed workflow plan
- Owner-to-Curator brief for the standard Tier 2/3 path
- or, when the streamlined backward-pass entry conditions below are met, the prior flow's findings artifacts as shared direction record

**Work:**
- formulate the proposed change and rationale
- for `general/` additions, state what the artifact is, what problem it solves, which project(s) surfaced it, and why it generalizes across project types
- when the proposed change is likely to qualify for a framework update report, include the draft report as a named section in the proposal submission

**Outputs:**
- next sequenced `curator-to-owner` proposal artifact using `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`

**Transitions:**
- when the proposal artifact is complete, hand off to `owner-review`

**Notes:**
- **Backward-pass streamlined entry:** the Curator may initiate directly at `01-curator-to-owner.md` without a preceding Owner brief only when all four conditions hold: (1) the trigger is a backward-pass finding from a completed flow, (2) the Owner's findings artifact explicitly names the target file(s) and fix type, (3) the Curator's findings align on root cause and direction, and (4) no direction decision is involved
- if any streamlined-entry condition fails, the standard path applies and the Owner opens the record folder first

---

### `owner-review`

**Owner:** Owner

**Required readings:**
- `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`
- `$A_SOCIETY_OWNER_BRIEF_WRITING` when the decision artifact adds downstream implementation constraints or file-specific directions
- `$A_SOCIETY_EXECUTABLE_COUPLING_MAP` when the proposal changes a `general/` element with executable format dependencies

**Inputs:**
- Curator proposal artifact
- update report draft, when one was included in the proposal

**Work:**
- apply the review tests: generalizability, abstraction level, duplication, placement, quality, coupling, and manifest check
- review any included framework update report draft as part of the same decision
- decide whether the proposal is Approved, Revise, or Rejected

**Outputs:**
- next sequenced Owner decision artifact using `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`

**Transitions:**
- **Approved:** hand off to `curator-implementation-registration`
- **Revise:** hand back to `curator-proposal`
- **Rejected:** terminate the flow with no further forward-pass node

**Notes:**
- the Approval Invariant is satisfied only by an explicit decision artifact with `APPROVED` status; briefing alignment is not approval

---

### `curator-implementation-registration`

**Owner:** Curator

**Required readings:**
- `$A_SOCIETY_CURATOR_IMPL_PRACTICES`

**Inputs:**
- approved Owner decision artifact

**Work:**
- write the approved content at the correct location per `$A_SOCIETY_STRUCTURE`
- if a framework update report was approved in the proposal/review loop, publish it to `$A_SOCIETY_UPDATES_DIR` during implementation and before registration
- register changed files in the appropriate index
- add or verify `$A_SOCIETY_AGENT_DOCS_GUIDE` rationale coverage for new or significantly modified `a-docs/` files
- complete the registration exit checklist before filing the completion artifact

**Outputs:**
- created or modified content files at their permanent locations
- updated index rows
- updated a-docs-guide entry when required
- next sequenced `curator-to-owner` completion artifact

**Transitions:**
- when implementation and registration are complete, hand off to `owner-closure-acknowledgment`

**Notes:**
- content in `general/` or `agents/` registers in `$A_SOCIETY_PUBLIC_INDEX`; content in `a-docs/` registers in `$A_SOCIETY_INDEX`
- before filing the completion artifact, verify: all approved content landed; all required index rows were added; a-docs-guide obligations were satisfied; any approved update report was published; and the completion artifact itself was filed

---

### `owner-closure-acknowledgment`

**Owner:** Owner

**Required readings:**
- `$A_SOCIETY_OWNER_LOG_MANAGEMENT`
- `$A_SOCIETY_OWNER_CLOSURE`

**Inputs:**
- Tier 1: completed direct implementation plus `01-owner-workflow-plan.md`
- Tier 2/3: Curator completion artifact after implementation and registration

**Work:**
- confirm all forward-pass work is complete and registered
- verify that approved work was actually executed; approval is not completion
- update `$A_SOCIETY_LOG`, including lifecycle sections and Next Priorities as appropriate
- determine the backward-pass routing per `$A_SOCIETY_IMPROVEMENT`

**Outputs:**
- closure artifact / forward-pass completion confirmation

**Transitions:**
- when closure is confirmed, emit the forward-pass closure signal and hand control to the improvement protocol

**Notes:**
- the Owner is the terminal node of the forward pass
- if any approved forward-pass work is still missing, do not close the flow; route the missing work explicitly instead of treating approval as completion

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
