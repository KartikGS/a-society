# Backward Pass Findings: Owner — 20260318-utils-bp-trigger-tool

**Date:** 2026-03-18
**Task Reference:** 20260318-utils-bp-trigger-tool
**Role:** Owner
**Depth:** Full

---

## Findings

### Owner Work Quality

**1. Backward pass order miscomputed in `09-owner-to-curator.md` — required human correction.**

I specified: Developer (10), TA (11), Owner (12), Curator synthesis (13). The correct order is: Curator (10), Developer (11), TA (12), Owner (13), Curator synthesis (14). The error: I applied the reversal but not the Owner second-to-last rule, and I conflated the Curator's non-synthesis forward-pass participation (doc updates, position 4) with the synthesis role — treating it as if their only backward position was synthesis. The Curator did forward-pass work and therefore has a separate non-synthesis findings step. The human caught this before any findings were produced at the wrong position.

The cause is the same problem this flow was built to solve: manually computing backward pass order in a multi-role flow produces errors. The irony is noted. The systemic fix is in the `$A_SOCIETY_IMPROVEMENT` mandate update (see Next Priorities below) — once `orderWithPromptsFromFile` is named as the expected call, the Owner invokes the tool and receives the correct order rather than computing it by hand.

**2. Brief `07-owner-to-curator.md` watch item lacked target text citation.**

The watch item asked the Curator to assess whether a change to `$GENERAL_IMPROVEMENT` was needed without quoting the specific passage in question. The Curator had to load both `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` to identify the relevant text before beginning the assessment. The brief should have included the verbatim passage from `$GENERAL_IMPROVEMENT`'s tooling paragraph so the Curator's assessment started at the right text, not with a search.

**3. Trigger prompt template errors in `03-ta-advisory.md` were caught by Owner review — mechanism worked.**

Two errors (article "a" vs "the"; leading slash on agents.md path) were caught in `04-owner-to-developer.md` and corrected before implementation. The TA's finding 4 correctly notes these were preventable. The review gate functioned as designed: spec errors are caught by Owner review, not by the Developer discovering them at runtime.

---

### Cross-Role / Meta Observations

**4. The same backward pass order error that motivated this flow was made by the Owner when routing the backward pass for this flow.**

The `20260318-process-gap-bundle` backward pass produced trigger prompt inconsistencies because the order was manually derived under pressure. This flow built `orderWithPromptsFromFile` to fix that. Then the Owner miscomputed the order for this flow's backward pass — demonstrating the gap the tool was built to close. This confirms that the `$A_SOCIETY_IMPROVEMENT` mandate update (Priority below) is load-bearing, not incremental. Until the mandate explicitly directs agents to invoke `orderWithPromptsFromFile`, manual computation remains the default and will produce the same class of error.

**5. Three roles converged on two spec gaps in `03-ta-advisory.md` (export removal change table; synthesis-absent edge case).**

Both gaps were flagged independently by Developer and TA with consistent characterization. Multi-role convergence on the same gap is a strong signal — both are correctness issues that should be addressed, not just noted.

The synthesis-absent edge case is a latent crash: `generateTriggerPrompts` will throw a TypeError if `firedNodeIds` excludes the synthesis node, because `order[total]` is `undefined` at the last non-synthesis entry. The current documented contract is silent. This requires a follow-on fix (see Next Priorities).

The change table gap (test files not listed for removed exports) is a TA advisory process issue. Worth an improvement note but lower priority than the runtime crash.

**6. Unregistered variable `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` in `$A_SOCIETY_IMPROVEMENT`.**

The Curator caught a pre-existing Index-Before-Reference violation: `$A_SOCIETY_IMPROVEMENT`'s Component 4 mandate references `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`, which is not registered in `$A_SOCIETY_INDEX`. Agents attempting to resolve this variable fail. The MAINT fix is contained — either register the variable or replace with `$A_SOCIETY_TOOLING_INVOCATION`.

---

## Next Priorities (for `$A_SOCIETY_LOG`)

These three items surface from this backward pass and are ready to enter the Next Priorities list:

**A.** `[S][MAINT]` — **`$A_SOCIETY_IMPROVEMENT` — unregistered variable + Component 4 mandate update (two-item MAINT bundle)**
Two closely related gaps in `$A_SOCIETY_IMPROVEMENT`'s Component 4 mandate section:
1. `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` is referenced but not registered in `$A_SOCIETY_INDEX` — violates Index-Before-Reference invariant. Fix: register the variable (pointing to INVOCATION.md as the invocation reference) or replace with `$A_SOCIETY_TOOLING_INVOCATION` inline.
2. The mandate directs agents to invoke Component 4 for traversal order computation only — `orderWithPromptsFromFile` and trigger prompt generation are not named. Agents following the mandate today invoke `orderFromFile` and miss the trigger prompt capability. Fix: extend the mandate to name `orderWithPromptsFromFile` as the preferred call when trigger prompts are also needed, and note what trigger prompts are and when to use them.
Both changes are in `$A_SOCIETY_IMPROVEMENT`. Bundling reduces round trips. Curator proposes; Owner reviews. Touches `$A_SOCIETY_IMPROVEMENT`.

**B.** `[S]` — **`generateTriggerPrompts` synthesis-absent guard**
When `firedNodeIds` excludes the synthesis node, `order[total]` is `undefined` at the last non-synthesis entry, producing a TypeError at `nextEntry.is_synthesis`. The approved spec was silent on this case; the latent crash was not remediated before ship. Requires a Developer fix: add a guard for `nextEntry === undefined` and define the contract — either throw with a clear error message (recommended: the synthesis node should always be present) or omit the handoff line with a documented warning. TA reviews implementation against the chosen contract. Touches `tooling/src/backward-pass-orderer.ts` and `test/backward-pass-orderer.test.ts`.

---

## Top Findings (Ranked)

1. **Backward pass order miscomputed** — `09-owner-to-curator.md`: Owner second-to-last rule not applied; Curator non-synthesis position conflated with synthesis. Required human correction. Root cause: manual computation is error-prone; tool mandate not directing agents to `orderWithPromptsFromFile`.
2. **`$A_SOCIETY_IMPROVEMENT` mandate gaps** — unregistered variable + missing `orderWithPromptsFromFile` direction: two correctness issues in the same section, addressable together.
3. **`generateTriggerPrompts` synthesis-absent latent crash** — `tooling/src/backward-pass-orderer.ts`: spec gap produces runtime TypeError; requires follow-on guard.
4. **Watch item brief lacked target text citation** — `07-owner-to-curator.md`: Curator had to search for the relevant passage; brief should have quoted it.
