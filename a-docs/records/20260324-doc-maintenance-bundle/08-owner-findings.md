# Backward Pass Findings: Owner — doc-maintenance-bundle

**Date:** 2026-03-25
**Task Reference:** 20260324-doc-maintenance-bundle
**Role:** Owner
**Depth:** Full

---

## Review of Curator Findings

**Finding 1 (shared-list additions):** Confirmed. The root cause is accurate: the brief's scope derivation was incomplete for Item 3 because the search for where the merge assessment criterion list appears stopped at the two locations named in prior documents rather than scanning for all occurrences. The Curator correctly handled it via the cross-item consistency standing check and filed the residual to Next Priorities. The underlying brief-writing gap is real and warrants a fix in `$GENERAL_OWNER_ROLE` Brief-Writing Quality. See my Finding 1 below.

**Workflow friction (artifact sequence shift):** Confirmed — no action needed. Sequence shift from update report assessment is expected and was handled correctly. Agree with Curator's assessment.

---

## Findings

### Missing Information

**Finding 1: Brief-Writing Quality lacks guidance on shared list constructs**

When a brief adds a new item to an ordered conditions or criteria list, it should enumerate all documents containing that list — not only the document being updated. Item 3 (merge assessment third criterion) was added to `$INSTRUCTION_LOG` and `$A_SOCIETY_OWNER_ROLE`, but the same list also appears in the Synthesis Phase sections of `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT`. Both locations were missed in the brief's scope derivation. The cross-item consistency standing check caught the drift reactively; the brief should have surfaced it proactively.

Root cause: `$GENERAL_OWNER_ROLE` Brief-Writing Quality has guidance for multi-file scopes (Files Changed table) and for ordered-list insertion positions, but no guidance requiring the Owner to search for all occurrences of a shared list construct before finalizing scope. The fix is a new "Shared list constructs" guidance paragraph in Brief-Writing Quality.

*[Generalizable: applies equally to any project where review criteria, validation conditions, or approval checklists appear across multiple documents.]*

---

### Workflow Friction

**Finding 2: Expected response in Curator handoff collapsed a two-round sequence into one**

The Curator's `04-curator-to-owner.md` handoff specified: "Expected response: Approval decision on update report + Forward Pass Closure artifact." This combined two functionally separate Owner actions — approval (which requires Curator publication before it is "done") and closure (which requires confirmed publication before it can be issued) — into a single Expected response. The user correctly identified this as invalid sequencing and the Owner issued `05-owner-to-curator.md` as a separate approval artifact before closing the forward pass.

Root cause: the Handoff Output guidance in `$GENERAL_CURATOR_ROLE` (and `$A_SOCIETY_CURATOR_ROLE`) describes what to include in a handoff but does not restrict the Expected response to the *immediate* next action from the receiving role. When the receiving role's response depends on intermediate work by another role before a subsequent Owner action, the Expected response should name only the immediate next artifact — not the artifact that will come after the intermediate round.

Fix: add a clarifying rule to the Handoff Output guidance — the Expected response names the immediate next artifact from the receiving role in response to this specific handoff. It does not name artifacts that follow from subsequent intermediate steps.

*[Generalizable.]*

---

## Top Findings (Ranked)

1. **Shared list constructs need full-occurrence search in brief scope derivation** — `$GENERAL_OWNER_ROLE` Brief-Writing Quality should add a "Shared list constructs" paragraph: when a brief adds to an ordered criteria or conditions list, search for all documents containing that list before finalizing Files Changed. `[S][LIB][MAINT]`. *Generalizable.*

2. **Expected response should be limited to the immediate next artifact** — `$GENERAL_CURATOR_ROLE` Handoff Output should clarify that Expected response names only the immediate next artifact from the receiving role. When the receiving role's response is followed by intermediate steps before a subsequent Owner action, those later Owner actions are not part of this handoff's Expected response. `[S][LIB][MAINT]`. *Generalizable.*

---

## Handoff

Resume the existing Curator session for synthesis (step 3 of 3).

```
Next action: Perform your backward pass synthesis (step 3 of 3 — final step).
Read: all findings artifacts in the record folder, then ### Synthesis Phase in a-society/general/improvement/main.md
Expected response: Synthesis artifact at the next available sequence position in the record folder.
```
