# A-Society: Handoff Protocol

## Status Vocabulary

All agents use exactly these tokens to describe the state of a work item. Natural-language state descriptions are not permitted in conversation artifacts.

| Token | Meaning | Valid prior states | Valid next states |
|---|---|---|---|
| `BRIEFED` | Owner has written a briefing for the Curator; Curator has not yet acknowledged | `NO_ACTIVE_ITEM` | `DRAFT` |
| `DRAFT` | Curator has acknowledged the briefing and is preparing a proposal | `BRIEFED` | `PENDING_REVIEW` |
| `PENDING_REVIEW` | Submitted to Owner; awaiting decision | `DRAFT`, `REVISE` | `APPROVED`, `REVISE`, `REJECTED` |
| `APPROVED` | Owner approved; Curator may begin implementation | `PENDING_REVIEW` | `IN_PROGRESS` |
| `REVISE` | Owner requests revision; Curator must update and resubmit | `PENDING_REVIEW` | `PENDING_REVIEW` |
| `REJECTED` | Owner declined; item is closed | `PENDING_REVIEW` | — (terminal) |
| `IN_PROGRESS` | Curator is implementing the approved change | `APPROVED` | `REGISTERED` |
| `REGISTERED` | Implementation complete; indexes updated | `IN_PROGRESS` | `PUBLISHED` (if update report triggered), or terminal |
| `PUBLISHED` | Framework update report approved and published | `REGISTERED` | — (terminal) |
| `NO_ACTIVE_ITEM` | No work item currently in this artifact | — | `DRAFT` |

**Terminal states:** `REJECTED`, `REGISTERED` (when no update report triggered), `PUBLISHED`. A live artifact may only be replaced once the current item has reached a terminal state.

---

## Handoff Format Requirements

### Owner → Curator (Trigger → Phase 1: Briefing)
The `owner-to-curator-brief.md` artifact must contain all mandatory fields from `TEMPLATE-owner-to-curator-brief.md`:
- Subject / identifier
- Status: `BRIEFED`
- Agreed change (what was aligned on, rationale)
- Scope (in scope and out of scope)
- Likely target (using `$VAR` references)
- Open questions for the Curator

A briefing missing the Agreed Change or Scope fields is malformed. The Curator must not begin drafting until those fields are present.

A briefing cannot substitute for a Phase 2 decision artifact — pre-approval language in a briefing does not authorize implementation. The Curator must not begin implementation without an explicit `APPROVED` status in a Phase 2 decision artifact.

### Curator → Owner (Phases 1 and 4)
The `curator-to-owner.md` artifact must contain all mandatory fields from `TEMPLATE-curator-to-owner.md`:
- Subject / identifier
- Status: `PENDING_REVIEW`
- Type (Proposal, Update Report Submission, or Maintenance Change)
- Trigger
- What and why (including generalizability argument for `general/` additions)
- Where observed
- Target location (using `$VAR` references)
- Draft content — complete enough for the Owner to evaluate quality and correctness
- **Implementation Status** *(Update Report Submissions only)* — whether implementation is complete, which files were changed, and whether any publication condition remains outstanding

A submission missing any mandatory field is malformed. The Owner must not issue a decision on a malformed submission — return it as `REVISE` with the missing fields named.

### Owner → Curator (Phase 2)
The `owner-to-curator.md` artifact must contain all mandatory fields from `TEMPLATE-owner-to-curator.md`:
- Subject (must match the corresponding `curator-to-owner.md`)
- Status: `APPROVED`, `REVISE`, or `REJECTED`
- Rationale
- Implementation constraints (if APPROVED)
- Required changes (if REVISE) — numbered, specific, actionable

### Machine-Readable Handoff Block (all session pause points)

At every session pause point where natural-language handoff prose is produced, the agent must also emit a machine-readable handoff block. The block follows the prose and is emitted in the same output pass.

See `$INSTRUCTION_MACHINE_READABLE_HANDOFF` for the schema, field definitions, and a worked example.

---

## Receiver Confirmation

**Curator receiving an Owner briefing:** Before beginning Phase 1, the Curator must state in the session:
- "Briefing acknowledged. Beginning proposal for [Subject]."

**Curator receiving an Owner decision:** Before acting, the Curator must state in the session:
- If APPROVED: "Acknowledged. Beginning implementation of [Subject]."
- If REVISE: "Acknowledged. Will revise and resubmit."
- If REJECTED: "Acknowledged. Closing [Subject]."

**Owner receiving a Curator proposal:** The Owner must read the draft content in full before issuing a decision. A decision issued without reading the draft content is not valid.

---

## Clarification Rules

Clarification rounds are permitted before the Owner issues a decision. Rules:

1. The Curator may ask targeted questions about the review criteria in the session — not by modifying the submission artifact.
2. The Owner may request clarification on any field of the submission in the session — not by issuing a premature REVISE decision.
3. Clarification that changes the substance of the proposal must be reflected in an updated `curator-to-owner.md` before the Owner issues a final decision.
4. Clarification that only confirms intent (no substantive change) does not require an artifact update.

---

## Within-Flow Additional Submissions

When a flow requires an additional Curator → Owner submission after the main decision artifact — for example, an update report draft submitted after implementation is complete — the additional submission takes the next available sequence slot in the record folder, **before** backward-pass findings.

Backward-pass findings always occupy the final positions in the sequence. The standard positions (`04-curator-findings.md`, `05-owner-findings.md`) shift forward to accommodate any additional submissions. This is a specific instance of the general rule in `$A_SOCIETY_RECORDS`: "the sequence continues as long as the flow requires."

---

## Pre-Replacement Checks

Before overwriting a live artifact with a new unit of work:

**Before replacing `owner-to-curator-brief.md`:**
- The prior work item has reached a terminal state (REGISTERED, PUBLISHED, or REJECTED)
- The Curator has acknowledged closure of the prior item in the session

**Before replacing `curator-to-owner.md`:**
- The current item has reached `REJECTED` or `REGISTERED` (or `PUBLISHED` if an update report was triggered)
- `owner-to-curator.md` reflects a terminal decision for the prior item

**Before replacing `owner-to-curator.md`:**
- The Curator has acknowledged the prior decision in the session
- The prior item is either in `IN_PROGRESS` (implementation begun) or a terminal state

If a check fails, do not replace the artifact. Escalate to the Owner to confirm the prior item's status before proceeding.
