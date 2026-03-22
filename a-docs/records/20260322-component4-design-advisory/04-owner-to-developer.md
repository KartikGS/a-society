# Owner Decision — TA Advisory Review

**Subject:** Component 4 design advisory — prompt embedding, synthesis_role schema, session prompt distinction
**Status:** APPROVED
**Date:** 2026-03-22
**Reviewing:** `03-ta-advisory.md`

---

## Decision

The TA advisory is approved. All six output requirements are met. The Tooling Developer may proceed with the Developer scope items from §5.

---

## Section-by-Section Notes

**§1 — Prompt formats:** Both templates are accepted as specified. The existing-session three-field format (`Next action: / Read: / Expected response:`) is the correct structure for meta-analysis prompts. The synthesis new-session format, retaining the orientation preamble and adding the `Read:` phase reference line, is correct.

**§2 — Phase instruction embedding:** Fixed-string constant is accepted. The co-maintenance dependency (constant must be updated if `$GENERAL_IMPROVEMENT` relocates) must be documented as a comment above the constant in the source, as the TA specified.

**§3 — synthesis_role replacement:** Parameter approach is accepted. `synthesisRole` as a required second parameter to `orderWithPromptsFromFile` is the right choice. Accept-and-ignore backward-compatibility for existing `workflow.md` files with `synthesis_role` is accepted. Bootstrapping exemption for the current flow's `workflow.md` is noted and accepted — see TA §3 for the two valid invocation paths when this flow's backward pass is initiated.

**§4 — Interface changes:** All interface changes as specified are accepted. No deviations authorized.

**§5 — Files Changed:** Accepted with one addition. The TA had a standing obligation to check `$A_SOCIETY_TOOLING_COUPLING_MAP` for Component 4 and surface any open invocation gap. This was omitted from the advisory. The Curator must check `$A_SOCIETY_TOOLING_COUPLING_MAP` for Component 4 as part of documentation updates. If the gap is open, note it as a standing open item in the Curator submission — this is a gap-surfacing obligation, not a hard stop on implementation.

**§6 — Upfront-load directive:** Finding accepted. No upfront-load directive exists in either file. Both Curator actions (`$A_SOCIETY_IMPROVEMENT` and `$GENERAL_IMPROVEMENT`) are additive — embedding a note that Component 4 prompts now direct roles to the relevant phase section. No removal is needed.

---

## LIB Authorization

The `$GENERAL_IMPROVEMENT` change is LIB scope. The TA has fully specified it: add a note to the tooling description under `### Backward Pass Traversal` updating the invocation signature and noting that generated prompts embed phase-instruction references. No open questions remain. This change is authorized as part of this decision. The Curator does not need a separate proposal round for this item — the TA advisory is the full specification.

---

## Implementation Authorization

The Tooling Developer is authorized to implement the following (per TA §5, Developer scope):

1. `a-society/tooling/src/backward-pass-orderer.ts` — all six changes as specified in TA §4 and §5
2. `a-society/tooling/test/backward-pass-orderer.test.ts` — update `orderWithPromptsFromFile` invocations and prompt content assertions

The Developer must not touch any Curator-scope files. When implementation is complete, return to Owner for approval. If deviations from the TA spec are encountered during implementation, escalate to TA before implementing a workaround.

---

## Handoff — Tooling Developer

Start a new Developer session.

```
You are a Tooling Developer agent for A-Society. Read a-society/a-docs/agents.md.
```

Then:

```
Next action: Implement the Component 4 changes specified in the TA advisory.
Read: a-society/a-docs/records/20260322-component4-design-advisory/03-ta-advisory.md — implement §4 (Interface Changes) and the Developer rows from §5 (Files Changed) only. Do not touch Curator-scope files.
Expected response: Implementation complete; test suite passing (for Component 4 tests and any integration tests that invoke it). Return to Owner with a brief implementation confirmation.
```
