# Backward Pass Findings: Curator — 20260318-tooling-enforcement-mechanism

**Date:** 2026-03-18
**Task Reference:** 20260318-tooling-enforcement-mechanism
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

**1. "Implement directly" and "submit as proposal" were given for the same item in `08-owner-to-curator.md`.**

The brief stated "This is Curator-authority; implement directly" for the public index registration, then immediately directed: "Submit all three as a single proposal in `09-curator-to-owner.md`." These cannot both be literally true. I resolved it by including item 1 in the proposal with a note marking it as Curator-authority, and the Owner approved. But the brief gave genuinely conflicting signals on whether Owner review was required for that item. A future Curator would face the same interpretive choice.

The underlying ambiguity: when a brief bundles Curator-direct items with proposal-required items, the brief should explicitly distinguish them ("include for record" vs. "requires approval"). Bundling them into a single proposal without that distinction implies all items are proposal-required.

---

### Missing Information

**2. INVOCATION.md update obligation is not covered by the coupling map's change taxonomy.**

When I registered Component 7 in `09-curator-to-owner.md`, I did not propose an update to the `$A_SOCIETY_TOOLING_INVOCATION` description. The Owner added it as Addition 1 in `10-owner-to-curator.md`. I should have caught it.

The coupling map change taxonomy defines Type B as: "A new tool is built that agents should invoke → A `general/` instruction update naming the tool and directing agents to invoke it." INVOCATION.md is not a `general/` instruction — it is the consolidated invocation reference in `tooling/`. Type B does not explicitly cover it. The taxonomy has no change type for "update the consolidated invocation reference when a new component is added." A standing Curator check — "when registering a new tooling component, assess whether `INVOCATION.md` requires updating" — is currently not written anywhere.

**3. Backward pass role for Curator in flows with a Tooling Developer is ambiguous.**

The addendum describes the backward pass order for this flow as: Developer → Owner → Curator (synthesis only). The standard improvement protocol in `$A_SOCIETY_IMPROVEMENT` describes a different order: Curator produces findings first, Owner produces findings second, Curator synthesizes last. In this backward pass, the Developer produced findings at position 11 and I was directed to produce findings at position 12 — placing me between the Developer and the Owner. This matches neither ordering exactly. The two documents do not reconcile the Curator's role (findings vs. synthesis-only) when a Developer also fires in the same flow. The correct behavior was determined by the human's direction, not by any documented rule.

---

### Unclear Instructions

**4. Existing-session handoff format is not documented in the Curator role.**

The handoff protocol in `$A_SOCIETY_CURATOR_ROLE` specifies the copyable prompt format for new sessions: `"You are a [Role] agent for [Project Name]. Read [path to agents.md]."` It gives no equivalent for existing sessions — only "switch to the receiving role's existing session." The user corrected me twice during this flow for incomplete handoffs: once when I said "switch to the Owner session" without explaining what the Owner should do, and once when I listed artifact paths without providing a copyable status signal. The rule for existing-session handoffs — what "copyable inputs" means when no role-assignment prompt is needed — is absent from the role doc.

The Developer flagged the same gap (finding #5 in `11-developer-findings.md`). It is the highest-impact friction point in this flow, affecting both roles.

*Generalizable finding: this gap applies equally to any project using the A-Society framework where agents hand off to existing sessions. The current role templates in `general/roles/` inherit the same omission from the A-Society role docs. Flag as potential `general/` contribution.*

---

### Redundant Information

- None.

---

### Scope Concerns

**5. No standing Curator check for INVOCATION.md during new component registration.**

This connects to finding #2. The Curator's scope during Phase 7 registration is described in the addendum: "Register all new `tooling/` paths in `$A_SOCIETY_PUBLIC_INDEX`... Register any new `a-docs/` artifacts in `$A_SOCIETY_INDEX`... Add entries to `$A_SOCIETY_AGENT_DOCS_GUIDE` for any new `a-docs/` files." INVOCATION.md is not mentioned. The addendum does not include updating INVOCATION.md as a Curator registration responsibility — it was written by the Developer in Phase 6 (invocation documentation). When a new component is added post-Phase-6, updating INVOCATION.md is neither explicitly a Developer task (the Developer's implementation sprint is closed) nor explicitly a Curator task (the addendum's registration list omits it). The responsibility falls in a gap between the two roles.

---

### Workflow Friction

**6. Track 2 brief scope required Owner correction at approval time.**

The brief in `08-owner-to-curator.md` listed three Track 2 items. My proposal (`09-curator-to-owner.md`) addressed those three items. The Owner added a fourth item (INVOCATION.md description update) at approval time in `10-owner-to-curator.md`. The scope expansion at the approval stage is late — ideally the brief is complete enough that the proposal round does not require Owner scope additions. In this case the correction was minor and the Owner caught it, but a future Curator might not get that correction, and a future Owner reviewing a proposal might not notice the gap either.

---

## Top Findings (Ranked)

1. **Existing-session handoff format undocumented** — both Curator and Developer experienced this; user corrected me twice. Affects `$A_SOCIETY_CURATOR_ROLE`, `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`, and potentially `general/roles/` templates. *Generalizable.*

2. **INVOCATION.md update not covered by coupling map taxonomy or addendum registration checklist** — gap caused me to miss it in my proposal; Owner added it at approval. Affects `$A_SOCIETY_TOOLING_COUPLING_MAP` change taxonomy and the addendum's Phase 7 registration list.

3. **Backward pass Curator role ambiguous in multi-role flows** — addendum says synthesis-only; improvement protocol says findings-first; actual execution was neither. Affects `$A_SOCIETY_TOOLING_ADDENDUM` Phase 7 backward pass description and `$A_SOCIETY_IMPROVEMENT`.

4. **"Implement directly" vs "submit as proposal" conflict in brief wording** — `08-owner-to-curator.md` gave conflicting signals for the public index item. Affects brief authoring practice; may warrant a convention in `$A_SOCIETY_COMM_TEMPLATE_BRIEF` or the Curator handoff protocol.

5. **INVOCATION.md ownership gap between Developer and Curator for post-Phase-6 components** — neither the addendum's Developer scope nor the addendum's Curator registration checklist covers INVOCATION.md updates when a component is added after the original implementation phases close. Affects `$A_SOCIETY_TOOLING_ADDENDUM` Phase 7 registration list.
