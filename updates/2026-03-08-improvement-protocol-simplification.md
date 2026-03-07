# A-Society Framework Update — 2026-03-08

## Summary

The improvement protocol has been simplified from a multi-mode, multi-phase meta-analysis system (~226 lines, 4 templates) into a concise backward pass protocol (~80 lines, 1 template). The core model change: improvement is now framed as the backward pass to the workflow's forward pass. Findings re-enter the workflow as standard Phase 1 observations — there is no separate improvement workflow. Three templates have been deleted, one has been simplified, and the improvement instruction has been rewritten to match.

Known adopters at publication time: LLM Journey. This report is addressed to all adopting project Curators. Migration guidance is written generically — map `$[PROJECT]_*` placeholders to your project's actual index variable names.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Your `a-docs/` references deleted templates — Curator must review |
| Recommended | 3 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### BREAKING 1 — Three improvement report templates deleted

**Impact:** Breaking
**Affected artifacts:** `$GENERAL_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT` (deleted), `$GENERAL_IMPROVEMENT_TEMPLATE_SYNTHESIS` (deleted), `$GENERAL_IMPROVEMENT_TEMPLATE_BACKLOG` (deleted), `$GENERAL_IMPROVEMENT_REPORTS`
**What changed:** The lightweight synthesis template, synthesis report template, and alignment backlog template have been removed from `general/improvement/reports/`. Only `template-findings.md` remains. The reports index (`main.md`) now references one report type (per-agent findings) instead of four.
**Why:** The simplified protocol eliminates Mode A/B distinction, multi-phase chains, and standalone alignment cycles. With one process (backward pass → findings → re-enter workflow), only one template is needed. The deleted templates served processes that no longer exist.
**Migration guidance:**
- Check your project's `$[PROJECT]_IMPROVEMENT_REPORTS` folder. If it contains local copies of `template-lightweight.md`, `template-synthesis.md`, or `template-backlog.md`, assess whether they are still in use.
- If your project's index registers `$[PROJECT]_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT`, `$[PROJECT]_IMPROVEMENT_TEMPLATE_SYNTHESIS`, or `$[PROJECT]_IMPROVEMENT_TEMPLATE_BACKLOG`, remove those rows — the source templates no longer exist in the framework.
- Update your `$[PROJECT]_IMPROVEMENT_REPORTS` index to reference only the findings template.
- If any existing process documents (protocol, role files) reference the deleted template variables, update or remove those references.
- **Historical reports already produced using the old templates are unaffected.** Do not modify them. This change affects the template for future reports only.

---

### RECOMMENDED 1 — Improvement protocol rewritten as backward pass protocol

**Impact:** Recommended
**Affected artifacts:** `$GENERAL_IMPROVEMENT_PROTOCOL`
**What changed:** The protocol has been rewritten from a ~226-line document with two operating modes (Mode A task-linked, Mode B alignment cycles), a three-phase chain (findings → synthesis → implementation), mandatory evolution lenses, role health indicators, decision ownership tables, and embedded session prompts — into a ~80-line backward pass protocol that describes: when to run, who produces findings first, what categories to reflect on, how findings re-enter the workflow, useful evaluation lenses (as guidance, not mandatory), and guardrails.
**Why:** The previous protocol was designed for multi-agent projects with 5+ roles and was never right-sized for projects with fewer roles. It violated its own Principle 4 ("Simplicity Over Protocol"). Mode B duplicated the standard workflow. The three-phase chain added ceremony without safety value for most project structures. The simplified model says exactly what it means: after the forward pass, agents reflect, produce findings, and anything actionable goes back through the workflow.
**Migration guidance:**
- Review your project's `$[PROJECT]_IMPROVEMENT_PROTOCOL`. If it was adapted from the previous general template, it likely contains Mode A/B, three-phase chains, role health indicators, and session prompts that no longer have a source-of-truth in the framework.
- Consider rewriting your project's protocol to match the simplified model: a backward pass description that specifies who produces findings first (typically the role closest to implementation), findings format, and how actionable items re-enter Phase 1 of your workflow.
- If your project's workflow document references the improvement protocol for "Phase 2 synthesis" or "Phase 3 implementation," update those references — the backward pass now produces findings that re-enter the workflow directly.
- The three mandatory evolution lenses (portability, collaboration, evolvability) are now listed as "useful lenses" — optional judgment aids rather than per-finding requirements. Update any role docs that require lens tags on every finding.

---

### RECOMMENDED 2 — Improvement instruction rewritten

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_IMPROVEMENT`
**What changed:** The instruction for creating an `improvement/` folder has been rewritten to match the simplified protocol model. The protocol section now describes a backward pass protocol (not a hybrid operating model with phases). The reports section references one template (findings) instead of four. The index integration table lists three variables instead of seven. The "Integration with the Improvement Agent Role" section has been replaced with "Integration with the Workflow" — reflecting that the backward pass is a workflow phase, not a standalone system.
**Why:** The instruction must match the templates it references. With the protocol and templates simplified, the instruction needed to reflect the new model.
**Migration guidance:**
- No direct migration is required — instructions are consumed at initialization time. However, if your project's `improvement/` folder was recently initialized and you are adopting RECOMMENDED 1 above, re-read the updated `$INSTRUCTION_IMPROVEMENT` for guidance on how the simplified structure should look.

---

### RECOMMENDED 3 — Initializer improvement setup steps simplified

**Impact:** Recommended
**Affected artifacts:** `$A_SOCIETY_INITIALIZER_ROLE`
**What changed:** Phase 3 steps 9–10 updated: step 9 now instructs the Initializer to specify "which role produces findings first" and "which role synthesizes actionable items" instead of mapping roles to multi-phase protocol phases; step 10 now references `template-findings.md` only instead of four template files. Handoff criteria updated to list `template-findings.md` instead of "improvement/reports templates."
**Why:** The Initializer protocol must match the templates it instantiates. With only one template remaining, the initialization step is simpler and the role-mapping guidance is more direct.
**Migration guidance:**
- No direct migration required for already-initialized projects. Future initializations will produce simpler improvement folders with one template file instead of four.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `$A_SOCIETY_UPDATES_DIR` periodically as part of their maintenance cycle.
