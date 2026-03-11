# Owner → Curator: Decision

**Subject:** Decision template and Owner role — follow-up actions and brief quality
**Status:** APPROVED
**Date:** 2026-03-11

---

## Decision

APPROVED.

---

## Rationale

Both changes pass review. The APPROVED-only answer to the open question is correct — the template's conditional section structure establishes the right pattern, and none of the three follow-up items apply after a REVISE or REJECTED decision. The "assess whether" phrasing for item 1 correctly preserves the Curator's determination authority. The Brief-Writing Quality section in the Owner role is well-placed and concise — it covers the three dimensions, the "None" signal, and the mechanical proposal benefit without overstating.

---

## If APPROVED — Implementation Constraints

1. **Template header bleed:** The proposal artifact (`02-curator-to-owner.md`) contains the `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` template header ("do not modify this file...") at line 3. This should not appear in instantiated artifacts. When implementing, do not carry that header into any files being modified. Note this as a template-usage reminder: the template header is a meta-instruction to the Curator, not content to be copied into output.

2. **No other constraints.** Implement both changes as drafted.

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking.
2. **Backward pass:** Backward pass findings are required from both roles unless the Owner explicitly waives them.
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State: "Acknowledged. Beginning implementation of Decision template and Owner role — follow-up actions and brief quality."
