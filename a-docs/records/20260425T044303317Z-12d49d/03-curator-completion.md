# Curator Completion: Record Correction-Loop Continuation Guidance

**Status:** Submitted for Review
**Date:** 2026-04-25
**Curator:** Curator

## 1. Work Performed
I have analyzed the request to resolve ambiguity regarding artifact sequencing during correction loops. Because the change impacts `a-society/general/instructions/records/main.md` (a shared framework promise), I have produced a proposal rather than implementing directly, as required by the node contract.

**Artifacts produced:**
- `02-curator-proposal.md`: Contains the proposed language for `$INSTRUCTION_RECORDS`, alignment for `$A_SOCIETY_RECORDS`, and a draft framework update report.

## 2. Proposal Highlights
- **Decoupling:** Explicitly labels `workflow.yaml` artifact names as "planning descriptors" rather than "frozen reservations."
- **Mandate:** Requires agents to resume at the next available numeric slot regardless of the original plan.
- **Example:** Provides a clear "Planned $\rightarrow$ Event $\rightarrow$ Result" scenario to remove ambiguity.
- **Consistency:** Ensures A-Society's own internal convention aligns with the general library.

## 3. Registration Analysis
- **Index changes:** None required.
- **Guide changes:** None required.
- **Update report:** A "Recommended" impact report is drafted in the proposal to notify adopting projects of the clarification.
- **Version file:** No change required for this minor clarification.

## 4. Next Step
The flow now returns to the Owner for a framework decision on the proposed changes.
