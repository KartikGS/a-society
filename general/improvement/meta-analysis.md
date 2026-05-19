# Backward Pass: Meta-Analysis Phase

Instructions for roles producing backward pass findings.

Scope: the project's framework layer only — `a-docs/`, workflow and coordination surfaces, and agent-facing tooling guidance. Not for domain work product; bugs, feature requests, and content changes belong to the project's normal execution system.

---

### Depth

Depth is proportional to the work. **Lightweight:** 1–3 top findings, brief rationale — for routine work. **Full:** structured per-agent findings using the findings template — when blocking friction, ambiguity, or contradictions were encountered during the forward pass. If unsure, default to lightweight.

---

### What to Reflect On

Use these categories to guide your reflection (not all will apply to every task):

1. **Conflicting instructions** — two documents said different things
2. **Missing information** — something you needed wasn't documented
3. **Unclear instructions** — you had to guess at the intended meaning
4. **Redundant information** — the same thing was said in multiple places
5. **Scope concerns** — a role boundary or responsibility was ambiguous
6. **Workflow friction** — a step felt unnecessary or a handoff was unclear
7. **Role file gaps** — something you needed to do your job correctly was absent from or wrong in your role file. This includes: instructions that referenced documents not in your context without telling you where to find them, constraints you had to infer rather than read, and directives that pointed to outdated APIs or procedures. Ask explicitly: "Was there anything I did confidently that turned out to be wrong, where my role file gave me no signal that I was operating incorrectly?"

Ground every finding in a specific moment from your execution. Vague findings ("the docs could be better") are not useful.

---

### Direct Local Corrections

Backward pass meta-analysis is allowed to directly correct local standing framework surfaces.

- If you own a standing local surface in the project's `ownership.yaml`, update it during this phase when the needed change is clear.
- The Owner may directly update Owner-owned governance surfaces during this phase as well.
- Historical records are immutable. Do not rewrite old record artifacts, reports, or archived logs.

Your findings artifact should record:
- what friction you encountered
- what local correction you made, if any
- what still needs Owner attention locally

---

### Analysis Quality

**Externally-caught errors are higher priority, not lower.** When an error was caught by another role or the human rather than surfaced by the agent themselves, this is a signal that something failed to prevent the error. The backward pass must ask: "Why wasn't this caught by me?" The answer "the rule was documented" is the start of the analysis, not the end. The next question — "why wasn't the documented rule followed?" — leads to placement gaps, surfacing gaps, or structural gaps, all of which are actionable.

**Artifact production vs. genuine analysis.** The reflection categories are a starting point, not a checklist to fill. If a finding could have been written without tracing the error, the analysis has not been done. A genuine finding names a specific root cause, not just a description of what went wrong.

---

### Useful Lenses

When evaluating whether a finding warrants action, consider:

- **Evolvability:** Does the fix reduce future edit cost (e.g., canonical source + cross-reference instead of duplication)?
- **Proportionality:** Is the fix worth the disruption? Small friction in a rare edge case may not warrant a doc change.

These are judgment aids, not mandatory per-finding assessments.

---

### a-docs Structure Checks

When the reviewed artifact lives in the project's `a-docs/` or affects the agent-documentation layer, apply these additional checks:

1. **Redundancy check:** Does this document reference, explain, or link anything already in the agent's starting context via required readings or runtime injection? If yes, flag the specific lines for removal.
2. **Conditional-instruction check:** Does this document contain instructions applicable only at a specific node or workflow type? If yes, flag the section for extraction to the node document where it applies, and add a pointer.
3. **Workflow-delivery check:** If a role document depends on node-specific support docs, does the active workflow surface those docs at the node where they are needed? If not, flag the gap as pointer-only JIT: the support doc exists, but the workflow is not delivering it at node entry.
4. **Role document scope check:** Does this role document contain anything beyond routing guidance, ownership declaration, and pointers to node-specific documents? If yes, flag the excess.
5. **agents.md scope check:** Does the project's `agents.md` contain anything beyond: what the project is (one paragraph), the authority/conflict resolution model, and project-wide invariants? If yes, flag it for removal.
6. **Addition-without-removal check:** When a new instruction is added to a role document or `agents.md`, does any existing content become redundant or vestigial? If yes, flag it. Adding without checking what the addition makes obsolete is how garbage accumulates.
7. **Repeated-header matching guidance:** When editing files with repeated semantic sub-headers (for example, `### Roles` appearing under multiple parent `##` headings), include the parent section header in the match context to preserve placement integrity. A mis-edit that places content under the wrong parent due to ambiguous header matching is a structural error, not a minor slip.

---

### Output Format

File findings as a sequenced artifact in the active record folder: `NN-<role>-findings.md`

**Template:** `[PROJECT_IMPROVEMENT_TEMPLATE_FINDINGS]`

---

### Completion Signal

When your findings artifact is saved, emit a `meta-analysis-complete` handoff block:

```handoff
type: meta-analysis-complete
findings_path: <repo-relative path to the findings file you just produced>
```

The `findings_path` field must be the repo-relative path to the findings artifact you produced in this session. This signal tells the improvement orchestrator that your meta-analysis is complete and where to find your output.
Do not end an automated backward-pass meta-analysis session with `type: prompt-human`; the runtime expects this terminal `meta-analysis-complete` signal for the step to close.
