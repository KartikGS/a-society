# Backward Pass Synthesis — 20260329-agent-context-frontmatter

**Date:** 2026-03-29
**Task Reference:** 20260329-agent-context-frontmatter
**Role:** Curator (Synthesis)
**Depth:** Full

---

## Findings Reviewed

- `09-curator-findings.md` — Curator (lightweight)
- `10-owner-findings.md` — Owner (full)

---

## Findings Review

### Shared finding cluster — placeholder `$VAR` names in brief instruction text

Both findings identify the same root cause: brief-writing guidance does not explicitly say that `$VAR` references embedded inside proposed instruction text must either resolve to real registered variables or be written as functional descriptions. In this flow, the brief used fictional `$PROJECT_AGENTS` and `$PROJECT_INDEX` placeholders inside proposed `$INSTRUCTION_AGENTS` text. The error was caught at Phase 2 review rather than by the brief itself.

**Routing:**
- `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality — within `a-docs/` → implement directly
- `$GENERAL_OWNER_ROLE` Brief-Writing Quality — outside `a-docs/` → route via `$A_SOCIETY_LOG` Next Priorities

### Owner finding — forward pass closure must follow log update

The Owner finding surfaces a second gap in Owner-role guidance: Forward Pass Closure explains tooling invocation discipline but does not state that any new Next Priorities items from the just-completed flow must be written or merged into `$A_SOCIETY_LOG` before the closure artifact is filed. In this flow, a runtime follow-on was added after `08-owner-forward-pass-closure.md`, leaving the closure artifact out of sync with the project state it was supposed to close over.

**Routing:**
- `$A_SOCIETY_OWNER_ROLE` Forward Pass Closure Discipline — within `a-docs/` → implement directly
- `$GENERAL_OWNER_ROLE` forward-pass closure guidance — outside `a-docs/` → route via `$A_SOCIETY_LOG` Next Priorities

---

## Direct Implementation

### `$A_SOCIETY_OWNER_ROLE`

Implemented two synthesis-authority fixes in `$A_SOCIETY_OWNER_ROLE`:

1. **Brief-Writing Quality — instruction-text variable references**
Added a rule requiring Owner briefs to use only real registered `$VAR` names when proposed text itself includes variable references; when no project-agnostic variable exists, the brief must use a functional description rather than inventing a fictional placeholder.

2. **Forward Pass Closure Discipline — log update before closure artifact**
Added a rule stating that any Next Priorities items surfaced by the closing flow must be added or merged into `$A_SOCIETY_LOG` before the forward pass closure artifact is filed, so the closure artifact reflects the already-updated project state.

---

## Next Priorities Update

### Merge assessment

Both generalizable follow-ons target `$GENERAL_OWNER_ROLE`, carry compatible `[LIB]` authority, and follow the same Framework Dev path as the existing **Role guidance precision bundle** entry in `$A_SOCIETY_LOG`. This is the same design area: Owner-role guidance that prevents precision-loss correction rounds. Therefore, no new standalone item was created.

### Applied update

Merged both findings into the existing `[M][LIB]` **Role guidance precision bundle** entry in `$A_SOCIETY_LOG`, expanding it with two additional sub-points:

- `$GENERAL_OWNER_ROLE` should require real registered `$VAR` names or a functional description in proposed instruction text
- `$GENERAL_OWNER_ROLE` should require Next Priorities log updates before the forward pass closure artifact is filed

Source citations from `09-curator-findings.md` and `10-owner-findings.md` were appended to that existing log item.

---

## Flow Status

Backward pass complete. Flow closed.
