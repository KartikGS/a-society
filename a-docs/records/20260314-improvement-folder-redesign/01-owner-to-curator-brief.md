**Subject:** Improvement folder redesign — backward-pass algorithm, synthesis path, file collapse, mandatory status, and generalizable findings
**Status:** BRIEFED
**Date:** 2026-03-14

---

## Agreed Change

The improvement instruction and supporting templates have accumulated several problems: the backward-pass traversal description is imprecise, the synthesis path incorrectly routes findings back into the project's main workflow, the two-file structure (philosophy + protocol) is unnecessary overhead, the folder is wrongly marked deferrable, and there is no mechanism for surfacing project-agnostic findings to A-Society. Six design decisions address this:

**Decision 1 — Backward-pass traversal algorithm.** Replace the vague "walk from terminal to entry" description with the precise model:

1. Take each role's *first occurrence* in the forward pass; deduplicate (subsequent appearances of the same role are ignored — that role's backward-pass findings cover all their forward-pass phases).
2. Reverse the first-occurrence sequence to get the backward order.
3. Owner is always second-to-last: because Owner is the entry point for every workflow, Owner's first occurrence is always the first node in the forward pass, placing Owner second-to-last in the backward sequence.
4. Curator is always last: Curator synthesizes all findings and is never in the forward-pass execution chain.
5. Roles whose first occurrences are at the same forward-pass position (parallel fork) produce simultaneous backward-pass nodes — they produce findings concurrently, not sequentially.

Example: Forward pass `Owner → A → B + C (parallel) → A (reviews) → Owner (confirms)`. First occurrences in order: Owner, A, then B and C together. Backward sequence: B and C simultaneously → A → Owner → Curator. A's second appearance (reviews) is absorbed into A's single backward-pass node.

**Decision 2 — Synthesis path.** Remove "proposes through the standard workflow." The correct path after Curator synthesizes findings: changes within Curator authority → Curator implements directly to a-docs; changes requiring Owner judgment → Curator submits to Owner for approval, Owner decides, Curator implements. No re-entry into the project's main execution workflow. a-docs improvement is a separate, lightweight path — not a trigger input into whatever workflow the project runs for its actual work product.

**Decision 3 — Collapse main.md and protocol.md into a single file.** The split into improvement philosophy (main.md) and backward-pass protocol (protocol.md) is not warranted — both cover improvement, and splitting them adds navigation overhead without real benefit. The merged file is `improvement/main.md`. `protocol.md` is retired. This applies to both the instruction document (which describes the structure) and the general templates ($GENERAL_IMPROVEMENT and $GENERAL_IMPROVEMENT_PROTOCOL).

**Decision 4 — Mandatory at initialization, not deferrable.** The current "defer until friction has been observed" guidance is logically inverted: backward pass is the mechanism for collecting friction observations, so without the improvement folder the first cycles generate untracked friction that cannot be analyzed. The improvement/ folder is a required initialization artifact alongside thinking/. Remove all deferral language.

**Decision 5 — Generalizable findings.** Add to the protocol: when a finding appears project-agnostic — meaning it would apply equally to a software project, a writing project, and a research project — the agent should flag it as a potential A-Society contribution. This prevents universally-useful patterns from being silently discarded as local fixes. The submission mechanism is currently undefined (see $A_SOCIETY_ARCHITECTURE, Stream 3); the flag is the minimum: note it explicitly in the findings artifact so it is not lost.

**Decision 6 — $INSTRUCTION_WORKFLOW backward pass: mandatory.** Section 6 currently reads "recommended." Change to mandatory, consistent with Decision 4. Update the section content to reference the traversal algorithm in $INSTRUCTION_IMPROVEMENT rather than specifying ordering locally. Remove "How actionable findings re-enter as standard workflow observations" from the list of what the workflow should specify — that is improvement-protocol territory, not workflow territory. Step 7 in "How to Write One" should be updated in parallel.

---

## Scope

**In scope:**
- `$INSTRUCTION_IMPROVEMENT`: rewrite the traversal description (Decision 1); rewrite the synthesis path (Decision 2); update the component structure from two required files to one (Decision 3); change "When to Create This Folder" from deferrable to mandatory (Decision 4); add generalizable-findings guidance (Decision 5); fix "agent-docs" → "a-docs" in the opening sentence
- `$INSTRUCTION_WORKFLOW`: change backward pass section from "recommended" to mandatory (Decision 6); update traversal ordering to reference $INSTRUCTION_IMPROVEMENT; remove "How actionable findings re-enter as standard workflow observations"; update Step 7 accordingly
- `$GENERAL_IMPROVEMENT` + `$GENERAL_IMPROVEMENT_PROTOCOL`: merge into a single `improvement/main.md` template reflecting the new model; retire $GENERAL_IMPROVEMENT_PROTOCOL as a variable from `$A_SOCIETY_INDEX`
- Index update: remove the `$GENERAL_IMPROVEMENT_PROTOCOL` row from `$A_SOCIETY_INDEX`; update `$GENERAL_IMPROVEMENT` description if needed; update the index table in `$INSTRUCTION_IMPROVEMENT` to remove the protocol variable row and any associated project-level protocol variable guidance
- **Concurrent MAINT** (Curator authority, no Owner proposal needed): merge `$A_SOCIETY_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT_PROTOCOL` into a single `improvement/main.md` for A-Society's own a-docs, updated to reflect the new model; retire `$A_SOCIETY_IMPROVEMENT_PROTOCOL` from `$A_SOCIETY_INDEX`

**Out of scope:**
- The $GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS file — the findings template itself is not changing structure, only the prose description of how findings flow
- Any changes to role documents (Curator, Owner) — the synthesis path is described in the improvement instruction, not duplicated into role files
- Defining the A-Society contribution submission mechanism — Decision 5 adds the flag; the mechanism belongs to a future flow when Stream 3 is defined

---

## Likely Target

- `$INSTRUCTION_IMPROVEMENT` = `/a-society/general/instructions/improvement/main.md`
- `$INSTRUCTION_WORKFLOW` = `/a-society/general/instructions/workflow/main.md`
- `$GENERAL_IMPROVEMENT` = `/a-society/general/improvement/main.md`
- `$GENERAL_IMPROVEMENT_PROTOCOL` = `/a-society/general/improvement/protocol.md` (retire after merge)
- `$A_SOCIETY_IMPROVEMENT` = `/a-society/a-docs/improvement/main.md`
- `$A_SOCIETY_IMPROVEMENT_PROTOCOL` = `/a-society/a-docs/improvement/protocol.md` (retire after merge)
- `$A_SOCIETY_INDEX` = `/a-society/a-docs/indexes/main.md` (retire two variables)

---

## Open Questions for the Curator

None. The design decisions cover scope, target files, and implementation approach for all changes. Read the existing $GENERAL_IMPROVEMENT and $GENERAL_IMPROVEMENT_PROTOCOL templates before merging — retain content that remains valid under the new model, rewrite content that contradicts the new synthesis path or old traversal description.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Improvement folder redesign — backward-pass algorithm, synthesis path, file collapse, mandatory status, and generalizable findings."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
