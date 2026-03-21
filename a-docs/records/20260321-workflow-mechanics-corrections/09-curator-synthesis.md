# Curator Synthesis: 20260321-workflow-mechanics-corrections

**Date:** 2026-03-21
**Role:** Curator
**Position:** Backward pass, final step (3 of 3)

---

## Findings Routing

| Finding | Source | Route | Rationale |
|---|---|---|---|
| Forward pass closure "complete = executed, not approved" — `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 5 Work | Owner finding 1 | Implemented | Targeted clarification warranted; within `a-docs/` |
| Forward pass closure "complete = executed, not approved" — `$A_SOCIETY_IMPROVEMENT` Guardrails | Owner finding 1 | Implemented | A-Society instantiation; within `a-docs/` |
| Forward pass closure "complete = executed, not approved" — `$GENERAL_IMPROVEMENT` | Owner finding 1 | Next Priorities (written) | LIB change |
| Brief-writing obsoletes check — `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality | Owner finding 2 / Curator finding 3 | Implemented | Owner explicitly routed to Curator synthesis; within `a-docs/` |
| Brief-writing obsoletes check — `$GENERAL_OWNER_ROLE` | Owner finding 2 / Curator finding 3 | Next Priorities (written) | LIB change |
| Format fallback when template removed mid-flow — `$A_SOCIETY_UPDATES_PROTOCOL` | Owner finding 3 | Implemented | One sentence; gap is real and specific; within `a-docs/` |
| Cross-item stale content check — `$A_SOCIETY_CURATOR_ROLE` Standing Checks | Curator finding 2 / Owner finding 2 (validated) | Implemented | Implicit expectation made explicit; within `a-docs/` |
| Session Model Step 5 stale language ("pending update-report submission") | Discovered during synthesis | Implemented | In-scope staleness; direct consequence of Item 4 missed during implementation |
| `$INSTRUCTION_RECORDS` sync gap | Cross-layer drift flag in proposal / Owner Phase 2 constraint | Next Priorities (already present) | LIB change; already in log from Phase 2 constraint |
| Role authority transfer protocol | Curator finding 1 / Owner finding 3 | No action | Owner: Simplicity Over Protocol applies; informal path is adequate |

---

## Synthesis Error — Initial Overcorrection (Reverted)

During initial synthesis, an error was made: implementations 6 and 7 changed "create a Next Priorities entry in `$A_SOCIETY_LOG`" in both `$A_SOCIETY_CURATOR_ROLE` and `$A_SOCIETY_IMPROVEMENT` to "document as a Next Priorities candidate in the synthesis artifact; the Owner adds it at Forward Pass Closure." This change was based on a misreading — I treated the brief's description of Item 1 ("Curator no longer writes to any log section") as if it were what the files actually implemented. What Item 1 actually implemented was narrower: it removed the Curator's lifecycle-sections bullet. It did not add a blanket prohibition on Next Priorities writes, and the Item 2 hard rule's instruction to "create a Next Priorities entry" was never contradicted by the implemented text. Both changes were reverted. Similarly, an erroneous clause ("including any Next Priorities candidates surfaced in the Curator's synthesis artifact") added to the Phase 5 Work update was also reverted.

---

## Implementations

### 1. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Phase 5 Work

**Change:** Added "approval is not completion" clarification. Before the existing "Acknowledge closure and initiate the backward pass," added: "Before confirming closure, verify that all approved tasks have been executed — approval is not completion. Any Curator task outstanding at the time of approval must be confirmed complete before the forward pass is declared closed."

---

### 2. `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — Session Model Step 5

**Change:** Removed stale references to the old update-report model missed during Item 4's implementation pass. The old text opened Step 5 with "The Owner reviews any pending update-report submission and" and contained "Once all forward-pass submissions in the flow are resolved," — both referencing the post-implementation update-report submission model that Item 4 eliminated. Removed both. Also removed "publication follow-through, or both" from the Curator session follow-up description. Added "Before confirming closure, the Owner verifies all forward-pass work is complete — approved tasks must be confirmed executed, not merely approved."

---

### 3. `$A_SOCIETY_OWNER_ROLE` — Brief-Writing Quality

**Change:** Added a new paragraph after the output-format specification requirement: "When proposing an output-format change, also assess whether the change makes any existing field, section, or type value obsolete — and scope that removal explicitly in the brief. A brief that adds a new section without checking what the addition makes vestigial transfers that obsolescence assessment to the Curator unnecessarily."

---

### 4. `$A_SOCIETY_UPDATES_PROTOCOL` — Submission Requirements

**Change:** Added after the final sentence of the Submission Requirements section: "When the submission template no longer contains the relevant fields — because the template itself was updated within the same flow — the Submission Requirements in this section are the fallback specification. File the submission against these requirements directly."

---

### 5. `$A_SOCIETY_CURATOR_ROLE` — Standing Checks

**Change:** Added a new paragraph: "**Cross-item consistency within target files.** When implementing a multi-item brief, after completing each item's edits to a target file, scan that file for content made stale by earlier items in the same brief. If edits from one item render other content in the same file inconsistent, address that staleness in the same implementation pass — do not leave a target file in a known-inconsistent state at the end of any item's implementation."

---

### 6. `$A_SOCIETY_IMPROVEMENT` — How It Works, step 5 (synthesis terminal condition)

**Change:** Added after the routing bullets: "Curator completing synthesis closes the backward pass. No further handoff is required — the flow is complete when synthesis is done." This was absent from the protocol — the backward pass steps were listed but the terminal condition was never stated, which caused a routing error in this flow (synthesis routed to the Owner for flow closure rather than declaring the flow complete). The equivalent addition to `$GENERAL_IMPROVEMENT` is added to Next Priorities as a LIB change.

---

### 7. `$A_SOCIETY_IMPROVEMENT` — Guardrails, forward pass closure boundary

**Change:** Extended the guardrail with: "**Approval is not completion:** The Owner confirming closure while Curator tasks remain pending (e.g., a publication step approved but not yet executed) is a forward pass closure boundary violation. 'Complete' means executed; the Owner must verify execution, not merely that approval was issued."

---

## Next Priorities Written to `$A_SOCIETY_LOG`

The following three entries were created in Next Priorities:

1. **`$GENERAL_IMPROVEMENT` forward pass closure guardrail — "complete = executed, not approved"** `[S][LIB]` — Propose adding the "Approval is not completion" sentence to `$GENERAL_IMPROVEMENT` Guardrails.

2. **`$GENERAL_OWNER_ROLE` brief-writing quality — add obsoletes check** `[S][LIB]` — Propose mirroring the obsoletes-check addition to `$GENERAL_OWNER_ROLE`.

3. **`$GENERAL_IMPROVEMENT` synthesis closes the backward pass** `[S][LIB]` — Propose mirroring the terminal-condition statement added to `$A_SOCIETY_IMPROVEMENT` How It Works step 5.

The `$INSTRUCTION_RECORDS` sync gap entry was already present in Next Priorities from the Owner's Phase 2 constraints. No duplicate created.

---

## Flow Complete

All synthesis-authority items within `a-docs/` have been implemented directly. No synthesis-authority items have been queued. Three new Next Priorities entries have been written to `$A_SOCIETY_LOG`. The Curator completing synthesis closes the backward pass. The flow is complete.
