# A-Society Framework Update — 2026-03-21

**Framework Version:** v17.3
**Previous Version:** v17.2

## Summary

Two changes to the general improvement protocol (`general/improvement/main.md`): the synthesis routing model has been simplified to a structural rule (implement within `a-docs/` directly; queue everything else as a new flow), and the backward pass tool mandate has been strengthened to explicitly prohibit manual traversal computation when a tool is available. Both changes improve behavioral clarity for any project instantiating the general improvement protocol.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 2 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Synthesis routing simplified to structural rule

**Impact:** Recommended
**Affected artifacts:** [`general/improvement/main.md`]
**What changed:** How It Works step 5 (actionable item routing) was simplified. The prior model had two paths: (a) changes within synthesis role authority → implement directly; (b) changes requiring Owner judgment → submit to Owner for approval. The new model uses a structural boundary: changes within `a-docs/` → implement directly; changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes) → create an entry for a future flow using the project's tracking mechanism. The instruction to not initiate an Owner approval loop from within the backward pass is now explicit.

**Why:** The mid-synthesis Owner approval loop was identified as friction with no structural justification. The correct boundary is placement, not authority judgment. Any change the synthesis role can implement directly within the project's documentation layer should be implemented immediately; anything beyond that scope belongs in a new flow, not a sub-loop within synthesis.

**Migration guidance:** Inspect your project's `$[PROJECT]_IMPROVEMENT` (the project's instantiation of the improvement protocol). Check the "How It Works" section, step 5 (actionable item routing). If your project's step 5 still describes two paths — (a) implement directly, (b) submit to Owner for approval — consider updating to the structural rule: changes within `a-docs/` → implement directly; changes outside `a-docs/` → create an entry for a future flow using your project's tracking mechanism. Do not initiate an Owner approval loop from within the backward pass. If your project has a role document equivalent to the Curator, also check whether a companion hard rule for the "outside a-docs/" path is needed.

---

### Backward pass tool mandate strengthened

**Impact:** Recommended
**Affected artifacts:** [`general/improvement/main.md`]
**What changed:** The Backward Pass Traversal tooling paragraph now explicitly prohibits manual traversal computation when a Backward Pass Orderer tool is available. Previously, the instruction said to invoke the tool for every flow; it did not explicitly prohibit manual ordering as an alternative. The new text states: when the tool is available, manual ordering is not permitted; manual ordering is reserved for projects where no tool exists or for bootstrapping cases where the tool cannot be invoked.

**Why:** "Invoke for every flow" left room for agents to apply manual ordering when a flow appeared simple. That discretion produces inconsistency and defeats the purpose of the tool. The prohibition needs to be explicit to close the gap.

**Migration guidance:** Inspect your project's `$[PROJECT]_IMPROVEMENT` (the project's instantiation of the improvement protocol). Check the Backward Pass Traversal section. If your project has a Backward Pass Orderer tool and your improvement protocol does not yet include an explicit prohibition on manual traversal when the tool is available, add the following after the "invoke it for every flow" sentence: "When a Backward Pass Orderer tool is available, manual traversal computation is not permitted. Manual ordering is reserved for projects where no such tool exists or for bootstrapping cases where the tool cannot be invoked. When the tool is available, use it — do not apply the manual traversal rules above as an alternative." If your project does not have a Backward Pass Orderer tool, no change is needed.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
