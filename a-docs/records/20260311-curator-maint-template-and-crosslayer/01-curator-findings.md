# Curator Findings — Template Header Scope + Cross-Layer Consistency Check

**Flow:** `20260311-curator-maint-template-and-crosslayer`
**Date:** 2026-03-11
**Type:** Curator-authority maintenance bundle (two items)

---

## Changes Implemented

### 1. Template header scope — Priority 3 `[S][MAINT]`

**Problem:** `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` header said "do not modify this file" but gave no instruction to omit that header when instantiating an artifact from the template. An agent following the template literally would carry the template-management note into the instantiated artifact.

**Fix:** Added "When instantiating, omit this header." to `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`.

**Scope extension:** The same gap exists in the other two conversation templates. Applied the equivalent fix to both sibling templates in the same pass:
- `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR` — same single-line fix applied
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — three header blockquotes exist; fix reads "omit all header blocks above the first `---`" to cover all three

**Files changed:**
- `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`
- `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF`

---

### 2. Self-consistency Curator practice — Priority 5 `[S][MAINT]`

**Problem:** No standing check required the Curator to verify cross-layer alignment between `general/instructions/` and the corresponding A-Society `a-docs/` artifact. This gap surfaced when `$INSTRUCTION_AGENTS` specified the wrong reading order while A-Society's own `agents.md` had the correct one — drift that would have been caught by such a check.

**Fix:** Added a new "Standing Checks" section to `$A_SOCIETY_CURATOR_ROLE`, placed between Hard Rules and Context Loading, declaring the cross-layer consistency check as a standing operational requirement.

**Files changed:**
- `$A_SOCIETY_CURATOR_ROLE`

---

## Backward Pass

Both changes are targeted and mechanical — no direction decisions, no new structure, no `general/` additions.

**Observations:**
- The template header gap existed in all three templates, not just the one named in the log. Fixing all three in one pass prevents the same issue from surfacing separately per template — consistent with batching guidance in the original log entry.
- The standing check placement (between Hard Rules and Context Loading) gives it immediate visibility — a Curator reading the role document in sequence will encounter it before loading context, which is when they need to know it applies.

**No further action required.** Flow complete.
