# Backward Pass Findings: Owner — 20260407-role-jit-extraction

**Date:** 2026-04-07
**Task Reference:** 20260407-role-jit-extraction
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

- **None.** The three open questions in the brief were intentionally scoped as Curator judgment calls and resolved cleanly at proposal. No instructions conflicted during the Owner's intake, approval, or closure work.

### Missing Information

- **The brief's propagation sweep was framed additive-only and missed stale existing guide entries.** The brief scoped `$A_SOCIETY_AGENT_DOCS_GUIDE` as "additive — add entries for all new a-docs files." The Curator had to surface in the proposal that existing guide descriptions for Owner, Curator, and TA role surfaces would become inaccurate if only new-file entries were added — because the extracted content was no longer inline in those role files. The Owner approved the scope correction at review.

  Root cause: `$A_SOCIETY_OWNER_BRIEF_WRITING`'s downstream-propagation sweep rule is framed around new standing artifacts. It says to check "startup-context surface, index registration, rationale coverage in the agent-docs guide, and scaffold semantics." But it does not explicitly require checking whether extraction makes existing guide descriptions, index entries, or other descriptive surfaces inaccurate. Additive-only framing for the guide is the natural misread when the rule is incomplete. The Curator caught it, but the brief should not have required a correction-at-proposal for this.

- **The brief did not sweep the full target file for all occurrences of the removed reference.** The brief directed removal of `$INSTRUCTION_WORKFLOW_COMPLEXITY` from the workflow-routing bullet in `$A_SOCIETY_OWNER_ROLE`. A second occurrence existed in the Post-Confirmation Protocol section ("Then route per `$A_SOCIETY_WORKFLOW` and `$INSTRUCTION_WORKFLOW_COMPLEXITY`"). This second occurrence was not in the brief. The Owner caught it during approval review (correction C1 in `04-owner-to-curator.md`), not during intake.

  Root cause: The intake analysis identified the P2 violation at the workflow-routing bullet and named it in the brief without sweeping the full file for additional occurrences of the same variable. The brief-writing guidance covers insertion-boundary precision and downstream propagation, but it does not explicitly require: "when scoping removal of a reference, verify all occurrences of that reference in the target file before finalizing the brief." The second occurrence was caught only because the Owner re-read the full file at approval — which is the correct review discipline, but the error should not have left intake in the first place.

### Unclear Instructions

- **None.** OQ-1 (TA decomposition), OQ-2 (Standing Checks), and OQ-3 (Escalation Triggers) were cleanly framed and resolved.

### Redundant Information

- **None new.** The flow's intent was to remove redundancy. The forward pass was clean on this dimension. No new redundancy was introduced.

### Scope Concerns

- **None.** The Curator's scope extension (guide accuracy updates) was appropriate: it was within an already-approved target file, was not a new file change, and was well-reasoned at proposal. The extension did not require re-approval beyond the acknowledgment in the Owner's `04-owner-to-curator.md`.

### Workflow Friction

- **The findings template still lacks a reporting surface for the meta-analysis instruction's required categories.** This is the same gap noted in the `adocs-design-principles` flow. The Curator found it again here. The existing Next Priority "Backward-pass findings template alignment for standing check families" already tracks this gap and should be corroborated with this flow's source citation. No new Next Priority needed; acceleration of the existing item is warranted given two consecutive flows have felt it.

### Role File Gaps

- **The Owner's intake analysis has no documented obligation to verify all occurrences of a removal target.** See the "Missing Information" finding above. The gap is not in the role file itself — it is in the brief-writing guidance that the Owner reads JIT at brief-writing time. The rule for verifying all occurrences before finalizing a removal scope is absent from `$A_SOCIETY_OWNER_BRIEF_WRITING`.

---

## a-docs Structure Check Notes

- **Role-document scope:** All five role files now satisfy the scope rule. Each is a routing/ownership surface with JIT pointers and no inline execution guidance. No new violations introduced.
- **Owner role specifically:** The Post-Confirmation Protocol still references `$A_SOCIETY_WORKFLOW` directly in the body (the corrected line reads "Then route per `$A_SOCIETY_WORKFLOW`."). This is routing guidance, not execution guidance — no violation.
- **No redundancy remaining:** The double `$INSTRUCTION_WORKFLOW_COMPLEXITY` reference in `$A_SOCIETY_OWNER_ROLE` (workflow-routing bullet + Post-Confirmation Protocol) was fully resolved by correction C1.
- **Registration coherence:** All six new JIT documents registered. All six appear in the guide. No unregistered extracted surfaces.
- **Addition-without-removal check:** No additions were made to existing role files beyond the JIT pointer sections. No vestigial content found.

---

## Analysis Quality

**The second `$INSTRUCTION_WORKFLOW_COMPLEXITY` occurrence was caught by the Owner at approval rather than prevented at intake.** From the meta-analysis standpoint: the rule against P2 redundancy was correctly understood and applied — but applied to the instance found during analysis, not to all instances in the file. This is a "partial application" failure, not a conceptual failure. The analysis was done correctly on one instance; the question "are there other instances?" was not asked.

This pattern — applying a rule correctly to the first occurrence found without completing a full sweep — is predictable for any removal scope. The fix is a procedural obligation in the brief, not a better conceptual understanding of P2.

**The guide propagation gap was similarly a partial-scope miss.** The rule "check guide entries for new artifacts" was applied; the corollary "check guide entries that become stale due to extraction" was not. Both are the same kind of asymmetric application: the additive direction was checked, the subtractive direction was not.

---

## Top Findings (Ranked)

1. **The brief's downstream-propagation sweep rule is additive-only and does not require checking whether extraction makes existing guide descriptions stale.** — `a-society/a-docs/roles/owner/brief-writing.md`
2. **When a brief scopes removal of a reference, the brief-writing guidance does not require verifying all occurrences of that reference in the target file.** — `a-society/a-docs/roles/owner/brief-writing.md`
3. **The findings template alignment gap persists — second consecutive flow affected.** — `a-society/general/improvement/reports/template-findings.md` (corroborates existing Next Priority)

---

## Framework Contribution Candidates

1. **Propagation sweep for extraction flows must check existing description surfaces, not only new registrations.** When a brief scopes content extraction, the propagation sweep should include: "Do any existing guide descriptions, index entries, or other descriptive surfaces that reference the extracted content become inaccurate? If yes, scope those accuracy updates explicitly." This is the direct generalization of the additive-only gap found here. Potential home: `$GENERAL_OWNER_ROLE` Brief-Writing Quality.

2. **All-occurrence verification for reference removals.** When a brief scopes removal of a named reference (variable name, pointer, cross-reference), explicitly require verifying all occurrences of that reference in the target file — not just the known occurrence that triggered the analysis. A brief that names one occurrence of a removal target and does not account for others may leave a second violation in place. Potential home: `$GENERAL_OWNER_ROLE` Brief-Writing Quality.

3. **Verbatim extraction scope should name whether tool-surface terminology is in scope for normalization.** (Raised by Curator findings.) When a brief declares "content moves verbatim," this implicitly out-scopes normalization of tool names or API references that may not match the target execution environment. A one-line scope clarification — "verbatim for substantive rules; normalize tool-surface terminology if outdated" — eliminates the ambiguity. Potential home: `$GENERAL_OWNER_ROLE` Brief-Writing Quality.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260407-role-jit-extraction/08-owner-findings.md
```
