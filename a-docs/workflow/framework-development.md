---
workflow:
  name: A-Society Framework Development
  nodes:
    - id: owner-intake-briefing
      role: Owner
      human-collaborative: "yes"
    - id: curator-proposal
      role: Curator
    - id: owner-review
      role: Owner
      human-collaborative: "yes"
    - id: curator-implementation-registration
      role: Curator
    - id: owner-closure-acknowledgment
      role: Owner
      human-collaborative: "yes"
  edges:
    - from: owner-intake-briefing
      to: curator-proposal
      artifact: owner-to-curator-brief
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

## Trigger Sources

Work enters the graph when any of the following surfaces a specific need:

1. **Human direction** — the human identifies a need, direction change, or new requirement
2. **Backward pass findings requiring Owner judgment** — Curator-authority findings are implemented directly per `$A_SOCIETY_IMPROVEMENT`; findings requiring Owner judgment surface as new trigger inputs to the standard workflow
3. **Feedback signal** — an inbound feedback stream (onboarding, migration, curator signal) surfaces a gap

These are not workflow phases. They are what creates the input for Phase 1.

**Phase 0 — Intake (required):** Every flow begins with Phase 0 — see the Phase 0 section below. The Owner produces `01-owner-workflow-plan.md` before any other artifact. For Tier 2 and 3 flows, the Owner-to-Curator brief follows immediately as the next sequenced artifact.

---

## Phases

### Phase 0 — Intake

Every flow begins here, before any other artifact is produced.

**Owner:** Owner.

**Work:** Assess the complexity of the triggered work against the five axes from `$INSTRUCTION_WORKFLOW_COMPLEXITY`. Select the appropriate tier. Define the known path and surface known unknowns.

**Output:** `01-owner-workflow-plan.md` in the record folder (see `$A_SOCIETY_RECORDS`), produced using `$A_SOCIETY_COMM_TEMPLATE_PLAN`. All five complexity axis fields, the tier field, and the path field must be non-null — a plan missing any required field is incomplete and does not satisfy this gate. `workflow.md` (the backward pass schema file) must also be created in the record folder at this step — see `$A_SOCIETY_RECORDS` for the schema. Both files are Phase 0 outputs; a record folder missing `workflow.md` is incomplete.

For **Tier 1 flows:** the plan is the approval gate; the Owner implements directly within Session A and proceeds to backward pass. No brief is written. No Session B is needed.

For **Tier 2 and 3 flows:** the plan gates the brief. The Owner writes the Owner-to-Curator brief as the next sequenced artifact (e.g., `02-owner-to-curator-brief.md`) immediately after, then initiates Session B.

---

### Phase 1 — Proposal

The entry node. A proposed change is formulated with rationale.

**Input:** A completed Phase 0 workflow plan and, for Curator-led proposals, an Owner-to-Curator brief written from `$A_SOCIETY_COMM_TEMPLATE_BRIEF` as the next sequenced artifact after the plan. For human-directed changes, the human provides the direction directly. The briefing establishes scope and direction alignment only — a Phase 2 decision artifact is a separate, subsequent step and may not be substituted by the briefing.

**Owner:** Curator (for `general/` additions and maintenance); Owner (for direction changes).
**Human-collaborative:** direction — the human provides the need, direction change, or feedback signal that initiates the flow.

**Work:** Formulate a proposed change. For `general/` additions, the proposal must include:
1. What the artifact is and what problem it solves
2. Which project(s) the pattern was observed in
3. Why it generalizes — the case that it applies equally to a software project, a writing project, and a research project

When the proposed change is likely to qualify for a framework update report (see `$A_SOCIETY_UPDATES_PROTOCOL`), include the update report draft as a named section in the proposal submission. The Owner reviews and approves the draft as part of the Phase 2 decision.

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
6. **Coupling Test** — Consult `$A_SOCIETY_TOOLING_COUPLING_MAP`. If the proposed `general/` element appears in the format dependency table, the proposal is not approvable until a tooling update is scoped. The Owner documents the required tooling update scope in the Phase 2 decision artifact. The tooling update follows the TA advisory → Developer path per `$A_SOCIETY_WORKFLOW_TOOLING_DEV`.
7. **Manifest Check** — If the proposal adds, removes, or renames any file in `general/`, verify whether `$GENERAL_MANIFEST` needs updating. If it does, note this in the Phase 2 decision artifact as a required co-implementation step for the Curator.

