# A-Society Framework Update — 2026-03-14

**Framework Version:** v8.0
**Previous Version:** v7.0

## Summary

The improvement folder has been redesigned: the synthesis path was corrected (findings no longer re-enter the main workflow as trigger inputs), the two-file structure (main.md + protocol.md) was collapsed into a single file, and the improvement folder is now a required initialization artifact rather than deferrable. Projects that have already initialized their `a-docs/` should review their improvement infrastructure against the changes below. Three changes are Breaking; three are Recommended.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 3 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 3 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### 1. Synthesis path corrected

**Impact:** Breaking
**Affected artifacts:** `$GENERAL_IMPROVEMENT`, `$INSTRUCTION_IMPROVEMENT`
**What changed:** The synthesis path for improvement findings was corrected. The old model said findings that warrant action "re-enter the workflow as new trigger inputs" — meaning improvement items went back through the project's main execution workflow. The correct model is a two-path lightweight loop: changes within the synthesis role's authority are implemented directly to a-docs; changes requiring Owner judgment are submitted to the Owner for approval and then implemented. Improvement items do not re-enter the main workflow.
**Why:** The old synthesis path conflated a-docs maintenance with the project's primary work product process, adding unnecessary overhead and misdescribing how improvement findings actually route.
**Migration guidance:** Check your project's `$[PROJECT]_IMPROVEMENT` file and any `$[PROJECT]_IMPROVEMENT_PROTOCOL` file (if your project has one) for language stating that findings "re-enter the workflow as trigger inputs," "initiate a new trigger input for Phase 1," or equivalent. Replace with the two-path model: (1) changes within synthesis role authority → implement directly to a-docs; (2) changes requiring Owner judgment → submit to Owner for approval, implement after approval. Update any workflow document sections that describe the backward pass outcome in terms of workflow re-entry.

---

### 2. Improvement folder file structure collapsed — protocol.md retired

**Impact:** Breaking
**Affected artifacts:** `$GENERAL_IMPROVEMENT_PROTOCOL` (retired), `$INSTRUCTION_IMPROVEMENT`, `$GENERAL_IMPROVEMENT`
**What changed:** The two-file improvement structure (philosophy in `main.md`, backward pass protocol in `protocol.md`) has been collapsed into a single `main.md`. `$GENERAL_IMPROVEMENT_PROTOCOL` is retired and the template file has been removed from the framework. The merged `main.md` covers both philosophy and protocol.
**Why:** The split was not warranted — both files covered improvement, and the separation added navigation overhead without benefit. Philosophy and protocol are loaded together by the same agent for the same purpose.
**Migration guidance:** If your project's `improvement/` folder contains a separate `protocol.md`, its content should be merged into `improvement/main.md` and the `protocol.md` file retired. Check your project's file path index for a `$[PROJECT]_IMPROVEMENT_PROTOCOL` variable — if present, remove that row and update any documents that reference it. The merged `main.md` should cover principles, backward pass traversal, the "How It Works" steps, reflection categories, lenses, and guardrails. Use `$GENERAL_IMPROVEMENT` as the updated template reference.

---

### 3. improvement/ folder is now a required initialization artifact

**Impact:** Breaking
**Affected artifacts:** `$INSTRUCTION_IMPROVEMENT`
**What changed:** The guidance "A new project with no execution history can defer this folder until friction has been observed" has been removed. The `improvement/` folder is now a required initialization artifact, created alongside `thinking/` at project setup.
**Why:** The backward pass is the mechanism for collecting friction observations. Without it in place from the first execution cycle, friction from early cycles is untracked and cannot be analyzed. Deferring the improvement folder means losing signal from the cycles where it is most needed.
**Migration guidance:** If your project's `a-docs/` does not have an `improvement/` folder, create one now. Use `$GENERAL_IMPROVEMENT` as the template for `improvement/main.md`. Register `$[PROJECT]_IMPROVEMENT` in your project's file path index. If your project uses a records structure, findings go in the record folder; if not, create `improvement/reports/` using `$GENERAL_IMPROVEMENT_REPORTS` as the template, and register it in your index.

---

### 4. Backward pass traversal algorithm

**Impact:** Recommended
**Affected artifacts:** `$GENERAL_IMPROVEMENT`, `$INSTRUCTION_IMPROVEMENT`
**What changed:** The vague "walk from terminal to entry" traversal description has been replaced with a precise five-step algorithm: (1) identify each role's first occurrence in the forward pass; (2) reverse the first-occurrence sequence; (3) Owner is always second-to-last (first occurrence is always first); (4) synthesis role is always last; (5) roles with parallel first occurrences produce findings concurrently.
**Why:** "Walk from terminal to entry" was ambiguous when roles appeared multiple times in the forward pass or when the workflow had parallel branches. The algorithm eliminates the ambiguity.
**Migration guidance:** Review your project's `$[PROJECT]_IMPROVEMENT` file. If the backward pass ordering is described vaguely (e.g., "start closest to implementation, end with Owner") without addressing deduplication of repeated roles or parallel forks, add the traversal algorithm. Adapt the five steps to your project's specific roles, naming which role produces findings first (per the traversal algorithm). Example: if your forward pass is `Owner → Curator → Owner (confirms)`, first occurrences are Owner and Curator in that order; backward sequence is Curator → Owner → synthesis role last.

---

### 5. Workflow backward pass section: recommended → mandatory

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_WORKFLOW`
**What changed:** Section 6 "Backward Pass" in the workflow instruction changed from "(recommended)" to "(mandatory)". The guidance to specify local traversal ordering was removed — the workflow document should reference `$INSTRUCTION_IMPROVEMENT` for traversal order rather than specifying it inline. The sentence "Findings re-enter the workflow as proposals for the next iteration" was removed (superseded by Change 1 above). Step 7 in "How to Write One" was updated to match.
**Why:** Consistent with the improvement folder now being a required artifact (Change 3), the backward pass section in the workflow document should reflect that the backward pass is not optional. Traversal ordering belongs in the improvement file, not duplicated in the workflow document.
**Migration guidance:** If your project's workflow document has a backward pass section, review it for: (a) "(recommended)" or conditional language — update to state the backward pass is mandatory; (b) locally-specified traversal ordering — replace with a reference to your `$[PROJECT]_IMPROVEMENT` file; (c) any statement that findings re-enter the main workflow — remove or correct per Change 1. If your project's workflow document does not have a backward pass section, add one.

---

### 6. Generalizable findings guidance

**Impact:** Recommended
**Affected artifacts:** `$GENERAL_IMPROVEMENT`, `$INSTRUCTION_IMPROVEMENT`
**What changed:** A "Generalizable Findings" section has been added to the backward pass protocol. When a finding appears project-agnostic — applicable equally to a software project, a writing project, and a research project — agents are instructed to flag it explicitly in their findings artifact as a potential framework contribution, rather than silently treating it as a local fix.
**Why:** Without this guidance, universally-useful patterns surfaced during backward passes are easily lost when treated as project-specific improvements. The flag ensures they are preserved for potential propagation to the framework's general library.
**Migration guidance:** If your project has a relationship with a framework provider (e.g., A-Society), consider adding a "Generalizable Findings" section to your project's `$[PROJECT]_IMPROVEMENT` file. Define what "generalizable" means for your project context and where flagged findings should be noted. If your project has no such relationship, this guidance is not applicable.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle. This limitation is known and acknowledged.
