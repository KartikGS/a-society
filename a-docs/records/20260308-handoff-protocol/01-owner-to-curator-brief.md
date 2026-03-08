# Owner → Curator: Briefing

> **Template usage:** Created from `$A_SOCIETY_COMM_TEMPLATE_BRIEF`.

---

**Subject:** Handoff protocol — workflow as default and session routing for all roles
**Status:** BRIEFED
**Date:** 2026-03-08

---

## Agreed Change

Two related gaps are being fixed in a single flow:

**Gap 1 — Workflow as default (Owner-specific)**
The Owner's Post-Confirmation Protocol presents workflow routing as one option among several equal alternatives. Framing like "you can pick a workflow above or describe what you need" implies freeform discussion is a co-equal upfront path. This allows the Owner to implicitly enable freeform work without the human choosing it — which removes the role separation and perspective-checking the workflow is designed to provide.

Fix: The Post-Confirmation Protocol must frame workflow routing as the default entry path. After confirming context, the Owner routes into the applicable workflow. The human can redirect to freeform if they prefer, but the Owner does not present it as a co-equal option or open the choice before the human has signaled a need.

**Gap 2 — Session routing at handoffs (all workflow-participating roles)**
At each workflow pause point, the active role tells the human what to do next — which session to switch to, what artifact was produced, what the receiving role needs to read. But no role document and no archetype template specifies whether the human should start a new conversation or resume an existing one. That decision is currently left to the human to infer — a real failure mode when an agent resumes with too much stale context or starts fresh missing needed context.

Fix: Session routing is a **structural requirement** of any workflow-participating role. It belongs in `$INSTRUCTION_ROLES` as a mandatory section for such roles, parallel to Input Validation (which covers what to check when receiving a handoff). The symmetry: Input Validation governs incoming handoffs; the new section governs outgoing handoffs.

At every pause point it owns, a workflow-participating role must explicitly state:
1. Whether the human should start a new conversation or resume the existing one for the receiving role
2. Which session to switch to
3. What the receiving role needs to read (artifact path and any additional context)

The default rule to encode: **resume the existing session** unless one of the conditions in `$A_SOCIETY_WORKFLOW` ("When to start a new session") applies. Roles state this default explicitly — the human is not expected to know the rule or infer it.

This applies to every role that has handoff points in a workflow — Owner, Curator, and any future role created under the framework. Encoding it in `$INSTRUCTION_ROLES` ensures new roles carry it automatically.

---

## Scope

**In scope:**

*Framework instruction level:*
- Add a mandatory "Handoff Output" section (or equivalent — Curator proposes the name) to `$INSTRUCTION_ROLES` for workflow-participating roles, parallel to the existing Input Validation section. This is the load-bearing change: future roles get session routing by default.
- Update the archetype templates in `$INSTRUCTION_ROLES` to include this section where the archetype has handoff points (Owner, Coordinator at minimum; Analyst, Implementer, Reviewer to be assessed by Curator based on their typical workflow participation).

*Role template level (implementing the framework pattern):*
- Rewrite the Post-Confirmation Protocol in `$GENERAL_OWNER_ROLE` — workflow is the default entry path, not a menu option
- Add session-routing guidance to `$GENERAL_OWNER_ROLE` covering Owner pause points
- Add session-routing guidance to `$GENERAL_CURATOR_ROLE` covering Curator pause points

*A-Society-specific implementation:*
- Rewrite the Post-Confirmation Protocol in `$A_SOCIETY_OWNER_ROLE` — same framing as the general template
- Add session-routing guidance to `$A_SOCIETY_OWNER_ROLE` covering Owner pause points (after briefing, after review decision)
- Add session-routing guidance to `$A_SOCIETY_CURATOR_ROLE` covering Curator pause points (after proposal, after implementation + registration, after backward pass synthesis)
- Update the session model in `$A_SOCIETY_WORKFLOW` — add explicit new-vs-resume guidance at each numbered pause point (steps 1–6)

**Out of scope:**
- Changing the "When to start a new session" criteria in `$A_SOCIETY_WORKFLOW` — those criteria are correct; this flow makes roles apply them explicitly
- Changes to context loading for any role
- Changes to any role's authority or review responsibilities
- Adding new workflow phases or altering handoff artifacts
- Creating role documents for roles that do not yet exist

