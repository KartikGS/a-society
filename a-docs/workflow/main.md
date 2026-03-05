# A-Society: Workflow

This document describes how work moves through the A-Society project — from a need being surfaced to content existing in the right place, registered, and ready for adopters. Read this when you need to know what happens next, who owns a step, or when to escalate.

---

## What A-Society Work Is

A-Society's work is framework development: growing, maintaining, and quality-gating a reusable library of agent-documentation patterns. Unlike software projects, there is no user-facing deliverable to ship per change request — the deliverables are improvements to `general/` and `agents/`, which adopting projects consume directly.

Work is triggered by one of three sources:
- The human identifies a need or direction change
- The Curator observes a reusable pattern in a project using the framework
- A meta-improvement cycle produces a recommendation (see `$A_SOCIETY_IMPROVEMENT_PROTOCOL`)

---

## Phases

### Phase 1 — Observation

A need is surfaced. No formal artifact is required. The Curator or human names a specific gap, proposed addition, or maintenance problem.

**Entry condition:** Any of the trigger sources above identifies a specific need.
**Owner:** Human or Curator.
**Output:** A stated need — described in conversation or in a Curator observation note.

---

### Phase 2 — Proposal

The Curator (for `general/` additions and maintenance) or human (for direction decisions) formulates a proposed change with rationale.

For `general/` additions, the proposal must include:
1. What the artifact is and what problem it solves
2. Which project(s) the pattern was observed in
3. Why it generalizes — the case that it applies equally to a software project, a writing project, and a research project

**Entry condition:** A stated need from Phase 1.
**Owner:** Curator for `general/` and maintenance proposals; Human for direction changes.
**Output:** Draft content and written rationale, presented to the Owner.

---

### Phase 3 — Owner Review

The Owner applies the five review tests to any proposed `general/` addition:

1. **Generalizability test** — Does this apply equally to software, writing, and research projects?
2. **Abstraction level test** — Is this the right level? Not so specific it assumes a domain; not so vague it is unactionable?
3. **Duplication test** — Does this overlap with existing content? If so, extend rather than create.
4. **Placement test** — Does the target folder's governing principle (per `$A_SOCIETY_STRUCTURE`) include this?
5. **Quality test** — Is this written so an unfamiliar agent can read it and produce a correct artifact?

**Decision:** Approved / Rejected / Revise.

**Entry condition:** A proposal from Phase 2.
**Owner:** Owner.
**Output:** An explicit decision — stated in conversation. No approval means no implementation.

---

### Phase 4 — Implementation

Approved content is created or modified. The Curator writes the content at the correct location per `$A_SOCIETY_STRUCTURE`.

**Entry condition:** Owner approval from Phase 3.
**Owner:** Curator.
**Output:** File(s) created or updated at correct locations.

---

### Phase 5 — Registration

New files are registered in the appropriate index. The agent-docs-guide is updated if a new `a-docs/` file was created.

- Content in `general/` or `agents/` → register in `$A_SOCIETY_PUBLIC_INDEX`
- Content in `a-docs/` → register in `$A_SOCIETY_INDEX`
- New `a-docs/` files → add a rationale entry to `$A_SOCIETY_AGENT_DOCS_GUIDE`

**Entry condition:** Implementation complete.
**Owner:** Curator.
**Output:** Updated index row(s); updated agent-docs-guide entry if applicable. The session is not complete until registration is done.

---

## Handoffs

| Transition | What carries it | What the receiver checks |
|---|---|---|
| Observation → Proposal | Conversational description of the need | Need is specific enough to act on |
| Proposal → Review | Draft content + rationale from Curator | All three proposal elements present (what, where observed, why it generalizes) |
| Review → Implementation | Owner's explicit approval | Approval stated — absence of objection is not approval |
| Implementation → Registration | File exists at correct path | Correct index is updated before session closes |

---

## Invariants

**1. Portability Invariant**
No content enters `general/` without the Owner confirming it passes the generalizability test. If the test cannot be confirmed, the content stays in a project-specific folder until it can be.

**2. Approval Invariant**
The Curator does not write to `general/` without Owner approval. Every addition to the general library is reviewed before creation. Drafting is permitted; creating is not.

**3. Single-Source Invariant**
Information lives in exactly one file. Cross-references use `$VARIABLE_NAME` from the relevant index. Hardcoded paths are not permitted in any document. When the same information would belong in two places, make one the source and the other a reference.

**4. Index-Before-Reference Invariant**
A file must be registered in the relevant index before any document references it by variable name. Register first, then write the reference.

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
