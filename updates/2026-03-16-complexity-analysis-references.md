# A-Society Framework Update — 2026-03-16

**Framework Version:** v11.1
**Previous Version:** v11.0

## Summary

Two navigational gaps in the Owner role template and the workflow creation instruction were closed: the Owner's workflow routing responsibility now names complexity analysis at intake, and the primary workflow instruction now points to the intake routing companion document. Both changes are pointer additions to existing documents — no new mandatory sections, no format changes.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 2 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Owner role — complexity analysis at intake added to workflow routing responsibility

**Impact:** Recommended
**Affected artifacts:** [`general/roles/owner.md`]
**What changed:** The "Workflow routing" bullet in the Owner role's "Authority & Responsibilities" section was expanded to name complexity analysis at intake as part of the routing responsibility, with a pointer to the workflow complexity instruction.
**Why:** An Owner agent reading their role document had no path to the complexity analysis capability. The routing responsibility was stated too narrowly — it named workflow routing but not the intake-time analysis that determines how work is routed through the workflow.
**Migration guidance:** In your project's instantiated Owner role (`$[PROJECT]_OWNER_ROLE`), find the "Workflow routing" bullet in the "Authority & Responsibilities" section. If it reads only "routing work into the appropriate workflow by default and directing the [human/user] to the next session", consider expanding it to name complexity analysis at intake and point to your project's workflow complexity instruction (if one exists). The absence does not prevent the Owner from functioning, but the addition makes the capability discoverable from the role document.

---

### Workflow instruction — "Routing Complexity at Intake" section added

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/workflow/main.md`]
**What changed:** A new section "Routing Complexity at Intake" was added immediately before "Modifying an Existing Workflow". It names the Owner's responsibility for determining the proportional path through an existing workflow at intake, and points to the workflow complexity instruction for the full procedure.
**Why:** The primary workflow instruction had no reference to intake routing — an agent using the instruction would have no path from it to the complexity analysis capability. The new section groups both "working with an existing workflow" concerns (intake routing and graph modification) in adjacent sections before the format rules.
**Migration guidance:** This change affects the general instruction only — not any workflow document your project has already created. No existing project workflow documents need updating as a result. Future agents creating or modifying workflow documents will now encounter the pointer to the complexity instruction.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
