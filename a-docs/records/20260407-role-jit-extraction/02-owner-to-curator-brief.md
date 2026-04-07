# Owner → Curator: Briefing

**Subject:** role-jit-extraction — Apply adocs design principles JIT extraction to all remaining role documents
**Status:** BRIEFED
**Date:** 2026-04-07

---

## Agreed Change

The adocs design principles (`$A_SOCIETY_ADOCS_DESIGN`) were established in the previous flow and partially applied to the Owner role. The same principles have not been applied to the Technical Architect, Curator, Tooling Developer, or Runtime Developer roles. Additionally, the Owner role has three remaining violations identified in this flow's analysis. This brief scopes the full application across all five roles.

**Principle violations being corrected:**

- **P1 (load only what's needed at session start):** TA advisory standards (~50 rules) are loaded at every TA session regardless of session type. Tooling Developer loads the full proposal and addendum at every session regardless of whether boundary questions arise.
- **P2 (no redundancy with injected context):** Owner role duplicates the multi-domain routing instruction from `$A_SOCIETY_WORKFLOW` and the complexity assessment pointer from workflow Phase 0.
- **P3 (workflow-conditional instructions belong in phase documents):** TA integration-review-specific rules are inline in the role doc; Curator implementation practices are loaded at proposal stage even when only proposal guidance is needed.
- **P4 (role docs are routing guides only):** All five roles have inline instructions that should be JIT documents with role-doc routing pointers.

**Files Changed:**

| Target | Action |
|---|---|
| `$A_SOCIETY_OWNER_ROLE` | modify — three P2/P4 removals; two JIT extractions; one trigger fix |
| `a-docs/roles/owner/log-management.md` (new → `$A_SOCIETY_OWNER_LOG_MANAGEMENT`) | additive — JIT document: merge assessment procedure and log-management obligations |
| `a-docs/roles/owner/review-behavior.md` (new → `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`) | additive — JIT document: "How the Owner Reviews an Addition" + "Review Artifact Quality" |
| `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | modify — replace "## Advisory Standards" with JIT pointer(s) |
| `a-docs/roles/technical-architect/` subfolder (new file(s)) | additive — JIT document(s): advisory standards content; Curator to propose names and decomposition |
| `$A_SOCIETY_CURATOR_ROLE` | modify — extract "## Implementation Practices"; remove "## Current Active Work"; evaluate "## Standing Checks" |
| `a-docs/roles/curator/implementation-practices.md` (new → `$A_SOCIETY_CURATOR_IMPL_PRACTICES`) | additive — JIT document: Curator implementation practices |
| `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` | modify — extract "## Implementation Discipline"; evaluate "## Escalation Triggers" |
| `a-docs/roles/runtime-developer/implementation-discipline.md` (new → `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`) | additive — JIT document: Runtime Developer implementation discipline |
| `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` | modify — extract "## Tooling Invocation Discipline"; evaluate "## Escalation Triggers"; add JIT pointer to proposal/addendum |
| `a-docs/roles/tooling-developer/invocation-discipline.md` (new → `$A_SOCIETY_TOOLING_DEV_INVOCATION`) | additive — JIT document: Tooling Developer invocation discipline and completion report format |
| `$A_SOCIETY_REQUIRED_READINGS` | modify — remove `$A_SOCIETY_TOOLING_PROPOSAL` and `$A_SOCIETY_TOOLING_ADDENDUM` from the `tooling-developer` required-reading list |
| `$A_SOCIETY_INDEX` | additive — register all new JIT documents |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | additive — add entries for all new a-docs files |

All items require Owner approval before implementation. No items are designated `[Curator authority — implement directly]`.

---

## Scope

**In scope:**
- All five role files in `a-docs/roles/`: Owner, Technical Architect, Curator, Tooling Developer, Runtime Developer
- New JIT documents created under `a-docs/roles/[role]/` subfolders
- `$A_SOCIETY_REQUIRED_READINGS` revision for Tooling Developer
- Index and agent-docs-guide registration for all new files

**Out of scope:**
- `general/` counterparts (`$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`, `$GENERAL_TA_ROLE`) — tracked separately as existing Next Priority items
- No framework update report — this flow makes no changes to `general/` content
- Content changes to extracted sections — content moves verbatim; no rewrites in this flow
- `$A_SOCIETY_TOOLING_PROPOSAL` and `$A_SOCIETY_TOOLING_ADDENDUM` themselves — only the required-readings entry and role doc pointer change

---

## Owner Directions (Design Decisions)

The following are Owner decisions — not open questions for the Curator.

**1. Owner role: P2 removals (two clauses in the "Workflow routing" bullet)**

Remove the clause `and $INSTRUCTION_WORKFLOW_COMPLEXITY for tier selection and intake procedure` from the workflow-routing bullet. The reference already exists in Phase 0 of each workflow document; the Owner role mention is redundant.

Remove the sentence beginning "When work spans multiple role types or implementation domains, design a single flow..." from the same bullet. This text already exists in `$A_SOCIETY_WORKFLOW` (the workflow directory) and in `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`. Both appearances are redundant with the role doc.

After removal, the workflow-routing bullet should read only: "When the user makes a request, read `$A_SOCIETY_WORKFLOW` to route it."

**2. Owner role: TA advisory trigger fix**

The current trigger "When reviewing a TA advisory, read `$A_SOCIETY_OWNER_TA_REVIEW`" does not fire for TA integration reports (the artifact type at integration gates is `ta-integration-report` or `ta-assessment`, not a "TA advisory"). Broaden to: "When reviewing a TA advisory or TA integration report, read `$A_SOCIETY_OWNER_TA_REVIEW`."

**3. Tooling Developer required readings**

Remove `$A_SOCIETY_TOOLING_PROPOSAL` and `$A_SOCIETY_TOOLING_ADDENDUM` from the Tooling Developer's session-start required-reading list in `$A_SOCIETY_REQUIRED_READINGS`. These are heavy documents needed only when a scope boundary question arises, not at every session start. In the Tooling Developer role doc, add a JIT pointer: "When you need to understand automation scope boundaries or original component specifications, consult `$A_SOCIETY_TOOLING_PROPOSAL` and `$A_SOCIETY_TOOLING_ADDENDUM`."

**4. New JIT document location pattern**

Follow the `a-docs/roles/owner/` subfolder pattern established in the previous flow. Create `a-docs/roles/technical-architect/`, `a-docs/roles/curator/`, `a-docs/roles/runtime-developer/`, and `a-docs/roles/tooling-developer/` subfolders as needed.

**5. Proposed variable names**

These are Owner-proposed names. Curator may suggest alternatives in the proposal:
- `$A_SOCIETY_OWNER_LOG_MANAGEMENT` — Owner log-management and merge assessment JIT doc
- `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR` — Owner review-behavior surface JIT doc
- `$A_SOCIETY_CURATOR_IMPL_PRACTICES` — Curator implementation practices JIT doc
- `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE` — Runtime Developer implementation discipline JIT doc
- `$A_SOCIETY_TOOLING_DEV_INVOCATION` — Tooling Developer invocation discipline JIT doc
- TA variable name(s): Curator to propose based on decomposition structure chosen

**6. Curator "Current Active Work" removal**

Remove the "## Current Active Work" section from `$A_SOCIETY_CURATOR_ROLE` entirely. It contains "LLM Journey Migration — Complete" — project state, not routing guidance. It does not belong in a role document.

---

## Open Questions for the Curator

**OQ-1 — TA advisory standards decomposition.**
Read the full "## Advisory Standards" section in `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`. Propose a decomposition structure: one JIT document or multiple? If multiple, what is the dividing principle (phase type: design vs. integration review; or topic: output specification, pre-work verification, interface specification, multi-path coverage, etc.)? The Owner's preference is to keep the decomposition minimal — one or two documents rather than many. The Curator should propose what produces the clearest JIT trigger conditions in the role doc.

**OQ-2 — Curator "Standing Checks" (inline vs. JIT).**
The Curator role doc has a "## Standing Checks" section with two checks: cross-layer consistency and cross-item consistency. Evaluate: do these apply specifically to the proposal or implementation phase (in which case extract to JIT), or do they apply to all Curator work regardless of phase (in which case they are universal role invariants and may stay inline as non-routing guidance). Propose with rationale.

**OQ-3 — Developer "Escalation Triggers" (inline vs. JIT).**
Both the Tooling Developer and Runtime Developer role docs have "## Escalation Triggers" sections. These follow a "when X, escalate to Y" pattern — similar to the "Escalate to Owner When" sections all roles have, which remain inline. Evaluate: are these universal role-level routing instructions (keep inline as consistent with other roles' escalation sections), or phase-specific instructions better extracted? Propose a consistent treatment for both Developer roles.

---

## Downstream Propagation

New JIT documents created under `a-docs/roles/[role]/` are new a-docs files. For each:
- Register in `$A_SOCIETY_INDEX` with a one-clause description
- Add an entry to `$A_SOCIETY_AGENT_DOCS_GUIDE` with rationale and "Do not consolidate with" guidance

`$A_SOCIETY_REQUIRED_READINGS` revision for Tooling Developer: confirm the yaml parses correctly after removal of the two entries.

No `$GENERAL_MANIFEST` update needed — the manifest covers initialized project a-docs/ shape, not A-Society's own internal role infrastructure.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for role-jit-extraction."
