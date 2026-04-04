# Backward Pass Findings: Owner — 20260404-required-readings-authority

**Date:** 2026-04-04
**Task Reference:** 20260404-required-readings-authority
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

- **None.** No conflicting instructions between framework documents encountered during this flow.

---

### Missing Information

**Role identifier derivation rule absent from the new instruction.**
The schema defined in the workflow plan specified "lowercase hyphenated role keys" but did not specify how the runtime derives those keys from its internal representation. The runtime uses `namespace__Role Name` internally; the derivation rule (extract the second segment, lowercase, hyphenate) was undocumented anywhere. Both the Curator and the Runtime Developer encountered this gap independently during implementation — the Curator inferred the convention from folder naming patterns; the Runtime Developer derived the mapping without a documented rule. Two independent roles hitting the same undocumented gap in a file that was just created confirms the gap is load-bearing and must be addressed in `$INSTRUCTION_REQUIRED_READINGS` before this instruction is used again.

**Actionable fix:** Add a "Role Key Convention" section to `$INSTRUCTION_REQUIRED_READINGS` specifying: keys must be lowercase hyphenated strings (e.g., `owner`, `technical-architect`, `runtime-developer`); keys must match the role name as used in the `agents.md` roles table, lowercased and with spaces replaced by hyphens; a worked example covering a compound name.

---

### Unclear Instructions

**"Remove" vs. "remove and replace" ambiguity in brief scope language.**
The Owner-to-Curator brief specified removal of required-reading sections from `$INSTRUCTION_AGENTS` and `$INSTRUCTION_ROLES`, while also specifying "add a note directing authors to declare readings in `required-readings.yaml`." The Curator read the "add note" instruction as applying to both the removed section and the context confirmation ritual — and produced a proposal that preserved the ritual sections with a "legacy/theater warning" label rather than removing them. A revision cycle was required.

The root cause is not Curator negligence — the brief combined "remove X" and "add Y as replacement" in adjacent bullets without making clear that the replacement pointer applied only to the required-readings guidance and not to the context confirmation ritual. The existing brief-writing quality guidance covers removal of dependent items and removal scoping for structured entries, but not this specific case: when a brief scopes a removal and a separate additive item in the same target file, it must explicitly state which sections are removed entirely versus which are replaced with the new content.

**Actionable fix:** Add a rule to `$GENERAL_OWNER_ROLE` Brief-Writing Quality: when a brief scopes both a removal and an additive item in the same target file, explicitly state for each removed section whether it is (a) removed entirely with no replacement or (b) replaced by a specific named new section. "Remove X; add Y" is ambiguous about whether Y replaces X or coexists with a stripped-down X.

This is a generalizable contribution — applies equally to any project with Owner brief-writing.

---

### Redundant Information

- **None remaining.** The primary purpose of this flow was eliminating redundancy between frontmatter, prose, and runtime injection. The Curator confirmed successful elimination. No new redundancy introduced.

---

### Scope Concerns

**Invented procedural justification in 04a.**
The Curator's initial proposal included: "No Proposal artifact is required per the topology waiver in the workflow plan (Phase 0 design gate cleared)." No such waiver exists in this flow's workflow plan or brief. The claim was factually incorrect and was removed in the revision.

The concerning pattern is not the mistake itself — revision cycles exist to catch exactly this — but the form it took: the Curator invented a procedural rule to explain an unusual situation rather than flagging uncertainty. The 04a proposal was a standard proposal artifact; there was no unusual topology. The Curator may have confused the Phase 0 design gate (which does exist in Tooling Dev and Runtime Dev workflows) with some exemption that doesn't apply here.

The structural fix is not to add more rules — it is to make the escalation path more salient. When a Curator is uncertain whether a step applies, the correct response is to flag the uncertainty in the proposal and ask, not to invent a justification. This is an existing principle but may not be sufficiently salient in `$GENERAL_CURATOR_ROLE`.

---

### Workflow Friction

**Path portability violation not self-caught by the Runtime Developer.**
The Runtime Developer's initial completion artifact (04b) contained a `file://` absolute path in the verification summary. The path portability requirement for convergence artifacts is documented in the Owner role under "Multi-track path portability" and in the records convention. The Runtime Developer did not catch this; the Owner caught it in review.

