**Subject:** Compulsory complexity gate — programmatic enforcement of intake analysis
**Type:** Owner Workflow Plan
**Date:** 2026-03-17

---

## Complexity Assessment

| Axis | Signal | Elevated? |
|---|---|---|
| **Domain spread** | Touches workflow structure, Owner role doc, a new artifact template, tooling enforcement, and indexes. Four distinct areas. | Yes |
| **Shared artifact impact** | `$A_SOCIETY_WORKFLOW` is foundational — read by the Owner at every session. `$A_SOCIETY_OWNER_ROLE` is a core role definition. Any tooling component touched is shared infrastructure for all future flows. | High |
| **Dependency between steps** | The plan artifact format must be defined before: the workflow graph can be updated (edges reference it), the Owner role doc can reference the template, and the TA can scope the tooling extension. Format definition is a hard prerequisite for everything downstream. | Significant |
| **Reversibility** | Adding a required pre-Phase-1 step to the workflow is structural. Future flows must include it. Rolling back would require another workflow modification. | Low–moderate |
| **Scope size** | Multiple files across workflow, roles, and templates. Three roles beyond Owner: Curator (doc track), TA (tooling scope), Tooling Developer (tooling implementation). | High |

**Verdict: Tier 3 — Full Pipeline.**

The combination of high shared artifact impact, significant step dependency, and multi-role involvement warrants the full pipeline. The format definition must clear Owner approval before downstream work (TA scoping, tooling implementation) can begin — this is a structural gate, not a preference.

---

## Routing Decision

**Tier 3.** Two parallel tracks after the doc changes are approved:

1. **Documentation track (Curator):** Define the plan artifact format, update the workflow graph, update the Owner role doc, register new artifacts in indexes.
2. **Tooling track (TA → Tooling Developer):** Scope and implement programmatic validation of the plan artifact. This track opens *after* the plan artifact format is approved in the documentation track — the format is the TA's input.

These tracks are sequentially dependent: doc approval gates the tooling track. They do not run in parallel.

---

## Path Definition

1. Owner writes `02-owner-to-curator-brief.md` → Curator (Session B)
2. Curator proposes: plan artifact template, workflow graph update, Owner role update, index registrations → Owner (Session A)
3. Owner reviews → Approved / Revise / Rejected
4. Curator implements doc track (Phases 3 + 4)
5. Owner directs TA session to scope tooling enforcement mechanism
6. TA produces scoping output → Owner reviews
7. Owner directs Tooling Developer to implement
8. Tooling Developer implements and tests
9. Curator registers any new tooling paths; backward pass (all participants)

---

## Known Unknowns

- **Tooling mechanism:** Is plan artifact validation an extension to the existing workflow graph validator, a new component, or a pre-session check the Owner runs explicitly? The TA determines this after the plan artifact format is approved. Do not pre-specify.
- **Frontmatter schema:** What fields are machine-readable in the plan artifact? The Curator proposes this; Owner reviews. The schema drives what the tooling can enforce.
- **Enforcement point:** Does enforcement happen at the tooling level (a tool the Owner must run) or at the workflow level (a required node the Curator can verify was produced)? Related to the tooling mechanism question above.
