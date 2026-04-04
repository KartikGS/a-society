# Backward Pass: Meta-Analysis Phase

Instructions for roles producing backward pass findings.

---

### When to Run

Run the backward pass after every substantive forward pass — any work that involved multiple phases or touched structural decisions. For trivial edits with no friction, the backward pass can be minimal — a single sentence noting that no friction was observed is sufficient. The backward pass is always done; depth varies.

The depth of the backward pass should be proportional to the work:
- **Lightweight:** 1–3 top findings, brief rationale. Use for routine work.
- **Full:** Structured per-agent findings using the findings template. Use when blocking friction, ambiguity, or contradictions were encountered during the forward pass.

The agent decides which depth is appropriate. If unsure, default to lightweight.

---

### What to Reflect On

Use these categories to guide your reflection (not all will apply to every task):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear

Ground every finding in a specific moment from your execution. Vague findings ("the docs could be better") are not useful.

---

### Analysis Quality

**Externally-caught errors are higher priority, not lower.** When an error was caught by another role or the human rather than surfaced by the agent themselves, this is a signal that something failed to prevent the error. The backward pass must ask: "Why wasn't this caught by me?" The answer "the rule was documented" is the start of the analysis, not the end. The next question — "why wasn't the documented rule followed?" — leads to placement gaps, surfacing gaps, or structural gaps, all of which are actionable.

**Artifact production vs. genuine analysis.** The reflection categories are a starting point, not a checklist to fill. If a finding could have been written without tracing the error, the analysis has not been done. A genuine finding names a specific root cause, not just a description of what went wrong.

---

### Generalizable Findings

When a finding appears project-agnostic — meaning it would apply equally to a software project, a writing project, and a research project — flag it explicitly as a potential framework contribution. Note it in the findings artifact so it is not lost.

The submission mechanism is defined separately — flag the finding explicitly in your findings artifact so it is not silently lost when the mechanism becomes available.

---

### Useful Lenses

When evaluating whether a finding warrants action, consider:

- **Portability:** Is the fix specific to this project, or should it propagate to the general library?
- **Evolvability:** Does the fix reduce future edit cost (e.g., canonical source + cross-reference instead of duplication)?
- **Proportionality:** Is the fix worth the disruption? Small friction in a rare edge case may not warrant a doc change.

These are judgment aids, not mandatory per-finding assessments.

---

### Output Format

- *If the project uses records:* `[PROJECT_RECORDS]/[identifier]/NN-<role>-findings.md` — findings are sequenced artifacts in the active record folder
- *If the project does not use records:* `[PROJECT_IMPROVEMENT_REPORTS]/META-YYYYMMDD-<TASK-ID>-<role>-findings.md`

The project's `improvement/main.md` declares which path applies.

Before selecting a sequence number, read the record folder's current contents to identify the actual next available number — intermediate artifacts filed during registration or late forward-pass steps may have shifted the sequence forward from its expected position.

**Template:** `[PROJECT_IMPROVEMENT_TEMPLATE_FINDINGS]`

---

### Completion Signal

When your findings artifact is saved, emit a `meta-analysis-complete` handoff block:

```handoff
type: meta-analysis-complete
findings_path: <repo-relative path to the findings file you just produced>
```

The `findings_path` field must be the repo-relative path to the findings artifact you produced in this session. This signal tells the improvement orchestrator that your meta-analysis is complete and where to find your output.
