# Backward Pass: Feedback Phase

Instructions for the coordinating Owner's final backward-pass step.

---

### Feedback Process

**Step 1.** Review all findings from the just-completed backward pass.

**Step 2.** Confirm local backward-pass maintenance is complete.

- Role-owned local standing surfaces should already have been corrected by their truth owners during meta-analysis.
- Owner-owned local governance surfaces should already be corrected now if the fix is clear.
- If a local issue still requires a new human decision, update the project's local governance/tracking surfaces directly. Do not bounce the backward pass back through other roles.

**Step 3.** Produce the final framework-feedback artifact.

This artifact is for upstream A-Society feedback, not for local project maintenance. Use it to capture:
- additions or changes that may belong in `a-society/general/`
- runtime or tooling feature requests
- cross-project patterns or anti-patterns
- framework-level documentation or workflow gaps

If the project later files feedback to A-Society's collection folders, this artifact is the authoritative source for that submission.

**Step 4.** Close the backward pass.

End the session with a `type: backward-pass-complete` handoff block whose `artifact_path` points to the feedback artifact. Do not end an automated backward-pass feedback session with `type: prompt-human`; the runtime expects this terminal signal for the step to close.

---

### Guardrails

- Do not silently mutate local role authority boundaries while producing this feedback artifact.
- Do not rewrite historical reports to match newer conventions. Reports are immutable once produced.
- If two documents conflict, resolve by updating one source-of-truth and adding a cross-reference — never duplicate.
- Do not use the feedback artifact as a maintenance backlog for local `a-docs/`. Local standing fixes belong in meta-analysis.
- Do not directly modify `a-society/general/` or upstream runtime/tooling from a downstream project's backward pass. Elevate those items as feedback here.
- **Forward pass closure boundary:** Do not begin the backward pass before the forward pass is explicitly closed by the intake role as a distinct step. The intake role is the terminal node of every forward pass. Issuing a single instruction that collapses "complete registration" and "proceed to backward pass" into one step removes the boundary. The correct sequence is: (1) the final forward-pass role completes its work and returns to the intake role; (2) the intake role reviews the completed work, confirms that the forward pass is closed, and issues a separate backward-pass initiation. Findings produced before the forward pass is confirmed closed may be based on incomplete work. **Approval is not completion:** The intake role confirming forward pass closure while downstream tasks remain pending (e.g., a step approved but not yet executed) is a forward pass closure boundary violation. "Complete" means executed; the intake role must verify execution, not merely that approval was issued.
