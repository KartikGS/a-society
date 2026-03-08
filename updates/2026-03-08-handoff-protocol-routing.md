# A-Society Framework Update — 2026-03-08

## Summary

A-Society's role standard now requires explicit outgoing handoff guidance for workflow-participating roles that hand work to another role. In parallel, the Owner role now treats workflow routing as the default entry path rather than presenting workflow and freeform as co-equal starting options. These changes affect any adopting project with multi-role workflows.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 2 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 0 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Workflow Is the Default Owner Entry Path

**Impact:** Breaking
**Affected artifacts:** `$INSTRUCTION_ROLES`, `$GENERAL_OWNER_ROLE`
**What changed:** The Owner role guidance now says: after confirming context, the Owner asks what the human wants to work on and routes that need into the appropriate workflow by default. Freeform discussion is still allowed, but only when the human explicitly asks to stay outside workflow.
**Why:** Presenting workflow as one menu option among several co-equal entry paths weakens the role separation and perspective checks that the workflow exists to preserve. The framework now treats workflow routing as the default structural path and freeform as a human override.
**Migration guidance:** Review `$[PROJECT]_OWNER_ROLE`. If the Post-Confirmation Protocol still presents workflow as a menu option or uses wording such as "pick a workflow or describe what you need" at the same level, rewrite it so the Owner first asks what the human wants to work on, then routes that need into the appropriate workflow by default. Keep freeform available only when the human explicitly asks for it. Also review any project-specific Owner examples or session-opening scripts that still present workflow and freeform as co-equal choices.

### Handoff Output Is Now Mandatory for Workflow-Participating Roles

**Impact:** Breaking
**Affected artifacts:** `$INSTRUCTION_ROLES`, `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`
**What changed:** A new mandatory section, `Handoff Output`, has been added to the role-document standard for workflow-participating roles that hand work to another role. At each pause point, the role must say whether the human should resume an existing session or start a new one, which session to switch to, and what the receiving role needs to read. The default rule is to resume the existing session unless the workflow's new-session criteria apply.
**Why:** Previously, the framework told the human which role acted next but left new-vs-resume session routing implicit. That forced the human to infer session mechanics and created avoidable handoff failures. The role standard now makes outgoing handoff instructions explicit.
**Migration guidance:** Review every workflow-participating role in your project that hands work forward, starting with `$[PROJECT]_OWNER_ROLE`, `$[PROJECT]_CURATOR_ROLE`, and any Analyst, Implementer, Reviewer, or Coordinator roles. Add a `Handoff Output` section wherever the role owns a pause point. At minimum, each section should state: whether to resume an existing session or start a new one, which session to switch to, and what artifact or context the receiving role must read. Then review `$[PROJECT]_WORKFLOW` (or equivalent) and confirm that its session model does not leave new-vs-resume decisions implicit.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
