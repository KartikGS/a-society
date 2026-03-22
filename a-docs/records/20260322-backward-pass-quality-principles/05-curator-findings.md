# Backward Pass Findings: Curator — 20260322-backward-pass-quality-principles

**Date:** 2026-03-22
**Task Reference:** 20260322-backward-pass-quality-principles
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

- The Curator hard rule ("Never begin implementation without a Phase 2 APPROVED decision artifact") is categorical — it does not include a check-the-workflow-first step. The brief marked Item 1 as `[Requires Owner approval]`, which the hard rule pattern-matched to "needs proposal → approval cycle." But the workflow had no Proposal phase; `[Requires Owner approval]` referred to Owner review at Phase 3 (Review & Forward Pass Closure), not a pre-implementation gate. These two signals — the hard rule's categorical framing and the brief's label — pointed in different directions, and I resolved the conflict incorrectly by applying the hard rule without consulting the workflow topology.

### Missing Information

- The Curator hard rule has a MAINT exemption (`[MAINT]` or `[Curator authority — implement directly]`) but no parallel exemption for flows that have no Proposal phase. The rule is written as if the standard framework development cycle (Proposal → Approval → Implementation) is the only topology. There is no guidance that says "if the workflow contains no Proposal node, the brief and handoff together constitute authorization." This left a gap that caused the spurious proposal artifact.

### Unclear Instructions

- none

### Redundant Information

- none

### Scope Concerns

- none

### Workflow Friction

- **Spurious proposal artifact produced and deleted.** I created `03-curator-proposal.md` based on a mis-application of the Approval Invariant, then deleted it after the Owner corrected the interpretation. No lasting damage, but unnecessary artifact churn.

- **VERSION.md header not updated — caught externally.** After adding the v17.6 row to the history table in VERSION.md, I verified by re-reading only the table rows (lines 53–56). I did not re-read the header section (lines 1–5) where the `**Version:**` field lives. The Owner caught and corrected this. Root cause: partial verification — I checked what I added (table row) but not what I should also have updated (header field). The update report protocol does not enumerate the two distinct write targets in VERSION.md (header + history row), which would have prompted a two-target check.

---

## Top Findings (Ranked)

1. **Approval Invariant applied without workflow topology check** — `$A_SOCIETY_CURATOR_ROLE` hard rules section: the rule is categorical and has no directive to verify whether the active workflow includes a Proposal phase before treating `[Requires Owner approval]` as a pre-implementation gate.
2. **VERSION.md has two update targets; neither the protocol nor the version file calls this out** — `$A_SOCIETY_UPDATES_PROTOCOL` / `$A_SOCIETY_VERSION`: the update protocol says "Curator updates `$A_SOCIETY_VERSION` as part of Phase 4" but does not list header + history row as separate required writes; a partial edit is not detectable without a full re-read.
3. **No workflow-topology-aware guidance in Curator hard rules** — `$A_SOCIETY_CURATOR_ROLE`: MAINT exemption handles authority-level differences, but there is no exemption or clarification for abbreviated flow topologies where the standard Proposal phase is structurally absent.
