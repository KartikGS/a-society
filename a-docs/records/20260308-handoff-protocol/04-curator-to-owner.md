# Curator → Owner: Proposal / Submission

**Subject:** Draft framework update report — workflow-default and handoff routing
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-08

---

## Trigger

This flow changed framework guidance in `general/` in two adopter-facing ways: the Owner role now treats workflow routing as the default entry path, and workflow-participating roles that hand work forward now require explicit `Handoff Output` guidance. Per `$A_SOCIETY_UPDATES_PROTOCOL`, both changes qualify for an update report because they modify existing general guidance and add a new mandatory section to the role standard.

---

## What and Why

This submission drafts the outbound framework update report for adopting project Curators.

Why a report is required:
- Adopting projects initialized from older framework guidance may still have Owner roles that present workflow as a menu option instead of the default path.
- Adopting projects will not automatically have the new mandatory `Handoff Output` section in their workflow-participating role documents.
- Both changes affect what a correct project-level role document now contains, so Curators of adopting projects need explicit migration guidance.

---

## Where Observed

A-Society — internal. The gap was found in A-Society's own Owner, Curator, workflow, and role-instruction documents, then generalized into the framework library for all adopting projects.

---

## Target Location

Draft for publication at `$A_SOCIETY_UPDATES_DIR/2026-03-08-handoff-protocol-routing.md` after Owner approval.

Registration assessment for this flow: no new index entries or index-description changes are required. The scoped framework edits only changed existing documents; Phase 4 requires Owner review of this update-report draft before publication.

---

## Draft Content

```markdown
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
```

---

## Owner Confirmation Required

If approved, publish the report to `$A_SOCIETY_UPDATES_DIR/2026-03-08-handoff-protocol-routing.md` during the next Curator implementation step. If revisions are needed, return them in the next Owner artifact.
