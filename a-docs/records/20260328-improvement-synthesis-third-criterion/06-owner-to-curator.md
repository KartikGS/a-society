**Subject:** `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` — add third merge criterion to Synthesis Phase
**Type:** Forward Pass Closure
**Date:** 2026-03-28

---

## Forward Pass: Confirmed Complete

All four approved changes verified by re-reading the current file state (not inferred from the implementation confirmation):

1. **`$GENERAL_IMPROVEMENT` line 205** — merge assessment criteria clause reads "(1) same target files or same design area, (2) compatible authority level, and (3) same workflow type and role path". Correct.
2. **`$A_SOCIETY_IMPROVEMENT` line 213** — identical three-criterion clause. Correct.
3. **`$A_SOCIETY_UPDATES_DIR`** — `2026-03-28-improvement-synthesis-third-criterion.md` present on disk. Correct.
4. **`$A_SOCIETY_VERSION`** — header updated to v23.0; History row added for this update report. Correct.

Forward pass is closed.

---

## Log Updated

- **Current State:** Updated to v23.0.
- **Recent Focus:** improvement-synthesis-third-criterion (this flow) replaces runtime-tool-calling.
- **Previous:** runtime-tool-calling added; runtime-orchestrator-mvp moved to `$A_SOCIETY_LOG_ARCHIVE`.
- **Next Priorities:** "Merge assessment: third criterion missing from Synthesis Phase" item removed.

---

## Backward Pass: Initiated

Component 4 invoked: `orderWithPromptsFromFile('…/20260328-improvement-synthesis-third-criterion', 'Curator')`

**Traversal order (3 steps):**

| Step | Role | Type | Session |
|---|---|---|---|
| 1 | Curator | meta-analysis | existing-session |
| 2 | Owner | meta-analysis | existing-session |
| 3 | Curator | synthesis | new-session |

---

## Step 1 — Curator Meta-Analysis

Resume the existing Curator session:

```
Next action: Perform your backward pass meta-analysis (step 1 of 3).

Read: all prior artifacts in the record folder, then ### Meta-Analysis Phase in a-society/general/improvement/main.md

Expected response: Your findings artifact at the next available sequence position in the record folder (07-curator-findings.md). When complete, hand off to Owner (meta-analysis).
```

---

## Step 2 — Owner Meta-Analysis

After receiving the Curator's findings, the Owner produces findings in this session. No session switch needed.

---

## Step 3 — Curator Synthesis

After Owner findings are complete, start a new Curator session:

```
You are a Curator agent for A-Society. Read a-society/a-docs/agents.md.

You are performing backward pass synthesis (step 3 of 3 — final step).

Read: all findings artifacts in a-society/a-docs/records/20260328-improvement-synthesis-third-criterion, then ### Synthesis Phase in a-society/general/improvement/main.md

Produce your synthesis at the next available sequence position in a-society/a-docs/records/20260328-improvement-synthesis-third-criterion.
```
