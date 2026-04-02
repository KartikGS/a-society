---
type: backward-pass-findings
role: technical-architect
date: "2026-04-02"
---

# Backward Pass Findings: Technical Architect — parallel-track-orchestration

**Date:** 2026-04-02
**Task Reference:** parallel-track-orchestration
**Role:** Technical Architect
**Depth:** Full

---

## Findings

### Conflicting Instructions

- **None.** The brief was internally consistent. No conflict between `02-owner-to-ta-brief.md` and any upstream document affected the advisory's design decisions.

---

### Missing Information

- **Max-distance-per-role pinning was not specified in the §5 algorithm.** The BFS pseudocode in `03-ta-to-owner.md` §5 Step 5 deduplicated roles by first-seen BFS distance (ascending after correction), but did not include a "max-distance-per-role" step. For multi-occurrence roles — specifically Owner, which has nodes at distances 0, 2, 4, 6, and 8 — first-seen ascending distance would place Owner at distance 0 (the `owner-closure` node), putting it *first* in the backward pass rather than second-to-last. The correct behavior requires pinning each role to its *maximum* BFS distance (its earliest forward-pass appearance) before grouping. This step was absent from the advisory's pseudocode and from the §8 behavioral requirements row for `backward-pass-orderer.ts`. The Tooling Developer's findings (`13a`) report that this was resolved, attributed to "a mid-phase code adjustment from the Technical Architect" — but no such consultation is recorded in this flow's artifact sequence. Either the Developer resolved it independently (undocumented design decision) or an undocumented TA consultation occurred (protocol gap). Either way, the algorithm gap in the advisory was the origin point. — `03-ta-to-owner.md` §5, `13a-tooling-developer-findings.md`

---

### Unclear Instructions

- **§5 sort polarity was stated correctly in words but specified incorrectly in pseudocode.** `03-ta-to-owner.md` §5 Step 4 specified `sortedDistances` computed with descending sort `(b - a)`, described as producing "highest distance first." The intent was to reach roles farthest from the terminal (earliest in the forward pass) at the end of the backward pass — making them last in the meta-analysis sequence. But descending sort by distance produces *forward-pass* order (farthest-from-terminal first), which is the opposite of the required backward-pass order. The correct sort is ascending `(a - b)`: roles closest to terminal (distance 0, latest in forward pass) appear first in the backward pass traversal. The Tooling Developer caught and corrected this during implementation. Root cause: I conflated "this node ran first in the forward pass" (correct: highest BFS distance) with "this node should appear first in the backward pass" (incorrect — it should appear last). The advisory's prose intent was right; the pseudocode encoded the inverse. — `03-ta-to-owner.md` §5 Step 4, `13a-tooling-developer-findings.md` Finding 1

---

### Redundant Information

- **None.**

---

### Scope Concerns

- **None.** Advisory scope was correct and bounded. No authority boundary issue arose.

---

### Workflow Friction

- **§3 regex verification was performed against existing code behavior, not against `$INSTRUCTION_MACHINE_READABLE_HANDOFF` as the authoritative contract.** The advisory stated that the existing regex (`/```(?:yaml)?\s*[\n\r]+handoff:([\s\S]*?)```/i`) and YAML prepend strategy (`handoff:${match[1]}`) would handle both single-object and array forms "without modification." This claim was correct for the existing code's behavior — both forms produce parseable YAML after prepending `handoff:`. However, the instruction format (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`) specifies `handoff` as the fence *tag*, with `role`/`artifact_path` as top-level fields in the block content — not as a key nested under `handoff:`. The existing parser happened to work because agents in practice were emitting `handoff:` as a YAML key inside a plain ``` ``` ``` fence. The Runtime Developer (`13b`) found a conflict when implementing strict instruction-format compliance for the new array form and had to produce a multi-tag parser to handle both styles. The advisory's verification gap: the advisory-level standard requires checking the instruction document as the primary contract, not inferring contract compliance from the pre-existing implementation. A claim that "the existing regex works" is an operational claim, not a specification claim, and requires verifying the implementation against the specification — not just against itself. — `03-ta-to-owner.md` §3, `13b-runtime-developer-findings.md` Finding 1

- **No lightweight mid-implementation clarification mechanism exists for spec ambiguities.** The Tooling Developer encountered a non-trivial algorithm gap (the max-distance-per-role pinning) during implementation. The available resolution paths were: (a) implement an independent judgment call without recording it, (b) surface a deviation report to Owner/TA which involves a full artifact and review cycle, or (c) attribute the resolution informally to the TA with no record. The findings suggest path (c) was taken. The framework's current deviation protocol (`$A_SOCIETY_COMM_FEEDBACK_PROTOCOL`) handles discrepancies by surfacing to the intake role, but there is no defined lightweight path for a Developer to resolve a spec ambiguity with the TA mid-implementation without producing a full artifact. For non-blocking ambiguities resolvable in minutes, the overhead of a formal deviation record may be disproportionate — but the absence of any record creates traceability gaps visible in this backward pass. — `13a-tooling-developer-findings.md` Finding 3, `$A_SOCIETY_COMM_FEEDBACK_PROTOCOL`

---

## Top Findings (Ranked)

1. **Algorithm pseudocode missing max-distance-per-role pinning** — advisory §5 was incomplete at the step that determines backward-pass position for multi-occurrence roles; the omission was in both the prose algorithm and the §8 behavioral requirements checklist. — `03-ta-to-owner.md` §5 and §8
2. **Sort polarity inversion in §5 pseudocode** — descending sort by BFS distance produces forward-pass order; the correct sort for backward-pass traversal is ascending. Caught and corrected by the Tooling Developer during implementation. — `03-ta-to-owner.md` §5 Step 4
3. **Regex claim verified against implementation, not specification** — advisory §3 asserted the existing regex handled both handoff forms "without modification" without checking `$INSTRUCTION_MACHINE_READABLE_HANDOFF` as the governing contract; the Runtime Developer found a format divergence between the instruction and the prior implementation. — `03-ta-to-owner.md` §3

---

## Generalizable Findings

- **Advisory pseudocode for multi-step algorithms requires a "role deduplication" step with explicit per-role pinning semantics when roles appear at multiple positions in the workflow graph.** For any algorithm that reduces a node graph to a role sequence, the deduplication logic must specify: which node determines a role's position when it appears more than once (first occurrence? last? max distance? min distance?) and what the consequence is for roles that span fork-join structures. This specification belongs in both the prose algorithm and the §8 behavioral requirement. Leaving deduplication behavior implicit produces implementations that are correct for simple graphs but wrong for graphs with Owner bookends and revision loops.

- **Specification verification for regex-based parsers should consult the format instruction, not the existing implementation.** When an advisory specifies that an existing parser "handles the new format without modification," the verification obligation is: (1) read the format instruction, (2) construct a representative example from the instruction's worked example, and (3) confirm the regex and parse strategy handle it correctly. Inferring format compliance from "the current code works" is insufficient when there is a specification document that could have drifted from the implementation.

---

Next action: Perform your backward pass meta-analysis (step 5 of 6).
Read: all prior artifacts in the record folder, then ### Meta-Analysis Phase in a-society/general/improvement/main.md
Expected response: Your findings artifact at the next available sequence position in the record folder. When complete, hand off to Curator (synthesis).
