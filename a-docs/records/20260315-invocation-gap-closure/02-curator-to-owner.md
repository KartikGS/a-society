---

**Subject:** Invocation gap closure — implementation complete, update report assessment, and cross-layer drift flag
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-15

---

## Trigger

Owner brief `01-owner-to-curator-brief.md` directed implementation of six invocation gap closures across `general/` instructions and `$A_SOCIETY_INITIALIZER`. All six changes were pre-specified with exact text.

---

## What and Why

All six changes have been implemented as specified. Each adds a tool invocation pointer to an existing instruction — replacing or supplementing a manual step with a tool call plus fallback — so that agents with access to the tooling layer can invoke the relevant component directly. The fallback pattern preserves the instruction's validity for agents without tool access.

The coupling map has been updated to reflect all six invocation gaps as Closed.

---

## Where Observed

A-Society — internal. Invocation gaps identified during `$A_SOCIETY_TOOLING_COUPLING_MAP` creation (prior flow).

---

## Target Location

Files modified:

- `$INSTRUCTION_INDEX` — added "When validating the index" subsection after "When moving a file"
- `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` — replaced step 2 in "How to Apply Update Reports (Curator)"
- `$INSTRUCTION_CONSENT` — replaced steps 3–5 with tool-call step + fallback; renumbered step 6 → 4
- `$INSTRUCTION_WORKFLOW_GRAPH` — replaced Step 5 with "Validate and verify" step using both validator and orderer
- `$GENERAL_IMPROVEMENT` — added tooling paragraph after "Dead branches are excluded." in Backward Pass Traversal
- `$A_SOCIETY_INITIALIZER` — replaced Phase 3 opening with scaffolding-first instruction before document list
- `$A_SOCIETY_TOOLING_COUPLING_MAP` — all six Invocation Status entries updated from Open to Closed (2026-03-15); the standing "Note" about open gaps removed

---

## Draft Content

Content matched the brief exactly for all six changes. No deviations. See `01-owner-to-curator-brief.md` for the approved text.

---

## Update Report Assessment

Per `$A_SOCIETY_UPDATES_PROTOCOL`, assessed post-implementation:

**Classification: No standalone report required.**

All six changes are additive-optional: they add tool invocation pointers with manual fallbacks. The underlying manual instructions remain valid and complete. No existing project `a-docs/` content is incomplete or contradicted. Per the protocol's "Do NOT publish for" rule: "Additive changes to `general/` that adopting projects may optionally adopt — include these as Optional entries in the next qualifying report, not as standalone triggers."

**Recommendation:** Queue the six changes as Optional entries for inclusion in the next qualifying update report.

---

## Cross-Layer Drift Flag (Out of Scope)

**Drift identified:** `$A_SOCIETY_IMPROVEMENT` (`a-society/a-docs/improvement/main.md`) has its own "Backward Pass Traversal" section. Change 5 added a tooling paragraph to `$GENERAL_IMPROVEMENT` (the general template) after "Dead branches are excluded." — but A-Society's own instantiation in `a-docs/improvement/main.md` does not have this paragraph.

**Why out of scope:** The brief's scope constraint names six specific files; `$A_SOCIETY_IMPROVEMENT` is not among them.

**Status:** Flagged as a candidate for a future flow. The Curator notes it here so it is not lost. No action taken.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — implementation confirmed complete; update report and drift flag assessments noted
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale
