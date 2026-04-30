# Instruction: Upstream Feedback Consent

This instruction explains how runtime-managed projects handle consent for upstream A-Society feedback.

---

## What Feedback Consent Means Now

A-Society still requires explicit permission before writing upstream feedback, but consent is no longer scaffolded as project files.

Instead, the runtime asks for a decision at the end of each flow, after backward-pass meta-analysis is complete and before the final upstream feedback step would run.

That decision means:

- **Yes** — spend the extra turn, run the feedback agent, and write one report to the runtime-assigned path under `a-society/feedback/`
- **No** — skip the feedback agent entirely and close the flow

Consent is flow-specific, not global.

---

## When the Runtime Asks

The runtime asks only when all of the following are true:

1. the forward pass is already closed
2. backward-pass meta-analysis is complete
3. the next step would be the final upstream feedback step

This applies to standard flows, initialization flows, and update-application flows.

---

## What the Human Should Be Told

Before the decision is made, the runtime should make these points clear:

1. generating feedback will spend another agent turn
2. the report is written locally under `a-society/feedback/`
3. the report may contain project-specific details and should be reviewed or redacted before sharing
4. sharing is manual for now, typically by opening a GitHub PR

Do not imply automatic submission or background collection from the user's machine.

---

## Agent Behavior

When consent is denied:

- do not run the feedback agent
- do not create an upstream feedback file
- close the flow normally after meta-analysis

When consent is granted:

- run the feedback agent once
- write exactly one report to the runtime-assigned path under `a-society/feedback/`
- include enough context for upstream review, but avoid unnecessary sensitive detail

---

## What No Longer Happens

- Do not scaffold `a-docs/feedback/[type]/consent.md` files for new projects
- Do not register per-type feedback consent files in project indexes
- Do not model feedback as separate onboarding, migration, and curator-signal pipelines

The active model is one optional upstream feedback step after a normal backward pass.
