# Backward Pass Findings: Owner — programmatic-improvement-system

**Date:** 2026-04-04
**Task Reference:** 20260403-programmatic-improvement-system
**Role:** Owner
**Depth:** Full

---

## Findings

### Conflicting Instructions

None.

### Missing Information

**No instruction for creating project-specific improvement phase files.** The flow created `$GENERAL_IMPROVEMENT_META_ANALYSIS` and `$GENERAL_IMPROVEMENT_SYNTHESIS` as framework library templates, but no update was made to `$INSTRUCTION_IMPROVEMENT` specifying that projects adopting the programmatic runtime must also create `a-docs/improvement/meta-analysis.md` and `a-docs/improvement/synthesis.md` as project-specific instantiations. Without this instruction, a project that follows the standard initialization path and applies the update report would have the wrong files in `a-society/general/improvement/` injected into their runtime sessions — or worse, no improvement phase files at all if they didn't receive the wrong `general/` files.

The distinction between "general template" (what `$GENERAL_IMPROVEMENT_META_ANALYSIS` is) and "project-specific file" (what the runtime actually injects) was never documented in the instruction layer.

### Unclear Instructions

None.

### Redundant Information

None.

### Scope Concerns

**Wrong injection layer — `general/` templates instead of project-specific `a-docs/improvement/` files.** This is the central failure of the flow, and it was externally caught by the user.

The runtime constants in `improvement.ts` read:

```typescript
const META_ANALYSIS_INSTRUCTION_PATH = 'a-society/general/improvement/meta-analysis.md';
const SYNTHESIS_INSTRUCTION_PATH = 'a-society/general/improvement/synthesis.md';
```

These are wrong on two dimensions:

1. **Wrong layer**: `a-society/general/improvement/` is the framework library — project-agnostic templates with unresolved `[PROJECT_*]` placeholders. The correct injection targets are project-specific files: for A-Society, `a-society/a-docs/improvement/meta-analysis.md` and `a-society/a-docs/improvement/synthesis.md`. The TA advisory correctly identified the TA finding (Top Finding 2) as a direct cause of wrong files being produced. These files were never created.

2. **Wrong project**: Even correcting the layer, the path `a-society/a-docs/improvement/...` is still hardcoded to the A-Society project. The runtime is a multi-project host — it serves any project in the repository. The correct model is: derive the path from `flowRun.projectRoot` at runtime, e.g., `path.join(flowRun.projectRoot, 'a-docs/improvement/meta-analysis.md')`. The current constants hardcode a single project's path and will fail silently for any other project using the runtime.

**Root cause trace — why wasn't this caught at spec time or advisory review?**

The error originated in the Owner brief (`02-owner-to-ta-brief.md`). In §Design Area 3, I wrote: "start a session injecting: role context, meta-analysis instruction file (`$GENERAL_IMPROVEMENT_META_ANALYSIS`)." The variable `$GENERAL_IMPROVEMENT_META_ANALYSIS` has a `GENERAL` prefix — which in the A-Society index convention means it belongs to the framework library at `a-society/general/`. By naming the injection target with a `GENERAL` prefix, I inadvertently directed the TA toward the library layer. The TA followed that direction and specified `a-society/general/improvement/meta-analysis.md` at §3.7.

The correct naming in the brief would have been a project-relative reference such as "the project's own `a-docs/improvement/meta-analysis.md` (derived from `flowRun.projectRoot`)." The distinction between the framework template and the project-specific instantiation was in my mental model — I knew one was a template and one was for injection — but I collapsed that distinction in the variable naming.

At advisory review (`04-owner-ta-review.md`), I verified the signal schema and the Component 4 algorithm but did not verify whether §3.7's hardcoded paths were pointing to the correct layer or whether they were derivable for multi-project use. This was not a review criterion. I then approved the advisory inclusive of §3.7 in `05-owner-parallel-release.md`.

The Curator brief then instructed creating the files at `a-society/general/improvement/meta-analysis.md` and `synthesis.md` — the wrong location — because those were the paths the approved advisory had specified and the paths the runtime constants expected.

**The structural gap that made this possible:** there is no requirement at advisory review or at brief-writing time to verify that any runtime constant that embeds a file path is (a) pointing to a project-specific layer rather than a library layer, and (b) derivable from `flowRun.projectRoot` rather than hardcoded. Multi-project path derivation is not a standard advisory review checkpoint.

**The generalizable principle violated:** Any path injected by a multi-project runtime host must be derivable from the project context, not hardcoded into the runtime module. A hardcoded path into a library layer injects framework templates rather than project content, and fails silently for all projects except the one that happens to match the hardcoded path.

This is a **generalizable finding** applicable to any project that uses a shared runtime host.

### Workflow Friction

**`$GENERAL_IMPROVEMENT` split targeted the wrong file.** In the Curator brief (§B1), I instructed splitting `$GENERAL_IMPROVEMENT` (`a-society/general/improvement/main.md`) into three files. The correct split target for the runtime injection model was `$A_SOCIETY_IMPROVEMENT` (`a-society/a-docs/improvement/main.md`) — the project-specific improvement protocol. The `general/` file is a template; the project should use a split of its own `a-docs/improvement/main.md` to produce the phase-specific files the runtime injects.

This was downstream of the scope concern above, but it produced a concrete wrong action: the framework template was split instead of the project improvement protocol, and the project improvement protocol (`$A_SOCIETY_IMPROVEMENT`) still contains the full backward pass protocol as a monolith. The runtime has nothing correct to inject for A-Society.

---

## Top Findings (Ranked)

1. **Wrong injection layer and project-hardcoded paths — `runtime/src/improvement.ts`** (`META_ANALYSIS_INSTRUCTION_PATH`, `SYNTHESIS_INSTRUCTION_PATH`). Root cause: the Owner brief used `$GENERAL_IMPROVEMENT_META_ANALYSIS` (a GENERAL-prefix variable, pointing to the library layer) as the injection target, directing the TA to specify library paths in §3.7. These were approved without a multi-project path-derivation check. Result: wrong files injected; wrong files created; correct files (`a-society/a-docs/improvement/meta-analysis.md`, `synthesis.md`) never created. This is the highest-priority externally-caught finding. **Generalizable contribution**: multi-project runtime hosts must derive injection paths from project context (`flowRun.projectRoot`), never hardcode them into the runtime module.

2. **`$GENERAL_IMPROVEMENT` split instead of `$A_SOCIETY_IMPROVEMENT`** — `a-society/general/improvement/` vs `a-society/a-docs/improvement/`. The wrong file was split. The framework template was restructured; the project improvement protocol was not. The runtime injection targets do not exist for A-Society. This is the direct consequence of Finding 1 propagating through the Curator brief.

3. **No instruction for project-specific improvement phase files** — `$INSTRUCTION_IMPROVEMENT` not updated. Projects adopting the runtime have no documented path for creating their own `a-docs/improvement/meta-analysis.md` and `synthesis.md`. The framework update report (`2026-04-04-programmatic-improvement-system.md`) tells adopting projects to update their improvement doc but does not explain what files to create or that they must exist for the runtime to function.

---

Next action: Curator synthesizes all findings
Read: `a-society/a-docs/records/20260403-programmatic-improvement-system/15-owner-findings.md`
      (plus all prior findings: 13-curator-findings.md, 13-tooling-finding.md, 13-runtime-finding.md, 14-ta-finding.md)
Expected response: `16-curator-synthesis.md`
