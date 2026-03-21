**Subject:** Parallel track records convention fix — A1, A2, Gen1, Gen2
**Status:** BRIEFING
**Date:** 2026-03-21
**Record:** `a-society/a-docs/records/20260321-parallel-track-records-fix/`

---

## Background

Four items approved in `15-owner-to-curator.md` from the backward-pass-orderer-redesign flow. All four are additive rule additions with no open direction questions. The prior decision document is the authoritative source for the direction; this brief specifies the exact implementation.

Source: `a-society/a-docs/records/20260320-backward-pass-orderer-redesign/15-owner-to-curator.md`

---

## Agreed Changes

### A1 — Parallel track sub-labeling rule `[Requires Owner approval]`

**Target files:**
- `$A_SOCIETY_RECORDS` (`a-society/a-docs/records/main.md`)
- `$INSTRUCTION_RECORDS` (`a-society/general/instructions/records/main.md`)

**Placement in `$A_SOCIETY_RECORDS`:** Add a new named paragraph immediately after the "Naming convention for non-standard slots" paragraph in the Artifact Sequence section.

**Placement in `$INSTRUCTION_RECORDS`:** Add a new named paragraph at the end of the Sequencing section (after the "Reference stability" paragraph).

**Content to add (both files — adapt prose to match each file's existing voice):**

> **Parallel track sub-labeling:** When the Owner declares parallel tracks at intake — meaning the forward-pass path includes two or more roles working concurrently before a convergence point — they must pre-assign sub-labeled sequence positions for each track's expected convergence artifacts at intake. Format: `NNa-`, `NNb-`, etc. (e.g., `08a-curator-findings.md`, `08b-developer-findings.md`). The Owner assigns sub-labels in `workflow.md` and in the record folder convention at intake, before any parallel work begins. This is an intake obligation — not a post-hoc correction when a collision is discovered.

---

### A2 — Checkpoint discipline rule `[Requires Owner approval]`

**Target files:**
- `$A_SOCIETY_RECORDS` (`a-society/a-docs/records/main.md`)
- `$INSTRUCTION_RECORDS` (`a-society/general/instructions/records/main.md`)

**Placement in `$A_SOCIETY_RECORDS`:** Add a new named paragraph to the `workflow.md — Forward Pass Path` section, immediately after the "Who creates it" line (before the "Who can edit it" line). The paragraph should appear as an authorship obligation.

**Placement in `$INSTRUCTION_RECORDS`:** Add a new named paragraph to the `workflow.md — Forward Pass Path` section, after the "Who creates it" line.

**Content to add (both files — adapt to each file's voice):**

> **Completeness obligation:** When populating `workflow.md` at intake, the Owner must list every role step they expect — including intermediate Owner review and approval checkpoints between roles. An entry for a non-Owner role must be followed by an Owner entry if the Owner will review or approve before the next role acts. Example: "TA — Advisory" must be followed by "Owner — TA Review" when the Owner reviews the advisory before the Curator proceeds. No Owner checkpoint may be omitted because it was implied. Silent checkpoints produce `workflow.md` paths that do not match the flow that actually ran, which corrupts backward pass ordering.

---

### Generalizable 1 — Pre-convention folder exemption `[Requires Owner approval]`

**Target file:** `$INSTRUCTION_RECORDS` only. Already present in `$A_SOCIETY_RECORDS`.

**Placement:** Add two new named paragraphs to the `workflow.md — Forward Pass Path` section of `$INSTRUCTION_RECORDS`, immediately after the "Relationship to the plan's `path` field" paragraph. Mirror the existing content in `$A_SOCIETY_RECORDS` with project-agnostic framing.

**Content to add:**

> **Pre-convention record folders:** Record folders created before the project established the `workflow.md` requirement are exempt from that requirement. The absence of `workflow.md` in a pre-convention folder is not a convention violation — it is expected. The Backward Pass Orderer tool (if the project uses one) cannot be invoked for these folders; use manual backward pass ordering. Future agents encountering a record folder without `workflow.md` should verify whether the folder predates this requirement before treating the absence as an error. Projects should record the convention introduction date or version in their `records/main.md` to make this determination unambiguous.

> **Bootstrapping exemption:** When a flow establishes a new record-folder requirement (such as the introduction of `workflow.md` itself), that flow's record folder is exempt-by-origin from the requirement it creates. The flow that introduces a requirement cannot retroactively conform to it. This exemption must be noted explicitly in the flow's artifacts — it must not be handled by silence. An agent encountering this case must either (a) acknowledge the exemption in the initiation artifact and proceed with manual ordering, or (b) create the required file manually for the current folder if conformance is achievable without contradiction.

---

### Generalizable 2 — Forward pass closure boundary `[Requires Owner approval]`

**Target file:** `$GENERAL_IMPROVEMENT` (`a-society/general/improvement/main.md`) only. Already present in `$A_SOCIETY_IMPROVEMENT`.

**Placement:** Add as a new bullet at the end of the `### Guardrails` section, after the existing "The backward pass is not an execution session" bullet.

**Content to add:**

> - **Forward pass closure boundary:** Do not begin the backward pass before the forward pass is explicitly closed by the intake role as a distinct step. The intake role is the terminal node of every forward pass. Issuing a single instruction that collapses "complete registration" and "proceed to backward pass" into one step removes the boundary. The correct sequence: (1) the final forward-pass role completes its work and returns to the intake role; (2) the intake role reviews the completed work, confirms the forward pass is closed, and issues a separate backward pass initiation. Findings produced before the forward pass is confirmed closed may be based on incomplete work.

---

## Files Changed

| File | Variable | Action |
|---|---|---|
| `a-society/a-docs/records/main.md` | `$A_SOCIETY_RECORDS` | Additive — A1 (Artifact Sequence section), A2 (workflow.md section) |
| `a-society/general/instructions/records/main.md` | `$INSTRUCTION_RECORDS` | Additive — A1 (Sequencing section), A2 (workflow.md section), Gen1 (workflow.md section) |
| `a-society/general/improvement/main.md` | `$GENERAL_IMPROVEMENT` | Additive — Gen2 (Guardrails section) |

---

## Registration

No new files are created. No index rows need to be added. No manifest changes — existing files are modified only.

After implementation, check `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether a framework update report is warranted.

---

## Open Questions

None.
