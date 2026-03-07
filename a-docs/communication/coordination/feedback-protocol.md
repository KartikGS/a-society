# A-Society: Feedback Protocol

## Purpose

This protocol governs what an agent does when it discovers a discrepancy, false assumption, or blocker in prior work — whether in a handoff artifact, an existing document, or the output of a prior phase.

---

## Discovery Conditions

A feedback response is required when the discovering agent encounters any of the following:

1. **Contradiction** — a document, proposal, or decision contradicts another document or a framework invariant
2. **False assumption** — a proposal or decision was made on the basis of information that is incorrect or outdated
3. **Missing information** — a handoff artifact is missing a mandatory field required to act on it
4. **Blocker** — the discovering agent cannot proceed with an assigned task without a decision it is not authorized to make

Minor issues (typos, formatting inconsistencies, unclear phrasing that does not affect meaning) do not require a feedback response — fix them inline during maintenance work.

---

## Reporting Path

### During active implementation (Curator discovering an issue)
1. Stop the affected implementation immediately.
2. Document the discovery in `curator-to-owner.md`: update the Status to `IN_PROGRESS` (retaining the current Subject), and add a **Blocker** section below the existing content with:
   - What was discovered
   - Which document or decision it originates in
   - Why it prevents continuation
   - What decision is needed to resolve it
3. Notify the Owner in the session.

### During review (Owner discovering an issue in a submission)
The Owner issues a `REVISE` decision in `owner-to-curator.md` with the specific issue named in the Required Changes section. A REVISE decision is the reporting path for issues found during review — the Owner does not work around or silently fix them.

### Outside active work (either role discovering a stale or incorrect document)
Raise it as a trigger input for the next Phase 1 (Proposal). Do not modify a document unilaterally if the correction implies a direction or scope decision — that requires the full workflow cycle.

---

## Halt Requirement

**The Curator must halt any implementation that is blocked by an unresolved discovery.** Partial implementation of a change that conflicts with a known issue is not permitted — it compounds the problem and makes resolution harder.

The Curator may continue implementation of unaffected work items in the same session, but must not proceed on the blocked item until the Owner has resolved the discovery.

---

## Resolution Owner

The Owner resolves all discoveries that involve:
- A direction or scope decision
- A conflict between two framework documents
- A decision about what belongs in `general/`

The Curator resolves all discoveries that are purely maintenance in nature — incorrect cross-references, stale index entries, broken variable names — without escalation, unless the fix implies a direction decision.

---

## Priority Rule

**Resolving a discovered issue is higher priority than completing the current task.** An unresolved issue that is knowingly worked around produces hidden technical debt in the documentation. Document debt is worse than implementation delay — it compounds across sessions.

If the resolution requires the human's input (per the escalation rules in `conflict-resolution.md`), the work item waits. It does not proceed on incorrect foundations.
