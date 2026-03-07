# Onboarding Signal Report

**Project:** BrightLaunch (promo-agency)
**Date:** 2026-03-06
**Project path:** `../promo-agency/`

---

## Project Profile

- **Type:** Service agency (operational / process-oriented)
- **Domain:** Promotional agency managing client product launches through campaign strategy, content creation, and multi-channel distribution
- **Existing a-docs at start:** None

---

## Reconnaissance Findings

### What was inferable from existing files

From `README.md` only:
- Agency name: BrightLaunch
- Service areas: campaign strategy, content creation, channel coordination (social, email, events, partnerships), post-launch performance reviews
- Team profile: small core team, multiple simultaneous client engagements
- The problem the agent system is intended to solve: things fall through the cracks
- That the project is operational/service-oriented rather than a software or research project

### What required human clarification

| Question asked | Why files didn't answer it |
|---|---|
| Team roles and structure | README said "core team" with no role names, no org structure, no indication of who does what |
| Client engagement lifecycle / phases | README listed service areas but not the sequential process by which a client engagement moves from start to finish |
| Decision authority — who approves what before it reaches the client | Not addressed anywhere in existing files |
| Primary deliverable types | Services were listed but not the specific artifact names produced in each engagement |
| What specifically "falls through the cracks" | README acknowledged the problem but did not name the specific failure modes |
| Agent use intent — coordination vs. content drafting vs. both | No existing files gave any signal about how agents were intended to be used |

All six questions were necessary. The README was genuinely thin on operational detail.

---

## Instruction Quality Assessment

