# Backward Pass Findings: Owner — registry-frontmatter-reader

**Date:** 2026-03-30
**Task Reference:** registry-frontmatter-reader
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- None.

### Unclear Instructions
- None.

### Redundant Information

- **`Context Loading` prose vs. YAML `required_reading` frontmatter in role files.** Three independent roles (Curator, Runtime Developer, TA) identified the same finding: role documents now contain required-reading lists in two forms — the YAML block consumed by the runtime and the natural-language `Context Loading` section read by agents and humans. These lists are presently identical, creating a synchronization surface. This is a structural consequence of adding the runtime layer: the runtime reads the machine-readable block; agents without runtime access read the prose. Both exist because both consumers exist. This is not an error in the current flow — the duplication was introduced intentionally in `20260329-agent-context-frontmatter`. The question for routing: is there a structural fix (e.g., prose explicitly references the YAML as authoritative and defers to it, rather than restating it), or is the duplication a necessary cost of serving two consumers? This warrants a dedicated flow — the answer touches how role files are structured and potentially how agents without runtime access orient. Not within synthesis authority to resolve unilaterally.

### Scope Concerns
- None.

### Workflow Friction

- **workflow.md omitted the Owner intake node.** The Owner is always the first node in any flow — the workflow plan and brief are Owner-produced intake actions. In this flow's `workflow.md`, TA was listed first. The result: Component 4 computed Curator → Runtime Developer → Owner → TA as the backward pass order, placing Owner third and TA last. The correct order (with Owner as first node) would be Curator → Runtime Developer → TA → Owner → Curator (synthesis). The error was caught by the human and corrected mid-backward-pass. Root cause: no rule in `$A_SOCIETY_RECORDS` states that Owner must appear as the first node in `workflow.md` when the Owner performs intake — the completeness obligation covers "every role step including intermediate Owner checkpoints," but does not surface the specific invariant that Owner is always the first node of any A-Society flow. The Owner should have caught this at intake; the `workflow.md` completeness obligation did not make it obvious.

- **TA advisory accepted "working" characterization of `paths.ts` without reading the utility.** The brief stated `resolveVariableFromIndex()` was "already available and working." The TA advisory was written on that basis. The utility had a broken regex that silently failed for most variable names. The TA flagged this in their findings (Top Finding 1) and noted no advisory standard currently requires correctness verification of declared-operational utilities. This is a genuine gap: existence and correctness are different claims. A brief saying a file "exists" is a weaker claim than "is working" — the latter implies the implementation was read and confirmed correct. The TA's existing directory-scoped verification requirement covers existence claims; a parallel requirement for correctness of declared-operational utilities (read the implementation before relying on it) does not exist.

- **§3 error handling spec assigned logging to both layers without specifying ownership.** The TA finding (Top Finding 2) correctly identifies that `extractFrontmatter` logging + `buildRoleContext` logging produced a double-log watch item. The root cause is that §3 wrote logging requirements for each case independently rather than declaring which layer owns the operator-facing message. This is a spec quality gap: when an advisory spans multiple implementation layers with shared error handling, the ownership of each log line should be declared explicitly. This generalizes: advisory standards should require that when error propagation spans layers, exactly one layer owns the actionable log line.

---

## Top Findings (Ranked)

1. **workflow.md missing Owner intake node** — Owner always appears first in the forward pass; `workflow.md` must reflect this. The completeness obligation in `$A_SOCIETY_RECORDS` should state this invariant explicitly. Source: workflow.md error in this flow, human correction during backward pass.

2. **TA advisory correctness standard gap** — Declaring a utility "working" in a brief creates a dependency that the advisory should verify by reading the implementation. An advisory standard requiring correctness verification of declared-operational dependencies (not just existence) does not exist and should. Source: `paths.ts` regex bug caught only during implementation. Mirrors TA Top Finding 1.

3. **Dual-list role doc redundancy** — `Context Loading` prose and YAML `required_reading` blocks serve different consumers but maintain identical lists. The synchronization risk is real; a structural resolution is warranted. Not within synthesis scope — route as a new flow. Source: Curator Top Finding 1, Runtime Developer Top Finding 2, TA mention.

---

Next action: Synthesis (backward pass step 5 of 5 — final step)
Read: all findings artifacts in `a-society/a-docs/records/20260330-registry-frontmatter-reader/`, then `### Synthesis Phase` in `a-society/general/improvement/main.md`
Expected response: Synthesis artifact at the next available sequence position in the record folder. Flow closes when synthesis is complete.