If a framework update report draft was included in the Phase 1 proposal, review it as part of this decision. The Phase 2 decision artifact covers both the content change and the update report draft — they are not reviewed separately.

**Output:** An explicit decision written as the next sequenced artifact in the active record folder (e.g., `03-owner-to-curator.md`), using `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`:
- **Approved** → proceeds to Phase 3
- **Revise** → returns to Phase 1 with required changes (branching edge)
- **Rejected** → terminal; item closed

---

### Phase 3 — Implementation

Approved content is created or modified at the correct location.

**Input:** Owner approval from Phase 2.

**Owner:** Curator.

**Work:** Write the content at the correct location per `$A_SOCIETY_STRUCTURE`. If a framework update report was approved in Phase 2, publish it to `$A_SOCIETY_UPDATES_DIR` as part of implementation — before registration.

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
- Significantly modified `a-docs/` files (major section added or removed) → verify the rationale entry in `$A_SOCIETY_AGENT_DOCS_GUIDE` remains accurate; update if the change affects the file's described purpose, scope, or "Do not consolidate with" guidance
- If a framework update report was approved in Phase 2, confirm it was published during Phase 3. No separate update report submission is needed.

**Output:** Updated index row(s); updated a-docs-guide entry if applicable; next sequenced `curator-to-owner` handoff artifact produced in the active record folder. If a framework update report was approved in Phase 2, the handoff may reference the published report, but the report itself is not submitted as a separate artifact at Phase 4. Work hands off to the Owner for forward-pass closure.

**Phase 4 exit checklist:** Before filing the completion artifact, verify all of the following are done: (1) all approved content files created or modified; (2) all required index rows added; (3) a-docs-guide entry added for new `a-docs/` files, and rationale entry verified-accurate for significantly modified `a-docs/` files (updated if needed); (4) framework update report published to `$A_SOCIETY_UPDATES_DIR` if one was approved in Phase 2; (5) the `curator-to-owner` completion artifact itself filed in the active record folder. The artifact enumerates each completed deliverable — an item absent from the enumeration is a signal that the corresponding work may not have been done.

---

### Phase 5 — Forward Pass Closure

The Owner acknowledges forward-pass completion.

**Input:** Registration complete from Phase 4.

**Owner:** Owner.

**Work:** Confirm all forward-pass work is complete and registered. Before confirming closure, verify that all approved tasks have been executed — approval is not completion. Any Curator task outstanding at the time of approval (e.g., a publication step approved in Phase 2 but not yet executed) must be confirmed complete before the forward pass is declared closed. Update `$A_SOCIETY_LOG`: add the completed flow's entry across all relevant lifecycle sections (Current State, Recent Focus, Previous, Archive). Update Next Priorities as appropriate. Acknowledge closure and initiate the backward pass by invoking Component 4 (Backward Pass Orderer) using this flow's `workflow.md`. Component 4 invocation is the first backward pass action — no findings artifact may be produced before the traversal order has been determined.

**Output:** Closure message; Component 4 invoked; backward pass traversal order confirmed.

---

Backward pass is mandatory after forward-pass completion and is governed by `$A_SOCIETY_IMPROVEMENT`; it is not a workflow phase and is not represented as workflow graph nodes.

---

## Handoffs

For detailed artifact formats, status vocabulary, and coordination rules, see `$A_SOCIETY_COMM_COORDINATION`.

