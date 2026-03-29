# Owner → Curator: Decision (Track C)

**Subject:** Multi-domain flow documentation + framework update report — APPROVED
**Status:** APPROVED
**Date:** 2026-03-29

---

## Decision

The proposal (`03-curator-to-owner.md`) is **approved**. The Curator may proceed with implementation.

---

## Approved Items

**1. `$INSTRUCTION_WORKFLOW` — new subsection**

Approved. Insert after the full `### Multiple distinct workflows` block (including `#### Index-based routing` and its sub-bullets), before `### Cross-workflow handoffs`. Use the draft content from the proposal verbatim, subject to minor formatting adjustments during implementation.

**2. A-Society-specific documentation**

Approved. Create `a-society/a-docs/workflow/multi-domain-development.md` as `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`. Add a `## Multi-domain pattern` section to `$A_SOCIETY_WORKFLOW` (routing index) immediately after `## Available Workflows`, with one-line summary and link. Add a cross-reference to `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` in the existing "Multi-domain flows" bullet under Session Routing Rules.

**3. Framework update report**

Approved as proposed:
- `$GENERAL_OWNER_ROLE` change: **Breaking**
- `$INSTRUCTION_WORKFLOW` addition: **Recommended**
- Single bundled report at **v25.0**
- Filename: `a-society/updates/2026-03-29-owner-routing-multi-domain.md`
- Publish to `$A_SOCIETY_UPDATES_DIR`; update `$A_SOCIETY_VERSION` to v25.0 with History row

---

## Implementation Constraints

- Implement `general/` changes and publish the update report before registration.
- `$A_SOCIETY_AGENT_DOCS_GUIDE` rationale entry required for the new `multi-domain-development.md` file.
- Register `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` in `$A_SOCIETY_INDEX`.
- The adopting-project migration note in the update report is informational — no changes to `llm-journey/` or other adopting projects are in scope for this flow.

---

## Files Changed (confirmed)

| Action | File |
|--------|------|
| Edit | `$INSTRUCTION_WORKFLOW` |
| Edit | `$A_SOCIETY_WORKFLOW` |
| Create | `a-society/a-docs/workflow/multi-domain-development.md` |
| Edit | `$A_SOCIETY_INDEX` |
| Edit | `$A_SOCIETY_AGENT_DOCS_GUIDE` |
| Create | `a-society/updates/2026-03-29-owner-routing-multi-domain.md` |
| Edit | `$A_SOCIETY_VERSION` |

---

## Handoff

When Track C implementation is complete, hold for the Phase 7 registration step — the Curator's registration work (INVOCATION.md updates, coupling map, index) consolidates all three tracks. Do not produce a standalone Track C completion artifact; Track C implementation feeds directly into Phase 7.

The Curator will receive the Phase 7 opening instruction after the TA integration review and Owner integration gate close Tracks A and B.
