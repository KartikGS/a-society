# Backward Pass Synthesis — 20260327-runtime-orient-session

**Date:** 2026-03-27
**Role:** Curator
**Step:** 5 of 5 — Final

---

## Findings Reviewed

- `12-curator-findings.md` — Curator (lightweight)
- `13-runtime-developer-findings.md` — Runtime Developer (lightweight)
- `14-ta-findings.md` — Technical Architect (full depth)
- `15-owner-findings.md` — Owner (full depth)

---

## Routing Summary

| Finding | Source | Scope | Action |
|---|---|---|---|
| `structure.md` "Three-Folder Structure" does not account for `tooling/` or `runtime/` | Owner #2, Curator #1 | `a-docs/` | Implemented directly |
| TA §8 completeness: behavioral requirements in prose not mirrored in §8 row are not binding | Owner #1, TA #1, Dev #1 | `a-docs/` | Implemented directly |
| TA type import source must be specified when type crosses module boundaries | TA #2 | `a-docs/` | Implemented directly |
| TA extension-before-bypass: enumerate why existing path cannot be extended before proposing bypass | Owner #4, TA #3 | `a-docs/` | Implemented directly |
| Owner brief scope error (a-docs-guide runtime section) | Owner #3 | None | No action (Owner self-correction; brief-writing guidance already covers this) |
| Runtime integration test infrastructure absent | Owner #3, Dev #2 | `runtime/` | Next Priorities (new item) |
| Generalizable advisory standards (§8 completeness + extension-before-bypass) → `general/` | Owner #1/#4, TA #1/#3 | `general/` | Next Priorities (new item) |

---

## Implemented Directly

### 1. `$A_SOCIETY_STRUCTURE` — Five-folder structure

**Root cause:** `structure.md` opens with "The Three-Folder Structure" and describes `general/`, `agents/`, and `a-docs/`. The `tooling/` and `runtime/` layers are entirely absent from the placement guide — the document agents consult when asking "where does this belong?" An agent making a placement decision involving either executable layer finds no governing rule and must infer from `architecture.md`, which is not the authoritative placement reference.

**Change:** Updated the opening section heading from "The Three-Folder Structure" to "The Five-Folder Structure"; extended the work product paragraph to name four work product folders (`general/`, `agents/`, `tooling/`, `runtime/`); added both to the placement bullet list; added `tooling/` and `runtime/` Folder Reference entries with purpose, what belongs, what does not, and the key placement test for each.

---

### 2. `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — Three Advisory Standards additions

**2a. §8 completeness: behavioral requirements in prose must be named in the §8 row.**

**Root cause:** The registry guard was fully specified in §2 prose ("If no entry exists in `roleContextRegistry` for the derived key, orient surfaces an error and exits") but the §8 Files Changed row for `orient.ts` described only the happy path. The Developer implemented exactly what §8 described — and correctly filed no deviation, because there was none. The omission was not in the implementation; it was in the spec. The §8 table is what a Developer implements against; prose sections are narrative. A behavioral requirement that lives only in prose is not structurally present in the Developer's checklist.

**Change:** Added a new Advisory Standards rule: every behavioral requirement in §1–§7 — guard condition, error output with a spec-defined message, required exit behavior, or any non-happy-path condition — must be named explicitly in the §8 row for the file it applies to. The §8 row must not describe only the happy path when non-happy-path behavior is required.

**2b. Type import source must be specified when a type crosses module boundaries.**

**Root cause:** The spec stated `orient.ts` would use `MessageParam[]` for the `history` type without specifying where `MessageParam` would be imported from. The Developer imported it from `./llm.js`, requiring `export type { MessageParam }` to be added to `llm.ts` — a file the spec said would require no changes. The deviation was benign but produced a discrepancy between spec and implementation that the integration review had to adjudicate.

**Change:** Added a new Advisory Standards rule: when naming a type in an interface that must be imported across module boundaries, the advisory must either specify the import path explicitly or note that a re-export from the relevant module will be needed. Leaving the import source unspecified when the type is not currently exported from the expected location is a spec gap.

**2c. Extension-before-bypass: enumerate why existing infrastructure cannot be extended before proposing a new path.**

**Root cause:** The first draft of the Phase 0 architecture bypassed `roleContextRegistry` and `ContextInjectionService` entirely, proposing new inline infrastructure. The stated rationale (the hardcoded handoff directive) was valid, but the extension path — adding a `mode` parameter — was available and was not evaluated before the bypass was proposed. The revision was straightforward once surfaced, indicating the enumeration step was skipped, not that extension was genuinely unavailable.

**Change:** Added a new Advisory Standards rule: before proposing new infrastructure or a bypass of existing infrastructure, enumerate explicitly what the existing path cannot do and why extension is insufficient. If the enumeration yields a single resolvable obstacle, the conclusion is "extend" — not "bypass." Skipping this enumeration and defaulting to new infrastructure produces unnecessary revision cycles and erodes trust in the initial advisory.

---

## Routed to Next Priorities

### 1. Runtime integration test infrastructure (new item)

`[M]` — The runtime layer has no test harness or format standard. The integration validation gate requires a reproducible test record; the Developer produced a manual terminal transcript that could not exercise the registry guard path due to the mock API key short-circuit. A structured test harness would have made the missing guard visible at validation time rather than in the backward pass. Follows Runtime Dev workflow. Merge assessment: no existing Next Priorities item targets runtime test infrastructure. New item. Source: `a-society/a-docs/records/20260327-runtime-orient-session/15-owner-findings.md` (Finding 2); `a-society/a-docs/records/20260327-runtime-orient-session/13-runtime-developer-findings.md` (Finding 2).

### 2. Generalizable advisory standards → `general/` (new item)

`[S][LIB]` — Two findings from this flow are explicitly flagged as generalizable: *(1)* behavioral requirements in advisory prose not mirrored in the files-changed table are not binding implementation requirements — this discipline applies to any project with advisory-document-producing roles, not only A-Society's Technical Architect; *(2)* the extension-before-bypass heuristic applies to any design role across any project type. Both have been implemented in `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` for A-Society. The `general/` contribution — a general instruction or role-template addition capturing these disciplines for any project's architecture or design role — remains open. Follows Framework Dev flow (LIB proposal required). Merge assessment: existing "Role guidance quality" `[S][LIB][MAINT]` targets `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` — different design area (brief-writing, handoff output, registration scope); no merge. New item. Source: `a-society/a-docs/records/20260327-runtime-orient-session/14-ta-findings.md` (Findings 1, 3); `a-society/a-docs/records/20260327-runtime-orient-session/15-owner-findings.md` (Findings 1, 4).

---

## Synthesis Complete

The backward pass for flow `20260327-runtime-orient-session` is closed.

Four `a-docs/` changes were implemented directly:
- `$A_SOCIETY_STRUCTURE` — five-folder structure: `tooling/` and `runtime/` sections added; heading updated
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — §8 completeness advisory rule added
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — type import source advisory rule added
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — extension-before-bypass advisory rule added

Two items were routed to Next Priorities:
- New `[M]`: runtime integration test infrastructure (Runtime Dev workflow)
- New `[S][LIB]`: generalizable advisory standards (§8 completeness + extension-before-bypass) → `general/` (Framework Dev flow)

Project log updated: backward pass status changed from pending to complete.
