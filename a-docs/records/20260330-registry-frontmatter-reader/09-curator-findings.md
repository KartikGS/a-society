# Backward Pass Findings: Curator — registry-frontmatter-reader

**Date:** 2026-03-30
**Task Reference:** registry-frontmatter-reader
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- **None.** The transition to dynamic context resolution was clear and well-documented for this role.

### Unclear Instructions
- **`agents.md` YAML blocks:** The `universal_required_reading` block at the top of `agents.md` appears without a semantic label in prose. An agent reading purely in natural language may not recognize that this block has machine-readable significance for the runtime's context injection system, potentially leading to accidental deletion during a-docs maintenance.
- **`agents.md` role registration owners:** The `agents.md` document entry in `$A_SOCIETY_AGENT_DOCS_GUIDE` (v1.30.0) mentions ownership of the "required reading sequence," but with the transition to machine-readable blocks in both `agents.md` and role documents, the "What it owns" and "What breaks without it" entries for all orientation files required an update to capture the operational impact of the YAML metadata. (Fixed in registration step 08).

### Redundant Information
- **YAML frontmatter vs Prose `Context Loading` lists:** Every role document (e.g., `curator.md`, `owner.md`) now contains both a YAML `required_reading` block and a natural-language `Context Loading` section. These blocks frequently list the same documents. Since the runtime uses the YAML for automatic injection, the prose list exists primarily for agents not using the runtime interface. This redundancy creates a synchronization risk — updating one list without the other leads to context drift.

### Scope Concerns
- None.

### Workflow Friction
- **Brittle variable resolution:** The Developer discovering a regex bug in `paths.ts` (discovery 05) during implementation signifies that the runtime's dynamic registry loading was heavily dependent on a low-level utility that was not fully tested against the $VARIABLE names present in the A-Society index. While the bug was fixed in-flow, the friction highlighted that moving from a static registry (where names are validated by the compiler) to a dynamic one requires more robust validation at the utility layer.

---

## Top Findings (Ranked)

1. **`required_reading` duplication** — `Context Loading` prose and YAML frontmatter are functionally redundant in role docs, creating a long-term synchronization risk.
2. **Brittle variable resolution** — Brittle regex in `paths.ts` almost blocked dynamic resolution; highlights need for robust utility layer testing during dynamic transitions.
3. **Implicit YAML significance** — Lack of prose labels for the frontmatter blocks in `agents.md` leaves them vulnerable to accidental maintenance errors.

---

Next action: Meta-analysis (backward pass step 2 of 5)
Read: [09-curator-findings.md](file:///home/kartik/Metamorphosis/a-society/a-docs/records/20260330-registry-frontmatter-reader/09-curator-findings.md), then [### Meta-Analysis Phase](file:///home/kartik/Metamorphosis/a-society/general/improvement/main.md#L140) in $GENERAL_IMPROVEMENT
Expected response: Findings artifact (10-runtime-developer-findings.md)
