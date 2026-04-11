**Subject:** Proposal for Startup Context-Read Timing and Same-Role Session Continuity Guidance Alignment
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-04-11

---

## Trigger

Owner evaluation and briefing in `10-owner-to-curator-brief.md` confirming successful resolution of the runtime integration gate, and instruction to propose the deferred downstream guidance changes for context-read timing.

---

## What and Why

This proposal aligns the downstream guidance with the shipped runtime contract regarding startup context-read timing. In runtime-managed sessions, required readings injected at startup represent pre-loaded context. Instructing roles to "read" these files again on every request is redundant and creates a misleading default of constant re-reading. 

The proposed changes:
1. Revise the Owner role (`$A_SOCIETY_OWNER_ROLE`) to remove the default `read $A_SOCIETY_WORKFLOW` cue on every request, preserving routing authority without instructing a redundant re-read.
2. Add a reusable rule to `$INSTRUCTION_REQUIRED_READINGS` codifying the runtime vs. manual context-read timing instructions to ensure future adopting projects map this correctly in their own role documents.

This applies equally to any project type, as every project relies on `required-readings.yaml` for startup orientation. 

---

## Where Observed

A-Society — internal (runtime logic update affecting framework contract) and applicable to all initialized projects.

---

## Target Locations and Draft Content

### 1. `a-society/a-docs/roles/owner.md` (`$A_SOCIETY_OWNER_ROLE`)
**Proposed Change:** Modify the `Workflow routing` bullet point.
**Current:**
`- **Workflow routing** — routing work into the appropriate workflow by default. When the user makes a request, read $A_SOCIETY_WORKFLOW to route it.`
**Draft:**
`- **Workflow routing** — routing work into the appropriate workflow by default. When the user makes a request, route it per $A_SOCIETY_WORKFLOW.`

### 2. `a-society/general/instructions/roles/required-readings.md` (`$INSTRUCTION_REQUIRED_READINGS`)
**Proposed Change:** Replace the `Human/Manual Orientation` section with `Context-Read Timing Rules`.
**Draft:**
```markdown
## Context-Read Timing Rules

**Runtime-managed sessions:** Required-reading files injected at startup by the runtime count as already loaded. Role documents and runtime-owned startup prompts must not instruct default rereads of those injected files.

**Manual orientation:** While the runtime handles injection for agents, humans or agents performing manual orientation may still follow the ordered reading sequence in `required-readings.yaml` to establish context (e.g., `agents.md` → `$INDEX` → `$VISION` → `$STRUCTURE`).

Do not replicate this sequence as prose in `agents.md` or role files. Replicating the list creates a maintenance burden where the prose and the machine-readable authority will inevitably drift.
```

---

## Registration and Index Updates

**No index or registration updates are required.** 
The existing descriptions for `$A_SOCIETY_OWNER_ROLE` and `$INSTRUCTION_REQUIRED_READINGS` in `indexes/main.md` and `index.md` remain accurate and are not rendered materially misleading by these wording alignments.

---

## Update Report Assessment

**Assessment:** A framework update report **is required** and classified as **Breaking**, per `$A_SOCIETY_UPDATES_PROTOCOL`.
**Rationale:** The change introduces a new mandatory framework rule: "Role docs and runtime-owned startup prompts must not instruct default rereads of those injected files." Existing projects initialized prior to this change likely contain role templates with redundant "reread" prompts (as the Owner template did). This means existing instantiations will contain a gap/contradiction relative to the new standard constraints, demanding Curator review to align their project's role documents.

### Update Report Draft

# A-Society Framework Update — 2026-04-11

**Framework Version:** v[X.Y]
**Previous Version:** v[X.Y-1]

## Summary

The runtime contract now formally distinguishes between startup-injected context and manual reading requirements. We have updated the framework instructions to explicitly prohibit role documents from instructing agents to re-read injected required-readings files on every request.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 0 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### 1. Context-Read Timing Prohibitions

**Impact:** Breaking
**Affected artifacts:** `general/instructions/roles/required-readings.md`
**What changed:** Replaced the "Human/Manual Orientation" section with "Context-Read Timing Rules" to formally stipulate that injected files count as already loaded for runtime-managed sessions, and prohibited role docs from demanding default rereads of those files.
**Why:** Instructing agents to "read" injected files repeats context artificially, increasing token load and misleading the agent about its already-loaded startup state.
**Migration guidance:** The Curator should review all active role documents for default reading instructions referencing files already mapped in `required-readings.yaml` (e.g. "When a request arrives, read `$[PROJECT]_WORKFLOW`"). Remove the explicit read instruction while keeping the authority constraint (e.g. "When a request arrives, route it per `$[PROJECT]_WORKFLOW`").

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Out of Scope Note

This proposal is strictly limited to context-read timing instruction alignment. It explicitly **does not** advance same-role parallelism or any further runtime redesigns, nor does it address `a-society/general/roles/owner.md` as that template was previously assessed as compatible, barring any unseen future drift. The runtime-test verification gap (`projectNamespace === path.basename(projectRoot)`) remains excluded and preserved for a future runtime clean-up task.

---

## Owner Confirmation Required

The Owner must respond in `12-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until the Owner shows APPROVED status.
