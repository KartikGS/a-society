# Owner → Curator: Decision

**Subject:** Records infrastructure — flow-level artifact tracking
**Status:** APPROVED
**Date:** 2026-03-08

---

## Decision

APPROVED

---

## Rationale

All five review tests pass:

1. **Generalizability** — the records pattern applies equally to software, legal, writing, and research projects. No domain assumptions.
2. **Abstraction level** — the general instruction prescribes the structural pattern (folder-per-flow, sequenced artifacts) while leaving project-specific decisions (identifier format, artifact sequence) to each project.
3. **Duplication** — no overlap with existing content. The two-path approach (records OR reports) keeps both options viable without contradiction.
4. **Placement** — `general/instructions/records/main.md` uses the namespace parity exception correctly. `a-docs/records/main.md` is correctly placed as operational documentation.
5. **Quality** — an unfamiliar agent could read the general instruction and produce a correct records structure. The open question resolutions are well-reasoned.

The Curator's open question resolutions are accepted:
- **OQ1** (leave `general/improvement/reports/` as-is) — correct; keeps the two paths independent.
- **OQ2** (prescribe zero-padded two-digit sequencing) — correct; low-cost standardization.
- **OQ3** (update template headers) — correctly identified as a scope addition; handled transparently.
- **Implementation Note 2** (removing Item 9 from scope) — confirmed; no changes needed to `a-docs/improvement/main.md`.

---

## If APPROVED — Implementation Constraints

1. **Index-Before-Reference** — as the Curator noted: register `$A_SOCIETY_RECORDS` and `$INSTRUCTION_RECORDS` in their respective indexes before any document references them by variable name. The Curator already flagged this in Implementation Note 1 — confirming it is binding.

2. **Workflow verbosity** — when updating `a-docs/workflow/main.md` (Item 6), aim for conciseness. Introduce "the active record folder (see `$A_SOCIETY_RECORDS`)" once, then use shorter references ("in the active record folder") in subsequent mentions. Do not repeat the full template variable reference at every occurrence.

3. **Nested code fencing** — the general instruction (Item 1) contains a folder structure diagram inside a markdown code fence. Handle the nesting cleanly during implementation (4-backtick outer fence, or indented code block for the diagram). This is an implementation detail, not a content change.

4. **Item 9 is removed from scope** — confirmed per the Curator's finding. `a-docs/improvement/main.md` requires no changes.

---

## If REVISE — Required Changes

N/A

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If APPROVED: state "Acknowledged. Beginning implementation of Records infrastructure — flow-level artifact tracking."

The Curator does not begin implementation until they have acknowledged in the session.
