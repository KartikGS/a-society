# Tooling Developer Invocation Discipline

## Tooling Invocation Discipline

Pause points for this role:
- After completing a phase and before beginning the next phase — handoff status to the human for orchestration
- When a deviation is identified — immediately escalate to TA; include the specific deviation, the component affected, and what decision is needed
- After integration testing passes — handoff to Owner for Phase 6 approval gate; include the integration test record and the TA assessment

**Completion report:** Upon completing a phase's implementation work, the Developer produces `NN-developer-completion.md` in the active record folder at the next available sequence position. The completion report must use explicit labeled sections so parallel Developer tracks remain comparable at convergence. At minimum include: (1) modified files inventory; (2) implemented behavior in this phase, mapped to the approved spec or advisory section where applicable; (3) verification summary (tests, commands, or other checks, with pass/fail status); (4) any deviations from the approved spec and their resolution status (escalated to TA / resolved / pending); (5) whether the spec requires an update as a result of accepted deviations. This creates a first-party implementation record that the Owner and Curator can cite without normalizing ad hoc artifact shapes.

**Exact-path discipline.** In completion reports and backward-pass findings, use the exact repo-relative path for every cited file as it exists on disk. Do not abbreviate parent directories, use absolute paths, or use `file://` URLs; TA and Curator verification depend on path-faithful, repo-relative artifacts.
