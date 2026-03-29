# Owner Findings: Workflow schema unification — Framework Dev phase (4 files)

**Flow ID:** `20260329-workflow-schema-unification`
**Role:** Owner
**Date:** 2026-03-29

---

## Meta-Analysis

### Top Findings

**Finding 1 — Revise cycle was an Owner brief gap, not a Curator omission**

Correction B (Change 2e) added the mirror of Change 1d to `$INSTRUCTION_RECORDS`. This was missing from the brief, not from the Curator's proposal — the Curator proposed correctly per what was scoped. The root cause: `$A_SOCIETY_RECORDS` and `$INSTRUCTION_RECORDS` are a mirrored pair (project-specific instantiation and general instruction), and the brief scoped the project-specific file (Change 1d) without assessing whether the same update was required in the general counterpart. A brief that modifies a project-specific record convention must explicitly assess the general instruction counterpart as part of scoping. "None" in Open Questions was incorrect — it signaled that no judgment calls were required, when in fact a scoping judgment was not made.

**Actionable:** Add a brief-writing quality rule to `$GENERAL_OWNER_ROLE` (and mirror to `$A_SOCIETY_OWNER_ROLE`): when a brief modifies a project-specific convention that instantiates a general instruction, the general counterpart must be assessed in-brief and either scoped as a co-change or explicitly declared out of scope with rationale. Absent explicit treatment, the Curator must guess whether the mirror is in scope — which is the condition that produced Correction B.

**Finding 2 — Vocabulary sweep omission propagated through proposal to review**

Correction A (changing "distinct entry" to "distinct node") caught legacy path-model language in the completeness obligation example. The brief specified schema replacement but did not instruct the Curator to sweep surrounding prose for vocabulary consistency. The Curator updated the schema blocks and the explicitly-scoped clauses but did not sweep independently because no such obligation existed in their role. The finding was caught at Owner review — the right mechanism, but a revise cycle earlier than necessary. The Curator's proposal-stage responsibility and the Owner's brief-writing responsibility both bear on this.

**Actionable:** Two-sided fix — Owner brief should flag vocabulary sweep as a required co-task for any schema migration; Curator role should require a terminology sweep when implementing a schema change (checking that prose surrounding the schema adopts the new field names). Both additions belong in the same role-guidance precision area as existing bundle items.

---

## Assessment of Curator Findings

**Finding 1 (Stale Proposal Risk / Anchor Drift):** Valid observation about friction from parallel flows, but this is a known operational reality rather than a fixable structural gap. The immediately adjacent anchor approach (already in the Role guidance precision bundle, item 2) is the mitigation. No new item warranted.

**Finding 2 (Vocabulary Inertia):** Correct and aligns with Owner Finding 2. Merge.

**Finding 3 (Brief-to-Instruction Gap):** Correct framing, but the root cause sits on the Owner side — see Owner Finding 1. The fix belongs in `$GENERAL_OWNER_ROLE` brief-writing quality, not solely in the Curator's role. Merge into the Role guidance precision bundle along with the Owner-side framing.

**Finding 4 (Component 4 Incompatibility):** Correctly identified. Already tracked in the Workflow schema unification Next Priorities item (Tooling Dev phase). No new item.

---

## Next Priorities Merge Assessment

All actionable findings (Owner Findings 1 and 2, Curator Findings 2 and 3) target `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`, fall within the role-guidance precision design area, carry `[LIB]` authority, and follow the Framework Dev workflow path. The existing "Role guidance precision bundle" item already targets these same files and design area. **Merge into the existing bundle** — add two new items (brief mirror-assessment requirement and vocabulary sweep requirement) and update source citations.

---

## Handoff to Synthesis

```
Next action: Synthesize findings from 07-curator-findings.md and 08-owner-findings.md; implement any a-docs/ changes directly; merge actionable items into the Role guidance precision bundle in $A_SOCIETY_LOG
Read: a-society/a-docs/records/20260329-workflow-schema-unification/08-owner-findings.md
Expected response: Curator synthesis filed; log updated; flow closed
```