---

## Likely Targets

| File | Variable | Change type |
|---|---|---|
| Role creation instruction | `$INSTRUCTION_ROLES` | Add mandatory Handoff Output section; update archetype templates |
| General Owner role template | `$GENERAL_OWNER_ROLE` | Post-Confirmation Protocol rewrite + session-routing guidance |
| General Curator role template | `$GENERAL_CURATOR_ROLE` | Session-routing guidance added |
| A-Society Owner role | `$A_SOCIETY_OWNER_ROLE` | Post-Confirmation Protocol rewrite + session-routing guidance |
| A-Society Curator role | `$A_SOCIETY_CURATOR_ROLE` | Session-routing guidance added |
| A-Society Workflow | `$A_SOCIETY_WORKFLOW` | Session model steps 1–6 updated |

All six files require changes. `$INSTRUCTION_ROLES`, `$GENERAL_OWNER_ROLE`, and `$GENERAL_CURATOR_ROLE` touch `general/` — Owner approval is required. This briefing constitutes that approval.

---

## Open Questions for the Curator

**1. Naming and placement of the new section in `$INSTRUCTION_ROLES`**
The current structure has "Input Validation (mandatory for workflow-participating roles)" as section 6. A parallel section for outgoing handoffs should sit nearby — either immediately after as section 7, or merged with Input Validation as a combined "Handoff Protocol" section. The Curator should propose the name and placement that makes the instruction most scannable. "Handoff Output" is the working name; if a better term emerges during drafting, use it.

**2. Which archetypes in `$INSTRUCTION_ROLES` need the new section**
The Coordinator archetype already has a "Coordination Protocol" that touches handoffs. The Owner archetype has a "Post-Confirmation Protocol" that will be updated via this flow. The Analyst, Implementer, and Reviewer archetypes — do they typically own pause points in a workflow? The Curator should assess each archetype's typical role in a workflow graph and add the Handoff Output section only where the archetype realistically owns pause points. Do not add it to archetypes that are typically terminal nodes (they receive, execute, and close — they do not hand off to a waiting role).

**3. Post-Confirmation Protocol reframe — "menu is always available, never blocking"**
This phrase appears in `$A_SOCIETY_OWNER_ROLE`. It accurately captures that the Owner should not trap the human in the workflow — but it also frames the workflow as just one menu item. The Curator must determine whether to remove this phrase entirely, reframe it, or replace it with something that preserves the human-override principle without the menu framing. The principle to preserve: the human can always redirect; the Owner does not force; but the workflow is the default, not a choice.

**4. Template placeholder in `$GENERAL_OWNER_ROLE`**
The Post-Confirmation Protocol section ends with `[CUSTOMIZE: list the project's actual workflows and their one-line summaries here.]`. In the reframed protocol, the Owner routes into the workflow rather than presenting a menu. The Curator must propose language that works both in unfilled template state (before a project customizes it) and as actionable guidance after customization. The solution should not leave the template non-functional before the `[CUSTOMIZE]` section is filled in.

**5. Where session-routing guidance lives in the Curator role**
The Curator has no existing "Post-Confirmation Protocol" or "Handoff" section. The Curator must determine whether to add a dedicated section to both `$A_SOCIETY_CURATOR_ROLE` and `$GENERAL_CURATOR_ROLE`, or integrate routing guidance into an existing section (e.g., Working Style). The goal is that an agent reading the Curator role for the first time knows what to say at each pause point — not that the section exists for its own sake.

**6. Inline vs. summary in `$A_SOCIETY_WORKFLOW` session model**
The session model steps (1–6) already contain handoff language. The Curator must decide whether to add new-vs-resume guidance inline at each numbered step, or add a short "Default routing rule" note at the top of the Session Model section (keeping per-step language leaner). Choose whichever produces cleaner, more scannable instructions. Either is acceptable — the Curator should not default to the more verbose option.

**7. Specificity level in general templates**
`$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` must not reference A-Society-specific artifacts (record folders, Curator sessions, briefing file names). Session-routing language in these templates should be at the principle level — applicable to any project with multiple roles and a session model. Verify each phrase passes the portability test before including it.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Handoff protocol — workflow as default and session routing for all roles."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
