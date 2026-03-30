# Curator Synthesis — registry-frontmatter-reader

**Date:** 2026-03-30
**Task Reference:** registry-frontmatter-reader
**Role:** Curator
**Phase:** Synthesis

---

## Actionable findings reviewed

I reviewed all backward-pass findings in this record (`09-` through `12-`) and routed them by structural scope:

- **Within `a-docs/` and Curator authority:** implement directly in this flow.
- **Outside `a-docs/` or requiring a structural decision:** add or merge a Next Priorities item in `$A_SOCIETY_LOG`.

No Owner approval loop was initiated from this backward pass.

---

## Direct implementation completed (`a-docs/`)

### 1. `workflow.md` completeness now states the Owner-first invariant

Implemented directly in `$A_SOCIETY_RECORDS`.

Changes made:
- The `workflow.md` completeness obligation now states explicitly that the first node in any A-Society `workflow.md` is the Owner intake node.
- The record-creation procedure now repeats this at the `workflow.md` creation step so the intake action is surfaced where the Owner constructs the graph.

Why this warranted direct maintenance:
- The backward-pass ordering error in this flow came from a malformed `workflow.md` path, not from a tooling defect.
- The missing rule was an A-Society record-convention gap inside `a-docs/`, so leaving it as backlog would violate synthesis authority.

### 2. TA advisory standards now cover declared-operational dependencies and shared logging ownership

Implemented directly in `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`.

Changes made:
- Advisories must now verify the correctness of any dependency described as "already working," not just its existence.
- Advisories that span multiple error-propagation layers must now assign ownership of the operator-facing log line explicitly so compliant implementations do not double-log the same failure.

Why this warranted direct maintenance:
- Both findings were execution-standard gaps in the A-Society Technical Architect role contract.
- The `paths.ts` regex bug and the double-log watch item were caught in this flow; the A-Society role guidance should not remain stale after those failures were traced to their root causes.

---

## Findings reviewed but not separately routed

### Frontmatter-purpose surfacing

The Curator and Runtime Developer both noted that YAML frontmatter needs clear prose context to avoid accidental maintenance damage. That issue was already corrected during forward-pass registration in `08-curator-registration.md`, so no additional synthesis action was required.

### `roleKeyToIndexVariable` convention discoverability

The Technical Architect finding about the `$NAMESPACE_ROLENAME_ROLE` derivation rule is real, but it did not recur across the other findings and the right documentation home is itself a structural question. I did not create a separate follow-on item for it in this synthesis because the stronger repeated structural signal in this flow was the broader role-file required-reading authority problem below. If the role-key convention surfaces again after that structural work, it should be routed as its own flow.

---

## Next Priorities update (`outside a-docs/`)

### New Framework Dev item added

Added new log item:
- **Role-file required-reading authority model**

Scope:
- Evaluate how role documents should serve both runtime parsing and human/manual orientation without maintaining two authoritative required-reading lists.
- Decide whether YAML `required_reading` / `universal_required_reading` becomes the sole authority with prose deferring to it, or whether another structure better separates machine-readable and natural-language consumers.
- Propagate the decision across A-Society role docs and the corresponding `general/` role templates as needed.

Merge assessment:
- No existing Next Priorities item targets role-file required-reading structure, YAML/prose authority, or the runtime/manual dual-consumer role-doc design area.
- Therefore, no merge was available and a new item was created.

---

## Flow closure

`$A_SOCIETY_LOG` has been updated to reflect:
- backward pass complete for this flow
- the two direct `a-docs/` maintenance changes above
- the new Next Priorities item

The backward pass is complete. Flow closed.
