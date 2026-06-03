# How to Create Coordination Protocols

## What Are Coordination Protocols?

Coordination protocols are the standing rules that govern how agents communicate. Where the conversation layer defines the *artifacts* agents exchange, the coordination layer defines the *rules* under which that exchange happens:

- What status vocabulary do all agents share?
- When is a handoff considered complete?
- What does an agent do when it cannot proceed?
- Who has authority when two agents disagree?
- How does a discrepancy get reported and resolved?

Coordination protocols are durable. They do not change per task or per CR. They change only when the underlying process changes — and that change requires deliberate review, not ad-hoc modification during execution.

---

## Why Coordination Protocols Are Separate From Role Documents

A common mistake is embedding protocol rules inside role documents. The result: each role knows the protocol only from its own perspective. Conflicts between roles — the exact situations protocols exist to resolve — are governed by documents that never speak to each other.

Coordination protocols belong in a dedicated folder because they apply to all roles simultaneously. Any role needing to know how to report a blocker or raise an escalation should find the answer here — not by reading another role's document.

---

## Core Documents in a Coordination Folder

Every project with multiple roles needs at minimum:

### 1. Handoff Protocol

The handoff protocol defines:

- **Status vocabulary** — the canonical set of status tokens used across all handoff artifacts. Every agent uses exactly these tokens; natural-language descriptions of state are not permitted in artifacts. Define the full set: what each token means, when it applies, and what constitutes a valid transition.
- **Handoff format requirements** — what each handoff artifact must contain for the receiver to act. Reference the conversation templates; do not duplicate them here.
- **Receiver confirmation** — what the receiving role must do before beginning work. Typically: acknowledge receipt, confirm the task is well-defined, and raise concerns before starting.
- **Bidirectional clarification rules** — can agents exchange rounds of questions and responses before the receiver acts? If yes, define the structure (rounds, recording requirements, escalation threshold). If no, define the alternative.
- **Scope override synchronization** — if scope changes after handoffs are issued, which artifacts must be updated in what order before implementation resumes?

### 2. Correction Protocol

The correction protocol defines what agents do when they discover something wrong in someone else's work:

- **Discovery conditions** — what types of discovery require a correction response (missing contract, false assumption, logical flaw)?
- **Reporting path** — which artifact does the discovering agent update, and with what structure?
- **Halt requirement** — does the discovering agent halt the affected implementation, or continue while flagging?
- **Resolution owner** — who receives the correction and who decides how to resolve it?
- **Priority rule** — is resolving a discovered flaw higher or lower priority than completing the current task? (It must be higher. Make this explicit.)

### 3. Conflict Resolution

The conflict-resolution document defines what happens when two agents disagree:

- **Escalation path** — who receives the escalation, and what information must it include?
- **Authority matrix** — which role has final authority over which type of decision? (Technical feasibility, scope, business logic, process, architecture.)
- **Human escalation threshold** — what conditions require human resolution rather than agent resolution?

---

## What Does NOT Belong in Coordination

- **Artifact templates** — those belong in `conversation/`
- **Role-specific behavior** — what a specific agent does in each phase belongs in its role document
- **Workflow phase definitions** — the sequence of phases belongs in the workflow document
- **Historical protocol versions** — once a protocol is superseded, archive the old version; do not rewrite it to match the new one

---

## How to Create Coordination Protocols

**Step 1 — Define the status vocabulary first.**
Everything else depends on it. Write the canonical set of status tokens before writing any protocol. Include: name, meaning, valid prior states, and valid next states. Keep the set minimal — every token must be distinguishable from all others, and agents must be able to apply the right token without deliberation.

**Step 2 — Write the handoff protocol.**
For each role-pair transition: what artifact carries the handoff, what it must contain, what the receiver confirms before acting. Add the bidirectional clarification rules.

**Step 3 — Write the correction protocol.**
Define the discovery conditions, the reporting path (which file, what structure), the halt requirement, and the priority rule. Make the priority rule unambiguous — if it requires judgment, it will be applied inconsistently.

**Step 4 — Write the conflict-resolution document.**
Define the authority matrix per decision type. Name the escalation path explicitly. Define the human escalation threshold so that agents do not over-escalate (paralyzing the human) or under-escalate (resolving things they lack authority to resolve).

**Step 5 — Confirm internal consistency.**
Check that the handoff protocol, correction protocol, and conflict-resolution document use the same status vocabulary and reference the same roles. Inconsistency here creates the coordination failures the protocols are meant to prevent.

---

## Maintenance Rules

Copy these rules into the project's `coordination/main.md` at initialization. They govern how the coordination layer is updated over its lifetime.

- **Update when the process changes — not when individual flows deviate.** Coordination protocols reflect the standing process. If one flow ran differently, that is a record-level observation, not a protocol update.
- **When a status token proves ambiguous in practice, refine its definition.** A token that agents apply inconsistently is wrong. Fix the definition rather than tolerating the inconsistency.
- **When a new role is added, update the authority matrix and correction protocol.** New roles create new authority boundaries and new correction paths. Protocols that do not account for a role will be applied inconsistently by that role.
- **Keep protocols stable.** Protocols that change frequently signal that the process has not been decided. Decide the process, then write it down. Deliberate revision is acceptable; reactive churn is not.
- **Check that protocol rules are not duplicated in role documents.** Each role should know only its own behavior; the shared rules belong here. If a role document has grown to include protocol detail, move it.
- **Check that the correction protocol is still complete.** If new discovery conditions have emerged that are not covered, add them. A gap in the correction protocol means agents will either silently work around problems or block without knowing what to do.
- **Write rules as requirements, not suggestions.** Use "must" and "must not," not "should" and "may." A protocol stated as a preference will not be followed consistently.
- **Name every rule.** Short names allow precise reference in handoffs ("per the Halt Requirement in the Correction Protocol"). Unnamed rules cannot be cited.
- **Do not merge the handoff protocol, correction protocol, and conflict-resolution document.** Each answers a distinct question. A merged document becomes unwieldy and makes it hard to locate the relevant rule under pressure.
