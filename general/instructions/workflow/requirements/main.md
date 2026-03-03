# How to Create a Requirements Document

## What Is a Requirements Document?

A requirements document (or CR template) defines how change requests and work items are captured, structured, and governed within a project. It answers:

> "When someone wants something to change, how is that desire converted into a clear, scoped, executable specification that agents can act on?"

A requirements document is not a plan. Plans describe how to execute known work. Requirements describe *what* needs to change, *why* it needs to change, and *how success will be verified* — before any implementation begins.

Requirements serve as:
1. **The contract between the requester and the executor** — what was agreed before work began.
2. **The acceptance baseline** — what must be true for the work to be considered done.
3. **The historical record** — the permanent, immutable account of what was intended, what was built, and what evidence confirmed it.

---

## Why Every Project Needs One

Without a standard requirements structure, work items accumulate ambiguity. The executor interprets the request, the requester expected something different, and the resulting discussion happens after implementation rather than before it.

Standardized requirements force clarity upfront:
- The acceptance criteria are defined before work begins, not after.
- Constraints are explicit, so the executor does not discover them mid-implementation.
- The status model is defined, so everyone knows what "done" means.
- Historical records are preserved, so future agents can understand why a decision was made.

**Requirements are not bureaucracy — they are the agreement that makes delegation safe.**

---

## What Belongs in a Requirements Document

A requirements document for any project should cover:

### 1. Status (mandatory)
What is the current lifecycle state of this work item? Define a small, explicit status vocabulary (e.g., Draft, In Progress, Done, Blocked). Every requirement must have a status. Without it, agents cannot know whether to act on it or treat it as history.

### 2. Business Context (mandatory)
Why does this change need to happen? Who benefits and how? This section connects the work to the project's purpose. An executor who understands the "why" can make better implementation decisions than one who only knows the "what."

### 3. Functional Requirements (mandatory)
What must the system do? State requirements as observable behaviors, not implementation choices. "The user can filter results by date" is a functional requirement. "Use a date-picker component" is an implementation choice — it belongs in the plan, not the requirements.

### 4. Non-Functional Requirements (mandatory when applicable)
What constraints must the implementation satisfy? Performance bounds, security requirements, accessibility standards. These are as binding as functional requirements but are often omitted because they are assumed. Write them down.

### 5. Acceptance Criteria (mandatory)
What specific, verifiable conditions must be true for this requirement to be considered done? Each AC must be independently verifiable. Vague ACs ("it should work well") are not ACs — they are intentions. Rewrite them until a third party could confirm them without interpretation.

### 6. Verification Mapping (mandatory)
How will each AC be verified? Name the command, file, or procedure that produces the verification evidence. This section converts ACs from a wishlist into a checklist.

---

## What Does NOT Belong

- **Implementation details** — how to satisfy the requirements belongs in a plan.
- **Discovery findings** — investigation results belong in a report.
- **Historical records from other requirements** — each requirement artifact is self-contained.

---

## Naming, Storage, and Governance

Requirements should be stored in a `workflow/requirements/` folder within the project's agent-docs. Key governance rules:

### Naming
Define a consistent naming convention: `[TYPE]-[ID]-[slug].md` (e.g., `CR-007-pipeline-stabilization.md`). IDs should be strictly increasing and never reused.

### Status Lifecycle
Define the complete status vocabulary and the transitions between states. Define what closure looks like and what makes a status change permanent.

### Historical Integrity
Once a requirement is closed:
- It is immutable by default. Do not retroactively update ACs, scope, or intent.
- Minor corrections (typos, broken links, factual errors) are permitted with an amendment log entry.
- If a closed requirement has gaps, create a new requirement that references the original — do not rewrite history.

### Retention Policy
Closed requirements are retained permanently. They are the historical record of the project's decisions. Deletion requires explicit authorization and is not a routine operation.

---

## How to Write a Requirements Template

**Step 1 — Define the status vocabulary.**
List every possible status. For each status, define its meaning and the conditions for entering and leaving it. Limit the vocabulary to what the project actually needs — more statuses create more ambiguity, not less.

**Step 2 — Write the Business Context prompt.**
The most common failure in requirements is skipping the "why." The prompt for Business Context should explicitly ask: Who benefits? What problem does this solve? What gets worse if this is not done?

**Step 3 — Define the AC format.**
Acceptance criteria must be verifiable. The template should show what a verifiable AC looks like vs. a non-verifiable one, and provide a format for evidence annotation at closure.

**Step 4 — Add domain-specific sections.**
Some project types need additional sections: baseline failure snapshots for regression work, constraint mapping for architecture-constrained projects, dependency tracking for inter-team work. Add these as clearly labeled, conditional sections.

**Step 5 — Define the amendment log format.**
When a closed requirement needs a correction, how is it recorded? The amendment log format should be simple: date, reason, what changed.

---

## Format Rules

- **Present tense for requirements.** "The system accepts..." not "The system will accept..." Requirements describe the desired state, not a future aspiration.
- **Verifiable ACs.** Each AC should be expressible as a test: "Given X, when Y, then Z." If it cannot be expressed this way, it is not an AC — it is a goal.
- **Status is always present.** A requirements artifact without a status is not a requirements artifact. Make status the first field.
- **Immutability after closure.** The template should make it clear that closed requirements are historical records, not living documents. This is enforced by convention and the amendment log, not by technical locks.

---

## Examples Across Project Types

### Software project
- **Status vocabulary**: Draft → Clarified → In Progress → Done → Blocked
- **AC format**: Checkboxes with evidence annotations at closure (`[x] AC text — Verified: command, result`)
- **Domain-specific sections**: Baseline failure snapshot for regressions; environment variable changes; technical analysis section for complex work

### Research project
- **Status vocabulary**: Proposed → Active → Completed → Abandoned
- **AC format**: Observable outcomes ("Dataset X shows statistically significant Y at p < 0.05")
- **Domain-specific sections**: Research question, hypotheses, evidence requirements

### Editorial / writing project
- **Status vocabulary**: Brief → In Review → Approved → Published
- **AC format**: Content checklist items plus reader-outcome assertions ("A reader who finishes this section can distinguish X from Y")
- **Domain-specific sections**: Audience definition, editorial constraints, publication target
