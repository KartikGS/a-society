# Owner → Curator: Decision

---

**Subject:** runtime-layer-vision — Vision and architecture update to acknowledge the runtime layer
**Status:** APPROVED
**Date:** 2026-03-26

---

## Decision

**APPROVED** — all proposed changes. The proposal is well-executed. Both flags are resolved below; no revision needed.

---

## Flag Resolutions

### Flag 1 — Layer count: "four work product layers"

**Resolution: Use "four."** The Curator is right — the vision text already describes three labeled layers (library, active, tooling) while saying "two." Adding the runtime makes four. The correct fix is to update the count to match the actual structure. Four peer layers is the accurate description: library, active, tooling, runtime.

The brief's phrasing ("a third work product layer") was imprecise on my part — it reflected the conversation's framing where we were discussing the runtime as "the next thing after tooling," not a careful layer count. The Curator's correction is exactly right.

**Action:** Use "A-Society has four work product layers:" as proposed.

### Flag 2 — Architecture opening: "documentation framework" characterization

**Resolution: Update the opening.** The Curator is right that leaving "A-Society is a documentation framework, not a software application" creates an internal contradiction once the document describes a runtime that calls LLM APIs.

The Curator's proposed rewording is close but slightly awkward ("Its work product has expanded to include programmatic layers"). Use this instead:

> A-Society is a framework for making projects agentic-friendly. Its foundation is documentation — structured context that agents read and follow — but its work product now includes programmatic layers: executable tooling utilities and a planned runtime that manages agent sessions directly. Understanding the structure is understanding the architecture.

This preserves the documentation-first framing without claiming A-Society is "not a software application" when it demonstrably includes software.

**Action:** Replace the current opening paragraph (lines 5–7 of architecture.md, everything before the folder list) with the text above.

---

## Approval Rationale

1. **Generalizability test** — N/A; this modifies `a-docs/` (A-Society's own project docs), not `general/`
2. **Abstraction level test** — The proposed text describes what the runtime is and does without specifying implementation details (no API design, no session model specifics). Right level for a vision/architecture document.
3. **Duplication test** — No overlap with existing content. The runtime description is new.
4. **Placement test** — Both target files are in `a-docs/project-information/`, which is the identity layer for A-Society. Correct placement per `$A_SOCIETY_STRUCTURE`.
5. **Quality test** — An agent reading the updated vision and architecture would understand that A-Society has four work product layers, what the runtime layer is, and that it is planned but not yet implemented. Clear enough for orientation.
6. **Coupling test** — No `general/` elements affected; no tooling coupling concerns.
7. **Manifest check** — No files added, removed, or renamed.

---

## Stale Reference Scan

The Curator reports no `general/` instructions reference A-Society's layer count or "documentation framework" characterization. Accepted — no separate flow needed for stale references.

---

## Implementation Notes

- The Layer Isolation invariant updates (Edits 1–4 in the proposal) are approved as proposed. Adding `runtime/` to the work product enumeration is the correct maintenance.
- No framework update report is warranted — this modifies `a-docs/` only.
- No index updates needed — no new files created.

---

## Follow-Up Actions

None within this flow. Implementation is straightforward.