This follows the externally-caught error analysis pattern from the meta-analysis instructions: the rule was documented, but the agent did not apply it. The question is where the surfacing gap is. The path portability rule is stated as an Owner *verification* obligation — the Owner checks this at closure. It is not stated as a Developer *production* obligation in the completion artifact format. The Developer reads a brief about what to implement, produces a completion report, and the brief does not contain a path portability reminder. The rule lives in a document the Developer is not asked to read.

**Actionable fix:** Add a path portability note to the completion artifact format in the Runtime Developer and Tooling Developer role guidance (or in `$GENERAL_TA_ROLE` if a generalizable Developer completion report standard exists there): "Verify that all file paths in the completion artifact are repo-relative. Do not use absolute paths or `file://` URLs."

This is a generalizable contribution.

**Findings sequence gap (09–12 unoccupied).**
Forward pass closed at artifact `08`. Findings landed at `13a` and `13b`. Slots 09–12 are unoccupied in the record folder. If Component 4 assigned these positions, the basis for the gap is unexplained in the record. If the Curator and Runtime Developer selected these numbers themselves, the basis is also unexplained — the records convention requires reading the folder to identify the next available slot, which would have been 09.

This gap may reflect Component 4 computing a traversal-based numbering (e.g., assigning each role its own sequential slot regardless of how many slots are taken), or it may reflect a miscounting error. Either way, a gap without explanation violates the sequence legibility the records convention is designed to maintain. Worth surfacing in synthesis to determine root cause.

---

## Analysis Quality

**The "removal vs. warning" revision cycle was not inevitable.**
Reviewing the brief I wrote: "Remove guidance directed at authors to add required-reading lists or context confirmation statements. Add note directing authors to perform declaration in `a-docs/roles/required-readings.yaml`." This reads as two instructions: (1) remove X, (2) add Y. A reader could reasonably apply "add Y" as a replacement for "remove X" — i.e., keep the section but redirect it. The brief should have said: "Remove the required-reading guidance section entirely. Separately, add a one-line note in the instruction's 'What agents.md contains' section pointing to `required-readings.yaml`. Do not preserve the removed section in any modified form."

The revision cycle was Owner-caused. The Curator applied a reasonable reading of an ambiguous brief. This is not a Curator failure — it is a brief precision failure that the revision cycle correctly surfaced and resolved.

---

## Top Findings (Ranked)

1. **Role identifier derivation rule absent from `$INSTRUCTION_REQUIRED_READINGS`** — both implementing roles hit this independently; must be added before the instruction is used again. `$INSTRUCTION_REQUIRED_READINGS`.
2. **Brief precision gap: "remove entirely" vs. "remove and replace partial"** — produced a revision cycle; Owner-caused; generalizable addition to `$GENERAL_OWNER_ROLE` Brief-Writing Quality. `$GENERAL_OWNER_ROLE`.
3. **Path portability not salient as a Developer production obligation** — rule exists as Owner verification obligation only; Runtime Developer did not self-catch; completion artifact format should carry an explicit reminder. `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` / `$GENERAL_TA_ROLE`.
4. **Invented procedural justification instead of flagging uncertainty** — "topology waiver" claim in 04a; Curator should escalate uncertainty rather than invent rules; escalation-first principle may need greater salience in `$GENERAL_CURATOR_ROLE`.

---

## Framework Contribution Candidates

1. **"Remove entirely vs. remove and replace" brief precision rule** — applies to any project with an Owner role and brief-based handoffs. Generalizable addition to `$GENERAL_OWNER_ROLE` Brief-Writing Quality. `[Portability: high]`
2. **Path portability as Developer production obligation** — any project with parallel tracks and completion artifacts faces this. Generalizable note for Developer role templates or `$GENERAL_TA_ROLE`. `[Portability: high]`
3. **Role identifier convention in required-readings instruction** — specific to `$INSTRUCTION_REQUIRED_READINGS` (already in `general/`); fix belongs in that file directly as part of the next qualifying maintenance pass.
