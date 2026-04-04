# A-Society: Backward Pass Meta-Analysis Phase

Project-specific instructions for roles producing backward pass findings in A-Society.

---

### When to Run

Run the backward pass after every substantive forward pass — any work that involved multiple phases or touched structural decisions. For trivial edits with no friction, the backward pass can be minimal — a single sentence noting that no friction was observed is sufficient. The backward pass is always done; depth varies.

The depth of the backward pass should be proportional to the work:
- **Lightweight:** 1–3 top findings, brief rationale. Use for routine work.
- **Full:** Structured per-agent findings using the findings template. Use when blocking friction, ambiguity, or contradictions were encountered during the forward pass.

If unsure, default to lightweight.

---

### Ordering and Output

The role order for findings sessions is determined by `$A_SOCIETY_IMPROVEMENT` together with the active record folder's `workflow.md`. Follow the sequence the runtime or backward-pass initiation artifact gives you; do not infer your place in the order ad hoc from the current flow.

Save your findings as the next sequenced artifact in the active record folder. See `$A_SOCIETY_RECORDS` for the naming convention.

**Template:** `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`

---

### Reflection Categories

Use these categories to guide your reflection (not all will apply to every task):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear

Ground every finding in a specific moment from your execution. Vague findings are not useful.

---

### Analysis Quality

**Externally-caught errors are higher priority, not lower.** When an error was caught by another role or the human rather than surfaced by you, treat that as a prevention failure. The backward pass question is not only "what was the error?" but "why didn't my current context stop it earlier?"

**Artifact production vs. genuine analysis.** The reflection categories are prompts, not boxes to fill. If a finding could have been written without tracing the error, the analysis has not been done. A genuine finding names a specific root cause, not just the visible symptom.

---

### Generalizable Findings

When a finding appears project-agnostic — equally applicable to software, writing, and research projects — flag it explicitly as a potential framework contribution so it is not lost during synthesis.

---

### Useful Lenses

When evaluating whether a finding warrants action, consider:

- **Portability:** Is the fix specific to A-Society, or should it propagate to `general/`?
- **Evolvability:** Does the fix reduce future edit cost?
- **Proportionality:** Is the fix worth the disruption?

These are judgment aids, not mandatory per-finding assessments.

---

### Completion Signal

When your findings artifact is saved, emit a `meta-analysis-complete` handoff block:

```handoff
type: meta-analysis-complete
findings_path: <repo-relative path to the findings file you just produced>
```

The `findings_path` field must be the repo-relative path to the findings artifact you produced in this session.
