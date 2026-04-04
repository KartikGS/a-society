# A-Society: Backward Pass Synthesis Phase

Project-specific instructions for the Curator synthesis session in A-Society.

---

### Synthesis Process

**Step 1.** **Curator synthesizes** actionable items from the backward pass findings and routes them based on structural scope:
   - Changes within `a-docs/`: implement directly. **Failure mode:** treating synthesis as an ideation exercise and generating a maintenance backlog. If the change is within `a-docs/`, make it now — never queue it.
   - Changes outside `a-docs/` (additions to `general/`, executable-layer changes, structural decisions, direction changes): create a Next Priorities entry in `$A_SOCIETY_LOG`. **Before filing**, apply the merge assessment: scan existing items for (1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path; when a merge is identified, replace the existing item(s) with a merged item retaining all source citations.

   Do not re-route improvement items through the project's main execution workflow, and do not initiate an Owner approval loop from synthesis.

**Step 2.** Record what was implemented directly and what was routed to `$A_SOCIETY_LOG` in the synthesis artifact for the active record folder.

**Step 3.** Curator completing synthesis closes the backward pass. No further handoff is required — the flow is complete when synthesis is done.

---

### Guardrails

- Do not silently mutate role authority boundaries during improvement implementation.
- Do not rewrite historical reports. They are immutable once produced.
- If two documents conflict, resolve by updating one source-of-truth and adding a cross-reference — never duplicate.
- The backward pass is not an execution session. Findings-producing roles should not produce plans, implementations, or new artifacts beyond their findings file.
- **Forward pass closure boundary:** Do not begin the backward pass before the forward pass is explicitly closed by the Owner as a distinct step. The Owner is the terminal node of every forward pass. Issuing a single instruction that collapses "complete registration" and "proceed to backward pass" into one step removes the boundary. The correct sequence is: (1) the final forward-pass role completes its work and returns to the Owner; (2) the Owner reviews the completed work, confirms that the forward pass is closed, and issues a separate backward-pass initiation. Findings produced before the forward pass is confirmed closed may be based on incomplete work. **Approval is not completion:** The Owner confirming closure while Curator tasks remain pending is a forward pass closure boundary violation. "Complete" means executed; the Owner must verify execution, not merely that approval was issued.
- **Every backward pass handoff must include all three fields.** Each role passing to the next backward pass role must include: `Next action:`, `Read:`, and `Expected response:`. Dropping a field is not permitted even when the receiving role could infer it from context.
