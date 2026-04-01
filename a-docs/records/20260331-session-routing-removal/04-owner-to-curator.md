# Owner → Curator: Decision

**Subject:** session-routing-removal — remove session routing instructions and human-as-orchestrator framing across all active governance docs; remove session_action and prompt from handoff schema
**Status:** APPROVED
**Date:** 2026-03-31

---

## Decision

**APPROVED.** Proceed to implementation and registration.

---

## Approval Rationale

The proposal passes all review tests.

1. **Generalizability test** — The general/ changes remove content, not add it. The resulting general/ templates remain applicable to any project type. After removal, Handoff Output sections still govern what matters cross-project: which session to switch to, what artifact to read, copyable artifact path. The human-directed direction ("humans can figure session routing out") is correctly applied throughout.

2. **Abstraction level test** — All changes operate at the correct abstraction level. No new assumptions are introduced.

3. **Duplication test** — No duplication introduced. No consolidation needed.

4. **Placement test** — No new files created. All existing files modified in-place at their correct locations.

5. **Quality test** — The proposed post-change state of each file is coherent and navigable. The section heading "Sessions and the Human Orchestrator" correctly survives in `general/instructions/workflow/main.md` — the remaining content (session definition, artifact-path transition rule, bidirectional exchanges) still accurately describes what the section covers.

6. **Coupling test** — No tooling coupling map dependency affected. Confirmed by Curator; no coupling map update needed.

7. **Manifest check** — No files added or removed from `general/`. No manifest update needed.

**Framework update report:** The classification (Breaking × 3, Recommended × 1, v26.0 → v27.0) is correct. The three Breaking changes create real contradictions in any project that instantiated the general role templates or references the handoff schema fields. The Recommended change for the workflow instruction shortening is correctly classified — it does not create a contradiction, only a divergence from the current template.

---

## Open Question Response

**Curator's open question (File 6 — curator.md new-session block):** Confirmed — remove it. The brief scoped item 1 removal; the new-session format block is vestigial without item 1 and its removal is an in-scope consequence. Apply this consistently across all a-docs/ role files (curator.md, tooling-developer.md, runtime-developer.md) matching the explicit treatment in owner.md.

---

## Implementation Notes

**Example prose labels and inline session framing (File 15):** The Curator's proposed label updates ("Resume case" → "Owner receives from Curator — proposal review:"; "Start-new case" → "Curator receives from Owner — briefing:") are approved. The removal of the inline session-routing prose sentences in the examples ("Resume the existing Owner session (Session A)." / "Start a fresh Curator session (Session B).") is approved.

**No proposal round for Track B:** Track B (runtime-developer) is running in parallel. This decision does not await Track B; the Curator proceeds to implementation independently.

---

## Follow-Up Actions

After implementation, consult `$A_SOCIETY_UPDATES_PROTOCOL` to confirm the classification is final, then publish the update report to `$A_SOCIETY_UPDATES_DIR` as part of Phase 3.

---

## Scope Confirmation

All 15 files as listed in the proposal. No additional files. No index updates. No manifest updates.
