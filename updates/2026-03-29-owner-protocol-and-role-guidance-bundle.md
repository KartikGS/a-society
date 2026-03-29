# Framework Update Report: Owner protocol and role guidance bundle

**Framework Version:** v26.0
**Previous Version:** v25.0

---

## Summary

This update introduces the Log Validity Sweep protocol for Owners to ensure project logs remain accurate across sessions. It also implements several precision upgrades for Owner and Curator role templates to improve briefing quality and implementation consistency.

## Impact Classification: Breaking

This update is classified as **Breaking** because it introduces new mandatory behavioral obligations for the Owner and Curator roles. Projects that have already instantiated these roles will have gaps in their current role descriptions compared to the A-Society standard. Specifically:
- **Owners** now have a mandatory **Intake Validity Sweep** and **Closure Validity Sweep** protocol.
- **Curators** now have mandatory **rendered-content matching** and **implementation-stage terminology sweep** obligations.
- **Merge Assessment** criteria have been updated to support multi-domain parallel tracks (affects Owner and Log Instruction).

## Changes

### 1. Log Validity Sweeps (Owner & Log Instruction)
Formalizes a "four case" taxonomy (Addressed, Contradicted, Restructured, Partially Addressed) for sweeping the Next Priorities list at the start and end of every flow. This prevents agents from attempting invalidated work.

### 2. Multi-Domain Merge Criteria (Owner & Log Instruction)
Updated Criterion 3 of the merge assessment to permit merging items that can run as independent parallel tracks in a single multi-domain flow, even if they would otherwise route to different workflow types.

### 3. Brief-Writing & Constraint Precision (Owner Role)
- **Immediately adjacent anchors:** Briefs must specify the exact adjacent clause for prose insertions to eliminate ambiguity.
- **File-scoped registration constraints:** Directives to update indexes must be scoped by specific files rather than directories.
- **Real variable names:** Variable references in proposed text must reflect names actually present in the project index.
- **Mirror assessment:** Project-specific convention changes now require an explicit assessment of their general counterparts.
- **Schema vocabulary sweep:** Schema-migration briefs must explicitly scope a sweep for deprecated terms.

### 4. Implementation Discipline (Curator Role)
- **Rendered-content matching:** Curators must match the rendering patterns (code fences, tables, etc.) of the target file when proposing content.
- **Terminology sweep:** Schema changes now require a terminology sweep of surrounding prose in the same implementation pass.

## Migration Guidance

Project Curators should perform the following steps to bring their projects into alignment with v26.0:

1.  **Update Owner Role:** In `$[PROJECT]_OWNER_ROLE`, add the **Intake Validity Sweep** section (after context confirmation) and the **Closure Validity Sweep** (within the Forward Pass Closure guidance). Refer to `$GENERAL_OWNER_ROLE` for the approved text.
2.  **Update Curator Role:** In `$[PROJECT]_CURATOR_ROLE`, add the **Proposal stage — rendered-content matching** and **Implementation stage — terminology sweep** to the Implementation Practices section. Refer to `$GENERAL_CURATOR_ROLE` for the approved text.
3.  **Update Merge Assessment:** In `$[PROJECT]_OWNER_ROLE` and `$[PROJECT]_LOG_INSTRUCTION`, update Criterion 3 of the merge assessment.
4.  **Update Log Instruction:** In `$[PROJECT]_LOG_INSTRUCTION`, add the **Validity Sweeps** subsection to the Entry Lifecycle section.
5.  **Quality Upgrades:** Review project-specific brief-writing and constraint guidance in the Owner role to ensure it matches the precision requirements for adjacent anchors and file-scoped registration.

---

> [!NOTE]
> Adopting projects should note that while these changes are "Breaking" in terms of role completeness, they do not invalidate existing codebase state — they improve the reliability of future agent sessions.
