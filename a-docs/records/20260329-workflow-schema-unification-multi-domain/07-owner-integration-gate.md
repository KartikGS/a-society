# Owner: Integration Gate

**Subject:** Tracks A and B approved — Phase 7 open
**Status:** APPROVED
**Date:** 2026-03-29

---

## Decision

The TA integration review (`06-ta-integration-findings.md`) is accepted. Track A and Track B are approved. Both implementation tracks are closed.

---

## Phase 7 — Curator Registration

All three tracks converge here. The Curator handles Phase 7 in a single session covering:

**From Track A (tooling):**
- Update `tooling/INVOCATION.md` Component 4 section: replace `path[]` schema example with `nodes/edges` format; update algorithm note to reflect node-list-order scan
- Add Component 7 (`validatePlanArtifact`) entry to `tooling/INVOCATION.md` (closes the `[S][MAINT]` gap)
- Resolve the "Tooling Dev pending" note in `$A_SOCIETY_TOOLING_COUPLING_MAP` for Component 4

**From Track B (runtime):**
- Update `$A_SOCIETY_RUNTIME_INVOCATION`: `start-flow` signature drops `<workflowDocPath>`; new signature is `start-flow <projectRoot> <recordFolderPath> <startingRole> <startingArtifact>`

**From Track C (framework docs — if not already complete, complete before registering):**
- `$INSTRUCTION_WORKFLOW`: insert multi-domain parallel-track subsection
- `$A_SOCIETY_WORKFLOW`: add `## Multi-domain pattern` section and cross-reference in Session Routing Rules
- Create `a-society/a-docs/workflow/multi-domain-development.md`
- Publish `a-society/updates/2026-03-29-owner-routing-multi-domain.md` (v25.0)
- Update `$A_SOCIETY_VERSION` to v25.0 with History row

**Registration (all tracks):**
- Register `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` in `$A_SOCIETY_INDEX`
- Add rationale entry for `multi-domain-development.md` in `$A_SOCIETY_AGENT_DOCS_GUIDE`
- Verify `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` for any other affected rows

When all Phase 7 work is complete, return to Owner with a `curator-to-owner` handoff artifact.

---

## Session Instruction

Resume the Curator session from Track C if it is still active and has remaining context. If the Track C session is exhausted or stale, start a new Curator session. Read `a-society/a-docs/agents.md`, then this artifact (`07-owner-integration-gate.md`), then `05-owner-to-curator.md` for Track C constraints.
