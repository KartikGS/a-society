# A-Society Framework Update — 2026-03-21

**Framework Version:** v17.1
**Previous Version:** v17.0

## Summary

Two improvements to existing general library documents: a corrected and explicit path format rule for file path indexes, and a new handoff completeness guardrail for backward pass chains. Both changes address failure modes observed during real project execution. Projects that have initialized an `a-docs/` using this framework may benefit from reviewing the two affected files against these additions.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 2 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### 1. Index path format — repo-relative requirement and unregistered-file guidance

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/instructions/indexes/main.md`]

**What changed:** Two additions to `$INSTRUCTION_INDEX`:

1. The path format rule in the Format Rules section has been replaced. The prior wording ("Paths are absolute from the project root. Use `/project-root/...` notation consistently.") was ambiguous — both repo-root-relative paths (e.g., `/project/a-docs/agents.md`) and machine-specific absolute paths (e.g., `/home/user/project/a-docs/agents.md`) begin with `/`, making the rule easy to misread. The replacement rule explicitly requires repo-relative paths (e.g., `project/a-docs/agents.md`) and explicitly prohibits machine-specific absolute paths with representative examples.

2. A new guidance block has been added to the "How to Use the Index" section covering the case where a file does not belong in the index. The guidance directs agents to use the file's repo-relative path directly in handoffs and artifacts, and explicitly prohibits inventing an unregistered `$VARIABLE_NAME` as a workaround.

**Why:** Real project execution produced an index where all entries were machine-specific absolute paths — breaking portability — and a handoff artifact that invented an unregistered variable to reference an unregistered file. Neither failure was preventable by the prior wording. These additions make both prohibitions explicit.

**Migration guidance:** Review your project's index file (`$[PROJECT]_INDEX`):
- Check whether any path entries begin with a machine-specific absolute prefix (e.g., `/home/`, `/Users/`). If so, replace those entries with repo-relative paths — paths relative to the repository root, without a leading machine-specific prefix (e.g., `my-project/a-docs/agents.md`).
- Paths that begin with the project or a-society folder name (e.g., `a-society/...`, `my-project/...`) in a form relative to the repo root are already conformant and require no change.

Also check recent handoff artifacts in your project's active record folders. If any contain unregistered `$VARIABLE_NAME` references — variables that do not appear in `$[PROJECT]_INDEX` — those references should be read as plain repo-relative paths. No document edits are required for historical handoffs; the guidance is forward-looking.

---

### 2. Backward pass handoff completeness

**Impact:** Recommended
**Affected artifacts:** [`a-society/general/improvement/main.md`]

**What changed:** A new guardrail has been added to the Guardrails section of `$GENERAL_IMPROVEMENT`: every handoff between backward pass roles must include all three fields — `Next action:`, `Read:`, and `Expected response:`. Dropping a field is not permitted even when the receiving role could infer it from context. Each role is responsible for producing all three fields before passing.

**Why:** During a multi-role backward pass, a handoff dropped the `Read:` field and omitted `Expected response:` entirely. The receiving role could have inferred what to read from context — and that is precisely why the fields were omitted. The new guardrail closes this by prohibiting inference as a substitute for explicit fields.

**Migration guidance:** Review your project's improvement protocol file (`$[PROJECT]_IMPROVEMENT`). Locate the Guardrails section. If it does not already contain a rule requiring all three handoff fields (`Next action:`, `Read:`, `Expected response:`) in backward pass handoffs, add the following guardrail:

> **Every backward pass handoff must include all three fields.** Each role passing to the next backward pass role must include: `Next action:`, `Read:`, and `Expected response:`. Dropping a field is not permitted even when the receiving role could infer it from context. Inference is not a substitute for an explicit handoff. Each role is responsible for producing all three fields before passing.

Place it before the Forward pass closure boundary guardrail, consistent with the ordering in the updated general template.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle. This limitation is known and acknowledged.
