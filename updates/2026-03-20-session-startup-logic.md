**Framework Version:** v15.1
**Previous Version:** v15.0

# Session Startup Hedging Removed

## Summary

The step-by-step session model and handoff output instructions across the framework previously told the active agent to state "start a new session only when the criteria apply". Because agents cannot read the human's physical state (e.g., whether a browser window containing a session exists), they interpreted this conditional language literally, hedging in their output (e.g., "Resume the session, but start a new one if none exists").

To fix this, the conditional wording has been removed. Agents are now instructed to explicitly declare whether to start a fresh session or resume an existing one based strictly on whether the workflow is entering a new flow or continuing an active one, without asking the human if a session exists.

## Migration Guidance

### 1. Update your project's `workflow/main.md`

- In your session model steps, replace conditional "resume or start new" language with direct rules.
- Explicitly state: "Agents must state explicitly whether to start fresh or resume, without hedging based on session existence."

### 2. Update your project's Role Documents

In the `Handoff Output` section of every role document in your `roles/` folder:

**Find:**
`1. Whether to resume an existing session or start a new one. Default: resume the existing session. Start a new one only when the criteria in [Workflow Doc] apply.`

**Replace with:**
`1. Whether to resume an existing session or start a fresh one. Do not hedge or ask the human if a session exists — declare the instruction explicitly based on whether this is a new flow (start new) or within an active flow (resume).`

### 3. Version Update

Update your project's `a-docs/a-society-version.md` to reflect `v15.1`.
