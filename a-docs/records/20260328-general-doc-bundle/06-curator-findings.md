# Backward Pass Findings: Curator — 20260328-general-doc-bundle

**Date:** 2026-03-28
**Task Reference:** 20260328-general-doc-bundle
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

- None.

---

### Missing Information

**1. No proposal-stage standard for matching rendering patterns of existing formatted blocks**

When drafting the Item 4b worked example, I reproduced the brief's backtick-fence presentation of the `handoff` block rather than checking how existing worked examples render in the target file. The result: my proposal nested the handoff block inside an outer triple-backtick fence. The target document (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`) renders handoff blocks as direct fenced blocks — not nested — matching the format of the resume/start-new examples already present. The Owner caught this in review and added a constraint; the rendering was corrected at implementation time.

The root cause was not a failure to read the file — I had read `$INSTRUCTION_MACHINE_READABLE_HANDOFF` before drafting. The failure was not cross-checking the rendering pattern of the existing worked examples against my proposed content. This check is available at proposal stage but is not called out as an obligation anywhere.

The existing "Implementation stage — re-read before editing" practice in the Curator role explicitly covers Edit construction. There is no parallel standard for the proposal stage when proposed content includes formatted blocks that must match an existing document's rendering pattern.

**Generalizable finding:** Any Curator proposing content that includes code fences or other formatted blocks to be inserted into an existing instruction document faces this risk. The verbatim-matching discipline that applies at implementation time should also apply at proposal stage for rendered-content insertions.

---

### Unclear Instructions

**2. Item 2d insertion boundary referenced non-adjacent anchors**

The brief specified the insertion boundary for the "Library flows and update report drafts" paragraph as: "after the paragraph ending '...those two contexts only.' and before the paragraph beginning 'Classification guidance issued in update report phase handoffs...'"

Reading `$GENERAL_OWNER_ROLE`, a third paragraph (`**Behavioral property consistency:**`) sits between those two anchor points. The brief described a range bounded by the first and third paragraphs — not specifying the correct immediate neighbor on either side. The contextual fit of the new paragraph (it expands on the classification prohibition just stated) made the correct position clear: insert between "...those two contexts only." and "**Behavioral property consistency:**". I got it right, but it required judgment rather than mechanical boundary-following.

The correct brief formulation per the existing "Prose insertions" guidance would have been: "after the paragraph ending '...those two contexts only.' and before the paragraph beginning '**Behavioral property consistency:**'". The existing guidance says to provide "the exact target clause or phrase at the insertion boundary" — this brief used a non-adjacent anchor, which technically names the right range but leaves the immediate neighbor unspecified.

This is a brief-writing quality gap (Owner), not a Curator-process gap — but it's worth flagging as a validation case for whether the existing Prose insertions guidance is being applied at full precision.

**3. Decision constraint #4 scope ("for any files in `a-docs/`")**

Decision constraint #4 read: "Register it in `$A_SOCIETY_PUBLIC_INDEX` during Phase 4. Also verify whether `$A_SOCIETY_INDEX` needs updating for any files in `a-docs/`."

The new file (`general/roles/technical-architect.md`) is in `general/`, not `a-docs/`. The constraint's qualifier "for any files in `a-docs/`" could be read as limiting the internal index check to a-docs files — which would exclude the new file. I checked the existing pattern (`$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` are both registered in the internal index despite being general/ files) and added the entry for consistency. This was the right call, but the constraint wording was slightly ambiguous about whether general/ files should also be checked against the internal index.

Low severity — the pattern check resolved it. But the constraint could have been written: "Also verify whether `$A_SOCIETY_INDEX` needs updating for any newly created or modified files."

---

### Redundant Information

- None.

---

### Scope Concerns

- None. All nine item-2 changes, plus items 1, 3, 4, 11, and 13, stayed within brief scope. The MAINT exclusion (a-docs role files already applied in prior sessions) was clear and correctly respected.

---

### Workflow Friction

**4. Proposal-stage rendering miss required a review-stage constraint**

The Item 4b rendering issue (Finding 1 above) was caught at Owner review rather than at proposal submission. This meant an extra constraint was added to the approval — which is the correct mechanism, but the constraint would not have been necessary if the rendering pattern had been verified at proposal time. The Owner's review absorbed the check that should have been a Curator proposal-stage obligation.

This is the same failure mode that the existing "re-read before editing" practice addresses at implementation time: using the actual source text rather than a brief's description. The same discipline should apply at proposal time: when proposing content that includes formatted blocks, verify the rendering pattern of adjacent content in the target file before drafting.

**5. Update report TBD classification resolved cleanly — no friction**

The TBD approach for classification (brief-directed, proposal-drafted, resolved post-implementation) worked as designed. The new "Library flows and update report drafts" guidance added in item 2d to `$GENERAL_OWNER_ROLE` correctly captures this pattern. Observed for completeness: no friction occurred here, but the pattern is now documented in the general library.

---

## Top Findings (Ranked)

1. **Proposal-stage rendered-content matching: no standard exists** — `$A_SOCIETY_CURATOR_ROLE` / `$GENERAL_CURATOR_ROLE` (Implementation Practices). Caught at review (Owner constraint); the check was available at proposal stage but not applied. Generalizable to any Curator proposing formatted-block insertions.

2. **Insertion boundary with non-adjacent anchors leaves immediate neighbor unspecified** — `$GENERAL_OWNER_ROLE` (Brief-Writing Quality / Prose insertions). The existing guidance requires "the exact target clause or phrase at the insertion boundary" — the brief provided a range but not the immediate neighbor. Validation case for whether existing guidance is being applied at full precision.

3. **Decision constraint #4 internal index scope wording slightly ambiguous** — `04-owner-to-curator.md`. Low severity, resolved by pattern check. Suggested rephrase: "verify whether `$A_SOCIETY_INDEX` needs updating for any newly created or modified files."
