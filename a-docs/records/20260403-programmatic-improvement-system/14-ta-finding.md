# Backward Pass Findings: Technical Architect — programmatic-improvement-system (2026-04-03)

**Date:** 2026-04-04
**Task Reference:** programmatic-improvement-system (2026-04-03)
**Role:** Technical Architect
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- **`runInteractiveSession` session ID behavior undocumented:** The advisory described synthesis freshness as a requirement but did not document that `runInteractiveSession` internally generates its own `crypto.randomUUID()` per invocation (`orient.ts:26`). The Runtime Developer added a redundant `synthesisSessionId` variable at `improvement.ts:122` to fulfill the freshness requirement, not knowing the function already satisfies it structurally. The advisory should have stated: "session freshness is enforced by `runInteractiveSession` internally; do not pass or generate a session ID externally."

- **Wrong instruction files injected into improvement sessions:** `META_ANALYSIS_INSTRUCTION_PATH` and `SYNTHESIS_INSTRUCTION_PATH` were specified as `a-society/general/improvement/meta-analysis.md` and `a-society/general/improvement/synthesis.md`. These are the **project-agnostic framework templates** — they contain unresolved `[PROJECT_*]` placeholders and generic guidance on how to produce findings, not project-specific instructions. Each project adopting A-Society has its own `[projectRoot]/a-docs/improvement/meta-analysis.md` with project-specific conventions, templates, and backward-pass protocol. The runtime should inject the **project's own** file, derived from `flowRun.projectRoot`, not a hardcoded path into the `general/` layer. Injecting the framework template means agents receive placeholder-laden generic instructions and produce findings that do not conform to the project's actual improvement protocol. This is the direct cause of the wrong files produced in this flow.

### Unclear Instructions
- **Warning check implementation not specified:** The advisory stated the requirement ("warn if no findings file found for expected role") but did not specify the implementation method. The developer used a substring `includes` check on the full path string, which is an approximation that can suppress warnings when a role slug is a substring of another path component (e.g., `"TA"` in `"technical-architect-"`). The correct method — calling `locateFindingsFiles(recordFolderPath, [expectedRole])` per role — was only prescribed in the integration review. Behavioral requirements for file-detection logic should specify the lookup mechanism, not just the condition to detect.

### Redundant Information
- None.

### Scope Concerns
- None.

### Workflow Friction
- **Synthesis role derivation: externally-caught design error.** The addendum initially specified deriving the synthesis role dynamically from the terminal node of `workflow.md`. This was incorrect: Component 3's strict-mode validator mandates that every terminal node has `role: Owner`, so the derived value would always have been `"Owner"` at runtime, not `"Curator"`. The error was caught by the Owner ("Curator will always perform synthesis"), not by me.

  Root cause analysis: The synthesis role is a project convention documented in `a-society/a-docs/improvement/main.md` (§ Backward Pass Traversal, rule 4: "Synthesis role (Curator) is always last"). I was designing a new mechanism without first consulting the existing project convention. Additionally, the strict-mode validator constraint (Owner bookends all workflows) is documented in `tooling/INVOCATION.md` under Component 3, and I did not cross-check it when writing the addendum.

  Structural gap: The convention "Curator is always the synthesis role" lives in the project-specific improvement protocol (`a-society/a-docs/improvement/main.md`) but not in any runtime-facing document. A designer specifying runtime behavior must consult the project improvement protocol — but no advisory template or pre-work checklist prompts this. The gap is not in the rule's existence but in its surfacing to a TA producing runtime specs.

  This is an **externally-caught error** and is ranked first.

---

## Top Findings (Ranked)

1. **Externally-caught synthesis role convention gap** — `a-society/a-docs/improvement/main.md` / `03-ta-advisory.md` addendum. Convention "Curator always synthesizes" is documented in the project improvement protocol but not cross-referenced from any runtime-facing advisory template or TA pre-work checklist. Resulted in a wrong design in the addendum, caught by the Owner.

2. **Wrong instruction files injected — framework templates used instead of project-specific files** — `runtime/src/improvement.ts` (`META_ANALYSIS_INSTRUCTION_PATH`, `SYNTHESIS_INSTRUCTION_PATH`). The advisory specified `a-society/general/improvement/meta-analysis.md` and `a-society/general/improvement/synthesis.md`, which are project-agnostic templates containing `[PROJECT_*]` placeholders. The correct files are each project's own `[projectRoot]/a-docs/improvement/meta-analysis.md` and `[projectRoot]/a-docs/improvement/synthesis.md`, derived from `flowRun.projectRoot` at runtime. This error directly caused agents to receive placeholder-laden framework guidance instead of project-specific instructions, producing wrongly-structured findings artifacts.

3. **Behavioral spec omits lookup mechanism for file-detection** — `runtime/src/improvement.ts` warning check. The advisory specified the detection requirement but not the implementation method. This is sufficient for an experienced developer but not safe for the class of decision (which API to use), as demonstrated by the approximate `includes` check that required a correction pass in integration review.

4. **Session freshness implementation responsibility undocumented** — `orient.ts` / `improvement.ts`. The advisory required synthesis session freshness without documenting which layer is responsible. This produced dead code (`synthesisSessionId`) that had to be caught in integration review rather than prevented at spec time.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260403-programmatic-improvement-system/14-ta-finding.md
next_action: Curator synthesizes all findings and files synthesis artifact
read: a-society/a-docs/records/20260403-programmatic-improvement-system/14-ta-finding.md
expected_response: 15-curator-synthesis.md
```
