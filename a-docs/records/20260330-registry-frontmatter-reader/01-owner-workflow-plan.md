---
type: owner-workflow-plan
date: "2026-03-30"
complexity:
  domain_spread: low
  shared_artifact_impact: low
  step_dependency: moderate
  reversibility: low
  scope_size: low
tier: 3
path:
  - "Technical Architect - Phase 0 advisory"
  - "Owner - Phase 0 gate"
  - "Runtime Developer - Implementation"
  - "Runtime Developer - Integration Validation"
  - "Technical Architect - Integration Review"
  - "Owner - Integration Gate"
  - "Curator - Registration"
  - "Owner - Forward Pass Closure"
known_unknowns:
  - "Error handling strategy for missing or malformed YAML frontmatter — no universal_required_reading block, no required_reading block, or YAML parse failure. TA to specify the error surface and fallback behavior."
  - "Whether resolveVariableFromIndex() needs extension for this calling context, or whether the existing implementation handles all cases the frontmatter reader will encounter."
---

**Subject:** Replace static `roleContextRegistry` with dynamic frontmatter reader
**Type:** Owner Workflow Plan
**Date:** 2026-03-30

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — all changes are within the runtime layer (`runtime/src/registry.ts`). Source record (`20260329-agent-context-frontmatter`) explicitly states "Runtime Dev workflow only — no framework doc or tooling changes required." | low |
| **2. Shared artifact impact** | `registry.ts` is an internal runtime implementation file. Callers (`injection.ts`, `orient.ts`) will need to update their call sites if the export signature changes, but no public index or external interface changes are anticipated. `INVOCATION.md` is not affected — the runtime's external behavior is unchanged. | low |
| **3. Step dependency** | TA Phase 0 advisory is required before implementation begins. The advisory must resolve error handling and the caller update pattern — those decisions inform implementation. Integration validation must follow implementation. TA integration review must follow validation. These are the workflow-mandated sequential gates. | moderate |
| **4. Reversibility** | Runtime code change — easily undone via git revert. No schema or structural changes. | low |
| **5. Scope size** | Primary file: `registry.ts`. Callers requiring updates: `injection.ts`, `orient.ts`. Possibly `paths.ts` if `resolveVariableFromIndex()` needs extension. Two to four files maximum. Two active roles (TA advisory, Runtime Developer). | low |

**Verdict:** Tier 3 — Full Runtime Dev pipeline mandated for any runtime code implementation, regardless of size. TA advisory is warranted because the error handling and caller interface decisions must be resolved before implementation begins.

---

## Routing Decision

Routes to the **Runtime Development workflow** (`$A_SOCIETY_WORKFLOW_RUNTIME_DEV`). The project invariant applies: all runtime code changes follow the full Runtime Dev pipeline. The complexity weight on all five axes is low-to-moderate; the mandate is structural, not complexity-driven. TA Phase 0 advisory is required to resolve the two known unknowns before implementation begins.

---

## Path Definition

1. **Technical Architect** — Phase 0 advisory: specify the new function signature for `registry.ts`, how to parse YAML frontmatter from `agents.md` and role files, error handling for missing/malformed frontmatter, and the caller update pattern for `injection.ts` and `orient.ts`
2. **Owner** — Phase 0 gate: review and approve TA advisory before implementation begins
3. **Runtime Developer** — Implementation against the approved advisory
4. **Runtime Developer** — Integration validation: end-to-end test confirming dynamic loading produces equivalent context to the prior static registry
5. **Technical Architect** — Integration review: assess implementation against the approved advisory
6. **Owner** — Integration gate: sign off on integrated product; verify `INVOCATION.md` accuracy if any runtime surface changes
7. **Curator** — Registration: verify `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` for any newly created or modified files; update `$A_SOCIETY_AGENT_DOCS_GUIDE` if needed
8. **Owner** — Forward pass closure and backward pass initiation

---

## Known Unknowns

- **Error handling for missing or malformed frontmatter** — If `agents.md` has no `universal_required_reading` block, if a role file has no `required_reading` block, or if YAML parsing fails: what should the runtime do? Fall back to an empty required-reading set with a warning? Throw and abort session start? Return a typed error? TA to specify the error surface and the caller's expected behavior.
- **`resolveVariableFromIndex()` sufficiency** — The existing `resolveVariableFromIndex()` in `paths.ts` resolves `$VAR` references by scanning the public and internal indexes. The frontmatter reader will call it for each variable in `universal_required_reading` and `required_reading`. TA to confirm this call pattern works as-is, or specify required extensions.
