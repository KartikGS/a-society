---

**Subject:** Invocation gap closure — add tool invocation pointers to six instructions
**Status:** PENDING
**Type:** Brief
**Date:** 2026-03-15
**Recipient:** Curator

---

## Background

`$A_SOCIETY_TOOLING_COUPLING_MAP` (created in the prior flow) shows all six tooling components with open invocation gaps: no `general/` instruction currently directs agents to invoke them. This brief closes all six gaps in a single batch.

The changes are additive. Each adds an invocation pointer to an existing instruction — either replacing a manual step with a tool call plus fallback, or adding a new subsection naming the tool and when to invoke it. The fallback pattern is used throughout so the instructions remain valid for agents without the tools.

---

## Generalizability Note (for Curator's proposal)

The additions reference `$A_SOCIETY_TOOLING_*` variables. These are resolved from `$A_SOCIETY_PUBLIC_INDEX`, which is available to any project that uses the A-Society framework. All additions are phrased conditionally ("if the tool is available" / "when unavailable, follow manual steps"). Projects not using A-Society's tooling follow the existing manual instructions unchanged. The additions pass the generalizability test as optional enhancements to A-Society-aware agents — they do not break non-A-Society projects.

---

## Change 1 — `$INSTRUCTION_INDEX`

**Target file:** `/a-society/general/instructions/indexes/main.md`

**Placement:** After the "When moving a file" subsection in "How to Use the Index".

**Current text ends at:**
> 3. No other updates are needed.

**Add the following new subsection immediately after:**

> **When validating the index:**
> Run `$A_SOCIETY_TOOLING_PATH_VALIDATOR` to confirm every path in the index resolves to an existing file. Pass the index file path as the argument. A zero-failure result confirms all registered paths are accessible. Run after any index update: adding entries, updating paths after a file move, or retiring rows. A failing result names the specific entries to fix.

---

## Change 2 — `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`

**Target file:** `/a-society/general/instructions/a-society-version-record.md`

**Placement:** "How to Apply Update Reports (Curator)" — replace step 2.

**Current step 2:**
> 2. Check `a-society/updates/` for all reports whose **Previous Version** ≥ the project's recorded version

**Replace with:**
> 2. Run `$A_SOCIETY_TOOLING_VERSION_COMPARATOR` to identify which update reports have not yet been applied. Pass the path to `a-docs/a-society-version.md`. The comparator reads the project's recorded version and A-Society's current version and returns the list of pending update report filenames in version order. If the tool is unavailable, check `a-society/updates/` manually for all reports whose **Previous Version** ≥ the project's recorded version.

---

## Change 3 — `$INSTRUCTION_CONSENT`

**Target file:** `/a-society/general/instructions/consent.md`

**Placement:** "How to Create a Consent File" — replace steps 3–5 and renumber step 6 to step 4.

**Current steps 3–6:**
> 3. Copy the template from `$GENERAL_FEEDBACK_CONSENT`.
> 4. Fill in the fields: Type, Consented (Yes or No), Date, Recorded by, and a one-sentence description of what the agent will write.
> 5. Save the file at `a-docs/feedback/[type]/consent.md` in the project's `a-docs/`.
> 6. Register it in the project's index as `$[PROJECT]_FEEDBACK_[TYPE]_CONSENT`.

**Replace with:**
> 3. Run `$A_SOCIETY_TOOLING_CONSENT_UTILITY` to create the consent file. Pass: the project's `a-docs/` path, the feedback type identifier (`onboarding`, `migration`, or `curator-signal`), and the consent answer recorded in step 2. The utility creates the file at `a-docs/feedback/[type]/consent.md` with the correct format. If the tool is unavailable, copy `$GENERAL_FEEDBACK_CONSENT` manually, fill in the Type, Consented, Date, Recorded by, and description fields, and save at that path.
> 4. Register the consent file in the project's index as `$[PROJECT]_FEEDBACK_[TYPE]_CONSENT`.

---

## Change 4 — `$INSTRUCTION_WORKFLOW_GRAPH`

**Target file:** `/a-society/general/instructions/workflow/graph.md`

**Placement:** "How to Fill It In" — replace Step 5.

**Current Step 5:**
> **Step 5 — Verify backward pass order.** Sort distinct roles by `first_occurrence_position` ascending. Reverse the list. The synthesis role moves to the end. This should match the backward pass order in your workflow document. Correct the graph if it does not.

**Replace with:**
> **Step 5 — Validate and verify.** Run `$A_SOCIETY_TOOLING_WORKFLOW_GRAPH_VALIDATOR` to confirm the frontmatter schema is valid. Then run `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` to compute the backward pass order from the graph. Verify the computed order matches the backward pass order in your workflow prose document. Correct the graph if it does not. If the tools are unavailable: sort distinct roles by `first_occurrence_position` ascending, reverse the list, and move the synthesis role to the end — this should match the backward pass order in your workflow document.

---

## Change 5 — `$GENERAL_IMPROVEMENT` (improvement/main.md)

**Target file:** `/a-society/general/improvement/main.md`

**Placement:** After the "Backward Pass Traversal" section — specifically after the line "Only the nodes and edges that fired during this instance are included. Dead branches are excluded."

**Add the following paragraph:**
> **Tooling:** `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` computes the traversal order programmatically from a workflow graph. Pass the path to `workflow/main.md`. The orderer returns roles in backward pass order, excluding roles that did not fire in this instance. When available, use the orderer rather than computing the order manually. When unavailable, apply the rules above.

---

## Change 6 — `$A_SOCIETY_INITIALIZER`

**Target file:** `/a-society/agents/initializer.md`

**Note:** This is an `agents/` file, not `general/`. It follows the same proposal flow — Curator proposes, Owner approves.

**Placement:** Phase 3 — Draft, before the numbered document list. The current Phase 3 opening is:

> Build the `a-docs/` folder and populate all foundational documents in this order:

**Replace with:**
> Before populating documents manually, run `$A_SOCIETY_TOOLING_SCAFFOLDING` to scaffold the target project's `a-docs/` structure. Pass the project root path and the manifest path (`$GENERAL_MANIFEST`). The scaffold creates all required `a-docs/` folders and stub files — including consent file stubs via `$A_SOCIETY_TOOLING_CONSENT_UTILITY` — in the correct locations. After scaffolding, customize each file with the project's actual content using the steps below. Do not create files the scaffold has already created.
>
> Populate all foundational documents in this order:

---

## Scope Constraint

All six changes are additive — no existing content removed except the three steps collapsed in Change 3 (steps 3–5 replaced by a single tool-call step plus fallback). No other changes to these files. No new files created.

Update `$A_SOCIETY_TOOLING_COUPLING_MAP` after implementation: mark all six invocation gap entries as `Closed` in the invocation status column and record the date.

---

## Update Report Assessment

After implementation, check `$A_SOCIETY_UPDATES_PROTOCOL`. Changes to `general/` instructions affect adopting projects — Curator determines classification. Changes to `$A_SOCIETY_INITIALIZER` affect new initializations. Determine after implementation; do not pre-classify.

---

## Curator Confirmation Required

State: "Acknowledged. Beginning implementation of invocation gap closure — add tool invocation pointers to six instructions."

The Curator does not begin until they have acknowledged in the session.