| Edge | Transition Condition | What Carries It | Receiver Checks |
|---|---|---|---|
| Trigger → Phase 0 | Owner identifies need and creates record folder | `01-owner-workflow-plan.md` and `workflow.md` in the active record folder | All frontmatter fields non-null; tier and path specified; `workflow.md` present |
| Phase 0 → Phase 1 | Plan complete; Tier 2 or 3 confirmed | Next sequenced artifact in the active record folder, from `$A_SOCIETY_COMM_TEMPLATE_BRIEF` | Briefing contains Agreed Change and Scope; Curator acknowledges |
| Phase 1 → Phase 2 | Draft + rationale submitted | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`) | All three proposal elements present |
| Phase 2 → Phase 3 | Decision = Approved | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) | Approval stated explicitly |
| Phase 2 → Phase 1 | Decision = Revise | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) | Curator acknowledges; revises and resubmits |
| Phase 2 → ∅ | Decision = Rejected | Next sequenced artifact in the active record folder (from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) | Curator acknowledges; item closed |
| Phase 3 → Phase 4 | Files exist at correct paths | File existence verification | Correct index identified |
| Phase 4 → Phase 5 | Registration complete | Next sequenced artifact in the active record folder (`curator-to-owner`) | Owner acknowledges; closes forward pass |

---

## Session Model

The workflow runs across two concurrent sessions, with the human switching between them.

| Session | Role | Phases |
|---|---|---|
| **Session A** | Owner | Phase 0 (plan) → Tier 2/3: briefing → *pause* → Phase 2 (review). Backward pass per `$A_SOCIETY_IMPROVEMENT`. |
| **Session B** | Curator | Phase 1 (proposal) → *pause* → Phase 3 + Phase 4 (implement, register). Backward pass per `$A_SOCIETY_IMPROVEMENT`. |



### How it flows

1. **Session A starts.** The human and Owner align on a need. The Owner creates the record folder and produces `01-owner-workflow-plan.md` using `$A_SOCIETY_COMM_TEMPLATE_PLAN`. **For Tier 1 flows:** the plan is the approval gate; the Owner implements and closes the flow within Session A — no brief is written and Session B is not needed. **For Tier 2 and 3 flows:** the Owner writes the Owner-to-Curator brief as the next sequenced artifact immediately after the plan. The Owner directs the human to the Curator session (Session B). Session A pauses.

2. **Session B starts or resumes.** The human opens or returns to the Curator session and points it at the briefing. The Curator acknowledges, drafts the proposal, and writes the next sequenced artifact in the active record folder. The Curator provides a copyable path to the proposal artifact. Session B pauses.

3. **Session A resumes.** The human returns to the Owner session and points it at the proposal. The Owner reviews it and writes a decision as the next sequenced artifact in the active record folder. The Owner tells the human what to do next:
   - **Approved:** provide a copyable path to the approval artifact.
   - **Revise:** provide a copyable path to the revision request.
   - **Rejected:** item closed; no further session switch needed.

   Session A pauses.

4. **Session B resumes.** The human returns to the Curator session and points it at the decision. The Curator implements (including publishing any update report approved in Phase 2) and registers. After forward-pass work is complete, Session B pauses and hands off to the Owner for terminal review and forward-pass closure (Phase 5). The backward pass follows only after the Owner confirms the forward pass is closed. The Curator provides a copyable path to the registration confirmation. Session B then pauses.

5. **Session A resumes.** The Owner executes Phase 5 (Forward Pass Closure). Before confirming closure, the Owner verifies all forward-pass work is complete — approved tasks must be confirmed executed, not merely approved. The Owner performs backward-pass work per `$A_SOCIETY_IMPROVEMENT` and tells the human whether the Curator session is needed for synthesis. The Owner provides a copyable path to the relevant artifact. If no Curator follow-up is needed, the Owner says the flow is complete. Session A ends or pauses accordingly.

6. **Session B resumes (if needed).** The Curator completes any Owner-requested follow-through, performs backward-pass work or synthesis when due per `$A_SOCIETY_IMPROVEMENT`, publishes any approved follow-up artifacts, and proposes any actionable items as new trigger inputs when required. Synthesis closes the flow unconditionally. If any Owner follow-up is identified, the Curator files it as a new trigger input for a separate flow — not as an additional Owner session within this flow. Session B then ends.

**Owner as terminal node.** The Owner is the structural endpoint of the forward pass. Every flow reaches Step 5 before closure — the Owner receives the implementation output and any pending submissions, clears or redirects them, and explicitly acknowledges whether Curator follow-up remains. A flow that has not cleared the Owner has not closed.

### The human's role at each transition

At each pause point, the active agent should:
1. Provide a copyable path to the artifact it produced
2. Tell the human which session to switch to
3. State what the receiving agent needs to read

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