| Instruction ($VAR) | Outcome | Notes |
|---|---|---|
| `$INSTRUCTION_AGENT_DOCS_GUIDE` | Sufficient | Clear structure for the rationale document. No adaptation needed. |
| `$INSTRUCTION_VISION` | Sufficient | The four-section structure (problem, core bet, who it's for, direction) mapped well to this project. The "direction for agents" section was particularly useful for encoding the three failure modes as compass guidance. |
| `$INSTRUCTION_STRUCTURE` | Sufficient | Worked as intended. The "what does not belong" requirement was valuable for an agency project where the boundary between a-docs and client deliverables needed explicit statement. |
| `$INSTRUCTION_ROLES` | Sufficient | Role archetypes provided good starting points. The Owner archetype was adapted for Account Manager, which needed to combine project governance with an operational day-job role. No friction — the archetype supported the combination naturally. |
| `$INSTRUCTION_AGENTS` | Sufficient | Clear and complete. The invariants section was the right home for the three gate rules that needed to be visible to all agents. |
| `$INSTRUCTION_WORKFLOW` | Sufficient | The phase structure (entry condition, owner, exit artifact, gate) worked well. The invariants naming convention ("Brief Gate Invariant" etc.) was directly usable. No adaptation friction. |
| `$INSTRUCTION_COMMUNICATION` | Sufficient | The two-sub-folder structure (conversation / coordination) was appropriate for this project's four-role, five-handoff-type complexity. The scaling guidance ("Two roles, simple handoff" vs. "Three or more roles") was helpful — this project landed in the middle and the instruction gave sufficient signal for judgment. |
| `$INSTRUCTION_COMMUNICATION_CONVERSATION` | Sufficient | Template structure and lifecycle lifecycle were clear. The multi-engagement naming convention (per-engagement live artifacts) was not explicitly addressed in the instruction — judgment was required. See Adversity Log. |
| `$INSTRUCTION_COMMUNICATION_COORDINATION` | Sufficient | Three-document structure (handoff protocol, feedback protocol, conflict resolution) was appropriate. The instruction to define status vocabulary first was good sequencing guidance. |
| `$GENERAL_IMPROVEMENT` | Sufficient | Principles translated well. Added a fifth principle specific to BrightLaunch (three failure modes come first) without conflicting with the general five. |
| `$GENERAL_IMPROVEMENT_PROTOCOL` | Sufficient with adaptation required | The three-role assumption (planning, requirements, improvement agent) required explicit mapping. BrightLaunch has no requirements role — Account Manager covers both. The protocol's instruction to document dropped phases and role mappings explicitly was present and was followed; the resulting protocol.md is more readable for it. |
| `$INSTRUCTION_INDEX` | Sufficient | Straightforward. The multi-layer naming convention ($BRIGHTLAUNCH_* prefix) worked without guidance needing to say it explicitly. |

---

## Adversity Log

| Situation | How resolved | Signal for framework |
|---|---|---|
| Multi-engagement live artifact naming: the conversation instruction defines live artifact naming as `[sender-role]-to-[receiver-role].md`, which assumes one active unit of work per handoff type. BrightLaunch runs multiple simultaneous engagements, so a single file per handoff type would be overwritten constantly. | Defined a per-engagement naming convention: `[client-slug]-[handoff-type].md`. Documented it in `conversation/main.md`. | The conversation instruction assumes one unit of work at a time. It should address the multi-unit (concurrent engagement) case, even briefly. A pattern note or a sidebar in the instruction would prevent future initializers from having to derive this independently. |
| The Account Manager role needed to function both as the Owner (project governance, vision stewardship, a-docs authority) and as an operational lead with a day job. The Owner template does not acknowledge that some projects have an Owner who is also a primary practitioner, not a dedicated governance role. | Combined both sets of responsibilities into one role document. The hard rules make the governance responsibilities non-negotiable even when the practitioner role creates deadline pressure. | The Owner role template could note that in small-team projects, the Owner is often also a primary practitioner. The combination is valid; the hard rules are especially important in this case because the pressure to skip governance steps (approvals, reviews) comes from the practitioner side of the same role. |
| Improvement report templates (`$BRIGHTLAUNCH_IMPROVEMENT_TEMPLATE_*`) are registered in the index but don't exist as files. The general improvement template files exist in `a-society/general/improvement/reports/` but the protocol says to adapt them rather than copy them wholesale. | Registered them in the index for future use. Did not create the files since no improvement cycle has run yet. | This is probably the right call — creating templates before any meta analysis has run means the templates are generic. But the initializer protocol could be clearer about whether improvement report templates should be instantiated at init time or deferred. Currently left ambiguous. |

---

## Human Review Corrections

No corrections — human approved as drafted.

---

## Patterns Observed

**Three known failure modes as first-class initialization input.** The human named three specific, recurring failures that the agent system must prevent. Encoding these as named hard rules in role documents AND as named invariants in the workflow (with the same names in both places) created strong redundancy across the system. The vision document named them as a compass; the workflow named them as invariants; the role documents named them as hard rules. Any agent reading any of these three entry points will encounter them. This pattern — "named failure modes as the organizing spine of the initialization" — may generalize to other small-team operational projects where the humans already know exactly what keeps going wrong.

**Part-time role initialization.** The Analyst is part-time and engagement-specific — activated after Launch, closed after client sign-off. The framework's role archetypes do not explicitly address part-time or phase-scoped roles. The Analyst role document handles this by scoping the activation condition and the closure condition explicitly in the primary focus and hard rules. This pattern (role documents for part-time roles must state when the role activates and when it ends) could be noted in `$INSTRUCTION_ROLES`.

---

## Recommendations

| Target file or folder | Change type | Description |
|---|---|---|
| `$INSTRUCTION_COMMUNICATION_CONVERSATION` | Update | Add a note addressing concurrent unit-of-work scenarios (multiple simultaneous engagements, sprints, clients). The current instruction defines live artifact naming for one-at-a-time workflows only. Suggest: a short paragraph noting that when multiple units run simultaneously, live artifacts must carry a unit identifier in the filename, with a recommended convention (`[unit-slug]-[handoff-type].md`). |
| `$GENERAL_OWNER_ROLE` | Update | Add a note acknowledging that in small-team projects, the Owner is often also a primary practitioner (e.g., Account Manager who also does strategy). Note that this combination is valid but makes the hard rules especially important: the practitioner pressure to skip governance steps is internal, not external. |
| `$INSTRUCTION_ROLES` | Update | Add a note on part-time or phase-scoped roles. When a role is only active during specific phases, the role document should state the activation condition and the closure condition explicitly in the Primary Focus section. |
| `$GENERAL_IMPROVEMENT_PROTOCOL` | No change | The existing guidance to document role mapping and dropped phases explicitly was sufficient and produced good output. No update needed. |

---

## Completion Checklist

- [x] All foundational documents created and populated
- [x] Human approval received
- [x] Signal report written and filed at `a-society/onboarding_signal/promo-agency-2026-03-06.md`
