# Backward Pass: Synthesis Phase

Instructions for the synthesis role.

---

### Synthesis Process

**Step 1.** **The synthesis role** reviews all findings and identifies which warrant action.

**Step 2.** **Actionable items are routed based on structural scope:**
   - Changes within `a-docs/`: implement directly without a formal proposal. **Failure mode:** treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets. If the change is within `a-docs/`, make it now — never queue it.
   - Changes outside `a-docs/` (additions to `general/`, structural decisions, direction changes): create an entry for a future flow using the project's tracking mechanism. **Before filing**, apply the merge assessment: scan existing Next Priorities items for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path; when a merge is identified, replace the existing item(s) with a merged item retaining all source citations. Do not initiate an Owner approval loop from within the backward pass.

   Do not re-route improvement items through the project's main execution workflow.

   The synthesis role completing synthesis closes the backward pass. End the session with a `type: backward-pass-complete` handoff block whose `artifact_path` points to the synthesis artifact. Do not end an automated backward-pass synthesis session with `type: prompt-human`; the runtime expects this terminal signal for the step to close.

---

### Guardrails

- Do not silently mutate role authority boundaries during improvement implementation.
- Do not rewrite historical reports to match newer conventions. Reports are immutable once produced.
- If two documents conflict, resolve by updating one source-of-truth and adding a cross-reference — never duplicate.
- The backward pass is not an execution session. Agents reflecting should not produce plans, implementations, or new artifacts beyond their findings file.
- **Forward pass closure boundary:** Do not begin the backward pass before the forward pass is explicitly closed by the intake role as a distinct step. The intake role is the terminal node of every forward pass. Issuing a single instruction that collapses "complete registration" and "proceed to backward pass" into one step removes the boundary. The correct sequence is: (1) the final forward-pass role completes its work and returns to the intake role; (2) the intake role reviews the completed work, confirms that the forward pass is closed, and issues a separate backward-pass initiation. Findings produced before the forward pass is confirmed closed may be based on incomplete work. **Approval is not completion:** The intake role confirming forward pass closure while downstream tasks remain pending (e.g., a step approved but not yet executed) is a forward pass closure boundary violation. "Complete" means executed; the intake role must verify execution, not merely that approval was issued.
- **Every backward pass handoff must include all three fields.** Each role passing to the next backward pass role must include: `Next action:`, `Read:`, and `Expected response:`. Dropping a field is not permitted even when the receiving role could infer it from context. Inference is not a substitute for an explicit handoff. Each role is responsible for producing all three fields before passing.
