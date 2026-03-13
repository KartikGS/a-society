# A-Society Framework Update — 2026-03-14

**Framework Version:** v6.0
**Previous Version:** v5.0

## Summary

`$INSTRUCTION_WORKFLOW` has been updated with nine improvements: one Breaking reclassification (session model is now mandatory for workflows with two or more roles), five Recommended additions (Owner as entry and terminal node, session reuse rules clarified, copyable transition outputs, backward pass as a workflow section, branching patterns clarified), and one Optional addition (parallel fork and join patterns). Projects initialized at v5.0 or earlier should review their workflow documents against the Breaking and Recommended changes.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap in your current `a-docs/` — Curator must review |
| Recommended | 5 | Improvements worth adopting — Curator judgment call |
| Optional | 1 | New patterns — adopt only if parallel execution applies |

---

## Changes

### 1. Session model: mandatory for workflows with two or more roles

**Impact:** Breaking
**Affected artifacts:** `$[PROJECT]_WORKFLOW` (your project's workflow document)
**What changed:** The session model section in `$INSTRUCTION_WORKFLOW` was reclassified from "recommended" to "mandatory for any workflow with two or more roles." The exemption for "projects where the entire graph runs in one session" was removed — any workflow with two or more roles has a real orchestration burden that requires a session model.
**Why:** The prior wording allowed multi-role workflows to omit the session model, leaving the human without guidance on session switching and leaving agents without instructions on what to produce at pause points.
**Migration guidance:** Check your project's workflow document (`$[PROJECT]_WORKFLOW`). If the workflow has two or more roles and the document lacks a session model section, add one. The session model should describe: which roles run in which sessions, where the natural pause points are, what the human does at each transition, and when to start a new session versus resume an existing one. See `$INSTRUCTION_WORKFLOW` section 5 for the current specification.

---

### 2. Owner as workflow entry and terminal node

**Impact:** Recommended
**Affected artifacts:** `$[PROJECT]_WORKFLOW`
**What changed:** The Owner section of `$INSTRUCTION_WORKFLOW` was expanded and renamed. The Owner is now described as both the entry node (routing work in) and the terminal node (receiving completion, acknowledging, and directing the backward pass) for every workflow. A delegated-authority exception was added: projects may designate flow types where a specific role closes without Owner terminal confirmation, provided the scope is explicitly bounded in the workflow document.
**Why:** The prior text described the Owner only as entry point. Omitting the terminal role left no standard for how workflows closed and no principle governing backward pass ordering.
**Migration guidance:** Check whether your project's workflow document describes what happens when a workflow completes — specifically, whether the Owner is identified as the role that receives completion and initiates the backward pass. If the workflow document ends at the final non-Owner phase with no stated return to the Owner, consider adding a terminal step. Also check whether any flow types you treat as delegated-authority (where a role other than the Owner closes a flow) are explicitly bounded in the workflow document.

---

### 3. Session reuse rules: within-flow vs. at-flow-close

**Impact:** Recommended
**Affected artifacts:** `$[PROJECT]_WORKFLOW`
**What changed:** The session reuse rule was split into two distinct cases. Within a flow: resume existing sessions by default. At flow close: start fresh sessions for the next flow — accumulated context from a completed flow is almost always noise for a new one.
**Why:** The prior single rule ("resume unless exhausted") did not address the flow-close case. Agents and humans had no guidance on whether to carry session context from one flow into the next.
**Migration guidance:** If your project's workflow document has a "when to start a new session" section, check whether it addresses the at-flow-close case. Add a rule stating that new flows begin with fresh sessions for each role. The within-flow rule (resume by default) likely already exists and needs no change.

---

### 4. Transition behavior: copyable artifact path and session-start prompt

**Impact:** Recommended
**Affected artifacts:** `$[PROJECT]_WORKFLOW`
**What changed:** The transition behavior description in `$INSTRUCTION_WORKFLOW` now specifies that at each pause point the agent must produce: (a) a copyable artifact path — always; and (b) a copyable session-start prompt when a new session is required (format: "You are a [Role] agent for [Project Name]. Read [path to agents.md]."). The prior text described the substance but not the required output format.
**Why:** Without explicit output requirements, agents produced varied handoff descriptions. The copyable path and prompt are the minimum for the human to resume another session correctly.
**Migration guidance:** Check your project's workflow document session model section (or transition behavior description if one exists). Verify it instructs agents to produce a copyable artifact path at every pause point and a copyable session-start prompt when a new session is required. If not, add this requirement. This aligns with the v5.0 handoff standard already present in role documents.

---

### 5. Backward pass as a recommended workflow section

**Impact:** Recommended
**Affected artifacts:** `$[PROJECT]_WORKFLOW`
**What changed:** A new section 6 ("Backward Pass — recommended") was added to `$INSTRUCTION_WORKFLOW`. The section explains what a backward pass is, when to include it in a workflow document, and what the entry should contain (roles, ordering, where findings go). The ordering rule: start closest to implementation, end with Owner.
**Why:** Prior to this change, `$INSTRUCTION_WORKFLOW` had no mention of the backward pass or improvement cycle. Any project following this instruction would build a workflow without a structured improvement loop.
**Migration guidance:** If your project's workflow document does not describe a backward pass and the workflow runs repeatedly, consider adding one. The entry should name the participating roles, state the ordering (implementation-closest role first, Owner last), and identify where findings go (typically the project's improvement folder or records structure). Reference your project's improvement protocol if one exists (`$[PROJECT]_IMPROVEMENT_PROTOCOL`).

---

### 6. Branching: conditional vs. parallel fork/join distinction

**Impact:** Recommended (clarification) + Optional (new patterns)
**Affected artifacts:** `$[PROJECT]_WORKFLOW`
**What changed:** The branching section in `$INSTRUCTION_WORKFLOW` was split into two named sub-patterns: (a) Conditional branching — one edge fires per decision, based on transition condition; (b) Parallel fork and join — multiple edges fire simultaneously; a join node waits for all required inputs before proceeding. Additionally, two new vocabulary terms were added to the core graph model section: "Parallel fork" and "Join." The failure mode "Merged with role documents" was also corrected: the prior text said "no one can see the whole process" (which is the intended design — only the Owner reads the full workflow map); the corrected text states that the actual failure is process rules fragmented across role files, producing version divergence.
**Why:** The prior branching text implied that conditional branching and parallel execution were the same mechanism. This was incorrect — parallel forks fire multiple edges simultaneously while conditional branches fire one. The prior failure mode description contradicted the Owner-as-sole-reader principle stated elsewhere in the instruction.

**Migration guidance (Recommended — applies to all projects with branching):** If your project's workflow document describes branching, check whether you have both conditional branches (one path fires) and parallel forks (multiple paths fire simultaneously). If you have parallel execution, ensure the distinction is explicit in the document. If your workflow document has a "merged with role documents" failure description, verify it describes the failure as process rule fragmentation — not as a visibility problem.

**Migration guidance (Optional — applies only if your project uses parallel execution):** If your project runs work in parallel branches that must synchronize before the workflow continues, consider adding explicit "parallel fork" and "join" language to your workflow document. Parallel forks and joins are part of the standard graph vocabulary after this update.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle. This delivery gap is known and acknowledged.
