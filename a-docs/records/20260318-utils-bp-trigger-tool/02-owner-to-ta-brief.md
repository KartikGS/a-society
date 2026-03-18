**Subject:** Shared utils.ts + Component 4 trigger prompt extension — TA scoping advisory
**To:** Technical Architect
**Status:** BRIEFED
**Date:** 2026-03-18

---

## Context

Two gaps surfaced in the `20260318-process-gap-bundle` backward pass:

**Gap 1 — extractFrontmatter() duplication.** The log described two components duplicating `extractFrontmatter()`, but a grep of `tooling/src/` confirms three: `backward-pass-orderer.ts`, `workflow-graph-validator.ts`, and `plan-artifact-validator.ts`. No `tooling/src/utils.ts` exists. The boundary for what belongs in a shared utils module has not been defined.

**Gap 2 — Backward pass trigger prompt.** Manually composing the per-role trigger prompts during `20260318-process-gap-bundle` produced inconsistencies. The backward pass traversal order is fully deterministic from the workflow graph; the trigger prompt for each role is derivable from that order plus a session-start prompt template. This is a deterministic operation — the same problem class Component 4 already solves.

---

## Agreed Change

**Item 1 — utils.ts boundary definition and deduplication** `[Requires Owner approval]`

Define the boundary for `tooling/src/utils.ts`: which functions qualify as genuinely generic, dependency-free shared primitives. At minimum, `extractFrontmatter()` is a candidate — it is duplicated in three components and is purely a string → parsed object transformation with no component-specific logic. The TA should:
- Confirm `extractFrontmatter()` belongs in utils.ts
- Identify whether any other shared primitives currently duplicated across components qualify
- Specify what does NOT belong in utils.ts (to prevent it from becoming a catch-all)

The Developer will then create `utils.ts` and remove the duplication from the three confirmed components.

**Item 2 — Component 4 extension: trigger prompt generator** `[Requires Owner approval]`

Extend Component 4 (Backward Pass Orderer) so that, in addition to the ordered role list it already produces, it also generates a copyable trigger prompt per role. The TA should define:
- The function signature for the new capability (new export? optional parameter on `orderFromFile`?)
- The trigger prompt format and what inputs it requires (workflow file path, record folder path, or explicit role list?)
- What the prompt template looks like — must be sufficient for a receiving agent to orient without additional context from the caller
- Whether this is a new export or an extension of the existing `orderFromFile` return type

The Developer will implement the extension per the spec and update the test suite accordingly.

---

## Scope

**In scope:**
- Defining the utils.ts boundary (which functions; which components are affected)
- Defining the Component 4 extension interface, output format, and trigger prompt template
- Addressing the Post-Phase-6 gate conditions from `$A_SOCIETY_TOOLING_ADDENDUM` Section 4: (a) Tooling Developer role doc unchanged or update needed; (b) architecture component table update needed or not; (c) manifest unchanged; (d) naming convention unchanged or update needed

**Out of scope:**
- Implementing any code — the TA advisory is a spec; the Developer implements
- Deciding whether `$A_SOCIETY_TOOLING_PROPOSAL` needs a formal amendment — the TA recommends; the Owner decides at the approval gate

---

## Likely Target

- TA advisory output: `03-ta-advisory.md` in this record folder
- Implementation (after Owner approval): `tooling/src/utils.ts` (new), `tooling/src/backward-pass-orderer.ts` (extended), and three component files deduped
- Documentation (post-implementation, Curator): `$A_SOCIETY_TOOLING_INVOCATION`, `$A_SOCIETY_ARCHITECTURE` component table (if needed), `$A_SOCIETY_TOOLING_COUPLING_MAP`

---

## Open Questions for the Technical Architect

1. Of the three duplicating files (`backward-pass-orderer.ts`, `workflow-graph-validator.ts`, `plan-artifact-validator.ts`), are all three using an identical `extractFrontmatter()` implementation, or do they differ in ways that would affect consolidation?
2. Should the trigger prompt generator be a new export on `backward-pass-orderer.ts`, or does the scope of the feature warrant a new module (e.g., `backward-pass-trigger.ts`)?
3. What format should the trigger prompt take? Current practice was to produce it manually; the TA should specify what a generated prompt must contain to be useful to the receiving role agent.
4. Post-Phase-6 gate: is the Tooling Developer role document's current scope description sufficient to cover this extension, or does it require an update?

---

## TA Confirmation Required

Before beginning the advisory, the Technical Architect must acknowledge this briefing:

> "Briefing acknowledged. Beginning scoping advisory for shared utils.ts and Component 4 trigger prompt extension."

The TA does not begin until they have read this brief in full and confirmed acknowledgment. Return to Owner (Session A) when the advisory output is complete.
