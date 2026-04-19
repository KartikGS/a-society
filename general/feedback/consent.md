# Feedback Consent — Template

This file is instantiated once per feedback type in an adopting project's `a-docs/feedback/[type]/` folder. Copy it, fill in the fields, and save it at the correct path. One file per feedback type.

The agent that produces feedback for this type checks this file before writing. It is not part of any role's session-start required reading — it is loaded on-demand, only when the agent is about to write feedback.

---

## Template

```markdown
# Feedback Consent: [Type]

**Type:** [onboarding-signal / migration / curator-signal]
**Consented:** [Yes / No]
**Date:** [YYYY-MM-DD]
**Recorded by:** [Role that recorded this — e.g., Initializer, Owner Agent]

## What This Covers

[One sentence describing what the agent will write and where it will go if Consented is Yes.]

## Agent Behavior

- If `Consented: Yes` — proceed with writing the feedback artifact to the designated path in `a-society/feedback/[type]/`.
- If `Consented: No` or this file is absent — skip writing. Note in session output: "Feedback skipped — consent not recorded for [type]."
```

---

## Notes for the Agent Creating This File

- Do not modify this file after consent is recorded without explicit instruction from the human or project Owner
- If consent changes from Yes to No, update the Date field to the date of the change
- The `curator-signal` path name is legacy naming for project-level framework feedback to A-Society; projects do not need a Curator role to use it
- The "Recorded by" field names the role responsible for the consent conversation — typically the Initializer (for onboarding-signal) or the Owner Agent (for other types)
