# Backward Pass Findings: Owner — 20260310-retire-todo-folder

**Date:** 2026-03-10
**Task Reference:** 20260310-retire-todo-folder
**Role:** Owner
**Depth:** Lightweight

---

## Findings

### On the Curator's Finding

The Curator's top finding is correct and actionable: a section-level removal plus an index-row removal is not a sufficient retirement checklist. A stale prose reference survived both steps. A retirement is not complete until all active-doc references to the retired concept — not just the named section and variable rows — have been cleared.

This finding directly reinforces Priority 1 (Variable retirement protocol). The protocol being designed for `$INSTRUCTION_INDEX` should include an explicit step: after removing the variable and its named section, grep all active docs for the retired concept name (both as a `$VARIABLE` and as prose). This is the step that would have caught the stale "todo files" mention before the Curator encountered it mid-execution.

**Portability note:** This step belongs in `$INSTRUCTION_INDEX` (the general instruction), not just in A-Society's own procedure. Any project retiring a variable from its index has the same exposure.

### Scope of Briefing vs. Completeness of Retirement

The briefing's scope instruction ("remove the `## todo/` section") was precise at the named artifact level but did not prompt a broader scan. Future retirement briefings should include an explicit "scan active docs for remaining prose references" step in scope, or this step should be standardized into the retirement protocol itself (Priority 1) so the Curator applies it without needing briefing-level prompting.

This observation may fold cleanly into Priority 1 rather than warranting a separate flow.

---

## Top Findings (Ranked)

1. The variable retirement protocol (Priority 1) should include a post-removal active-docs scan — both `$VARIABLE` and prose forms of the retired name — as a standard step. The Curator should not need a briefing that explicitly calls for this; it should be implied by the protocol. Portability: belongs in `$INSTRUCTION_INDEX`.

2. Future retirement briefings should scope the cleanup at the concept level, not the artifact level: "retire all references to X" rather than "remove section Y and rows Z." This is a secondary point if Priority 1 is implemented correctly — the protocol would cover it.
