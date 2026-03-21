---

**Subject:** Workflow YAML graph terminal node correction — two workflow files
**Status:** BRIEFED
**Date:** 2026-03-21

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` | modify |
| `$A_SOCIETY_WORKFLOW_TOOLING_DEV` | modify |

`$INSTRUCTION_WORKFLOW` states: *"The Owner is both the universal entry point and the terminal node for every workflow."* Neither A-Society workflow YAML graph reflects this. Both end at a Curator node. This brief directs corrections to both.

**Item 1 — Framework development workflow YAML graph** `[Requires Owner approval]`

The framework development workflow YAML graph (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`) currently ends at `curator-implementation-registration`. No Owner node follows it. The workflow's own prose contradicts this: *"Owner as terminal node. The Owner is the structural endpoint of the forward pass. Every flow reaches Step 5 before closure."* The YAML graph must be corrected to add an Owner terminal node after `curator-implementation-registration`, with an edge carrying the Curator's implementation output.

The Curator should: define the Owner terminal node (name, role, input/output contract), add the node and edge to the YAML frontmatter, and validate the result against `$INSTRUCTION_WORKFLOW_MODIFY` Steps 1–3 (operation type, modified graph, principles + hard-rule check).

**Item 2 — Tooling development workflow YAML graph** `[Requires Owner approval]`

The tooling development workflow YAML graph (`$A_SOCIETY_WORKFLOW_TOOLING_DEV`) currently ends at `curator-phase7`. The `owner-phase6-gate` node exists but is penultimate, not terminal. Whether an additional Owner terminal node is required after `curator-phase7` — or whether the existing `owner-phase6-gate` already satisfies the Owner-as-terminal principle given that Phase 7 is purely registration/execution of already-approved work — is an open question deferred to the Curator (see below). The Curator's proposal must resolve this and propose the minimal correct fix, with the same validation requirement as Item 1.

**Item 3 — Prose scan for both files** `[Curator authority — implement directly]`

After drafting the corrected YAML graphs, scan the session model prose in both workflow files for any statements that conflict with the corrected graph structure. Correct any prose that contradicts the updated YAML. This is a consistency check, not a structural change — corrections are within Curator authority if they bring prose into alignment with an approved graph change.

---

## Scope

**In scope:** YAML frontmatter corrections in `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` and `$A_SOCIETY_WORKFLOW_TOOLING_DEV`; any prose updates within those same files needed to align with the corrected graphs.

**Out of scope:** Changes to `$INSTRUCTION_WORKFLOW` (which already states the correct rule); changes to `general/` content; changes to role documents; changes to indexes (unless a new variable is required, which is unlikely).

---

## Likely Target

- `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` — YAML frontmatter block and session model prose
- `$A_SOCIETY_WORKFLOW_TOOLING_DEV` — YAML frontmatter block and session model prose

---

## Open Questions for the Curator

1. **Tooling workflow terminal node:** Does the Owner-as-terminal rule require an additional Owner node after `curator-phase7`, or does `owner-phase6-gate` already satisfy it given Phase 7 is execution-only work already gate-approved at Phase 6? Propose the minimal correct fix and justify it against the rule in `$INSTRUCTION_WORKFLOW`.

2. **Prose alignment:** After correcting the YAML, does any prose in the session model of either file conflict with the updated graph? Enumerate any prose changes needed and include them in the proposal.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Workflow YAML graph terminal node correction — two workflow files."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
