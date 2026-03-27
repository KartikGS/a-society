**Subject:** Runtime development structural setup — Runtime Developer role and Runtime Development workflow
**Status:** APPROVED
**Date:** 2026-03-27

---

## Decision

APPROVED — with implementation constraints. See below.

---

## Rationale

Both documents were evaluated against the review tests applicable to `a-docs/` additions (the generalizability test does not apply — no `general/` content). The coupling test and manifest check do not apply for the same reason.

**Placement test:** Both files belong in `a-docs/` — correct. The Runtime Developer is an A-Society internal role (implements A-Society's own layer, not something adopting projects run). The workflow governs A-Society's own operational process. Structure document and architecture document both support these placements.

**Duplication test:** No duplication. The Runtime Developer is distinct from the Tooling Developer in both scope (`runtime/` vs. `tooling/`) and implementation character (stateful session orchestrator vs. deterministic utility). The Runtime Development workflow is distinct from the Tooling Dev workflow in its Phase 0 design gate structure.

**Abstraction level test:** Both documents are at the right level. The role doc is scoped tightly to execution authority and escalation. The workflow doc correctly separates Phase 0 (fully specified) from implementation phases (deferred to Phase 0 output).

**Quality test:** The workflow document passes — Phase 0 is fully specified, the placeholder is explicitly labelled, the session model and gates are present. The role document passes for direction and scope but fails quality on structural completeness: several sections present in the Tooling Developer role are missing. The implementation constraints below are mandatory additions before the role document is created.

**Variable names:** `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` and `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` are approved.

**Placeholder approach (Open Question 2):** The fully-open placeholder is approved. The Curator's rationale is correct — the runtime layer's execution characteristics are genuinely different from the tooling layer, and pre-assuming a phase count or parallel structure would constrain the TA's architectural design. The workflow document is structurally valid with the placeholder as written.

---

## Implementation Constraints

### A. `a-society/a-docs/roles/runtime-developer.md`

The draft is directionally correct but is missing several sections present in `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`. These are not optional — they are the standard for A-Society execution role documents. Add all of the following before creating the file:

**1. Record-folder exception in the "Write to `runtime/` only" hard rule.**
The Tooling Developer hard rule includes: "Record-folder exception: The Developer is authorized to write record-folder artifacts required by this role — specifically completion reports and backward pass findings in the active record folder. This exception does not extend to any other file under `a-docs/`." Add the equivalent for the Runtime Developer, adapting the artifact names.

**2. "Never hardcode a file path" hard rule.**
Add: if a path is registered in `$A_SOCIETY_INDEX` or `$A_SOCIETY_PUBLIC_INDEX`, use its variable name. If a path needed in code or documentation is not yet indexed, flag to the Curator before proceeding. This rule is present in the Tooling Developer and applies equally here.

**3. "Do not open a Developer session before Phase 0 clears" hard rule — add gate conditions list.**
The current draft states the rule but does not enumerate what Phase 0 clearing requires. Add the conditions: (a) this role document is approved and indexed; (b) `$A_SOCIETY_ARCHITECTURE` reflects the runtime layer as a confirmed implementation target; (c) the Runtime Architecture Design document is approved by the Owner. (Note: condition (c) corresponds to the Phase 0 gate in the workflow, which is the equivalent of the documentation artifacts gate in the Tooling Dev flow.)

**4. Context loading note.**
After the context loading list, add a note explaining why broader framework documents (vision, structure, principles, a-docs-guide) are not required reading for this role. Model on the Tooling Developer: "The Developer makes no framework placement or policy decisions; loading those documents adds context cost without enabling any authorized decision."

**5. Handoff Output section.**
Add a Handoff Output section equivalent to the one in `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`. Adapt the pause points and completion report requirement for the runtime layer:
- After completing a phase and before beginning the next — handoff status to the human for orchestration
- When a deviation is identified — immediately escalate to TA; include the specific deviation and what decision is needed
- After integration testing passes — handoff to Owner for the integration gate; include the integration test record and TA assessment
- Completion report requirement: upon completing a phase's implementation work, the Developer produces `NN-developer-completion.md` in the active record folder at the next available sequence position, covering: what was implemented; any deviations and their resolution status; whether the approved design requires update as a result

**6. Escalation Triggers section (replace "Escalation Path").**
The two-bullet "Escalation Path" section is insufficient. Replace it with a full "Escalation Triggers" section matching the Tooling Developer pattern, including:
- Design deviation → escalate to TA immediately; halt implementation on affected component
- TA determines design change required → TA escalates to Owner; Developer waits for Owner approval
- Scope ambiguity → escalate to TA before proceeding
- Documentation gap discovered → flag to Curator; do not make the change unilaterally
- Phase 0 gate incomplete → do not open a Developer session; notify the human

---

### B. `a-society/a-docs/workflow/runtime-development.md`

**1. Backward Pass section.**
Add a Backward Pass section after the Forward Pass Closure phase, analogous to the one in `$A_SOCIETY_WORKFLOW_TOOLING_DEV`:

> Backward pass is mandatory after forward-pass completion and is governed by `$A_SOCIETY_IMPROVEMENT`; it is not a workflow phase and is not represented as workflow graph nodes.

Then add a note on backward pass traversal order: because implementation phase nodes in the YAML graph are a placeholder, the full backward pass traversal order cannot be computed until Phase 0 produces the architecture design and the graph is completed. At that point, Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) should be used.

**2. Session model — note on table completion.**
The session model section lists the three sessions and TA modes but omits the phases-per-session table present in the Tooling Dev workflow. This is expected given the implementation phases are TBD. Add an explicit note: the full session model table (sessions × phases) will be populated when Phase 0 produces the architecture design and implementation phases are defined.

---

### C. `$A_SOCIETY_WORKFLOW` entry format

The current `$A_SOCIETY_WORKFLOW` (workflow/main.md) uses `### [Name]` + `**Summary:**` + `**File:**` for each entry. Use the same format — not a bulleted list. Model:

```
### Runtime Development

**Summary:** Designing and building A-Society's programmatic runtime orchestration layer — from Phase 0 TA architecture design through implementation, integration validation, registration, and closure.

**File:** `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`
```

---

### D. `$A_SOCIETY_INDEX` description for `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`

Update the description to mention the YAML graph for consistency with other workflow entries:

> `A-Society runtime development workflow — Phase 0 architecture design gate, placeholder implementation phases, session model, and YAML graph for the programmatic runtime implementation loop`

---

### E. Implementation order (Index-Before-Reference Invariant)

When implementing, register both variables in `$A_SOCIETY_INDEX` **before** writing the `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` reference into `$A_SOCIETY_WORKFLOW`. A document may not reference a variable that is not yet registered.

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL`. Both new files are `a-docs/` additions — no `general/` content is created or modified. Record the determination and rationale in the Curator's backward-pass findings. No separate submission artifact is required if no report is triggered.
2. **Backward pass:** Backward pass findings are required from both roles.
3. **Version increment:** Only if an update report is produced.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Runtime development structural setup — Runtime Developer role and Runtime Development workflow."

The Curator does not begin implementation until they have acknowledged in the session.
