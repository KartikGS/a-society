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

Coordination protocols belong in a dedicated folder because they apply to all roles simultaneously. When a sub-agent needs to know how to report a blocker, it should not have to read the Tech Lead role document. When a Tech Lead needs to know what constitutes a valid escalation, it should not have to infer it from the BA's closure checklist.

---

## Core Documents in a Coordination Folder

Every project with multiple roles needs at minimum:

### 1. Handoff Protocol

The handoff protocol defines:

- **Status vocabulary** — the canonical set of status tokens used across all handoff artifacts. Every agent uses exactly these tokens; natural-language descriptions of state are not permitted in artifacts. Define the full set: what each token means, when it applies, and what constitutes a valid transition.
- **Handoff format requirements** — what each handoff artifact must contain for the receiver to act. Reference the conversation templates; do not duplicate them here.
- **Receiver confirmation** — what the receiving role must do before beginning work. Typically: acknowledge receipt, confirm the task is well-defined, and raise concerns before starting.
- **Bidirectional clarification rules** — can agents exchange rounds of questions and responses before the receiver acts? If yes, define the structure (rounds, recording requirements, escalation threshold). If no, define the alternative.
- **Pre-replacement checks** — before overwriting a live artifact, what evidence must confirm the prior unit of work is closed? Define the check procedure.
- **Scope override synchronization** — if scope changes after handoffs are issued, which artifacts must be updated in what order before implementation resumes?

### 2. Feedback Protocol

The feedback protocol defines what agents do when they discover something wrong in someone else's work:

- **Discovery conditions** — what types of discovery require a feedback response (missing contract, false assumption, logical flaw)?
- **Reporting path** — which artifact does the discovering agent update, and with what structure?
- **Halt requirement** — does the discovering agent halt the affected implementation, or continue while flagging?
- **Resolution owner** — who receives the feedback and who decides how to resolve it?
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
For each role-pair transition: what artifact carries the handoff, what it must contain, what the receiver confirms before acting. Add the bidirectional clarification rules and the pre-replacement check procedure.

**Step 3 — Write the feedback protocol.**
Define the discovery conditions, the reporting path (which file, what structure), the halt requirement, and the priority rule. Make the priority rule unambiguous — if it requires judgment, it will be applied inconsistently.

**Step 4 — Write the conflict-resolution document.**
Define the authority matrix per decision type. Name the escalation path explicitly. Define the human escalation threshold so that agents do not over-escalate (paralyzing the human) or under-escalate (resolving things they lack authority to resolve).

**Step 5 — Confirm internal consistency.**
Check that the handoff protocol, feedback protocol, and conflict-resolution document use the same status vocabulary and reference the same roles. Inconsistency here creates the coordination failures the protocols are meant to prevent.

---

## Format Rules

- **Coordination protocols are mandatory and invariant.** Write rules as requirements, not suggestions. Use "must" and "must not," not "should" and "may."
- **Name every rule.** Short names allow precise reference in handoffs and reports ("per the Halt Requirement in the Feedback Protocol"). Unnamed rules cannot be cited.
- **Keep the documents stable.** Coordination protocols that change frequently are a sign the process has not been decided. Decide the process, then write it down. Refine deliberately, not reactively.
- **Do not merge the three documents.** Each answers a distinct question. A single combined document grows unwieldy and makes it hard to locate the relevant rule under pressure.

---

## What Makes a Coordination Layer Fail

**No shared status vocabulary.** Agents describe state differently. One agent's "done" is another's "pending verification." The workflow stalls at every handoff while roles negotiate what the status means.

**Protocols embedded in role documents.** Each role follows its own half of the protocol. When a conflict arises between two roles, there is no shared document either can cite.

**Feedback protocol absent.** When an agent discovers a problem, it has two options: silently work around it (losing traceability and potentially compounding the problem) or stop without knowing what to do (blocking the workflow). Both are worse than a protocol.

**Conflict resolution undefined.** Agents either escalate everything to the human (friction, bottleneck) or resolve everything themselves (authority overreach, invisible decisions). Neither is sustainable across a long-running project.
