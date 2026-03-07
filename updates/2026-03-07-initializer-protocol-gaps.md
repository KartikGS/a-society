# A-Society Framework Update — 2026-03-07

## Summary

This update packages eight framework changes from the Initializer test-run follow-up cycle. Three are **Breaking** and require immediate Curator review in adopting projects because they change what a correct initialized `a-docs/` must contain. The remaining changes are split into **Recommended** and **Optional** guidance updates.

Known adopters at publication time: LLM Journey. This report is addressed to all adopting project Curators. Migration guidance is written generically — map `$[PROJECT]_*` placeholders to your project's actual index variable names.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 3 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 3 | Improvements worth adopting — Curator judgment call |
| Optional | 2 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### BREAKING 1 — Initializer now requires `agent-docs-guide.md`

**Impact:** Breaking  
**Affected artifacts:** `$A_SOCIETY_INITIALIZER_ROLE`, `$INSTRUCTION_AGENT_DOCS_GUIDE`  
**What changed:** Phase 3 now requires creating `agent-docs-guide.md` as a foundational output.  
**Why:** Curators need file-purpose rationale to maintain docs safely; initialization without this artifact leaves maintenance context incomplete.  
**Migration guidance:**
- Create `agent-docs-guide.md` at your project's `a-docs/` root using `$INSTRUCTION_AGENT_DOCS_GUIDE`.
- Register it in your project index as `$[PROJECT]_AGENT_DOCS_GUIDE`.
- Update any role context-loading or maintenance docs that should require this file before doc maintenance work.

### BREAKING 2 — Initializer now requires `project-information/log.md`

**Impact:** Breaking  
**Affected artifacts:** `$A_SOCIETY_INITIALIZER_ROLE`, `$INSTRUCTION_LOG`  
**What changed:** Phase 3 now requires a project log during initialization, and Handoff Criteria treats it as foundational.  
**Why:** The first Owner session needs a current-state anchor; projects initialized without a log begin without an operational baseline.  
**Migration guidance:**
- If `project-information/log.md` exists in your `a-docs/`: verify it is current and maintained as the session-start source of truth.
- If it does not exist: create it using `$INSTRUCTION_LOG`, then register it in your project index as `$[PROJECT]_LOG`.

### BREAKING 3 — Improvement report templates must exist as real files at init time

**Impact:** Breaking  
**Affected artifacts:** `$A_SOCIETY_INITIALIZER_ROLE`, `$GENERAL_IMPROVEMENT_REPORTS`, `$GENERAL_IMPROVEMENT_TEMPLATE_LIGHTWEIGHT`, `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`, `$GENERAL_IMPROVEMENT_TEMPLATE_SYNTHESIS`, `$GENERAL_IMPROVEMENT_TEMPLATE_BACKLOG`  
**What changed:** Initialization now requires creating `improvement/reports/main.md` plus the four template files locally, rather than indexing template variables that point to non-existent local files.  
**Why:** Indexed references must resolve to real artifacts; missing files break discoverability and create dead references.  
**Migration guidance:**
- Ensure local files exist in your `a-docs/improvement/reports/`:
  - `template-lightweight.md`
  - `template-findings.md`
  - `template-synthesis.md`
  - `template-backlog.md`
- If your index template variables currently point to shared `$GENERAL_IMPROVEMENT_TEMPLATE_*` paths, repoint them to project-local paths under `$[PROJECT]_IMPROVEMENT_REPORTS`.
- Verify your `$[PROJECT]_IMPROVEMENT_REPORTS` folder index references the local template files.

### RECOMMENDED 1 — Concurrent unit naming guidance for conversation artifacts

**Impact:** Recommended  
**Affected artifacts:** `$INSTRUCTION_COMMUNICATION_CONVERSATION`  
**What changed:** Added guidance requiring unit-prefixed live artifact names in concurrent mode (`[unit-slug]-[sender]-to-[receiver].md`).  
**Why:** Base naming collides when two or more units are active simultaneously.  
**Migration guidance:**
- If your project runs multiple concurrent units (sprints, clients, assignments, or similar), adopt unit-prefixed live conversation filenames (`[unit-slug]-[sender]-to-[receiver].md`) and update your conversation index and protocol references accordingly.
- If only one unit is active at a time, no migration is required.

### RECOMMENDED 2 — Part-time / phase-scoped role lifecycle guidance

**Impact:** Recommended  
**Affected artifacts:** `$INSTRUCTION_ROLES`  
**What changed:** Added requirement to state activation and closure conditions in Primary Focus for part-time or phase-scoped roles.  
**Why:** Without lifecycle boundaries, agents in scoped roles cannot reliably determine when to act or stand down.  
**Migration guidance:**
- Review role files for roles that are not always active.
- For each scoped role, add explicit activation and closure conditions in the Primary Focus section.

### RECOMMENDED 3 — Initializer now includes explicit user onboarding message

**Impact:** Recommended  
**Affected artifacts:** `$A_SOCIETY_INITIALIZER_ROLE`  
**What changed:** Phase 5 now requires a reusable onboarding message that tells the human what to do next and provides an Owner-invocation prompt template.  
**Why:** Reduces post-init confusion and increases successful first Owner session starts.  
**Migration guidance:**
- No direct migration is required for existing initialized projects.
- Future initializations will include this onboarding step as standard output.

### OPTIONAL 1 — Owner-as-practitioner pattern note

**Impact:** Optional  
**Affected artifacts:** `$GENERAL_OWNER_ROLE`  
**What changed:** Added note that Owner + practitioner role combination is valid in small teams, with governance safeguards emphasized.  
**Why:** Clarifies a common operating model without changing mandatory structure.  
**Migration guidance:**
- Optional adoption: if your governance role also executes delivery work, mirror this note in your project Owner-equivalent role doc.

### OPTIONAL 2 — Signal report changed from mandatory write to informed consent

**Impact:** Optional  
**Affected artifacts:** `$A_SOCIETY_INITIALIZER_ROLE`  
**What changed:** Initializer must request permission before writing onboarding signal reports; if denied, it closes without writing.  
**Why:** Preserves signal-report value while making participation explicit and user-controlled.  
**Migration guidance:**
- No migration is required for already-initialized projects.
- If using Initializer on new projects, treat signal reporting as opt-in and record outcome explicitly.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `$A_SOCIETY_UPDATES_DIR` periodically as part of their maintenance cycle.
