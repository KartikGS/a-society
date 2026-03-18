---
**Subject:** Backward pass synthesis — Curator
**Task Reference:** 20260318-process-gap-bundle
**Role:** Curator
**Date:** 2026-03-18

---

## Convergence

All five of the Curator's ranked findings are confirmed by the Owner without modification. Both roles agree on root cause, target file(s), and authority level for each finding. No divergence. No conflicts to resolve.

---

## Finding Assessment

### Finding 1 — Variable pre-registration not surfaced in brief

**Status:** Confirmed by both roles. Root cause: `$A_SOCIETY_COMM_TEMPLATE_BRIEF` has no standing prompt requiring the Owner to verify that every variable referenced in proposed content is registered in the relevant index before sending. The decision artifact (Constraint A) caught this at review time — but that is a correction after the fact, not structural prevention. Both roles agree the fix belongs in the brief template as a pre-send check.

**Owner note:** Also a brief-authoring discipline gap — the Index-Before-Reference Invariant applies when writing proposed content, not only when implementing it. The template fix addresses structural prevention; the discipline note stands as an authoring reminder. The Owner further observes that the same pre-send check would have caught the wrong-variable-name error (Finding 5) — making Item A the higher-leverage of the two fixes.

**Routing:** New Next Priority A — Curator proposes; Owner reviews.

---

### Finding 2 — Owner handoff numbering provisional

**Status:** Confirmed by both roles. The Owner's Phase 2 decision artifact specified `05-curator-findings.md` — correct at decision time, but the update report submission inserted two artifacts before findings, shifting them to 07. Both roles agree the fix is: refer to backward-pass artifacts by function ("backward-pass findings after all submissions resolved"), not by fixed sequence number, when post-implementation submissions are possible.

**Fix scope:** `$A_SOCIETY_OWNER_ROLE` Handoff Output section; `$A_SOCIETY_RECORDS` artifact sequence notes. The Curator's generalizable finding also holds: `$INSTRUCTION_ROLES` and `$INSTRUCTION_RECORDS` should carry the same rule for any project with a post-implementation submission step — assess whether changes to those files are warranted as part of this fix.

**Routing:** New Next Priority C — Curator proposes; Owner reviews.

---

### Finding 3 — Single-pass constraint requires per-file transposition

**Status:** Confirmed by both roles. The brief's per-item organization is correct for scoping and review. Implementation requires a per-file view. For a twelve-item, sixteen-file bundle, the mental transposition is real overhead. The Owner's "Likely Target" table provided partial per-file overlap notes but not a complete per-file → items mapping. A "Files Changed" summary table at the top of the brief (organized per file, listing all items affecting it) would remove this step entirely.

**Fix scope:** `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — add "Files Changed" per-file summary table.

**Routing:** Subsumed under New Next Priority B.

---

### Finding 4 — Edit mode not specified for additive items

**Status:** Confirmed by both roles. For additive insertions into existing sections, the brief should explicitly state whether content is additive or replacing — the Curator's judgment was correct each time, but should not have required judgment.

**Fix scope:** `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — add explicit edit-mode field per change item (`[additive]` / `[replace]` / `[insert before X]`).

**Routing:** Subsumed under New Next Priority B.

---

### Finding 5 — `$A_SOCIETY_INDEX` variable naming ambiguity

**Status:** Confirmed by both roles. The Owner confirms this is a brief-authoring discipline gap: in a project with two indexes, using `$A_SOCIETY_INDEX` where `$A_SOCIETY_PUBLIC_INDEX` was intended required a lookup that should not have been necessary. No new structural rule is needed beyond what is already implied by the Index-Before-Reference Invariant. Item A (pre-send variable registration check) would catch this class of error — a wrong variable name fails the same check as a missing variable.

**Routing:** Addressable under Next Priority A; no separate priority needed.

---

## Owner Observation — Brief Format Scalability

The Owner notes this flow was the first large bundle in A-Society's record (nine priorities, four sections, twelve items) and that the brief template was designed for smaller sets. The two structural gaps that surfaced (per-file transposition, absent edit-mode field) are the addressable template additions in Priority B. The Owner judges the current format's upper bound at approximately nine priorities; above this size, the transposition problem becomes a genuine implementation risk.

**Routing:** Addressed by Next Priority B.

---

## Owner Observation — Approval Invariant Language Tension (Not Actioned)

The Owner observes a residual tension: the Brief-Writing Quality concept instructs the Owner to write "fully-specified briefs for mechanical changes," which creates a pull toward treating proposal as formality — a pull that now conflicts with the clarified Approval Invariant. Items 1a–1c addressed the downstream framing correctly. The upstream question — whether "fully-specified brief" guidance should be reframed or bounded differently — was not surfaced as a priority in this flow. The Owner explicitly does not recommend a dedicated flow at this time.

**Routing:** No action. Observation recorded.

---

## Bundling Assessment

**Validated by both roles.** No revision cycles. Proposal passed Phase 2 on first submission. All eleven changes were implementable without design ambiguity. File overlaps argued for bundling — sequential flows would have required careful coordination on shared files, or accepted partial-state read risk. Bundling was the correct decision. Bundle size (nine priorities) appears near the upper bound for the current brief format.

---

## New Next Priorities

Three priorities surfaced from this backward pass. All require Curator proposal → Owner review before implementation (per explicit Owner direction in `08-owner-findings.md`).

| # | Tags | Description | Authority | Source |
|---|---|---|---|---|
| A | `[S][MAINT]` | **Variable pre-registration check in brief template** — Add a standing pre-send check to `$A_SOCIETY_COMM_TEMPLATE_BRIEF` requiring the Owner to verify that every variable referenced in proposed content is registered in the relevant index before sending. Highest priority — a missed registration can ship broken variable references to implementation. | Curator proposes; Owner reviews | Finding 1 |
| B | `[S][LIB][MAINT]` | **Per-file summary + edit-mode fields in brief template** — Add a "Files Changed" per-file summary table to `$A_SOCIETY_COMM_TEMPLATE_BRIEF` (organized per file, listing all items affecting it) and an explicit edit-mode field per change item (`[additive]` / `[replace]` / `[insert before X]`). Assess whether `$GENERAL_OWNER_ROLE` Brief-Writing Quality section requires a corresponding update. | Curator proposes; Owner reviews | Findings 3 & 4 |
| C | `[S][MAINT]` | **Function-based backward-pass artifact references** — In `$A_SOCIETY_OWNER_ROLE` Handoff Output and `$A_SOCIETY_RECORDS` artifact sequence notes, replace fixed sequence-number references to backward-pass artifacts with function-based references ("backward-pass findings after all submissions resolved") when post-implementation submissions are possible. Assess whether `$INSTRUCTION_ROLES` and `$INSTRUCTION_RECORDS` require the same rule (generalizable finding from Curator findings). | Curator proposes; Owner reviews | Finding 2 |

These priorities are registered in `$A_SOCIETY_LOG` as Next Priorities 1–3. Priority 10 from the prior list (Shared utils.ts + backward pass trigger prompt tool) is now unblocked — Priorities 4–9 are complete — and becomes Next Priority 4.

---

## Flow Status

**Complete.** No further Owner action is required for this flow. The three new Next Priorities (A, B, C) are trigger inputs for future flows; they do not require Owner acknowledgment before this flow closes. Priority 10 (Shared utils.ts + backward pass trigger prompt tool) is now unblocked.

No session switch required. The Owner may proceed directly to the next flow when ready.
