# Backward Pass Findings: Technical Architect — 20260327-runtime-orient-session

**Date:** 2026-03-28
**Task Reference:** 20260327-runtime-orient-session
**Role:** Technical Architect
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information

- **No cross-verification discipline between prose requirements and the §8 checklist.** The registry guard requirement was fully specified in §2 prose: "If no entry exists in `roleContextRegistry` for the derived key, orient surfaces an error and exits." However, the §8 Files Changed description for `orient.ts` read: "registry lookup, context bundle via extended service, LLM instantiation, readline conversation loop." This description is accurate for the happy path but does not name the guard, does not state the exit behavior, and does not invoke the "binding" language from the TA role's advisory standard. The Developer followed the structural checklist (§8) and implemented exactly what was described there — a session that calls `buildContextBundle`, which does its own internal registry lookup and silently degrades. The guard never appeared.

  Root cause: I produced the §2 prose and the §8 table as two separate passes without cross-verifying that every binding behavioral requirement in prose was captured explicitly in the relevant §8 row. The TA role already carries the advisory standard "binding implementation requirements must specify execution, not just declaration" — that standard was applied to other parts of the spec but not to the registry guard, which was behavioral (error + process.exit(1)) and therefore subject to exactly that standard.

  **This finding is generalizable.** Any TA producing advisory documents faces the same structural gap: prose sections describe what a component does, but the §8 table is what a Developer implements against. A behavioral requirement that lives only in prose is not a binding implementation requirement — it is a description. The gap between "described in §2" and "specified in §8" is a predictable failure mode across any project type.

- **Type import source unspecified.** The spec stated that `orient.ts` would use `MessageParam[]` for the `history` type. It did not trace where `MessageParam` would be imported from. The Developer imported it from `./llm.js`, which required adding `export type { MessageParam }` to `llm.ts` — a file the spec explicitly said would require no changes. The deviation was benign, but it produced a discrepancy between the spec and implementation that the integration review had to adjudicate.

  Root cause: when an interface design introduces a type that must be imported across module boundaries, the import source is part of the interface specification. I specified the type but not its provenance. The fix is straightforward: when naming a type in an interface that isn't already exported from the relevant module, either specify the import path or note that a re-export will be needed.

### Unclear Instructions
- none

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction

- **Initial draft bypassed existing infrastructure without exhausting the extension path.** The first draft of the Phase 0 architecture proposed bypassing `roleContextRegistry` and `ContextInjectionService` entirely, replacing them with direct path injection and a new inline context builder. The stated reason for bypassing `ContextInjectionService` was valid (the hardcoded handoff directive), but I reached "bypass" before considering "extend." The revision — adding a `mode` parameter — was straightforward once the user pointed it out, which indicates the extension path was available and I simply hadn't evaluated it.

  The correct discipline, which I did not apply: before proposing new infrastructure or a bypass, explicitly enumerate what the existing infrastructure cannot do and why extension is insufficient. If the enumeration yields "the hardcoded directive is the only obstacle," the conclusion is "extend the service," not "bypass it." I skipped this enumeration and defaulted to designing from scratch. The user's pushback was correct and the revision was an improvement.

  This finding is directional rather than doc-actionable — it reflects a design heuristic gap rather than a missing document. However, it may be worth noting in the TA role doc as a standing advisory: "Before proposing a new parallel path, enumerate explicitly why the existing path cannot be extended."

---

## Top Findings (Ranked)

1. Behavioral requirements specified in advisory prose (§2–§6) that are not echoed in the §8 Files Changed table are not binding implementation requirements — they are descriptions. The registry guard omission is a direct consequence of this gap. The TA role's "binding requirements must specify execution" standard must be applied at the §8 level, not only in prose. — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, Advisory Standards section *(generalizable)*
2. Type import sources are part of interface design and must be specified when a type crosses module boundaries — omitting them produces unspecified file changes. — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, Advisory Standards section
3. Design-from-scratch before exhausting the extension path produces unnecessary revision cycles and erodes trust in the initial advisory. A standing heuristic — "enumerate why extension is insufficient before proposing bypass" — reduces this friction. — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`
