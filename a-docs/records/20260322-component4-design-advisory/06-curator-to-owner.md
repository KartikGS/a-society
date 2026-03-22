# Curator → Owner: Submission

**Subject:** Component 4 redesign — documentation updates complete
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-22

---

## Trigger

Work item from `05-owner-decision.md` and `03-ta-advisory.md` §5 & §6 regarding the Component 4 redesign (session prompt formats, phase instruction embedding, and `synthesis_role` removal).

---

## What and Why

Updated all Curator-scope documentation to align with the Tooling Developer's implementation of the Component 4 redesign. These updates ensure that:
1. The invocation signature for `orderWithPromptsFromFile` is correctly documented.
2. The `workflow.md` schema in record folders reflects the removal of `synthesis_role`.
3. The prompt format changes and phase-instruction embedding are captured in both the internal and general improvement protocols.
4. The coupling map reflects the new state of Component 4 dependencies.

---

## Where Observed

A-Society — internal.

---

## Target Location

- `$A_SOCIETY_TOOLING_INVOCATION` (`a-society/tooling/INVOCATION.md`)
- `$A_SOCIETY_RECORDS` (`a-society/a-docs/records/main.md`)
- `$A_SOCIETY_TOOLING_PROPOSAL` (`a-society/a-docs/tooling/architecture-proposal.md`)
- `$A_SOCIETY_IMPROVEMENT` (`a-society/a-docs/improvement/main.md`)
- `$GENERAL_IMPROVEMENT` (`a-society/general/improvement/main.md`)
- `$A_SOCIETY_TOOLING_COUPLING_MAP` (`a-society/a-docs/tooling/general-coupling-map.md`)

---

## Draft Content

All changes have been implemented directly in the target files. Key updates:

- **`$A_SOCIETY_TOOLING_INVOCATION`**: Updated signature to `orderWithPromptsFromFile(recordFolderPath, synthesisRole)`; updated `workflow.md` schema; added backward-compat note; updated prompt example.
- **`$A_SOCIETY_RECORDS`**: Removed `synthesis_role` from the `workflow.md` schema and creation instructions.
- **`$A_SOCIETY_TOOLING_PROPOSAL`**: Updated Component 4 spec to reflect the new signature and prompt-generation behavior.
- **`$A_SOCIETY_IMPROVEMENT`**: Updated Component 4 mandate to reflect the new signature and note the embedded phase-instruction references.
- **`$GENERAL_IMPROVEMENT`**: Aligned the Tooling note with the new signature and prompt-generation behavior.
- **`$A_SOCIETY_TOOLING_COUPLING_MAP`**: Updated format dependency row for Component 4 and recorded the 2026-03-22 Type C update. Confirmed no open invocation gap exists for Component 4.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
